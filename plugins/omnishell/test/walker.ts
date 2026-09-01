// The chart-derived path walker. Planning and the reference semantics come
// from xstate + @xstate/graph (the machine JSON is canonical XState via
// canonical.ts); the execution harness is this file's. Three phases:
//
// 1. PLAN — @xstate/graph shortest paths over a guard-erased variant where
//    every (state, key, candidate) arrow is its own synthetic event, so the
//    plan names a stimulus sequence toward every arrow.
// 2. DRIVE — the plans (then rotation rounds) fire the machine's own event
//    keys through the caller's harness against OUR interpreter; coverage is
//    read from the __prontoMachineTrace seam, and an uncovered arrow is an
//    error naming itself. Rotation stays because planning treats guards as
//    free: a guard-gated arrow (fib's pastLimit) is reached by driving the
//    real sequence to the branch point, not by solving arithmetic.
// 3. DIFFER — the observed trace replays through XState's own pure
//    transition() over the drive-form canonical config: for every arrow our
//    interpreter fired, XState must land on the same field value. Guard
//    outcomes replay from the trace (candidate index i means the first i
//    guard calls answered false), so the differential compares transition
//    SELECTION and TARGET APPLICATION; the two deliberate deviations (after
//    timing, bounded raise) are excluded structurally in canonical.ts.
//
// Static imports on purpose: a dynamic import() issued after the smokes'
// lockdown() never settles — the constraint behind screen.js's static widget
// import; module load happens before any test body runs.

import { createMachine, initialTransition, transition } from "npm:xstate@5.32.6";
import { getShortestPaths } from "npm:@xstate/graph@3.0.4";
import { machineShape } from "../interpreter/fragment.js";
import { canonical, guardNames, type Machine } from "./canonical.ts";

export type Arrow = { state: string; key: string; index: number; to?: string };

export type WalkHarness = {
  /** Deliver one event: dispatch `type` (bubbling) on the element `from`
   * names, on the machine's region when `from` is absent — or synthesize,
   * for keys the DOM never dispatches (`refused`). */
  fire(type: string, from?: string): Promise<void>;
  wait(ms: number): Promise<void>;
  /** The machine field's current value, for the state invariant. */
  field(): unknown;
};

const arrowId = (a: Arrow) => `${a.state}|${a.key}|${a.index}`;

type Stimulus = { type: string; from?: string } | { waitFor: string };

/** A stimulus per plan step: `after:` keys are waits (the harness owns the
 * clock's real milliseconds), everything else a fire, `@` split back into
 * (type, from). */
const stimulusOf = (key: string): Stimulus => {
  if (key.startsWith("after:")) return { waitFor: key };
  const at = key.indexOf("@");
  return at < 0 ? { type: key } : { type: key.slice(0, at), from: key.slice(at + 1) };
};

/** Shortest stimulus sequences toward every arrow, from a guard-erased plan
 * machine where each candidate is its own synthetic event — reachability and
 * ordering are XState's answer; whether a guard admits the arrow is reality's. */
function planPaths(machine: Machine): Stimulus[][] {
  const mark = "\u0000"; // separator no authored key can carry
  const states: Record<string, unknown> = {};
  const events = new Set<string>();
  const list = (value: unknown): { target?: string }[] =>
    typeof value === "string"
      ? [{ target: value }]
      : (Array.isArray(value) ? value : [value]) as { target?: string }[];
  for (const [name, s] of Object.entries(machine.states)) {
    const on: Record<string, unknown> = {};
    const add = (key: string, value: unknown) => {
      list(value).forEach((c, index) => {
        const ev = `${key}${mark}${index}`;
        events.add(ev);
        on[ev] = c.target !== undefined ? { target: c.target } : {};
      });
    };
    for (const [key, value] of Object.entries(s.on ?? {})) add(key, value);
    for (const [delay, value] of Object.entries(s.after ?? {})) add(`after:${delay}`, value);
    states[name] = { on };
  }
  const rootOn: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(machine.on ?? {})) {
    list(value).forEach((c, index) => {
      const ev = `${key}${mark}${index}`;
      events.add(ev);
      rootOn[ev] = c.target !== undefined ? { target: `.${c.target}` } : {};
    });
  }
  const planM = createMachine({
    id: "plan",
    initial: machine.initial,
    states,
    ...(Object.keys(rootOn).length > 0 ? { on: rootOn } : {}),
  } as never);
  const paths = getShortestPaths(planM, { events: [...events].map((type) => ({ type })) });
  return paths.map((p) =>
    p.steps
      .filter((s) => s.event.type !== "xstate.init")
      .map((s) => stimulusOf(s.event.type.split(mark)[0]))
  ).filter((p) => p.length > 0);
}

/** Replay the observed trace through XState's own pure transition() over the
 * drive-form canonical config. Guard outcomes come from the trace itself: a
 * fired candidate at index i means the first i guard calls answered false —
 * so a divergence in selection or target lands as a field mismatch here. */
export function differ(machine: Machine, trace: Arrow[]): void {
  let pending = 0;
  const guards: Record<string, () => boolean> = {};
  for (const name of guardNames(machine)) {
    guards[name] = () => (pending-- > 0 ? false : true);
  }
  const m = createMachine(canonical(machine, { drive: true }) as never).provide({
    guards,
    actions: { assign: () => {} },
  });
  let [state] = initialTransition(m);
  if (String(state.value) !== machine.initial) {
    throw new Error(`differ: XState initial ${JSON.stringify(state.value)} != ${machine.initial}`);
  }
  trace.forEach((a, i) => {
    pending = a.index;
    [state] = transition(m, state, { type: a.key });
    if (a.to !== undefined && String(state.value) !== String(a.to)) {
      throw new Error(
        `differ: step ${i} (${a.state} --${a.key}[${a.index}]-->): ` +
          `XState landed on ${JSON.stringify(state.value)}, the interpreter on ${JSON.stringify(a.to)}`,
      );
    }
  });
}

/** Guard-erased adjacency (state -> outgoing (key, to) edges, root on:
 * included), for point-to-point routing between plan phases: a plan's steps
 * assume the initial state, but the row keeps whatever the last plan left. */
function edgesOf(machine: Machine): Map<string, { key: string; to: string }[]> {
  const edges = new Map<string, { key: string; to: string }[]>();
  const list = (value: unknown): { target?: string }[] =>
    typeof value === "string"
      ? [{ target: value }]
      : (Array.isArray(value) ? value : [value]) as { target?: string }[];
  for (const [name, s] of Object.entries(machine.states)) {
    const out: { key: string; to: string }[] = [];
    const add = (key: string, value: unknown) => {
      for (const c of list(value)) out.push({ key, to: c.target ?? name });
    };
    for (const [key, value] of Object.entries(s.on ?? {})) add(key, value);
    for (const [delay, value] of Object.entries(s.after ?? {})) add(`after:${delay}`, value);
    for (const [key, value] of Object.entries(machine.on ?? {})) {
      if (s.on?.[key] === undefined) add(key, value);
    }
    edges.set(name, out);
  }
  return edges;
}

/** Shortest key sequence from `from` to `to` over the guard-erased edges;
 * null when unreachable (rotation's problem, not routing's). */
function routeBetween(
  edges: Map<string, { key: string; to: string }[]>,
  from: string,
  to: string,
): string[] | null {
  if (from === to) return [];
  const prev = new Map<string, { at: string; key: string }>();
  const queue = [from];
  while (queue.length > 0) {
    const at = queue.shift()!;
    for (const e of edges.get(at) ?? []) {
      if (e.to === from || prev.has(e.to)) continue;
      prev.set(e.to, { at, key: e.key });
      if (e.to === to) {
        const keys: string[] = [];
        for (let n = to; n !== from;) {
          const p = prev.get(n)!;
          keys.unshift(p.key);
          n = p.at;
        }
        return keys;
      }
      queue.push(e.to);
    }
  }
  return null;
}

export async function walkMachine(
  machine: Machine,
  harness: WalkHarness,
  opts: { rounds?: number; settleMs?: number; afterMs?: number; patience?: number } = {},
): Promise<Arrow[]> {
  const { rounds = 64, settleMs = 30, patience = 6 } = opts;
  const shape = machineShape(machine);
  const wanted = new Map(shape.arrows.map((a: Arrow) => [arrowId(a), a]));
  const states = new Set(Object.keys(machine.states));

  const numericAfters = Object.values(machine.states)
    .flatMap((s) => Object.keys(s.after ?? {}))
    .filter((k) => /^\d+$/.test(k))
    .map(Number);
  const hasAfter = Object.values(machine.states).some((s) => s.after !== undefined);
  const afterMs = opts.afterMs ?? (numericAfters.length > 0 ? Math.max(...numericAfters) : 60);

  const fires: { type: string; from?: string }[] = [];
  const seen = new Set<string>();
  const keys = [
    ...Object.keys(machine.on ?? {}),
    ...Object.values(machine.states).flatMap((s) => Object.keys(s.on ?? {})),
  ];
  for (const key of keys) {
    if (seen.has(key)) continue;
    seen.add(key);
    const s = stimulusOf(key);
    if ("type" in s) fires.push(s);
  }

  const trace: Arrow[] = [];
  (globalThis as Record<string, unknown>).__prontoMachineTrace = trace;
  try {
    const deliver = async (s: Stimulus) => {
      if ("waitFor" in s) {
        await harness.wait(afterMs + settleMs);
        return;
      }
      await harness.fire(s.type, s.from);
      await harness.wait(settleMs);
      const v = harness.field();
      if (v !== undefined && !states.has(String(v))) {
        throw new Error(`walk: the machine's field left its states: ${JSON.stringify(v)}`);
      }
    };
    const covered = () => new Set(trace.map(arrowId));
    const done = () => [...wanted.keys()].every((id) => covered().has(id));

    for (const path of planPaths(machine)) {
      for (const s of path) await deliver(s);
      if (done()) break;
    }

    // Arrow-seek: plans are shortest paths from the initial state, so arrows
    // off those paths starve once the row has moved on. Route from the state
    // the row is actually in to each uncovered arrow's state and fire it;
    // guard-gated arrows that refuse the route stay the rotation's.
    const edges = edgesOf(machine);
    for (const a of wanted.values()) {
      if (done()) break;
      if (covered().has(arrowId(a))) continue;
      const route = routeBetween(edges, String(harness.field() ?? machine.initial), a.state);
      if (route === null) continue;
      for (const k of route) await deliver(stimulusOf(k));
      await deliver(stimulusOf(a.key));
    }

    // Rotation rounds pick up what plans cannot promise: an arrow behind a
    // real guard needs the real sequence driven until the branch opens.
    let last = covered().size;
    let stale = 0;
    for (let round = 0; round < rounds && !done(); round++) {
      const order = fires.map((_, i) => fires[(i + round) % fires.length]);
      for (const f of order) await deliver(f);
      if (hasAfter) await harness.wait(afterMs + settleMs);
      const got = covered();
      stale = got.size === last ? stale + 1 : 0;
      last = got.size;
      if (stale >= patience) break;
    }

    if (!done()) {
      const got = covered();
      const missing = [...wanted.values()].filter((a) => !got.has(arrowId(a)));
      throw new Error(
        `walk: ${missing.length} arrow(s) never fired: ${
          missing.map((a) => `${a.state} --${a.key}[${a.index}]-->`).join(", ")
        }`,
      );
    }
    differ(machine, trace);
    return [...wanted.values()];
  } finally {
    delete (globalThis as Record<string, unknown>).__prontoMachineTrace;
  }
}
