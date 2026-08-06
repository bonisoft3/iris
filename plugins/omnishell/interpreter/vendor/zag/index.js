var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/vanilla/1.43.0/dist/chunk-QZ7TP4HQ.mjs
var __defProp2 = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/utils/1.43.0/dist/array.mjs
function toArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [
    v
  ];
}
var last = (v) => v[v.length - 1];
var has = (v, t) => v.indexOf(t) !== -1;
var add = (v, ...items) => v.concat(items);
var remove = (v, ...items) => v.filter((t) => !items.includes(t));
var addOrRemove = (v, item) => has(v, item) ? remove(v, item) : add(v, item);
function nextIndex(v, idx, opts = {}) {
  const { step = 1, loop = true } = opts;
  const next2 = idx + step;
  const len = v.length;
  const last2 = len - 1;
  if (idx === -1) return step > 0 ? 0 : last2;
  if (next2 < 0) return loop ? last2 : 0;
  if (next2 >= len) return loop ? 0 : idx > len ? len : idx;
  return next2;
}
function prevIndex(v, idx, opts = {}) {
  const { step = 1, loop = true } = opts;
  return nextIndex(v, idx, {
    step: -step,
    loop
  });
}
function chunk(v, size3) {
  return v.reduce((rows, value, index) => {
    if (index % size3 === 0) rows.push([
      value
    ]);
    else last(rows)?.push(value);
    return rows;
  }, []);
}
function flatArray(arr) {
  return arr.reduce((flat, item) => {
    if (Array.isArray(item)) {
      return flat.concat(flatArray(item));
    }
    return flat.concat(item);
  }, []);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/utils/1.43.0/dist/equal.mjs
var isArrayLike = (value) => value?.constructor.name === "Array";
var isArrayEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!isEqual(a[i], b[i])) return false;
  }
  return true;
};
var isEqual = (a, b) => {
  if (Object.is(a, b)) return true;
  if (a == null && b != null || a != null && b == null) return false;
  if (typeof a?.isEqual === "function" && typeof b?.isEqual === "function") {
    return a.isEqual(b);
  }
  if (typeof a === "function" && typeof b === "function") {
    return a.toString() === b.toString();
  }
  if (isArrayLike(a) && isArrayLike(b)) {
    return isArrayEqual(Array.from(a), Array.from(b));
  }
  if (!(typeof a === "object") || !(typeof b === "object")) return false;
  const keys = Object.keys(b ?? /* @__PURE__ */ Object.create(null));
  const length = keys.length;
  for (let i = 0; i < length; i++) {
    const hasKey = Reflect.has(a, keys[i]);
    if (!hasKey) return false;
  }
  for (let i = 0; i < length; i++) {
    const key = keys[i];
    if (!isEqual(a[key], b[key])) return false;
  }
  return true;
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/utils/1.43.0/dist/guard.mjs
var isArray = (v) => Array.isArray(v);
var isBoolean = (v) => v === true || v === false;
var isObjectLike = (v) => v != null && typeof v === "object";
var isObject = (v) => isObjectLike(v) && !isArray(v);
var isString = (v) => typeof v === "string";
var isFunction = (v) => typeof v === "function";
var isNull = (v) => v == null;
var hasProp = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
var baseGetTag = (v) => Object.prototype.toString.call(v);
var fnToString = Function.prototype.toString;
var objectCtorString = fnToString.call(Object);
var isPlainObject = (v) => {
  if (!isObjectLike(v) || baseGetTag(v) != "[object Object]" || isFrameworkElement(v)) return false;
  const proto = Object.getPrototypeOf(v);
  if (proto === null) return true;
  const Ctor = hasProp(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && fnToString.call(Ctor) == objectCtorString;
};
var isReactElement = (x) => typeof x === "object" && x !== null && "$$typeof" in x && "props" in x;
var isVueElement = (x) => typeof x === "object" && x !== null && "__v_isVNode" in x;
var isFrameworkElement = (x) => isReactElement(x) || isVueElement(x);

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/utils/1.43.0/dist/functions.mjs
var runIfFn = (v, ...a) => {
  const res = typeof v === "function" ? v(...a) : v;
  return res ?? void 0;
};
var identity = (v) => v();
var noop = () => {
};
var callAll = (...fns) => (...a) => {
  fns.forEach(function(fn) {
    fn?.(...a);
  });
};
function match(key, record, ...args) {
  if (key in record) {
    const fn = record[key];
    return isFunction(fn) ? fn(...args) : fn;
  }
  const error = new Error(`No matching key: ${JSON.stringify(key)} in ${JSON.stringify(Object.keys(record))}`);
  Error.captureStackTrace?.(error, match);
  throw error;
}
var toChar = (code) => String.fromCharCode(code + (code > 25 ? 39 : 97));
function toName(code) {
  let name = "";
  let x;
  for (x = Math.abs(code); x > 52; x = x / 52 | 0) name = toChar(x % 52) + name;
  return toChar(x % 52) + name;
}
function toPhash(h, x) {
  let i = x.length;
  while (i) h = h * 33 ^ x.charCodeAt(--i);
  return h;
}
var hash = (value) => toName(toPhash(5381, value) >>> 0);

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/utils/1.43.0/dist/number.mjs
var { floor, abs, round, min, max, pow, sign } = Math;
var isNaN2 = (v) => Number.isNaN(v);
var nan = (v) => isNaN2(v) ? 0 : v;
var isValueWithinRange = (v, vmin, vmax) => {
  const value = nan(v);
  const minCheck = vmin == null || value >= vmin;
  const maxCheck = vmax == null || value <= vmax;
  return minCheck && maxCheck;
};
var clampValue = (v, vmin, vmax) => min(max(nan(v), vmin), vmax);

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/utils/1.43.0/dist/object.mjs
function compact(obj) {
  if (!isPlainObject(obj) || obj === void 0) return obj;
  const keys2 = Reflect.ownKeys(obj).filter((key) => typeof key === "string");
  const filtered = {};
  for (const key of keys2) {
    const value = obj[key];
    if (value !== void 0) {
      filtered[key] = compact(value);
    }
  }
  return filtered;
}
function splitProps(props6, keys2) {
  const rest = {};
  const result = {};
  const keySet = new Set(keys2);
  const ownKeys = Reflect.ownKeys(props6);
  for (const key of ownKeys) {
    if (keySet.has(key)) {
      result[key] = props6[key];
    } else {
      rest[key] = props6[key];
    }
  }
  return [
    result,
    rest
  ];
}
var createSplitProps = (keys2) => {
  return function split(props6) {
    return splitProps(props6, keys2);
  };
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/utils/1.43.0/dist/timers.mjs
var _tick;
_tick = /* @__PURE__ */ new WeakMap();

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/utils/1.43.0/dist/warning.mjs
function warn(...a) {
  const m = a.length === 1 ? a[0] : a[1];
  const c = a.length === 2 ? a[0] : true;
  if (c && true) {
    console.warn(m);
  }
}
function invariant(...a) {
  const m = a.length === 1 ? a[0] : a[1];
  const c = a.length === 2 ? a[0] : true;
  if (c && true) {
    throw new Error(m);
  }
}
function ensure(c, m) {
  if (c == null) throw new Error(m());
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/core/1.43.0/dist/memo.mjs
function memo(getDeps, fn, opts) {
  let deps = [];
  let result;
  return (depArgs) => {
    const newDeps = getDeps(depArgs);
    const depsChanged = newDeps.length !== deps.length || newDeps.some((dep, index) => !isEqual(deps[index], dep));
    if (!depsChanged) return result;
    deps = newDeps;
    result = fn(newDeps, depArgs);
    opts?.onChange?.(result);
    return result;
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/core/1.43.0/dist/state.mjs
var STATE_DELIMITER = ".";
var ABSOLUTE_PREFIX = "#";
var stateIndexCache = /* @__PURE__ */ new WeakMap();
var stateIdIndexCache = /* @__PURE__ */ new WeakMap();
function joinStatePath(parts6) {
  return parts6.join(STATE_DELIMITER);
}
function isAbsoluteStatePath(value) {
  return value.includes(STATE_DELIMITER);
}
function isExplicitAbsoluteStatePath(value) {
  return value.startsWith(ABSOLUTE_PREFIX);
}
function isChildTarget(value) {
  return value.startsWith(STATE_DELIMITER);
}
function stripAbsolutePrefix(value) {
  return isExplicitAbsoluteStatePath(value) ? value.slice(ABSOLUTE_PREFIX.length) : value;
}
function appendStatePath(base, segment) {
  return base ? `${base}${STATE_DELIMITER}${segment}` : segment;
}
function buildStateIndex(machine6) {
  const index = /* @__PURE__ */ new Map();
  const idIndex = /* @__PURE__ */ new Map();
  const visit2 = (basePath, state2) => {
    index.set(basePath, state2);
    const stateId = state2.id;
    if (stateId) {
      if (idIndex.has(stateId)) {
        invariant(`[zag-js] Duplicate state id: "${stateId}"`);
      }
      idIndex.set(stateId, basePath);
    }
    const childStates = state2.states;
    if (!childStates) return;
    ensure(state2.initial, () => `[zag-js] Compound state "${basePath}" has child states but no "initial" property`);
    if (!(state2.initial in childStates)) {
      invariant(`[zag-js] Compound state "${basePath}" has initial "${String(state2.initial)}" which is not a child state`);
    }
    for (const [childKey, childState] of Object.entries(childStates)) {
      if (!childState) continue;
      const childPath = appendStatePath(basePath, childKey);
      visit2(childPath, childState);
    }
  };
  for (const [topKey, topState] of Object.entries(machine6.states)) {
    if (!topState) continue;
    visit2(topKey, topState);
  }
  return {
    index,
    idIndex
  };
}
function ensureStateIndex(machine6) {
  const cached = stateIndexCache.get(machine6);
  if (cached) return cached;
  const { index, idIndex } = buildStateIndex(machine6);
  stateIndexCache.set(machine6, index);
  stateIdIndexCache.set(machine6, idIndex);
  return index;
}
function getStatePathById(machine6, stateId) {
  ensureStateIndex(machine6);
  return stateIdIndexCache.get(machine6)?.get(stateId);
}
function toSegments(value) {
  if (!value) return [];
  return String(value).split(STATE_DELIMITER).filter(Boolean);
}
function getStateChain(machine6, state2) {
  if (!state2) return [];
  const stateIndex = ensureStateIndex(machine6);
  const segments = toSegments(state2);
  const chain = [];
  const statePath = [];
  for (const segment of segments) {
    statePath.push(segment);
    const path = joinStatePath(statePath);
    const current = stateIndex.get(path);
    if (!current) break;
    chain.push({
      path,
      state: current
    });
  }
  return chain;
}
function resolveAbsoluteStateValue(machine6, value) {
  const stateIndex = ensureStateIndex(machine6);
  const segments = toSegments(value);
  if (!segments.length) return value;
  const resolved = [];
  for (const segment of segments) {
    resolved.push(segment);
    const path = joinStatePath(resolved);
    if (!stateIndex.has(path)) return value;
  }
  let resolvedPath = joinStatePath(resolved);
  let current = stateIndex.get(resolvedPath);
  while (current?.initial) {
    const nextPath = `${resolvedPath}${STATE_DELIMITER}${current.initial}`;
    const nextState = stateIndex.get(nextPath);
    if (!nextState) break;
    resolvedPath = nextPath;
    current = nextState;
  }
  return resolvedPath;
}
function hasStatePath(machine6, value) {
  const stateIndex = ensureStateIndex(machine6);
  return stateIndex.has(value);
}
function resolveStateValue(machine6, value, source) {
  const stateValue = String(value);
  if (isExplicitAbsoluteStatePath(stateValue)) {
    const stateId = stripAbsolutePrefix(stateValue);
    const statePath = getStatePathById(machine6, stateId);
    ensure(statePath, () => `[zag-js] Unknown state id: "${stateId}"`);
    return resolveAbsoluteStateValue(machine6, statePath);
  }
  if (isChildTarget(stateValue) && source) {
    const childPath = appendStatePath(source, stateValue.slice(1));
    return resolveAbsoluteStateValue(machine6, childPath);
  }
  if (!isAbsoluteStatePath(stateValue) && source) {
    const sourceSegments = toSegments(source);
    for (let index = sourceSegments.length - 1; index >= 1; index--) {
      const base = sourceSegments.slice(0, index).join(STATE_DELIMITER);
      const candidate = appendStatePath(base, stateValue);
      if (hasStatePath(machine6, candidate)) return resolveAbsoluteStateValue(machine6, candidate);
    }
    if (hasStatePath(machine6, stateValue)) return resolveAbsoluteStateValue(machine6, stateValue);
  }
  return resolveAbsoluteStateValue(machine6, stateValue);
}
function findTransition(machine6, state2, eventType) {
  const chain = getStateChain(machine6, state2);
  for (let index = chain.length - 1; index >= 0; index--) {
    const transitionMap = chain[index]?.state.on;
    const transition = transitionMap?.[eventType];
    if (transition) return {
      transitions: transition,
      source: chain[index]?.path
    };
  }
  const rootTransitionMap = machine6.on;
  return {
    transitions: rootTransitionMap?.[eventType],
    source: void 0
  };
}
function getExitEnterStates(machine6, prevState, nextState, reenter) {
  const prevChain = prevState ? getStateChain(machine6, prevState) : [];
  const nextChain = getStateChain(machine6, nextState);
  let commonIndex = 0;
  while (commonIndex < prevChain.length && commonIndex < nextChain.length && prevChain[commonIndex]?.path === nextChain[commonIndex]?.path) {
    commonIndex += 1;
  }
  let exiting = prevChain.slice(commonIndex).reverse();
  let entering = nextChain.slice(commonIndex);
  const sameLeaf = prevChain.at(-1)?.path === nextChain.at(-1)?.path;
  if (reenter && sameLeaf) {
    exiting = prevChain.slice().reverse();
    entering = nextChain;
  }
  return {
    exiting,
    entering
  };
}
function matchesState(current, value) {
  if (!current) return false;
  return current === value || current.startsWith(`${value}${STATE_DELIMITER}`);
}
function hasTag(machine6, state2, tag) {
  return getStateChain(machine6, state2).some((item) => item.state.tags?.includes(tag));
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/core/1.43.0/dist/create-machine.mjs
function createGuards() {
  return {
    and: (...guards3) => {
      return function andGuard(params) {
        return guards3.every((str) => params.guard(str));
      };
    },
    or: (...guards3) => {
      return function orGuard(params) {
        return guards3.some((str) => params.guard(str));
      };
    },
    not: (guard) => {
      return function notGuard(params) {
        return !params.guard(guard);
      };
    }
  };
}
function createMachine(config) {
  ensureStateIndex(config);
  return config;
}
function setup() {
  return {
    guards: createGuards(),
    createMachine: (config) => {
      return createMachine(config);
    },
    choose: (transitions) => {
      return function chooseFn({ choose: choose2 }) {
        return choose2(transitions)?.actions;
      };
    }
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/core/1.43.0/dist/types.mjs
var MachineStatus = /* @__PURE__ */ ((MachineStatus2) => {
  MachineStatus2["NotStarted"] = "Not Started";
  MachineStatus2["Started"] = "Started";
  MachineStatus2["Stopped"] = "Stopped";
  return MachineStatus2;
})(MachineStatus || {});
var INIT_STATE = "__init__";

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/chunk-QZ7TP4HQ.mjs
var __defProp3 = Object.defineProperty;
var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp3(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __publicField3 = (obj, key, value) => __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/caret.mjs
function setCaretToEnd(input) {
  if (!input) return;
  try {
    if (input.ownerDocument.activeElement !== input) return;
    const len = input.value.length;
    input.setSelectionRange(len, len);
  } catch {
  }
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/shared.mjs
var wrap = (v, idx) => {
  return v.map((_, index) => v[(Math.max(idx, 0) + index) % v.length]);
};
var noop2 = () => void 0;
var isObject2 = (v) => typeof v === "object" && v !== null;
var dataAttr = (guard) => guard ? "" : void 0;
var ariaAttr = (guard) => guard ? "true" : void 0;

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/node.mjs
var ELEMENT_NODE = 1;
var DOCUMENT_NODE = 9;
var DOCUMENT_FRAGMENT_NODE = 11;
var isHTMLElement = (el) => isObject2(el) && el.nodeType === ELEMENT_NODE && typeof el.nodeName === "string";
var isDocument = (el) => isObject2(el) && el.nodeType === DOCUMENT_NODE;
var isWindow = (el) => isObject2(el) && el === el.window;
var getNodeName = (node) => {
  if (isHTMLElement(node)) return node.localName || "";
  return "#document";
};
function isRootElement(node) {
  return [
    "html",
    "body",
    "#document"
  ].includes(getNodeName(node));
}
var isNode = (el) => isObject2(el) && el.nodeType !== void 0;
var isShadowRoot = (el) => isNode(el) && el.nodeType === DOCUMENT_FRAGMENT_NODE && "host" in el;
var isInputElement = (el) => isHTMLElement(el) && el.localName === "input";
var isAnchorElement = (el) => !!el?.matches("a[href]");
var isElementVisible = (el) => {
  if (!isHTMLElement(el)) return false;
  return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
};
function isActiveElement(element) {
  if (!element) return false;
  const rootNode = element.getRootNode();
  return getActiveElement(rootNode) === element;
}
var TEXTAREA_SELECT_REGEX = /(textarea|select)/;
function isEditableElement(el) {
  if (el == null || !isHTMLElement(el)) return false;
  try {
    return isInputElement(el) && el.selectionStart != null || TEXTAREA_SELECT_REGEX.test(el.localName) || el.isContentEditable || el.getAttribute("contenteditable") === "true" || el.getAttribute("contenteditable") === "";
  } catch {
    return false;
  }
}
function contains(parent, child) {
  if (!parent || !child) return false;
  if (!isHTMLElement(parent) || !isNode(child)) return false;
  if (isHTMLElement(child) && parent === child) return true;
  if (parent.contains(child)) return true;
  const rootNode = child.getRootNode?.();
  if (rootNode && isShadowRoot(rootNode)) {
    let next = child;
    while (next) {
      if (parent === next) return true;
      next = next.parentNode || next.host;
    }
  }
  return false;
}
function getDocument(el) {
  if (isDocument(el)) return el;
  if (isWindow(el)) return el.document;
  return el?.ownerDocument ?? document;
}
function getDocumentElement(el) {
  return getDocument(el).documentElement;
}
function getWindow(el) {
  if (isShadowRoot(el)) return getWindow(el.host);
  if (isDocument(el)) return el.defaultView ?? window;
  if (isHTMLElement(el)) return el.ownerDocument?.defaultView ?? window;
  return window;
}
function getActiveElement(rootNode) {
  let activeElement = rootNode.activeElement;
  while (activeElement?.shadowRoot) {
    const el = activeElement.shadowRoot.activeElement;
    if (!el || el === activeElement) break;
    else activeElement = el;
  }
  return activeElement;
}
function getParentNode(node) {
  if (getNodeName(node) === "html") return node;
  const result = node.assignedSlot || node.parentNode || isShadowRoot(node) && node.host || getDocumentElement(node);
  return isShadowRoot(result) ? result.host : result;
}
function getRootNode(node) {
  let result;
  try {
    result = node.getRootNode({
      composed: true
    });
    if (isDocument(result) || isShadowRoot(result)) return result;
  } catch {
  }
  return node.ownerDocument ?? document;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/computed-style.mjs
var styleCache = /* @__PURE__ */ new WeakMap();
function getComputedStyle2(el) {
  if (!styleCache.has(el)) {
    styleCache.set(el, getWindow(el).getComputedStyle(el));
  }
  return styleCache.get(el);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/controller.mjs
var INTERACTIVE_CONTAINER_ROLE = /* @__PURE__ */ new Set([
  "menu",
  "listbox",
  "dialog",
  "grid",
  "tree",
  "region",
  "application"
]);
var isInteractiveContainerRole = (role) => INTERACTIVE_CONTAINER_ROLE.has(role);
var getAriaControls = (element) => element.getAttribute("aria-controls")?.split(" ") || [];
function isControlledElement(container, element) {
  const visitedIds = /* @__PURE__ */ new Set();
  const rootNode = getRootNode(container);
  const checkElement = (searchRoot) => {
    const controllingElements = searchRoot.querySelectorAll("[aria-controls]");
    for (const controller of controllingElements) {
      if (controller.getAttribute("aria-expanded") !== "true") continue;
      const controlledIds = getAriaControls(controller);
      for (const id of controlledIds) {
        if (!id || visitedIds.has(id)) continue;
        visitedIds.add(id);
        const controlledElement = rootNode.getElementById(id);
        if (controlledElement) {
          const role = controlledElement.getAttribute("role");
          const modal = controlledElement.getAttribute("aria-modal") === "true";
          if (role && isInteractiveContainerRole(role) && !modal) {
            if (controlledElement === element || controlledElement.contains(element)) {
              return true;
            }
            if (checkElement(controlledElement)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };
  return checkElement(container);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/platform.mjs
var isDom = () => typeof document !== "undefined";
function getPlatform() {
  const agent = navigator.userAgentData;
  return agent?.platform ?? navigator.platform;
}
function getUserAgent() {
  const ua2 = navigator.userAgentData;
  if (ua2 && Array.isArray(ua2.brands)) {
    return ua2.brands.map(({ brand, version }) => `${brand}/${version}`).join(" ");
  }
  return navigator.userAgent;
}
var pt = (v) => isDom() && v.test(getPlatform());
var ua = (v) => isDom() && v.test(getUserAgent());
var isTouchDevice = () => isDom() && !!navigator.maxTouchPoints;
var isIPhone = () => pt(/^iPhone/i);
var isIPad = () => pt(/^iPad/i) || isMac() && navigator.maxTouchPoints > 1;
var isIos = () => isIPhone() || isIPad();
var isApple = () => isMac() || isIos();
var isMac = () => pt(/^Mac/i);
var isFirefox = () => ua(/Firefox/i);
var isAndroid = () => ua(/Android/i);

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/event.mjs
function getComposedPath(event) {
  return event.composedPath?.() ?? event.nativeEvent?.composedPath?.();
}
function getEventTarget(event) {
  const composedPath = getComposedPath(event);
  return composedPath?.[0] ?? event.target;
}
function isOpeningInNewTab(event) {
  const element = event.currentTarget;
  if (!element) return false;
  const validElement = element.matches("a[href], button[type='submit'], input[type='submit']");
  if (!validElement) return false;
  const isMiddleClick = event.button === 1;
  const isModKeyClick = isCtrlOrMetaKey(event);
  return isMiddleClick || isModKeyClick;
}
function isDownloadingEvent(event) {
  const element = event.currentTarget;
  if (!element) return false;
  const localName = element.localName;
  if (!event.altKey) return false;
  if (localName === "a") return true;
  if (localName === "button" && element.type === "submit") return true;
  if (localName === "input" && element.type === "submit") return true;
  return false;
}
function isComposingEvent(event) {
  return getNativeEvent(event).isComposing || event.keyCode === 229;
}
function isCtrlOrMetaKey(e) {
  if (isMac()) return e.metaKey;
  return e.ctrlKey;
}
function isVirtualClick(e) {
  if (e.pointerType === "" && e.isTrusted) return true;
  if (isAndroid() && e.pointerType) {
    return e.type === "click" && e.buttons === 1;
  }
  return e.detail === 0 && !e.pointerType;
}
var isLeftClick = (e) => e.button === 0;
var isContextMenuEvent = (e) => {
  return e.button === 2 || isMac() && e.ctrlKey && e.button === 0;
};
var keyMap = {
  Up: "ArrowUp",
  Down: "ArrowDown",
  Esc: "Escape",
  " ": "Space",
  ",": "Comma",
  Left: "ArrowLeft",
  Right: "ArrowRight"
};
var rtlKeyMap = {
  ArrowLeft: "ArrowRight",
  ArrowRight: "ArrowLeft"
};
function getEventKey(event, options = {}) {
  const { dir = "ltr", orientation = "horizontal" } = options;
  let key = event.key;
  key = keyMap[key] ?? key;
  const isRtl = dir === "rtl" && orientation === "horizontal";
  if (isRtl && key in rtlKeyMap) key = rtlKeyMap[key];
  return key;
}
function getNativeEvent(event) {
  return event.nativeEvent ?? event;
}
var addDomEvent = (target, eventName, handler, options) => {
  const node = typeof target === "function" ? target() : target;
  node?.addEventListener(eventName, handler, options);
  return () => {
    node?.removeEventListener(eventName, handler, options);
  };
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/form.mjs
function getDescriptor(el, options) {
  const { type = "HTMLInputElement", property = "value" } = options;
  const proto = getWindow(el)[type].prototype;
  return Object.getOwnPropertyDescriptor(proto, property) ?? {};
}
function getElementType(el) {
  if (el.localName === "input") return "HTMLInputElement";
  if (el.localName === "textarea") return "HTMLTextAreaElement";
  if (el.localName === "select") return "HTMLSelectElement";
}
function setElementValue(el, value, property = "value") {
  if (!el) return;
  const type = getElementType(el);
  if (type) {
    const descriptor = getDescriptor(el, {
      type,
      property
    });
    descriptor.set?.call(el, value);
  }
  el.setAttribute(property, value);
}
function isFormElement(el) {
  return el.matches("textarea, input, select, button");
}
function trackFormReset(el, callback) {
  if (!el) return;
  const form = isFormElement(el) ? el.form : el.closest("form");
  const onReset = (e) => {
    if (e.defaultPrevented) return;
    callback();
  };
  form?.addEventListener("reset", onReset, {
    passive: true
  });
  return () => form?.removeEventListener("reset", onReset);
}
function trackFieldsetDisabled(el, callback) {
  const fieldset = el?.closest("fieldset");
  if (!fieldset) return;
  callback(fieldset.disabled);
  const win = getWindow(fieldset);
  const obs = new win.MutationObserver(() => callback(fieldset.disabled));
  obs.observe(fieldset, {
    attributes: true,
    attributeFilter: [
      "disabled"
    ]
  });
  return () => obs.disconnect();
}
function trackFormControl(el, options) {
  if (!el) return;
  const { onFieldsetDisabledChange, onFormReset } = options;
  const cleanups = [
    trackFormReset(el, onFormReset),
    trackFieldsetDisabled(el, onFieldsetDisabledChange)
  ];
  return () => cleanups.forEach((cleanup) => cleanup?.());
}
var INTERNAL_CHANGE_EVENT = /* @__PURE__ */ Symbol.for("zag.changeEvent");
function isInternalChangeEvent(e) {
  return Object.prototype.hasOwnProperty.call(e, INTERNAL_CHANGE_EVENT);
}
function markAsInternalChangeEvent(event) {
  if (isInternalChangeEvent(event)) return event;
  Object.defineProperty(event, INTERNAL_CHANGE_EVENT, {
    value: true
  });
  return event;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/tabbable.mjs
var isFrame = (el) => isHTMLElement(el) && el.tagName === "IFRAME";
function parseTabIndex(el) {
  const attr = el.getAttribute("tabindex");
  if (!attr) return NaN;
  return parseInt(attr, 10);
}
var hasNegativeTabIndex = (el) => parseTabIndex(el) < 0;
function isRadioInput(element) {
  return isInputElement(element) && element.type === "radio";
}
function isTabbableRadio(element) {
  if (!isRadioInput(element) || !element.name) return true;
  if (element.checked) return true;
  const selector = `input[type="radio"][name="${CSS.escape(element.name)}"]`;
  const scope = element.form ?? element.ownerDocument;
  const group = Array.from(scope.querySelectorAll(selector)).filter((radio) => radio.form === element.form && isFocusable(radio));
  const checked = group.find((radio) => radio.checked);
  if (checked) return checked === element;
  return group[0] === element;
}
function getShadowRootForNode(element, getShadowRoot) {
  if (!getShadowRoot) return null;
  if (getShadowRoot === true) {
    return element.shadowRoot || null;
  }
  const result = getShadowRoot(element);
  return (result === true ? element.shadowRoot : result) || null;
}
function collectElementsWithShadowDOM(elements, getShadowRoot, filterFn) {
  const allElements = [
    ...elements
  ];
  const toProcess = [
    ...elements
  ];
  const processed = /* @__PURE__ */ new Set();
  const positionMap = /* @__PURE__ */ new Map();
  elements.forEach((el, i) => positionMap.set(el, i));
  let processIndex = 0;
  while (processIndex < toProcess.length) {
    const element = toProcess[processIndex++];
    if (!element || processed.has(element)) continue;
    processed.add(element);
    const shadowRoot = getShadowRootForNode(element, getShadowRoot);
    if (shadowRoot) {
      const shadowElements = Array.from(shadowRoot.querySelectorAll(focusableSelector)).filter(filterFn);
      const hostIndex = positionMap.get(element);
      if (hostIndex !== void 0) {
        const insertPosition = hostIndex + 1;
        allElements.splice(insertPosition, 0, ...shadowElements);
        shadowElements.forEach((el, i) => {
          positionMap.set(el, insertPosition + i);
        });
        for (let i = insertPosition + shadowElements.length; i < allElements.length; i++) {
          positionMap.set(allElements[i], i);
        }
      } else {
        const insertPosition = allElements.length;
        allElements.push(...shadowElements);
        shadowElements.forEach((el, i) => {
          positionMap.set(el, insertPosition + i);
        });
      }
      toProcess.push(...shadowElements);
    }
  }
  return allElements;
}
var focusableSelector = "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], iframe, object, embed, area[href], audio[controls], video[controls], [contenteditable]:not([contenteditable='false']), details > summary:first-of-type";
function isFocusable(element) {
  if (!isHTMLElement(element) || element.closest("[inert]")) return false;
  return element.matches(focusableSelector) && isElementVisible(element);
}
function getTabbables(container, options = {}) {
  if (!container) return [];
  const { includeContainer, getShadowRoot } = options;
  const elements = Array.from(container.querySelectorAll(focusableSelector));
  if (includeContainer && isTabbable(container)) {
    elements.unshift(container);
  }
  const tabbableElements = [];
  for (const element of elements) {
    if (!isTabbable(element)) continue;
    if (isFrame(element) && element.contentDocument) {
      const frameBody = element.contentDocument.body;
      tabbableElements.push(...getTabbables(frameBody, {
        getShadowRoot
      }));
      continue;
    }
    tabbableElements.push(element);
  }
  if (getShadowRoot) {
    const allElements = collectElementsWithShadowDOM(tabbableElements, getShadowRoot, isTabbable);
    if (!allElements.length && includeContainer) {
      return elements;
    }
    return allElements;
  }
  if (!tabbableElements.length && includeContainer) {
    return elements;
  }
  return tabbableElements;
}
function isTabbable(el) {
  if (isHTMLElement(el) && el.tabIndex > 0) return true;
  if (!isFocusable(el) || hasNegativeTabIndex(el)) return false;
  return isTabbableRadio(el);
}
function getTabbableEdges(container, options = {}) {
  const elements = getTabbables(container, options);
  const first = elements[0] || null;
  const last2 = elements[elements.length - 1] || null;
  return [
    first,
    last2
  ];
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/initial-focus.mjs
function getInitialFocus(options) {
  const { root, getInitialEl, filter: filter2, enabled = true } = options;
  if (!enabled) return;
  let node = typeof getInitialEl === "function" ? getInitialEl() : getInitialEl;
  node || (node = root?.querySelector("[data-autofocus],[autofocus]"));
  if (!node) {
    const tabbables = getTabbables(root).filter((el) => filter2 ? filter2(el) : true);
    node = tabbables.find((el) => !el.hasAttribute("data-no-autofocus"));
  }
  return node || root || void 0;
}
function isValidTabEvent(event) {
  const container = event.currentTarget;
  if (!container) return false;
  const [firstTabbable, lastTabbable] = getTabbableEdges(container);
  if (isActiveElement(firstTabbable) && event.shiftKey) return false;
  if (isActiveElement(lastTabbable) && !event.shiftKey) return false;
  if (!firstTabbable && !lastTabbable) return false;
  return true;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/raf.mjs
var AnimationFrame = class _AnimationFrame {
  constructor() {
    __publicField3(this, "id", null);
    __publicField3(this, "fn_cleanup");
    __publicField3(this, "cleanup", () => {
      this.cancel();
    });
  }
  static create() {
    return new _AnimationFrame();
  }
  request(fn) {
    this.cancel();
    this.id = globalThis.requestAnimationFrame(() => {
      this.id = null;
      this.fn_cleanup = fn?.();
    });
  }
  cancel() {
    if (this.id !== null) {
      globalThis.cancelAnimationFrame(this.id);
      this.id = null;
    }
    this.fn_cleanup?.();
    this.fn_cleanup = void 0;
  }
  isActive() {
    return this.id !== null;
  }
};
function raf(fn) {
  const frame = AnimationFrame.create();
  frame.request(fn);
  return frame.cleanup;
}
function nextTick(fn) {
  const set = /* @__PURE__ */ new Set();
  function raf2(fn2) {
    const id = globalThis.requestAnimationFrame(fn2);
    set.add(() => globalThis.cancelAnimationFrame(id));
  }
  raf2(() => raf2(fn));
  return function cleanup() {
    set.forEach((fn2) => fn2());
  };
}
function queueBeforeEvent(el, type, cb) {
  const cancelTimer = raf(() => {
    el.removeEventListener(type, exec, true);
    cb();
  });
  const exec = () => {
    cancelTimer();
    cb();
  };
  el.addEventListener(type, exec, {
    once: true,
    capture: true
  });
  return cancelTimer;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/mutation-observer.mjs
function observeAttributesImpl(node, options) {
  if (!node) return;
  const { attributes, callback: fn } = options;
  const win = node.ownerDocument.defaultView || window;
  const obs = new win.MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === "attributes" && change.attributeName && attributes.includes(change.attributeName)) {
        fn(change);
      }
    }
  });
  obs.observe(node, {
    attributes: true,
    attributeFilter: attributes
  });
  return () => obs.disconnect();
}
function observeAttributes(nodeOrFn, options) {
  const { defer } = options;
  const func = defer ? raf : (v) => v();
  const cleanups = [];
  cleanups.push(func(() => {
    const node = typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn;
    cleanups.push(observeAttributesImpl(node, options));
  }));
  return () => {
    cleanups.forEach((fn) => fn?.());
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/navigate.mjs
function clickIfLink(el) {
  const click = () => {
    const win = getWindow(el);
    el.dispatchEvent(new win.MouseEvent("click"));
  };
  if (isFirefox()) {
    queueBeforeEvent(el, "keyup", click);
  } else {
    queueMicrotask(click);
  }
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/overflow.mjs
function getNearestOverflowAncestor(el) {
  const parentNode = getParentNode(el);
  if (isRootElement(parentNode)) return getDocument(parentNode).body;
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) return parentNode;
  return getNearestOverflowAncestor(parentNode);
}
var OVERFLOW_RE = /auto|scroll|overlay|hidden|clip/;
var nonOverflowValues = /* @__PURE__ */ new Set([
  "inline",
  "contents"
]);
function isOverflowElement(el) {
  const win = getWindow(el);
  const { overflow, overflowX, overflowY, display } = win.getComputedStyle(el);
  return OVERFLOW_RE.test(overflow + overflowY + overflowX) && !nonOverflowValues.has(display);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/text-selection.mjs
var state = "default";
var userSelect = "";
var elementMap = /* @__PURE__ */ new WeakMap();
function disableTextSelectionImpl(options = {}) {
  const { target, doc } = options;
  const docNode = doc ?? document;
  const rootEl = docNode.documentElement;
  if (isIos()) {
    if (state === "default") {
      userSelect = rootEl.style.webkitUserSelect;
      rootEl.style.webkitUserSelect = "none";
    }
    state = "disabled";
  } else if (target) {
    elementMap.set(target, target.style.userSelect);
    target.style.userSelect = "none";
  }
  return () => restoreTextSelection({
    target,
    doc: docNode
  });
}
function restoreTextSelection(options = {}) {
  const { target, doc } = options;
  const docNode = doc ?? document;
  const rootEl = docNode.documentElement;
  if (isIos()) {
    if (state !== "disabled") return;
    state = "restoring";
    setTimeout(() => {
      nextTick(() => {
        if (state === "restoring") {
          if (rootEl.style.webkitUserSelect === "none") {
            rootEl.style.webkitUserSelect = userSelect || "";
          }
          userSelect = "";
          state = "default";
        }
      });
    }, 300);
  } else {
    if (target && elementMap.has(target)) {
      const prevUserSelect = elementMap.get(target);
      if (target.style.userSelect === "none") {
        target.style.userSelect = prevUserSelect ?? "";
      }
      if (target.getAttribute("style") === "") {
        target.removeAttribute("style");
      }
      elementMap.delete(target);
    }
  }
}
function disableTextSelection(options = {}) {
  const { defer, target, ...restOptions } = options;
  const func = defer ? raf : (v) => v();
  const cleanups = [];
  cleanups.push(func(() => {
    const node = typeof target === "function" ? target() : target;
    cleanups.push(disableTextSelectionImpl({
      ...restOptions,
      target: node
    }));
  }));
  return () => {
    cleanups.forEach((fn) => fn?.());
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/query.mjs
function queryAll(root, selector) {
  return Array.from(root?.querySelectorAll(selector) ?? []);
}
function query(root, selector) {
  return root?.querySelector(selector) ?? null;
}
var defaultItemToId = (v) => v.id;
function itemById(v, id, itemToId = defaultItemToId) {
  return v.find((item) => itemToId(item) === id);
}
function indexOfId(v, id, itemToId = defaultItemToId) {
  const item = itemById(v, id, itemToId);
  return item ? v.indexOf(item) : -1;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/scroll.mjs
function isScrollable(el) {
  return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
}
function scrollIntoView(el, options) {
  const { rootEl, ...scrollOptions } = options || {};
  if (!el || !rootEl) return;
  if (!isOverflowElement(rootEl) || !isScrollable(rootEl)) return;
  el.scrollIntoView(scrollOptions);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/searchable.mjs
var sanitize = (str) => str.split("").map((char) => {
  const code = char.charCodeAt(0);
  if (code > 0 && code < 128) return char;
  if (code >= 128 && code <= 255) return `/x${code.toString(16)}`.replace("/", "\\");
  return "";
}).join("").trim();
var getValueText = (el) => {
  return sanitize(el.dataset?.valuetext ?? el.textContent ?? "");
};
var match2 = (valueText, query2) => {
  return valueText.trim().toLowerCase().startsWith(query2.toLowerCase());
};
function getByText(v, text, currentId, itemToId = defaultItemToId) {
  const index = currentId ? indexOfId(v, currentId, itemToId) : -1;
  let items = currentId ? wrap(v, index) : v;
  const isSingleKey = text.length === 1;
  if (isSingleKey) {
    items = items.filter((item) => itemToId(item) !== currentId);
  }
  return items.find((item) => match2(getValueText(item), text));
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/set.mjs
function setStyle(el, style) {
  if (!el) return noop2;
  const prev = Object.keys(style).reduce((acc, key) => {
    acc[key] = el.style.getPropertyValue(key);
    return acc;
  }, {});
  if (isEqual2(prev, style)) return noop2;
  Object.assign(el.style, style);
  return () => {
    Object.assign(el.style, prev);
    if (el.style.length === 0) {
      el.removeAttribute("style");
    }
  };
}
function isEqual2(a, b) {
  return Object.keys(a).every((key) => a[key] === b[key]);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/typeahead.mjs
function getByTypeaheadImpl(baseItems, options) {
  const { state: state2, activeId, key, timeout = 350, itemToId } = options;
  const search = state2.keysSoFar + key;
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const query2 = isRepeated ? search[0] : search;
  let items = baseItems.slice();
  const next = getByText(items, query2, activeId, itemToId);
  function cleanup() {
    clearTimeout(state2.timer);
    state2.timer = -1;
  }
  function update(value) {
    state2.keysSoFar = value;
    cleanup();
    if (value !== "") {
      state2.timer = +setTimeout(() => {
        update("");
        cleanup();
      }, timeout);
    }
  }
  update(search);
  return next;
}
var getByTypeahead = /* @__PURE__ */ Object.assign(getByTypeaheadImpl, {
  defaultOptions: {
    keysSoFar: "",
    timer: -1
  },
  isValidEvent: isValidTypeaheadEvent
});
function isValidTypeaheadEvent(event) {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/visually-hidden.mjs
var visuallyHiddenStyle = {
  border: "0",
  clip: "rect(0 0 0 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: "0",
  position: "absolute",
  width: "1px",
  whiteSpace: "nowrap",
  wordWrap: "normal"
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dom-query/1.43.0/dist/wait-for.mjs
function waitForPromise(promise, controller, timeout) {
  const { signal } = controller;
  const wrappedPromise = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout of ${timeout}ms exceeded`));
    }, timeout);
    signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new DOMException("Promise aborted", "AbortError"));
    });
    promise.then((result) => {
      if (!signal.aborted) {
        clearTimeout(timeoutId);
        resolve(result);
      }
    }).catch((error) => {
      if (!signal.aborted) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  });
  const abort = () => controller.abort();
  return [
    wrappedPromise,
    abort
  ];
}
function waitForElement(target, options) {
  const { timeout, rootNode } = options;
  const win = getWindow(rootNode);
  const doc = getDocument(rootNode);
  const controller = new win.AbortController();
  return waitForPromise(new Promise((resolve) => {
    const el = target();
    if (el) {
      resolve(el);
      return;
    }
    const observer = new win.MutationObserver(() => {
      const el2 = target();
      if (el2 && el2.isConnected) {
        observer.disconnect();
        resolve(el2);
      }
    });
    observer.observe(doc.body, {
      childList: true,
      subtree: true
    });
  }), controller, timeout);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/core/1.43.0/dist/scope.mjs
function createScope(props6) {
  const getRootNode2 = () => props6.getRootNode?.() ?? document;
  const getDoc = () => getDocument(getRootNode2());
  const getWin = () => getDoc().defaultView ?? window;
  const getActiveElementFn = () => getActiveElement(getRootNode2());
  const getById = (id) => getRootNode2().getElementById(id);
  return {
    ...props6,
    getRootNode: getRootNode2,
    getDoc,
    getWin,
    getActiveElement: getActiveElementFn,
    isActiveElement,
    getById
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/types/1.43.0/dist/prop-types.mjs
function createNormalizer(fn) {
  return new Proxy({}, {
    get(_target, key) {
      if (key === "style") return (props6) => {
        return fn({
          style: props6
        }).style;
      };
      return fn;
    }
  });
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/types/1.43.0/dist/create-props.mjs
var createProps = () => (props6) => Array.from(new Set(props6));

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/vanilla/1.43.0/dist/normalize-props.mjs
var propMap = {
  onFocus: "onFocusin",
  onBlur: "onFocusout",
  onChange: "onInput",
  onDoubleClick: "onDblclick",
  htmlFor: "for",
  className: "class",
  defaultValue: "value",
  defaultChecked: "checked"
};
var caseSensitiveSvgAttrs = /* @__PURE__ */ new Set([
  "viewBox",
  "preserveAspectRatio"
]);
var toStyleString = (style) => {
  let string = "";
  for (let key in style) {
    const value = style[key];
    if (value === null || value === void 0) continue;
    if (!key.startsWith("--")) key = key.replace(/[A-Z]/g, (match4) => `-${match4.toLowerCase()}`);
    string += `${key}:${value};`;
  }
  return string;
};
var normalizeProps = createNormalizer((props6) => {
  return Object.entries(props6).reduce((acc, [key, value]) => {
    if (value === void 0) return acc;
    if (key in propMap) {
      key = propMap[key];
    }
    if (key === "style" && typeof value === "object") {
      acc.style = toStyleString(value);
      return acc;
    }
    const normalizedKey = caseSensitiveSvgAttrs.has(key) ? key : key.toLowerCase();
    acc[normalizedKey] = value;
    return acc;
  }, {});
});

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/vanilla/1.43.0/dist/spread-props.mjs
var prevAttrsMap = /* @__PURE__ */ new WeakMap();
var assignableProps = /* @__PURE__ */ new Set([
  "value",
  "checked",
  "selected"
]);
var caseSensitiveSvgAttrs2 = /* @__PURE__ */ new Set([
  "viewBox",
  "preserveAspectRatio",
  "clipPath",
  "clipRule",
  "fillRule",
  "strokeWidth",
  "strokeLinecap",
  "strokeLinejoin",
  "strokeDasharray",
  "strokeDashoffset",
  "strokeMiterlimit"
]);
var isSvgElement = (node) => {
  return node.tagName === "svg" || node.namespaceURI === "http://www.w3.org/2000/svg";
};
var getAttributeName = (node, attrName) => {
  const shouldPreserveCase = isSvgElement(node) && caseSensitiveSvgAttrs2.has(attrName);
  return shouldPreserveCase ? attrName : attrName.toLowerCase();
};
function spreadProps(node, attrs, machineId) {
  const scopeKey = machineId || "default";
  let machineMap = prevAttrsMap.get(node);
  if (!machineMap) {
    machineMap = /* @__PURE__ */ new Map();
    prevAttrsMap.set(node, machineMap);
  }
  const oldAttrs = machineMap.get(scopeKey) || {};
  const attrKeys = Object.keys(attrs);
  const addEvt = (e, f) => {
    node.addEventListener(e.toLowerCase(), f);
  };
  const remEvt = (e, f) => {
    node.removeEventListener(e.toLowerCase(), f);
  };
  const onEvents = (attr) => attr.startsWith("on");
  const others = (attr) => !attr.startsWith("on");
  const setup2 = (attr) => addEvt(attr.substring(2), attrs[attr]);
  const teardown = (attr) => remEvt(attr.substring(2), attrs[attr]);
  const apply = (attrName) => {
    const value = attrs[attrName];
    const oldValue = oldAttrs[attrName];
    if (value === oldValue) return;
    if (attrName === "class") {
      ;
      node.className = value ?? "";
      return;
    }
    if (assignableProps.has(attrName)) {
      ;
      node[attrName] = value ?? "";
      return;
    }
    if (typeof value === "boolean" && !attrName.includes("aria-")) {
      ;
      node.toggleAttribute(getAttributeName(node, attrName), value);
      return;
    }
    if (attrName === "children") {
      node.innerHTML = value;
      return;
    }
    if (value != null) {
      node.setAttribute(getAttributeName(node, attrName), value);
      return;
    }
    node.removeAttribute(getAttributeName(node, attrName));
  };
  for (const key in oldAttrs) {
    if (attrs[key] == null) {
      if (key === "class") {
        ;
        node.className = "";
      } else if (assignableProps.has(key)) {
        ;
        node[key] = "";
      } else {
        node.removeAttribute(getAttributeName(node, key));
      }
    }
  }
  const oldEvents = Object.keys(oldAttrs).filter(onEvents);
  oldEvents.forEach((evt) => {
    remEvt(evt.substring(2), oldAttrs[evt]);
  });
  attrKeys.filter(onEvents).forEach(setup2);
  attrKeys.filter(others).forEach(apply);
  machineMap.set(scopeKey, attrs);
  return function cleanup() {
    attrKeys.filter(onEvents).forEach(teardown);
    const currentMachineMap = prevAttrsMap.get(node);
    if (currentMachineMap) {
      currentMachineMap.delete(scopeKey);
      if (currentMachineMap.size === 0) {
        prevAttrsMap.delete(node);
      }
    }
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/store/1.43.0/dist/global.mjs
function glob() {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
}
function globalRef(key, value) {
  const g = glob();
  if (!g) return value();
  g[key] || (g[key] = value());
  return g[key];
}
var refSet = globalRef("__zag__refSet", () => /* @__PURE__ */ new WeakSet());

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/store/1.43.0/dist/utils.mjs
var isReactElement2 = (x) => typeof x === "object" && x !== null && "$$typeof" in x && "props" in x;
var isVueElement2 = (x) => typeof x === "object" && x !== null && "__v_isVNode" in x;
var isDOMElement = (x) => typeof x === "object" && x !== null && "nodeType" in x && typeof x.nodeName === "string";
var isElement = (x) => isReactElement2(x) || isVueElement2(x) || isDOMElement(x);
var isObject3 = (x) => x !== null && typeof x === "object";
var canProxy = (x) => isObject3(x) && !refSet.has(x) && (Array.isArray(x) || !(Symbol.iterator in x)) && !isElement(x) && !(x instanceof WeakMap) && !(x instanceof WeakSet) && !(x instanceof Error) && !(x instanceof Number) && !(x instanceof Date) && !(x instanceof String) && !(x instanceof RegExp) && !(x instanceof ArrayBuffer) && !(x instanceof Promise) && !(x instanceof File) && !(x instanceof Blob) && !(x instanceof AbortController);
var isDev = () => true;

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/proxy-compare/3.0.1/dist/index.js
var TRACK_MEMO_SYMBOL = Symbol();
var GET_ORIGINAL_SYMBOL = Symbol();
var getProto = Object.getPrototypeOf;
var objectsToTrack = /* @__PURE__ */ new WeakMap();
var isObjectToTrack = (obj) => obj && (objectsToTrack.has(obj) ? objectsToTrack.get(obj) : getProto(obj) === Object.prototype || getProto(obj) === Array.prototype);
var getUntracked = (obj) => {
  if (isObjectToTrack(obj)) {
    return obj[GET_ORIGINAL_SYMBOL] || null;
  }
  return null;
};
var markToTrack = (obj, mark = true) => {
  objectsToTrack.set(obj, mark);
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/store/1.43.0/dist/proxy.mjs
var proxyStateMap = globalRef("__zag__proxyStateMap", () => /* @__PURE__ */ new WeakMap());
var buildProxyFunction = (objectIs = Object.is, newProxy = (target, handler) => new Proxy(target, handler), snapCache = /* @__PURE__ */ new WeakMap(), createSnapshot = (target, version) => {
  const cache = snapCache.get(target);
  if (cache?.[0] === version) {
    return cache[1];
  }
  const snap = Array.isArray(target) ? [] : Object.create(Object.getPrototypeOf(target));
  markToTrack(snap, true);
  snapCache.set(target, [
    version,
    snap
  ]);
  Reflect.ownKeys(target).forEach((key) => {
    const value = Reflect.get(target, key);
    if (refSet.has(value)) {
      markToTrack(value, false);
      snap[key] = value;
    } else if (proxyStateMap.has(value)) {
      snap[key] = snapshot(value);
    } else {
      snap[key] = value;
    }
  });
  return Object.freeze(snap);
}, proxyCache = /* @__PURE__ */ new WeakMap(), versionHolder = [
  1,
  1
], proxyFunction2 = (initialObject) => {
  if (!isObject3(initialObject)) {
    throw new Error("object required");
  }
  const found = proxyCache.get(initialObject);
  if (found) {
    return found;
  }
  let version = versionHolder[0];
  const listeners = /* @__PURE__ */ new Set();
  const notifyUpdate = (op, nextVersion = ++versionHolder[0]) => {
    if (version !== nextVersion) {
      version = nextVersion;
      listeners.forEach((listener) => listener(op, nextVersion));
    }
  };
  let checkVersion = versionHolder[1];
  const ensureVersion = (nextCheckVersion = ++versionHolder[1]) => {
    if (checkVersion !== nextCheckVersion && !listeners.size) {
      checkVersion = nextCheckVersion;
      propProxyStates.forEach(([propProxyState]) => {
        const propVersion = propProxyState[1](nextCheckVersion);
        if (propVersion > version) {
          version = propVersion;
        }
      });
    }
    return version;
  };
  const createPropListener = (prop) => (op, nextVersion) => {
    const newOp = [
      ...op
    ];
    newOp[1] = [
      prop,
      ...newOp[1]
    ];
    notifyUpdate(newOp, nextVersion);
  };
  const propProxyStates = /* @__PURE__ */ new Map();
  const addPropListener = (prop, propProxyState) => {
    if (isDev() && propProxyStates.has(prop)) {
      throw new Error("prop listener already exists");
    }
    if (listeners.size) {
      const remove3 = propProxyState[3](createPropListener(prop));
      propProxyStates.set(prop, [
        propProxyState,
        remove3
      ]);
    } else {
      propProxyStates.set(prop, [
        propProxyState
      ]);
    }
  };
  const removePropListener = (prop) => {
    const entry = propProxyStates.get(prop);
    if (entry) {
      propProxyStates.delete(prop);
      entry[1]?.();
    }
  };
  const addListener = (listener) => {
    listeners.add(listener);
    if (listeners.size === 1) {
      propProxyStates.forEach(([propProxyState, prevRemove], prop) => {
        if (isDev() && prevRemove) {
          throw new Error("remove already exists");
        }
        const remove3 = propProxyState[3](createPropListener(prop));
        propProxyStates.set(prop, [
          propProxyState,
          remove3
        ]);
      });
    }
    const removeListener = () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        propProxyStates.forEach(([propProxyState, remove3], prop) => {
          if (remove3) {
            remove3();
            propProxyStates.set(prop, [
              propProxyState
            ]);
          }
        });
      }
    };
    return removeListener;
  };
  const baseObject = Array.isArray(initialObject) ? [] : Object.create(Object.getPrototypeOf(initialObject));
  const handler = {
    deleteProperty(target, prop) {
      const prevValue = Reflect.get(target, prop);
      removePropListener(prop);
      const deleted = Reflect.deleteProperty(target, prop);
      if (deleted) {
        notifyUpdate([
          "delete",
          [
            prop
          ],
          prevValue
        ]);
      }
      return deleted;
    },
    set(target, prop, value, receiver) {
      const hasPrevValue = Reflect.has(target, prop);
      const prevValue = Reflect.get(target, prop, receiver);
      if (hasPrevValue && (objectIs(prevValue, value) || proxyCache.has(value) && objectIs(prevValue, proxyCache.get(value)))) {
        return true;
      }
      removePropListener(prop);
      if (isObject3(value)) {
        value = getUntracked(value) || value;
      }
      let nextValue = value;
      if (Object.getOwnPropertyDescriptor(target, prop)?.set) {
      } else {
        if (!proxyStateMap.has(value) && canProxy(value)) {
          nextValue = proxy(value);
        }
        const childProxyState = !refSet.has(nextValue) && proxyStateMap.get(nextValue);
        if (childProxyState) {
          addPropListener(prop, childProxyState);
        }
      }
      Reflect.set(target, prop, nextValue, receiver);
      notifyUpdate([
        "set",
        [
          prop
        ],
        value,
        prevValue
      ]);
      return true;
    }
  };
  const proxyObject = newProxy(baseObject, handler);
  proxyCache.set(initialObject, proxyObject);
  const proxyState = [
    baseObject,
    ensureVersion,
    createSnapshot,
    addListener
  ];
  proxyStateMap.set(proxyObject, proxyState);
  Reflect.ownKeys(initialObject).forEach((key) => {
    const desc = Object.getOwnPropertyDescriptor(initialObject, key);
    if (desc.get || desc.set) {
      Object.defineProperty(baseObject, key, desc);
    } else {
      proxyObject[key] = initialObject[key];
    }
  });
  return proxyObject;
}) => [
  // public functions
  proxyFunction2,
  // shared state
  proxyStateMap,
  refSet,
  // internal things
  objectIs,
  newProxy,
  canProxy,
  snapCache,
  createSnapshot,
  proxyCache,
  versionHolder
];
var [proxyFunction] = buildProxyFunction();
function proxy(initialObject = {}) {
  return proxyFunction(initialObject);
}
function subscribe(proxyObject, callback, notifyInSync) {
  const proxyState = proxyStateMap.get(proxyObject);
  if (isDev() && !proxyState) {
    console.warn("Please use proxy object");
  }
  let promise;
  const ops = [];
  const addListener = proxyState[3];
  let isListenerActive = false;
  const listener = (op) => {
    ops.push(op);
    if (notifyInSync) {
      callback(ops.splice(0));
      return;
    }
    if (!promise) {
      promise = Promise.resolve().then(() => {
        promise = void 0;
        if (isListenerActive) {
          callback(ops.splice(0));
        }
      });
    }
  };
  const removeListener = addListener(listener);
  isListenerActive = true;
  return () => {
    isListenerActive = false;
    removeListener();
  };
}
function snapshot(proxyObject) {
  const proxyState = proxyStateMap.get(proxyObject);
  if (isDev() && !proxyState) {
    console.warn("Please use proxy object");
  }
  const [target, ensureVersion, createSnapshot] = proxyState;
  return createSnapshot(target, ensureVersion());
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/vanilla/1.43.0/dist/bindable.mjs
function bindable(props6) {
  const initial = props6().value ?? props6().defaultValue;
  if (props6().debug) {
    console.log(`[bindable > ${props6().debug}] initial`, initial);
  }
  const eq = props6().isEqual ?? Object.is;
  const store = proxy({
    value: initial
  });
  const controlled = () => props6().value !== void 0;
  return {
    initial,
    ref: store,
    get() {
      return controlled() ? props6().value : store.value;
    },
    set(nextValue) {
      const prev = controlled() ? props6().value : store.value;
      const next = isFunction(nextValue) ? nextValue(prev) : nextValue;
      if (props6().debug) {
        console.log(`[bindable > ${props6().debug}] setValue`, {
          next,
          prev
        });
      }
      if (!controlled()) store.value = next;
      if (!eq(next, prev)) {
        props6().onChange?.(next, prev);
      }
    },
    invoke(nextValue, prevValue) {
      props6().onChange?.(nextValue, prevValue);
    },
    hash(value) {
      return props6().hash?.(value) ?? String(value);
    }
  };
}
bindable.cleanup = (_fn) => {
};
bindable.ref = (defaultValue) => {
  let value = defaultValue;
  return {
    get: () => value,
    set: (next) => {
      value = next;
    }
  };
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/vanilla/1.43.0/dist/refs.mjs
function createRefs(refs) {
  const ref2 = {
    current: refs
  };
  return {
    get(key) {
      return ref2.current[key];
    },
    set(key, value) {
      ref2.current[key] = value;
    }
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/vanilla/1.43.0/dist/merge-machine-props.mjs
function mergeMachineProps(prev, next) {
  if (!isPlainObject(prev) || !isPlainObject(next)) {
    return next === void 0 ? prev : next;
  }
  const result = {
    ...prev
  };
  for (const key of Object.keys(next)) {
    const nextValue = next[key];
    const prevValue = prev[key];
    if (nextValue === void 0) {
      continue;
    }
    if (isPlainObject(prevValue) && isPlainObject(nextValue)) {
      result[key] = mergeMachineProps(prevValue, nextValue);
    } else {
      result[key] = nextValue;
    }
  }
  return result;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/vanilla/1.43.0/dist/machine.mjs
var VanillaMachine = class {
  constructor(machine6, userProps = {}) {
    __publicField(this, "machine", machine6);
    __publicField(this, "scope");
    __publicField(this, "context");
    __publicField(this, "prop");
    __publicField(this, "state");
    __publicField(this, "refs");
    __publicField(this, "computed");
    __publicField(this, "event", {
      type: ""
    });
    __publicField(this, "previousEvent", {
      type: ""
    });
    __publicField(this, "effects", /* @__PURE__ */ new Map());
    __publicField(this, "transition", null);
    __publicField(this, "cleanups", []);
    __publicField(this, "subscriptions", []);
    __publicField(this, "userPropsRef");
    __publicField(this, "getEvent", () => ({
      ...this.event,
      current: () => this.event,
      previous: () => this.previousEvent
    }));
    __publicField(this, "getState", () => ({
      ...this.state,
      matches: (...values) => values.some((value) => matchesState(this.state.get(), value)),
      hasTag: (tag) => hasTag(this.machine, this.state.get(), tag)
    }));
    __publicField(this, "debug", (...args) => {
      if (this.machine.debug) console.log(...args);
    });
    __publicField(this, "notify", () => {
      this.publish();
    });
    __publicField(this, "send", (event) => {
      if (this.status !== MachineStatus.Started) return;
      queueMicrotask(() => {
        if (!event) return;
        this.previousEvent = this.event;
        this.event = event;
        this.debug("send", event);
        let currentState = this.state.get();
        const eventType = event.type;
        const { transitions, source } = findTransition(this.machine, currentState, eventType);
        const transition = this.choose(transitions);
        if (!transition) return;
        this.transition = transition;
        const target = resolveStateValue(this.machine, transition.target ?? currentState, source);
        this.debug("transition", transition);
        const changed = target !== currentState;
        if (changed) {
          this.state.set(target);
        } else if (transition.reenter) {
          this.state.invoke(currentState, currentState);
        } else {
          this.action(transition.actions);
        }
      });
    });
    __publicField(this, "action", (keys) => {
      const strs = isFunction(keys) ? keys(this.getParams()) : keys;
      if (!strs) return;
      const fns = strs.map((s) => {
        const fn = this.machine.implementations?.actions?.[s];
        if (!fn) warn(`[zag-js] No implementation found for action "${JSON.stringify(s)}"`);
        return fn;
      });
      for (const fn of fns) {
        fn?.(this.getParams());
      }
    });
    __publicField(this, "guard", (str) => {
      if (isFunction(str)) return str(this.getParams());
      const fn = this.machine.implementations?.guards?.[str];
      if (!fn) warn(`[zag-js] No implementation found for guard "${JSON.stringify(str)}"`);
      return fn?.(this.getParams());
    });
    __publicField(this, "effect", (keys) => {
      const strs = isFunction(keys) ? keys(this.getParams()) : keys;
      if (!strs) return;
      const fns = strs.map((s) => {
        const fn = this.machine.implementations?.effects?.[s];
        if (!fn) warn(`[zag-js] No implementation found for effect "${JSON.stringify(s)}"`);
        return fn;
      });
      const cleanups = [];
      for (const fn of fns) {
        const cleanup = fn?.(this.getParams());
        if (cleanup) cleanups.push(cleanup);
      }
      return () => cleanups.forEach((fn) => fn?.());
    });
    __publicField(this, "choose", (transitions) => {
      return toArray(transitions).find((t) => {
        let result = !t.guard;
        if (isString(t.guard)) result = !!this.guard(t.guard);
        else if (isFunction(t.guard)) result = t.guard(this.getParams());
        return result;
      });
    });
    __publicField(this, "subscribe", (fn) => {
      this.subscriptions.push(fn);
      return () => {
        const index = this.subscriptions.indexOf(fn);
        if (index > -1) this.subscriptions.splice(index, 1);
      };
    });
    __publicField(this, "status", MachineStatus.NotStarted);
    __publicField(this, "publish", () => {
      this.callTrackers();
      this.subscriptions.forEach((fn) => fn(this.service));
    });
    __publicField(this, "trackers", []);
    __publicField(this, "setupTrackers", () => {
      this.machine.watch?.(this.getParams());
    });
    __publicField(this, "callTrackers", () => {
      this.trackers.forEach(({ deps, fn }) => {
        const next = deps.map((dep) => dep());
        if (!isEqual(fn.prev, next)) {
          fn();
          fn.prev = next;
        }
      });
    });
    __publicField(this, "getParams", () => ({
      state: this.getState(),
      context: this.context,
      event: this.getEvent(),
      prop: this.prop,
      send: this.send,
      action: this.action,
      guard: this.guard,
      track: (deps, fn) => {
        fn.prev = deps.map((dep) => dep());
        this.trackers.push({
          deps,
          fn
        });
      },
      refs: this.refs,
      computed: this.computed,
      flush: identity,
      scope: this.scope,
      choose: this.choose
    }));
    this.userPropsRef = {
      current: userProps
    };
    const { id, ids, getRootNode: getRootNode2 } = runIfFn(userProps);
    this.scope = createScope({
      id,
      ids,
      getRootNode: getRootNode2
    });
    const prop = (key) => {
      const __props = runIfFn(this.userPropsRef.current);
      const props6 = machine6.props?.({
        props: compact(__props),
        scope: this.scope
      }) ?? __props;
      return props6[key];
    };
    this.prop = prop;
    const context = machine6.context?.({
      prop,
      bindable,
      scope: this.scope,
      flush(fn) {
        queueMicrotask(fn);
      },
      getContext() {
        return ctx;
      },
      getComputed() {
        return computed;
      },
      getRefs() {
        return refs;
      },
      getEvent: this.getEvent.bind(this)
    });
    if (context) {
      Object.values(context).forEach((item) => {
        const unsub = subscribe(item.ref, () => this.notify());
        this.cleanups.push(unsub);
      });
    }
    const ctx = {
      get(key) {
        return context?.[key].get();
      },
      set(key, value) {
        context?.[key].set(value);
      },
      initial(key) {
        return context?.[key].initial;
      },
      hash(key) {
        const current = context?.[key].get();
        return context?.[key].hash(current);
      }
    };
    this.context = ctx;
    const computed = (key) => {
      ensure(machine6.computed, () => `[zag-js] No computed object found on machine`);
      return machine6.computed[key]({
        context: ctx,
        event: this.getEvent(),
        prop,
        refs: this.refs,
        scope: this.scope,
        computed
      });
    };
    this.computed = computed;
    const refs = createRefs(machine6.refs?.({
      prop,
      context: ctx
    }) ?? {});
    this.refs = refs;
    const state2 = bindable(() => ({
      defaultValue: resolveStateValue(machine6, machine6.initialState({
        prop
      })),
      onChange: (nextState, prevState) => {
        const { exiting, entering } = getExitEnterStates(this.machine, prevState, nextState, this.transition?.reenter);
        exiting.forEach((item) => {
          const exitEffects = this.effects.get(item.path);
          exitEffects?.();
          this.effects.delete(item.path);
        });
        exiting.forEach((item) => {
          this.action(item.state?.exit);
        });
        this.action(this.transition?.actions);
        entering.forEach((item) => {
          const cleanup = this.effect(item.state?.effects);
          if (cleanup) {
            const existing = this.effects.get(item.path);
            this.effects.set(item.path, existing ? callAll(existing, cleanup) : cleanup);
          }
        });
        if (prevState === INIT_STATE) {
          this.action(machine6.entry);
          const cleanup = this.effect(machine6.effects);
          if (cleanup) {
            const existing = this.effects.get(INIT_STATE);
            this.effects.set(INIT_STATE, existing ? callAll(existing, cleanup) : cleanup);
          }
        }
        entering.forEach((item) => {
          this.action(item.state?.entry);
        });
      }
    }));
    this.state = state2;
    this.cleanups.push(subscribe(this.state.ref, () => this.notify()));
  }
  updateProps(newProps) {
    const prevSource = this.userPropsRef.current;
    this.userPropsRef.current = () => {
      const prev = runIfFn(prevSource);
      const next = runIfFn(newProps);
      return mergeMachineProps(prev, next);
    };
    this.notify();
  }
  start() {
    this.status = MachineStatus.Started;
    this.debug("initializing...");
    this.state.invoke(this.state.initial, INIT_STATE);
    this.setupTrackers();
  }
  stop() {
    this.effects.forEach((fn) => fn?.());
    this.effects.clear();
    this.transition = null;
    this.action(this.machine.exit);
    this.cleanups.forEach((unsub) => unsub());
    this.cleanups = [];
    this.subscriptions = [];
    this.status = MachineStatus.Stopped;
    this.debug("unmounting...");
  }
  get service() {
    return {
      state: this.getState(),
      send: this.send,
      context: this.context,
      prop: this.prop,
      scope: this.scope,
      refs: this.refs,
      computed: this.computed,
      event: this.getEvent(),
      getStatus: () => this.status
    };
  }
};

// interpreter/vendor/entry-zag/combobox.ts
var combobox_exports = {};
__export(combobox_exports, {
  anatomy: () => anatomy,
  collection: () => collection,
  connect: () => connect,
  itemGroupLabelProps: () => itemGroupLabelProps,
  itemGroupProps: () => itemGroupProps,
  itemProps: () => itemProps,
  machine: () => machine,
  props: () => props,
  splitItemGroupLabelProps: () => splitItemGroupLabelProps,
  splitItemGroupProps: () => splitItemGroupProps,
  splitItemProps: () => splitItemProps,
  splitProps: () => splitProps2
});

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/anatomy/1.43.0/dist/create-anatomy.mjs
var createAnatomy = (name, parts6 = []) => ({
  parts: (...values) => {
    if (isEmpty(parts6)) {
      return createAnatomy(name, values);
    }
    throw new Error("createAnatomy().parts(...) should only be called once. Did you mean to use .extendWith(...) ?");
  },
  extendWith: (...values) => createAnatomy(name, [
    ...parts6,
    ...values
  ]),
  omit: (...values) => createAnatomy(name, parts6.filter((part2) => !values.includes(part2))),
  rename: (newName) => createAnatomy(newName, parts6),
  keys: () => parts6,
  build: () => [
    ...new Set(parts6)
  ].reduce((prev, part2) => Object.assign(prev, {
    [part2]: {
      selector: [
        `&[data-scope="${toKebabCase(name)}"][data-part="${toKebabCase(part2)}"]`,
        `& [data-scope="${toKebabCase(name)}"][data-part="${toKebabCase(part2)}"]`
      ].join(", "),
      attrs: {
        "data-scope": toKebabCase(name),
        "data-part": toKebabCase(part2)
      }
    }
  }), {})
});
var toKebabCase = (value) => value.replace(/([A-Z])([A-Z])/g, "$1-$2").replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
var isEmpty = (v) => v.length === 0;

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/combobox/1.43.0/dist/combobox.anatomy.mjs
var anatomy = createAnatomy("combobox").parts("root", "clearTrigger", "content", "control", "input", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "label", "list", "positioner", "trigger");
var parts = anatomy.build();

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/collection/1.43.0/dist/chunk-QZ7TP4HQ.mjs
var __defProp4 = Object.defineProperty;
var __defNormalProp3 = (obj, key, value) => key in obj ? __defProp4(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __publicField4 = (obj, key, value) => __defNormalProp3(obj, typeof key !== "symbol" ? key + "" : key, value);

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/collection/1.43.0/dist/list-collection.mjs
var fallback = {
  itemToValue(item) {
    if (typeof item === "string") return item;
    if (isObject(item) && hasProp(item, "value")) return item.value;
    return "";
  },
  itemToString(item) {
    if (typeof item === "string") return item;
    if (isObject(item) && hasProp(item, "label")) return item.label;
    return fallback.itemToValue(item);
  },
  isItemDisabled(item) {
    if (isObject(item) && hasProp(item, "disabled")) return !!item.disabled;
    return false;
  }
};
var ListCollection = class _ListCollection {
  constructor(options) {
    __publicField4(this, "options", options);
    __publicField4(this, "items");
    __publicField4(this, "indexMap", null);
    __publicField4(this, "copy", (items) => {
      return new _ListCollection({
        ...this.options,
        items: items ?? [
          ...this.items
        ]
      });
    });
    __publicField4(this, "isEqual", (other) => {
      return isEqual(this.items, other.items);
    });
    __publicField4(this, "setItems", (items) => {
      return this.copy(items);
    });
    __publicField4(this, "getValues", (items = this.items) => {
      const values = [];
      for (const item of items) {
        const value = this.getItemValue(item);
        if (value != null) values.push(value);
      }
      return values;
    });
    __publicField4(this, "find", (value) => {
      if (value == null) return null;
      const index = this.indexOf(value);
      return index !== -1 ? this.at(index) : null;
    });
    __publicField4(this, "findMany", (values) => {
      const result = [];
      for (const value of values) {
        const item = this.find(value);
        if (item != null) result.push(item);
      }
      return result;
    });
    __publicField4(this, "at", (index) => {
      if (!this.options.groupBy && !this.options.groupSort) {
        return this.items[index] ?? null;
      }
      let idx = 0;
      const groups = this.group();
      for (const [, items] of groups) {
        for (const item of items) {
          if (idx === index) return item;
          idx++;
        }
      }
      return null;
    });
    __publicField4(this, "sortFn", (valueA, valueB) => {
      const indexA = this.indexOf(valueA);
      const indexB = this.indexOf(valueB);
      return (indexA ?? 0) - (indexB ?? 0);
    });
    __publicField4(this, "sort", (values) => {
      return [
        ...values
      ].sort(this.sortFn.bind(this));
    });
    __publicField4(this, "getItemValue", (item) => {
      if (item == null) return null;
      return this.options.itemToValue?.(item) ?? fallback.itemToValue(item);
    });
    __publicField4(this, "getItemDisabled", (item) => {
      if (item == null) return false;
      return this.options.isItemDisabled?.(item) ?? fallback.isItemDisabled(item);
    });
    __publicField4(this, "stringifyItem", (item) => {
      if (item == null) return null;
      return this.options.itemToString?.(item) ?? fallback.itemToString(item);
    });
    __publicField4(this, "stringify", (value) => {
      if (value == null) return null;
      return this.stringifyItem(this.find(value));
    });
    __publicField4(this, "stringifyItems", (items, separator = ", ") => {
      const strs = [];
      for (const item of items) {
        const str = this.stringifyItem(item);
        if (str != null) strs.push(str);
      }
      return strs.join(separator);
    });
    __publicField4(this, "stringifyMany", (value, separator) => {
      return this.stringifyItems(this.findMany(value), separator);
    });
    __publicField4(this, "has", (value) => {
      return this.indexOf(value) !== -1;
    });
    __publicField4(this, "hasItem", (item) => {
      if (item == null) return false;
      return this.has(this.getItemValue(item));
    });
    __publicField4(this, "group", () => {
      const { groupBy, groupSort } = this.options;
      if (!groupBy) return [
        [
          "",
          [
            ...this.items
          ]
        ]
      ];
      const groups = /* @__PURE__ */ new Map();
      this.items.forEach((item, index) => {
        const groupKey = groupBy(item, index);
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey).push(item);
      });
      let entries = Array.from(groups.entries());
      if (groupSort) {
        entries.sort(([a], [b]) => {
          if (typeof groupSort === "function") return groupSort(a, b);
          if (Array.isArray(groupSort)) {
            const indexA = groupSort.indexOf(a);
            const indexB = groupSort.indexOf(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          }
          if (groupSort === "asc") return a.localeCompare(b);
          if (groupSort === "desc") return b.localeCompare(a);
          return 0;
        });
      }
      return entries;
    });
    __publicField4(this, "getNextValue", (value, step = 1, clamp3 = false) => {
      let index = this.indexOf(value);
      if (index === -1) return null;
      index = clamp3 ? Math.min(index + step, this.size - 1) : index + step;
      while (index <= this.size && this.getItemDisabled(this.at(index))) index++;
      return this.getItemValue(this.at(index));
    });
    __publicField4(this, "getPreviousValue", (value, step = 1, clamp3 = false) => {
      let index = this.indexOf(value);
      if (index === -1) return null;
      index = clamp3 ? Math.max(index - step, 0) : index - step;
      while (index >= 0 && this.getItemDisabled(this.at(index))) index--;
      return this.getItemValue(this.at(index));
    });
    __publicField4(this, "indexOf", (value) => {
      if (value == null) return -1;
      if (!this.options.groupBy && !this.options.groupSort) {
        return this.items.findIndex((item) => this.getItemValue(item) === value);
      }
      if (!this.indexMap) {
        this.indexMap = /* @__PURE__ */ new Map();
        let idx = 0;
        const groups = this.group();
        for (const [, items] of groups) {
          for (const item of items) {
            const itemValue = this.getItemValue(item);
            if (itemValue != null) {
              this.indexMap.set(itemValue, idx);
            }
            idx++;
          }
        }
      }
      return this.indexMap.get(value) ?? -1;
    });
    __publicField4(this, "getByText", (text, current) => {
      const currentIndex = current != null ? this.indexOf(current) : -1;
      const isSingleKey = text.length === 1;
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[(currentIndex + i + 1) % this.items.length];
        if (isSingleKey && this.getItemValue(item) === current) continue;
        if (this.getItemDisabled(item)) continue;
        if (match3(this.stringifyItem(item), text)) return item;
      }
      return void 0;
    });
    __publicField4(this, "search", (queryString, options2) => {
      const { state: state2, currentValue, timeout = 350 } = options2;
      const search = state2.keysSoFar + queryString;
      const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
      const query2 = isRepeated ? search[0] : search;
      const item = this.getByText(query2, currentValue);
      const value = this.getItemValue(item);
      function cleanup() {
        clearTimeout(state2.timer);
        state2.timer = -1;
      }
      function update(value2) {
        state2.keysSoFar = value2;
        cleanup();
        if (value2 !== "") {
          state2.timer = +setTimeout(() => {
            update("");
            cleanup();
          }, timeout);
        }
      }
      update(search);
      return value;
    });
    __publicField4(this, "update", (value, item) => {
      let index = this.indexOf(value);
      if (index === -1) return this;
      return this.copy([
        ...this.items.slice(0, index),
        item,
        ...this.items.slice(index + 1)
      ]);
    });
    __publicField4(this, "upsert", (value, item, mode = "append") => {
      let index = this.indexOf(value);
      if (index === -1) {
        const fn = mode === "append" ? this.append : this.prepend;
        return fn(item);
      }
      return this.copy([
        ...this.items.slice(0, index),
        item,
        ...this.items.slice(index + 1)
      ]);
    });
    __publicField4(this, "insert", (index, ...items) => {
      return this.copy(insert(this.items, index, ...items));
    });
    __publicField4(this, "insertBefore", (value, ...items) => {
      let toIndex = this.indexOf(value);
      if (toIndex === -1) {
        if (this.items.length === 0) toIndex = 0;
        else return this;
      }
      return this.copy(insert(this.items, toIndex, ...items));
    });
    __publicField4(this, "insertAfter", (value, ...items) => {
      let toIndex = this.indexOf(value);
      if (toIndex === -1) {
        if (this.items.length === 0) toIndex = 0;
        else return this;
      }
      return this.copy(insert(this.items, toIndex + 1, ...items));
    });
    __publicField4(this, "prepend", (...items) => {
      return this.copy(insert(this.items, 0, ...items));
    });
    __publicField4(this, "append", (...items) => {
      return this.copy(insert(this.items, this.items.length, ...items));
    });
    __publicField4(this, "filter", (fn) => {
      const filteredItems = this.items.filter((item, index) => fn(this.stringifyItem(item), index, item));
      return this.copy(filteredItems);
    });
    __publicField4(this, "remove", (...itemsOrValues) => {
      const values = itemsOrValues.map((itemOrValue) => typeof itemOrValue === "string" ? itemOrValue : this.getItemValue(itemOrValue));
      return this.copy(this.items.filter((item) => {
        const value = this.getItemValue(item);
        if (value == null) return false;
        return !values.includes(value);
      }));
    });
    __publicField4(this, "move", (value, toIndex) => {
      const fromIndex = this.indexOf(value);
      if (fromIndex === -1) return this;
      return this.copy(move(this.items, [
        fromIndex
      ], toIndex));
    });
    __publicField4(this, "moveBefore", (value, ...values) => {
      let toIndex = this.items.findIndex((item) => this.getItemValue(item) === value);
      if (toIndex === -1) return this;
      let indices = values.map((value2) => this.items.findIndex((item) => this.getItemValue(item) === value2)).sort((a, b) => a - b);
      return this.copy(move(this.items, indices, toIndex));
    });
    __publicField4(this, "moveAfter", (value, ...values) => {
      let toIndex = this.items.findIndex((item) => this.getItemValue(item) === value);
      if (toIndex === -1) return this;
      let indices = values.map((value2) => this.items.findIndex((item) => this.getItemValue(item) === value2)).sort((a, b) => a - b);
      return this.copy(move(this.items, indices, toIndex + 1));
    });
    __publicField4(this, "reorder", (fromIndex, toIndex) => {
      return this.copy(move(this.items, [
        fromIndex
      ], toIndex));
    });
    __publicField4(this, "compareValue", (a, b) => {
      const indexA = this.indexOf(a);
      const indexB = this.indexOf(b);
      if (indexA < indexB) return -1;
      if (indexA > indexB) return 1;
      return 0;
    });
    __publicField4(this, "range", (from, to) => {
      let keys = [];
      let key = from;
      while (key != null) {
        let item = this.find(key);
        if (item) keys.push(key);
        if (key === to) return keys;
        key = this.getNextValue(key);
      }
      return [];
    });
    __publicField4(this, "getValueRange", (from, to) => {
      if (from && to) {
        if (this.compareValue(from, to) <= 0) {
          return this.range(from, to);
        }
        return this.range(to, from);
      }
      return [];
    });
    __publicField4(this, "toString", () => {
      let result = "";
      for (const item of this.items) {
        const value = this.getItemValue(item);
        const label = this.stringifyItem(item);
        const disabled = this.getItemDisabled(item);
        const itemString = [
          value,
          label,
          disabled
        ].filter(Boolean).join(":");
        result += itemString + ",";
      }
      return result;
    });
    __publicField4(this, "toJSON", () => {
      return {
        size: this.size,
        first: this.firstValue,
        last: this.lastValue
      };
    });
    this.items = [
      ...options.items
    ];
  }
  /**
   * Returns the number of items in the collection
   */
  get size() {
    return this.items.length;
  }
  /**
   * Returns the first value in the collection
   */
  get firstValue() {
    let index = 0;
    while (this.getItemDisabled(this.at(index))) index++;
    return this.getItemValue(this.at(index));
  }
  /**
   * Returns the last value in the collection
   */
  get lastValue() {
    let index = this.size - 1;
    while (this.getItemDisabled(this.at(index))) index--;
    return this.getItemValue(this.at(index));
  }
  *[Symbol.iterator]() {
    yield* this.items;
  }
};
var match3 = (label, query2) => {
  return !!label?.toLowerCase().startsWith(query2.toLowerCase());
};
function insert(items, index, ...values) {
  return [
    ...items.slice(0, index),
    ...values,
    ...items.slice(index)
  ];
}
function move(items, indices, toIndex) {
  indices = [
    ...indices
  ].sort((a, b) => a - b);
  const itemsToMove = indices.map((i) => items[i]);
  for (let i = indices.length - 1; i >= 0; i--) {
    items = [
      ...items.slice(0, indices[i]),
      ...items.slice(indices[i] + 1)
    ];
  }
  toIndex = Math.max(0, toIndex - indices.filter((i) => i < toIndex).length);
  return [
    ...items.slice(0, toIndex),
    ...itemsToMove,
    ...items.slice(toIndex)
  ];
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/collection/1.43.0/dist/grid-collection.mjs
var GridCollection = class extends ListCollection {
  constructor(options) {
    const { columnCount } = options;
    super(options);
    __publicField4(this, "columnCount");
    __publicField4(this, "rows", null);
    __publicField4(this, "getRows", () => {
      if (!this.rows) {
        this.rows = chunk([
          ...this.items
        ], this.columnCount);
      }
      return this.rows;
    });
    __publicField4(this, "getRowCount", () => {
      return Math.ceil(this.items.length / this.columnCount);
    });
    __publicField4(this, "getCellIndex", (row, column) => {
      return row * this.columnCount + column;
    });
    __publicField4(this, "getCell", (row, column) => {
      return this.at(this.getCellIndex(row, column));
    });
    __publicField4(this, "getValueCell", (value) => {
      const index = this.indexOf(value);
      if (index === -1) return null;
      const row = Math.floor(index / this.columnCount);
      const column = index % this.columnCount;
      return {
        row,
        column
      };
    });
    __publicField4(this, "getLastEnabledColumnIndex", (row) => {
      for (let col = this.columnCount - 1; col >= 0; col--) {
        const cell = this.getCell(row, col);
        if (cell && !this.getItemDisabled(cell)) {
          return col;
        }
      }
      return null;
    });
    __publicField4(this, "getFirstEnabledColumnIndex", (row) => {
      for (let col = 0; col < this.columnCount; col++) {
        const cell = this.getCell(row, col);
        if (cell && !this.getItemDisabled(cell)) {
          return col;
        }
      }
      return null;
    });
    __publicField4(this, "getPreviousRowValue", (value, loop = false) => {
      const currentCell = this.getValueCell(value);
      if (currentCell === null) return null;
      const rows = this.getRows();
      const rowCount = rows.length;
      let prevRowIndex = currentCell.row;
      let prevColumnIndex = currentCell.column;
      for (let i = 1; i <= rowCount; i++) {
        prevRowIndex = prevIndex(rows, prevRowIndex, {
          loop
        });
        const prevRow = rows[prevRowIndex];
        if (!prevRow) continue;
        const prevCell = prevRow[prevColumnIndex];
        if (!prevCell) {
          const lastColumnIndex = this.getLastEnabledColumnIndex(prevRowIndex);
          if (lastColumnIndex != null) {
            prevColumnIndex = lastColumnIndex;
          }
        }
        const cell = this.getCell(prevRowIndex, prevColumnIndex);
        if (!this.getItemDisabled(cell)) {
          return this.getItemValue(cell);
        }
      }
      return this.firstValue;
    });
    __publicField4(this, "getNextRowValue", (value, loop = false) => {
      const currentCell = this.getValueCell(value);
      if (currentCell === null) return null;
      const rows = this.getRows();
      const rowCount = rows.length;
      let nextRowIndex = currentCell.row;
      let nextColumnIndex = currentCell.column;
      for (let i = 1; i <= rowCount; i++) {
        nextRowIndex = nextIndex(rows, nextRowIndex, {
          loop
        });
        const nextRow = rows[nextRowIndex];
        if (!nextRow) continue;
        const nextCell = nextRow[nextColumnIndex];
        if (!nextCell) {
          const lastColumnIndex = this.getLastEnabledColumnIndex(nextRowIndex);
          if (lastColumnIndex != null) {
            nextColumnIndex = lastColumnIndex;
          }
        }
        const cell = this.getCell(nextRowIndex, nextColumnIndex);
        if (!this.getItemDisabled(cell)) {
          return this.getItemValue(cell);
        }
      }
      return this.lastValue;
    });
    this.columnCount = columnCount;
  }
};
function isGridCollection(v) {
  return hasProp(v, "columnCount") && hasProp(v, "getRows");
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/collection/1.43.0/dist/selection-map.mjs
function resolveSelectedItems({ values, collection: collection4, selectedItemMap }) {
  const result = [];
  for (const value of values) {
    const item = collection4.find(value) ?? selectedItemMap.get(value);
    if (item != null) result.push(item);
  }
  return result;
}
function updateSelectedItemMap({ selectedItemMap, values, selectedItems, collection: collection4 }) {
  const nextMap = new Map(selectedItemMap);
  for (const item of selectedItems) {
    const value = collection4.getItemValue(item);
    if (value != null) nextMap.set(value, item);
  }
  const allowedValues = new Set(values);
  for (const value of nextMap.keys()) {
    if (!allowedValues.has(value)) nextMap.delete(value);
  }
  return nextMap;
}
function deriveSelectionState({ values, collection: collection4, selectedItemMap }) {
  const selectedItems = resolveSelectedItems({
    values,
    collection: collection4,
    selectedItemMap
  });
  const nextSelectedItemMap = updateSelectedItemMap({
    selectedItemMap,
    values,
    selectedItems,
    collection: collection4
  });
  return {
    selectedItems,
    nextSelectedItemMap
  };
}
function createSelectedItemMap({ selectedItems, collection: collection4 }) {
  return updateSelectedItemMap({
    selectedItemMap: /* @__PURE__ */ new Map(),
    values: selectedItems.map((item) => collection4.getItemValue(item)).filter(Boolean),
    selectedItems,
    collection: collection4
  });
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/collection/1.43.0/dist/selection.mjs
var Selection = class _Selection extends Set {
  constructor(values = []) {
    super(values);
    __publicField4(this, "selectionMode", "single");
    __publicField4(this, "deselectable", true);
    __publicField4(this, "copy", () => {
      const clone2 = new _Selection([
        ...this
      ]);
      return this.sync(clone2);
    });
    __publicField4(this, "sync", (other) => {
      other.selectionMode = this.selectionMode;
      other.deselectable = this.deselectable;
      return other;
    });
    __publicField4(this, "isEmpty", () => {
      return this.size === 0;
    });
    __publicField4(this, "isSelected", (value) => {
      if (this.selectionMode === "none" || value == null) {
        return false;
      }
      return this.has(value);
    });
    __publicField4(this, "canSelect", (collection4, value) => {
      return this.selectionMode !== "none" || !collection4.getItemDisabled(collection4.find(value));
    });
    __publicField4(this, "firstSelectedValue", (collection4) => {
      let firstValue = null;
      for (let value of this) {
        if (!firstValue || collection4.compareValue(value, firstValue) < 0) {
          firstValue = value;
        }
      }
      return firstValue;
    });
    __publicField4(this, "lastSelectedValue", (collection4) => {
      let lastValue = null;
      for (let value of this) {
        if (!lastValue || collection4.compareValue(value, lastValue) > 0) {
          lastValue = value;
        }
      }
      return lastValue;
    });
    __publicField4(this, "extendSelection", (collection4, anchorValue, targetValue) => {
      if (this.selectionMode === "none") {
        return this;
      }
      if (this.selectionMode === "single") {
        return this.replaceSelection(collection4, targetValue);
      }
      const selection = this.copy();
      const lastSelected = Array.from(this).pop();
      for (let key of collection4.getValueRange(anchorValue, lastSelected ?? targetValue)) {
        selection.delete(key);
      }
      for (let key of collection4.getValueRange(targetValue, anchorValue)) {
        if (this.canSelect(collection4, key)) {
          selection.add(key);
        }
      }
      return selection;
    });
    __publicField4(this, "toggleSelection", (collection4, value) => {
      if (this.selectionMode === "none") {
        return this;
      }
      if (this.selectionMode === "single" && !this.isSelected(value)) {
        return this.replaceSelection(collection4, value);
      }
      const selection = this.copy();
      if (selection.has(value)) {
        selection.delete(value);
      } else if (selection.canSelect(collection4, value)) {
        selection.add(value);
      }
      return selection;
    });
    __publicField4(this, "replaceSelection", (collection4, value) => {
      if (this.selectionMode === "none") {
        return this;
      }
      if (value == null) {
        return this;
      }
      if (!this.canSelect(collection4, value)) {
        return this;
      }
      const selection = new _Selection([
        value
      ]);
      return this.sync(selection);
    });
    __publicField4(this, "setSelection", (values2) => {
      if (this.selectionMode === "none") {
        return this;
      }
      let selection = new _Selection();
      for (let value of values2) {
        if (value != null) {
          selection.add(value);
          if (this.selectionMode === "single") {
            break;
          }
        }
      }
      return this.sync(selection);
    });
    __publicField4(this, "clearSelection", () => {
      const selection = this.copy();
      if (selection.deselectable && selection.size > 0) {
        selection.clear();
      }
      return selection;
    });
    __publicField4(this, "select", (collection4, value, forceToggle) => {
      if (this.selectionMode === "none") {
        return this;
      }
      if (this.selectionMode === "single") {
        if (this.isSelected(value) && this.deselectable) {
          return this.toggleSelection(collection4, value);
        } else {
          return this.replaceSelection(collection4, value);
        }
      } else if (this.selectionMode === "multiple" || forceToggle) {
        return this.toggleSelection(collection4, value);
      } else {
        return this.replaceSelection(collection4, value);
      }
    });
    __publicField4(this, "deselect", (value) => {
      const selection = this.copy();
      selection.delete(value);
      return selection;
    });
    __publicField4(this, "isEqual", (other) => {
      return isEqual(Array.from(this), Array.from(other));
    });
  }
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/combobox/1.43.0/dist/combobox.collection.mjs
var collection = (options) => {
  return new ListCollection(options);
};
collection.empty = () => {
  return new ListCollection({
    items: []
  });
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@floating-ui/utils/0.2.12/dist/floating-ui.utils.mjs
var sides = [
  "top",
  "right",
  "bottom",
  "left"
];
var min2 = Math.min;
var max2 = Math.max;
var round2 = Math.round;
var floor2 = Math.floor;
var createCoords = (v) => ({
  x: v,
  y: v
});
var oppositeSideMap = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function clamp2(start, value, end) {
  return max2(start, min2(value, end));
}
function evaluate(value, param) {
  return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
  return placement.split("-")[0];
}
function getAlignment(placement) {
  return placement.split("-")[1];
}
function getOppositeAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
  return axis === "y" ? "height" : "width";
}
function getSideAxis(placement) {
  const firstChar = placement[0];
  return firstChar === "t" || firstChar === "b" ? "y" : "x";
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [
    mainAlignmentSide,
    getOppositePlacement(mainAlignmentSide)
  ];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [
    getOppositeAlignmentPlacement(placement),
    oppositePlacement,
    getOppositeAlignmentPlacement(oppositePlacement)
  ];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.includes("start") ? placement.replace("start", "end") : placement.replace("end", "start");
}
var lrPlacement = [
  "left",
  "right"
];
var rlPlacement = [
  "right",
  "left"
];
var tbPlacement = [
  "top",
  "bottom"
];
var btPlacement = [
  "bottom",
  "top"
];
function getSideList(side, isStart, rtl) {
  switch (side) {
    case "top":
    case "bottom":
      if (rtl) return isStart ? rlPlacement : lrPlacement;
      return isStart ? lrPlacement : rlPlacement;
    case "left":
    case "right":
      return isStart ? tbPlacement : btPlacement;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === "start", rtl);
  if (alignment) {
    list = list.map((side) => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  const side = getSide(placement);
  return oppositeSideMap[side] + placement.slice(side.length);
}
function expandPaddingObject(padding) {
  var _padding$top, _padding$right, _padding$bottom, _padding$left;
  return {
    top: (_padding$top = padding.top) != null ? _padding$top : 0,
    right: (_padding$right = padding.right) != null ? _padding$right : 0,
    bottom: (_padding$bottom = padding.bottom) != null ? _padding$bottom : 0,
    left: (_padding$left = padding.left) != null ? _padding$left : 0
  };
}
function getPaddingObject(padding) {
  return typeof padding !== "number" ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const { x, y, width, height } = rect;
  return {
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    x,
    y
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@floating-ui/core/1.8.0/dist/floating-ui.core.mjs
function computeCoordsFromPlacement(_ref, placement, rtl) {
  let { reference, floating } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === "y";
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case "top":
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case "bottom":
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case "right":
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case "left":
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  const alignment = getAlignment(placement);
  if (alignment) {
    coords[alignmentAxis] += commonAlign * (alignment === "end" ? 1 : -1) * (rtl && isVertical ? -1 : 1);
  }
  return coords;
}
async function detectOverflow(state2, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const { x, y, platform: platform2, rects, elements, strategy } = state2;
  const { boundary = "clippingAncestors", rootBoundary = "viewport", elementContext = "floating", altBoundary = false, padding = 0 } = evaluate(options, state2);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === "floating" ? "reference" : "floating";
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
    element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === "floating" ? {
    x,
    y,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
  const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) && await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements,
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}
var MAX_RESET_COUNT = 50;
var computePosition = async (reference, floating, config) => {
  const { placement = "bottom", strategy = "absolute", middleware = [], platform: platform2 } = config;
  const platformWithDetectOverflow = platform2.detectOverflow ? platform2 : {
    ...platform2,
    detectOverflow
  };
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
  let rects = await platform2.getElementRects({
    reference,
    floating,
    strategy
  });
  let { x, y } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let resetCount = 0;
  const middlewareData = {};
  for (let i = 0; i < middleware.length; i++) {
    const currentMiddleware = middleware[i];
    if (!currentMiddleware) {
      continue;
    }
    const { name, fn } = currentMiddleware;
    const { x: nextX, y: nextY, data, reset } = await fn({
      x,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform: platformWithDetectOverflow,
      elements: {
        reference,
        floating
      }
    });
    x = nextX != null ? nextX : x;
    y = nextY != null ? nextY : y;
    middlewareData[name] = {
      ...middlewareData[name],
      ...data
    };
    if (reset && resetCount < MAX_RESET_COUNT) {
      resetCount++;
      if (typeof reset === "object") {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform2.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({ x, y } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
    }
  }
  return {
    x,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};
var arrow = (options) => ({
  name: "arrow",
  options,
  async fn(state2) {
    const { x, y, placement, rects, platform: platform2, elements, middlewareData } = state2;
    const { element, padding = 0 } = evaluate(options, state2) || {};
    if (element == null) {
      return {};
    }
    const paddingObject = getPaddingObject(padding);
    const coords = {
      x,
      y
    };
    const axis = getAlignmentAxis(placement);
    const length = getAxisLength(axis);
    const arrowDimensions = await platform2.getDimensions(element);
    const isYAxis = axis === "y";
    const minProp = isYAxis ? "top" : "left";
    const maxProp = isYAxis ? "bottom" : "right";
    const clientProp = isYAxis ? "clientHeight" : "clientWidth";
    const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
    const startDiff = coords[axis] - rects.reference[axis];
    const arrowOffsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(element));
    let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;
    if (!clientSize || !await (platform2.isElement == null ? void 0 : platform2.isElement(arrowOffsetParent))) {
      clientSize = elements.floating[clientProp] || rects.floating[length];
    }
    const centerToReference = endDiff / 2 - startDiff / 2;
    const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
    const minPadding = min2(paddingObject[minProp], largestPossiblePadding);
    const maxPadding = min2(paddingObject[maxProp], largestPossiblePadding);
    const max3 = clientSize - arrowDimensions[length] - maxPadding;
    const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
    const offset3 = clamp2(minPadding, center, max3);
    const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset3 && rects.reference[length] / 2 - (center < minPadding ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
    const alignmentOffset = shouldAddOffset ? center < minPadding ? center - minPadding : center - max3 : 0;
    return {
      [axis]: coords[axis] + alignmentOffset,
      data: {
        [axis]: offset3,
        centerOffset: center - offset3 - alignmentOffset,
        ...shouldAddOffset && {
          alignmentOffset
        }
      },
      reset: shouldAddOffset
    };
  }
});
var flip = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "flip",
    options,
    async fn(state2) {
      var _middlewareData$arrow, _middlewareData$flip;
      const { placement, middlewareData, rects, initialPlacement, platform: platform2, elements } = state2;
      const { mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = true, fallbackPlacements: specifiedFallbackPlacements, fallbackStrategy = "bestFit", fallbackAxisSideDirection = "none", flipAlignment = true, ...detectOverflowOptions } = evaluate(options, state2);
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const initialSideAxis = getSideAxis(initialPlacement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [
        getOppositePlacement(initialPlacement)
      ] : getExpandedPlacements(initialPlacement));
      const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
      if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements2 = [
        initialPlacement,
        ...fallbackPlacements
      ];
      const overflow = await platform2.detectOverflow(state2, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides2 = getAlignmentSides(placement, rects, rtl);
        overflows.push(overflow[sides2[0]], overflow[sides2[1]]);
      }
      overflowsData = [
        ...overflowsData,
        {
          placement,
          overflows
        }
      ];
      if (!overflows.every((side2) => side2 <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex2 = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements2[nextIndex2];
        if (nextPlacement) {
          const ignoreCrossAxisOverflow = checkCrossAxis === "alignment" ? initialSideAxis !== getSideAxis(nextPlacement) : false;
          if (!ignoreCrossAxisOverflow || // We leave the current main axis only if every placement on that axis
          // overflows the main axis.
          overflowsData.every((d) => getSideAxis(d.placement) === initialSideAxis ? d.overflows[0] > 0 : true)) {
            return {
              data: {
                index: nextIndex2,
                overflows: overflowsData
              },
              reset: {
                placement: nextPlacement
              }
            };
          }
        }
        let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case "bestFit": {
              var _overflowsData$filter2;
              const placement2 = (_overflowsData$filter2 = overflowsData.filter((d) => {
                if (hasFallbackAxisSideDirection) {
                  const currentSideAxis = getSideAxis(d.placement);
                  return currentSideAxis === initialSideAxis || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  currentSideAxis === "y";
                }
                return true;
              }).map((d) => [
                d.placement,
                d.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)
              ]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
              if (placement2) {
                resetPlacement = placement2;
              }
              break;
            }
            case "initialPlacement":
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};
function getSideOffsets(overflow, rect) {
  return {
    top: overflow.top - rect.height,
    right: overflow.right - rect.width,
    bottom: overflow.bottom - rect.height,
    left: overflow.left - rect.width
  };
}
function isAnySideFullyClipped(overflow) {
  return sides.some((side) => overflow[side] >= 0);
}
var hide = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "hide",
    options,
    async fn(state2) {
      const { rects, platform: platform2 } = state2;
      const { strategy = "referenceHidden", ...detectOverflowOptions } = evaluate(options, state2);
      switch (strategy) {
        case "referenceHidden": {
          const overflow = await platform2.detectOverflow(state2, {
            ...detectOverflowOptions,
            elementContext: "reference"
          });
          const offsets = getSideOffsets(overflow, rects.reference);
          return {
            data: {
              referenceHiddenOffsets: offsets,
              referenceHidden: isAnySideFullyClipped(offsets)
            }
          };
        }
        case "escaped": {
          const overflow = await platform2.detectOverflow(state2, {
            ...detectOverflowOptions,
            altBoundary: true
          });
          const offsets = getSideOffsets(overflow, rects.floating);
          return {
            data: {
              escapedOffsets: offsets,
              escaped: isAnySideFullyClipped(offsets)
            }
          };
        }
        default: {
          return {};
        }
      }
    }
  };
};
var originSides = /* @__PURE__ */ new Set([
  "left",
  "top"
]);
async function convertValueToCoords(state2, options) {
  const { placement, platform: platform2, elements } = state2;
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === "y";
  const mainAxisMulti = originSides.has(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state2);
  let { mainAxis, crossAxis, alignmentAxis } = typeof rawValue === "number" ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: rawValue.mainAxis || 0,
    crossAxis: rawValue.crossAxis || 0,
    alignmentAxis: rawValue.alignmentAxis
  };
  if (alignment && typeof alignmentAxis === "number") {
    crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}
var offset = function(options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: "offset",
    options,
    async fn(state2) {
      var _middlewareData$offse, _middlewareData$arrow;
      const { x, y, placement, middlewareData } = state2;
      const diffCoords = await convertValueToCoords(state2, options);
      if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      return {
        x: x + diffCoords.x,
        y: y + diffCoords.y,
        data: {
          ...diffCoords,
          placement
        }
      };
    }
  };
};
var shift = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "shift",
    options,
    async fn(state2) {
      const { x, y, placement, platform: platform2 } = state2;
      const { mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = false, limiter = {
        fn: (_ref) => {
          let { x: x2, y: y2 } = _ref;
          return {
            x: x2,
            y: y2
          };
        }
      }, ...detectOverflowOptions } = evaluate(options, state2);
      const coords = {
        x,
        y
      };
      const overflow = await platform2.detectOverflow(state2, detectOverflowOptions);
      const crossAxis = getSideAxis(placement);
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      const clampCoord = (axis, coord) => clamp2(coord + overflow[axis === "y" ? "top" : "left"], coord, coord - overflow[axis === "y" ? "bottom" : "right"]);
      if (checkMainAxis) {
        mainAxisCoord = clampCoord(mainAxis, mainAxisCoord);
      }
      if (checkCrossAxis) {
        crossAxisCoord = clampCoord(crossAxis, crossAxisCoord);
      }
      const limitedCoords = limiter.fn({
        ...state2,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x,
          y: limitedCoords.y - y,
          enabled: {
            [mainAxis]: checkMainAxis,
            [crossAxis]: checkCrossAxis
          }
        }
      };
    }
  };
};
var limitShift = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    options,
    fn(state2) {
      var _rawOffset$mainAxis, _rawOffset$crossAxis;
      const { x, y, placement, rects, middlewareData } = state2;
      const { offset: offset3 = 0, mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = true } = evaluate(options, state2);
      const coords = {
        x,
        y
      };
      const crossAxis = getSideAxis(placement);
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      const rawOffset = evaluate(offset3, state2);
      const computedOffset = typeof rawOffset === "number" ? {
        mainAxis: rawOffset,
        crossAxis: 0
      } : {
        mainAxis: (_rawOffset$mainAxis = rawOffset.mainAxis) != null ? _rawOffset$mainAxis : 0,
        crossAxis: (_rawOffset$crossAxis = rawOffset.crossAxis) != null ? _rawOffset$crossAxis : 0
      };
      if (checkMainAxis) {
        const len = mainAxis === "y" ? "height" : "width";
        const limitMin = rects.reference[mainAxis] - rects.floating[len] + computedOffset.mainAxis;
        const limitMax = rects.reference[mainAxis] + rects.reference[len] - computedOffset.mainAxis;
        if (mainAxisCoord < limitMin) {
          mainAxisCoord = limitMin;
        } else if (mainAxisCoord > limitMax) {
          mainAxisCoord = limitMax;
        }
      }
      if (checkCrossAxis) {
        var _middlewareData$offse, _middlewareData$offse2;
        const len = mainAxis === "y" ? "width" : "height";
        const isOriginSide = originSides.has(getSide(placement));
        const limitMin = rects.reference[crossAxis] - rects.floating[len] + (isOriginSide ? ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse[crossAxis]) || 0 : 0) + (isOriginSide ? 0 : computedOffset.crossAxis);
        const limitMax = rects.reference[crossAxis] + rects.reference[len] + (isOriginSide ? 0 : ((_middlewareData$offse2 = middlewareData.offset) == null ? void 0 : _middlewareData$offse2[crossAxis]) || 0) - (isOriginSide ? computedOffset.crossAxis : 0);
        if (crossAxisCoord < limitMin) {
          crossAxisCoord = limitMin;
        } else if (crossAxisCoord > limitMax) {
          crossAxisCoord = limitMax;
        }
      }
      return {
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      };
    }
  };
};
var size = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "size",
    options,
    async fn(state2) {
      const { placement, rects, platform: platform2, elements } = state2;
      const { apply = () => {
      }, ...detectOverflowOptions } = evaluate(options, state2);
      const overflow = await platform2.detectOverflow(state2, detectOverflowOptions);
      const side = getSide(placement);
      const alignment = getAlignment(placement);
      const isYAxis = getSideAxis(placement) === "y";
      const { width, height } = rects.floating;
      let heightSide;
      let widthSide;
      if (side === "top" || side === "bottom") {
        heightSide = side;
        widthSide = alignment === (await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating)) ? "start" : "end") ? "left" : "right";
      } else {
        widthSide = side;
        heightSide = alignment === "end" ? "top" : "bottom";
      }
      const maximumClippingHeight = height - overflow.top - overflow.bottom;
      const maximumClippingWidth = width - overflow.left - overflow.right;
      const overflowAvailableHeight = min2(height - overflow[heightSide], maximumClippingHeight);
      const overflowAvailableWidth = min2(width - overflow[widthSide], maximumClippingWidth);
      const shiftData = state2.middlewareData.shift;
      const noShift = !shiftData;
      let availableHeight = overflowAvailableHeight;
      let availableWidth = overflowAvailableWidth;
      if (shiftData != null && shiftData.enabled.x) {
        availableWidth = maximumClippingWidth;
      }
      if (shiftData != null && shiftData.enabled.y) {
        availableHeight = maximumClippingHeight;
      }
      if (noShift && !alignment) {
        if (isYAxis) {
          availableWidth = width - 2 * max2(overflow.left, overflow.right);
        } else {
          availableHeight = height - 2 * max2(overflow.top, overflow.bottom);
        }
      }
      await apply({
        ...state2,
        availableWidth,
        availableHeight
      });
      const nextDimensions = await platform2.getDimensions(elements.floating);
      if (width !== nextDimensions.width || height !== nextDimensions.height) {
        return {
          reset: {
            rects: true
          }
        };
      }
      return {};
    }
  };
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@floating-ui/utils/0.2.12/dist/floating-ui.utils.dom.mjs
function hasWindow() {
  return typeof window !== "undefined";
}
function getNodeName2(node) {
  if (isNode2(node)) {
    return (node.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow2(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement2(node) {
  var _ref;
  return (_ref = (isNode2(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode2(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow2(value).Node;
}
function isElement2(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow2(value).Element;
}
function isHTMLElement2(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow2(value).HTMLElement;
}
function isShadowRoot2(value) {
  if (!hasWindow() || typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow2(value).ShadowRoot;
}
function isOverflowElement2(element) {
  const { overflow, overflowX, overflowY, display } = getComputedStyle3(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && display !== "inline" && display !== "contents";
}
function isTableElement(element) {
  return /^(table|td|th)$/.test(getNodeName2(element));
}
function isTopLayer(element) {
  try {
    if (element.matches(":popover-open")) {
      return true;
    }
  } catch (_e) {
  }
  try {
    return element.matches(":modal");
  } catch (_e) {
    return false;
  }
}
var willChangeRe = /transform|translate|scale|rotate|perspective|filter/;
var containRe = /paint|layout|strict|content/;
var isNotNone = (value) => !!value && value !== "none";
var isWebKitValue;
function isContainingBlock(elementOrCss) {
  const css = isElement2(elementOrCss) ? getComputedStyle3(elementOrCss) : elementOrCss;
  return isNotNone(css.transform) || isNotNone(css.translate) || isNotNone(css.scale) || isNotNone(css.rotate) || isNotNone(css.perspective) || !isWebKit() && (isNotNone(css.backdropFilter) || isNotNone(css.filter)) || willChangeRe.test(css.willChange || "") || containRe.test(css.contain || "");
}
function getContainingBlock(element) {
  let currentNode = getParentNode2(element);
  while (isHTMLElement2(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode2(currentNode);
  }
  return null;
}
function isWebKit() {
  if (isWebKitValue == null) {
    isWebKitValue = typeof CSS !== "undefined" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none");
  }
  return isWebKitValue;
}
function isLastTraversableNode(node) {
  return /^(html|body|#document)$/.test(getNodeName2(node));
}
function getComputedStyle3(element) {
  return getWindow2(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement2(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.scrollX,
    scrollTop: element.scrollY
  };
}
function getParentNode2(node) {
  if (getNodeName2(node) === "html") {
    return node;
  }
  const result = (
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot || // DOM Element detected.
    node.parentNode || // ShadowRoot detected.
    isShadowRoot2(node) && node.host || // Fallback.
    getDocumentElement2(node)
  );
  return isShadowRoot2(result) ? result.host : result;
}
function getNearestOverflowAncestor2(node) {
  const parentNode = getParentNode2(node);
  if (isLastTraversableNode(parentNode)) {
    return (node.ownerDocument || node).body;
  }
  if (isHTMLElement2(parentNode) && isOverflowElement2(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor2(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor2(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow2(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement2(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  } else {
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
  }
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@floating-ui/dom/1.8.0/dist/floating-ui.dom.mjs
function getCssDimensions(element) {
  const css = getComputedStyle3(element);
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement2(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round2(width) !== offsetWidth || round2(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}
function unwrapElement(element) {
  return !isElement2(element) ? element.contextElement : element;
}
function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement2(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const { width, height, $ } = getCssDimensions(domElement);
  let x = ($ ? round2(rect.width) : rect.width) / width;
  let y = ($ ? round2(rect.height) : rect.height) / height;
  if (!x || !Number.isFinite(x)) {
    x = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x,
    y
  };
}
var noOffsets = /* @__PURE__ */ createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow2(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  return !!floatingOffsetParent && isFixed && floatingOffsetParent === getWindow2(element);
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement2(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement && offsetParent) {
    const win = getWindow2(domElement);
    const offsetWin = isElement2(offsetParent) ? getWindow2(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle3(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentWin = getWindow2(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x,
    y
  });
}
function getWindowScrollBarX(element, rect) {
  const leftScroll = getNodeScroll(element).scrollLeft;
  if (!rect) {
    return getBoundingClientRect(getDocumentElement2(element)).left + leftScroll;
  }
  return rect.left + leftScroll;
}
function getHTMLOffset(documentElement, scroll) {
  const htmlRect = documentElement.getBoundingClientRect();
  const x = htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect);
  const y = htmlRect.top + scroll.scrollTop;
  return {
    x,
    y
  };
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let { elements, rect, offsetParent, strategy } = _ref;
  const isFixed = strategy === "fixed";
  const documentElement = getDocumentElement2(offsetParent);
  const topLayer = elements ? isTopLayer(elements.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement2(offsetParent);
  if (isOffsetParentAnElement || !isFixed) {
    if (getNodeName2(offsetParent) !== "body" || isOverflowElement2(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
  };
}
function getClientRects(element) {
  return element.getClientRects ? Array.from(element.getClientRects()) : [];
}
function getDocumentRect(html) {
  const scroll = getNodeScroll(html);
  const body = html.ownerDocument.body;
  const width = max2(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max2(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x = -scroll.scrollLeft + getWindowScrollBarX(html);
  const y = -scroll.scrollTop;
  if (getComputedStyle3(body).direction === "rtl") {
    x += max2(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}
var SCROLLBAR_MAX = 25;
function getViewportRect(element, strategy, rootBoundary) {
  if (rootBoundary === void 0) {
    rootBoundary = "viewport";
  }
  const isLayoutViewport = rootBoundary === "layoutViewport";
  const win = getWindow2(element);
  const html = getDocumentElement2(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    const layoutRelativeClientCoords = !isWebKit() || strategy === "fixed";
    if (isLayoutViewport) {
      if (!layoutRelativeClientCoords) {
        x = -visualViewport.offsetLeft;
        y = -visualViewport.offsetTop;
      }
    } else {
      width = visualViewport.width;
      height = visualViewport.height;
      if (layoutRelativeClientCoords) {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
  }
  const windowScrollbarX = getWindowScrollBarX(html);
  if (windowScrollbarX <= 0) {
    const doc = html.ownerDocument;
    const body = doc.body;
    const bodyStyles = getComputedStyle(body);
    const bodyMarginInline = doc.compatMode === "CSS1Compat" ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
    const reservedWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
    const gutter = getComputedStyle(html).scrollbarGutter === "stable both-edges" ? reservedWidth / 2 : reservedWidth;
    if (gutter <= SCROLLBAR_MAX) {
      width -= gutter;
    }
  }
  return {
    width,
    height,
    x,
    y
  };
}
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = getScale(element);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x = left * scale.x;
  const y = top * scale.y;
  return {
    width,
    height,
    x,
    y
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === "viewport" || clippingAncestor === "layoutViewport") {
    rect = getViewportRect(element, strategy, clippingAncestor);
  } else if (clippingAncestor === "document") {
    rect = getDocumentRect(getDocumentElement2(element));
  } else if (isElement2(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y,
      width: clippingAncestor.width,
      height: clippingAncestor.height
    };
  }
  return rectToClientRect(rect);
}
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter((el) => isElement2(el) && getNodeName2(el) !== "body");
  let lastKeptComputedStyle = null;
  const elementIsFixed = getComputedStyle3(element).position === "fixed";
  let currentNode = elementIsFixed ? getParentNode2(element) : element;
  while (isElement2(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle3(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    const lastPosition = lastKeptComputedStyle ? lastKeptComputedStyle.position : elementIsFixed ? "fixed" : "";
    const shouldDropCurrentNode = !currentNodeIsContaining && (lastPosition === "fixed" || lastPosition === "absolute" && computedStyle.position === "static");
    if (shouldDropCurrentNode) {
      result = result.filter((ancestor) => ancestor !== currentNode);
    } else {
      lastKeptComputedStyle = computedStyle;
    }
    currentNode = getParentNode2(currentNode);
  }
  cache.set(element, result);
  return result;
}
function getClippingRect(_ref) {
  let { element, boundary, rootBoundary, strategy } = _ref;
  const elementClippingAncestors = boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [
    ...elementClippingAncestors,
    rootBoundary
  ];
  const firstRect = getClientRectFromClippingAncestor(element, clippingAncestors[0], strategy);
  let top = firstRect.top;
  let right = firstRect.right;
  let bottom = firstRect.bottom;
  let left = firstRect.left;
  for (let i = 1; i < clippingAncestors.length; i++) {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestors[i], strategy);
    top = max2(rect.top, top);
    right = min2(rect.right, right);
    bottom = min2(rect.bottom, bottom);
    left = max2(rect.left, left);
  }
  return {
    width: right - left,
    height: bottom - top,
    x: left,
    y: top
  };
}
function getDimensions(element) {
  const { width, height } = getCssDimensions(element);
  return {
    width,
    height
  };
}
function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement2(offsetParent);
  const documentElement = getDocumentElement2(offsetParent);
  const isFixed = strategy === "fixed";
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);
  if (isOffsetParentAnElement || !isFixed) {
    if (getNodeName2(offsetParent) !== "body" || isOverflowElement2(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  if (!isOffsetParentAnElement && documentElement) {
    offsets.x = getWindowScrollBarX(documentElement);
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
  const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
  return {
    x,
    y,
    width: rect.width,
    height: rect.height
  };
}
function isStaticPositioned(element) {
  return getComputedStyle3(element).position === "static";
}
function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement2(element) || getComputedStyle3(element).position === "fixed") {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  let rawOffsetParent = element.offsetParent;
  if (getDocumentElement2(element) === rawOffsetParent) {
    rawOffsetParent = rawOffsetParent.ownerDocument.body;
  }
  return rawOffsetParent;
}
function getOffsetParent(element, polyfill) {
  const win = getWindow2(element);
  if (isTopLayer(element)) {
    return win;
  }
  if (!isHTMLElement2(element)) {
    let svgOffsetParent = getParentNode2(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement2(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode2(svgOffsetParent);
    }
    return win;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
    return win;
  }
  return offsetParent || getContainingBlock(element) || win;
}
var getElementRects = async function(data) {
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  const floatingDimensions = await getDimensionsFn(data.floating);
  return {
    reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
    floating: {
      x: 0,
      y: 0,
      width: floatingDimensions.width,
      height: floatingDimensions.height
    }
  };
};
function isRTL(element) {
  return getComputedStyle3(element).direction === "rtl";
}
var platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement: getDocumentElement2,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement: isElement2,
  isRTL
};
function rectsAreEqual(a, b) {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}
function observeMove(element, onMove, ancestorResize) {
  let io = null;
  let timeoutId;
  const root = getDocumentElement2(element);
  function cleanup() {
    var _io;
    clearTimeout(timeoutId);
    (_io = io) == null || _io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const elementRectForRootMargin = element.getBoundingClientRect();
    const { left, top, width, height } = elementRectForRootMargin;
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor2(top);
    const insetRight = floor2(root.clientWidth - (left + width));
    const insetBottom = floor2(root.clientHeight - (top + height));
    const insetLeft = floor2(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max2(0, min2(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (!rectsAreEqual(elementRectForRootMargin, element.getBoundingClientRect())) {
        return refresh();
      }
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 1e3);
        } else {
          refresh(false, ratio);
        }
      }
      isFirstUpdate = false;
    }
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (_e) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element);
  }
  const win = getWindow2(element);
  const handleResize = () => refresh(ancestorResize);
  win.addEventListener("resize", handleResize);
  refresh(true);
  return () => {
    win.removeEventListener("resize", handleResize);
    cleanup();
  };
}
function autoUpdate(reference, floating, update, options) {
  if (options === void 0) {
    options = {};
  }
  const { ancestorScroll = true, ancestorResize = true, elementResize = typeof ResizeObserver === "function", layoutShift = typeof IntersectionObserver === "function", animationFrame = false } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [
    ...referenceEl ? getOverflowAncestors(referenceEl) : [],
    ...floating ? getOverflowAncestors(floating) : []
  ] : [];
  ancestors.forEach((ancestor) => {
    ancestorScroll && ancestor.addEventListener("scroll", update);
    ancestorResize && ancestor.addEventListener("resize", update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update, ancestorResize) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver((_ref) => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver && floating) {
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          var _resizeObserver;
          (_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    if (floating) {
      resizeObserver.observe(floating);
    }
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    var _resizeObserver2;
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.removeEventListener("scroll", update);
      ancestorResize && ancestor.removeEventListener("resize", update);
    });
    cleanupIo == null || cleanupIo();
    (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}
var offset2 = offset;
var shift2 = shift;
var flip2 = flip;
var size2 = size;
var hide2 = hide;
var arrow2 = arrow;
var limitShift2 = limitShift;
var computePosition2 = (reference, floating, options) => {
  const cache = /* @__PURE__ */ new Map();
  const mergedOptions = options != null ? options : {};
  const platformWithCache = {
    ...platform,
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/popper/1.43.0/dist/get-anchor.mjs
function createDOMRect(x = 0, y = 0, width = 0, height = 0) {
  if (typeof DOMRect === "function") {
    return new DOMRect(x, y, width, height);
  }
  const rect = {
    x,
    y,
    width,
    height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x
  };
  return {
    ...rect,
    toJSON: () => rect
  };
}
function getDOMRect(anchorRect) {
  if (!anchorRect) return createDOMRect();
  const { x, y, width, height } = anchorRect;
  return createDOMRect(x, y, width, height);
}
function getAnchorElement(anchorElement, getAnchorRect) {
  return {
    contextElement: isHTMLElement(anchorElement) ? anchorElement : anchorElement?.contextElement,
    getBoundingClientRect: () => {
      const anchor = anchorElement;
      const anchorRect = getAnchorRect?.(anchor);
      if (anchorRect || !anchor) {
        return getDOMRect(anchorRect);
      }
      return anchor.getBoundingClientRect();
    }
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/popper/1.43.0/dist/middleware.mjs
var toVar = (value) => ({
  variable: value,
  reference: `var(${value})`
});
var cssVars = {
  arrowSize: toVar("--arrow-size"),
  arrowSizeHalf: toVar("--arrow-size-half"),
  arrowBg: toVar("--arrow-background"),
  transformOrigin: toVar("--transform-origin"),
  arrowOffset: toVar("--arrow-offset")
};
var getSideAxis2 = (side) => side === "top" || side === "bottom" ? "y" : "x";
function createTransformOriginMiddleware(opts, arrowEl) {
  return {
    name: "transformOrigin",
    fn(state2) {
      const { elements, middlewareData, placement, rects, y } = state2;
      const side = placement.split("-")[0];
      const axis = getSideAxis2(side);
      const arrowX = middlewareData.arrow?.x || 0;
      const arrowY = middlewareData.arrow?.y || 0;
      const arrowWidth = arrowEl?.clientWidth || 0;
      const arrowHeight = arrowEl?.clientHeight || 0;
      const transformX = arrowX + arrowWidth / 2;
      const transformY = arrowY + arrowHeight / 2;
      const shiftY = Math.abs(middlewareData.shift?.y || 0);
      const halfAnchorHeight = rects.reference.height / 2;
      const arrowOffset = arrowHeight / 2;
      const gutter = opts.offset?.mainAxis ?? opts.gutter;
      const sideOffsetValue = typeof gutter === "number" ? gutter + arrowOffset : gutter ?? arrowOffset;
      const isOverlappingAnchor = shiftY > sideOffsetValue;
      const adjacentTransformOrigin = {
        top: `${transformX}px calc(100% + ${sideOffsetValue}px)`,
        bottom: `${transformX}px ${-sideOffsetValue}px`,
        left: `calc(100% + ${sideOffsetValue}px) ${transformY}px`,
        right: `${-sideOffsetValue}px ${transformY}px`
      }[side];
      const overlapTransformOrigin = `${transformX}px ${rects.reference.y + halfAnchorHeight - y}px`;
      const useOverlap = Boolean(opts.overlap) && axis === "y" && isOverlappingAnchor;
      elements.floating.style.setProperty(cssVars.transformOrigin.variable, useOverlap ? overlapTransformOrigin : adjacentTransformOrigin);
      return {
        data: {
          transformOrigin: useOverlap ? overlapTransformOrigin : adjacentTransformOrigin
        }
      };
    }
  };
}
var rectMiddleware = {
  name: "rects",
  fn({ rects }) {
    return {
      data: rects
    };
  }
};
var shiftArrowMiddleware = (arrowEl) => {
  if (!arrowEl) return;
  return {
    name: "shiftArrow",
    fn({ placement, middlewareData }) {
      if (!middlewareData.arrow) return {};
      const { x, y } = middlewareData.arrow;
      const dir = placement.split("-")[0];
      Object.assign(arrowEl.style, {
        left: x != null ? `${x}px` : "",
        top: y != null ? `${y}px` : "",
        [dir]: `calc(100% + ${cssVars.arrowOffset.reference})`
      });
      return {};
    }
  };
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/popper/1.43.0/dist/placement.mjs
function getPlacementDetails(placement) {
  const [side, align] = placement.split("-");
  return {
    side,
    align,
    hasAlign: align != null
  };
}
function getPlacementSide(placement) {
  return placement.split("-")[0];
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/popper/1.43.0/dist/get-placement.mjs
var defaultOptions = {
  strategy: "absolute",
  placement: "bottom",
  listeners: true,
  restoreStyles: false,
  applyStyles: true,
  gutter: 8,
  flip: true,
  slide: true,
  overlap: false,
  sameWidth: false,
  fitViewport: false,
  overflowPadding: 8,
  arrowPadding: 4
};
function roundByDpr(win, value) {
  const dpr = win.devicePixelRatio || 1;
  return Math.round(value * dpr) / dpr;
}
function isApproximatelyEqual(a, b) {
  return a != null && Math.abs(a - b) < 0.5;
}
function resolveBoundaryOption(boundary) {
  if (typeof boundary === "function") return boundary();
  if (boundary === "clipping-ancestors") return "clippingAncestors";
  return boundary;
}
function getArrowMiddleware(arrowElement, doc, opts) {
  const element = arrowElement || doc.createElement("div");
  return arrow2({
    element,
    padding: opts.arrowPadding
  });
}
function getOffsetMiddleware(arrowElement, opts) {
  if (isNull(opts.offset ?? opts.gutter)) return;
  return offset2(({ placement }) => {
    const arrowOffset = (arrowElement?.clientHeight || 0) / 2;
    const gutter = opts.offset?.mainAxis ?? opts.gutter;
    const mainAxis = typeof gutter === "number" ? gutter + arrowOffset : gutter ?? arrowOffset;
    const { hasAlign } = getPlacementDetails(placement);
    const shift22 = !hasAlign ? opts.shift : void 0;
    const crossAxis = opts.offset?.crossAxis ?? shift22;
    return compact({
      crossAxis,
      mainAxis,
      alignmentAxis: opts.shift
    });
  });
}
function getFlipMiddleware(opts) {
  if (!opts.flip) return;
  return flip2(() => {
    const boundary = resolveBoundaryOption(opts.boundary);
    return {
      ...boundary ? {
        boundary
      } : void 0,
      padding: opts.overflowPadding,
      fallbackPlacements: opts.flip === true ? void 0 : opts.flip
    };
  });
}
function getShiftMiddleware(opts) {
  if (!opts.slide && !opts.overlap) return;
  return shift2(() => {
    const boundary = resolveBoundaryOption(opts.boundary);
    return {
      ...boundary ? {
        boundary
      } : void 0,
      mainAxis: opts.slide,
      crossAxis: opts.overlap,
      padding: opts.overflowPadding,
      limiter: limitShift2()
    };
  });
}
function getSizeMiddleware(opts) {
  if (opts.sizeMiddleware === false && !opts.sameWidth && !opts.fitViewport) return;
  let lastReferenceWidth;
  let lastReferenceHeight;
  let lastAvailableWidth;
  let lastAvailableHeight;
  return size2(() => {
    const boundary = resolveBoundaryOption(opts.boundary);
    return {
      padding: opts.overflowPadding,
      ...boundary ? {
        boundary
      } : void 0,
      apply({ elements, rects, availableHeight, availableWidth }) {
        const floating = elements.floating;
        const referenceWidth = Math.round(rects.reference.width);
        const referenceHeight = Math.round(rects.reference.height);
        availableWidth = Math.floor(availableWidth);
        availableHeight = Math.floor(availableHeight);
        if (!isApproximatelyEqual(lastReferenceWidth, referenceWidth)) {
          floating.style.setProperty("--reference-width", `${referenceWidth}px`);
          lastReferenceWidth = referenceWidth;
        }
        if (!isApproximatelyEqual(lastReferenceHeight, referenceHeight)) {
          floating.style.setProperty("--reference-height", `${referenceHeight}px`);
          lastReferenceHeight = referenceHeight;
        }
        if (!isApproximatelyEqual(lastAvailableWidth, availableWidth)) {
          floating.style.setProperty("--available-width", `${availableWidth}px`);
          lastAvailableWidth = availableWidth;
        }
        if (!isApproximatelyEqual(lastAvailableHeight, availableHeight)) {
          floating.style.setProperty("--available-height", `${availableHeight}px`);
          lastAvailableHeight = availableHeight;
        }
      }
    };
  });
}
function hideWhenDetachedMiddleware(opts) {
  if (!opts.hideWhenDetached) return;
  return hide2(() => ({
    strategy: "referenceHidden",
    boundary: resolveBoundaryOption(opts.boundary) ?? "clippingAncestors"
  }));
}
function getAutoUpdateOptions(opts) {
  if (!opts) return {};
  if (opts === true) {
    return {
      ancestorResize: true,
      ancestorScroll: true,
      elementResize: true,
      layoutShift: true
    };
  }
  return opts;
}
var floatingStyleProps = [
  "transform",
  "visibility",
  "pointer-events",
  "--x",
  "--y",
  "--z-index",
  "--reference-width",
  "--reference-height",
  "--available-width",
  "--available-height",
  "--transform-origin"
];
var arrowStyleProps = [
  "top",
  "right",
  "bottom",
  "left"
];
function createStyleCleanup(el, props6) {
  if (!el) return noop;
  const prev = new Map(props6.map((prop) => [
    prop,
    el.style.getPropertyValue(prop)
  ]));
  return () => {
    prev.forEach((value, prop) => {
      if (value) el.style.setProperty(prop, value);
      else el.style.removeProperty(prop);
    });
    if (el.style.length === 0) {
      el.removeAttribute("style");
    }
  };
}
function anchorIdentity(anchor) {
  if (anchor == null) return null;
  if (isHTMLElement(anchor)) return anchor;
  if (typeof anchor === "object" && anchor && "contextElement" in anchor && anchor.contextElement) {
    return anchor.contextElement;
  }
  return anchor;
}
function getPlacementImpl(referenceOrVirtual, floatingOrVirtual, opts = {}) {
  const resolveFloating = () => {
    const raw = typeof floatingOrVirtual === "function" ? floatingOrVirtual() : floatingOrVirtual;
    return raw ?? null;
  };
  const resolveAnchor = () => {
    const raw = typeof referenceOrVirtual === "function" ? referenceOrVirtual() : referenceOrVirtual;
    return opts.getAnchorElement?.() ?? raw;
  };
  const resolveReference = () => {
    const anchor = resolveAnchor();
    if (!anchor && !opts.getAnchorRect) return null;
    return getAnchorElement(anchor, opts.getAnchorRect);
  };
  const options = Object.assign({}, defaultOptions, opts);
  let middleware = [];
  let cachedMiddlewareFloating = null;
  let restoreFloatingStyles;
  let restoreArrowStyles;
  function rebuildMiddlewareForFloating(floating) {
    restoreFloatingStyles?.();
    restoreArrowStyles?.();
    cachedMiddlewareFloating = floating;
    restoreFloatingStyles = options.restoreStyles ? createStyleCleanup(floating, floatingStyleProps) : void 0;
    const arrowEl = floating.querySelector("[data-part=arrow]");
    restoreArrowStyles = options.restoreStyles ? createStyleCleanup(arrowEl, arrowStyleProps) : void 0;
    middleware = [
      getOffsetMiddleware(arrowEl, options),
      getFlipMiddleware(options),
      getShiftMiddleware(options),
      getArrowMiddleware(arrowEl, floating.ownerDocument, options),
      shiftArrowMiddleware(arrowEl),
      createTransformOriginMiddleware({
        gutter: options.gutter,
        offset: options.offset,
        overlap: options.overlap
      }, arrowEl),
      getSizeMiddleware(options),
      hideWhenDetachedMiddleware(options),
      rectMiddleware
    ];
  }
  const { placement, strategy, onComplete, onPositioned } = options;
  let lastX;
  let lastY;
  let zIndexComputed = false;
  let lastAnchorForObserve = void 0;
  let lastFloatingForObserve = void 0;
  let cancelAutoUpdate = noop;
  const autoUpdateOptions = getAutoUpdateOptions(options.listeners);
  function syncAutoUpdateObservers() {
    if (!options.listeners) return;
    const anchor = resolveAnchor();
    const reference = resolveReference();
    const floating = resolveFloating();
    if (!reference || !floating) return;
    const anchorChanged = anchorIdentity(anchor) !== anchorIdentity(lastAnchorForObserve);
    const floatingChanged = floating !== lastFloatingForObserve;
    if (anchorChanged || floatingChanged) {
      cancelAutoUpdate();
      lastAnchorForObserve = anchor;
      lastFloatingForObserve = floating;
      cancelAutoUpdate = autoUpdate(reference, floating, runUpdate, autoUpdateOptions);
    }
  }
  async function updatePosition() {
    syncAutoUpdateObservers();
    const floating = resolveFloating();
    if (!floating) return;
    if (floating !== cachedMiddlewareFloating) {
      rebuildMiddlewareForFloating(floating);
      zIndexComputed = false;
    }
    const reference = resolveReference();
    if (!reference) return;
    const pos = await computePosition2(reference, floating, {
      placement,
      middleware,
      strategy
    });
    const win = getWindow(floating);
    const x = roundByDpr(win, pos.x);
    const y = roundByDpr(win, pos.y);
    onComplete?.({
      ...pos,
      x,
      y
    });
    if (options.applyStyles === false) return;
    if (!isApproximatelyEqual(lastX, x)) {
      floating.style.setProperty("--x", `${x}px`);
      lastX = x;
    }
    if (!isApproximatelyEqual(lastY, y)) {
      floating.style.setProperty("--y", `${y}px`);
      lastY = y;
    }
    if (options.hideWhenDetached) {
      const isHidden = pos.middlewareData.hide?.referenceHidden;
      if (isHidden) {
        floating.style.setProperty("visibility", "hidden");
        floating.style.setProperty("pointer-events", "none");
      } else {
        floating.style.removeProperty("visibility");
        floating.style.removeProperty("pointer-events");
      }
    }
    if (!zIndexComputed) {
      const contentEl = floating.firstElementChild;
      if (contentEl) {
        floating.style.setProperty("--z-index", getComputedStyle2(contentEl).zIndex);
        zIndexComputed = true;
      }
    }
  }
  async function runUpdate() {
    if (opts.updatePosition) {
      await opts.updatePosition({
        updatePosition,
        floatingElement: resolveFloating()
      });
      onPositioned?.({
        placed: true
      });
    } else {
      await updatePosition();
    }
  }
  runUpdate();
  return () => {
    cancelAutoUpdate();
    restoreArrowStyles?.();
    restoreFloatingStyles?.();
    onPositioned?.({
      placed: false
    });
  };
}
function getPlacement(referenceOrFn, floatingOrFn, opts = {}) {
  const { defer, ...options } = opts;
  const func = defer ? raf : (v) => v();
  const cleanups = [];
  cleanups.push(func(() => {
    cleanups.push(getPlacementImpl(referenceOrFn, floatingOrFn, options));
  }));
  return () => {
    cleanups.forEach((fn) => fn?.());
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/popper/1.43.0/dist/get-styles.mjs
var ARROW_FLOATING_STYLE = {
  bottom: "rotate(45deg)",
  left: "rotate(135deg)",
  top: "rotate(225deg)",
  right: "rotate(315deg)"
};
function getPlacementStyles(options = {}) {
  const { placement, sameWidth, fitViewport, strategy = "absolute" } = options;
  return {
    arrow: {
      position: "absolute",
      width: cssVars.arrowSize.reference,
      height: cssVars.arrowSize.reference,
      [cssVars.arrowSizeHalf.variable]: `calc(${cssVars.arrowSize.reference} / 2)`,
      [cssVars.arrowOffset.variable]: `calc(${cssVars.arrowSizeHalf.reference} * -1)`
    },
    arrowTip: {
      // @ts-expect-error - Fix this
      transform: placement ? ARROW_FLOATING_STYLE[placement.split("-")[0]] : void 0,
      background: cssVars.arrowBg.reference,
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      position: "absolute",
      zIndex: "inherit"
    },
    floating: {
      position: strategy,
      isolation: "isolate",
      minWidth: sameWidth ? void 0 : "max-content",
      width: sameWidth ? "var(--reference-width)" : void 0,
      maxWidth: fitViewport ? "var(--available-width)" : void 0,
      maxHeight: fitViewport ? "var(--available-height)" : void 0,
      pointerEvents: !placement ? "none" : void 0,
      top: "0px",
      left: "0px",
      // move off-screen if placement is not defined
      transform: placement ? "translate3d(var(--x), var(--y), 0)" : "translate3d(0, -100vh, 0)",
      zIndex: "var(--z-index)"
    }
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/combobox/1.43.0/dist/combobox.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `combobox:${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `combobox:${ctx.id}:label`;
var getControlId = (ctx) => ctx.ids?.control ?? `combobox:${ctx.id}:control`;
var getInputId = (ctx) => ctx.ids?.input ?? `combobox:${ctx.id}:input`;
var getContentId = (ctx) => ctx.ids?.content ?? `combobox:${ctx.id}:content`;
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `combobox:${ctx.id}:popper`;
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `combobox:${ctx.id}:toggle-btn`;
var getClearTriggerId = (ctx) => ctx.ids?.clearTrigger ?? `combobox:${ctx.id}:clear-btn`;
var getItemGroupId = (ctx, id) => ctx.ids?.itemGroup?.(id) ?? `combobox:${ctx.id}:optgroup:${id}`;
var getItemGroupLabelId = (ctx, id) => ctx.ids?.itemGroupLabel?.(id) ?? `combobox:${ctx.id}:optgroup-label:${id}`;
var getItemId = (ctx, id) => ctx.ids?.item?.(id) ?? `combobox:${ctx.id}:option:${id}`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getClearTriggerEl = (ctx) => ctx.getById(getClearTriggerId(ctx));
var getItemEl = (ctx, value) => {
  if (value == null) return null;
  const selector = `[role=option][data-value="${CSS.escape(value)}"]`;
  return query(getContentEl(ctx), selector);
};
var focusInputEl = (ctx) => {
  const inputEl = getInputEl(ctx);
  if (!ctx.isActiveElement(inputEl)) {
    inputEl?.focus({
      preventScroll: true
    });
  }
  setCaretToEnd(inputEl);
};
var focusTriggerEl = (ctx) => {
  const triggerEl = getTriggerEl(ctx);
  if (ctx.isActiveElement(triggerEl)) return;
  triggerEl?.focus({
    preventScroll: true
  });
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/combobox/1.43.0/dist/combobox.connect.mjs
function connect(service, normalize) {
  const { context, prop, state: state2, send, scope, computed, event } = service;
  const translations = prop("translations");
  const collection4 = prop("collection");
  const disabled = !!prop("disabled");
  const interactive = computed("isInteractive");
  const invalid = !!prop("invalid");
  const required = !!prop("required");
  const readOnly = !!prop("readOnly");
  const open = state2.hasTag("open");
  const focused = state2.hasTag("focused");
  const composite = prop("composite");
  const highlightedValue = context.get("highlightedValue");
  const currentPlacement = context.get("currentPlacement");
  const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : void 0;
  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement
  });
  function getItemState(props6) {
    const itemDisabled = collection4.getItemDisabled(props6.item);
    const value = collection4.getItemValue(props6.item);
    ensure(value, () => `[zag-js] No value found for item ${JSON.stringify(props6.item)}`);
    return {
      value,
      disabled: Boolean(disabled || itemDisabled),
      highlighted: highlightedValue === value,
      selected: context.get("value").includes(value)
    };
  }
  return {
    focused,
    open,
    inputValue: context.get("inputValue"),
    highlightedValue,
    highlightedItem: context.get("highlightedItem"),
    value: context.get("value"),
    valueAsString: computed("valueAsString"),
    hasSelectedItems: computed("hasSelectedItems"),
    selectedItems: computed("selectedItems"),
    collection: prop("collection"),
    multiple: !!prop("multiple"),
    disabled: !!disabled,
    syncSelectedItems() {
      send({
        type: "SELECTED_ITEMS.SYNC"
      });
    },
    reposition(options = {}) {
      send({
        type: "POSITIONING.SET",
        options
      });
    },
    setHighlightValue(value) {
      send({
        type: "HIGHLIGHTED_VALUE.SET",
        value
      });
    },
    clearHighlightValue() {
      send({
        type: "HIGHLIGHTED_VALUE.CLEAR"
      });
    },
    selectValue(value) {
      send({
        type: "ITEM.SELECT",
        value
      });
    },
    setValue(value) {
      send({
        type: "VALUE.SET",
        value
      });
    },
    setInputValue(value, reason = "script") {
      send({
        type: "INPUT_VALUE.SET",
        value,
        src: reason
      });
    },
    clearValue(value) {
      if (value != null) {
        send({
          type: "ITEM.CLEAR",
          value
        });
      } else {
        send({
          type: "VALUE.CLEAR"
        });
      }
    },
    focus() {
      getInputEl(scope)?.focus();
    },
    setOpen(nextOpen, reason = "script") {
      const open2 = state2.hasTag("open");
      if (open2 === nextOpen) return;
      send({
        type: nextOpen ? "OPEN" : "CLOSE",
        src: reason
      });
    },
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: prop("dir"),
        id: getRootId(scope),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly)
      });
    },
    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: prop("dir"),
        htmlFor: getInputId(scope),
        id: getLabelId(scope),
        "data-readonly": dataAttr(readOnly),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-required": dataAttr(required),
        "data-focus": dataAttr(focused),
        onClick(event2) {
          if (composite) return;
          event2.preventDefault();
          getTriggerEl(scope)?.focus({
            preventScroll: true
          });
        }
      });
    },
    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: prop("dir"),
        id: getControlId(scope),
        "data-state": open ? "open" : "closed",
        "data-focus": dataAttr(focused),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid)
      });
    },
    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        dir: prop("dir"),
        id: getPositionerId(scope),
        style: popperStyles.floating
      });
    },
    getInputProps() {
      return normalize.input({
        ...parts.input.attrs,
        dir: prop("dir"),
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        "data-autofocus": dataAttr(prop("autoFocus")),
        name: prop("name"),
        form: prop("form"),
        disabled,
        required: prop("required"),
        autoComplete: "off",
        autoCorrect: "off",
        autoCapitalize: "none",
        spellCheck: "false",
        readOnly,
        placeholder: prop("placeholder"),
        id: getInputId(scope),
        type: "text",
        role: "combobox",
        defaultValue: context.get("inputValue"),
        "aria-autocomplete": computed("autoComplete") ? "both" : "list",
        "aria-controls": getContentId(scope),
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        "aria-activedescendant": highlightedValue ? getItemId(scope, highlightedValue) : void 0,
        onClick(event2) {
          if (event2.defaultPrevented) return;
          if (!prop("openOnClick")) return;
          if (!interactive) return;
          send({
            type: "INPUT.CLICK",
            src: "input-click"
          });
        },
        onFocus() {
          if (disabled) return;
          send({
            type: "INPUT.FOCUS"
          });
        },
        onBlur() {
          if (disabled) return;
          send({
            type: "INPUT.BLUR"
          });
        },
        onChange(event2) {
          send({
            type: "INPUT.CHANGE",
            value: event2.currentTarget.value,
            src: "input-change"
          });
        },
        onKeyDown(event2) {
          if (event2.defaultPrevented) return;
          if (!interactive) return;
          if (event2.ctrlKey || event2.shiftKey || isComposingEvent(event2)) return;
          const openOnKeyPress = prop("openOnKeyPress");
          const isModifierKey = event2.ctrlKey || event2.metaKey || event2.shiftKey;
          const keypress = true;
          const keymap = {
            ArrowDown(event3) {
              if (!openOnKeyPress && !open) return;
              send({
                type: event3.altKey ? "OPEN" : "INPUT.ARROW_DOWN",
                keypress,
                src: "arrow-key"
              });
              event3.preventDefault();
            },
            ArrowUp() {
              if (!openOnKeyPress && !open) return;
              send({
                type: event2.altKey ? "CLOSE" : "INPUT.ARROW_UP",
                keypress,
                src: "arrow-key"
              });
              event2.preventDefault();
            },
            Home(event3) {
              if (isModifierKey) return;
              send({
                type: "INPUT.HOME",
                keypress
              });
              if (open) {
                event3.preventDefault();
              }
            },
            End(event3) {
              if (isModifierKey) return;
              send({
                type: "INPUT.END",
                keypress
              });
              if (open) {
                event3.preventDefault();
              }
            },
            Enter(event3) {
              send({
                type: "INPUT.ENTER",
                keypress,
                src: "item-select"
              });
              const hasHighlight = highlightedValue != null;
              const alwaysSubmit = prop("alwaysSubmitOnEnter");
              const willBeRejected = computed("isCustomValue") && !prop("allowCustomValue");
              if (open && !alwaysSubmit && (hasHighlight || willBeRejected)) {
                event3.preventDefault();
              }
              if (highlightedValue == null) return;
              const itemEl = getItemEl(scope, highlightedValue);
              if (isAnchorElement(itemEl)) {
                prop("navigate")?.({
                  value: highlightedValue,
                  node: itemEl,
                  href: itemEl.href
                });
              }
            },
            Escape() {
              send({
                type: "INPUT.ESCAPE",
                keypress,
                src: "escape-key"
              });
              event2.preventDefault();
            }
          };
          const key = getEventKey(event2, {
            dir: prop("dir")
          });
          const exec = keymap[key];
          exec?.(event2);
        }
      });
    },
    getTriggerProps(props6 = {}) {
      return normalize.button({
        ...parts.trigger.attrs,
        dir: prop("dir"),
        id: getTriggerId(scope),
        "aria-haspopup": composite ? "listbox" : "dialog",
        type: "button",
        tabIndex: props6.focusable ? void 0 : -1,
        "aria-label": translations.triggerLabel,
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        "aria-controls": open ? getContentId(scope) : void 0,
        disabled,
        "data-invalid": dataAttr(invalid),
        "data-focusable": dataAttr(props6.focusable),
        "data-readonly": dataAttr(readOnly),
        "data-disabled": dataAttr(disabled),
        onFocus() {
          if (!props6.focusable) return;
          send({
            type: "INPUT.FOCUS",
            src: "trigger"
          });
        },
        onClick(event2) {
          if (event2.defaultPrevented) return;
          if (!interactive) return;
          if (!isLeftClick(event2)) return;
          send({
            type: "TRIGGER.CLICK",
            src: "trigger-click"
          });
        },
        onPointerDown(event2) {
          if (!interactive) return;
          if (event2.pointerType === "touch") return;
          if (!isLeftClick(event2)) return;
          event2.preventDefault();
          queueMicrotask(() => {
            focusInputEl(scope);
          });
        },
        onKeyDown(event2) {
          if (event2.defaultPrevented) return;
          if (composite) return;
          const keyMap2 = {
            ArrowDown() {
              send({
                type: "INPUT.ARROW_DOWN",
                src: "arrow-key"
              });
            },
            ArrowUp() {
              send({
                type: "INPUT.ARROW_UP",
                src: "arrow-key"
              });
            }
          };
          const key = getEventKey(event2, {
            dir: prop("dir")
          });
          const exec = keyMap2[key];
          if (exec) {
            exec(event2);
            event2.preventDefault();
          }
        }
      });
    },
    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        dir: prop("dir"),
        id: getContentId(scope),
        role: !composite ? "dialog" : "listbox",
        tabIndex: -1,
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-placement": currentPlacement,
        "data-side": currentPlacementSide,
        "aria-labelledby": getLabelId(scope),
        "aria-multiselectable": prop("multiple") && composite ? true : void 0,
        "data-empty": dataAttr(collection4.size === 0),
        onPointerDown(event2) {
          if (!isLeftClick(event2)) return;
          event2.preventDefault();
        }
      });
    },
    getListProps() {
      return normalize.element({
        ...parts.list.attrs,
        role: !composite ? "listbox" : void 0,
        "data-empty": dataAttr(collection4.size === 0),
        "aria-labelledby": getLabelId(scope),
        "aria-multiselectable": prop("multiple") && !composite ? true : void 0
      });
    },
    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        dir: prop("dir"),
        id: getClearTriggerId(scope),
        type: "button",
        tabIndex: -1,
        disabled,
        "data-invalid": dataAttr(invalid),
        "aria-label": translations.clearTriggerLabel,
        "aria-controls": getInputId(scope),
        hidden: !context.get("value").length,
        onPointerDown(event2) {
          if (!isLeftClick(event2)) return;
          event2.preventDefault();
        },
        onClick(event2) {
          if (event2.defaultPrevented) return;
          if (!interactive) return;
          send({
            type: "VALUE.CLEAR",
            src: "clear-trigger"
          });
        }
      });
    },
    getItemState,
    getItemProps(props6) {
      const itemState = getItemState(props6);
      const value = itemState.value;
      return normalize.element({
        ...parts.item.attrs,
        dir: prop("dir"),
        id: getItemId(scope, value),
        role: "option",
        tabIndex: -1,
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-state": itemState.selected ? "checked" : "unchecked",
        "aria-selected": ariaAttr(itemState.selected),
        "aria-disabled": ariaAttr(itemState.disabled),
        "data-disabled": dataAttr(itemState.disabled),
        "data-value": itemState.value,
        onPointerMove() {
          if (itemState.disabled) return;
          if (itemState.highlighted) return;
          send({
            type: "ITEM.POINTER_MOVE",
            value
          });
        },
        onPointerLeave() {
          if (props6.persistFocus) return;
          if (itemState.disabled) return;
          const prev = event.previous();
          const mouseMoved = prev?.type.includes("POINTER");
          if (!mouseMoved) return;
          send({
            type: "ITEM.POINTER_LEAVE",
            value
          });
        },
        onClick(event2) {
          if (isDownloadingEvent(event2)) return;
          if (isOpeningInNewTab(event2)) return;
          if (isContextMenuEvent(event2)) return;
          if (itemState.disabled) return;
          send({
            type: "ITEM.CLICK",
            src: "item-select",
            value
          });
        }
      });
    },
    getItemTextProps(props6) {
      const itemState = getItemState(props6);
      return normalize.element({
        ...parts.itemText.attrs,
        dir: prop("dir"),
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted)
      });
    },
    getItemIndicatorProps(props6) {
      const itemState = getItemState(props6);
      return normalize.element({
        "aria-hidden": true,
        ...parts.itemIndicator.attrs,
        dir: prop("dir"),
        "data-state": itemState.selected ? "checked" : "unchecked",
        hidden: !itemState.selected
      });
    },
    getItemGroupProps(props6) {
      const { id } = props6;
      return normalize.element({
        ...parts.itemGroup.attrs,
        dir: prop("dir"),
        id: getItemGroupId(scope, id),
        "aria-labelledby": getItemGroupLabelId(scope, id),
        "data-empty": dataAttr(collection4.size === 0),
        role: "group"
      });
    },
    getItemGroupLabelProps(props6) {
      const { htmlFor } = props6;
      return normalize.element({
        ...parts.itemGroupLabel.attrs,
        dir: prop("dir"),
        id: getItemGroupLabelId(scope, htmlFor),
        role: "presentation"
      });
    }
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/interact-outside/1.43.0/dist/frame-utils.mjs
function getWindowFrames(win) {
  const frames = {
    each(cb) {
      for (let i = 0; i < win.frames?.length; i += 1) {
        const frame = win.frames[i];
        if (frame) cb(frame);
      }
    },
    addEventListener(event, listener, options) {
      frames.each((frame) => {
        try {
          frame.document.addEventListener(event, listener, options);
        } catch {
        }
      });
      return () => {
        try {
          frames.removeEventListener(event, listener, options);
        } catch {
        }
      };
    },
    removeEventListener(event, listener, options) {
      frames.each((frame) => {
        try {
          frame.document.removeEventListener(event, listener, options);
        } catch {
        }
      });
    }
  };
  return frames;
}
function getParentWindow(win) {
  const parent = win.frameElement != null ? win.parent : null;
  return {
    addEventListener: (event, listener, options) => {
      try {
        parent?.addEventListener(event, listener, options);
      } catch {
      }
      return () => {
        try {
          parent?.removeEventListener(event, listener, options);
        } catch {
        }
      };
    },
    removeEventListener: (event, listener, options) => {
      try {
        parent?.removeEventListener(event, listener, options);
      } catch {
      }
    }
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/interact-outside/1.43.0/dist/index.mjs
var POINTER_OUTSIDE_EVENT = "pointerdown.outside";
var FOCUS_OUTSIDE_EVENT = "focus.outside";
function isComposedPathFocusable(composedPath) {
  for (const node of composedPath) {
    if (isHTMLElement(node) && isFocusable(node)) return true;
  }
  return false;
}
var isPointerEvent = (event) => "clientY" in event;
function isEventPointWithin(node, event) {
  if (!isPointerEvent(event) || !node) return false;
  const rect = node.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  return rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
}
function isPointInRect(rect, point) {
  return rect.y <= point.y && point.y <= rect.y + rect.height && rect.x <= point.x && point.x <= rect.x + rect.width;
}
function isEventWithinScrollbar(event, ancestor) {
  if (!ancestor || !isPointerEvent(event)) return false;
  const isScrollableY = ancestor.scrollHeight > ancestor.clientHeight;
  const onScrollbarY = isScrollableY && event.clientX > ancestor.offsetLeft + ancestor.clientWidth;
  const isScrollableX = ancestor.scrollWidth > ancestor.clientWidth;
  const onScrollbarX = isScrollableX && event.clientY > ancestor.offsetTop + ancestor.clientHeight;
  const rect = {
    x: ancestor.offsetLeft,
    y: ancestor.offsetTop,
    width: ancestor.clientWidth + (isScrollableY ? 16 : 0),
    height: ancestor.clientHeight + (isScrollableX ? 16 : 0)
  };
  const point = {
    x: event.clientX,
    y: event.clientY
  };
  if (!isPointInRect(rect, point)) return false;
  return onScrollbarY || onScrollbarX;
}
function trackInteractOutsideImpl(node, options) {
  const { exclude, onFocusOutside, onPointerDownOutside, onInteractOutside, defer, followControlledElements = true } = options;
  if (!node) return;
  const doc = getDocument(node);
  const win = getWindow(node);
  const frames = getWindowFrames(win);
  const parentWin = getParentWindow(win);
  function isEventOutside(event, target) {
    if (!isHTMLElement(target)) return false;
    if (!target.isConnected) return false;
    if (contains(node, target)) return false;
    if (isEventPointWithin(node, event)) return false;
    if (followControlledElements && isControlledElement(node, target)) return false;
    const triggerEl = doc.querySelector(`[aria-controls="${node.id}"]`);
    if (triggerEl) {
      const triggerAncestor = getNearestOverflowAncestor(triggerEl);
      if (isEventWithinScrollbar(event, triggerAncestor)) return false;
    }
    const nodeAncestor = getNearestOverflowAncestor(node);
    if (isEventWithinScrollbar(event, nodeAncestor)) return false;
    return !exclude?.(target);
  }
  const pointerdownCleanups = /* @__PURE__ */ new Set();
  const isInShadowRoot = isShadowRoot(node?.getRootNode());
  let isPointerDown = false;
  function onPointerDown(event) {
    isPointerDown = true;
    const onPointerUp = () => {
      isPointerDown = false;
    };
    doc.addEventListener("pointerup", onPointerUp, {
      once: true
    });
    win.addEventListener("pointerup", onPointerUp, {
      once: true
    });
    function handler(clickEvent) {
      const func = defer && !isTouchDevice() ? raf : (v) => v();
      const evt = clickEvent ?? event;
      const composedPath = evt?.composedPath?.() ?? [
        evt?.target
      ];
      func(() => {
        const target = isInShadowRoot ? composedPath[0] : getEventTarget(event);
        if (!node || !isEventOutside(event, target)) return;
        if (onPointerDownOutside || onInteractOutside) {
          const handler2 = callAll(onPointerDownOutside, onInteractOutside);
          node.addEventListener(POINTER_OUTSIDE_EVENT, handler2, {
            once: true
          });
        }
        fireCustomEvent(node, POINTER_OUTSIDE_EVENT, {
          bubbles: false,
          cancelable: true,
          detail: {
            originalEvent: evt,
            contextmenu: isContextMenuEvent(evt),
            focusable: isComposedPathFocusable(composedPath),
            target
          }
        });
      });
    }
    if (event.pointerType === "touch") {
      pointerdownCleanups.forEach((fn) => fn());
      pointerdownCleanups.add(addDomEvent(doc, "click", handler, {
        once: true
      }));
      pointerdownCleanups.add(parentWin.addEventListener("click", handler, {
        once: true
      }));
      pointerdownCleanups.add(frames.addEventListener("click", handler, {
        once: true
      }));
    } else {
      handler();
    }
  }
  const cleanups = /* @__PURE__ */ new Set();
  const timer = setTimeout(() => {
    cleanups.add(addDomEvent(doc, "pointerdown", onPointerDown, true));
    cleanups.add(parentWin.addEventListener("pointerdown", onPointerDown, true));
    cleanups.add(frames.addEventListener("pointerdown", onPointerDown, true));
  }, 0);
  function onFocusin(event) {
    if (isPointerDown) return;
    const func = defer ? raf : (v) => v();
    func(() => {
      const composedPath = event?.composedPath?.() ?? [
        event?.target
      ];
      const target = isInShadowRoot ? composedPath[0] : getEventTarget(event);
      if (!node || !isEventOutside(event, target)) return;
      if (onFocusOutside || onInteractOutside) {
        const handler = callAll(onFocusOutside, onInteractOutside);
        node.addEventListener(FOCUS_OUTSIDE_EVENT, handler, {
          once: true
        });
      }
      fireCustomEvent(node, FOCUS_OUTSIDE_EVENT, {
        bubbles: false,
        cancelable: true,
        detail: {
          originalEvent: event,
          contextmenu: false,
          focusable: isFocusable(target),
          target
        }
      });
    });
  }
  if (!isTouchDevice()) {
    cleanups.add(addDomEvent(doc, "focusin", onFocusin, true));
    cleanups.add(parentWin.addEventListener("focusin", onFocusin, true));
    cleanups.add(frames.addEventListener("focusin", onFocusin, true));
  }
  return () => {
    clearTimeout(timer);
    pointerdownCleanups.forEach((fn) => fn());
    cleanups.forEach((fn) => fn());
  };
}
function trackInteractOutside(nodeOrFn, options) {
  const { defer } = options;
  const func = defer ? raf : (v) => v();
  const cleanups = [];
  cleanups.push(func(() => {
    const node = typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn;
    cleanups.push(trackInteractOutsideImpl(node, options));
  }));
  return () => {
    cleanups.forEach((fn) => fn?.());
  };
}
function fireCustomEvent(el, type, init) {
  const win = el.ownerDocument.defaultView || window;
  const event = new win.CustomEvent(type, init);
  return el.dispatchEvent(event);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dismissable/1.43.0/dist/escape-keydown.mjs
function trackEscapeKeydown(node, fn) {
  const handleKeyDown = (event) => {
    if (event.key !== "Escape") return;
    if (event.isComposing) return;
    fn?.(event);
  };
  return addDomEvent(getDocument(node), "keydown", handleKeyDown, {
    capture: true
  });
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dismissable/1.43.0/dist/layer-stack.mjs
var LAYER_REQUEST_DISMISS_EVENT = "layer:request-dismiss";
var layerStack = {
  layers: [],
  branches: [],
  recentlyRemoved: /* @__PURE__ */ new Set(),
  count() {
    return this.layers.length;
  },
  pointerBlockingLayers() {
    return this.layers.filter((layer) => layer.pointerBlocking);
  },
  topMostPointerBlockingLayer() {
    return [
      ...this.pointerBlockingLayers()
    ].slice(-1)[0];
  },
  hasPointerBlockingLayer() {
    return this.pointerBlockingLayers().length > 0;
  },
  isBelowPointerBlockingLayer(node) {
    const index = this.indexOf(node);
    const highestBlockingIndex = this.topMostPointerBlockingLayer() ? this.indexOf(this.topMostPointerBlockingLayer()?.node) : -1;
    return index < highestBlockingIndex;
  },
  isTopMost(node) {
    const layer = this.layers[this.count() - 1];
    return layer?.node === node;
  },
  getNestedLayers(node) {
    return Array.from(this.layers).slice(this.indexOf(node) + 1);
  },
  getLayersByType(type) {
    return this.layers.filter((layer) => layer.type === type);
  },
  getNestedLayersByType(node, type) {
    const index = this.indexOf(node);
    if (index === -1) return [];
    return this.layers.slice(index + 1).filter((layer) => layer.type === type);
  },
  getParentLayerOfType(node, type) {
    const index = this.indexOf(node);
    if (index <= 0) return void 0;
    return this.layers.slice(0, index).reverse().find((layer) => layer.type === type);
  },
  countNestedLayersOfType(node, type) {
    return this.getNestedLayersByType(node, type).length;
  },
  isInNestedLayer(node, target) {
    const inNested = this.getNestedLayers(node).some((layer) => contains(layer.node, target));
    if (inNested) return true;
    if (this.recentlyRemoved.size > 0) return true;
    return false;
  },
  isInBranch(target) {
    return Array.from(this.branches).some((branch) => contains(branch, target));
  },
  add(layer) {
    const existingIndex = this.indexOf(layer.node);
    if (existingIndex !== -1) {
      this.layers.splice(existingIndex, 1);
    }
    this.layers.push(layer);
    this.syncLayers();
  },
  addBranch(node) {
    this.branches.push(node);
  },
  remove(node) {
    const index = this.indexOf(node);
    if (index < 0) return;
    const layer = this.layers[index];
    layer.styleTargets?.forEach((getTarget) => {
      const target = getTarget();
      if (target) {
        clearLayerStyleMirror(target);
      }
    });
    this.recentlyRemoved.add(node);
    nextTick(() => this.recentlyRemoved.delete(node));
    if (index < this.count() - 1) {
      const _layers = this.getNestedLayers(node);
      _layers.forEach((layer2) => layerStack.dismiss(layer2.node, node));
    }
    this.layers.splice(index, 1);
    this.syncLayers();
  },
  removeBranch(node) {
    const index = this.branches.indexOf(node);
    if (index >= 0) this.branches.splice(index, 1);
  },
  syncLayers() {
    this.layers.forEach((layer, index) => {
      applyLayerStackMetadata(layer, index, layer.node);
      layer.styleTargets?.forEach((getTarget) => {
        const target = getTarget();
        if (!target || target === layer.node) return;
        applyLayerStackMetadata(layer, index, target);
        const { zIndex } = getComputedStyle2(layer.node);
        target.style.setProperty("--z-index", zIndex);
      });
    });
  },
  indexOf(node) {
    return this.layers.findIndex((layer) => layer.node === node);
  },
  dismiss(node, parent) {
    const index = this.indexOf(node);
    if (index === -1) return;
    const layer = this.layers[index];
    addListenerOnce(node, LAYER_REQUEST_DISMISS_EVENT, (event) => {
      layer.requestDismiss?.(event);
      if (!event.defaultPrevented) {
        layer?.dismiss();
      }
    });
    fireCustomEvent2(node, LAYER_REQUEST_DISMISS_EVENT, {
      originalLayer: node,
      targetLayer: parent,
      originalIndex: index,
      targetIndex: parent ? this.indexOf(parent) : -1
    });
    this.syncLayers();
  },
  clear() {
    this.remove(this.layers[0].node);
  }
};
function applyLayerStackMetadata(layer, index, el) {
  el.style.setProperty("--layer-index", `${index}`);
  el.removeAttribute("data-nested");
  el.removeAttribute("data-has-nested");
  const parentOfSameType = layerStack.getParentLayerOfType(layer.node, layer.type);
  if (parentOfSameType) {
    el.setAttribute("data-nested", layer.type);
  }
  const nestedCount = layerStack.countNestedLayersOfType(layer.node, layer.type);
  if (nestedCount > 0) {
    el.setAttribute("data-has-nested", layer.type);
  }
  el.style.setProperty("--nested-layer-count", `${nestedCount}`);
}
function clearLayerStyleMirror(el) {
  el.style.removeProperty("--layer-index");
  el.style.removeProperty("--nested-layer-count");
  el.style.removeProperty("--z-index");
  el.removeAttribute("data-nested");
  el.removeAttribute("data-has-nested");
}
function fireCustomEvent2(el, type, detail) {
  const win = el.ownerDocument.defaultView || window;
  const event = new win.CustomEvent(type, {
    cancelable: true,
    bubbles: true,
    detail
  });
  return el.dispatchEvent(event);
}
function addListenerOnce(el, type, callback) {
  el.addEventListener(type, callback, {
    once: true
  });
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dismissable/1.43.0/dist/pointer-event-outside.mjs
var originalBodyPointerEvents = /* @__PURE__ */ new WeakMap();
var layerObservers = /* @__PURE__ */ new WeakMap();
function getDesiredPointerEvents(node) {
  return layerStack.isBelowPointerBlockingLayer(node) ? "none" : "auto";
}
function applyPointerEvents(node) {
  const desired = getDesiredPointerEvents(node);
  if (node.style.pointerEvents !== desired) {
    node.style.pointerEvents = desired;
  }
}
function ensurePointerEventsObserver(node) {
  if (layerObservers.has(node)) return;
  const win = getWindow(node);
  if (typeof win.MutationObserver === "undefined") return;
  const observer = new win.MutationObserver(() => {
    if (!layerObservers.has(node)) return;
    applyPointerEvents(node);
  });
  observer.observe(node, {
    attributes: true,
    attributeFilter: [
      "style"
    ]
  });
  layerObservers.set(node, observer);
}
function assignPointerEventToLayers() {
  layerStack.layers.forEach(({ node }) => {
    applyPointerEvents(node);
    ensurePointerEventsObserver(node);
  });
}
function clearPointerEvent(node) {
  const observer = layerObservers.get(node);
  if (observer) {
    observer.disconnect();
    layerObservers.delete(node);
  }
  node.style.pointerEvents = "";
}
function disablePointerEventsOutside(node, persistentElements) {
  const doc = getDocument(node);
  const cleanups = [];
  if (layerStack.hasPointerBlockingLayer() && !doc.body.hasAttribute("data-inert")) {
    originalBodyPointerEvents.set(doc.body, doc.body.style.pointerEvents);
    queueMicrotask(() => {
      const body = doc.body;
      if (!body) return;
      body.style.pointerEvents = "none";
      body.setAttribute("data-inert", "");
    });
  }
  persistentElements?.forEach((el) => {
    const [promise, abort] = waitForElement(() => {
      const node2 = el();
      return isHTMLElement(node2) ? node2 : null;
    }, {
      timeout: 1e3
    });
    promise.then((el2) => cleanups.push(setStyle(el2, {
      pointerEvents: "auto"
    })));
    cleanups.push(abort);
  });
  return () => {
    if (layerStack.hasPointerBlockingLayer()) return;
    queueMicrotask(() => {
      const body = doc.body;
      if (!body) return;
      const original = originalBodyPointerEvents.get(body);
      if (original !== void 0) {
        body.style.pointerEvents = original;
        originalBodyPointerEvents.delete(body);
      }
      body.removeAttribute("data-inert");
      if (body.style.length === 0) body.removeAttribute("style");
    });
    cleanups.forEach((fn) => fn());
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/dismissable/1.43.0/dist/dismissable-layer.mjs
function trackDismissableElementImpl(node, options) {
  const { warnOnMissingNode = true } = options;
  if (warnOnMissingNode && !node) {
    warn("[@zag-js/dismissable] node is `null` or `undefined`");
    return;
  }
  if (!node) {
    return;
  }
  const { onDismiss, onRequestDismiss, pointerBlocking, exclude: excludeContainers, debug, type = "dialog", layerStyleTargets } = options;
  const layer = {
    dismiss: onDismiss,
    node,
    type,
    pointerBlocking,
    requestDismiss: onRequestDismiss,
    styleTargets: layerStyleTargets
  };
  layerStack.add(layer);
  assignPointerEventToLayers();
  function onPointerDownOutside(event) {
    const target = getEventTarget(event.detail.originalEvent);
    if (layerStack.isBelowPointerBlockingLayer(node) || layerStack.isInBranch(target)) return;
    options.onPointerDownOutside?.(event);
    options.onInteractOutside?.(event);
    if (event.defaultPrevented) return;
    if (debug) {
      console.log("onPointerDownOutside:", event.detail.originalEvent);
    }
    onDismiss?.();
  }
  function onFocusOutside(event) {
    const target = getEventTarget(event.detail.originalEvent);
    if (layerStack.isInBranch(target)) return;
    options.onFocusOutside?.(event);
    options.onInteractOutside?.(event);
    if (event.defaultPrevented) return;
    if (debug) {
      console.log("onFocusOutside:", event.detail.originalEvent);
    }
    onDismiss?.();
  }
  function onEscapeKeyDown(event) {
    if (!layerStack.isTopMost(node)) return;
    options.onEscapeKeyDown?.(event);
    if (!event.defaultPrevented && onDismiss) {
      event.preventDefault();
      onDismiss();
    }
  }
  function exclude(target) {
    if (!node) return false;
    const containers = typeof excludeContainers === "function" ? excludeContainers() : excludeContainers;
    const _containers = Array.isArray(containers) ? containers : [
      containers
    ];
    const persistentElements = options.persistentElements?.map((fn) => fn()).filter(isHTMLElement);
    if (persistentElements) _containers.push(...persistentElements);
    return _containers.some((node2) => contains(node2, target)) || layerStack.isInNestedLayer(node, target);
  }
  const cleanups = [
    pointerBlocking ? disablePointerEventsOutside(node, options.persistentElements) : void 0,
    trackEscapeKeydown(node, onEscapeKeyDown),
    trackInteractOutside(node, {
      exclude,
      onFocusOutside,
      onPointerDownOutside,
      defer: options.defer
    })
  ];
  return () => {
    layerStack.remove(node);
    assignPointerEventToLayers();
    clearPointerEvent(node);
    cleanups.forEach((fn) => fn?.());
  };
}
function trackDismissableElement(nodeOrFn, options) {
  const { defer } = options;
  const func = defer ? raf : (v) => v();
  const cleanups = [];
  cleanups.push(func(() => {
    const node = isFunction(nodeOrFn) ? nodeOrFn() : nodeOrFn;
    cleanups.push(trackDismissableElementImpl(node, options));
  }));
  return () => {
    cleanups.forEach((fn) => fn?.());
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/focus-visible/1.43.0/dist/index.mjs
function isValidKey(e) {
  return !(e.metaKey || !isMac() && e.altKey || e.ctrlKey || e.key === "Control" || e.key === "Shift" || e.key === "Meta");
}
var nonTextInputTypes = /* @__PURE__ */ new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset"
]);
function isKeyboardFocusEvent(isTextInput, modality, e) {
  const eventTarget = e ? getEventTarget(e) : null;
  const doc = getDocument(eventTarget);
  const win = getWindow(eventTarget);
  const activeElement = getActiveElement(doc);
  isTextInput = isTextInput || activeElement instanceof win.HTMLInputElement && !nonTextInputTypes.has(activeElement?.type) || activeElement instanceof win.HTMLTextAreaElement || activeElement instanceof win.HTMLElement && activeElement.isContentEditable;
  return !(isTextInput && modality === "keyboard" && e instanceof win.KeyboardEvent && !Reflect.has(FOCUS_VISIBLE_INPUT_KEYS, e.key));
}
var currentModality = null;
var changeHandlers = /* @__PURE__ */ new Set();
var listenerMap = /* @__PURE__ */ new Map();
var hasEventBeforeFocus = false;
var hasBlurredWindowRecently = false;
var ignoreFocusEvent = false;
var FOCUS_VISIBLE_INPUT_KEYS = {
  Tab: true,
  Escape: true
};
function triggerChangeHandlers(modality, e) {
  for (let handler of changeHandlers) {
    handler(modality, e);
  }
}
function handleKeyboardEvent(e) {
  hasEventBeforeFocus = true;
  if (isValidKey(e)) {
    currentModality = "keyboard";
    triggerChangeHandlers("keyboard", e);
  }
}
function handlePointerEvent(e) {
  currentModality = "pointer";
  if (e.type === "mousedown" || e.type === "pointerdown") {
    hasEventBeforeFocus = true;
    triggerChangeHandlers("pointer", e);
  }
}
function handleClickEvent(e) {
  if (isVirtualClick(e)) {
    hasEventBeforeFocus = true;
    currentModality = "virtual";
  }
}
function handleFocusEvent(e) {
  const target = getEventTarget(e);
  if (target === getWindow(target) || target === getDocument(target) || ignoreFocusEvent || !e.isTrusted) {
    return;
  }
  if (!hasEventBeforeFocus && !hasBlurredWindowRecently) {
    currentModality = "virtual";
    triggerChangeHandlers("virtual", e);
  }
  hasEventBeforeFocus = false;
  hasBlurredWindowRecently = false;
}
function handleWindowBlur() {
  if (ignoreFocusEvent) return;
  hasEventBeforeFocus = false;
  hasBlurredWindowRecently = true;
}
function setupGlobalFocusEvents(root) {
  if (typeof window === "undefined" || listenerMap.get(getWindow(root))) {
    return;
  }
  const win = getWindow(root);
  const doc = getDocument(root);
  let focus = win.HTMLElement.prototype.focus;
  function patchedFocus() {
    hasEventBeforeFocus = true;
    focus.apply(this, arguments);
  }
  try {
    Object.defineProperty(win.HTMLElement.prototype, "focus", {
      configurable: true,
      value: patchedFocus
    });
  } catch {
  }
  doc.addEventListener("keydown", handleKeyboardEvent, true);
  doc.addEventListener("keyup", handleKeyboardEvent, true);
  doc.addEventListener("click", handleClickEvent, true);
  win.addEventListener("focus", handleFocusEvent, true);
  win.addEventListener("blur", handleWindowBlur, false);
  if (typeof win.PointerEvent !== "undefined") {
    doc.addEventListener("pointerdown", handlePointerEvent, true);
    doc.addEventListener("pointermove", handlePointerEvent, true);
    doc.addEventListener("pointerup", handlePointerEvent, true);
  } else {
    doc.addEventListener("mousedown", handlePointerEvent, true);
    doc.addEventListener("mousemove", handlePointerEvent, true);
    doc.addEventListener("mouseup", handlePointerEvent, true);
  }
  win.addEventListener("beforeunload", () => {
    tearDownWindowFocusTracking(root);
  }, {
    once: true
  });
  listenerMap.set(win, {
    focus
  });
}
var tearDownWindowFocusTracking = (root, loadListener) => {
  const win = getWindow(root);
  const doc = getDocument(root);
  if (loadListener) {
    doc.removeEventListener("DOMContentLoaded", loadListener);
  }
  const listenerData = listenerMap.get(win);
  if (!listenerData) {
    return;
  }
  try {
    Object.defineProperty(win.HTMLElement.prototype, "focus", {
      configurable: true,
      value: listenerData.focus
    });
  } catch {
  }
  doc.removeEventListener("keydown", handleKeyboardEvent, true);
  doc.removeEventListener("keyup", handleKeyboardEvent, true);
  doc.removeEventListener("click", handleClickEvent, true);
  win.removeEventListener("focus", handleFocusEvent, true);
  win.removeEventListener("blur", handleWindowBlur, false);
  if (typeof win.PointerEvent !== "undefined") {
    doc.removeEventListener("pointerdown", handlePointerEvent, true);
    doc.removeEventListener("pointermove", handlePointerEvent, true);
    doc.removeEventListener("pointerup", handlePointerEvent, true);
  } else {
    doc.removeEventListener("mousedown", handlePointerEvent, true);
    doc.removeEventListener("mousemove", handlePointerEvent, true);
    doc.removeEventListener("mouseup", handlePointerEvent, true);
  }
  listenerMap.delete(win);
};
function getInteractionModality() {
  return currentModality;
}
function setInteractionModality(modality) {
  currentModality = modality;
  triggerChangeHandlers(modality, null);
}
function isFocusVisible() {
  return currentModality === "keyboard" || currentModality === "virtual";
}
function trackFocusVisible(props6 = {}) {
  const { isTextInput, autoFocus, onChange, root } = props6;
  setupGlobalFocusEvents(root);
  onChange?.({
    isFocusVisible: autoFocus || isFocusVisible(),
    modality: currentModality
  });
  const handler = (modality, e) => {
    if (!isKeyboardFocusEvent(!!isTextInput, modality, e)) return;
    onChange?.({
      isFocusVisible: isFocusVisible(),
      modality
    });
  };
  changeHandlers.add(handler);
  return () => {
    changeHandlers.delete(handler);
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/live-region/1.43.0/dist/index.mjs
var ID = "__live-region__";
var DEBUG_ID = "__live-region-debug__";
var DEBUG_STYLES = "position:fixed;inset-inline:0;bottom:0;z-index:2147483647;padding:12px 16px;background:black;color:white;font-size:14px;line-height:20px;text-align:center;pointer-events:none;";
function createLiveRegion(opts = {}) {
  const { level = "polite", document: doc = document, root, delay: _delay = 0, debug = false } = opts;
  const win = doc.defaultView ?? window;
  const parent = root ?? doc.body;
  function getDebugRegion() {
    if (!debug) return;
    let region = doc.getElementById(DEBUG_ID);
    if (region) return region;
    region = doc.createElement("div");
    region.id = DEBUG_ID;
    region.dataset.liveAnnouncerDebug = "true";
    region.setAttribute("aria-hidden", "true");
    region.style.cssText = DEBUG_STYLES;
    parent.appendChild(region);
    return region;
  }
  function announce(message, delay) {
    const oldRegion = doc.getElementById(ID);
    oldRegion?.remove();
    delay = delay ?? _delay;
    const region = doc.createElement("span");
    region.id = ID;
    region.dataset.liveAnnouncer = "true";
    const role = level !== "assertive" ? "status" : "alert";
    region.setAttribute("aria-live", level);
    region.setAttribute("role", role);
    Object.assign(region.style, {
      border: "0",
      clip: "rect(0 0 0 0)",
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
      padding: "0",
      position: "absolute",
      width: "1px",
      whiteSpace: "nowrap",
      wordWrap: "normal"
    });
    parent.appendChild(region);
    win.setTimeout(() => {
      if (!region.isConnected) return;
      region.textContent = message;
      const debugRegion = getDebugRegion();
      if (debugRegion) debugRegion.textContent = message;
    }, delay);
  }
  function destroy() {
    const oldRegion = doc.getElementById(ID);
    oldRegion?.remove();
    const debugRegion = doc.getElementById(DEBUG_ID);
    debugRegion?.remove();
  }
  return {
    announce,
    destroy,
    toJSON() {
      return ID;
    }
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/combobox/1.43.0/dist/combobox.machine.mjs
var { guards, createMachine: createMachine2, choose } = setup();
var { and, not } = guards;
var machine = createMachine2({
  props({ props: props6 }) {
    return {
      loopFocus: true,
      openOnClick: false,
      defaultValue: [],
      defaultInputValue: "",
      closeOnSelect: !props6.multiple,
      allowCustomValue: false,
      alwaysSubmitOnEnter: false,
      inputBehavior: "none",
      selectionBehavior: props6.multiple ? "clear" : "replace",
      openOnKeyPress: true,
      openOnChange: true,
      composite: true,
      navigate({ node }) {
        clickIfLink(node);
      },
      collection: collection.empty(),
      ...props6,
      positioning: {
        placement: "bottom",
        sameWidth: true,
        ...props6.positioning
      },
      translations: {
        triggerLabel: "Toggle suggestions",
        clearTriggerLabel: "Clear value",
        ...props6.translations
      }
    };
  },
  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen");
    return open ? "open.suggesting" : "closed.idle";
  },
  context({ prop, bindable: bindable2, getContext, getEvent }) {
    const initialValue = prop("value") ?? prop("defaultValue") ?? [];
    const initialSelectedItems = prop("collection").findMany(initialValue);
    return {
      currentPlacement: bindable2(() => ({
        defaultValue: void 0
      })),
      value: bindable2(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        isEqual,
        hash(value) {
          return value.join(",");
        },
        onChange(value) {
          const context = getContext();
          const collection22 = prop("collection");
          const selectedItemMap = context.get("selectedItemMap");
          const proposed = deriveSelectionState({
            values: value,
            collection: collection22,
            selectedItemMap
          });
          const effectiveValue = prop("value") ?? value;
          const effective = effectiveValue === value ? proposed : deriveSelectionState({
            values: effectiveValue,
            collection: collection22,
            selectedItemMap: proposed.nextSelectedItemMap
          });
          context.set("selectedItemMap", effective.nextSelectedItemMap);
          prop("onValueChange")?.({
            value,
            items: proposed.selectedItems
          });
        }
      })),
      highlightedValue: bindable2(() => ({
        defaultValue: prop("defaultHighlightedValue") || null,
        value: prop("highlightedValue"),
        onChange(value) {
          const item = prop("collection").find(value);
          prop("onHighlightChange")?.({
            highlightedValue: value,
            highlightedItem: item
          });
        }
      })),
      inputValue: bindable2(() => {
        let inputValue = prop("inputValue") || prop("defaultInputValue");
        const value = prop("value") || prop("defaultValue");
        if (!inputValue.trim() && !prop("multiple")) {
          const valueAsString = prop("collection").stringifyMany(value);
          inputValue = match(prop("selectionBehavior"), {
            preserve: inputValue || valueAsString,
            replace: valueAsString,
            clear: ""
          });
        }
        return {
          defaultValue: inputValue,
          value: prop("inputValue"),
          onChange(value2) {
            const event = getEvent();
            const reason = (event.previousEvent || event).src;
            prop("onInputValueChange")?.({
              inputValue: value2,
              reason
            });
          }
        };
      }),
      highlightedItem: bindable2(() => {
        const highlightedValue = prop("highlightedValue");
        const highlightedItem = prop("collection").find(highlightedValue);
        return {
          defaultValue: highlightedItem
        };
      }),
      selectedItemMap: bindable2(() => {
        return {
          defaultValue: createSelectedItemMap({
            selectedItems: initialSelectedItems,
            collection: prop("collection")
          })
        };
      })
    };
  },
  computed: {
    isInputValueEmpty: ({ context }) => context.get("inputValue").length === 0,
    isInteractive: ({ prop }) => !(prop("readOnly") || prop("disabled")),
    autoComplete: ({ prop }) => prop("inputBehavior") === "autocomplete",
    autoHighlight: ({ prop }) => prop("inputBehavior") === "autohighlight",
    hasSelectedItems: ({ context }) => context.get("value").length > 0,
    selectedItems: ({ context, prop }) => resolveSelectedItems({
      values: context.get("value"),
      collection: prop("collection"),
      selectedItemMap: context.get("selectedItemMap")
    }),
    valueAsString: ({ computed, prop }) => prop("collection").stringifyItems(computed("selectedItems")),
    isCustomValue: ({ context, computed }) => context.get("inputValue") !== computed("valueAsString")
  },
  watch({ context, prop, track, action, send }) {
    track([
      () => context.hash("value")
    ], () => {
      action([
        "syncSelectedItems"
      ]);
    });
    track([
      () => context.get("inputValue")
    ], () => {
      action([
        "syncInputValue"
      ]);
    });
    track([
      () => context.get("highlightedValue")
    ], () => {
      action([
        "syncHighlightedItem",
        "autofillInputValue",
        "announceHighlightedItem"
      ]);
    });
    track([
      () => prop("open")
    ], () => {
      action([
        "toggleVisibility"
      ]);
    });
    track([
      () => prop("collection").toString()
    ], () => {
      send({
        type: "CHILDREN_CHANGE"
      });
    });
  },
  on: {
    "SELECTED_ITEMS.SYNC": {
      actions: [
        "syncSelectedItems"
      ]
    },
    "HIGHLIGHTED_VALUE.SET": {
      actions: [
        "setHighlightedValue"
      ]
    },
    "HIGHLIGHTED_VALUE.CLEAR": {
      actions: [
        "clearHighlightedValue"
      ]
    },
    "ITEM.SELECT": {
      actions: [
        "selectItem"
      ]
    },
    "ITEM.CLEAR": {
      actions: [
        "clearItem"
      ]
    },
    "VALUE.SET": {
      actions: [
        "setValue"
      ]
    },
    "INPUT_VALUE.SET": {
      actions: [
        "setInputValue"
      ]
    },
    "POSITIONING.SET": {
      actions: [
        "reposition"
      ]
    }
  },
  entry: choose([
    {
      guard: "autoFocus",
      actions: [
        "setInitialFocus"
      ]
    }
  ]),
  states: {
    closed: {
      tags: [
        "closed"
      ],
      initial: "idle",
      states: {
        idle: {
          tags: [
            "idle"
          ],
          entry: [
            "scrollContentToTop",
            "clearHighlightedValue"
          ],
          on: {
            "CONTROLLED.OPEN": {
              target: "open.interacting"
            },
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: [
                  "setInitialFocus",
                  "highlightFirstSelectedItem",
                  "invokeOnOpen"
                ]
              },
              {
                target: "open.interacting",
                actions: [
                  "setInitialFocus",
                  "highlightFirstSelectedItem",
                  "invokeOnOpen"
                ]
              }
            ],
            "INPUT.CLICK": [
              {
                guard: "isOpenControlled",
                actions: [
                  "highlightFirstSelectedItem",
                  "invokeOnOpen"
                ]
              },
              {
                target: "open.interacting",
                actions: [
                  "highlightFirstSelectedItem",
                  "invokeOnOpen"
                ]
              }
            ],
            "INPUT.FOCUS": {
              target: "focused"
            },
            OPEN: [
              {
                guard: "isOpenControlled",
                actions: [
                  "invokeOnOpen"
                ]
              },
              {
                target: "open.interacting",
                actions: [
                  "invokeOnOpen"
                ]
              }
            ],
            "VALUE.CLEAR": {
              target: "focused",
              actions: [
                "clearInputValue",
                "clearSelectedItems",
                "setInitialFocus"
              ]
            }
          }
        },
        focused: {
          tags: [
            "focused"
          ],
          entry: [
            "scrollContentToTop",
            "clearHighlightedValue"
          ],
          on: {
            "CONTROLLED.OPEN": [
              {
                guard: "isChangeEvent",
                target: "open.suggesting"
              },
              {
                target: "open.interacting"
              }
            ],
            "INPUT.CHANGE": [
              {
                guard: and("isOpenControlled", "openOnChange"),
                actions: [
                  "setInputValue",
                  "invokeOnOpen",
                  "highlightFirstItemIfNeeded"
                ]
              },
              {
                guard: "openOnChange",
                target: "open.suggesting",
                actions: [
                  "setInputValue",
                  "invokeOnOpen",
                  "highlightFirstItemIfNeeded"
                ]
              },
              {
                actions: [
                  "setInputValue"
                ]
              }
            ],
            "LAYER.INTERACT_OUTSIDE": {
              target: "idle"
            },
            "INPUT.ESCAPE": {
              guard: and("isCustomValue", not("allowCustomValue")),
              actions: [
                "revertInputValue"
              ]
            },
            "INPUT.BLUR": {
              target: "idle"
            },
            "INPUT.CLICK": [
              {
                guard: "isOpenControlled",
                actions: [
                  "highlightFirstSelectedItem",
                  "invokeOnOpen"
                ]
              },
              {
                target: "open.interacting",
                actions: [
                  "highlightFirstSelectedItem",
                  "invokeOnOpen"
                ]
              }
            ],
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: [
                  "setInitialFocus",
                  "highlightFirstSelectedItem",
                  "invokeOnOpen"
                ]
              },
              {
                target: "open.interacting",
                actions: [
                  "setInitialFocus",
                  "highlightFirstSelectedItem",
                  "invokeOnOpen"
                ]
              }
            ],
            "INPUT.ARROW_DOWN": [
              // == group 1 ==
              {
                guard: and("isOpenControlled", "autoComplete"),
                actions: [
                  "invokeOnOpen"
                ]
              },
              {
                guard: "autoComplete",
                target: "open.interacting",
                actions: [
                  "invokeOnOpen"
                ]
              },
              // == group 2 ==
              {
                guard: "isOpenControlled",
                actions: [
                  "highlightFirstOrSelectedItem",
                  "invokeOnOpen"
                ]
              },
              {
                target: "open.interacting",
                actions: [
                  "highlightFirstOrSelectedItem",
                  "invokeOnOpen"
                ]
              }
            ],
            "INPUT.ARROW_UP": [
              // == group 1 ==
              {
                guard: and("isOpenControlled", "autoComplete"),
                actions: [
                  "invokeOnOpen"
                ]
              },
              {
                guard: "autoComplete",
                target: "open.interacting",
                actions: [
                  "invokeOnOpen"
                ]
              },
              // == group 2 ==
              {
                guard: "isOpenControlled",
                actions: [
                  "highlightLastOrSelectedItem",
                  "invokeOnOpen"
                ]
              },
              {
                target: "open.interacting",
                actions: [
                  "highlightLastOrSelectedItem",
                  "invokeOnOpen"
                ]
              }
            ],
            OPEN: [
              {
                guard: "isOpenControlled",
                actions: [
                  "invokeOnOpen"
                ]
              },
              {
                target: "open.interacting",
                actions: [
                  "invokeOnOpen"
                ]
              }
            ],
            "VALUE.CLEAR": {
              actions: [
                "clearInputValue",
                "clearSelectedItems"
              ]
            }
          }
        }
      }
    },
    open: {
      tags: [
        "open",
        "focused"
      ],
      entry: [
        "setInitialFocus"
      ],
      effects: [
        "trackFocusVisible",
        "scrollToHighlightedItem",
        "trackDismissableLayer",
        "trackPlacement",
        "trackLiveRegion"
      ],
      on: {
        "CONTROLLED.CLOSE": [
          {
            guard: "restoreFocus",
            target: "closed.focused",
            actions: [
              "setFinalFocus"
            ]
          },
          {
            target: "closed.idle"
          }
        ],
        "INPUT.ENTER": [
          // == group 1 ==
          {
            guard: and("isOpenControlled", "isCustomValue", not("hasHighlightedItem"), not("allowCustomValue")),
            actions: [
              "revertInputValue",
              "invokeOnClose"
            ]
          },
          {
            guard: and("isCustomValue", not("hasHighlightedItem"), not("allowCustomValue")),
            target: "closed.focused",
            actions: [
              "revertInputValue",
              "invokeOnClose"
            ]
          },
          // == group 2 ==
          {
            guard: and("isOpenControlled", "closeOnSelect"),
            actions: [
              "selectHighlightedItem",
              "invokeOnClose"
            ]
          },
          {
            guard: "closeOnSelect",
            target: "closed.focused",
            actions: [
              "selectHighlightedItem",
              "invokeOnClose",
              "setFinalFocus"
            ]
          },
          {
            actions: [
              "selectHighlightedItem"
            ]
          }
        ],
        "ITEM.CLICK": [
          {
            guard: and("isOpenControlled", "closeOnSelect"),
            actions: [
              "selectItem",
              "invokeOnClose"
            ]
          },
          {
            guard: "closeOnSelect",
            target: "closed.focused",
            actions: [
              "selectItem",
              "invokeOnClose",
              "setFinalFocus"
            ]
          },
          {
            actions: [
              "selectItem"
            ]
          }
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnClose"
            ]
          },
          {
            target: "closed.focused",
            actions: [
              "invokeOnClose"
            ]
          }
        ],
        "LAYER.INTERACT_OUTSIDE": [
          // == group 1 ==
          {
            guard: and("isOpenControlled", "isCustomValue", not("allowCustomValue")),
            actions: [
              "revertInputValue",
              "invokeOnClose"
            ]
          },
          {
            guard: and("isCustomValue", not("allowCustomValue")),
            target: "closed.idle",
            actions: [
              "revertInputValue",
              "invokeOnClose"
            ]
          },
          // == group 2 ==
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnClose"
            ]
          },
          {
            target: "closed.idle",
            actions: [
              "invokeOnClose"
            ]
          }
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnClose"
            ]
          },
          {
            target: "closed.focused",
            actions: [
              "invokeOnClose",
              "setFinalFocus"
            ]
          }
        ],
        "VALUE.CLEAR": [
          {
            guard: "isOpenControlled",
            actions: [
              "clearInputValue",
              "clearSelectedItems",
              "invokeOnClose"
            ]
          },
          {
            target: "closed.focused",
            actions: [
              "clearInputValue",
              "clearSelectedItems",
              "invokeOnClose",
              "setFinalFocus"
            ]
          }
        ]
      },
      initial: "interacting",
      states: {
        interacting: {
          on: {
            CHILDREN_CHANGE: [
              {
                guard: "isHighlightedItemRemoved",
                actions: [
                  "clearHighlightedValue"
                ]
              },
              {
                actions: [
                  "scrollToHighlightedItem"
                ]
              }
            ],
            "INPUT.HOME": {
              actions: [
                "highlightFirstItem"
              ]
            },
            "INPUT.END": {
              actions: [
                "highlightLastItem"
              ]
            },
            "INPUT.ARROW_DOWN": [
              {
                guard: and("autoComplete", "isLastItemHighlighted"),
                actions: [
                  "clearHighlightedValue",
                  "scrollContentToTop"
                ]
              },
              {
                actions: [
                  "highlightNextItem"
                ]
              }
            ],
            "INPUT.ARROW_UP": [
              {
                guard: and("autoComplete", "isFirstItemHighlighted"),
                actions: [
                  "clearHighlightedValue"
                ]
              },
              {
                actions: [
                  "highlightPrevItem"
                ]
              }
            ],
            "INPUT.CHANGE": [
              {
                guard: "autoComplete",
                target: "suggesting",
                actions: [
                  "setInputValue"
                ]
              },
              {
                target: "suggesting",
                actions: [
                  "clearHighlightedValue",
                  "setInputValue"
                ]
              }
            ],
            "ITEM.POINTER_MOVE": {
              actions: [
                "setHighlightedValue"
              ]
            },
            "ITEM.POINTER_LEAVE": {
              actions: [
                "clearHighlightedValue"
              ]
            },
            "LAYER.ESCAPE": [
              {
                guard: and("isOpenControlled", "autoComplete"),
                actions: [
                  "syncInputValue",
                  "invokeOnClose"
                ]
              },
              {
                guard: "autoComplete",
                target: "closed.focused",
                actions: [
                  "syncInputValue",
                  "invokeOnClose"
                ]
              },
              {
                guard: "isOpenControlled",
                actions: [
                  "invokeOnClose"
                ]
              },
              {
                target: "closed.focused",
                actions: [
                  "invokeOnClose",
                  "setFinalFocus"
                ]
              }
            ]
          }
        },
        suggesting: {
          on: {
            CHILDREN_CHANGE: [
              {
                guard: and("isHighlightedItemRemoved", "hasCollectionItems", "autoHighlight"),
                actions: [
                  "clearHighlightedValue",
                  "highlightFirstItem"
                ]
              },
              {
                guard: "isHighlightedItemRemoved",
                actions: [
                  "clearHighlightedValue"
                ]
              },
              {
                guard: "autoHighlight",
                actions: [
                  "highlightFirstItem"
                ]
              }
            ],
            "INPUT.ARROW_DOWN": {
              target: "interacting",
              actions: [
                "highlightNextItem"
              ]
            },
            "INPUT.ARROW_UP": {
              target: "interacting",
              actions: [
                "highlightPrevItem"
              ]
            },
            "INPUT.HOME": {
              target: "interacting",
              actions: [
                "highlightFirstItem"
              ]
            },
            "INPUT.END": {
              target: "interacting",
              actions: [
                "highlightLastItem"
              ]
            },
            "INPUT.CHANGE": {
              actions: [
                "setInputValue"
              ]
            },
            "LAYER.ESCAPE": [
              {
                guard: "isOpenControlled",
                actions: [
                  "invokeOnClose"
                ]
              },
              {
                target: "closed.focused",
                actions: [
                  "invokeOnClose"
                ]
              }
            ],
            "ITEM.POINTER_MOVE": {
              target: "interacting",
              actions: [
                "setHighlightedValue"
              ]
            },
            "ITEM.POINTER_LEAVE": {
              actions: [
                "clearHighlightedValue"
              ]
            }
          }
        }
      }
    }
  },
  implementations: {
    guards: {
      isInputValueEmpty: ({ computed }) => computed("isInputValueEmpty"),
      autoComplete: ({ computed, prop }) => computed("autoComplete") && !prop("multiple"),
      autoHighlight: ({ computed }) => computed("autoHighlight"),
      isFirstItemHighlighted: ({ prop, context }) => prop("collection").firstValue === context.get("highlightedValue"),
      isLastItemHighlighted: ({ prop, context }) => prop("collection").lastValue === context.get("highlightedValue"),
      isCustomValue: ({ computed }) => computed("isCustomValue"),
      allowCustomValue: ({ prop }) => !!prop("allowCustomValue"),
      hasHighlightedItem: ({ context }) => context.get("highlightedValue") != null,
      closeOnSelect: ({ prop }) => !!prop("closeOnSelect"),
      isOpenControlled: ({ prop }) => prop("open") != null,
      openOnChange: ({ prop, context }) => {
        const openOnChange = prop("openOnChange");
        if (isBoolean(openOnChange)) return openOnChange;
        return !!openOnChange?.({
          inputValue: context.get("inputValue")
        });
      },
      restoreFocus: ({ event }) => {
        const restoreFocus = event.restoreFocus ?? event.previousEvent?.restoreFocus;
        return restoreFocus == null ? true : !!restoreFocus;
      },
      isChangeEvent: ({ event }) => event.previousEvent?.type === "INPUT.CHANGE",
      autoFocus: ({ prop }) => !!prop("autoFocus"),
      isHighlightedItemRemoved: ({ prop, context }) => !prop("collection").has(context.get("highlightedValue")),
      hasCollectionItems: ({ prop }) => prop("collection").size > 0
    },
    effects: {
      trackFocusVisible({ scope }) {
        return trackFocusVisible({
          root: scope.getRootNode?.()
        });
      },
      trackDismissableLayer({ send, prop, scope }) {
        if (prop("disableLayer")) return;
        const contentEl = () => getContentEl(scope);
        return trackDismissableElement(contentEl, {
          type: "listbox",
          defer: true,
          exclude: () => [
            getInputEl(scope),
            getTriggerEl(scope),
            getClearTriggerEl(scope)
          ],
          onFocusOutside: prop("onFocusOutside"),
          onPointerDownOutside: prop("onPointerDownOutside"),
          onInteractOutside: prop("onInteractOutside"),
          onEscapeKeyDown(event) {
            event.preventDefault();
            event.stopPropagation();
            send({
              type: "LAYER.ESCAPE",
              src: "escape-key"
            });
          },
          onDismiss() {
            send({
              type: "LAYER.INTERACT_OUTSIDE",
              src: "interact-outside",
              restoreFocus: false
            });
          }
        });
      },
      trackLiveRegion({ refs, scope }) {
        const liveRegion = createLiveRegion({
          level: "assertive",
          document: scope.getDoc()
        });
        refs.set("liveRegion", liveRegion);
        return () => liveRegion.destroy();
      },
      trackPlacement({ context, prop, scope }) {
        const anchorEl = () => getControlEl(scope) || getTriggerEl(scope);
        const positionerEl = () => getPositionerEl(scope);
        context.set("currentPlacement", prop("positioning").placement);
        return getPlacement(anchorEl, positionerEl, {
          ...prop("positioning"),
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement);
          }
        });
      },
      scrollToHighlightedItem({ context, prop, scope }) {
        const inputEl = getInputEl(scope);
        let cleanups = [];
        const exec = (immediate) => {
          const modality = getInteractionModality();
          if (modality === "pointer") return;
          const highlightedValue = context.get("highlightedValue");
          if (!highlightedValue) return;
          const contentEl = getContentEl(scope);
          const scrollToIndexFn = prop("scrollToIndexFn");
          if (scrollToIndexFn) {
            const highlightedIndex = prop("collection").indexOf(highlightedValue);
            scrollToIndexFn({
              index: highlightedIndex,
              immediate,
              getElement: () => getItemEl(scope, highlightedValue)
            });
            return;
          }
          const itemEl = getItemEl(scope, highlightedValue);
          const raf_cleanup = raf(() => {
            scrollIntoView(itemEl, {
              rootEl: contentEl,
              block: "nearest"
            });
          });
          cleanups.push(raf_cleanup);
        };
        const rafCleanup = raf(() => {
          setInteractionModality("virtual");
          exec(true);
        });
        cleanups.push(rafCleanup);
        const observerCleanup = observeAttributes(inputEl, {
          attributes: [
            "aria-activedescendant"
          ],
          callback: () => exec(false)
        });
        cleanups.push(observerCleanup);
        return () => {
          cleanups.forEach((cleanup) => cleanup());
        };
      }
    },
    actions: {
      reposition({ context, prop, scope, event }) {
        const controlEl = () => getControlEl(scope);
        const positionerEl = () => getPositionerEl(scope);
        getPlacement(controlEl, positionerEl, {
          ...prop("positioning"),
          ...event.options,
          defer: true,
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement);
          }
        });
      },
      setHighlightedValue({ context, event }) {
        if (event.value == null) return;
        context.set("highlightedValue", event.value);
      },
      clearHighlightedValue({ context }) {
        context.set("highlightedValue", null);
      },
      selectHighlightedItem(params) {
        const { context, prop } = params;
        const collection22 = prop("collection");
        const highlightedValue = context.get("highlightedValue");
        if (!highlightedValue || !collection22.has(highlightedValue)) return;
        const nextValue = prop("multiple") ? addOrRemove(context.get("value"), highlightedValue) : [
          highlightedValue
        ];
        prop("onSelect")?.({
          value: nextValue,
          itemValue: highlightedValue
        });
        context.set("value", nextValue);
        const inputValue = match(prop("selectionBehavior"), {
          preserve: context.get("inputValue"),
          replace: collection22.stringifyMany(nextValue),
          clear: ""
        });
        context.set("inputValue", inputValue);
      },
      scrollToHighlightedItem({ context, prop, scope }) {
        nextTick(() => {
          const highlightedValue = context.get("highlightedValue");
          if (highlightedValue == null) return;
          const itemEl = getItemEl(scope, highlightedValue);
          const contentEl = getContentEl(scope);
          const scrollToIndexFn = prop("scrollToIndexFn");
          if (scrollToIndexFn) {
            const highlightedIndex = prop("collection").indexOf(highlightedValue);
            scrollToIndexFn({
              index: highlightedIndex,
              immediate: true,
              getElement: () => getItemEl(scope, highlightedValue)
            });
            return;
          }
          scrollIntoView(itemEl, {
            rootEl: contentEl,
            block: "nearest"
          });
        });
      },
      selectItem(params) {
        const { context, event, flush, prop } = params;
        if (event.value == null) return;
        flush(() => {
          const nextValue = prop("multiple") ? addOrRemove(context.get("value"), event.value) : [
            event.value
          ];
          prop("onSelect")?.({
            value: nextValue,
            itemValue: event.value
          });
          context.set("value", nextValue);
          const inputValue = match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: prop("collection").stringifyMany(nextValue),
            clear: ""
          });
          context.set("inputValue", inputValue);
        });
      },
      clearItem(params) {
        const { context, event, flush, prop } = params;
        if (event.value == null) return;
        flush(() => {
          const nextValue = remove(context.get("value"), event.value);
          context.set("value", nextValue);
          const inputValue = match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: prop("collection").stringifyMany(nextValue),
            clear: ""
          });
          context.set("inputValue", inputValue);
        });
      },
      setInitialFocus({ scope }) {
        raf(() => {
          focusInputEl(scope);
        });
      },
      setFinalFocus({ scope }) {
        raf(() => {
          const triggerEl = getTriggerEl(scope);
          if (triggerEl?.dataset.focusable == null) {
            focusInputEl(scope);
          } else {
            focusTriggerEl(scope);
          }
        });
      },
      syncInputValue({ context, scope, event }) {
        const inputEl = getInputEl(scope);
        if (!inputEl) return;
        inputEl.value = context.get("inputValue");
        queueMicrotask(() => {
          if (event.current().type === "INPUT.CHANGE") return;
          setCaretToEnd(inputEl);
        });
      },
      setInputValue({ context, event }) {
        context.set("inputValue", event.value);
      },
      clearInputValue({ context }) {
        context.set("inputValue", "");
      },
      revertInputValue({ context, prop, computed }) {
        const selectionBehavior = prop("selectionBehavior");
        const inputValue = match(selectionBehavior, {
          replace: computed("hasSelectedItems") ? computed("valueAsString") : "",
          preserve: context.get("inputValue"),
          clear: ""
        });
        context.set("inputValue", inputValue);
      },
      setValue(params) {
        const { context, flush, event, prop } = params;
        flush(() => {
          context.set("value", event.value);
          const inputValue = match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: prop("collection").stringifyMany(event.value),
            clear: ""
          });
          context.set("inputValue", inputValue);
        });
      },
      clearSelectedItems(params) {
        const { context, flush, prop } = params;
        flush(() => {
          context.set("value", []);
          const inputValue = match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: prop("collection").stringifyMany([]),
            clear: ""
          });
          context.set("inputValue", inputValue);
        });
      },
      scrollContentToTop({ prop, scope }) {
        const scrollToIndexFn = prop("scrollToIndexFn");
        if (scrollToIndexFn) {
          const firstValue = prop("collection").firstValue;
          scrollToIndexFn({
            index: 0,
            immediate: true,
            getElement: () => getItemEl(scope, firstValue)
          });
        } else {
          const contentEl = getContentEl(scope);
          if (!contentEl) return;
          contentEl.scrollTop = 0;
        }
      },
      invokeOnOpen({ prop, event, context }) {
        const reason = getOpenChangeReason(event);
        prop("onOpenChange")?.({
          open: true,
          reason,
          value: context.get("value")
        });
      },
      invokeOnClose({ prop, event, context }) {
        const reason = getOpenChangeReason(event);
        prop("onOpenChange")?.({
          open: false,
          reason,
          value: context.get("value")
        });
      },
      highlightFirstItem({ context, prop, scope }) {
        const exec = getContentEl(scope) ? queueMicrotask : raf;
        exec(() => {
          const value = prop("collection").firstValue;
          if (value) context.set("highlightedValue", value);
        });
      },
      highlightFirstItemIfNeeded({ computed, action }) {
        if (!computed("autoHighlight")) return;
        action([
          "highlightFirstItem"
        ]);
      },
      highlightLastItem({ context, prop, scope }) {
        const exec = getContentEl(scope) ? queueMicrotask : raf;
        exec(() => {
          const value = prop("collection").lastValue;
          if (value) context.set("highlightedValue", value);
        });
      },
      highlightNextItem({ context, prop }) {
        let value = null;
        const highlightedValue = context.get("highlightedValue");
        const collection22 = prop("collection");
        if (highlightedValue) {
          value = collection22.getNextValue(highlightedValue);
          if (!value && prop("loopFocus")) value = collection22.firstValue;
        } else {
          value = collection22.firstValue;
        }
        if (value) context.set("highlightedValue", value);
      },
      highlightPrevItem({ context, prop }) {
        let value = null;
        const highlightedValue = context.get("highlightedValue");
        const collection22 = prop("collection");
        if (highlightedValue) {
          value = collection22.getPreviousValue(highlightedValue);
          if (!value && prop("loopFocus")) value = collection22.lastValue;
        } else {
          value = collection22.lastValue;
        }
        if (value) context.set("highlightedValue", value);
      },
      highlightFirstSelectedItem({ context, prop }) {
        raf(() => {
          const [value] = prop("collection").sort(context.get("value"));
          if (value) context.set("highlightedValue", value);
        });
      },
      highlightFirstOrSelectedItem({ context, prop, computed }) {
        raf(() => {
          let value = null;
          if (computed("hasSelectedItems")) {
            value = prop("collection").sort(context.get("value"))[0];
          } else {
            value = prop("collection").firstValue;
          }
          if (value) context.set("highlightedValue", value);
        });
      },
      highlightLastOrSelectedItem({ context, prop, computed }) {
        raf(() => {
          const collection22 = prop("collection");
          let value = null;
          if (computed("hasSelectedItems")) {
            value = collection22.sort(context.get("value"))[0];
          } else {
            value = collection22.lastValue;
          }
          if (value) context.set("highlightedValue", value);
        });
      },
      autofillInputValue({ context, computed, prop, event, scope }) {
        const inputEl = getInputEl(scope);
        const collection22 = prop("collection");
        if (!computed("autoComplete") || !inputEl || !event.keypress) return;
        const valueText = collection22.stringify(context.get("highlightedValue"));
        raf(() => {
          inputEl.value = valueText || context.get("inputValue");
        });
      },
      syncSelectedItems(params) {
        queueMicrotask(() => {
          const { context, prop } = params;
          const collection22 = prop("collection");
          const value = context.get("value");
          const selectedItemMap = context.get("selectedItemMap");
          const next = deriveSelectionState({
            values: value,
            collection: collection22,
            selectedItemMap
          });
          context.set("selectedItemMap", next.nextSelectedItemMap);
          const inputValue = match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: collection22.stringifyMany(value),
            clear: ""
          });
          context.set("inputValue", inputValue);
        });
      },
      syncHighlightedItem({ context, prop }) {
        const item = prop("collection").find(context.get("highlightedValue"));
        context.set("highlightedItem", item);
      },
      announceHighlightedItem({ context, prop, refs }) {
        if (!isApple()) return;
        const value = context.get("highlightedValue");
        const optionText = value ? prop("collection").stringifyItem(prop("collection").find(value)) : null;
        if (!optionText) return;
        const isSelected = value ? context.get("value").includes(value) : false;
        refs.get("liveRegion")?.announce(isSelected ? `${optionText}, selected` : optionText);
      },
      toggleVisibility({ event, send, prop }) {
        send({
          type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
          previousEvent: event
        });
      }
    }
  }
});
function getOpenChangeReason(event) {
  return (event.previousEvent || event).src;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/combobox/1.43.0/dist/combobox.props.mjs
var props = createProps()([
  "allowCustomValue",
  "autoFocus",
  "closeOnSelect",
  "collection",
  "composite",
  "defaultHighlightedValue",
  "defaultInputValue",
  "defaultOpen",
  "defaultValue",
  "dir",
  "disabled",
  "disableLayer",
  "form",
  "getRootNode",
  "highlightedValue",
  "id",
  "ids",
  "inputBehavior",
  "inputValue",
  "invalid",
  "loopFocus",
  "multiple",
  "name",
  "navigate",
  "onFocusOutside",
  "onHighlightChange",
  "onInputValueChange",
  "onInteractOutside",
  "onOpenChange",
  "onOpenChange",
  "onPointerDownOutside",
  "onSelect",
  "onValueChange",
  "open",
  "openOnChange",
  "openOnClick",
  "openOnKeyPress",
  "placeholder",
  "positioning",
  "readOnly",
  "required",
  "scrollToIndexFn",
  "selectionBehavior",
  "translations",
  "value",
  "alwaysSubmitOnEnter"
]);
var splitProps2 = createSplitProps(props);
var itemGroupLabelProps = createProps()([
  "htmlFor"
]);
var splitItemGroupLabelProps = createSplitProps(itemGroupLabelProps);
var itemGroupProps = createProps()([
  "id"
]);
var splitItemGroupProps = createSplitProps(itemGroupProps);
var itemProps = createProps()([
  "item",
  "persistFocus"
]);
var splitItemProps = createSplitProps(itemProps);

// interpreter/vendor/entry-zag/date-picker.ts
var date_picker_exports = {};
__export(date_picker_exports, {
  anatomy: () => anatomy2,
  connect: () => connect2,
  fromInput: () => fromInput,
  generate: () => generate,
  generateKey: () => generateKey,
  inputProps: () => inputProps,
  machine: () => machine2,
  parse: () => parse,
  partArg: () => partArg,
  presetTriggerProps: () => presetTriggerProps,
  props: () => props2,
  splitInputProps: () => splitInputProps,
  splitPresetTriggerProps: () => splitPresetTriggerProps,
  splitProps: () => splitProps3,
  splitTableCellProps: () => splitTableCellProps,
  splitTableProps: () => splitTableProps,
  splitViewProps: () => splitViewProps,
  tableCellProps: () => tableCellProps,
  tableProps: () => tableProps,
  viewProps: () => viewProps,
  writeInput: () => writeInput
});

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-picker/1.43.0/dist/date-picker.anatomy.mjs
var anatomy2 = createAnatomy("date-picker").parts("clearTrigger", "content", "control", "input", "label", "monthSelect", "nextTrigger", "positioner", "presetTrigger", "prevTrigger", "rangeText", "root", "table", "tableBody", "tableCell", "tableCellTrigger", "tableHead", "tableHeader", "tableRow", "trigger", "view", "viewControl", "viewTrigger", "yearSelect");
var parts2 = anatomy2.build();

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@internationalized/date/3.12.3/dist/private/utils.mjs
function $09ec6a572d60460f$export$842a2cf37af977e1(amount, numerator) {
  return amount - numerator * Math.floor(amount / numerator);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@internationalized/date/3.12.3/dist/private/calendars/GregorianCalendar.mjs
var $93635573935797de$var$EPOCH = 1721426;
function $93635573935797de$export$f297eb839006d339(era, year, month, day) {
  year = $93635573935797de$export$c36e0ecb2d4fa69d(era, year);
  let y1 = year - 1;
  let monthOffset = -2;
  if (month <= 2) monthOffset = 0;
  else if ($93635573935797de$export$553d7fa8e3805fc0(year)) monthOffset = -1;
  return $93635573935797de$var$EPOCH - 1 + 365 * y1 + Math.floor(y1 / 4) - Math.floor(y1 / 100) + Math.floor(y1 / 400) + Math.floor((367 * month - 362) / 12 + monthOffset + day);
}
function $93635573935797de$export$553d7fa8e3805fc0(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function $93635573935797de$export$c36e0ecb2d4fa69d(era, year) {
  return era === "BC" ? 1 - year : year;
}
function $93635573935797de$export$4475b7e617eb123c(year) {
  let era = "AD";
  if (year <= 0) {
    era = "BC";
    year = 1 - year;
  }
  return [
    era,
    year
  ];
}
var $93635573935797de$var$daysInMonth = {
  standard: [
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ],
  leapyear: [
    31,
    29,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ]
};
var $93635573935797de$export$80ee6245ec4f29ec = class {
  fromJulianDay(jd) {
    let jd0 = jd;
    let depoch = jd0 - $93635573935797de$var$EPOCH;
    let quadricent = Math.floor(depoch / 146097);
    let dqc = (0, $09ec6a572d60460f$export$842a2cf37af977e1)(depoch, 146097);
    let cent = Math.floor(dqc / 36524);
    let dcent = (0, $09ec6a572d60460f$export$842a2cf37af977e1)(dqc, 36524);
    let quad = Math.floor(dcent / 1461);
    let dquad = (0, $09ec6a572d60460f$export$842a2cf37af977e1)(dcent, 1461);
    let yindex = Math.floor(dquad / 365);
    let extendedYear = quadricent * 400 + cent * 100 + quad * 4 + yindex + (cent !== 4 && yindex !== 4 ? 1 : 0);
    let [era, year] = $93635573935797de$export$4475b7e617eb123c(extendedYear);
    let yearDay = jd0 - $93635573935797de$export$f297eb839006d339(era, year, 1, 1);
    let leapAdj = 2;
    if (jd0 < $93635573935797de$export$f297eb839006d339(era, year, 3, 1)) leapAdj = 0;
    else if ($93635573935797de$export$553d7fa8e3805fc0(year)) leapAdj = 1;
    let month = Math.floor(((yearDay + leapAdj) * 12 + 373) / 367);
    let day = jd0 - $93635573935797de$export$f297eb839006d339(era, year, month, 1) + 1;
    return new (0, $2aaf608024c21ca1$export$99faa760c7908e4f)(era, year, month, day);
  }
  toJulianDay(date) {
    return $93635573935797de$export$f297eb839006d339(date.era, date.year, date.month, date.day);
  }
  getDaysInMonth(date) {
    return $93635573935797de$var$daysInMonth[$93635573935797de$export$553d7fa8e3805fc0(date.year) ? "leapyear" : "standard"][date.month - 1];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getMonthsInYear(date) {
    return 12;
  }
  getDaysInYear(date) {
    return $93635573935797de$export$553d7fa8e3805fc0(date.year) ? 366 : 365;
  }
  getMaximumMonthsInYear() {
    return 12;
  }
  getMaximumDaysInMonth() {
    return 31;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getYearsInEra(date) {
    return 9999;
  }
  getEras() {
    return [
      "BC",
      "AD"
    ];
  }
  isInverseEra(date) {
    return date.era === "BC";
  }
  balanceDate(date) {
    if (date.year <= 0) {
      date.era = date.era === "BC" ? "AD" : "BC";
      date.year = 1 - date.year;
    }
  }
  constructor() {
    this.identifier = "gregory";
  }
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@internationalized/date/3.12.3/dist/private/weekStartData.mjs
var $d2ca8165c9aa885a$export$7a5acbd77d414bd9 = {
  "001": 1,
  AD: 1,
  AE: 6,
  AF: 6,
  AI: 1,
  AL: 1,
  AM: 1,
  AN: 1,
  AR: 1,
  AT: 1,
  AU: 1,
  AX: 1,
  AZ: 1,
  BA: 1,
  BE: 1,
  BG: 1,
  BH: 6,
  BM: 1,
  BN: 1,
  BY: 1,
  CH: 1,
  CL: 1,
  CM: 1,
  CN: 1,
  CR: 1,
  CY: 1,
  CZ: 1,
  DE: 1,
  DJ: 6,
  DK: 1,
  DZ: 6,
  EC: 1,
  EE: 1,
  EG: 6,
  ES: 1,
  FI: 1,
  FJ: 1,
  FO: 1,
  FR: 1,
  GB: 1,
  GE: 1,
  GF: 1,
  GP: 1,
  GR: 1,
  HR: 1,
  HU: 1,
  IE: 1,
  IQ: 6,
  IR: 6,
  IS: 1,
  IT: 1,
  JO: 6,
  KG: 1,
  KW: 6,
  KZ: 1,
  LB: 1,
  LI: 1,
  LK: 1,
  LT: 1,
  LU: 1,
  LV: 1,
  LY: 6,
  MC: 1,
  MD: 1,
  ME: 1,
  MK: 1,
  MN: 1,
  MQ: 1,
  MV: 5,
  MY: 1,
  NL: 1,
  NO: 1,
  NZ: 1,
  OM: 6,
  PL: 1,
  QA: 6,
  RE: 1,
  RO: 1,
  RS: 1,
  RU: 1,
  SD: 6,
  SE: 1,
  SI: 1,
  SK: 1,
  SM: 1,
  SY: 6,
  TJ: 1,
  TM: 1,
  TR: 1,
  UA: 1,
  UY: 1,
  UZ: 1,
  VA: 1,
  VN: 1,
  XK: 1
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@internationalized/date/3.12.3/dist/private/queries.mjs
function $ad063034c8620db8$export$ea39ec197993aef0(a, b) {
  b = (0, $d07e34cce18680fd$export$b4a036af3fc0b032)(b, a.calendar);
  return a.era === b.era && a.year === b.year && a.month === b.month && a.day === b.day;
}
function $ad063034c8620db8$export$a18c89cbd24170ff(a, b) {
  b = (0, $d07e34cce18680fd$export$b4a036af3fc0b032)(b, a.calendar);
  a = $ad063034c8620db8$export$a5a3b454ada2268e(a);
  b = $ad063034c8620db8$export$a5a3b454ada2268e(b);
  return a.era === b.era && a.year === b.year && a.month === b.month;
}
function $ad063034c8620db8$export$5841f9eb9773f25f(a, b) {
  b = (0, $d07e34cce18680fd$export$b4a036af3fc0b032)(b, a.calendar);
  a = $ad063034c8620db8$export$f91e89d3d0406102(a);
  b = $ad063034c8620db8$export$f91e89d3d0406102(b);
  return a.era === b.era && a.year === b.year;
}
function $ad063034c8620db8$export$91b62ebf2ba703ee(a, b) {
  return $ad063034c8620db8$export$dbc69fd56b53d5e(a.calendar, b.calendar) && $ad063034c8620db8$export$ea39ec197993aef0(a, b);
}
function $ad063034c8620db8$export$5a8da0c44a3afdf2(a, b) {
  return $ad063034c8620db8$export$dbc69fd56b53d5e(a.calendar, b.calendar) && $ad063034c8620db8$export$a18c89cbd24170ff(a, b);
}
function $ad063034c8620db8$export$ea840f5a6dda8147(a, b) {
  return $ad063034c8620db8$export$dbc69fd56b53d5e(a.calendar, b.calendar) && $ad063034c8620db8$export$5841f9eb9773f25f(a, b);
}
function $ad063034c8620db8$export$dbc69fd56b53d5e(a, b) {
  return a.isEqual?.(b) ?? b.isEqual?.(a) ?? a.identifier === b.identifier;
}
function $ad063034c8620db8$export$629b0a497aa65267(date, timeZone) {
  return $ad063034c8620db8$export$ea39ec197993aef0(date, $ad063034c8620db8$export$d0bdf45af03a6ea3(timeZone));
}
var $ad063034c8620db8$var$DAY_MAP = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6
};
function $ad063034c8620db8$export$2061056d06d7cdf7(date, locale, firstDayOfWeek) {
  let julian = date.calendar.toJulianDay(date);
  let weekStart = firstDayOfWeek ? $ad063034c8620db8$var$DAY_MAP[firstDayOfWeek] : $ad063034c8620db8$var$getWeekStart(locale);
  let dayOfWeek = Math.ceil(julian + 1 - weekStart) % 7;
  if (dayOfWeek < 0) dayOfWeek += 7;
  return dayOfWeek;
}
function $ad063034c8620db8$export$461939dd4422153(timeZone) {
  return (0, $d07e34cce18680fd$export$1b96692a1ba042ac)(Date.now(), timeZone);
}
function $ad063034c8620db8$export$d0bdf45af03a6ea3(timeZone) {
  return (0, $d07e34cce18680fd$export$93522d1a439f3617)($ad063034c8620db8$export$461939dd4422153(timeZone));
}
function $ad063034c8620db8$export$68781ddf31c0090f(a, b) {
  return a.calendar.toJulianDay(a) - b.calendar.toJulianDay(b);
}
function $ad063034c8620db8$export$c19a80a9721b80f6(a, b) {
  return $ad063034c8620db8$var$timeToMs(a) - $ad063034c8620db8$var$timeToMs(b);
}
function $ad063034c8620db8$var$timeToMs(a) {
  return a.hour * 36e5 + a.minute * 6e4 + a.second * 1e3 + a.millisecond;
}
var $ad063034c8620db8$var$localTimeZone = null;
var $ad063034c8620db8$var$localTimeZoneOverride = false;
function $ad063034c8620db8$export$aa8b41735afcabd2() {
  if ($ad063034c8620db8$var$localTimeZone == null) $ad063034c8620db8$var$localTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
  return $ad063034c8620db8$var$localTimeZone;
}
function $ad063034c8620db8$export$6ab69b273755230b() {
  return $ad063034c8620db8$var$localTimeZoneOverride;
}
function $ad063034c8620db8$export$a5a3b454ada2268e(date) {
  return date.subtract({
    days: date.day - 1
  });
}
function $ad063034c8620db8$export$a2258d9c4118825c(date) {
  return date.add({
    days: date.calendar.getDaysInMonth(date) - date.day
  });
}
function $ad063034c8620db8$export$f91e89d3d0406102(date) {
  return $ad063034c8620db8$export$a5a3b454ada2268e(date.subtract({
    months: date.month - 1
  }));
}
function $ad063034c8620db8$export$8b7aa55c66d5569e(date) {
  return $ad063034c8620db8$export$a2258d9c4118825c(date.add({
    months: date.calendar.getMonthsInYear(date) - date.month
  }));
}
function $ad063034c8620db8$export$42c81a444fbfb5d4(date, locale, firstDayOfWeek) {
  let dayOfWeek = $ad063034c8620db8$export$2061056d06d7cdf7(date, locale, firstDayOfWeek);
  return date.subtract({
    days: dayOfWeek
  });
}
function $ad063034c8620db8$export$ef8b6d9133084f4e(date, locale, firstDayOfWeek) {
  return $ad063034c8620db8$export$42c81a444fbfb5d4(date, locale, firstDayOfWeek).add({
    days: 6
  });
}
var $ad063034c8620db8$var$cachedRegions = /* @__PURE__ */ new Map();
var $ad063034c8620db8$var$cachedWeekInfo = /* @__PURE__ */ new Map();
function $ad063034c8620db8$var$getRegion(locale) {
  if (Intl.Locale) {
    let region = $ad063034c8620db8$var$cachedRegions.get(locale);
    if (!region) {
      region = new Intl.Locale(locale).maximize().region;
      if (region) $ad063034c8620db8$var$cachedRegions.set(locale, region);
    }
    return region;
  }
  let part2 = locale.split("-")[1];
  return part2 === "u" ? void 0 : part2;
}
function $ad063034c8620db8$var$getWeekStart(locale) {
  let weekInfo = $ad063034c8620db8$var$cachedWeekInfo.get(locale);
  if (!weekInfo) {
    if (Intl.Locale) {
      let localeInst = new Intl.Locale(locale);
      if ("getWeekInfo" in localeInst) {
        weekInfo = localeInst.getWeekInfo();
        if (weekInfo) {
          $ad063034c8620db8$var$cachedWeekInfo.set(locale, weekInfo);
          return weekInfo.firstDay;
        }
      }
    }
    let region = $ad063034c8620db8$var$getRegion(locale);
    if (locale.includes("-fw-")) {
      let day = locale.split("-fw-")[1].split("-")[0];
      if (day === "mon") weekInfo = {
        firstDay: 1
      };
      else if (day === "tue") weekInfo = {
        firstDay: 2
      };
      else if (day === "wed") weekInfo = {
        firstDay: 3
      };
      else if (day === "thu") weekInfo = {
        firstDay: 4
      };
      else if (day === "fri") weekInfo = {
        firstDay: 5
      };
      else if (day === "sat") weekInfo = {
        firstDay: 6
      };
      else weekInfo = {
        firstDay: 0
      };
    } else if (locale.includes("-ca-iso8601")) weekInfo = {
      firstDay: 1
    };
    else weekInfo = {
      firstDay: region ? (0, $d2ca8165c9aa885a$export$7a5acbd77d414bd9)[region] || 0 : 0
    };
    $ad063034c8620db8$var$cachedWeekInfo.set(locale, weekInfo);
  }
  return weekInfo.firstDay;
}
function $ad063034c8620db8$export$ccc1b2479e7dd654(date, locale, firstDayOfWeek) {
  let days = date.calendar.getDaysInMonth(date);
  return Math.ceil(($ad063034c8620db8$export$2061056d06d7cdf7($ad063034c8620db8$export$a5a3b454ada2268e(date), locale, firstDayOfWeek) + days) / 7);
}
function $ad063034c8620db8$export$5c333a116e949cdd(a, b) {
  if (a && b) return a.compare(b) <= 0 ? a : b;
  return a || b;
}
function $ad063034c8620db8$export$a75f2bff57811055(a, b) {
  if (a && b) return a.compare(b) >= 0 ? a : b;
  return a || b;
}
var $ad063034c8620db8$var$WEEKEND_DATA = {
  AF: [
    4,
    5
  ],
  AE: [
    5,
    6
  ],
  BH: [
    5,
    6
  ],
  DZ: [
    5,
    6
  ],
  EG: [
    5,
    6
  ],
  IL: [
    5,
    6
  ],
  IQ: [
    5,
    6
  ],
  IR: [
    5,
    5
  ],
  JO: [
    5,
    6
  ],
  KW: [
    5,
    6
  ],
  LY: [
    5,
    6
  ],
  OM: [
    5,
    6
  ],
  QA: [
    5,
    6
  ],
  SA: [
    5,
    6
  ],
  SD: [
    5,
    6
  ],
  SY: [
    5,
    6
  ],
  YE: [
    5,
    6
  ]
};
function $ad063034c8620db8$export$618d60ea299da42(date, locale) {
  let julian = date.calendar.toJulianDay(date);
  let dayOfWeek = Math.ceil(julian + 1) % 7;
  if (dayOfWeek < 0) dayOfWeek += 7;
  let region = $ad063034c8620db8$var$getRegion(locale);
  let [start, end] = $ad063034c8620db8$var$WEEKEND_DATA[region] || [
    6,
    0
  ];
  return dayOfWeek === start || dayOfWeek === end;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@internationalized/date/3.12.3/dist/private/conversion.mjs
function $d07e34cce18680fd$export$bd4fb2bc8bb06fb(date) {
  date = $d07e34cce18680fd$export$b4a036af3fc0b032(date, new (0, $93635573935797de$export$80ee6245ec4f29ec)());
  let year = (0, $93635573935797de$export$c36e0ecb2d4fa69d)(date.era, date.year);
  return $d07e34cce18680fd$var$epochFromParts(year, date.month, date.day, date.hour, date.minute, date.second, date.millisecond);
}
function $d07e34cce18680fd$var$epochFromParts(year, month, day, hour, minute, second, millisecond) {
  let date = /* @__PURE__ */ new Date();
  date.setUTCHours(hour, minute, second, millisecond);
  date.setUTCFullYear(year, month - 1, day);
  return date.getTime();
}
function $d07e34cce18680fd$export$59c99f3515d3493f(ms, timeZone) {
  if (timeZone === "UTC") return 0;
  if (ms > 0 && timeZone === (0, $ad063034c8620db8$export$aa8b41735afcabd2)() && !(0, $ad063034c8620db8$export$6ab69b273755230b)()) return new Date(ms).getTimezoneOffset() * -6e4;
  let { year, month, day, hour, minute, second } = $d07e34cce18680fd$var$getTimeZoneParts(ms, timeZone);
  let utc = $d07e34cce18680fd$var$epochFromParts(year, month, day, hour, minute, second, 0);
  return utc - Math.floor(ms / 1e3) * 1e3;
}
var $d07e34cce18680fd$var$formattersByTimeZone = /* @__PURE__ */ new Map();
function $d07e34cce18680fd$var$getTimeZoneParts(ms, timeZone) {
  let formatter = $d07e34cce18680fd$var$formattersByTimeZone.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      era: "short",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    });
    $d07e34cce18680fd$var$formattersByTimeZone.set(timeZone, formatter);
  }
  let parts6 = formatter.formatToParts(new Date(ms));
  let namedParts = {};
  for (let part2 of parts6) if (part2.type !== "literal") namedParts[part2.type] = part2.value;
  return {
    // Firefox returns B instead of BC... https://bugzilla.mozilla.org/show_bug.cgi?id=1752253
    year: namedParts.era === "BC" || namedParts.era === "B" ? -namedParts.year + 1 : +namedParts.year,
    month: +namedParts.month,
    day: +namedParts.day,
    hour: namedParts.hour === "24" ? 0 : +namedParts.hour,
    minute: +namedParts.minute,
    second: +namedParts.second
  };
}
var $d07e34cce18680fd$var$DAYMILLIS = 864e5;
function $d07e34cce18680fd$var$getValidWallTimes(date, timeZone, earlier, later) {
  let found = earlier === later ? [
    earlier
  ] : [
    earlier,
    later
  ];
  return found.filter((absolute) => $d07e34cce18680fd$var$isValidWallTime(date, timeZone, absolute));
}
function $d07e34cce18680fd$var$isValidWallTime(date, timeZone, absolute) {
  let parts6 = $d07e34cce18680fd$var$getTimeZoneParts(absolute, timeZone);
  return date.year === parts6.year && date.month === parts6.month && date.day === parts6.day && date.hour === parts6.hour && date.minute === parts6.minute && date.second === parts6.second;
}
function $d07e34cce18680fd$export$5107c82f94518f5c(date, timeZone, disambiguation = "compatible") {
  let dateTime = $d07e34cce18680fd$export$b21e0b124e224484(date);
  if (timeZone === "UTC") return $d07e34cce18680fd$export$bd4fb2bc8bb06fb(dateTime);
  if (timeZone === (0, $ad063034c8620db8$export$aa8b41735afcabd2)() && disambiguation === "compatible" && !(0, $ad063034c8620db8$export$6ab69b273755230b)()) {
    dateTime = $d07e34cce18680fd$export$b4a036af3fc0b032(dateTime, new (0, $93635573935797de$export$80ee6245ec4f29ec)());
    let date2 = /* @__PURE__ */ new Date();
    let year = (0, $93635573935797de$export$c36e0ecb2d4fa69d)(dateTime.era, dateTime.year);
    date2.setFullYear(year, dateTime.month - 1, dateTime.day);
    date2.setHours(dateTime.hour, dateTime.minute, dateTime.second, dateTime.millisecond);
    return date2.getTime();
  }
  let ms = $d07e34cce18680fd$export$bd4fb2bc8bb06fb(dateTime);
  let offsetBefore = $d07e34cce18680fd$export$59c99f3515d3493f(ms - $d07e34cce18680fd$var$DAYMILLIS, timeZone);
  let offsetAfter = $d07e34cce18680fd$export$59c99f3515d3493f(ms + $d07e34cce18680fd$var$DAYMILLIS, timeZone);
  let valid = $d07e34cce18680fd$var$getValidWallTimes(dateTime, timeZone, ms - offsetBefore, ms - offsetAfter);
  if (valid.length === 1) return valid[0];
  if (valid.length > 1) switch (disambiguation) {
    // 'compatible' means 'earlier' for "fall back" transitions
    case "compatible":
    case "earlier":
      return valid[0];
    case "later":
      return valid[valid.length - 1];
    case "reject":
      throw new RangeError("Multiple possible absolute times found");
  }
  switch (disambiguation) {
    case "earlier":
      return Math.min(ms - offsetBefore, ms - offsetAfter);
    // 'compatible' means 'later' for "spring forward" transitions
    case "compatible":
    case "later":
      return Math.max(ms - offsetBefore, ms - offsetAfter);
    case "reject":
      throw new RangeError("No such absolute time found");
  }
}
function $d07e34cce18680fd$export$e67a095c620b86fe(dateTime, timeZone, disambiguation = "compatible") {
  return new Date($d07e34cce18680fd$export$5107c82f94518f5c(dateTime, timeZone, disambiguation));
}
function $d07e34cce18680fd$export$1b96692a1ba042ac(ms, timeZone) {
  let offset3 = $d07e34cce18680fd$export$59c99f3515d3493f(ms, timeZone);
  let date = new Date(ms + offset3);
  let year = date.getUTCFullYear();
  let month = date.getUTCMonth() + 1;
  let day = date.getUTCDate();
  let hour = date.getUTCHours();
  let minute = date.getUTCMinutes();
  let second = date.getUTCSeconds();
  let millisecond = date.getUTCMilliseconds();
  return new (0, $2aaf608024c21ca1$export$d3b7288e7994edea)(year < 1 ? "BC" : "AD", year < 1 ? -year + 1 : year, month, day, timeZone, offset3, hour, minute, second, millisecond);
}
function $d07e34cce18680fd$export$93522d1a439f3617(dateTime) {
  return new (0, $2aaf608024c21ca1$export$99faa760c7908e4f)(dateTime.calendar, dateTime.era, dateTime.year, dateTime.month, dateTime.day);
}
function $d07e34cce18680fd$export$b21e0b124e224484(date, time) {
  let hour = 0, minute = 0, second = 0, millisecond = 0;
  if ("timeZone" in date) ({ hour, minute, second, millisecond } = date);
  else if ("hour" in date && !time) return date;
  if (time) ({ hour, minute, second, millisecond } = time);
  return new (0, $2aaf608024c21ca1$export$ca871e8dbb80966f)(date.calendar, date.era, date.year, date.month, date.day, hour, minute, second, millisecond);
}
function $d07e34cce18680fd$export$b4a036af3fc0b032(date, calendar) {
  if ((0, $ad063034c8620db8$export$dbc69fd56b53d5e)(date.calendar, calendar)) return date;
  let calendarDate = calendar.fromJulianDay(date.calendar.toJulianDay(date));
  let copy = date.copy();
  copy.calendar = calendar;
  copy.era = calendarDate.era;
  copy.year = calendarDate.year;
  copy.month = calendarDate.month;
  copy.day = calendarDate.day;
  (0, $435a2ceaa8778ed8$export$c4e2ecac49351ef2)(copy);
  return copy;
}
function $d07e34cce18680fd$export$84c95a83c799e074(date, timeZone, disambiguation) {
  if (date instanceof (0, $2aaf608024c21ca1$export$d3b7288e7994edea)) {
    if (date.timeZone === timeZone) return date;
    return $d07e34cce18680fd$export$538b00033cc11c75(date, timeZone);
  }
  let ms = $d07e34cce18680fd$export$5107c82f94518f5c(date, timeZone, disambiguation);
  return $d07e34cce18680fd$export$1b96692a1ba042ac(ms, timeZone);
}
function $d07e34cce18680fd$export$83aac07b4c37b25(date) {
  let ms = $d07e34cce18680fd$export$bd4fb2bc8bb06fb(date) - date.offset;
  return new Date(ms);
}
function $d07e34cce18680fd$export$538b00033cc11c75(date, timeZone) {
  let ms = $d07e34cce18680fd$export$bd4fb2bc8bb06fb(date) - date.offset;
  return $d07e34cce18680fd$export$b4a036af3fc0b032($d07e34cce18680fd$export$1b96692a1ba042ac(ms, timeZone), date.calendar);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@internationalized/date/3.12.3/dist/private/manipulation.mjs
var $435a2ceaa8778ed8$var$ONE_HOUR = 36e5;
function $435a2ceaa8778ed8$export$e16d8520af44a096(date, duration) {
  let mutableDate = date.copy();
  let days = "hour" in mutableDate ? $435a2ceaa8778ed8$var$addTimeFields(mutableDate, duration) : 0;
  $435a2ceaa8778ed8$var$addYears(mutableDate, duration.years || 0);
  if (mutableDate.calendar.balanceYearMonth) mutableDate.calendar.balanceYearMonth(mutableDate, date);
  mutableDate.month += duration.months || 0;
  $435a2ceaa8778ed8$var$balanceYearMonth(mutableDate);
  $435a2ceaa8778ed8$var$constrainMonthDay(mutableDate);
  mutableDate.day += (duration.weeks || 0) * 7;
  mutableDate.day += duration.days || 0;
  mutableDate.day += days;
  $435a2ceaa8778ed8$var$balanceDay(mutableDate);
  if (mutableDate.calendar.balanceDate) mutableDate.calendar.balanceDate(mutableDate);
  if (mutableDate.year < 1) {
    mutableDate.year = 1;
    mutableDate.month = 1;
    mutableDate.day = 1;
  }
  let maxYear = mutableDate.calendar.getYearsInEra(mutableDate);
  if (mutableDate.year > maxYear) {
    let isInverseEra = mutableDate.calendar.isInverseEra?.(mutableDate);
    mutableDate.year = maxYear;
    mutableDate.month = isInverseEra ? 1 : mutableDate.calendar.getMonthsInYear(mutableDate);
    mutableDate.day = isInverseEra ? 1 : mutableDate.calendar.getDaysInMonth(mutableDate);
  }
  if (mutableDate.month < 1) {
    mutableDate.month = 1;
    mutableDate.day = 1;
  }
  let maxMonth = mutableDate.calendar.getMonthsInYear(mutableDate);
  if (mutableDate.month > maxMonth) {
    mutableDate.month = maxMonth;
    mutableDate.day = mutableDate.calendar.getDaysInMonth(mutableDate);
  }
  mutableDate.day = Math.max(1, Math.min(mutableDate.calendar.getDaysInMonth(mutableDate), mutableDate.day));
  return mutableDate;
}
function $435a2ceaa8778ed8$var$addYears(date, years) {
  if (date.calendar.isInverseEra?.(date)) years = -years;
  date.year += years;
}
function $435a2ceaa8778ed8$var$balanceYearMonth(date) {
  while (date.month < 1) {
    $435a2ceaa8778ed8$var$addYears(date, -1);
    date.month += date.calendar.getMonthsInYear(date);
  }
  let monthsInYear = 0;
  while (date.month > (monthsInYear = date.calendar.getMonthsInYear(date))) {
    date.month -= monthsInYear;
    $435a2ceaa8778ed8$var$addYears(date, 1);
  }
}
function $435a2ceaa8778ed8$var$balanceDay(date) {
  while (date.day < 1) {
    date.month--;
    $435a2ceaa8778ed8$var$balanceYearMonth(date);
    date.day += date.calendar.getDaysInMonth(date);
  }
  while (date.day > date.calendar.getDaysInMonth(date)) {
    date.day -= date.calendar.getDaysInMonth(date);
    date.month++;
    $435a2ceaa8778ed8$var$balanceYearMonth(date);
  }
}
function $435a2ceaa8778ed8$var$constrainMonthDay(date) {
  date.month = Math.max(1, Math.min(date.calendar.getMonthsInYear(date), date.month));
  date.day = Math.max(1, Math.min(date.calendar.getDaysInMonth(date), date.day));
}
function $435a2ceaa8778ed8$export$c4e2ecac49351ef2(date) {
  if (date.calendar.constrainDate) date.calendar.constrainDate(date);
  date.year = Math.max(1, Math.min(date.calendar.getYearsInEra(date), date.year));
  $435a2ceaa8778ed8$var$constrainMonthDay(date);
}
function $435a2ceaa8778ed8$export$3e2544e88a25bff8(duration) {
  let inverseDuration = {};
  for (let key in duration) if (typeof duration[key] === "number") inverseDuration[key] = -duration[key];
  return inverseDuration;
}
function $435a2ceaa8778ed8$export$4e2d2ead65e5f7e3(date, duration) {
  return $435a2ceaa8778ed8$export$e16d8520af44a096(date, $435a2ceaa8778ed8$export$3e2544e88a25bff8(duration));
}
function $435a2ceaa8778ed8$export$adaa4cf7ef1b65be(date, fields) {
  let mutableDate = date.copy();
  if (fields.era != null) mutableDate.era = fields.era;
  if (fields.year != null) mutableDate.year = fields.year;
  if (fields.month != null) mutableDate.month = fields.month;
  if (fields.day != null) mutableDate.day = fields.day;
  $435a2ceaa8778ed8$export$c4e2ecac49351ef2(mutableDate);
  return mutableDate;
}
function $435a2ceaa8778ed8$export$e5d5e1c1822b6e56(value, fields) {
  let mutableValue = value.copy();
  if (fields.hour != null) mutableValue.hour = fields.hour;
  if (fields.minute != null) mutableValue.minute = fields.minute;
  if (fields.second != null) mutableValue.second = fields.second;
  if (fields.millisecond != null) mutableValue.millisecond = fields.millisecond;
  $435a2ceaa8778ed8$export$7555de1e070510cb(mutableValue);
  return mutableValue;
}
function $435a2ceaa8778ed8$var$balanceTime(time) {
  time.second += Math.floor(time.millisecond / 1e3);
  time.millisecond = $435a2ceaa8778ed8$var$nonNegativeMod(time.millisecond, 1e3);
  time.minute += Math.floor(time.second / 60);
  time.second = $435a2ceaa8778ed8$var$nonNegativeMod(time.second, 60);
  time.hour += Math.floor(time.minute / 60);
  time.minute = $435a2ceaa8778ed8$var$nonNegativeMod(time.minute, 60);
  let days = Math.floor(time.hour / 24);
  time.hour = $435a2ceaa8778ed8$var$nonNegativeMod(time.hour, 24);
  return days;
}
function $435a2ceaa8778ed8$export$7555de1e070510cb(time) {
  time.millisecond = Math.max(0, Math.min(time.millisecond, 999));
  time.second = Math.max(0, Math.min(time.second, 59));
  time.minute = Math.max(0, Math.min(time.minute, 59));
  time.hour = Math.max(0, Math.min(time.hour, 23));
}
function $435a2ceaa8778ed8$var$nonNegativeMod(a, b) {
  let result = a % b;
  if (result < 0) result += b;
  return result;
}
function $435a2ceaa8778ed8$var$addTimeFields(time, duration) {
  time.hour += duration.hours || 0;
  time.minute += duration.minutes || 0;
  time.second += duration.seconds || 0;
  time.millisecond += duration.milliseconds || 0;
  return $435a2ceaa8778ed8$var$balanceTime(time);
}
function $435a2ceaa8778ed8$export$d52ced6badfb9a4c(value, field, amount, options) {
  let mutable = value.copy();
  switch (field) {
    case "era": {
      let eras = value.calendar.getEras();
      let eraIndex = eras.indexOf(value.era);
      if (eraIndex < 0) throw new Error("Invalid era: " + value.era);
      eraIndex = $435a2ceaa8778ed8$var$cycleValue(eraIndex, amount, 0, eras.length - 1, options?.round);
      mutable.era = eras[eraIndex];
      $435a2ceaa8778ed8$export$c4e2ecac49351ef2(mutable);
      break;
    }
    case "year":
      if (mutable.calendar.isInverseEra?.(mutable)) amount = -amount;
      mutable.year = $435a2ceaa8778ed8$var$cycleValue(value.year, amount, -Infinity, 9999, options?.round);
      if (mutable.year === -Infinity) mutable.year = 1;
      if (mutable.calendar.balanceYearMonth) mutable.calendar.balanceYearMonth(mutable, value);
      break;
    case "month":
      mutable.month = $435a2ceaa8778ed8$var$cycleValue(value.month, amount, 1, value.calendar.getMonthsInYear(value), options?.round);
      break;
    case "day":
      mutable.day = $435a2ceaa8778ed8$var$cycleValue(value.day, amount, 1, value.calendar.getDaysInMonth(value), options?.round);
      break;
    default:
      throw new Error("Unsupported field " + field);
  }
  if (value.calendar.balanceDate) value.calendar.balanceDate(mutable);
  $435a2ceaa8778ed8$export$c4e2ecac49351ef2(mutable);
  return mutable;
}
function $435a2ceaa8778ed8$export$dd02b3e0007dfe28(value, field, amount, options) {
  let mutable = value.copy();
  switch (field) {
    case "hour": {
      let hours = value.hour;
      let min3 = 0;
      let max3 = 23;
      if (options?.hourCycle === 12) {
        let isPM = hours >= 12;
        min3 = isPM ? 12 : 0;
        max3 = isPM ? 23 : 11;
      }
      mutable.hour = $435a2ceaa8778ed8$var$cycleValue(hours, amount, min3, max3, options?.round);
      break;
    }
    case "minute":
      mutable.minute = $435a2ceaa8778ed8$var$cycleValue(value.minute, amount, 0, 59, options?.round);
      break;
    case "second":
      mutable.second = $435a2ceaa8778ed8$var$cycleValue(value.second, amount, 0, 59, options?.round);
      break;
    case "millisecond":
      mutable.millisecond = $435a2ceaa8778ed8$var$cycleValue(value.millisecond, amount, 0, 999, options?.round);
      break;
    default:
      throw new Error("Unsupported field " + field);
  }
  return mutable;
}
function $435a2ceaa8778ed8$var$cycleValue(value, amount, min3, max3, round3 = false) {
  if (round3) {
    value += Math.sign(amount);
    if (value < min3) value = max3;
    let div = Math.abs(amount);
    if (amount > 0) value = Math.ceil(value / div) * div;
    else value = Math.floor(value / div) * div;
    if (value > max3) value = min3;
  } else {
    value += amount;
    if (value < min3) value = max3 - (min3 - value - 1);
    else if (value > max3) value = min3 + (value - max3 - 1);
  }
  return value;
}
function $435a2ceaa8778ed8$export$96b1d28349274637(dateTime, duration) {
  let ms;
  if (duration.years != null && duration.years !== 0 || duration.months != null && duration.months !== 0 || duration.weeks != null && duration.weeks !== 0 || duration.days != null && duration.days !== 0) {
    let res2 = $435a2ceaa8778ed8$export$e16d8520af44a096((0, $d07e34cce18680fd$export$b21e0b124e224484)(dateTime), {
      years: duration.years,
      months: duration.months,
      weeks: duration.weeks,
      days: duration.days
    });
    ms = (0, $d07e34cce18680fd$export$5107c82f94518f5c)(res2, dateTime.timeZone);
  } else ms = (0, $d07e34cce18680fd$export$bd4fb2bc8bb06fb)(dateTime) - dateTime.offset;
  ms += duration.milliseconds || 0;
  ms += (duration.seconds || 0) * 1e3;
  ms += (duration.minutes || 0) * 6e4;
  ms += (duration.hours || 0) * 36e5;
  let res = (0, $d07e34cce18680fd$export$1b96692a1ba042ac)(ms, dateTime.timeZone);
  return (0, $d07e34cce18680fd$export$b4a036af3fc0b032)(res, dateTime.calendar);
}
function $435a2ceaa8778ed8$export$6814caac34ca03c7(dateTime, duration) {
  return $435a2ceaa8778ed8$export$96b1d28349274637(dateTime, $435a2ceaa8778ed8$export$3e2544e88a25bff8(duration));
}
function $435a2ceaa8778ed8$export$9a297d111fc86b79(dateTime, field, amount, options) {
  switch (field) {
    case "hour": {
      let min3 = 0;
      let max3 = 23;
      if (options?.hourCycle === 12) {
        let isPM = dateTime.hour >= 12;
        min3 = isPM ? 12 : 0;
        max3 = isPM ? 23 : 11;
      }
      let plainDateTime = (0, $d07e34cce18680fd$export$b21e0b124e224484)(dateTime);
      let minDate = (0, $d07e34cce18680fd$export$b4a036af3fc0b032)($435a2ceaa8778ed8$export$e5d5e1c1822b6e56(plainDateTime, {
        hour: min3
      }), new (0, $93635573935797de$export$80ee6245ec4f29ec)());
      let minAbsolute = [
        (0, $d07e34cce18680fd$export$5107c82f94518f5c)(minDate, dateTime.timeZone, "earlier"),
        (0, $d07e34cce18680fd$export$5107c82f94518f5c)(minDate, dateTime.timeZone, "later")
      ].filter((ms2) => (0, $d07e34cce18680fd$export$1b96692a1ba042ac)(ms2, dateTime.timeZone).day === minDate.day)[0];
      let maxDate = (0, $d07e34cce18680fd$export$b4a036af3fc0b032)($435a2ceaa8778ed8$export$e5d5e1c1822b6e56(plainDateTime, {
        hour: max3
      }), new (0, $93635573935797de$export$80ee6245ec4f29ec)());
      let maxAbsolute = [
        (0, $d07e34cce18680fd$export$5107c82f94518f5c)(maxDate, dateTime.timeZone, "earlier"),
        (0, $d07e34cce18680fd$export$5107c82f94518f5c)(maxDate, dateTime.timeZone, "later")
      ].filter((ms2) => (0, $d07e34cce18680fd$export$1b96692a1ba042ac)(ms2, dateTime.timeZone).day === maxDate.day).pop();
      let ms = (0, $d07e34cce18680fd$export$bd4fb2bc8bb06fb)(dateTime) - dateTime.offset;
      let hours = Math.floor(ms / $435a2ceaa8778ed8$var$ONE_HOUR);
      let remainder = ms % $435a2ceaa8778ed8$var$ONE_HOUR;
      ms = $435a2ceaa8778ed8$var$cycleValue(hours, amount, Math.floor(minAbsolute / $435a2ceaa8778ed8$var$ONE_HOUR), Math.floor(maxAbsolute / $435a2ceaa8778ed8$var$ONE_HOUR), options?.round) * $435a2ceaa8778ed8$var$ONE_HOUR + remainder;
      return (0, $d07e34cce18680fd$export$b4a036af3fc0b032)((0, $d07e34cce18680fd$export$1b96692a1ba042ac)(ms, dateTime.timeZone), dateTime.calendar);
    }
    case "minute":
    case "second":
    case "millisecond":
      return $435a2ceaa8778ed8$export$dd02b3e0007dfe28(dateTime, field, amount, options);
    case "era":
    case "year":
    case "month":
    case "day": {
      let res = $435a2ceaa8778ed8$export$d52ced6badfb9a4c((0, $d07e34cce18680fd$export$b21e0b124e224484)(dateTime), field, amount, options);
      let ms = (0, $d07e34cce18680fd$export$5107c82f94518f5c)(res, dateTime.timeZone);
      return (0, $d07e34cce18680fd$export$b4a036af3fc0b032)((0, $d07e34cce18680fd$export$1b96692a1ba042ac)(ms, dateTime.timeZone), dateTime.calendar);
    }
    default:
      throw new Error("Unsupported field " + field);
  }
}
function $435a2ceaa8778ed8$export$31b5430eb18be4f8(dateTime, fields, disambiguation) {
  let plainDateTime = (0, $d07e34cce18680fd$export$b21e0b124e224484)(dateTime);
  let res = $435a2ceaa8778ed8$export$e5d5e1c1822b6e56($435a2ceaa8778ed8$export$adaa4cf7ef1b65be(plainDateTime, fields), fields);
  if (res.compare(plainDateTime) === 0) return dateTime;
  let ms = (0, $d07e34cce18680fd$export$5107c82f94518f5c)(res, dateTime.timeZone, disambiguation);
  return (0, $d07e34cce18680fd$export$b4a036af3fc0b032)((0, $d07e34cce18680fd$export$1b96692a1ba042ac)(ms, dateTime.timeZone), dateTime.calendar);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@internationalized/date/3.12.3/dist/private/string.mjs
var $58246871e4652552$var$DATE_RE = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})$/;
var $58246871e4652552$var$ABSOLUTE_RE = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:T(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(\.\d+)?(?:(?:([+-]\d{2})(?::?(\d{2}))?)|Z)$/;
var $58246871e4652552$var$requiredDurationTimeGroups = [
  "hours",
  "minutes",
  "seconds"
];
var $58246871e4652552$var$requiredDurationGroups = [
  "years",
  "months",
  "weeks",
  "days",
  ...$58246871e4652552$var$requiredDurationTimeGroups
];
function $58246871e4652552$export$6b862160d295c8e(value) {
  let m = value.match($58246871e4652552$var$DATE_RE);
  if (!m) {
    if ($58246871e4652552$var$ABSOLUTE_RE.test(value)) throw new Error(`Invalid ISO 8601 date string: ${value}. Use parseAbsolute() instead.`);
    throw new Error("Invalid ISO 8601 date string: " + value);
  }
  let date = new (0, $2aaf608024c21ca1$export$99faa760c7908e4f)($58246871e4652552$var$parseNumber(m[1], 0, 9999), $58246871e4652552$var$parseNumber(m[2], 1, 12), 1);
  date.day = $58246871e4652552$var$parseNumber(m[3], 1, date.calendar.getDaysInMonth(date));
  return date;
}
function $58246871e4652552$var$parseNumber(value, min3, max3) {
  let val = Number(value);
  if (val < min3 || val > max3) throw new RangeError(`Value out of range: ${min3} <= ${val} <= ${max3}`);
  return val;
}
function $58246871e4652552$export$f59dee82248f5ad4(time) {
  return `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}:${String(time.second).padStart(2, "0")}${time.millisecond ? String(time.millisecond / 1e3).slice(1) : ""}`;
}
function $58246871e4652552$export$60dfd74aa96791bd(date) {
  let gregorianDate = (0, $d07e34cce18680fd$export$b4a036af3fc0b032)(date, new (0, $93635573935797de$export$80ee6245ec4f29ec)());
  let year;
  if (gregorianDate.era === "BC") year = gregorianDate.year === 1 ? "0000" : "-" + String(Math.abs(1 - gregorianDate.year)).padStart(6, "00");
  else year = String(gregorianDate.year).padStart(4, "0");
  return `${year}-${String(gregorianDate.month).padStart(2, "0")}-${String(gregorianDate.day).padStart(2, "0")}`;
}
function $58246871e4652552$export$4223de14708adc63(date) {
  return `${$58246871e4652552$export$60dfd74aa96791bd(date)}T${$58246871e4652552$export$f59dee82248f5ad4(date)}`;
}
function $58246871e4652552$var$offsetToString(offset3) {
  let sign2 = Math.sign(offset3) < 0 ? "-" : "+";
  offset3 = Math.abs(offset3);
  let offsetHours = Math.floor(offset3 / 36e5);
  let offsetMinutes = Math.floor(offset3 % 36e5 / 6e4);
  let offsetSeconds = Math.floor(offset3 % 36e5 % 6e4 / 1e3);
  let stringOffset = `${sign2}${String(offsetHours).padStart(2, "0")}:${String(offsetMinutes).padStart(2, "0")}`;
  if (offsetSeconds !== 0) stringOffset += `:${String(offsetSeconds).padStart(2, "0")}`;
  return stringOffset;
}
function $58246871e4652552$export$bf79f1ebf4b18792(date) {
  return `${$58246871e4652552$export$4223de14708adc63(date)}${$58246871e4652552$var$offsetToString(date.offset)}[${date.timeZone}]`;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@internationalized/date/3.12.3/dist/private/CalendarDate.mjs
function $2aaf608024c21ca1$var$shiftArgs(args) {
  let calendar = typeof args[0] === "object" ? args.shift() : new (0, $93635573935797de$export$80ee6245ec4f29ec)();
  let era;
  if (typeof args[0] === "string") era = args.shift();
  else {
    let eras = calendar.getEras();
    era = eras[eras.length - 1];
  }
  let year = args.shift();
  let month = args.shift();
  let day = args.shift();
  return [
    calendar,
    era,
    year,
    month,
    day
  ];
}
var $2aaf608024c21ca1$export$99faa760c7908e4f = class _$2aaf608024c21ca1$export$99faa760c7908e4f {
  // This prevents TypeScript from allowing other types with the same fields to match.
  // i.e. a ZonedDateTime should not be be passable to a parameter that expects CalendarDate.
  // If that behavior is desired, use the AnyCalendarDate interface instead.
  // @ts-ignore
  #type;
  constructor(...args) {
    let [calendar, era, year, month, day] = $2aaf608024c21ca1$var$shiftArgs(args);
    this.calendar = calendar;
    this.era = era;
    this.year = year;
    this.month = month;
    this.day = day;
    (0, $435a2ceaa8778ed8$export$c4e2ecac49351ef2)(this);
  }
  /** Returns a copy of this date. */
  copy() {
    if (this.era) return new _$2aaf608024c21ca1$export$99faa760c7908e4f(this.calendar, this.era, this.year, this.month, this.day);
    else return new _$2aaf608024c21ca1$export$99faa760c7908e4f(this.calendar, this.year, this.month, this.day);
  }
  /** Returns a new `CalendarDate` with the given duration added to it. */
  add(duration) {
    return (0, $435a2ceaa8778ed8$export$e16d8520af44a096)(this, duration);
  }
  /** Returns a new `CalendarDate` with the given duration subtracted from it. */
  subtract(duration) {
    return (0, $435a2ceaa8778ed8$export$4e2d2ead65e5f7e3)(this, duration);
  }
  /**
   * Returns a new `CalendarDate` with the given fields set to the provided values. Other fields
   * will be constrained accordingly.
   */
  set(fields) {
    return (0, $435a2ceaa8778ed8$export$adaa4cf7ef1b65be)(this, fields);
  }
  /**
   * Returns a new `CalendarDate` with the given field adjusted by a specified amount.
   * When the resulting value reaches the limits of the field, it wraps around.
   */
  cycle(field, amount, options) {
    return (0, $435a2ceaa8778ed8$export$d52ced6badfb9a4c)(this, field, amount, options);
  }
  /**
   * Converts the date to a native JavaScript Date object, with the time set to midnight in the
   * given time zone.
   */
  toDate(timeZone) {
    return (0, $d07e34cce18680fd$export$e67a095c620b86fe)(this, timeZone);
  }
  /** Converts the date to an ISO 8601 formatted string. */
  toString() {
    return (0, $58246871e4652552$export$60dfd74aa96791bd)(this);
  }
  /**
   * Compares this date with another. A negative result indicates that this date is before the given
   * one, and a positive date indicates that it is after.
   */
  compare(b) {
    return (0, $ad063034c8620db8$export$68781ddf31c0090f)(this, b);
  }
};
var $2aaf608024c21ca1$export$ca871e8dbb80966f = class _$2aaf608024c21ca1$export$ca871e8dbb80966f {
  // This prevents TypeScript from allowing other types with the same fields to match.
  // @ts-ignore
  #type;
  constructor(...args) {
    let [calendar, era, year, month, day] = $2aaf608024c21ca1$var$shiftArgs(args);
    this.calendar = calendar;
    this.era = era;
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = args.shift() || 0;
    this.minute = args.shift() || 0;
    this.second = args.shift() || 0;
    this.millisecond = args.shift() || 0;
    (0, $435a2ceaa8778ed8$export$c4e2ecac49351ef2)(this);
  }
  /** Returns a copy of this date. */
  copy() {
    if (this.era) return new _$2aaf608024c21ca1$export$ca871e8dbb80966f(this.calendar, this.era, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
    else return new _$2aaf608024c21ca1$export$ca871e8dbb80966f(this.calendar, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
  }
  /** Returns a new `CalendarDateTime` with the given duration added to it. */
  add(duration) {
    return (0, $435a2ceaa8778ed8$export$e16d8520af44a096)(this, duration);
  }
  /** Returns a new `CalendarDateTime` with the given duration subtracted from it. */
  subtract(duration) {
    return (0, $435a2ceaa8778ed8$export$4e2d2ead65e5f7e3)(this, duration);
  }
  /**
   * Returns a new `CalendarDateTime` with the given fields set to the provided values. Other fields
   * will be constrained accordingly.
   */
  set(fields) {
    return (0, $435a2ceaa8778ed8$export$adaa4cf7ef1b65be)((0, $435a2ceaa8778ed8$export$e5d5e1c1822b6e56)(this, fields), fields);
  }
  /**
   * Returns a new `CalendarDateTime` with the given field adjusted by a specified amount.
   * When the resulting value reaches the limits of the field, it wraps around.
   */
  cycle(field, amount, options) {
    switch (field) {
      case "era":
      case "year":
      case "month":
      case "day":
        return (0, $435a2ceaa8778ed8$export$d52ced6badfb9a4c)(this, field, amount, options);
      default:
        return (0, $435a2ceaa8778ed8$export$dd02b3e0007dfe28)(this, field, amount, options);
    }
  }
  /** Converts the date to a native JavaScript Date object in the given time zone. */
  toDate(timeZone, disambiguation) {
    return (0, $d07e34cce18680fd$export$e67a095c620b86fe)(this, timeZone, disambiguation);
  }
  /** Converts the date to an ISO 8601 formatted string. */
  toString() {
    return (0, $58246871e4652552$export$4223de14708adc63)(this);
  }
  /**
   * Compares this date with another. A negative result indicates that this date is before the given
   * one, and a positive date indicates that it is after.
   */
  compare(b) {
    let res = (0, $ad063034c8620db8$export$68781ddf31c0090f)(this, b);
    if (res === 0) return (0, $ad063034c8620db8$export$c19a80a9721b80f6)(this, (0, $d07e34cce18680fd$export$b21e0b124e224484)(b));
    return res;
  }
};
var $2aaf608024c21ca1$export$d3b7288e7994edea = class _$2aaf608024c21ca1$export$d3b7288e7994edea {
  // This prevents TypeScript from allowing other types with the same fields to match.
  // @ts-ignore
  #type;
  constructor(...args) {
    let [calendar, era, year, month, day] = $2aaf608024c21ca1$var$shiftArgs(args);
    let timeZone = args.shift();
    let offset3 = args.shift();
    this.calendar = calendar;
    this.era = era;
    this.year = year;
    this.month = month;
    this.day = day;
    this.timeZone = timeZone;
    this.offset = offset3;
    this.hour = args.shift() || 0;
    this.minute = args.shift() || 0;
    this.second = args.shift() || 0;
    this.millisecond = args.shift() || 0;
    (0, $435a2ceaa8778ed8$export$c4e2ecac49351ef2)(this);
  }
  /** Returns a copy of this date. */
  copy() {
    if (this.era) return new _$2aaf608024c21ca1$export$d3b7288e7994edea(this.calendar, this.era, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
    else return new _$2aaf608024c21ca1$export$d3b7288e7994edea(this.calendar, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
  }
  /** Returns a new `ZonedDateTime` with the given duration added to it. */
  add(duration) {
    return (0, $435a2ceaa8778ed8$export$96b1d28349274637)(this, duration);
  }
  /** Returns a new `ZonedDateTime` with the given duration subtracted from it. */
  subtract(duration) {
    return (0, $435a2ceaa8778ed8$export$6814caac34ca03c7)(this, duration);
  }
  /**
   * Returns a new `ZonedDateTime` with the given fields set to the provided values. Other fields
   * will be constrained accordingly.
   */
  set(fields, disambiguation) {
    return (0, $435a2ceaa8778ed8$export$31b5430eb18be4f8)(this, fields, disambiguation);
  }
  /**
   * Returns a new `ZonedDateTime` with the given field adjusted by a specified amount.
   * When the resulting value reaches the limits of the field, it wraps around.
   */
  cycle(field, amount, options) {
    return (0, $435a2ceaa8778ed8$export$9a297d111fc86b79)(this, field, amount, options);
  }
  /** Converts the date to a native JavaScript Date object. */
  toDate() {
    return (0, $d07e34cce18680fd$export$83aac07b4c37b25)(this);
  }
  /**
   * Converts the date to an ISO 8601 formatted string, including the UTC offset and time zone
   * identifier.
   */
  toString() {
    return (0, $58246871e4652552$export$bf79f1ebf4b18792)(this);
  }
  /** Converts the date to an ISO 8601 formatted string in UTC. */
  toAbsoluteString() {
    return this.toDate().toISOString();
  }
  /**
   * Compares this date with another. A negative result indicates that this date is before the given
   * one, and a positive date indicates that it is after.
   */
  compare(b) {
    return this.toDate().getTime() - (0, $d07e34cce18680fd$export$84c95a83c799e074)(b, this.timeZone).toDate().getTime();
  }
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@internationalized/date/3.12.3/dist/private/calendars/HebrewCalendar.mjs
var $f39495b96f9dbac6$var$HOUR_PARTS = 1080;
var $f39495b96f9dbac6$var$DAY_PARTS = 24 * $f39495b96f9dbac6$var$HOUR_PARTS;
var $f39495b96f9dbac6$var$MONTH_DAYS = 29;
var $f39495b96f9dbac6$var$MONTH_FRACT = 12 * $f39495b96f9dbac6$var$HOUR_PARTS + 793;
var $f39495b96f9dbac6$var$MONTH_PARTS = $f39495b96f9dbac6$var$MONTH_DAYS * $f39495b96f9dbac6$var$DAY_PARTS + $f39495b96f9dbac6$var$MONTH_FRACT;

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@internationalized/date/3.12.3/dist/private/DateFormatter.mjs
var $12a3c853105e5a70$var$formatterCache = /* @__PURE__ */ new Map();
var $12a3c853105e5a70$export$ad991b66133851cf = class {
  constructor(locale, options = {}) {
    this.formatter = $12a3c853105e5a70$var$getCachedDateFormatter(locale, options);
    this.options = options;
  }
  /**
   * Formats a date as a string according to the locale and format options passed to the
   * constructor.
   */
  format(value) {
    return this.formatter.format(value);
  }
  /** Formats a date to an array of parts such as separators, numbers, punctuation, and more. */
  formatToParts(value) {
    return this.formatter.formatToParts(value);
  }
  /** Formats a date range as a string. */
  formatRange(start, end) {
    if (typeof this.formatter.formatRange === "function") return this.formatter.formatRange(start, end);
    if (end < start) throw new RangeError("End date must be >= start date");
    return `${this.formatter.format(start)} \u2013 ${this.formatter.format(end)}`;
  }
  /** Formats a date range as an array of parts. */
  formatRangeToParts(start, end) {
    if (typeof this.formatter.formatRangeToParts === "function") return this.formatter.formatRangeToParts(start, end);
    if (end < start) throw new RangeError("End date must be >= start date");
    let startParts = this.formatter.formatToParts(start);
    let endParts = this.formatter.formatToParts(end);
    return [
      ...startParts.map((p) => ({
        ...p,
        source: "startRange"
      })),
      {
        type: "literal",
        value: " \u2013 ",
        source: "shared"
      },
      ...endParts.map((p) => ({
        ...p,
        source: "endRange"
      }))
    ];
  }
  /** Returns the resolved formatting options based on the values passed to the constructor. */
  resolvedOptions() {
    let resolvedOptions = this.formatter.resolvedOptions();
    if ($12a3c853105e5a70$var$hasBuggyResolvedHourCycle()) {
      if (!this.resolvedHourCycle) this.resolvedHourCycle = $12a3c853105e5a70$var$getResolvedHourCycle(resolvedOptions.locale, this.options);
      resolvedOptions.hourCycle = this.resolvedHourCycle;
      resolvedOptions.hour12 = this.resolvedHourCycle === "h11" || this.resolvedHourCycle === "h12";
    }
    if (resolvedOptions.calendar === "ethiopic-amete-alem") resolvedOptions.calendar = "ethioaa";
    return resolvedOptions;
  }
};
var $12a3c853105e5a70$var$hour12Preferences = {
  true: {
    // Only Japanese uses the h11 style for 12 hour time. All others use h12.
    ja: "h11"
  },
  false: {}
};
function $12a3c853105e5a70$var$getCachedDateFormatter(locale, options = {}) {
  if (typeof options.hour12 === "boolean" && $12a3c853105e5a70$var$hasBuggyHour12Behavior()) {
    options = {
      ...options
    };
    let pref = $12a3c853105e5a70$var$hour12Preferences[String(options.hour12)][locale.split("-")[0]];
    let defaultHourCycle = options.hour12 ? "h12" : "h23";
    options.hourCycle = pref ?? defaultHourCycle;
    delete options.hour12;
  }
  let cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : "");
  if ($12a3c853105e5a70$var$formatterCache.has(cacheKey)) return $12a3c853105e5a70$var$formatterCache.get(cacheKey);
  let numberFormatter = new Intl.DateTimeFormat(locale, options);
  $12a3c853105e5a70$var$formatterCache.set(cacheKey, numberFormatter);
  return numberFormatter;
}
var $12a3c853105e5a70$var$_hasBuggyHour12Behavior = null;
function $12a3c853105e5a70$var$hasBuggyHour12Behavior() {
  if ($12a3c853105e5a70$var$_hasBuggyHour12Behavior == null) $12a3c853105e5a70$var$_hasBuggyHour12Behavior = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false
  }).format(new Date(2020, 2, 3, 0)) === "24";
  return $12a3c853105e5a70$var$_hasBuggyHour12Behavior;
}
var $12a3c853105e5a70$var$_hasBuggyResolvedHourCycle = null;
function $12a3c853105e5a70$var$hasBuggyResolvedHourCycle() {
  if ($12a3c853105e5a70$var$_hasBuggyResolvedHourCycle == null) $12a3c853105e5a70$var$_hasBuggyResolvedHourCycle = new Intl.DateTimeFormat("fr", {
    hour: "numeric",
    hour12: false
  }).resolvedOptions().hourCycle === "h12";
  return $12a3c853105e5a70$var$_hasBuggyResolvedHourCycle;
}
function $12a3c853105e5a70$var$getResolvedHourCycle(locale, options) {
  if (!options.timeStyle && !options.hour) return void 0;
  locale = locale.replace(/(-u-)?-nu-[a-zA-Z0-9]+/, "");
  locale += (locale.includes("-u-") ? "" : "-u") + "-nu-latn";
  let formatter = $12a3c853105e5a70$var$getCachedDateFormatter(locale, {
    ...options,
    timeZone: void 0
    // use local timezone
  });
  let min3 = parseInt(formatter.formatToParts(new Date(2020, 2, 3, 0)).find((p) => p.type === "hour").value, 10);
  let max3 = parseInt(formatter.formatToParts(new Date(2020, 2, 3, 23)).find((p) => p.type === "hour").value, 10);
  if (min3 === 0 && max3 === 23) return "h23";
  if (min3 === 24 && max3 === 23) return "h24";
  if (min3 === 0 && max3 === 11) return "h11";
  if (min3 === 12 && max3 === 11) return "h12";
  throw new Error("Unexpected hour cycle result");
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-utils/1.43.0/dist/constrain.mjs
function alignCenter(date, duration, locale, min3, max3) {
  const halfDuration = {};
  for (let prop in duration) {
    const key = prop;
    const value = duration[key];
    if (value == null) continue;
    halfDuration[key] = Math.floor(value / 2);
    if (halfDuration[key] > 0 && value % 2 === 0) {
      halfDuration[key]--;
    }
  }
  const aligned = alignStart(date, duration, locale).subtract(halfDuration);
  return constrainStart(date, aligned, duration, locale, min3, max3);
}
function alignStart(date, duration, locale, min3, max3) {
  let aligned = date;
  if (duration.years) {
    aligned = $ad063034c8620db8$export$f91e89d3d0406102(date);
  } else if (duration.months) {
    aligned = $ad063034c8620db8$export$a5a3b454ada2268e(date);
  } else if (duration.weeks) {
    aligned = $ad063034c8620db8$export$42c81a444fbfb5d4(date, locale);
  }
  return constrainStart(date, aligned, duration, locale, min3, max3);
}
function alignEnd(date, duration, locale, min3, max3) {
  let d = {
    ...duration
  };
  if (d.days) {
    d.days--;
  } else if (d.weeks) {
    d.weeks--;
  } else if (d.months) {
    d.months--;
  } else if (d.years) {
    d.years--;
  }
  let aligned = alignStart(date, duration, locale).subtract(d);
  return constrainStart(date, aligned, duration, locale, min3, max3);
}
function constrainStart(date, aligned, duration, locale, min3, max3) {
  if (min3 && date.compare(min3) >= 0) {
    aligned = $ad063034c8620db8$export$a75f2bff57811055(aligned, alignStart($d07e34cce18680fd$export$93522d1a439f3617(min3), duration, locale));
  }
  if (max3 && date.compare(max3) <= 0) {
    aligned = $ad063034c8620db8$export$5c333a116e949cdd(aligned, alignEnd($d07e34cce18680fd$export$93522d1a439f3617(max3), duration, locale));
  }
  return aligned;
}
function constrainValue(date, minValue, maxValue) {
  const dateOnly = $d07e34cce18680fd$export$93522d1a439f3617(date);
  const minOnly = minValue ? $d07e34cce18680fd$export$93522d1a439f3617(minValue) : void 0;
  const maxOnly = maxValue ? $d07e34cce18680fd$export$93522d1a439f3617(maxValue) : void 0;
  let constrainedDateOnly = dateOnly;
  if (minOnly) {
    constrainedDateOnly = $ad063034c8620db8$export$a75f2bff57811055(constrainedDateOnly, minOnly);
  }
  if (maxOnly) {
    constrainedDateOnly = $ad063034c8620db8$export$5c333a116e949cdd(constrainedDateOnly, maxOnly);
  }
  if (constrainedDateOnly.compare(dateOnly) === 0) {
    return date;
  }
  if ("hour" in date) {
    return date.set({
      year: constrainedDateOnly.year,
      month: constrainedDateOnly.month,
      day: constrainedDateOnly.day
    });
  }
  return constrainedDateOnly;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-utils/1.43.0/dist/align.mjs
function alignDate(date, alignment, duration, locale, min3, max3) {
  switch (alignment) {
    case "start":
      return alignStart(date, duration, locale, min3, max3);
    case "end":
      return alignEnd(date, duration, locale, min3, max3);
    case "center":
    default:
      return alignCenter(date, duration, locale, min3, max3);
  }
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-utils/1.43.0/dist/assertion.mjs
function isDateEqual(dateA, dateB) {
  if (dateA == null || dateB == null) return dateA === dateB;
  if (!("hour" in dateA) && !("hour" in dateB)) return $ad063034c8620db8$export$ea39ec197993aef0(dateA, dateB);
  return $d07e34cce18680fd$export$b21e0b124e224484(dateA).compare($d07e34cce18680fd$export$b21e0b124e224484(dateB)) === 0;
}
function isDateUnavailable(date, isUnavailable, locale, minValue, maxValue) {
  if (!date) return false;
  if (isUnavailable?.(date, locale)) return true;
  return isDateOutsideRange(date, minValue, maxValue);
}
function isDateOutsideRange(date, startDate, endDate) {
  return startDate != null && date.compare(startDate) < 0 || endDate != null && date.compare(endDate) > 0;
}
function isPreviousRangeInvalid(startDate, minValue, maxValue) {
  const prevDate = startDate.subtract({
    days: 1
  });
  return $ad063034c8620db8$export$ea39ec197993aef0(prevDate, startDate) || isDateOutsideRange(prevDate, minValue, maxValue);
}
function isNextRangeInvalid(endDate, minValue, maxValue) {
  const nextDate = endDate.add({
    days: 1
  });
  return $ad063034c8620db8$export$ea39ec197993aef0(nextDate, endDate) || isDateOutsideRange(nextDate, minValue, maxValue);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-utils/1.43.0/dist/duration.mjs
function getUnitDuration(duration) {
  let clone2 = {
    ...duration
  };
  for (let key in clone2) clone2[key] = 1;
  return clone2;
}
function getEndDate(startDate, duration) {
  let clone2 = {
    ...duration
  };
  if (clone2.days) clone2.days--;
  else clone2.days = -1;
  return startDate.add(clone2);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-utils/1.43.0/dist/get-era-format.mjs
function getEraFormat(date) {
  if (!date) return void 0;
  const id = date.calendar.identifier;
  if (id === "gregory" || id === "iso8601") {
    return date.era === "BC" ? "short" : void 0;
  }
  return "short";
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-utils/1.43.0/dist/formatter.mjs
function getDayFormatter(locale, timeZone, referenceDate) {
  const date = referenceDate ?? $d07e34cce18680fd$export$b21e0b124e224484($ad063034c8620db8$export$d0bdf45af03a6ea3(timeZone));
  return new $12a3c853105e5a70$export$ad991b66133851cf(locale, {
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
    era: getEraFormat(date),
    calendar: date.calendar.identifier,
    timeZone
  });
}
function getMonthFormatter(locale, timeZone, referenceDate) {
  const date = referenceDate ?? $ad063034c8620db8$export$d0bdf45af03a6ea3(timeZone);
  return new $12a3c853105e5a70$export$ad991b66133851cf(locale, {
    month: "long",
    year: "numeric",
    era: getEraFormat(date),
    calendar: date.calendar.identifier,
    timeZone
  });
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-utils/1.43.0/dist/format.mjs
function formatRange(startDate, endDate, formatter, toString, timeZone) {
  let parts6 = formatter.formatRangeToParts(startDate.toDate(timeZone), endDate.toDate(timeZone));
  let separatorIndex = -1;
  for (let i = 0; i < parts6.length; i++) {
    let part2 = parts6[i];
    if (part2.source === "shared" && part2.type === "literal") {
      separatorIndex = i;
    } else if (part2.source === "endRange") {
      break;
    }
  }
  let start = "";
  let end = "";
  for (let i = 0; i < parts6.length; i++) {
    if (i < separatorIndex) {
      start += parts6[i].value;
    } else if (i > separatorIndex) {
      end += parts6[i].value;
    }
  }
  return toString(start, end);
}
function formatSelectedDate(startDate, endDate, locale, timeZone) {
  if (!startDate) return "";
  let start = startDate;
  let end = endDate ?? startDate;
  let formatter = getDayFormatter(locale, timeZone);
  if ($ad063034c8620db8$export$ea39ec197993aef0(start, end)) {
    return formatter.format(start.toDate(timeZone));
  }
  return formatRange(start, end, formatter, (start2, end2) => `${start2} \u2013 ${end2}`, timeZone);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-utils/1.43.0/dist/date-month.mjs
var daysOfTheWeek = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat"
];
function normalizeFirstDayOfWeek(firstDayOfWeek) {
  return firstDayOfWeek != null ? daysOfTheWeek[firstDayOfWeek] : void 0;
}
function getStartOfWeek(date, locale, firstDayOfWeek) {
  const firstDay = normalizeFirstDayOfWeek(firstDayOfWeek);
  return $ad063034c8620db8$export$42c81a444fbfb5d4(date, locale, firstDay);
}
function getDaysInWeek(weekIndex, from, locale, firstDayOfWeek) {
  const weekDate = from.add({
    weeks: weekIndex
  });
  const dates = [];
  let date = getStartOfWeek(weekDate, locale, firstDayOfWeek);
  while (dates.length < 7) {
    dates.push(date);
    let nextDate = date.add({
      days: 1
    });
    if ($ad063034c8620db8$export$ea39ec197993aef0(date, nextDate)) break;
    date = nextDate;
  }
  return dates;
}
function getMonthDays(from, locale, numOfWeeks, firstDayOfWeek) {
  const firstDay = normalizeFirstDayOfWeek(firstDayOfWeek);
  const monthWeeks = numOfWeeks ?? $ad063034c8620db8$export$ccc1b2479e7dd654(from, locale, firstDay);
  const weeks = [
    ...new Array(monthWeeks).keys()
  ];
  return weeks.map((week) => getDaysInWeek(week, from, locale, firstDayOfWeek));
}
function getWeekdayFormats(locale, timeZone) {
  const longFormat = new $12a3c853105e5a70$export$ad991b66133851cf(locale, {
    weekday: "long",
    timeZone
  });
  const shortFormat = new $12a3c853105e5a70$export$ad991b66133851cf(locale, {
    weekday: "short",
    timeZone
  });
  const narrowFormat = new $12a3c853105e5a70$export$ad991b66133851cf(locale, {
    weekday: "narrow",
    timeZone
  });
  return (value) => {
    const date = value instanceof Date ? value : value.toDate(timeZone);
    return {
      value,
      short: shortFormat.format(date),
      long: longFormat.format(date),
      narrow: narrowFormat.format(date)
    };
  };
}
function getWeekDays(date, startOfWeekProp, timeZone, locale) {
  const firstDayOfWeek = getStartOfWeek(date, locale, startOfWeekProp);
  const weeks = [
    ...new Array(7).keys()
  ];
  const format = getWeekdayFormats(locale, timeZone);
  return weeks.map((index) => format(firstDayOfWeek.add({
    days: index
  })));
}
function getMonthNames(locale, format = "long", referenceDate) {
  if (!referenceDate || referenceDate.calendar.identifier === "gregory" || referenceDate.calendar.identifier === "iso8601") {
    const date = new Date(2021, 0, 1);
    const monthNames2 = [];
    for (let i = 0; i < 12; i++) {
      monthNames2.push(date.toLocaleString(locale, {
        month: format
      }));
      date.setMonth(date.getMonth() + 1);
    }
    return monthNames2;
  }
  const monthCount = referenceDate.calendar.getMonthsInYear(referenceDate);
  const formatter = new $12a3c853105e5a70$export$ad991b66133851cf(locale, {
    month: format,
    calendar: referenceDate.calendar.identifier
  });
  const monthNames = [];
  for (let month = 1; month <= monthCount; month++) {
    const d = referenceDate.set({
      month
    });
    monthNames.push(formatter.format(d.toDate("UTC")));
  }
  return monthNames;
}
function getWeekOfYear(date, locale) {
  const mondayOfWeek = $ad063034c8620db8$export$42c81a444fbfb5d4(date, locale, "mon");
  const year = mondayOfWeek.year;
  const jan4 = mondayOfWeek.set({
    month: 1,
    day: 4
  });
  const week1Monday = $ad063034c8620db8$export$42c81a444fbfb5d4(jan4, locale, "mon");
  const julianMonday = mondayOfWeek.calendar.toJulianDay(mondayOfWeek);
  const julianWeek1 = week1Monday.calendar.toJulianDay(week1Monday);
  if (julianMonday >= julianWeek1) {
    return 1 + Math.floor((julianMonday - julianWeek1) / 7);
  }
  const prevJan4 = mondayOfWeek.set({
    year: year - 1,
    month: 1,
    day: 4
  });
  const prevWeek1Monday = $ad063034c8620db8$export$42c81a444fbfb5d4(prevJan4, locale, "mon");
  const julianPrevWeek1 = prevWeek1Monday.calendar.toJulianDay(prevWeek1Monday);
  return 1 + Math.floor((julianMonday - julianPrevWeek1) / 7);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-utils/1.43.0/dist/date-year.mjs
function getYearsRange(range) {
  const years = [];
  for (let year = range.from; year <= range.to; year += 1) years.push(year);
  return years;
}
var DEFAULT_MIN_YEAR = 1900;
var DEFAULT_MAX_YEAR = 2099;
function getDefaultYearRange(referenceDate, min3, max3) {
  const calendar = referenceDate.calendar;
  const fromYear = min3?.year ?? $d07e34cce18680fd$export$b4a036af3fc0b032(new $2aaf608024c21ca1$export$99faa760c7908e4f(DEFAULT_MIN_YEAR, 1, 1), calendar).year;
  const toYear = max3?.year ?? $d07e34cce18680fd$export$b4a036af3fc0b032(new $2aaf608024c21ca1$export$99faa760c7908e4f(DEFAULT_MAX_YEAR, 12, 31), calendar).year;
  return {
    from: fromYear,
    to: toYear
  };
}
var FUTURE_YEAR_COERCION = 10;
function normalizeYear(year) {
  if (!year) return;
  if (year.length === 3) return year.padEnd(4, "0");
  if (year.length === 2) {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const twoDigitYear = parseInt(year.slice(-2), 10);
    const fullYear = currentCentury + twoDigitYear;
    return fullYear > currentYear + FUTURE_YEAR_COERCION ? (fullYear - 100).toString() : fullYear.toString();
  }
  return year;
}
function getDecadeRange(year, opts) {
  const chunkSize = opts?.strict ? 10 : 12;
  const computedYear = year - year % 10;
  const years = [];
  for (let i = 0; i < chunkSize; i += 1) {
    const value = computedYear + i;
    years.push(value);
  }
  return years;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-utils/1.43.0/dist/mutation.mjs
function getTodayDate(timeZone, calendar) {
  const tod = $ad063034c8620db8$export$d0bdf45af03a6ea3(timeZone ?? $ad063034c8620db8$export$aa8b41735afcabd2());
  if (calendar) return $d07e34cce18680fd$export$b4a036af3fc0b032(tod, calendar);
  return tod;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-utils/1.43.0/dist/pagination.mjs
function getAdjustedDateFn(visibleDuration, locale, minValue, maxValue) {
  return function getDate(options) {
    const { startDate, focusedDate } = options;
    const endDate = getEndDate(startDate, visibleDuration);
    if (isDateOutsideRange(focusedDate, minValue, maxValue)) {
      return {
        startDate,
        focusedDate: constrainValue(focusedDate, minValue, maxValue),
        endDate
      };
    }
    if (focusedDate.compare(startDate) < 0) {
      return {
        startDate: alignEnd(focusedDate, visibleDuration, locale, minValue, maxValue),
        focusedDate: constrainValue(focusedDate, minValue, maxValue),
        endDate
      };
    }
    if (focusedDate.compare(endDate) > 0) {
      return {
        startDate: alignStart(focusedDate, visibleDuration, locale, minValue, maxValue),
        endDate,
        focusedDate: constrainValue(focusedDate, minValue, maxValue)
      };
    }
    return {
      startDate,
      endDate,
      focusedDate: constrainValue(focusedDate, minValue, maxValue)
    };
  };
}
function getNextPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue);
  const start = startDate.add(visibleDuration);
  return adjust({
    focusedDate: focusedDate.add(visibleDuration),
    startDate: alignStart(constrainStart(focusedDate, start, visibleDuration, locale, minValue, maxValue), visibleDuration, locale)
  });
}
function getPreviousPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue);
  let start = startDate.subtract(visibleDuration);
  return adjust({
    focusedDate: focusedDate.subtract(visibleDuration),
    startDate: alignStart(constrainStart(focusedDate, start, visibleDuration, locale, minValue, maxValue), visibleDuration, locale)
  });
}
function getNextSection(focusedDate, startDate, larger, visibleDuration, locale, minValue, maxValue) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue);
  if (!larger && !visibleDuration.days) {
    return adjust({
      focusedDate: focusedDate.add(getUnitDuration(visibleDuration)),
      startDate
    });
  }
  if (visibleDuration.days) {
    return getNextPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue);
  }
  if (visibleDuration.weeks) {
    return adjust({
      focusedDate: focusedDate.add({
        months: 1
      }),
      startDate
    });
  }
  if (visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: focusedDate.add({
        years: 1
      }),
      startDate
    });
  }
}
function getPreviousSection(focusedDate, startDate, larger, visibleDuration, locale, minValue, maxValue) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue);
  if (!larger && !visibleDuration.days) {
    return adjust({
      focusedDate: focusedDate.subtract(getUnitDuration(visibleDuration)),
      startDate
    });
  }
  if (visibleDuration.days) {
    return getPreviousPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue);
  }
  if (visibleDuration.weeks) {
    return adjust({
      focusedDate: focusedDate.subtract({
        months: 1
      }),
      startDate
    });
  }
  if (visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: focusedDate.subtract({
        years: 1
      }),
      startDate
    });
  }
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-utils/1.43.0/dist/locale.mjs
var digitsCache = /* @__PURE__ */ new Map();
function getLocaleDigits(locale) {
  let digits = digitsCache.get(locale);
  if (digits != null) return digits;
  const localeDigits = new Intl.NumberFormat(locale, {
    useGrouping: false
  }).format(1234567890);
  digits = "0123456789" + localeDigits;
  digitsCache.set(locale, digits);
  return digits;
}
var isDigit = (char, locale) => {
  return locale ? getLocaleDigits(locale).includes(char) : /\d/.test(char);
};
var isValidCharacter = (char, separator, locale) => {
  if (!char) return true;
  if (char.length !== 1) return true;
  return isDigit(char, locale) || separator.includes(char);
};
var ensureValidCharacters = (value, separator, locale) => {
  return value.split("").filter((char) => isValidCharacter(char, separator, locale)).join("");
};
var separatorCache = /* @__PURE__ */ new Map();
function getLocaleSeparator(locale) {
  let separator = separatorCache.get(locale);
  if (separator != null) return separator;
  const parts6 = new Intl.DateTimeFormat(locale).formatToParts(/* @__PURE__ */ new Date());
  const literal = parts6.find((part2) => part2.type === "literal");
  separator = literal ? literal.value : "/";
  separatorCache.set(locale, separator);
  return separator;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-utils/1.43.0/dist/parse-date.mjs
var isValidYear = (year) => year != null && year.length === 4;
var isValidMonth = (month) => month != null && parseFloat(month) <= 12;
var isValidDay = (day) => day != null && parseFloat(day) <= 31;
function parseDateString(date, locale, timeZone) {
  const regex = createRegex(locale, timeZone);
  let { year, month, day } = extract(regex, date) ?? {};
  const hasMatch = year != null || month != null || day != null;
  if (hasMatch) {
    const curr = /* @__PURE__ */ new Date();
    year || (year = curr.getFullYear().toString());
    month || (month = (curr.getMonth() + 1).toString());
    day || (day = curr.getDate().toString());
  }
  if (!isValidYear(year)) {
    year = normalizeYear(year);
  }
  if (isValidYear(year) && isValidMonth(month) && isValidDay(day)) {
    return new $2aaf608024c21ca1$export$99faa760c7908e4f(+year, +month, +day);
  }
  const time = Date.parse(date);
  if (!isNaN(time)) {
    const date2 = new Date(time);
    return new $2aaf608024c21ca1$export$99faa760c7908e4f(date2.getFullYear(), date2.getMonth() + 1, date2.getDate());
  }
}
function createRegex(locale, timeZone) {
  const formatter = new $12a3c853105e5a70$export$ad991b66133851cf(locale, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone
  });
  const parts6 = formatter.formatToParts(new Date(2e3, 11, 25));
  return parts6.map(({ type, value }) => type === "literal" ? `${value}?` : `((?!=<${type}>)\\d+)?`).join("");
}
function extract(pattern, str) {
  const matches = str.match(pattern);
  return pattern.toString().match(/<(.+?)>/g)?.map((group) => {
    const groupMatches = group.match(/<(.+)>/);
    if (!groupMatches || groupMatches.length <= 0) {
      return null;
    }
    return group.match(/<(.+)>/)?.[1];
  }).reduce((acc, curr, index) => {
    if (!curr) return acc;
    if (matches && matches.length > index) {
      acc[curr] = matches[index + 1];
    } else {
      acc[curr] = null;
    }
    return acc;
  }, {});
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-utils/1.43.0/dist/preset.mjs
function getDateRangePreset(preset, locale, timeZone) {
  const today = $d07e34cce18680fd$export$93522d1a439f3617($ad063034c8620db8$export$461939dd4422153(timeZone));
  switch (preset) {
    case "thisWeek":
      return [
        $ad063034c8620db8$export$42c81a444fbfb5d4(today, locale),
        $ad063034c8620db8$export$ef8b6d9133084f4e(today, locale)
      ];
    case "thisMonth":
      return [
        $ad063034c8620db8$export$a5a3b454ada2268e(today),
        today
      ];
    case "thisQuarter":
      return [
        $ad063034c8620db8$export$a5a3b454ada2268e(today).add({
          months: -((today.month - 1) % 3)
        }),
        today
      ];
    case "thisYear":
      return [
        $ad063034c8620db8$export$f91e89d3d0406102(today),
        today
      ];
    case "last3Days":
      return [
        today.add({
          days: -2
        }),
        today
      ];
    case "last7Days":
      return [
        today.add({
          days: -6
        }),
        today
      ];
    case "last14Days":
      return [
        today.add({
          days: -13
        }),
        today
      ];
    case "last30Days":
      return [
        today.add({
          days: -29
        }),
        today
      ];
    case "last90Days":
      return [
        today.add({
          days: -89
        }),
        today
      ];
    case "lastMonth":
      return [
        $ad063034c8620db8$export$a5a3b454ada2268e(today.add({
          months: -1
        })),
        $ad063034c8620db8$export$a2258d9c4118825c(today.add({
          months: -1
        }))
      ];
    case "lastQuarter":
      return [
        $ad063034c8620db8$export$a5a3b454ada2268e(today.add({
          months: -((today.month - 1) % 3) - 3
        })),
        $ad063034c8620db8$export$a2258d9c4118825c(today.add({
          months: -((today.month - 1) % 3) - 1
        }))
      ];
    case "lastWeek":
      return [
        $ad063034c8620db8$export$42c81a444fbfb5d4(today, locale).add({
          weeks: -1
        }),
        $ad063034c8620db8$export$ef8b6d9133084f4e(today, locale).add({
          weeks: -1
        })
      ];
    case "lastYear":
      return [
        $ad063034c8620db8$export$f91e89d3d0406102(today.add({
          years: -1
        })),
        $ad063034c8620db8$export$8b7aa55c66d5569e(today.add({
          years: -1
        }))
      ];
    default:
      throw new Error(`Invalid date range preset: ${preset}`);
  }
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-picker/1.43.0/dist/date-picker.dom.mjs
var getLabelId2 = (ctx, index) => ctx.ids?.label?.(index) ?? `datepicker:${ctx.id}:label:${index}`;
var getRootId2 = (ctx) => ctx.ids?.root ?? `datepicker:${ctx.id}`;
var getTableId = (ctx, id) => ctx.ids?.table?.(id) ?? `datepicker:${ctx.id}:table:${id}`;
var getContentId2 = (ctx) => ctx.ids?.content ?? `datepicker:${ctx.id}:content`;
var getCellTriggerId = (ctx, id) => ctx.ids?.cellTrigger?.(id) ?? `datepicker:${ctx.id}:cell-trigger:${id}`;
var getPrevTriggerId = (ctx, view) => ctx.ids?.prevTrigger?.(view) ?? `datepicker:${ctx.id}:prev:${view}`;
var getNextTriggerId = (ctx, view) => ctx.ids?.nextTrigger?.(view) ?? `datepicker:${ctx.id}:next:${view}`;
var getViewTriggerId = (ctx, view) => ctx.ids?.viewTrigger?.(view) ?? `datepicker:${ctx.id}:view:${view}`;
var getClearTriggerId2 = (ctx) => ctx.ids?.clearTrigger ?? `datepicker:${ctx.id}:clear`;
var getControlId2 = (ctx) => ctx.ids?.control ?? `datepicker:${ctx.id}:control`;
var getInputId2 = (ctx, index) => ctx.ids?.input?.(index) ?? `datepicker:${ctx.id}:input:${index}`;
var getTriggerId2 = (ctx) => ctx.ids?.trigger ?? `datepicker:${ctx.id}:trigger`;
var getPositionerId2 = (ctx) => ctx.ids?.positioner ?? `datepicker:${ctx.id}:positioner`;
var getMonthSelectId = (ctx) => ctx.ids?.monthSelect ?? `datepicker:${ctx.id}:month-select`;
var getYearSelectId = (ctx) => ctx.ids?.yearSelect ?? `datepicker:${ctx.id}:year-select`;
var getFocusedCell = (ctx, view) => query(getContentEl2(ctx), `[data-part=table-cell-trigger][data-view=${view}][data-focus]:not([data-outside-range])`);
var getTriggerEl2 = (ctx) => ctx.getById(getTriggerId2(ctx));
var getContentEl2 = (ctx) => ctx.getById(getContentId2(ctx));
var getInputEls = (ctx) => queryAll(getControlEl2(ctx), `[data-part=input]`);
var getYearSelectEl = (ctx) => ctx.getById(getYearSelectId(ctx));
var getMonthSelectEl = (ctx) => ctx.getById(getMonthSelectId(ctx));
var getClearTriggerEl2 = (ctx) => ctx.getById(getClearTriggerId2(ctx));
var getPositionerEl2 = (ctx) => ctx.getById(getPositionerId2(ctx));
var getControlEl2 = (ctx) => ctx.getById(getControlId2(ctx));

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-picker/1.43.0/dist/date-picker.utils.mjs
function adjustStartAndEndDate(value) {
  const [startDate, endDate] = value;
  let result;
  if (!startDate || !endDate) result = value;
  else result = startDate.compare(endDate) <= 0 ? value : [
    endDate,
    startDate
  ];
  return result;
}
function isDateWithinRange(date, value) {
  const [startDate, endDate] = value;
  if (!startDate || !endDate) return false;
  return startDate.compare(date) <= 0 && endDate.compare(date) >= 0;
}
function sortDates(values) {
  return values.slice().filter((date) => date != null).sort((a, b) => a.compare(b));
}
function getRoleDescription(view) {
  return match(view, {
    year: "calendar decade",
    month: "calendar year",
    day: "calendar month"
  });
}
var PLACEHOLDERS = {
  day: "dd",
  month: "mm",
  year: "yyyy"
};
function getInputPlaceholder(locale) {
  return new $12a3c853105e5a70$export$ad991b66133851cf(locale).formatToParts(/* @__PURE__ */ new Date()).map((item) => PLACEHOLDERS[item.type] ?? item.value).join("");
}
var isValidDate = (value) => {
  return !Number.isNaN(value.day) && !Number.isNaN(value.month) && !Number.isNaN(value.year);
};
var defaultTranslations = {
  dayCell(state2) {
    if (state2.unavailable) return `Not available. ${state2.valueText}`;
    if (state2.firstInRange) return `Starting range from ${state2.valueText}`;
    if (state2.lastInRange) return `Range ending at ${state2.valueText}`;
    if (state2.selected) return `Selected date. ${state2.valueText}`;
    return `Choose ${state2.valueText}`;
  },
  trigger(open) {
    return open ? "Close calendar" : "Open calendar";
  },
  viewTrigger(view) {
    return match(view, {
      year: "Switch to month view",
      month: "Switch to day view",
      day: "Switch to year view"
    });
  },
  presetTrigger(value) {
    const [start = "", end = ""] = value;
    return `select ${start} to ${end}`;
  },
  prevTrigger(view) {
    return match(view, {
      year: "Switch to previous decade",
      month: "Switch to previous year",
      day: "Switch to previous month"
    });
  },
  nextTrigger(view) {
    return match(view, {
      year: "Switch to next decade",
      month: "Switch to next year",
      day: "Switch to next month"
    });
  },
  // TODO: Revisit this
  placeholder() {
    return {
      day: "dd",
      month: "mm",
      year: "yyyy"
    };
  },
  content: "calendar",
  monthSelect: "Select month",
  yearSelect: "Select year",
  clearTrigger: "Clear selected dates",
  weekColumnHeader: "Wk",
  weekNumberCell(weekNumber) {
    return `Week ${weekNumber}`;
  }
};
function viewToNumber(view, fallback2) {
  if (!view) return fallback2 || 0;
  return view === "day" ? 0 : view === "month" ? 1 : 2;
}
function viewNumberToView(viewNumber) {
  return viewNumber === 0 ? "day" : viewNumber === 1 ? "month" : "year";
}
function clampView(view, minView, maxView) {
  return viewNumberToView(clampValue(viewToNumber(view, 0), viewToNumber(minView, 0), viewToNumber(maxView, 2)));
}
function isAboveMinView(view, minView) {
  return viewToNumber(view, 0) > viewToNumber(minView, 0);
}
function isBelowMinView(view, minView) {
  return viewToNumber(view, 0) < viewToNumber(minView, 0);
}
function getNextView(view, minView, maxView) {
  const nextViewNumber = viewToNumber(view, 0) + 1;
  return clampView(viewNumberToView(nextViewNumber), minView, maxView);
}
function getPreviousView(view, minView, maxView) {
  const prevViewNumber = viewToNumber(view, 0) - 1;
  return clampView(viewNumberToView(prevViewNumber), minView, maxView);
}
var views = [
  "day",
  "month",
  "year"
];
function eachView(cb) {
  views.forEach((view) => cb(view));
}
var getVisibleRangeText = memo((opts) => [
  opts.view,
  opts.startValue.toString(),
  opts.endValue.toString(),
  opts.locale,
  opts.timeZone,
  opts.selectionMode
], ([view], opts) => {
  const { startValue, endValue, locale, timeZone, selectionMode } = opts;
  if (view === "year") {
    const years = getDecadeRange(startValue.year, {
      strict: true
    });
    const start2 = years.at(0).toString();
    const end2 = years.at(-1).toString();
    return {
      start: start2,
      end: end2,
      formatted: `${start2} - ${end2}`
    };
  }
  if (view === "month") {
    const formatter2 = new $12a3c853105e5a70$export$ad991b66133851cf(locale, {
      year: "numeric",
      timeZone,
      calendar: startValue.calendar.identifier
    });
    const start2 = formatter2.format(startValue.toDate(timeZone));
    const end2 = formatter2.format(endValue.toDate(timeZone));
    const formatted2 = selectionMode === "range" ? `${start2} - ${end2}` : start2;
    return {
      start: start2,
      end: end2,
      formatted: formatted2
    };
  }
  const formatter = new $12a3c853105e5a70$export$ad991b66133851cf(locale, {
    month: "long",
    year: "numeric",
    timeZone,
    calendar: startValue.calendar.identifier
  });
  const start = formatter.format(startValue.toDate(timeZone));
  const end = formatter.format(endValue.toDate(timeZone));
  const formatted = selectionMode === "range" ? `${start} - ${end}` : start;
  return {
    start,
    end,
    formatted
  };
});

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-picker/1.43.0/dist/date-picker.connect.mjs
function connect2(service, normalize) {
  const { state: state2, context, prop, send, computed, scope } = service;
  const startValue = context.get("startValue");
  const endValue = computed("endValue");
  const selectedValue = context.get("value");
  const focusedValue = context.get("focusedValue");
  const hoveredValue = context.get("hoveredValue");
  const hoveredRangeValue = hoveredValue ? adjustStartAndEndDate([
    selectedValue[0],
    hoveredValue
  ]) : [];
  const disabled = Boolean(prop("disabled"));
  const readOnly = Boolean(prop("readOnly"));
  const invalid = Boolean(prop("invalid"));
  const interactive = computed("isInteractive");
  const empty = selectedValue.length === 0;
  const min3 = prop("min");
  const max3 = prop("max");
  const locale = prop("locale");
  const timeZone = prop("timeZone");
  const startOfWeek = prop("startOfWeek");
  const focused = state2.matches("focused");
  const open = state2.matches("open");
  const isRangePicker = prop("selectionMode") === "range";
  const isMultiPicker = prop("selectionMode") === "multiple";
  const isDateUnavailableFn = prop("isDateUnavailable");
  const maxSelectedDates = prop("maxSelectedDates");
  const isMaxSelected = isMultiPicker && maxSelectedDates != null && selectedValue.length >= maxSelectedDates;
  const currentPlacement = context.get("currentPlacement");
  const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : void 0;
  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement
  });
  const separator = getLocaleSeparator(locale);
  const translations = {
    ...defaultTranslations,
    ...prop("translations")
  };
  function getMonthWeeks(from = startValue) {
    const numOfWeeks = prop("fixedWeeks") ? 6 : void 0;
    return getMonthDays(from, locale, numOfWeeks, startOfWeek);
  }
  function getMonths(props6 = {}) {
    const { format } = props6;
    return getMonthNames(locale, format, focusedValue).map((label, index) => {
      const value = index + 1;
      const dateValue = focusedValue.set({
        month: value
      });
      const disabled2 = isDateOutsideRange(dateValue, min3, max3);
      return {
        label,
        value,
        disabled: disabled2
      };
    });
  }
  function getYears() {
    const defaultRange = getDefaultYearRange(focusedValue, min3, max3);
    const range = getYearsRange(defaultRange);
    return range.map((year) => ({
      label: year.toString(),
      value: year,
      disabled: !isValueWithinRange(year, min3?.year, max3?.year)
    }));
  }
  function isUnavailable(date) {
    return isDateUnavailable(date, isDateUnavailableFn, locale, min3, max3);
  }
  function focusMonth(month) {
    const date = startValue ?? getTodayDate(timeZone, focusedValue.calendar);
    send({
      type: "FOCUS.SET",
      value: date.set({
        month
      })
    });
  }
  function focusYear(year) {
    const date = startValue ?? getTodayDate(timeZone, focusedValue.calendar);
    send({
      type: "FOCUS.SET",
      value: date.set({
        year
      })
    });
  }
  function getYearTableCellState(props6) {
    const { value, disabled: disabled2 } = props6;
    const dateValue = focusedValue.set({
      year: value
    });
    const decadeYears = getDecadeRange(startValue.year, {
      strict: true
    });
    const isOutsideVisibleRange = !decadeYears.includes(value);
    const isWithinMinMax = isValueWithinRange(value, min3?.year, max3?.year);
    const isInSelectedRange = isRangePicker && isDateWithinRange(dateValue, selectedValue);
    const isFirstInSelectedRange = isRangePicker && selectedValue[0] && $ad063034c8620db8$export$ea840f5a6dda8147(dateValue, selectedValue[0]);
    const isLastInSelectedRange = isRangePicker && selectedValue[1] && $ad063034c8620db8$export$ea840f5a6dda8147(dateValue, selectedValue[1]);
    const hasHoveredRange = isRangePicker && hoveredRangeValue.length > 0;
    const isInHoveredRange = hasHoveredRange && isDateWithinRange(dateValue, hoveredRangeValue);
    const isFirstInHoveredRange = hasHoveredRange && hoveredRangeValue[0] && $ad063034c8620db8$export$ea840f5a6dda8147(dateValue, hoveredRangeValue[0]);
    const isLastInHoveredRange = hasHoveredRange && hoveredRangeValue[1] && $ad063034c8620db8$export$ea840f5a6dda8147(dateValue, hoveredRangeValue[1]);
    const cellState = {
      focused: focusedValue.year === props6.value,
      selectable: !isOutsideVisibleRange && isWithinMinMax,
      outsideRange: isOutsideVisibleRange,
      selected: !!selectedValue.find((date) => date && date.year === value),
      valueText: value.toString(),
      inRange: isInSelectedRange || isInHoveredRange,
      firstInRange: !!isFirstInSelectedRange,
      lastInRange: !!isLastInSelectedRange,
      inHoveredRange: !!isInHoveredRange,
      firstInHoveredRange: !!isFirstInHoveredRange,
      lastInHoveredRange: !!isLastInHoveredRange,
      value: dateValue,
      get disabled() {
        return disabled2 || !cellState.selectable;
      }
    };
    return cellState;
  }
  function getMonthTableCellState(props6) {
    const { value, disabled: disabled2 } = props6;
    const dateValue = focusedValue.set({
      month: value
    });
    const formatter = getMonthFormatter(locale, timeZone, focusedValue);
    const isInSelectedRange = isRangePicker && isDateWithinRange(dateValue, selectedValue);
    const isFirstInSelectedRange = isRangePicker && selectedValue[0] && $ad063034c8620db8$export$5a8da0c44a3afdf2(dateValue, selectedValue[0]);
    const isLastInSelectedRange = isRangePicker && selectedValue[1] && $ad063034c8620db8$export$5a8da0c44a3afdf2(dateValue, selectedValue[1]);
    const hasHoveredRange = isRangePicker && hoveredRangeValue.length > 0;
    const isInHoveredRange = hasHoveredRange && isDateWithinRange(dateValue, hoveredRangeValue);
    const isFirstInHoveredRange = hasHoveredRange && hoveredRangeValue[0] && $ad063034c8620db8$export$5a8da0c44a3afdf2(dateValue, hoveredRangeValue[0]);
    const isLastInHoveredRange = hasHoveredRange && hoveredRangeValue[1] && $ad063034c8620db8$export$5a8da0c44a3afdf2(dateValue, hoveredRangeValue[1]);
    const cellState = {
      focused: focusedValue.month === props6.value,
      selectable: !isDateOutsideRange(dateValue, min3, max3),
      selected: !!selectedValue.find((date) => date && date.month === value && date.year === focusedValue.year),
      valueText: formatter.format(dateValue.toDate(timeZone)),
      inRange: isInSelectedRange || isInHoveredRange,
      firstInRange: !!isFirstInSelectedRange,
      lastInRange: !!isLastInSelectedRange,
      inHoveredRange: !!isInHoveredRange,
      firstInHoveredRange: !!isFirstInHoveredRange,
      lastInHoveredRange: !!isLastInHoveredRange,
      outsideRange: false,
      value: dateValue,
      get disabled() {
        return disabled2 || !cellState.selectable;
      }
    };
    return cellState;
  }
  function getDayTableCellState(props6) {
    const { value, disabled: disabled2, visibleRange = computed("visibleRange") } = props6;
    const formatter = getDayFormatter(locale, timeZone, focusedValue);
    const unitDuration = getUnitDuration(computed("visibleDuration"));
    const outsideDaySelectable = prop("outsideDaySelectable");
    const end = visibleRange.start.add(unitDuration).subtract({
      days: 1
    });
    const isOutsideRange = isDateOutsideRange(value, visibleRange.start, end);
    const isInSelectedRange = isRangePicker && isDateWithinRange(value, selectedValue);
    const isFirstInSelectedRange = isRangePicker && selectedValue[0] && $ad063034c8620db8$export$ea39ec197993aef0(value, selectedValue[0]);
    const isLastInSelectedRange = isRangePicker && selectedValue[1] && $ad063034c8620db8$export$ea39ec197993aef0(value, selectedValue[1]);
    const hasHoveredRange = isRangePicker && hoveredRangeValue.length > 0;
    const isInHoveredRange = hasHoveredRange && isDateWithinRange(value, hoveredRangeValue);
    const isFirstInHoveredRange = hasHoveredRange && hoveredRangeValue[0] && $ad063034c8620db8$export$ea39ec197993aef0(value, hoveredRangeValue[0]);
    const isLastInHoveredRange = hasHoveredRange && hoveredRangeValue[1] && $ad063034c8620db8$export$ea39ec197993aef0(value, hoveredRangeValue[1]);
    const isSelected = selectedValue.some((date) => date != null && $ad063034c8620db8$export$ea39ec197993aef0(value, date));
    const cellState = {
      invalid: isDateOutsideRange(value, min3, max3),
      disabled: disabled2 || !outsideDaySelectable && isOutsideRange || isDateOutsideRange(value, min3, max3) || // Disable unselected dates when max is reached in multiple selection mode
      isMaxSelected && !isSelected,
      selected: isSelected,
      unavailable: isDateUnavailable(value, isDateUnavailableFn, locale, min3, max3) && !disabled2,
      outsideRange: isOutsideRange,
      today: $ad063034c8620db8$export$629b0a497aa65267(value, timeZone),
      weekend: $ad063034c8620db8$export$618d60ea299da42(value, locale),
      value,
      valueText: formatter.format(value.toDate(timeZone)),
      get focused() {
        return focusedValue != null && $ad063034c8620db8$export$ea39ec197993aef0(value, focusedValue) && (!cellState.outsideRange || outsideDaySelectable);
      },
      get selectable() {
        return !cellState.disabled && !cellState.unavailable;
      },
      // Range states
      inRange: isInSelectedRange || isInHoveredRange,
      firstInRange: isFirstInSelectedRange,
      lastInRange: isLastInSelectedRange,
      // Preview range states
      inHoveredRange: isInHoveredRange,
      firstInHoveredRange: isFirstInHoveredRange,
      lastInHoveredRange: isLastInHoveredRange
    };
    return cellState;
  }
  function getTableId2(props6) {
    const { view = "day", id } = props6;
    return [
      view,
      id
    ].filter(Boolean).join(" ");
  }
  return {
    focused,
    open,
    disabled,
    invalid,
    readOnly,
    inline: !!prop("inline"),
    numOfMonths: prop("numOfMonths"),
    showWeekNumbers: !!prop("showWeekNumbers"),
    selectionMode: prop("selectionMode"),
    maxSelectedDates,
    isMaxSelected,
    view: context.get("view"),
    getRangePresetValue(preset) {
      return getDateRangePreset(preset, locale, timeZone);
    },
    getWeekNumber(week) {
      const firstDay = week[0];
      return firstDay ? getWeekOfYear(firstDay, locale) : 0;
    },
    getDaysInWeek(week, from = startValue) {
      return getDaysInWeek(week, from, locale, startOfWeek);
    },
    getOffset(duration) {
      const from = startValue.add(duration);
      const end = endValue.add(duration);
      const formatter = getMonthFormatter(locale, timeZone, focusedValue);
      return {
        visibleRange: {
          start: from,
          end
        },
        weeks: getMonthWeeks(from),
        visibleRangeText: {
          start: formatter.format(from.toDate(timeZone)),
          end: formatter.format(end.toDate(timeZone))
        }
      };
    },
    getMonthWeeks,
    isUnavailable,
    weeks: getMonthWeeks(),
    weekDays: getWeekDays(startValue, startOfWeek, timeZone, locale),
    visibleRangeText: computed("visibleRangeText"),
    value: selectedValue,
    valueAsDate: selectedValue.filter((date) => date != null).map((date) => date.toDate(timeZone)),
    valueAsString: computed("valueAsString"),
    focusedValue,
    focusedValueAsDate: focusedValue?.toDate(timeZone),
    focusedValueAsString: prop("format")(focusedValue, {
      locale,
      timeZone
    }),
    visibleRange: computed("visibleRange"),
    selectToday() {
      const value = constrainValue(getTodayDate(timeZone, focusedValue.calendar), min3, max3);
      send({
        type: "VALUE.SET",
        value: [
          value
        ]
      });
    },
    setValue(values) {
      const computedValue = values.map((date) => constrainValue(date, min3, max3));
      send({
        type: "VALUE.SET",
        value: computedValue
      });
    },
    setTime(time, index = 0) {
      const values = Array.from(selectedValue);
      let dateValue = values[index];
      if (!dateValue) return;
      if (!("hour" in dateValue)) {
        dateValue = $d07e34cce18680fd$export$b21e0b124e224484(dateValue);
      }
      dateValue = dateValue.set({
        hour: time.hour ?? ("hour" in dateValue ? dateValue.hour : 0),
        minute: time.minute ?? ("minute" in dateValue ? dateValue.minute : 0),
        second: time.second ?? ("second" in dateValue ? dateValue.second : 0),
        millisecond: time.millisecond ?? ("millisecond" in dateValue ? dateValue.millisecond : 0)
      });
      values[index] = constrainValue(dateValue, min3, max3);
      send({
        type: "VALUE.SET",
        value: values
      });
    },
    clearValue(options = {}) {
      const { focus = true } = options;
      send({
        type: "VALUE.CLEAR",
        focus
      });
    },
    setFocusedValue(value) {
      send({
        type: "FOCUS.SET",
        value
      });
    },
    setOpen(nextOpen) {
      if (prop("inline")) return;
      const open2 = state2.matches("open");
      if (open2 === nextOpen) return;
      send({
        type: nextOpen ? "OPEN" : "CLOSE"
      });
    },
    focusMonth,
    focusYear,
    getYears,
    getMonths,
    getYearsGrid(props6 = {}) {
      const { columns = 1 } = props6;
      const years = getDecadeRange(startValue.year, {
        strict: true
      }).map((year) => ({
        label: year.toString(),
        value: year,
        disabled: !isValueWithinRange(year, min3?.year, max3?.year)
      }));
      return chunk(years, columns);
    },
    getDecade() {
      const years = getDecadeRange(startValue.year, {
        strict: true
      });
      return {
        start: years.at(0),
        end: years.at(-1)
      };
    },
    getMonthsGrid(props6 = {}) {
      const { columns = 1, format } = props6;
      return chunk(getMonths({
        format
      }), columns);
    },
    format(value, opts = {
      month: "long",
      year: "numeric"
    }) {
      return new $12a3c853105e5a70$export$ad991b66133851cf(locale, {
        ...opts,
        calendar: value.calendar.identifier
      }).format(value.toDate(timeZone));
    },
    setView(view) {
      send({
        type: "VIEW.SET",
        view
      });
    },
    goToNext() {
      send({
        type: "GOTO.NEXT",
        view: context.get("view")
      });
    },
    goToPrev() {
      send({
        type: "GOTO.PREV",
        view: context.get("view")
      });
    },
    getRootProps() {
      return normalize.element({
        ...parts2.root.attrs,
        dir: prop("dir"),
        id: getRootId2(scope),
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-empty": dataAttr(empty)
      });
    },
    getLabelProps(props6 = {}) {
      const { index = 0 } = props6;
      return normalize.label({
        ...parts2.label.attrs,
        id: getLabelId2(scope, index),
        dir: prop("dir"),
        htmlFor: getInputId2(scope, index),
        "data-state": open ? "open" : "closed",
        "data-index": index,
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly)
      });
    },
    getControlProps() {
      return normalize.element({
        ...parts2.control.attrs,
        dir: prop("dir"),
        id: getControlId2(scope),
        "data-disabled": dataAttr(disabled),
        "data-placeholder-shown": dataAttr(empty)
      });
    },
    getRangeTextProps() {
      return normalize.element({
        ...parts2.rangeText.attrs,
        dir: prop("dir")
      });
    },
    getContentProps() {
      return normalize.element({
        ...parts2.content.attrs,
        hidden: !open,
        dir: prop("dir"),
        "data-state": open ? "open" : "closed",
        "data-placement": currentPlacement,
        "data-side": currentPlacementSide,
        "data-inline": dataAttr(prop("inline")),
        id: getContentId2(scope),
        tabIndex: -1,
        role: "application",
        "aria-roledescription": "datepicker",
        "aria-label": translations.content
      });
    },
    getTableProps(props6 = {}) {
      const { view = "day", columns = view === "day" ? 7 : 4 } = props6;
      const uid = getTableId2(props6);
      return normalize.element({
        ...parts2.table.attrs,
        role: "grid",
        "data-columns": columns,
        "aria-roledescription": getRoleDescription(view),
        id: getTableId(scope, uid),
        "aria-readonly": ariaAttr(readOnly),
        "aria-disabled": ariaAttr(disabled),
        "aria-multiselectable": ariaAttr(prop("selectionMode") !== "single"),
        "data-view": view,
        dir: prop("dir"),
        tabIndex: -1,
        onKeyDown(event) {
          if (event.defaultPrevented) return;
          if (disabled) return;
          const keyMap2 = {
            Enter() {
              if (!interactive) return;
              if (view === "day" && isUnavailable(focusedValue)) return;
              if (view === "month") {
                const cellState = getMonthTableCellState({
                  value: focusedValue.month
                });
                if (!cellState.selectable) return;
              }
              if (view === "year") {
                const cellState = getYearTableCellState({
                  value: focusedValue.year
                });
                if (!cellState.selectable) return;
              }
              send({
                type: "TABLE.ENTER",
                view,
                columns,
                focus: true
              });
            },
            ArrowLeft() {
              send({
                type: "TABLE.ARROW_LEFT",
                view,
                columns,
                focus: true
              });
            },
            ArrowRight() {
              send({
                type: "TABLE.ARROW_RIGHT",
                view,
                columns,
                focus: true
              });
            },
            ArrowUp() {
              send({
                type: "TABLE.ARROW_UP",
                view,
                columns,
                focus: true
              });
            },
            ArrowDown() {
              send({
                type: "TABLE.ARROW_DOWN",
                view,
                columns,
                focus: true
              });
            },
            PageUp(event2) {
              send({
                type: "TABLE.PAGE_UP",
                larger: event2.shiftKey,
                view,
                columns,
                focus: true
              });
            },
            PageDown(event2) {
              send({
                type: "TABLE.PAGE_DOWN",
                larger: event2.shiftKey,
                view,
                columns,
                focus: true
              });
            },
            Home() {
              send({
                type: "TABLE.HOME",
                view,
                columns,
                focus: true
              });
            },
            End() {
              send({
                type: "TABLE.END",
                view,
                columns,
                focus: true
              });
            }
          };
          const exec = keyMap2[getEventKey(event, {
            dir: prop("dir")
          })];
          if (exec) {
            exec(event);
            event.preventDefault();
            event.stopPropagation();
          }
        },
        onPointerLeave() {
          send({
            type: "TABLE.POINTER_LEAVE"
          });
        },
        onPointerDown() {
          send({
            type: "TABLE.POINTER_DOWN",
            view
          });
        },
        onPointerUp() {
          send({
            type: "TABLE.POINTER_UP",
            view
          });
        }
      });
    },
    getTableHeadProps(props6 = {}) {
      const { view = "day" } = props6;
      return normalize.element({
        ...parts2.tableHead.attrs,
        "aria-hidden": true,
        dir: prop("dir"),
        "data-view": view,
        "data-disabled": dataAttr(disabled)
      });
    },
    getTableHeaderProps(props6 = {}) {
      const { view = "day" } = props6;
      return normalize.element({
        ...parts2.tableHeader.attrs,
        dir: prop("dir"),
        "data-view": view,
        "data-disabled": dataAttr(disabled)
      });
    },
    getTableBodyProps(props6 = {}) {
      const { view = "day" } = props6;
      return normalize.element({
        ...parts2.tableBody.attrs,
        "data-view": view,
        "data-disabled": dataAttr(disabled)
      });
    },
    getTableRowProps(props6 = {}) {
      const { view = "day" } = props6;
      return normalize.element({
        ...parts2.tableRow.attrs,
        "aria-disabled": ariaAttr(disabled),
        "data-disabled": dataAttr(disabled),
        "data-view": view
      });
    },
    getWeekNumberHeaderCellProps(props6 = {}) {
      const { view = "day" } = props6;
      return normalize.element({
        ...parts2.tableCell.attrs,
        scope: "col",
        "aria-label": translations.weekColumnHeader,
        "data-view": view,
        "data-type": "week-number",
        "data-disabled": dataAttr(disabled)
      });
    },
    getWeekNumberCellProps(props6) {
      const { weekIndex, week } = props6;
      const weekNumber = week[0] ? getWeekOfYear(week[0], locale) : 0;
      return normalize.element({
        ...parts2.tableCell.attrs,
        role: "rowheader",
        "aria-label": translations.weekNumberCell?.(weekNumber),
        "data-view": "day",
        "data-week-index": weekIndex,
        "data-type": "week-number",
        "data-disabled": dataAttr(disabled)
      });
    },
    getDayTableCellState,
    getDayTableCellProps(props6) {
      const { value } = props6;
      const cellState = getDayTableCellState(props6);
      return normalize.element({
        ...parts2.tableCell.attrs,
        role: "gridcell",
        "aria-disabled": ariaAttr(!cellState.selectable),
        "aria-selected": cellState.selected || cellState.inRange,
        "aria-invalid": ariaAttr(cellState.invalid),
        "aria-current": cellState.today ? "date" : void 0,
        "data-value": value.toString()
      });
    },
    getDayTableCellTriggerProps(props6) {
      const { value } = props6;
      const cellState = getDayTableCellState(props6);
      return normalize.element({
        ...parts2.tableCellTrigger.attrs,
        id: getCellTriggerId(scope, value.toString()),
        role: "button",
        dir: prop("dir"),
        tabIndex: disabled ? -1 : cellState.focused ? 0 : -1,
        "aria-label": translations.dayCell(cellState),
        "aria-disabled": ariaAttr(!cellState.selectable),
        "aria-invalid": ariaAttr(cellState.invalid),
        "data-disabled": dataAttr(!cellState.selectable),
        "data-selectable": dataAttr(cellState.selectable),
        "data-selected": dataAttr(cellState.selected),
        "data-value": value.toString(),
        "data-view": "day",
        "data-today": dataAttr(cellState.today),
        "data-focus": dataAttr(cellState.focused),
        "data-unavailable": dataAttr(cellState.unavailable),
        "data-range-start": dataAttr(cellState.firstInRange),
        "data-range-end": dataAttr(cellState.lastInRange),
        "data-in-range": dataAttr(cellState.inRange),
        "data-outside-range": dataAttr(cellState.outsideRange),
        "data-weekend": dataAttr(cellState.weekend),
        "data-in-hover-range": dataAttr(cellState.inHoveredRange),
        "data-hover-range-start": dataAttr(cellState.firstInHoveredRange),
        "data-hover-range-end": dataAttr(cellState.lastInHoveredRange),
        onClick(event) {
          if (event.defaultPrevented) return;
          if (!interactive) return;
          if (!cellState.selectable) return;
          send({
            type: "CELL.CLICK",
            cell: "day",
            value
          });
        },
        onPointerMove: isRangePicker ? (event) => {
          if (event.pointerType === "touch") return;
          if (!cellState.selectable) return;
          const focus = !scope.isActiveElement(event.currentTarget);
          if (hoveredValue && $ad063034c8620db8$export$91b62ebf2ba703ee(value, hoveredValue)) return;
          send({
            type: "CELL.POINTER_MOVE",
            cell: "day",
            value,
            focus,
            outsideRange: cellState.outsideRange
          });
        } : void 0
      });
    },
    getMonthTableCellState,
    getMonthTableCellProps(props6) {
      const { value, columns } = props6;
      const cellState = getMonthTableCellState(props6);
      return normalize.element({
        ...parts2.tableCell.attrs,
        dir: prop("dir"),
        colSpan: columns,
        role: "gridcell",
        "aria-selected": ariaAttr(cellState.selected || cellState.inRange),
        "data-selected": dataAttr(cellState.selected),
        "aria-disabled": ariaAttr(!cellState.selectable),
        "data-value": value
      });
    },
    getMonthTableCellTriggerProps(props6) {
      const { value } = props6;
      const cellState = getMonthTableCellState(props6);
      return normalize.element({
        ...parts2.tableCellTrigger.attrs,
        id: getCellTriggerId(scope, value.toString()),
        role: "button",
        dir: prop("dir"),
        tabIndex: disabled ? -1 : cellState.focused ? 0 : -1,
        "aria-label": cellState.valueText,
        "aria-disabled": ariaAttr(!cellState.selectable),
        "data-disabled": dataAttr(!cellState.selectable),
        "data-selectable": dataAttr(cellState.selectable),
        "data-selected": dataAttr(cellState.selected),
        "data-value": value,
        "data-view": "month",
        "data-focus": dataAttr(cellState.focused),
        "data-outside-range": dataAttr(cellState.outsideRange),
        "data-range-start": dataAttr(cellState.firstInRange),
        "data-range-end": dataAttr(cellState.lastInRange),
        "data-in-range": dataAttr(cellState.inRange),
        "data-in-hover-range": dataAttr(cellState.inHoveredRange),
        "data-hover-range-start": dataAttr(cellState.firstInHoveredRange),
        "data-hover-range-end": dataAttr(cellState.lastInHoveredRange),
        onClick(event) {
          if (event.defaultPrevented) return;
          if (!interactive) return;
          if (!cellState.selectable) return;
          send({
            type: "CELL.CLICK",
            cell: "month",
            value
          });
        },
        onPointerMove: isRangePicker ? (event) => {
          if (event.pointerType === "touch") return;
          if (!cellState.selectable) return;
          const focus = !scope.isActiveElement(event.currentTarget);
          if (hoveredValue && cellState.value && $ad063034c8620db8$export$5a8da0c44a3afdf2(cellState.value, hoveredValue)) return;
          send({
            type: "CELL.POINTER_MOVE",
            cell: "month",
            value: cellState.value,
            focus
          });
        } : void 0
      });
    },
    getYearTableCellState,
    getYearTableCellProps(props6) {
      const { value, columns } = props6;
      const cellState = getYearTableCellState(props6);
      return normalize.element({
        ...parts2.tableCell.attrs,
        dir: prop("dir"),
        colSpan: columns,
        role: "gridcell",
        "aria-selected": ariaAttr(cellState.selected || cellState.inRange),
        "data-selected": dataAttr(cellState.selected),
        "aria-disabled": ariaAttr(!cellState.selectable),
        "data-value": value
      });
    },
    getYearTableCellTriggerProps(props6) {
      const { value } = props6;
      const cellState = getYearTableCellState(props6);
      return normalize.element({
        ...parts2.tableCellTrigger.attrs,
        id: getCellTriggerId(scope, value.toString()),
        role: "button",
        dir: prop("dir"),
        tabIndex: disabled ? -1 : cellState.focused ? 0 : -1,
        "aria-label": cellState.valueText,
        "aria-disabled": ariaAttr(!cellState.selectable),
        "data-disabled": dataAttr(!cellState.selectable),
        "data-selectable": dataAttr(cellState.selectable),
        "data-selected": dataAttr(cellState.selected),
        "data-value": value,
        "data-view": "year",
        "data-focus": dataAttr(cellState.focused),
        "data-outside-range": dataAttr(cellState.outsideRange),
        "data-range-start": dataAttr(cellState.firstInRange),
        "data-range-end": dataAttr(cellState.lastInRange),
        "data-in-range": dataAttr(cellState.inRange),
        "data-in-hover-range": dataAttr(cellState.inHoveredRange),
        "data-hover-range-start": dataAttr(cellState.firstInHoveredRange),
        "data-hover-range-end": dataAttr(cellState.lastInHoveredRange),
        onClick(event) {
          if (event.defaultPrevented) return;
          if (!interactive) return;
          if (!cellState.selectable) return;
          send({
            type: "CELL.CLICK",
            cell: "year",
            value
          });
        },
        onPointerMove: isRangePicker ? (event) => {
          if (event.pointerType === "touch") return;
          if (!cellState.selectable) return;
          const focus = !scope.isActiveElement(event.currentTarget);
          if (hoveredValue && cellState.value && $ad063034c8620db8$export$ea840f5a6dda8147(cellState.value, hoveredValue)) return;
          send({
            type: "CELL.POINTER_MOVE",
            cell: "year",
            value: cellState.value,
            focus
          });
        } : void 0
      });
    },
    getNextTriggerProps(props6 = {}) {
      const { view = "day" } = props6;
      const isDisabled = disabled || !computed("isNextVisibleRangeValid");
      return normalize.button({
        ...parts2.nextTrigger.attrs,
        dir: prop("dir"),
        id: getNextTriggerId(scope, view),
        type: "button",
        "aria-label": translations.nextTrigger(view),
        disabled: isDisabled,
        "data-disabled": dataAttr(isDisabled),
        onClick(event) {
          if (event.defaultPrevented) return;
          send({
            type: "GOTO.NEXT",
            view
          });
        }
      });
    },
    getPrevTriggerProps(props6 = {}) {
      const { view = "day" } = props6;
      const isDisabled = disabled || !computed("isPrevVisibleRangeValid");
      return normalize.button({
        ...parts2.prevTrigger.attrs,
        dir: prop("dir"),
        id: getPrevTriggerId(scope, view),
        type: "button",
        "aria-label": translations.prevTrigger(view),
        disabled: isDisabled,
        "data-disabled": dataAttr(isDisabled),
        onClick(event) {
          if (event.defaultPrevented) return;
          send({
            type: "GOTO.PREV",
            view
          });
        }
      });
    },
    getClearTriggerProps() {
      return normalize.button({
        ...parts2.clearTrigger.attrs,
        id: getClearTriggerId2(scope),
        dir: prop("dir"),
        type: "button",
        "aria-label": translations.clearTrigger,
        hidden: !selectedValue.length,
        onClick(event) {
          if (event.defaultPrevented) return;
          if (!interactive) return;
          send({
            type: "VALUE.CLEAR"
          });
        }
      });
    },
    getTriggerProps() {
      return normalize.button({
        ...parts2.trigger.attrs,
        id: getTriggerId2(scope),
        dir: prop("dir"),
        type: "button",
        "data-placement": currentPlacement,
        "data-side": currentPlacementSide,
        "aria-label": translations.trigger(open),
        "aria-controls": getContentId2(scope),
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        "data-placeholder-shown": dataAttr(empty),
        "aria-haspopup": "grid",
        disabled,
        onClick(event) {
          if (event.defaultPrevented) return;
          if (!interactive) return;
          send({
            type: "TRIGGER.CLICK"
          });
        }
      });
    },
    getViewProps(props6 = {}) {
      const { view = "day" } = props6;
      return normalize.element({
        ...parts2.view.attrs,
        "data-view": view,
        hidden: context.get("view") !== view
      });
    },
    getViewTriggerProps(props6 = {}) {
      const { view = "day" } = props6;
      return normalize.button({
        ...parts2.viewTrigger.attrs,
        "data-view": view,
        dir: prop("dir"),
        id: getViewTriggerId(scope, view),
        type: "button",
        disabled,
        "aria-label": translations.viewTrigger(view),
        onClick(event) {
          if (event.defaultPrevented) return;
          if (!interactive) return;
          send({
            type: "VIEW.TOGGLE",
            src: "viewTrigger"
          });
        }
      });
    },
    getViewControlProps(props6 = {}) {
      const { view = "day" } = props6;
      return normalize.element({
        ...parts2.viewControl.attrs,
        "data-view": view,
        dir: prop("dir")
      });
    },
    getInputProps(props6 = {}) {
      const { index = 0, fixOnBlur = true } = props6;
      return normalize.input({
        ...parts2.input.attrs,
        id: getInputId2(scope, index),
        autoComplete: "off",
        autoCorrect: "off",
        spellCheck: "false",
        dir: prop("dir"),
        name: prop("name"),
        "data-index": index,
        "data-state": open ? "open" : "closed",
        "data-placeholder-shown": dataAttr(empty),
        readOnly,
        disabled,
        required: prop("required"),
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        placeholder: prop("placeholder") || getInputPlaceholder(locale),
        defaultValue: computed("valueAsString")[index],
        onBeforeInput(event) {
          const { data } = getNativeEvent(event);
          if (!isValidCharacter(data, separator, locale)) {
            event.preventDefault();
          }
        },
        onClick(event) {
          if (event.defaultPrevented) return;
          if (!prop("openOnClick")) return;
          if (!interactive) return;
          send({
            type: "OPEN",
            src: "input.click"
          });
        },
        onFocus() {
          send({
            type: "INPUT.FOCUS",
            index
          });
        },
        onBlur(event) {
          const value = event.currentTarget.value.trim();
          send({
            type: "INPUT.BLUR",
            value,
            index,
            fixOnBlur
          });
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return;
          if (!interactive) return;
          const keyMap2 = {
            Enter(event2) {
              if (isComposingEvent(event2)) return;
              if (isUnavailable(focusedValue)) return;
              if (event2.currentTarget.value.trim() === "") return;
              send({
                type: "INPUT.ENTER",
                value: event2.currentTarget.value,
                index
              });
            }
          };
          const exec = keyMap2[event.key];
          if (exec) {
            exec(event);
            event.preventDefault();
          }
        },
        onInput(event) {
          const value = event.currentTarget.value;
          send({
            type: "INPUT.CHANGE",
            value: ensureValidCharacters(value, separator, locale),
            index
          });
        }
      });
    },
    getMonthSelectProps() {
      return normalize.select({
        ...parts2.monthSelect.attrs,
        id: getMonthSelectId(scope),
        "aria-label": translations.monthSelect,
        disabled,
        dir: prop("dir"),
        defaultValue: startValue.month,
        onChange(event) {
          focusMonth(Number(event.currentTarget.value));
        }
      });
    },
    getYearSelectProps() {
      return normalize.select({
        ...parts2.yearSelect.attrs,
        id: getYearSelectId(scope),
        disabled,
        "aria-label": translations.yearSelect,
        dir: prop("dir"),
        defaultValue: startValue.year,
        onChange(event) {
          focusYear(Number(event.currentTarget.value));
        }
      });
    },
    getPositionerProps() {
      return normalize.element({
        id: getPositionerId2(scope),
        ...parts2.positioner.attrs,
        dir: prop("dir"),
        style: popperStyles.floating
      });
    },
    getPresetTriggerProps(props6) {
      const value = Array.isArray(props6.value) ? props6.value : getDateRangePreset(props6.value, locale, timeZone);
      const valueAsString = value.filter((item) => item != null).map((item) => item.toDate(timeZone).toDateString());
      return normalize.button({
        ...parts2.presetTrigger.attrs,
        "aria-label": translations.presetTrigger(valueAsString),
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return;
          if (!interactive) return;
          send({
            type: "PRESET.CLICK",
            value
          });
        }
      });
    }
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-picker/1.43.0/dist/date-picker.machine.mjs
var { and: and2 } = createGuards();
function isDateArrayEqual(a, b) {
  if (a?.length !== b?.length) return false;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (!isDateEqual(a[i], b[i])) return false;
  }
  return true;
}
function getValueAsString(value, prop) {
  return value.map((date) => {
    if (date == null) return "";
    return prop("format")(date, {
      locale: prop("locale"),
      timeZone: prop("timeZone")
    });
  });
}
var machine2 = createMachine({
  props({ props: props6 }) {
    const locale = props6.locale || "en-US";
    const timeZone = props6.timeZone || "UTC";
    const selectionMode = props6.selectionMode || "single";
    const numOfMonths = props6.numOfMonths || 1;
    let calendar;
    if (props6.createCalendar) {
      const resolved = new Intl.DateTimeFormat(locale).resolvedOptions();
      const calendarId = resolved.calendar;
      if (calendarId !== "gregory" && calendarId !== "iso8601") {
        calendar = props6.createCalendar(calendarId);
      }
    }
    const toTargetCalendar = (date) => {
      if (!calendar) return date;
      if (date.calendar.identifier === calendar.identifier) return date;
      return $d07e34cce18680fd$export$b4a036af3fc0b032(date, calendar);
    };
    const defaultValue = props6.defaultValue ? sortDates(props6.defaultValue).map((date) => constrainValue(toTargetCalendar(date), props6.min, props6.max)) : void 0;
    const value = props6.value ? sortDates(props6.value).map((date) => constrainValue(toTargetCalendar(date), props6.min, props6.max)) : void 0;
    let focusedValue = props6.focusedValue || props6.defaultFocusedValue || value?.[0] || defaultValue?.[0] || getTodayDate(timeZone, calendar);
    focusedValue = constrainValue(toTargetCalendar(focusedValue), props6.min, props6.max);
    const minView = props6.minView || "day";
    const maxView = props6.maxView || "year";
    const defaultView = clampView(props6.defaultView || props6.view || minView, minView, maxView);
    return {
      locale,
      numOfMonths,
      timeZone,
      selectionMode,
      minView,
      maxView,
      outsideDaySelectable: false,
      closeOnSelect: true,
      format(date, { locale: locale2, timeZone: timeZone2 }) {
        const formatter = new $12a3c853105e5a70$export$ad991b66133851cf(locale2, {
          timeZone: timeZone2,
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          calendar: calendar?.identifier
        });
        return formatter.format(date.toDate(timeZone2));
      },
      parse(value2, { locale: locale2, timeZone: timeZone2 }) {
        return parseDateString(value2, locale2, timeZone2);
      },
      ...props6,
      focusedValue: typeof props6.focusedValue === "undefined" ? void 0 : focusedValue,
      defaultFocusedValue: focusedValue,
      value,
      defaultValue: defaultValue ?? [],
      defaultView,
      positioning: {
        placement: "bottom",
        ...props6.positioning
      }
    };
  },
  initialState({ prop }) {
    const open = prop("inline") || (prop("open") ?? prop("defaultOpen"));
    return open ? "open" : "idle";
  },
  refs() {
    return {
      announcer: void 0
    };
  },
  context({ prop, bindable: bindable2, getContext }) {
    return {
      focusedValue: bindable2(() => ({
        defaultValue: prop("defaultFocusedValue"),
        value: prop("focusedValue"),
        isEqual: isDateEqual,
        hash: (v) => v.toString(),
        sync: true,
        onChange(focusedValue) {
          const context = getContext();
          const view = context.get("view");
          const value = context.get("value");
          const valueAsString = getValueAsString(value, prop);
          prop("onFocusChange")?.({
            value,
            valueAsString,
            view,
            focusedValue
          });
        }
      })),
      value: bindable2(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        isEqual: isDateArrayEqual,
        hash: (v) => v.map((date) => date?.toString() ?? "").join(","),
        onChange(value) {
          const context = getContext();
          const valueAsString = getValueAsString(value, prop);
          prop("onValueChange")?.({
            value,
            valueAsString,
            view: context.get("view")
          });
        }
      })),
      inputValue: bindable2(() => ({
        defaultValue: ""
      })),
      activeIndex: bindable2(() => ({
        defaultValue: 0,
        sync: true
      })),
      hoveredValue: bindable2(() => ({
        defaultValue: null,
        isEqual: isDateEqual
      })),
      view: bindable2(() => ({
        defaultValue: prop("defaultView"),
        value: prop("view"),
        onChange(value) {
          prop("onViewChange")?.({
            view: value
          });
        }
      })),
      startValue: bindable2(() => {
        const focusedValue = prop("focusedValue") || prop("defaultFocusedValue");
        return {
          defaultValue: alignDate(focusedValue, "start", {
            months: prop("numOfMonths")
          }, prop("locale")),
          isEqual: isDateEqual,
          hash: (v) => v.toString()
        };
      }),
      currentPlacement: bindable2(() => ({
        defaultValue: void 0
      })),
      restoreFocus: bindable2(() => ({
        defaultValue: false
      }))
    };
  },
  computed: {
    isInteractive: ({ prop }) => !prop("disabled") && !prop("readOnly"),
    visibleDuration: ({ prop }) => ({
      months: prop("numOfMonths")
    }),
    endValue: ({ context, computed }) => getEndDate(context.get("startValue"), computed("visibleDuration")),
    visibleRange: ({ context, computed }) => ({
      start: context.get("startValue"),
      end: computed("endValue")
    }),
    visibleRangeText: ({ context, prop, computed }) => getVisibleRangeText({
      view: context.get("view"),
      startValue: context.get("startValue"),
      endValue: computed("endValue"),
      locale: prop("locale"),
      timeZone: prop("timeZone"),
      selectionMode: prop("selectionMode")
    }),
    isPrevVisibleRangeValid: ({ context, prop }) => !isPreviousRangeInvalid(context.get("startValue"), prop("min"), prop("max")),
    isNextVisibleRangeValid: ({ prop, computed }) => !isNextRangeInvalid(computed("endValue"), prop("min"), prop("max")),
    valueAsString: ({ context, prop }) => getValueAsString(context.get("value"), prop)
  },
  effects: [
    "setupLiveRegion"
  ],
  watch({ track, prop, context, action, computed }) {
    track([
      () => prop("locale")
    ], () => {
      action([
        "setStartValue",
        "syncInputElement"
      ]);
    });
    track([
      () => context.hash("focusedValue")
    ], () => {
      action([
        "setStartValue",
        "focusActiveCellIfNeeded",
        "setHoveredValueIfKeyboard"
      ]);
    });
    track([
      () => context.hash("startValue")
    ], () => {
      action([
        "syncMonthSelectElement",
        "syncYearSelectElement",
        "invokeOnVisibleRangeChange"
      ]);
    });
    track([
      () => context.get("inputValue")
    ], () => {
      action([
        "syncInputValue"
      ]);
    });
    track([
      () => context.hash("value")
    ], () => {
      action([
        "syncInputElement"
      ]);
    });
    track([
      () => computed("valueAsString").toString()
    ], () => {
      action([
        "announceValueText"
      ]);
    });
    track([
      () => context.get("view")
    ], () => {
      action([
        "focusActiveCell"
      ]);
    });
    track([
      () => prop("open")
    ], () => {
      action([
        "toggleVisibility"
      ]);
    });
  },
  on: {
    "VALUE.SET": {
      actions: [
        "setDateValue",
        "setFocusedDate"
      ]
    },
    "VIEW.SET": {
      actions: [
        "setView"
      ]
    },
    "FOCUS.SET": {
      actions: [
        "setFocusedDate"
      ]
    },
    "VALUE.CLEAR": {
      actions: [
        "clearDateValue",
        "clearFocusedDate",
        "setActiveIndexToStart",
        "clearHoveredDate",
        "focusFirstInputElement"
      ]
    },
    "INPUT.CHANGE": [
      {
        guard: "isInputValueEmpty",
        actions: [
          "setInputValue",
          "clearDateValue",
          "clearFocusedDate"
        ]
      },
      {
        actions: [
          "setInputValue",
          "focusParsedDate"
        ]
      }
    ],
    "INPUT.ENTER": {
      actions: [
        "focusParsedDate",
        "selectFocusedDate"
      ]
    },
    "INPUT.FOCUS": {
      actions: [
        "setActiveIndex"
      ]
    },
    "INPUT.BLUR": [
      {
        guard: "shouldFixOnBlur",
        actions: [
          "setActiveIndexToStart",
          "selectParsedDate"
        ]
      },
      {
        actions: [
          "setActiveIndexToStart"
        ]
      }
    ],
    "PRESET.CLICK": [
      {
        guard: "isOpenControlled",
        actions: [
          "setDateValue",
          "setFocusedDate",
          "invokeOnClose"
        ]
      },
      {
        target: "focused",
        actions: [
          "setDateValue",
          "setFocusedDate",
          "focusInputElement"
        ]
      }
    ],
    "GOTO.NEXT": [
      {
        guard: "isYearView",
        actions: [
          "focusNextDecade",
          "announceVisibleRange"
        ]
      },
      {
        guard: "isMonthView",
        actions: [
          "focusNextYear",
          "announceVisibleRange"
        ]
      },
      {
        actions: [
          "focusNextPage"
        ]
      }
    ],
    "GOTO.PREV": [
      {
        guard: "isYearView",
        actions: [
          "focusPreviousDecade",
          "announceVisibleRange"
        ]
      },
      {
        guard: "isMonthView",
        actions: [
          "focusPreviousYear",
          "announceVisibleRange"
        ]
      },
      {
        actions: [
          "focusPreviousPage"
        ]
      }
    ]
  },
  states: {
    idle: {
      tags: [
        "closed"
      ],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
          actions: [
            "resetView",
            "focusFirstSelectedDate",
            "focusActiveCell"
          ]
        },
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnOpen"
            ]
          },
          {
            target: "open",
            actions: [
              "resetView",
              "focusFirstSelectedDate",
              "focusActiveCell",
              "invokeOnOpen"
            ]
          }
        ],
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnOpen"
            ]
          },
          {
            target: "open",
            actions: [
              "resetView",
              "focusFirstSelectedDate",
              "focusActiveCell",
              "invokeOnOpen"
            ]
          }
        ]
      }
    },
    focused: {
      tags: [
        "closed"
      ],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
          actions: [
            "resetView",
            "focusFirstSelectedDate",
            "focusActiveCell"
          ]
        },
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnOpen"
            ]
          },
          {
            target: "open",
            actions: [
              "resetView",
              "focusFirstSelectedDate",
              "focusActiveCell",
              "invokeOnOpen"
            ]
          }
        ],
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnOpen"
            ]
          },
          {
            target: "open",
            actions: [
              "resetView",
              "focusFirstSelectedDate",
              "focusActiveCell",
              "invokeOnOpen"
            ]
          }
        ]
      }
    },
    open: {
      tags: [
        "open"
      ],
      entry: [
        "resumeRangeSelection"
      ],
      effects: [
        "trackDismissableElement",
        "trackPositioning"
      ],
      exit: [
        "clearHoveredDate"
      ],
      on: {
        "CONTROLLED.CLOSE": [
          {
            guard: and2("shouldRestoreFocus", "isInteractOutsideEvent"),
            target: "focused",
            actions: [
              "focusTriggerElement"
            ]
          },
          {
            guard: "shouldRestoreFocus",
            target: "focused",
            actions: [
              "focusInputElement"
            ]
          },
          {
            target: "idle"
          }
        ],
        "CELL.CLICK": [
          {
            guard: "isAboveMinView",
            actions: [
              "setFocusedValueForView",
              "setPreviousView"
            ]
          },
          {
            guard: and2("isRangePicker", "hasSelectedRange"),
            actions: [
              "setActiveIndexToStart",
              "resetSelection",
              "setActiveIndexToEnd"
            ]
          },
          // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
          {
            guard: and2("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
            actions: [
              "setFocusedDate",
              "setSelectedDate",
              "setActiveIndexToStart",
              "clearHoveredDate",
              "invokeOnClose",
              "setRestoreFocus"
            ]
          },
          {
            guard: and2("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
            target: "focused",
            actions: [
              "setFocusedDate",
              "setSelectedDate",
              "setActiveIndexToStart",
              "clearHoveredDate",
              "invokeOnClose",
              "focusInputElement"
            ]
          },
          {
            guard: and2("isRangePicker", "isSelectingEndDate"),
            actions: [
              "setFocusedDate",
              "setSelectedDate",
              "setActiveIndexToStart",
              "clearHoveredDate"
            ]
          },
          // ===
          {
            guard: "isRangePicker",
            actions: [
              "setFocusedDate",
              "setSelectedDate",
              "setActiveIndexToEnd"
            ]
          },
          {
            guard: and2("isMultiPicker", "canSelectDate"),
            actions: [
              "setFocusedDate",
              "toggleSelectedDate"
            ]
          },
          {
            guard: "isMultiPicker",
            actions: [
              "setFocusedDate"
            ]
          },
          // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
          {
            guard: and2("closeOnSelect", "isOpenControlled"),
            actions: [
              "setFocusedDate",
              "setSelectedDate",
              "invokeOnClose"
            ]
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: [
              "setFocusedDate",
              "setSelectedDate",
              "invokeOnClose",
              "focusInputElement"
            ]
          },
          {
            actions: [
              "setFocusedDate",
              "setSelectedDate"
            ]
          }
        ],
        "CELL.POINTER_MOVE": [
          {
            guard: and2("isRangePicker", "isSelectingEndDate", "isDayPointerMoveOutsideVisibleMonth"),
            actions: [
              "setHoveredDate"
            ]
          },
          {
            guard: and2("isRangePicker", "isSelectingEndDate"),
            actions: [
              "setHoveredDate",
              "setFocusedDate"
            ]
          }
        ],
        "TABLE.POINTER_LEAVE": {
          guard: "isRangePicker",
          actions: [
            "clearHoveredDate"
          ]
        },
        "TABLE.POINTER_DOWN": {
          actions: [
            "disableTextSelection"
          ]
        },
        "TABLE.POINTER_UP": {
          actions: [
            "enableTextSelection"
          ]
        },
        "TABLE.ESCAPE": [
          {
            guard: "isOpenControlled",
            actions: [
              "focusFirstSelectedDate",
              "invokeOnClose"
            ]
          },
          {
            target: "focused",
            actions: [
              "focusFirstSelectedDate",
              "invokeOnClose",
              "focusTriggerElement"
            ]
          }
        ],
        "TABLE.ENTER": [
          {
            guard: "isAboveMinView",
            actions: [
              "setPreviousView"
            ]
          },
          {
            guard: and2("isRangePicker", "hasSelectedRange"),
            actions: [
              "setActiveIndexToStart",
              "resetSelection",
              "setActiveIndexToEnd",
              "focusNextDay"
            ]
          },
          // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
          {
            guard: and2("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
            actions: [
              "setSelectedDate",
              "setActiveIndexToStart",
              "clearHoveredDate",
              "invokeOnClose"
            ]
          },
          {
            guard: and2("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
            target: "focused",
            actions: [
              "setSelectedDate",
              "setActiveIndexToStart",
              "clearHoveredDate",
              "invokeOnClose",
              "focusInputElement"
            ]
          },
          {
            guard: and2("isRangePicker", "isSelectingEndDate"),
            actions: [
              "setSelectedDate",
              "setActiveIndexToStart",
              "clearHoveredDate"
            ]
          },
          // ===
          {
            guard: "isRangePicker",
            actions: [
              "setSelectedDate",
              "setActiveIndexToEnd",
              "focusNextDay"
            ]
          },
          {
            guard: and2("isMultiPicker", "canSelectDate"),
            actions: [
              "toggleSelectedDate"
            ]
          },
          {
            guard: "isMultiPicker"
          },
          // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
          {
            guard: and2("closeOnSelect", "isOpenControlled"),
            actions: [
              "selectFocusedDate",
              "invokeOnClose"
            ]
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: [
              "selectFocusedDate",
              "invokeOnClose",
              "focusInputElement"
            ]
          },
          {
            actions: [
              "selectFocusedDate"
            ]
          }
        ],
        "TABLE.ARROW_RIGHT": [
          {
            guard: "isMonthView",
            actions: [
              "focusNextMonth"
            ]
          },
          {
            guard: "isYearView",
            actions: [
              "focusNextYear"
            ]
          },
          {
            actions: [
              "focusNextDay",
              "setHoveredDate"
            ]
          }
        ],
        "TABLE.ARROW_LEFT": [
          {
            guard: "isMonthView",
            actions: [
              "focusPreviousMonth"
            ]
          },
          {
            guard: "isYearView",
            actions: [
              "focusPreviousYear"
            ]
          },
          {
            actions: [
              "focusPreviousDay"
            ]
          }
        ],
        "TABLE.ARROW_UP": [
          {
            guard: "isMonthView",
            actions: [
              "focusPreviousMonthColumn"
            ]
          },
          {
            guard: "isYearView",
            actions: [
              "focusPreviousYearColumn"
            ]
          },
          {
            actions: [
              "focusPreviousWeek"
            ]
          }
        ],
        "TABLE.ARROW_DOWN": [
          {
            guard: "isMonthView",
            actions: [
              "focusNextMonthColumn"
            ]
          },
          {
            guard: "isYearView",
            actions: [
              "focusNextYearColumn"
            ]
          },
          {
            actions: [
              "focusNextWeek"
            ]
          }
        ],
        "TABLE.PAGE_UP": {
          actions: [
            "focusPreviousSection"
          ]
        },
        "TABLE.PAGE_DOWN": {
          actions: [
            "focusNextSection"
          ]
        },
        "TABLE.HOME": [
          {
            guard: "isMonthView",
            actions: [
              "focusFirstMonth"
            ]
          },
          {
            guard: "isYearView",
            actions: [
              "focusFirstYear"
            ]
          },
          {
            actions: [
              "focusSectionStart"
            ]
          }
        ],
        "TABLE.END": [
          {
            guard: "isMonthView",
            actions: [
              "focusLastMonth"
            ]
          },
          {
            guard: "isYearView",
            actions: [
              "focusLastYear"
            ]
          },
          {
            actions: [
              "focusSectionEnd"
            ]
          }
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnClose"
            ]
          },
          {
            target: "focused",
            actions: [
              "invokeOnClose"
            ]
          }
        ],
        "VIEW.TOGGLE": {
          actions: [
            "setNextView"
          ]
        },
        INTERACT_OUTSIDE: [
          {
            guard: "isOpenControlled",
            actions: [
              "setActiveIndexToStart",
              "invokeOnClose"
            ]
          },
          {
            guard: "shouldRestoreFocus",
            target: "focused",
            actions: [
              "setActiveIndexToStart",
              "invokeOnClose",
              "focusTriggerElement"
            ]
          },
          {
            target: "idle",
            actions: [
              "setActiveIndexToStart",
              "invokeOnClose"
            ]
          }
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: [
              "setActiveIndexToStart",
              "invokeOnClose"
            ]
          },
          {
            target: "idle",
            actions: [
              "setActiveIndexToStart",
              "invokeOnClose"
            ]
          }
        ]
      }
    }
  },
  implementations: {
    guards: {
      isAboveMinView: ({ context, prop }) => isAboveMinView(context.get("view"), prop("minView")),
      isDayView: ({ context, event }) => (event.view || context.get("view")) === "day",
      isMonthView: ({ context, event }) => (event.view || context.get("view")) === "month",
      isYearView: ({ context, event }) => (event.view || context.get("view")) === "year",
      isRangePicker: ({ prop }) => prop("selectionMode") === "range",
      hasSelectedRange: ({ context }) => context.get("value").length === 2,
      isMultiPicker: ({ prop }) => prop("selectionMode") === "multiple",
      canSelectDate: (params) => {
        const { context, prop, event } = params;
        const maxSelectedDates = prop("maxSelectedDates");
        if (maxSelectedDates == null) return true;
        const existingValues = context.get("value");
        const currentValue = normalizeValue(params, event.value ?? context.get("focusedValue"));
        const isDeselecting = existingValues.some((date) => isDateEqual(date, currentValue));
        if (isDeselecting) return true;
        return existingValues.length < maxSelectedDates;
      },
      shouldRestoreFocus: ({ context }) => !!context.get("restoreFocus"),
      isSelectingEndDate: ({ context }) => context.get("activeIndex") === 1,
      closeOnSelect: ({ prop }) => !!prop("closeOnSelect"),
      isOpenControlled: ({ prop }) => prop("open") != void 0 || !!prop("inline"),
      isInteractOutsideEvent: ({ event }) => event.previousEvent?.type === "INTERACT_OUTSIDE",
      isInputValueEmpty: ({ event }) => event.value.trim() === "",
      shouldFixOnBlur: ({ event }) => !!event.fixOnBlur,
      isDayPointerMoveOutsideVisibleMonth: ({ event }) => event.cell === "day" && event.outsideRange === true
    },
    effects: {
      trackPositioning({ context, prop, scope }) {
        if (prop("inline")) return;
        if (!context.get("currentPlacement")) {
          context.set("currentPlacement", prop("positioning").placement);
        }
        const anchorEl = getControlEl2(scope);
        const getPositionerEl22 = () => getPositionerEl2(scope);
        return getPlacement(anchorEl, getPositionerEl22, {
          ...prop("positioning"),
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement);
          }
        });
      },
      setupLiveRegion({ scope, refs }) {
        const doc = scope.getDoc();
        refs.set("announcer", createLiveRegion({
          level: "assertive",
          document: doc
        }));
        return () => refs.get("announcer")?.destroy?.();
      },
      trackDismissableElement({ scope, send, context, prop }) {
        if (prop("inline")) return;
        const getContentEl22 = () => getContentEl2(scope);
        return trackDismissableElement(getContentEl22, {
          type: "popover",
          defer: true,
          layerStyleTargets: [
            () => getPositionerEl2(scope)
          ],
          exclude: [
            ...getInputEls(scope),
            getTriggerEl2(scope),
            getClearTriggerEl2(scope)
          ],
          onInteractOutside(event) {
            context.set("restoreFocus", !event.detail.focusable);
          },
          onDismiss() {
            send({
              type: "INTERACT_OUTSIDE"
            });
          },
          onEscapeKeyDown(event) {
            event.preventDefault();
            send({
              type: "TABLE.ESCAPE",
              src: "dismissable"
            });
          }
        });
      }
    },
    actions: {
      setNextView({ context, prop }) {
        const nextView = getNextView(context.get("view"), prop("minView"), prop("maxView"));
        context.set("view", nextView);
      },
      setPreviousView({ context, prop }) {
        const prevView = getPreviousView(context.get("view"), prop("minView"), prop("maxView"));
        context.set("view", prevView);
      },
      setView({ context, event }) {
        context.set("view", event.view);
      },
      setRestoreFocus({ context }) {
        context.set("restoreFocus", true);
      },
      announceValueText({ context, prop, refs }) {
        const value = context.get("value");
        const locale = prop("locale");
        const timeZone = prop("timeZone");
        let announceText;
        if (prop("selectionMode") === "range") {
          const [startDate, endDate] = value;
          if (startDate && endDate) {
            announceText = formatSelectedDate(startDate, endDate, locale, timeZone);
          } else if (startDate) {
            announceText = formatSelectedDate(startDate, null, locale, timeZone);
          } else if (endDate) {
            announceText = formatSelectedDate(endDate, null, locale, timeZone);
          } else {
            announceText = "";
          }
        } else {
          announceText = value.map((date) => formatSelectedDate(date, null, locale, timeZone)).filter(Boolean).join(",");
        }
        refs.get("announcer")?.announce(announceText, 3e3);
      },
      announceVisibleRange({ computed, refs }) {
        const { formatted } = computed("visibleRangeText");
        refs.get("announcer")?.announce(formatted);
      },
      disableTextSelection({ scope }) {
        disableTextSelection({
          target: getContentEl2(scope),
          doc: scope.getDoc()
        });
      },
      enableTextSelection({ scope }) {
        restoreTextSelection({
          doc: scope.getDoc(),
          target: getContentEl2(scope)
        });
      },
      focusFirstSelectedDate(params) {
        const { context } = params;
        if (!context.get("value").length) return;
        setFocusedValue(params, context.get("value")[0]);
      },
      syncInputElement({ scope, computed }) {
        raf(() => {
          const inputEls = getInputEls(scope);
          inputEls.forEach((inputEl, index) => {
            setElementValue(inputEl, computed("valueAsString")[index] || "");
          });
        });
      },
      setFocusedDate(params) {
        const { event } = params;
        const value = Array.isArray(event.value) ? event.value[0] : event.value;
        setFocusedValue(params, value);
      },
      setFocusedValueForView(params) {
        const { context, event } = params;
        setFocusedValue(params, context.get("focusedValue").set({
          [context.get("view")]: event.value
        }));
      },
      focusNextMonth(params) {
        const { context } = params;
        setFocusedValue(params, context.get("focusedValue").add({
          months: 1
        }));
      },
      focusPreviousMonth(params) {
        const { context } = params;
        setFocusedValue(params, context.get("focusedValue").subtract({
          months: 1
        }));
      },
      setDateValue({ context, event, prop }) {
        if (!Array.isArray(event.value)) return;
        const value = event.value.map((date) => constrainValue(date, prop("min"), prop("max")));
        context.set("value", value);
      },
      clearDateValue({ context }) {
        context.set("value", []);
      },
      setSelectedDate(params) {
        const { context, event } = params;
        const values = Array.from(context.get("value"));
        const activeIndex = context.get("activeIndex");
        const existingValue = values[activeIndex];
        const newValue = normalizeValue(params, event.value ?? context.get("focusedValue"));
        values[activeIndex] = preserveTime(existingValue, newValue);
        context.set("value", adjustStartAndEndDate(values));
      },
      resetSelection(params) {
        const { context, event } = params;
        const existingValue = context.get("value")[0];
        const newValue = normalizeValue(params, event.value ?? context.get("focusedValue"));
        context.set("value", [
          preserveTime(existingValue, newValue)
        ]);
      },
      toggleSelectedDate(params) {
        const { context, event } = params;
        const currentValue = normalizeValue(params, event.value ?? context.get("focusedValue"));
        const existingValues = context.get("value");
        const index = existingValues.findIndex((date) => isDateEqual(date, currentValue));
        if (index === -1) {
          const values = [
            ...existingValues,
            currentValue
          ];
          context.set("value", sortDates(values));
        } else {
          const values = Array.from(existingValues);
          values.splice(index, 1);
          context.set("value", sortDates(values));
        }
      },
      setHoveredDate({ context, event }) {
        context.set("hoveredValue", event.value);
      },
      clearHoveredDate({ context }) {
        context.set("hoveredValue", null);
      },
      selectFocusedDate({ context, computed }) {
        const values = Array.from(context.get("value"));
        const activeIndex = context.get("activeIndex");
        const existingValue = values[activeIndex];
        const newValue = context.get("focusedValue").copy();
        values[activeIndex] = preserveTime(existingValue, newValue);
        context.set("value", adjustStartAndEndDate(values));
        const valueAsString = computed("valueAsString");
        context.set("inputValue", valueAsString[activeIndex]);
      },
      focusPreviousDay(params) {
        const { context } = params;
        const nextValue = context.get("focusedValue").subtract({
          days: 1
        });
        setFocusedValue(params, nextValue);
      },
      focusNextDay(params) {
        const { context } = params;
        const nextValue = context.get("focusedValue").add({
          days: 1
        });
        setFocusedValue(params, nextValue);
      },
      focusPreviousWeek(params) {
        const { context } = params;
        const nextValue = context.get("focusedValue").subtract({
          weeks: 1
        });
        setFocusedValue(params, nextValue);
      },
      focusNextWeek(params) {
        const { context } = params;
        const nextValue = context.get("focusedValue").add({
          weeks: 1
        });
        setFocusedValue(params, nextValue);
      },
      focusNextPage(params) {
        const { context, computed, prop } = params;
        const nextPage = getNextPage(context.get("focusedValue"), context.get("startValue"), computed("visibleDuration"), prop("locale"), prop("min"), prop("max"));
        setAdjustedValue(params, nextPage);
      },
      focusPreviousPage(params) {
        const { context, computed, prop } = params;
        const previousPage = getPreviousPage(context.get("focusedValue"), context.get("startValue"), computed("visibleDuration"), prop("locale"), prop("min"), prop("max"));
        setAdjustedValue(params, previousPage);
      },
      focusSectionStart(params) {
        const { context } = params;
        setFocusedValue(params, context.get("startValue").copy());
      },
      focusSectionEnd(params) {
        const { computed } = params;
        setFocusedValue(params, computed("endValue").copy());
      },
      focusNextSection(params) {
        const { context, event, computed, prop } = params;
        const nextSection = getNextSection(context.get("focusedValue"), context.get("startValue"), event.larger, computed("visibleDuration"), prop("locale"), prop("min"), prop("max"));
        if (!nextSection) return;
        setAdjustedValue(params, nextSection);
      },
      focusPreviousSection(params) {
        const { context, event, computed, prop } = params;
        const previousSection = getPreviousSection(context.get("focusedValue"), context.get("startValue"), event.larger, computed("visibleDuration"), prop("locale"), prop("min"), prop("max"));
        if (!previousSection) return;
        setAdjustedValue(params, previousSection);
      },
      focusNextYear(params) {
        const { context } = params;
        const nextValue = context.get("focusedValue").add({
          years: 1
        });
        setFocusedValue(params, nextValue);
      },
      focusPreviousYear(params) {
        const { context } = params;
        const nextValue = context.get("focusedValue").subtract({
          years: 1
        });
        setFocusedValue(params, nextValue);
      },
      focusNextDecade(params) {
        const { context } = params;
        const nextValue = context.get("focusedValue").add({
          years: 10
        });
        setFocusedValue(params, nextValue);
      },
      focusPreviousDecade(params) {
        const { context } = params;
        const nextValue = context.get("focusedValue").subtract({
          years: 10
        });
        setFocusedValue(params, nextValue);
      },
      clearFocusedDate(params) {
        const { context, prop } = params;
        const calendar = context.get("focusedValue").calendar;
        setFocusedValue(params, getTodayDate(prop("timeZone"), calendar));
      },
      focusPreviousMonthColumn(params) {
        const { context, event } = params;
        const nextValue = context.get("focusedValue").subtract({
          months: event.columns
        });
        setFocusedValue(params, nextValue);
      },
      focusNextMonthColumn(params) {
        const { context, event } = params;
        const nextValue = context.get("focusedValue").add({
          months: event.columns
        });
        setFocusedValue(params, nextValue);
      },
      focusPreviousYearColumn(params) {
        const { context, event } = params;
        const nextValue = context.get("focusedValue").subtract({
          years: event.columns
        });
        setFocusedValue(params, nextValue);
      },
      focusNextYearColumn(params) {
        const { context, event } = params;
        const nextValue = context.get("focusedValue").add({
          years: event.columns
        });
        setFocusedValue(params, nextValue);
      },
      focusFirstMonth(params) {
        const { context } = params;
        const focused = context.get("focusedValue");
        const minMonth = focused.calendar.getMinimumMonthInYear?.(focused) ?? 1;
        setFocusedValue(params, focused.set({
          month: minMonth
        }));
      },
      focusLastMonth(params) {
        const { context } = params;
        const focused = context.get("focusedValue");
        const maxMonth = focused.calendar.getMonthsInYear(focused);
        setFocusedValue(params, focused.set({
          month: maxMonth
        }));
      },
      focusFirstYear(params) {
        const { context } = params;
        const range = getDecadeRange(context.get("focusedValue").year);
        const nextValue = context.get("focusedValue").set({
          year: range[0]
        });
        setFocusedValue(params, nextValue);
      },
      focusLastYear(params) {
        const { context } = params;
        const range = getDecadeRange(context.get("focusedValue").year);
        const nextValue = context.get("focusedValue").set({
          year: range[range.length - 1]
        });
        setFocusedValue(params, nextValue);
      },
      setActiveIndex({ context, event }) {
        context.set("activeIndex", event.index);
      },
      setActiveIndexToEnd({ context }) {
        context.set("activeIndex", 1);
      },
      setActiveIndexToStart({ context }) {
        context.set("activeIndex", 0);
      },
      resumeRangeSelection({ context, prop }) {
        if (prop("selectionMode") === "range" && context.get("value").length === 1) {
          context.set("activeIndex", 1);
        }
      },
      focusActiveCell({ scope, context, event }) {
        if (event.src === "input.click") return;
        raf(() => {
          const view = context.get("view");
          getFocusedCell(scope, view)?.focus({
            preventScroll: true
          });
        });
      },
      focusActiveCellIfNeeded({ scope, context, event }) {
        if (!event.focus) return;
        raf(() => {
          const view = context.get("view");
          getFocusedCell(scope, view)?.focus({
            preventScroll: true
          });
        });
      },
      setHoveredValueIfKeyboard({ context, event, prop }) {
        const isKeyboardNavigation = event.type.startsWith("TABLE.ARROW") || [
          "TABLE.ENTER",
          "TABLE.HOME",
          "TABLE.END",
          "TABLE.PAGE_UP",
          "TABLE.PAGE_DOWN"
        ].includes(event.type);
        if (!isKeyboardNavigation || prop("selectionMode") !== "range" || context.get("activeIndex") === 0) return;
        context.set("hoveredValue", context.get("focusedValue").copy());
      },
      focusTriggerElement({ scope }) {
        raf(() => {
          getTriggerEl2(scope)?.focus({
            preventScroll: true
          });
        });
      },
      focusFirstInputElement({ scope, event }) {
        if (event.focus === false) return;
        raf(() => {
          const [inputEl] = getInputEls(scope);
          const elementToFocus = inputEl ?? getTriggerEl2(scope);
          elementToFocus?.focus({
            preventScroll: true
          });
        });
      },
      focusInputElement({ scope }) {
        raf(() => {
          const inputEls = getInputEls(scope);
          if (inputEls.length === 0) {
            getTriggerEl2(scope)?.focus({
              preventScroll: true
            });
            return;
          }
          const lastIndexWithValue = inputEls.findLastIndex((inputEl2) => inputEl2.value !== "");
          const indexToFocus = Math.max(lastIndexWithValue, 0);
          const inputEl = inputEls[indexToFocus];
          inputEl?.focus({
            preventScroll: true
          });
          inputEl?.setSelectionRange(inputEl.value.length, inputEl.value.length);
        });
      },
      syncMonthSelectElement({ scope, context }) {
        const monthSelectEl = getMonthSelectEl(scope);
        setElementValue(monthSelectEl, context.get("startValue").month.toString());
      },
      syncYearSelectElement({ scope, context }) {
        const yearSelectEl = getYearSelectEl(scope);
        setElementValue(yearSelectEl, context.get("startValue").year.toString());
      },
      setInputValue({ context, event }) {
        if (context.get("activeIndex") !== event.index) return;
        context.set("inputValue", event.value);
      },
      syncInputValue({ scope, context, event }) {
        queueMicrotask(() => {
          const inputEls = getInputEls(scope);
          const idx = event.index ?? context.get("activeIndex");
          setElementValue(inputEls[idx], context.get("inputValue"));
        });
      },
      focusParsedDate(params) {
        const { event, prop } = params;
        if (event.index == null) return;
        const parse2 = prop("parse");
        const date = parse2(event.value, {
          locale: prop("locale"),
          timeZone: prop("timeZone")
        });
        if (!date || !isValidDate(date)) return;
        setFocusedValue(params, date);
      },
      selectParsedDate({ context, event, prop }) {
        if (event.index == null) return;
        const parse2 = prop("parse");
        let date = parse2(event.value, {
          locale: prop("locale"),
          timeZone: prop("timeZone")
        });
        if (!date || !isValidDate(date)) {
          if (event.value) {
            date = context.get("focusedValue").copy();
          }
        }
        if (!date) return;
        date = constrainValue(date, prop("min"), prop("max"));
        const values = Array.from(context.get("value"));
        values[event.index] = preserveTime(values[event.index], date);
        const adjustedValues = adjustStartAndEndDate(values);
        context.set("value", adjustedValues);
        const valueAsString = getValueAsString(adjustedValues, prop);
        context.set("inputValue", valueAsString[event.index]);
      },
      resetView({ context }) {
        context.set("view", context.initial("view"));
      },
      setStartValue({ context, computed, prop }) {
        const focusedValue = context.get("focusedValue");
        const outside = isDateOutsideRange(focusedValue, context.get("startValue"), computed("endValue"));
        if (!outside) return;
        const startValue = alignDate(focusedValue, "start", {
          months: prop("numOfMonths")
        }, prop("locale"));
        context.set("startValue", startValue);
      },
      invokeOnOpen({ prop, context }) {
        if (prop("inline")) return;
        prop("onOpenChange")?.({
          open: true,
          value: context.get("value")
        });
      },
      invokeOnClose({ prop, context }) {
        if (prop("inline")) return;
        prop("onOpenChange")?.({
          open: false,
          value: context.get("value")
        });
      },
      invokeOnVisibleRangeChange({ prop, context, computed }) {
        prop("onVisibleRangeChange")?.({
          view: context.get("view"),
          visibleRange: computed("visibleRange")
        });
      },
      toggleVisibility({ event, send, prop }) {
        send({
          type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
          previousEvent: event
        });
      }
    }
  }
});
var normalizeValue = (ctx, value) => {
  const { context, prop } = ctx;
  const view = context.get("view");
  let dateValue = typeof value === "number" ? context.get("focusedValue").set({
    [view]: value
  }) : value;
  eachView((view2) => {
    if (isBelowMinView(view2, prop("minView"))) {
      dateValue = dateValue.set({
        [view2]: view2 === "day" ? 1 : 0
      });
    }
  });
  return dateValue;
};
var preserveTime = (existingDate, newDate) => {
  if (!existingDate || !("hour" in existingDate)) {
    return newDate;
  }
  const isZoned = "timeZone" in existingDate;
  let dateWithTime = newDate;
  if (!("hour" in newDate)) {
    if (isZoned) {
      dateWithTime = $d07e34cce18680fd$export$84c95a83c799e074($d07e34cce18680fd$export$b21e0b124e224484(newDate), existingDate.timeZone);
    } else {
      dateWithTime = $d07e34cce18680fd$export$b21e0b124e224484(newDate);
    }
  }
  return dateWithTime.set({
    hour: existingDate.hour,
    minute: existingDate.minute,
    second: existingDate.second,
    millisecond: existingDate.millisecond
  });
};
function setFocusedValue(ctx, mixedValue) {
  const { context, prop, computed } = ctx;
  if (!mixedValue) return;
  const value = normalizeValue(ctx, mixedValue);
  if (isDateEqual(context.get("focusedValue"), value)) return;
  const adjustFn = getAdjustedDateFn(computed("visibleDuration"), prop("locale"), prop("min"), prop("max"));
  const adjustedValue = adjustFn({
    focusedDate: value,
    startDate: context.get("startValue")
  });
  context.set("startValue", adjustedValue.startDate);
  context.set("focusedValue", adjustedValue.focusedDate);
}
function setAdjustedValue(ctx, value) {
  const { context } = ctx;
  context.set("startValue", value.startDate);
  const focusedValue = context.get("focusedValue");
  if (isDateEqual(focusedValue, value.focusedDate)) return;
  context.set("focusedValue", value.focusedDate);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-picker/1.43.0/dist/date-picker.parse.mjs
function parse(value) {
  if (Array.isArray(value)) {
    return value.map((v) => parse(v));
  }
  if (value instanceof Date) {
    return new $2aaf608024c21ca1$export$99faa760c7908e4f(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }
  return $58246871e4652552$export$6b862160d295c8e(value);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/date-picker/1.43.0/dist/date-picker.props.mjs
var props2 = createProps()([
  "closeOnSelect",
  "createCalendar",
  "dir",
  "disabled",
  "fixedWeeks",
  "focusedValue",
  "format",
  "parse",
  "placeholder",
  "getRootNode",
  "id",
  "ids",
  "inline",
  "invalid",
  "isDateUnavailable",
  "locale",
  "max",
  "maxSelectedDates",
  "min",
  "name",
  "numOfMonths",
  "onFocusChange",
  "onOpenChange",
  "onValueChange",
  "onViewChange",
  "onVisibleRangeChange",
  "open",
  "openOnClick",
  "defaultOpen",
  "positioning",
  "readOnly",
  "required",
  "selectionMode",
  "showWeekNumbers",
  "startOfWeek",
  "timeZone",
  "translations",
  "value",
  "defaultView",
  "defaultValue",
  "view",
  "defaultFocusedValue",
  "outsideDaySelectable",
  "minView",
  "maxView"
]);
var splitProps3 = createSplitProps(props2);
var inputProps = createProps()([
  "index",
  "fixOnBlur"
]);
var splitInputProps = createSplitProps(inputProps);
var presetTriggerProps = createProps()([
  "value"
]);
var splitPresetTriggerProps = createSplitProps(presetTriggerProps);
var tableProps = createProps()([
  "columns",
  "id",
  "view"
]);
var splitTableProps = createSplitProps(tableProps);
var tableCellProps = createProps()([
  "disabled",
  "value",
  "columns"
]);
var splitTableCellProps = createSplitProps(tableCellProps);
var viewProps = createProps()([
  "view"
]);
var splitViewProps = createSplitProps(viewProps);

// interpreter/vendor/entry-zag/date-picker.ts
var generateKey = (api) => `${api.view}:${api.visibleRangeText.start}`;
var generate = (api) => ({
  // Both are the machine's to know and nothing else's to compute: which month
  // is on screen, and what this locale calls its weekdays. The dispatcher
  // spreads props but never text, so without these the calendar renders as a
  // grid of bare numbers.
  viewTrigger: [
    api.visibleRangeText.start
  ],
  tableHead: [
    {
      tag: "tr",
      attrs: {
        "data-part": "tableRow"
      },
      children: api.weekDays.map((day) => ({
        tag: "th",
        attrs: {
          "data-part": "tableHeader",
          scope: "col"
        },
        children: [
          day.narrow
        ]
      }))
    }
  ],
  tableBody: api.weeks.map((week) => ({
    tag: "tr",
    attrs: {
      "data-part": "tableRow"
    },
    children: week.map((value) => ({
      tag: "td",
      attrs: {
        "data-part": "dayTableCell",
        "data-cell": value.toString()
      },
      children: [
        {
          tag: "div",
          attrs: {
            "data-part": "dayTableCellTrigger",
            "data-cell": value.toString()
          },
          children: [
            String(value.day)
          ]
        }
      ]
    }))
  }))
});
var partArg = (_api, el) => {
  const raw = el.closest("[data-cell]")?.dataset.cell;
  return raw === void 0 ? void 0 : {
    value: parse(raw)
  };
};
var DATE = /^\d{4}-\d{2}-\d{2}/;
var timeOf = (input) => input.type === "datetime-local" ? input.value.split("T")[1] || "09:00" : "";
var fromInput = (input) => {
  const day = DATE.exec(input.value)?.[0];
  return day ? {
    value: [
      parse(day)
    ]
  } : {};
};
var writeInput = (details, input) => {
  const day = details.value?.[0]?.toString() ?? "";
  const time = day === "" ? "" : timeOf(input);
  const next = day === "" ? "" : time === "" ? day : `${day}T${time}`;
  if (next === input.value) return false;
  input.value = next;
  return true;
};

// interpreter/vendor/entry-zag/file-upload.ts
var file_upload_exports = {};
__export(file_upload_exports, {
  anatomy: () => anatomy3,
  connect: () => connect3,
  fromInput: () => fromInput2,
  generate: () => generate2,
  generateKey: () => generateKey2,
  itemProps: () => itemProps2,
  machine: () => machine3,
  partArg: () => partArg2,
  props: () => props3,
  splitItemProps: () => splitItemProps2,
  splitProps: () => splitProps4,
  writeInput: () => writeInput2
});

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/file-upload/1.43.0/dist/file-upload.anatomy.mjs
var anatomy3 = createAnatomy("file-upload").parts("root", "dropzone", "item", "itemDeleteTrigger", "itemGroup", "itemName", "itemPreview", "itemPreviewImage", "itemSizeText", "label", "trigger", "clearTrigger");
var parts3 = anatomy3.build();

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/file-utils/1.43.0/dist/data-transfer.mjs
var getItemEntry = (item) => typeof item.getAsEntry === "function" ? item.getAsEntry() : typeof item.webkitGetAsEntry === "function" ? item.webkitGetAsEntry() : null;
var isDirectoryEntry = (entry) => entry.isDirectory;
var isFileEntry = (entry) => entry.isFile;
var addRelativePath = (file, path) => {
  Object.defineProperty(file, "relativePath", {
    value: path ? `${path}/${file.name}` : file.name
  });
  return file;
};
var getFileEntries = (items, traverseDirectories) => Promise.all(Array.from(items).filter((item) => item.kind === "file").map((item) => {
  const entry = getItemEntry(item);
  if (!entry) return null;
  if (isDirectoryEntry(entry) && traverseDirectories) {
    return getDirectoryFiles(entry.createReader(), `${entry.name}`);
  }
  if (isFileEntry(entry) && typeof item.getAsFile === "function") {
    const file = item.getAsFile();
    return Promise.resolve(file ? addRelativePath(file, "") : null);
  }
  if (isFileEntry(entry)) {
    return new Promise((resolve) => {
      entry.file((file) => {
        resolve(addRelativePath(file, ""));
      });
    });
  }
}).filter((b) => b));
var getDirectoryFiles = (reader, path = "") => new Promise((resolve) => {
  const entryPromises = [];
  const readDirectoryEntries = () => {
    reader.readEntries((entries) => {
      if (entries.length === 0) {
        resolve(Promise.all(entryPromises).then((entries2) => entries2.flat()));
        return;
      }
      const promises = entries.map((entry) => {
        if (!entry) return null;
        if (isDirectoryEntry(entry)) {
          return getDirectoryFiles(entry.createReader(), `${path}${entry.name}`);
        }
        if (isFileEntry(entry)) {
          return new Promise((resolve2) => {
            entry.file((file) => {
              resolve2(addRelativePath(file, path));
            });
          });
        }
      }).filter((b) => b);
      entryPromises.push(Promise.all(promises));
      readDirectoryEntries();
    });
  };
  readDirectoryEntries();
});

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/file-utils/1.43.0/dist/get-accept-attr.mjs
function isMIMEType(v) {
  return v === "audio/*" || v === "video/*" || v === "image/*" || v === "text/*" || /\w+\/[-+.\w]+/g.test(v);
}
function isExt(v) {
  return /^.*\.[\w]+$/.test(v);
}
var isValidMIME = (v) => isMIMEType(v) || isExt(v);
function getAcceptAttrString(accept) {
  if (accept == null) return;
  if (typeof accept === "string") {
    return accept;
  }
  if (Array.isArray(accept)) {
    return accept.filter(isValidMIME).join(",");
  }
  return Object.entries(accept).reduce((a, [mimeType, ext]) => [
    ...a,
    mimeType,
    ...ext
  ], []).filter(isValidMIME).join(",");
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/file-utils/1.43.0/dist/is-file-equal.mjs
var isFileEqual = (file1, file2) => {
  return file1.name === file2.name && file1.size === file2.size && file1.type === file2.type;
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/file-utils/1.43.0/dist/is-valid-file-size.mjs
var isDefined = (v) => v !== void 0 && v !== null;
function isValidFileSize(file, minSize, maxSize) {
  if (isDefined(file.size)) {
    if (isDefined(minSize) && isDefined(maxSize)) {
      if (file.size > maxSize) return [
        false,
        "FILE_TOO_LARGE"
      ];
      if (file.size < minSize) return [
        false,
        "FILE_TOO_SMALL"
      ];
    } else if (isDefined(minSize) && file.size < minSize) {
      return [
        false,
        "FILE_TOO_SMALL"
      ];
    } else if (isDefined(maxSize) && file.size > maxSize) {
      return [
        false,
        "FILE_TOO_LARGE"
      ];
    }
  }
  return [
    true,
    null
  ];
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/file-utils/1.43.0/dist/mime-types.mjs
var mimeTypes = "3g2_video/3gpp2[3gp,3gpp_video/3gpp[3mf_model/3mf[7z_application/x-7z-compressed[aac_audio/aac[ac_application/pkix-attr-cert[adp_audio/adpcm[adts_audio/aac[ai_application/postscript[aml_application/automationml-aml+xml[amlx_application/automationml-amlx+zip[amr_audio/amr[apk_application/vnd.android.package-archive[apng_image/apng[appcache,manifest_text/cache-manifest[appinstaller_application/appinstaller[appx_application/appx[appxbundle_application/appxbundle[asc_application/pgp-keys[atom_application/atom+xml[atomcat_application/atomcat+xml[atomdeleted_application/atomdeleted+xml[atomsvc_application/atomsvc+xml[au,snd_audio/basic[avi_video/x-msvideo[avci_image/avci[avcs_image/avcs[avif_image/avif[aw_application/applixware[bdoc_application/bdoc[bin,bpk,buffer,deb,deploy,dist,distz,dll,dmg,dms,dump,elc,exe,img,iso,lrf,mar,msi,msm,msp,pkg,so_application/octet-stream[bmp,dib_image/bmp[btf,btif_image/prs.btif[bz2_application/x-bzip2[c_text/x-c[ccxml_application/ccxml+xml[cdfx_application/cdfx+xml[cdmia_application/cdmi-capability[cdmic_application/cdmi-container[cdmid_application/cdmi-domain[cdmio_application/cdmi-object[cdmiq_application/cdmi-queue[cer_application/pkix-cert[cgm_image/cgm[cjs_application/node[class_application/java-vm[coffee,litcoffee_text/coffeescript[conf,def,in,ini,list,log,text,txt_text/plain[cpp,cxx,cc_text/x-c++src[cpl_application/cpl+xml[cpt_application/mac-compactpro[crl_application/pkix-crl[css_text/css[csv_text/csv[cu_application/cu-seeme[cwl_application/cwl[cww_application/prs.cww[davmount_application/davmount+xml[dbk_application/docbook+xml[doc_application/msword[docx_application/vnd.openxmlformats-officedocument.wordprocessingml.document[dsc_text/prs.lines.tag[dssc_application/dssc+der[dtd_application/xml-dtd[dwd_application/atsc-dwd+xml[ear,jar,war_application/java-archive[ecma_application/ecmascript[emf_image/emf[eml,mime_message/rfc822[emma_application/emma+xml[emotionml_application/emotionml+xml[eot_application/vnd.ms-fontobject[eps,ps_application/postscript[epub_application/epub+zip[exi_application/exi[exp_application/express[exr_image/aces[ez_application/andrew-inset[fdf_application/fdf[fdt_application/fdt+xml[fits_image/fits[flac_audio/flac[flv_video/x-flv[g3_image/g3fax[geojson_application/geo+json[gif_image/gif[glb_model/gltf-binary[gltf_model/gltf+json[gml_application/gml+xml[go_text/x-go[gpx_application/gpx+xml[gz_application/gzip[h_text/x-h[h261_video/h261[h263_video/h263[h264_video/h264[heic_image/heic[heics_image/heic-sequence[heif_image/heif[heifs_image/heif-sequence[htm,html,shtml_text/html[ico_image/x-icon[icns_image/x-icns[ics,ifb_text/calendar[iges,igs_model/iges[ink,inkml_application/inkml+xml[ipa_application/octet-stream[java_text/x-java-source[jp2,jpg2_image/jp2[jpeg,jpe,jpg_image/jpeg[jpf,jpx_image/jpx[jpm,jpgm_image/jpm[jpgv_video/jpeg[jph_image/jph[js,mjs_text/javascript[json_application/json[json5_application/json5[jsonld_application/ld+json[jsx_text/jsx[jxl_image/jxl[jxr_image/jxr[ktx_image/ktx[ktx2_image/ktx2[less_text/less[m1v,m2v,mpe,mpeg,mpg_video/mpeg[m4a_audio/mp4[m4v_video/x-m4v[md,markdown_text/markdown[mid,midi,kar,rmi_audio/midi[mkv_video/x-matroska[mp2,mp2a,mp3,mpga,m3a,m2a_audio/mpeg[mp4,mp4v,mpg4_video/mp4[mp4a_audio/mp4[mp4s,m4p_application/mp4[odp_application/vnd.oasis.opendocument.presentation[oda_application/oda[ods_application/vnd.oasis.opendocument.spreadsheet[odt_application/vnd.oasis.opendocument.text[oga,ogg,opus,spx_audio/ogg[ogv_video/ogg[ogx_application/ogg[otf_font/otf[p12,pfx_application/x-pkcs12[pdf_application/pdf[pem_application/x-pem-file[php_text/x-php[png_image/png[ppt_application/vnd.ms-powerpoint[pptx_application/vnd.openxmlformats-officedocument.presentationml.presentation[pskcxml_application/pskc+xml[psd_image/vnd.adobe.photoshop[py_text/x-python[qt,mov_video/quicktime[rar_application/vnd.rar[rdf_application/rdf+xml[rtf_text/rtf[sass_text/x-sass[scss_text/x-scss[sgm,sgml_text/sgml[sh_application/x-sh[svg,svgz_image/svg+xml[swf_application/x-shockwave-flash[tar_application/x-tar[tif,tiff_image/tiff[toml_application/toml[ts_video/mp2t[tsx_text/tsx[tsv_text/tab-separated-values[ttc_font/collection[ttf_font/ttf[vtt_text/vtt[wasm_application/wasm[wav_audio/wav[weba_audio/webm[webm_video/webm[webmanifest_application/manifest+json[webp_image/webp[wma_audio/x-ms-wma[wmv_video/x-ms-wmv[woff_font/woff[woff2_font/woff2[xls_application/vnd.ms-excel[xlsx_application/vnd.openxmlformats-officedocument.spreadsheetml.sheet[xml_application/xml[xz_application/x-xz[yaml,yml_text/yaml[zip_application/zip";
var mimeTypesMap = new Map(mimeTypes.split("[").flatMap((mime) => {
  const [extensions, mimeType] = mime.split("_");
  return extensions.split(",").map((ext) => [
    ext,
    mimeType
  ]);
}));

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/file-utils/1.43.0/dist/get-file-mime-type.mjs
function getFileMimeType(name) {
  const extension = name.split(".").pop();
  return extension ? mimeTypesMap.get(extension) || null : null;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/file-utils/1.43.0/dist/is-valid-file-type.mjs
function isFileAccepted(file, accept) {
  if (file && accept) {
    const types = Array.isArray(accept) ? accept : typeof accept === "string" ? accept.split(",") : [];
    if (types.length === 0) return true;
    const fileName = file.name || "";
    const mimeType = (file.type || getFileMimeType(fileName) || "").toLowerCase();
    const baseMimeType = mimeType.replace(/\/.*$/, "");
    return types.some((type) => {
      const validType = type.trim().toLowerCase();
      if (validType.charAt(0) === ".") {
        return fileName.toLowerCase().endsWith(validType);
      }
      if (validType.endsWith("/*")) {
        return baseMimeType === validType.replace(/\/.*$/, "");
      }
      return mimeType === validType;
    });
  }
  return true;
}
function isValidFileType(file, accept) {
  const isAcceptable = file.type === "application/x-moz-file" || isFileAccepted(file, accept);
  return [
    isAcceptable,
    isAcceptable ? null : "FILE_INVALID_TYPE"
  ];
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/i18n-utils/1.43.0/dist/cache.mjs
function i18nCache(Ins) {
  const formatterCache = /* @__PURE__ */ new Map();
  return function create(locale, options) {
    const cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : "");
    if (formatterCache.has(cacheKey)) {
      return formatterCache.get(cacheKey);
    }
    let formatter = new Ins(locale, options);
    formatterCache.set(cacheKey, formatter);
    return formatter;
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/i18n-utils/1.43.0/dist/collator.mjs
var getCollator = i18nCache(Intl.Collator);

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/i18n-utils/1.43.0/dist/filter.mjs
var collatorCache = i18nCache(Intl.Collator);

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/i18n-utils/1.43.0/dist/format-number.mjs
var getNumberFormatter = i18nCache(Intl.NumberFormat);
function formatNumber(v, locale, options = {}) {
  const formatter = getNumberFormatter(locale, options);
  return formatter.format(v);
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/i18n-utils/1.43.0/dist/format-bytes.mjs
var bitPrefixes = [
  "",
  "kilo",
  "mega",
  "giga",
  "tera"
];
var bytePrefixes = [
  "",
  "kilo",
  "mega",
  "giga",
  "tera",
  "peta"
];
var formatBytes = (bytes, locale = "en-US", options = {}) => {
  if (Number.isNaN(bytes)) return "";
  if (bytes === 0) return "0 B";
  const { unitSystem = "decimal", precision = 3, unit = "byte", unitDisplay = "short" } = options;
  const factor = unitSystem === "binary" ? 1024 : 1e3;
  const prefix = unit === "bit" ? bitPrefixes : bytePrefixes;
  const isNegative = bytes < 0;
  const absoluteBytes = Math.abs(bytes);
  let value = absoluteBytes;
  let index = 0;
  while (value >= factor && index < prefix.length - 1) {
    value /= factor;
    index++;
  }
  const v = parseFloat(value.toPrecision(precision));
  const finalValue = isNegative ? -v : v;
  return formatNumber(finalValue, locale, {
    style: "unit",
    unit: prefix[index] + unit,
    unitDisplay
  });
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/i18n-utils/1.43.0/dist/format-list.mjs
var getListFormatter = i18nCache(Intl.ListFormat);

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/i18n-utils/1.43.0/dist/format-relative-time.mjs
var getRelativeTimeFormatter = i18nCache(Intl.RelativeTimeFormat);
var MINUTE_TO_MS = 1e3 * 60;
var HOUR_TO_MS = 1e3 * 60 * 60;
var DAY_TO_MS = 1e3 * 60 * 60 * 24;
var WEEK_TO_MS = 1e3 * 60 * 60 * 24 * 7;
var MONTH_TO_MS = 1e3 * 60 * 60 * 24 * 30;
var YEAR_TO_MS = 1e3 * 60 * 60 * 24 * 365;

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/i18n-utils/1.43.0/dist/format-time.mjs
var getTimeFormatter = i18nCache(Intl.DateTimeFormat);

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/file-upload/1.43.0/dist/file-upload.dom.mjs
var getRootId3 = (ctx) => ctx.ids?.root ?? `file:${ctx.id}`;
var getDropzoneId = (ctx) => ctx.ids?.dropzone ?? `file:${ctx.id}:dropzone`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `file:${ctx.id}:input`;
var getTriggerId3 = (ctx) => ctx.ids?.trigger ?? `file:${ctx.id}:trigger`;
var getLabelId3 = (ctx) => ctx.ids?.label ?? `file:${ctx.id}:label`;
var getItemId2 = (ctx, id) => ctx.ids?.item?.(id) ?? `file:${ctx.id}:item:${id}`;
var getItemNameId = (ctx, id) => ctx.ids?.itemName?.(id) ?? `file:${ctx.id}:item-name:${id}`;
var getItemSizeTextId = (ctx, id) => ctx.ids?.itemSizeText?.(id) ?? `file:${ctx.id}:item-size:${id}`;
var getItemPreviewId = (ctx, id) => ctx.ids?.itemPreview?.(id) ?? `file:${ctx.id}:item-preview:${id}`;
var getItemDeleteTriggerId = (ctx, id) => ctx.ids?.itemDeleteTrigger?.(id) ?? `file:${ctx.id}:item-delete:${id}`;
var getFileId = (file) => hash(`${file.name}-${file.size}`);
var getRootEl = (ctx) => ctx.getById(getRootId3(ctx));
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var getDropzoneEl = (ctx) => ctx.getById(getDropzoneId(ctx));

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/file-upload/1.43.0/dist/file-upload.utils.mjs
function isEventWithFiles(event) {
  const target = getEventTarget(event);
  if (!event.dataTransfer) return !!target && "files" in target;
  return event.dataTransfer.types.some((type) => {
    return type === "Files" || type === "application/x-moz-file";
  });
}
function isFilesWithinRange(ctx, incomingCount, currentAcceptedFiles) {
  const { prop, computed } = ctx;
  if (!computed("multiple") && incomingCount > 1) return false;
  if (!computed("multiple") && incomingCount + currentAcceptedFiles.length === 2) return true;
  if (incomingCount + currentAcceptedFiles.length > prop("maxFiles")) return false;
  return true;
}
function getEventFiles(ctx, files, currentAcceptedFiles = [], currentRejectedFiles = []) {
  const { prop, computed } = ctx;
  const acceptedFiles = [];
  const rejectedFiles = [];
  const validateParams = {
    acceptedFiles: currentAcceptedFiles,
    rejectedFiles: currentRejectedFiles
  };
  files.forEach((file) => {
    const [accepted, acceptError] = isValidFileType(file, computed("acceptAttr"));
    const [sizeMatch, sizeError] = isValidFileSize(file, prop("minFileSize"), prop("maxFileSize"));
    const isDuplicate = currentAcceptedFiles.some((f) => isFileEqual(f, file)) || acceptedFiles.some((f) => isFileEqual(f, file));
    const validateErrors = prop("validate")?.(file, validateParams);
    const valid = validateErrors ? validateErrors.length === 0 : true;
    if (accepted && sizeMatch && valid && !isDuplicate) {
      acceptedFiles.push(file);
    } else {
      const errors = [
        acceptError,
        sizeError
      ];
      if (isDuplicate) errors.push("FILE_EXISTS");
      if (!valid) errors.push(...validateErrors ?? []);
      rejectedFiles.push({
        file,
        errors: errors.filter(Boolean)
      });
    }
  });
  if (!isFilesWithinRange(ctx, acceptedFiles.length, currentAcceptedFiles)) {
    acceptedFiles.forEach((file) => {
      rejectedFiles.push({
        file,
        errors: [
          "TOO_MANY_FILES"
        ]
      });
    });
    acceptedFiles.splice(0);
  }
  return {
    acceptedFiles,
    rejectedFiles
  };
}
function setInputFiles(inputEl, files) {
  const win = getWindow(inputEl);
  try {
    if ("DataTransfer" in win) {
      const dataTransfer = new win.DataTransfer();
      files.forEach((file) => {
        dataTransfer.items.add(file);
      });
      inputEl.files = dataTransfer.files;
    }
  } catch {
  }
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/file-upload/1.43.0/dist/file-upload.connect.mjs
var DEFAULT_ITEM_TYPE = "accepted";
var INTERACTIVE_SELECTOR = "button, a[href], input:not([type='file']), select, textarea, [tabindex], [contenteditable]";
function isInteractiveTarget(element, container) {
  if (!element || element.getAttribute("type") === "file") return false;
  const interactive = element.closest(INTERACTIVE_SELECTOR);
  return interactive != container && contains(container, interactive);
}
function connect3(service, normalize) {
  const { state: state2, send, prop, computed, scope, context } = service;
  const disabled = !!prop("disabled");
  const readOnly = !!prop("readOnly");
  const required = !!prop("required");
  const allowDrop = prop("allowDrop");
  const translations = prop("translations");
  const dragging = state2.matches("dragging");
  const focused = state2.matches("focused") && !disabled;
  const acceptedFiles = context.get("acceptedFiles");
  const maxFiles = prop("maxFiles");
  return {
    dragging,
    focused,
    disabled,
    readOnly,
    transforming: context.get("transforming"),
    maxFilesReached: acceptedFiles.length >= maxFiles,
    remainingFiles: Math.max(0, maxFiles - acceptedFiles.length),
    openFilePicker() {
      if (disabled || readOnly) return;
      send({
        type: "OPEN"
      });
    },
    deleteFile(file, type = DEFAULT_ITEM_TYPE) {
      if (disabled || readOnly) return;
      send({
        type: "FILE.DELETE",
        file,
        itemType: type
      });
    },
    acceptedFiles,
    rejectedFiles: context.get("rejectedFiles"),
    setFiles(files) {
      if (disabled || readOnly) return;
      send({
        type: "FILES.SET",
        files,
        count: files.length
      });
    },
    clearRejectedFiles() {
      if (disabled || readOnly) return;
      send({
        type: "REJECTED_FILES.CLEAR"
      });
    },
    clearFiles() {
      if (disabled || readOnly) return;
      send({
        type: "FILES.CLEAR"
      });
    },
    getFileSize(file) {
      return formatBytes(file.size, prop("locale"));
    },
    createFileUrl(file, cb) {
      const win = scope.getWin();
      const url = win.URL.createObjectURL(file);
      cb(url);
      return () => win.URL.revokeObjectURL(url);
    },
    setClipboardFiles(dt) {
      if (disabled || readOnly) return false;
      const items = Array.from(dt?.items ?? []);
      const files = items.reduce((acc, item) => {
        if (item.kind !== "file") return acc;
        const file = item.getAsFile();
        if (!file) return acc;
        return [
          ...acc,
          file
        ];
      }, []);
      if (!files.length) return false;
      send({
        type: "FILE.SELECT",
        files
      });
      return true;
    },
    getRootProps() {
      return normalize.element({
        ...parts3.root.attrs,
        dir: prop("dir"),
        id: getRootId3(scope),
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-dragging": dataAttr(dragging)
      });
    },
    getDropzoneProps(props6 = {}) {
      return normalize.element({
        ...parts3.dropzone.attrs,
        dir: prop("dir"),
        id: getDropzoneId(scope),
        tabIndex: disabled || readOnly || props6.disableClick ? void 0 : 0,
        role: props6.disableClick ? "application" : "button",
        "aria-label": translations.dropzone,
        "aria-disabled": disabled || readOnly || void 0,
        "data-invalid": dataAttr(prop("invalid")),
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-dragging": dataAttr(dragging),
        onKeyDown(event) {
          if (disabled || readOnly) return;
          if (event.defaultPrevented) return;
          const target = getEventTarget(event);
          if (!contains(event.currentTarget, target)) return;
          if (isInteractiveTarget(target, event.currentTarget)) return;
          if (props6.disableClick) return;
          if (event.key !== "Enter" && event.key !== " ") return;
          send({
            type: "DROPZONE.CLICK",
            src: "keydown"
          });
        },
        onClick(event) {
          if (disabled || readOnly) return;
          if (event.defaultPrevented) return;
          if (props6.disableClick) return;
          const target = getEventTarget(event);
          if (!contains(event.currentTarget, target)) return;
          if (isInteractiveTarget(target, event.currentTarget)) return;
          if (event.currentTarget.localName === "label") {
            event.preventDefault();
          }
          send({
            type: "DROPZONE.CLICK"
          });
        },
        onDragOver(event) {
          if (disabled || readOnly) return;
          if (!allowDrop) return;
          event.preventDefault();
          event.stopPropagation();
          try {
            event.dataTransfer.dropEffect = "copy";
          } catch {
          }
          const hasFiles = isEventWithFiles(event);
          if (!hasFiles) return;
          const count = event.dataTransfer.items.length;
          send({
            type: "DROPZONE.DRAG_OVER",
            count
          });
        },
        onDragLeave(event) {
          if (disabled || readOnly) return;
          if (!allowDrop) return;
          if (contains(event.currentTarget, event.relatedTarget)) return;
          send({
            type: "DROPZONE.DRAG_LEAVE"
          });
        },
        onDrop(event) {
          if (disabled || readOnly) return;
          if (allowDrop) {
            event.preventDefault();
            event.stopPropagation();
          }
          const hasFiles = isEventWithFiles(event);
          if (!hasFiles) return;
          getFileEntries(event.dataTransfer.items, prop("directory")).then((files) => {
            send({
              type: "DROPZONE.DROP",
              files: flatArray(files)
            });
          });
        },
        onFocus() {
          if (disabled || readOnly) return;
          send({
            type: "DROPZONE.FOCUS"
          });
        },
        onBlur() {
          if (disabled || readOnly) return;
          send({
            type: "DROPZONE.BLUR"
          });
        }
      });
    },
    getTriggerProps() {
      return normalize.button({
        ...parts3.trigger.attrs,
        dir: prop("dir"),
        id: getTriggerId3(scope),
        disabled: disabled || readOnly,
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-invalid": dataAttr(prop("invalid")),
        type: "button",
        onClick(event) {
          if (disabled || readOnly) return;
          if (contains(getDropzoneEl(scope), event.currentTarget)) {
            event.stopPropagation();
          }
          send({
            type: "OPEN"
          });
        }
      });
    },
    getHiddenInputProps() {
      return normalize.input({
        id: getHiddenInputId(scope),
        tabIndex: -1,
        disabled: disabled || readOnly,
        type: "file",
        required: prop("required"),
        capture: prop("capture"),
        name: prop("name"),
        accept: computed("acceptAttr"),
        webkitdirectory: prop("directory") ? "" : void 0,
        multiple: computed("multiple") || prop("maxFiles") > 1,
        // exclude from accessibility tree since the dropzone/trigger provides the accessible interface
        "aria-hidden": true,
        onClick(event) {
          event.stopPropagation();
          event.currentTarget.value = "";
        },
        onInput(event) {
          if (disabled || readOnly) return;
          const { files } = event.currentTarget;
          send({
            type: "FILE.SELECT",
            files: files ? Array.from(files) : []
          });
        },
        style: visuallyHiddenStyle
      });
    },
    getItemGroupProps(props6 = {}) {
      const { type = DEFAULT_ITEM_TYPE } = props6;
      return normalize.element({
        ...parts3.itemGroup.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-type": type
      });
    },
    getItemProps(props6) {
      const { file, type = DEFAULT_ITEM_TYPE } = props6;
      return normalize.element({
        ...parts3.item.attrs,
        dir: prop("dir"),
        id: getItemId2(scope, getFileId(file)),
        "data-disabled": dataAttr(disabled),
        "data-type": type
      });
    },
    getItemNameProps(props6) {
      const { file, type = DEFAULT_ITEM_TYPE } = props6;
      return normalize.element({
        ...parts3.itemName.attrs,
        dir: prop("dir"),
        id: getItemNameId(scope, getFileId(file)),
        "data-disabled": dataAttr(disabled),
        "data-type": type
      });
    },
    getItemSizeTextProps(props6) {
      const { file, type = DEFAULT_ITEM_TYPE } = props6;
      return normalize.element({
        ...parts3.itemSizeText.attrs,
        dir: prop("dir"),
        id: getItemSizeTextId(scope, getFileId(file)),
        "data-disabled": dataAttr(disabled),
        "data-type": type
      });
    },
    getItemPreviewProps(props6) {
      const { file, type = DEFAULT_ITEM_TYPE } = props6;
      return normalize.element({
        ...parts3.itemPreview.attrs,
        dir: prop("dir"),
        id: getItemPreviewId(scope, getFileId(file)),
        "data-disabled": dataAttr(disabled),
        "data-type": type
      });
    },
    getItemPreviewImageProps(props6) {
      const { file, url, type = DEFAULT_ITEM_TYPE } = props6;
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        throw new Error("Preview Image is only supported for image files");
      }
      return normalize.img({
        ...parts3.itemPreviewImage.attrs,
        alt: translations.itemPreview?.(file),
        src: url,
        "data-disabled": dataAttr(disabled),
        "data-type": type
      });
    },
    getItemDeleteTriggerProps(props6) {
      const { file, type = DEFAULT_ITEM_TYPE } = props6;
      return normalize.button({
        ...parts3.itemDeleteTrigger.attrs,
        dir: prop("dir"),
        id: getItemDeleteTriggerId(scope, getFileId(file)),
        type: "button",
        disabled: disabled || readOnly,
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-type": type,
        "aria-label": translations.deleteFile?.(file),
        onClick() {
          if (disabled || readOnly) return;
          send({
            type: "FILE.DELETE",
            file,
            itemType: type
          });
        }
      });
    },
    getLabelProps() {
      return normalize.label({
        ...parts3.label.attrs,
        dir: prop("dir"),
        id: getLabelId3(scope),
        htmlFor: getHiddenInputId(scope),
        "data-disabled": dataAttr(disabled),
        "data-required": dataAttr(required)
      });
    },
    getClearTriggerProps() {
      return normalize.button({
        ...parts3.clearTrigger.attrs,
        dir: prop("dir"),
        type: "button",
        disabled: disabled || readOnly,
        hidden: acceptedFiles.length === 0,
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        onClick(event) {
          if (event.defaultPrevented) return;
          if (disabled || readOnly) return;
          send({
            type: "FILES.CLEAR"
          });
        }
      });
    }
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/file-upload/1.43.0/dist/file-upload.machine.mjs
var machine3 = createMachine({
  props({ props: props6 }) {
    return {
      minFileSize: 0,
      maxFileSize: Number.POSITIVE_INFINITY,
      maxFiles: 1,
      allowDrop: true,
      preventDocumentDrop: true,
      defaultAcceptedFiles: [],
      ...props6,
      translations: {
        dropzone: "dropzone",
        itemPreview: (file) => `preview of ${file.name}`,
        deleteFile: (file) => `delete file ${file.name}`,
        ...props6.translations
      }
    };
  },
  initialState() {
    return "idle";
  },
  context({ prop, bindable: bindable2, getContext }) {
    return {
      acceptedFiles: bindable2(() => ({
        defaultValue: prop("defaultAcceptedFiles"),
        value: prop("acceptedFiles"),
        isEqual: (a, b) => a.length === b?.length && a.every((file, i) => isFileEqual(file, b[i])),
        hash(value) {
          return value.map((file) => `${file.name}-${file.size}`).join(",");
        },
        onChange(value) {
          const ctx = getContext();
          prop("onFileAccept")?.({
            files: value
          });
          prop("onFileChange")?.({
            acceptedFiles: value,
            rejectedFiles: ctx.get("rejectedFiles")
          });
        }
      })),
      rejectedFiles: bindable2(() => ({
        defaultValue: [],
        isEqual: (a, b) => a.length === b?.length && a.every((file, i) => isFileEqual(file.file, b[i].file)),
        onChange(value) {
          const ctx = getContext();
          prop("onFileReject")?.({
            files: value
          });
          prop("onFileChange")?.({
            acceptedFiles: ctx.get("acceptedFiles"),
            rejectedFiles: value
          });
        }
      })),
      transforming: bindable2(() => ({
        defaultValue: false
      }))
    };
  },
  computed: {
    acceptAttr: ({ prop }) => getAcceptAttrString(prop("accept")),
    multiple: ({ prop }) => prop("maxFiles") > 1
  },
  watch({ track, context, action }) {
    track([
      () => context.hash("acceptedFiles")
    ], () => {
      action([
        "syncInputElement"
      ]);
    });
  },
  on: {
    "FILES.SET": {
      actions: [
        "setFiles"
      ]
    },
    "FILE.SELECT": {
      actions: [
        "setEventFiles"
      ]
    },
    "FILE.DELETE": {
      actions: [
        "removeFile"
      ]
    },
    "FILES.CLEAR": {
      actions: [
        "clearFiles"
      ]
    },
    "REJECTED_FILES.CLEAR": {
      actions: [
        "clearRejectedFiles"
      ]
    }
  },
  effects: [
    "preventDocumentDrop"
  ],
  states: {
    idle: {
      on: {
        OPEN: {
          actions: [
            "openFilePicker"
          ]
        },
        "DROPZONE.CLICK": {
          actions: [
            "openFilePicker"
          ]
        },
        "DROPZONE.FOCUS": {
          target: "focused"
        },
        "DROPZONE.DRAG_OVER": {
          target: "dragging"
        }
      }
    },
    focused: {
      on: {
        "DROPZONE.BLUR": {
          target: "idle"
        },
        OPEN: {
          actions: [
            "openFilePicker"
          ]
        },
        "DROPZONE.CLICK": {
          actions: [
            "openFilePicker"
          ]
        },
        "DROPZONE.DRAG_OVER": {
          target: "dragging"
        }
      }
    },
    dragging: {
      on: {
        "DROPZONE.DROP": {
          target: "idle",
          actions: [
            "setEventFiles"
          ]
        },
        "DROPZONE.DRAG_LEAVE": {
          target: "idle"
        }
      }
    }
  },
  implementations: {
    effects: {
      preventDocumentDrop({ prop, scope }) {
        if (!prop("preventDocumentDrop")) return;
        if (!prop("allowDrop")) return;
        if (prop("disabled")) return;
        const doc = scope.getDoc();
        const onDragOver = (event) => {
          event?.preventDefault();
        };
        const onDrop = (event) => {
          if (contains(getRootEl(scope), getEventTarget(event))) return;
          event.preventDefault();
        };
        return callAll(addDomEvent(doc, "dragover", onDragOver, false), addDomEvent(doc, "drop", onDrop, false));
      }
    },
    actions: {
      syncInputElement({ scope, context }) {
        queueMicrotask(() => {
          const inputEl = getHiddenInputEl(scope);
          if (!inputEl) return;
          setInputFiles(inputEl, context.get("acceptedFiles"));
          const win = scope.getWin();
          inputEl.dispatchEvent(new win.Event("change", {
            bubbles: true
          }));
        });
      },
      openFilePicker({ scope }) {
        raf(() => {
          getHiddenInputEl(scope)?.click();
        });
      },
      setFiles(params) {
        const { computed, context, event } = params;
        const { acceptedFiles, rejectedFiles } = getEventFiles(params, event.files);
        context.set("acceptedFiles", computed("multiple") ? acceptedFiles : acceptedFiles.length > 0 ? [
          acceptedFiles[0]
        ] : []);
        context.set("rejectedFiles", rejectedFiles);
      },
      setEventFiles(params) {
        const { computed, context, event, prop } = params;
        const currentAcceptedFiles = context.get("acceptedFiles");
        const currentRejectedFiles = context.get("rejectedFiles");
        const { acceptedFiles, rejectedFiles } = getEventFiles(params, event.files, currentAcceptedFiles, currentRejectedFiles);
        const set = (files) => {
          if (computed("multiple")) {
            context.set("acceptedFiles", (prev) => [
              ...prev,
              ...files
            ]);
            context.set("rejectedFiles", rejectedFiles);
            return;
          }
          if (files.length) {
            context.set("acceptedFiles", [
              files[0]
            ]);
            context.set("rejectedFiles", rejectedFiles);
            return;
          }
          if (rejectedFiles.length) {
            context.set("acceptedFiles", context.get("acceptedFiles"));
            context.set("rejectedFiles", rejectedFiles);
          }
        };
        const transform = prop("transformFiles");
        if (transform) {
          context.set("transforming", true);
          transform(acceptedFiles).then(set).catch((err) => {
            warn(`[zag-js/file-upload] error transforming files
${err}`);
          }).finally(() => {
            context.set("transforming", false);
          });
        } else {
          set(acceptedFiles);
        }
      },
      removeFile({ context, event }) {
        if (event.itemType === "rejected") {
          const rejectedFiles = context.get("rejectedFiles").filter((item) => !isFileEqual(item.file, event.file));
          context.set("rejectedFiles", rejectedFiles);
        } else {
          const files = context.get("acceptedFiles").filter((file) => !isFileEqual(file, event.file));
          context.set("acceptedFiles", files);
        }
      },
      clearRejectedFiles({ context }) {
        context.set("rejectedFiles", []);
      },
      clearFiles({ context }) {
        context.set("acceptedFiles", []);
        context.set("rejectedFiles", []);
      }
    }
  }
});

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/file-upload/1.43.0/dist/file-upload.props.mjs
var props3 = createProps()([
  "accept",
  "acceptedFiles",
  "allowDrop",
  "capture",
  "defaultAcceptedFiles",
  "dir",
  "directory",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "locale",
  "maxFiles",
  "maxFileSize",
  "minFileSize",
  "name",
  "onFileAccept",
  "onFileChange",
  "onFileReject",
  "preventDocumentDrop",
  "readOnly",
  "required",
  "transformFiles",
  "translations",
  "validate"
]);
var splitProps4 = createSplitProps(props3);
var itemProps2 = createProps()([
  "file",
  "type"
]);
var splitItemProps2 = createSplitProps(itemProps2);

// interpreter/vendor/entry-zag/file-upload.ts
var generateKey2 = (api) => api.acceptedFiles.map((f) => `${f.name}:${f.size}:${f.lastModified}`).join("|");
var part = (tag, name, index, children = []) => ({
  tag,
  attrs: {
    "data-part": name,
    "data-file": String(index)
  },
  children
});
var generate2 = (api) => ({
  itemGroup: api.acceptedFiles.map((file, i) => ({
    ...part("div", "item", i),
    children: [
      // img rather than a background, so a picture that fails to decode is
      // visibly a broken picture instead of an empty box.
      part("img", "itemPreviewImage", i),
      part("span", "itemName", i, [
        file.name
      ]),
      part("span", "itemSizeText", i, [
        api.getFileSize(file)
      ]),
      part("span", "itemDeleteTrigger", i, [
        "\xD7"
      ])
    ]
  }))
});
var partArg2 = (api, el) => {
  const raw = el.closest("[data-file]")?.dataset.file;
  if (raw === void 0) return void 0;
  const file = api.acceptedFiles[Number(raw)];
  if (file === void 0) return void 0;
  const name = el._prontoPart ?? el.dataset.part;
  if (name !== "itemPreviewImage") return {
    file
  };
  const root = el.closest("[data-widget]");
  const cache = root._prontoFileUrls ??= /* @__PURE__ */ new Map();
  if (!cache.has(file)) api.createFileUrl(file, (url) => cache.set(file, url));
  return {
    file,
    url: cache.get(file)
  };
};
var fromInput2 = (input) => ({
  name: input.name,
  required: input.required,
  accept: input.accept || void 0,
  maxFiles: input.multiple ? void 0 : 1
});
var writeInput2 = (details, input) => {
  const files = details.acceptedFiles ?? [];
  const current = Array.from(input.files ?? []);
  const same = current.length === files.length && current.every((f, i) => f === files[i]);
  if (same) return false;
  const carrier = new DataTransfer();
  for (const file of files) carrier.items.add(file);
  input.files = carrier.files;
  return true;
};

// interpreter/vendor/entry-zag/listbox.ts
var listbox_exports = {};
__export(listbox_exports, {
  anatomy: () => anatomy4,
  collection: () => collection2,
  connect: () => connect4,
  gridCollection: () => gridCollection,
  itemGroupLabelProps: () => itemGroupLabelProps2,
  itemGroupProps: () => itemGroupProps2,
  itemProps: () => itemProps3,
  machine: () => machine4,
  props: () => props4,
  splitItemGroupLabelProps: () => splitItemGroupLabelProps2,
  splitItemGroupProps: () => splitItemGroupProps2,
  splitItemProps: () => splitItemProps3,
  splitProps: () => splitProps5
});

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/listbox/1.43.0/dist/listbox.anatomy.mjs
var anatomy4 = createAnatomy("listbox").parts("label", "input", "item", "itemText", "itemIndicator", "itemGroup", "itemGroupLabel", "content", "root", "valueText");
var parts4 = anatomy4.build();

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/listbox/1.43.0/dist/listbox.collection.mjs
var collection2 = (options) => {
  return new ListCollection(options);
};
collection2.empty = () => {
  return new ListCollection({
    items: []
  });
};
var gridCollection = (options) => {
  return new GridCollection(options);
};
gridCollection.empty = () => {
  return new GridCollection({
    items: [],
    columnCount: 0
  });
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/listbox/1.43.0/dist/listbox.dom.mjs
var getRootId4 = (ctx) => ctx.ids?.root ?? `listbox:${ctx.id}`;
var getContentId3 = (ctx) => ctx.ids?.content ?? `listbox:${ctx.id}:content`;
var getLabelId4 = (ctx) => ctx.ids?.label ?? `listbox:${ctx.id}:label`;
var getItemId3 = (ctx, id) => ctx.ids?.item?.(id) ?? `listbox:${ctx.id}:item:${id}`;
var getItemGroupId2 = (ctx, id) => ctx.ids?.itemGroup?.(id) ?? `listbox:${ctx.id}:item-group:${id}`;
var getItemGroupLabelId2 = (ctx, id) => ctx.ids?.itemGroupLabel?.(id) ?? `listbox:${ctx.id}:item-group-label:${id}`;
var getContentEl3 = (ctx) => ctx.getById(getContentId3(ctx));
var getItemEl2 = (ctx, id) => ctx.getById(getItemId3(ctx, id));

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/listbox/1.43.0/dist/listbox.connect.mjs
function connect4(service, normalize) {
  const { context, prop, scope, computed, send, refs } = service;
  const disabled = prop("disabled");
  const collection4 = prop("collection");
  const layout = isGridCollection(collection4) ? "grid" : "list";
  const focused = context.get("focused");
  const focusVisible = refs.get("focusVisible") && focused;
  const inputState = refs.get("inputState");
  const value = context.get("value");
  const selectedItems = computed("selectedItems");
  const highlightedValue = context.get("highlightedValue");
  const highlightedItem = context.get("highlightedItem");
  const isTypingAhead = computed("isTypingAhead");
  const interactive = computed("isInteractive");
  const ariaActiveDescendant = highlightedValue ? getItemId3(scope, highlightedValue) : void 0;
  function getItemState(props6) {
    const itemDisabled = collection4.getItemDisabled(props6.item);
    const value2 = collection4.getItemValue(props6.item);
    ensure(value2, () => `[zag-js] No value found for item ${JSON.stringify(props6.item)}`);
    const highlighted = highlightedValue === value2;
    return {
      value: value2,
      disabled: Boolean(disabled || itemDisabled),
      focused: highlighted && focused,
      focusVisible: highlighted && focusVisible,
      // deprecated
      highlighted: highlighted && (inputState.focused ? focused : focusVisible),
      selected: context.get("value").includes(value2)
    };
  }
  return {
    empty: value.length === 0,
    highlightedItem,
    highlightedValue,
    clearHighlightedValue() {
      send({
        type: "HIGHLIGHTED_VALUE.SET",
        value: null
      });
    },
    selectedItems,
    hasSelectedItems: computed("hasSelectedItems"),
    value,
    valueAsString: computed("valueAsString"),
    collection: collection4,
    disabled: !!disabled,
    selectValue(value2) {
      send({
        type: "ITEM.SELECT",
        value: value2
      });
    },
    setValue(value2) {
      send({
        type: "VALUE.SET",
        value: value2
      });
    },
    selectAll() {
      if (!computed("multiple")) {
        throw new Error("[zag-js] Cannot select all items in a single-select listbox");
      }
      send({
        type: "VALUE.SET",
        value: collection4.getValues()
      });
    },
    highlightValue(value2) {
      send({
        type: "HIGHLIGHTED_VALUE.SET",
        value: value2
      });
    },
    highlightFirst() {
      send({
        type: "HIGHLIGHT.FIRST"
      });
    },
    highlightLast() {
      send({
        type: "HIGHLIGHT.LAST"
      });
    },
    highlightNext() {
      send({
        type: "HIGHLIGHT.NEXT"
      });
    },
    highlightPrevious() {
      send({
        type: "HIGHLIGHT.PREV"
      });
    },
    clearValue(value2) {
      if (value2) {
        send({
          type: "ITEM.CLEAR",
          value: value2
        });
      } else {
        send({
          type: "VALUE.CLEAR"
        });
      }
    },
    getItemState,
    getRootProps() {
      return normalize.element({
        ...parts4.root.attrs,
        dir: prop("dir"),
        id: getRootId4(scope),
        "data-orientation": prop("orientation"),
        "data-disabled": dataAttr(disabled)
      });
    },
    getInputProps(props6 = {}) {
      const keyboardPriority = props6.keyboardPriority ?? "caret";
      return normalize.input({
        ...parts4.input.attrs,
        dir: prop("dir"),
        disabled,
        "data-disabled": dataAttr(disabled),
        autoComplete: "off",
        autoCorrect: "off",
        "aria-haspopup": "listbox",
        "aria-controls": getContentId3(scope),
        "aria-autocomplete": "list",
        "aria-activedescendant": ariaActiveDescendant,
        spellCheck: false,
        enterKeyHint: "go",
        onFocus() {
          queueMicrotask(() => {
            send({
              type: "INPUT.FOCUS",
              autoHighlight: !!props6?.autoHighlight
            });
          });
        },
        onBlur() {
          send({
            type: "CONTENT.BLUR",
            src: "input"
          });
        },
        onInput(event) {
          if (!props6?.autoHighlight) return;
          if (event.currentTarget.value.trim()) return;
          queueMicrotask(() => {
            send({
              type: "HIGHLIGHTED_VALUE.SET",
              value: null
            });
          });
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return;
          if (isComposingEvent(event)) return;
          const nativeEvent = getNativeEvent(event);
          const forwardEvent = () => {
            event.preventDefault();
            const win = scope.getWin();
            const keyboardEvent = new win.KeyboardEvent(nativeEvent.type, nativeEvent);
            getContentEl3(scope)?.dispatchEvent(keyboardEvent);
          };
          switch (nativeEvent.key) {
            case "ArrowLeft":
            case "ArrowRight": {
              if (!isGridCollection(collection4)) return;
              if (event.ctrlKey) return;
              if (keyboardPriority !== "navigate") return;
              forwardEvent();
              break;
            }
            case "Home":
            case "End": {
              if (keyboardPriority !== "navigate") return;
              if (highlightedValue == null && event.shiftKey) return;
              forwardEvent();
              break;
            }
            case "ArrowDown":
            case "ArrowUp": {
              forwardEvent();
              break;
            }
            case "Enter":
              if (highlightedValue != null) {
                event.preventDefault();
                send({
                  type: "ITEM.CLICK",
                  value: highlightedValue
                });
              }
              break;
            default:
              break;
          }
        }
      });
    },
    getLabelProps() {
      return normalize.element({
        dir: prop("dir"),
        id: getLabelId4(scope),
        ...parts4.label.attrs,
        "data-disabled": dataAttr(disabled)
      });
    },
    getValueTextProps() {
      return normalize.element({
        ...parts4.valueText.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled)
      });
    },
    getItemProps(props6) {
      const itemState = getItemState(props6);
      return normalize.element({
        id: getItemId3(scope, itemState.value),
        role: "option",
        ...parts4.item.attrs,
        dir: prop("dir"),
        "data-value": itemState.value,
        "aria-selected": itemState.selected,
        "data-selected": dataAttr(itemState.selected),
        "data-layout": layout,
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-orientation": prop("orientation"),
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-disabled": dataAttr(itemState.disabled),
        "aria-disabled": ariaAttr(itemState.disabled),
        onPointerMove(event) {
          if (!props6.highlightOnHover) return;
          if (itemState.disabled || event.pointerType !== "mouse") return;
          if (itemState.highlighted) return;
          send({
            type: "ITEM.POINTER_MOVE",
            value: itemState.value
          });
        },
        onMouseDown(event) {
          event.preventDefault();
          getContentEl3(scope)?.focus();
        },
        onClick(event) {
          if (event.defaultPrevented) return;
          if (isDownloadingEvent(event)) return;
          if (isOpeningInNewTab(event)) return;
          if (isContextMenuEvent(event)) return;
          if (itemState.disabled) return;
          send({
            type: "ITEM.CLICK",
            value: itemState.value,
            shiftKey: event.shiftKey,
            anchorValue: highlightedValue,
            metaKey: isCtrlOrMetaKey(event)
          });
        }
      });
    },
    getItemTextProps(props6) {
      const itemState = getItemState(props6);
      return normalize.element({
        ...parts4.itemText.attrs,
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted)
      });
    },
    getItemIndicatorProps(props6) {
      const itemState = getItemState(props6);
      return normalize.element({
        ...parts4.itemIndicator.attrs,
        "aria-hidden": true,
        "data-state": itemState.selected ? "checked" : "unchecked",
        hidden: !itemState.selected
      });
    },
    getItemGroupLabelProps(props6) {
      const { htmlFor } = props6;
      return normalize.element({
        ...parts4.itemGroupLabel.attrs,
        id: getItemGroupLabelId2(scope, htmlFor),
        dir: prop("dir"),
        role: "presentation"
      });
    },
    getItemGroupProps(props6) {
      const { id } = props6;
      return normalize.element({
        ...parts4.itemGroup.attrs,
        "data-disabled": dataAttr(disabled),
        "data-orientation": prop("orientation"),
        "data-empty": dataAttr(collection4.size === 0),
        id: getItemGroupId2(scope, id),
        "aria-labelledby": getItemGroupLabelId2(scope, id),
        role: "group",
        dir: prop("dir")
      });
    },
    getContentProps() {
      return normalize.element({
        dir: prop("dir"),
        id: getContentId3(scope),
        role: "listbox",
        ...parts4.content.attrs,
        "data-activedescendant": ariaActiveDescendant,
        "aria-activedescendant": ariaActiveDescendant,
        "data-orientation": prop("orientation"),
        "aria-multiselectable": computed("multiple") ? true : void 0,
        "aria-labelledby": getLabelId4(scope),
        tabIndex: 0,
        "data-layout": layout,
        "data-empty": dataAttr(collection4.size === 0),
        style: {
          "--column-count": isGridCollection(collection4) ? collection4.columnCount : 1
        },
        onFocus() {
          send({
            type: "CONTENT.FOCUS"
          });
        },
        onBlur() {
          send({
            type: "CONTENT.BLUR"
          });
        },
        onKeyDown(event) {
          if (!interactive) return;
          const target = getEventTarget(event);
          if (!contains(event.currentTarget, getEventTarget(event))) return;
          const shiftKey = event.shiftKey;
          const keyMap2 = {
            ArrowUp(event2) {
              let nextValue = null;
              if (isGridCollection(collection4) && highlightedValue) {
                nextValue = collection4.getPreviousRowValue(highlightedValue);
              } else if (highlightedValue) {
                nextValue = collection4.getPreviousValue(highlightedValue);
              }
              if (!nextValue && (prop("loopFocus") || !highlightedValue)) {
                nextValue = collection4.lastValue;
              }
              if (!nextValue) return;
              event2.preventDefault();
              send({
                type: "NAVIGATE",
                value: nextValue,
                shiftKey,
                anchorValue: highlightedValue
              });
            },
            ArrowDown(event2) {
              let nextValue = null;
              if (isGridCollection(collection4) && highlightedValue) {
                nextValue = collection4.getNextRowValue(highlightedValue);
              } else if (highlightedValue) {
                nextValue = collection4.getNextValue(highlightedValue);
              }
              if (!nextValue && (prop("loopFocus") || !highlightedValue)) {
                nextValue = collection4.firstValue;
              }
              if (!nextValue) return;
              event2.preventDefault();
              send({
                type: "NAVIGATE",
                value: nextValue,
                shiftKey,
                anchorValue: highlightedValue
              });
            },
            ArrowLeft() {
              if (!isGridCollection(collection4) && prop("orientation") === "vertical") return;
              let nextValue = highlightedValue ? collection4.getPreviousValue(highlightedValue) : null;
              if (!nextValue && prop("loopFocus")) {
                nextValue = collection4.lastValue;
              }
              if (!nextValue) return;
              event.preventDefault();
              send({
                type: "NAVIGATE",
                value: nextValue,
                shiftKey,
                anchorValue: highlightedValue
              });
            },
            ArrowRight() {
              if (!isGridCollection(collection4) && prop("orientation") === "vertical") return;
              let nextValue = highlightedValue ? collection4.getNextValue(highlightedValue) : null;
              if (!nextValue && prop("loopFocus")) {
                nextValue = collection4.firstValue;
              }
              if (!nextValue) return;
              event.preventDefault();
              send({
                type: "NAVIGATE",
                value: nextValue,
                shiftKey,
                anchorValue: highlightedValue
              });
            },
            Home(event2) {
              if (isEditableElement(target)) return;
              event2.preventDefault();
              let nextValue = collection4.firstValue;
              send({
                type: "NAVIGATE",
                value: nextValue,
                shiftKey,
                anchorValue: highlightedValue
              });
            },
            End(event2) {
              if (isEditableElement(target)) return;
              event2.preventDefault();
              let nextValue = collection4.lastValue;
              send({
                type: "NAVIGATE",
                value: nextValue,
                shiftKey,
                anchorValue: highlightedValue
              });
            },
            Enter() {
              send({
                type: "ITEM.CLICK",
                value: highlightedValue
              });
            },
            a(event2) {
              if (isCtrlOrMetaKey(event2) && computed("multiple") && !prop("disallowSelectAll")) {
                event2.preventDefault();
                send({
                  type: "VALUE.SET",
                  value: collection4.getValues()
                });
              }
            },
            Space(event2) {
              if (isTypingAhead && prop("typeahead")) {
                send({
                  type: "CONTENT.TYPEAHEAD",
                  key: event2.key
                });
              } else {
                keyMap2.Enter?.(event2);
              }
            },
            Escape(event2) {
              if (prop("deselectable") && value.length > 0) {
                event2.preventDefault();
                event2.stopPropagation();
                send({
                  type: "VALUE.CLEAR"
                });
              }
            }
          };
          const exec = keyMap2[getEventKey(event)];
          if (exec) {
            exec(event);
            return;
          }
          if (isEditableElement(target)) return;
          if (getByTypeahead.isValidEvent(event) && prop("typeahead")) {
            send({
              type: "CONTENT.TYPEAHEAD",
              key: event.key
            });
            event.preventDefault();
          }
        }
      });
    }
  };
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/listbox/1.43.0/dist/listbox.machine.mjs
var { guards: guards2, createMachine: createMachine3 } = setup();
var { or } = guards2;
var machine4 = createMachine3({
  props({ props: props6 }) {
    return {
      loopFocus: false,
      composite: true,
      defaultValue: [],
      multiple: false,
      typeahead: true,
      collection: collection2.empty(),
      orientation: "vertical",
      selectionMode: "single",
      ...props6
    };
  },
  context({ prop, bindable: bindable2, getContext }) {
    const initialValue = prop("value") ?? prop("defaultValue") ?? [];
    const initialSelectedItems = prop("collection").findMany(initialValue);
    return {
      value: bindable2(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        isEqual,
        onChange(value) {
          const context = getContext();
          const collection22 = prop("collection");
          const selectedItemMap = context.get("selectedItemMap");
          const proposed = deriveSelectionState({
            values: value,
            collection: collection22,
            selectedItemMap
          });
          const effectiveValue = prop("value") ?? value;
          const effective = effectiveValue === value ? proposed : deriveSelectionState({
            values: effectiveValue,
            collection: collection22,
            selectedItemMap: proposed.nextSelectedItemMap
          });
          context.set("selectedItemMap", effective.nextSelectedItemMap);
          return prop("onValueChange")?.({
            value,
            items: proposed.selectedItems
          });
        }
      })),
      highlightedValue: bindable2(() => ({
        defaultValue: prop("defaultHighlightedValue") || null,
        value: prop("highlightedValue"),
        sync: true,
        onChange(value) {
          prop("onHighlightChange")?.({
            highlightedValue: value,
            highlightedItem: prop("collection").find(value),
            highlightedIndex: prop("collection").indexOf(value)
          });
        }
      })),
      highlightedItem: bindable2(() => ({
        defaultValue: null
      })),
      selectedItemMap: bindable2(() => {
        return {
          defaultValue: createSelectedItemMap({
            selectedItems: initialSelectedItems,
            collection: prop("collection")
          })
        };
      }),
      focused: bindable2(() => ({
        sync: true,
        defaultValue: false
      }))
    };
  },
  refs() {
    return {
      typeahead: {
        ...getByTypeahead.defaultOptions
      },
      focusVisible: false,
      inputState: {
        autoHighlight: false,
        focused: false
      }
    };
  },
  computed: {
    hasSelectedItems: ({ context }) => context.get("value").length > 0,
    isTypingAhead: ({ refs }) => refs.get("typeahead").keysSoFar !== "",
    isInteractive: ({ prop }) => !prop("disabled"),
    selection: ({ context, prop }) => {
      const selection = new Selection(context.get("value"));
      selection.selectionMode = prop("selectionMode");
      selection.deselectable = !!prop("deselectable");
      return selection;
    },
    multiple: ({ prop }) => prop("selectionMode") === "multiple" || prop("selectionMode") === "extended",
    selectedItems: ({ context, prop }) => resolveSelectedItems({
      values: context.get("value"),
      collection: prop("collection"),
      selectedItemMap: context.get("selectedItemMap")
    }),
    valueAsString: ({ computed, prop }) => prop("collection").stringifyItems(computed("selectedItems"))
  },
  initialState() {
    return "idle";
  },
  watch({ context, prop, track, action }) {
    track([
      () => context.get("value").toString()
    ], () => {
      action([
        "syncSelectedItems"
      ]);
    });
    track([
      () => context.get("highlightedValue")
    ], () => {
      action([
        "syncHighlightedItem"
      ]);
    });
    track([
      () => prop("collection").toString()
    ], () => {
      action([
        "syncHighlightedValue"
      ]);
    });
  },
  effects: [
    "trackFocusVisible"
  ],
  on: {
    "HIGHLIGHTED_VALUE.SET": {
      actions: [
        "setHighlightedItem"
      ]
    },
    "ITEM.SELECT": {
      actions: [
        "selectItem"
      ]
    },
    "ITEM.CLEAR": {
      actions: [
        "clearItem"
      ]
    },
    "VALUE.SET": {
      actions: [
        "setSelectedItems"
      ]
    },
    "VALUE.CLEAR": {
      actions: [
        "clearSelectedItems"
      ]
    },
    "HIGHLIGHT.FIRST": {
      actions: [
        "highlightFirstValue"
      ]
    },
    "HIGHLIGHT.LAST": {
      actions: [
        "highlightLastValue"
      ]
    },
    "HIGHLIGHT.NEXT": {
      actions: [
        "highlightNextValue"
      ]
    },
    "HIGHLIGHT.PREV": {
      actions: [
        "highlightPreviousValue"
      ]
    }
  },
  states: {
    idle: {
      effects: [
        "scrollToHighlightedItem"
      ],
      on: {
        "INPUT.FOCUS": {
          actions: [
            "setFocused",
            "setInputState"
          ]
        },
        "CONTENT.FOCUS": [
          {
            guard: or("hasSelectedValue", "hasHighlightedValue"),
            actions: [
              "setFocused"
            ]
          },
          {
            actions: [
              "setFocused",
              "setDefaultHighlightedValue"
            ]
          }
        ],
        "CONTENT.BLUR": {
          actions: [
            "clearFocused",
            "clearInputState"
          ]
        },
        "ITEM.CLICK": {
          actions: [
            "setHighlightedItem",
            "selectHighlightedItem"
          ]
        },
        "CONTENT.TYPEAHEAD": {
          actions: [
            "setFocused",
            "highlightMatchingItem"
          ]
        },
        "ITEM.POINTER_MOVE": {
          actions: [
            "highlightItem"
          ]
        },
        "ITEM.POINTER_LEAVE": {
          actions: [
            "clearHighlightedItem"
          ]
        },
        NAVIGATE: {
          actions: [
            "setFocused",
            "setHighlightedItem",
            "selectWithKeyboard"
          ]
        }
      }
    }
  },
  implementations: {
    guards: {
      hasSelectedValue: ({ context }) => context.get("value").length > 0,
      hasHighlightedValue: ({ context }) => context.get("highlightedValue") != null
    },
    effects: {
      trackFocusVisible: ({ scope, refs }) => {
        return trackFocusVisible({
          root: scope.getRootNode?.(),
          onChange(details) {
            refs.set("focusVisible", details.isFocusVisible);
          }
        });
      },
      scrollToHighlightedItem({ context, prop, scope }) {
        const exec = (immediate) => {
          const highlightedValue = context.get("highlightedValue");
          if (highlightedValue == null) return;
          const modality = getInteractionModality();
          if (modality === "pointer") return;
          const contentEl2 = getContentEl3(scope);
          const scrollToIndexFn = prop("scrollToIndexFn");
          if (scrollToIndexFn) {
            const highlightedIndex = prop("collection").indexOf(highlightedValue);
            scrollToIndexFn?.({
              index: highlightedIndex,
              immediate,
              getElement() {
                return getItemEl2(scope, highlightedValue);
              }
            });
            return;
          }
          const itemEl = getItemEl2(scope, highlightedValue);
          scrollIntoView(itemEl, {
            rootEl: contentEl2,
            block: "nearest"
          });
        };
        raf(() => {
          setInteractionModality("virtual");
          exec(true);
        });
        const contentEl = () => getContentEl3(scope);
        return observeAttributes(contentEl, {
          defer: true,
          attributes: [
            "data-activedescendant"
          ],
          callback() {
            exec(false);
          }
        });
      }
    },
    actions: {
      selectHighlightedItem({ context, prop, event, computed }) {
        const value = event.value ?? context.get("highlightedValue");
        const collection22 = prop("collection");
        if (value == null || !collection22.has(value)) return;
        const selection = computed("selection");
        if (event.shiftKey && computed("multiple") && event.anchorValue) {
          const next = selection.extendSelection(collection22, event.anchorValue, value);
          invokeOnSelect(selection, next, prop("onSelect"));
          context.set("value", Array.from(next));
        } else {
          const next = selection.select(collection22, value, event.metaKey);
          invokeOnSelect(selection, next, prop("onSelect"));
          context.set("value", Array.from(next));
        }
      },
      selectWithKeyboard({ context, prop, event, computed }) {
        const selection = computed("selection");
        const collection22 = prop("collection");
        if (event.shiftKey && computed("multiple") && event.anchorValue) {
          const next = selection.extendSelection(collection22, event.anchorValue, event.value);
          invokeOnSelect(selection, next, prop("onSelect"));
          context.set("value", Array.from(next));
          return;
        }
        if (prop("selectOnHighlight")) {
          const next = selection.replaceSelection(collection22, event.value);
          invokeOnSelect(selection, next, prop("onSelect"));
          context.set("value", Array.from(next));
        }
      },
      highlightItem({ context, event }) {
        context.set("highlightedValue", event.value);
      },
      highlightMatchingItem({ context, prop, event, refs }) {
        const value = prop("collection").search(event.key, {
          state: refs.get("typeahead"),
          currentValue: context.get("highlightedValue")
        });
        if (value == null) return;
        context.set("highlightedValue", value);
      },
      setHighlightedItem({ context, event }) {
        context.set("highlightedValue", event.value);
      },
      highlightFirstValue({ context, prop }) {
        context.set("highlightedValue", prop("collection").firstValue ?? null);
      },
      highlightLastValue({ context, prop }) {
        context.set("highlightedValue", prop("collection").lastValue ?? null);
      },
      highlightNextValue({ context, prop }) {
        const collection22 = prop("collection");
        const highlightedValue = context.get("highlightedValue");
        let nextValue = null;
        if (isGridCollection(collection22) && highlightedValue) {
          nextValue = collection22.getNextRowValue(highlightedValue);
        } else if (highlightedValue) {
          nextValue = collection22.getNextValue(highlightedValue);
        }
        if (!nextValue && (prop("loopFocus") || !highlightedValue)) {
          nextValue = collection22.firstValue;
        }
        if (!nextValue) return;
        context.set("highlightedValue", nextValue);
      },
      highlightPreviousValue({ context, prop }) {
        const collection22 = prop("collection");
        const highlightedValue = context.get("highlightedValue");
        let nextValue = null;
        if (isGridCollection(collection22) && highlightedValue) {
          nextValue = collection22.getPreviousRowValue(highlightedValue);
        } else if (highlightedValue) {
          nextValue = collection22.getPreviousValue(highlightedValue);
        }
        if (!nextValue && (prop("loopFocus") || !highlightedValue)) {
          nextValue = collection22.lastValue;
        }
        if (!nextValue) return;
        context.set("highlightedValue", nextValue);
      },
      clearHighlightedItem({ context }) {
        context.set("highlightedValue", null);
      },
      selectItem({ context, prop, event, computed }) {
        const collection22 = prop("collection");
        const selection = computed("selection");
        const next = selection.select(collection22, event.value);
        invokeOnSelect(selection, next, prop("onSelect"));
        context.set("value", Array.from(next));
      },
      clearItem({ context, event, computed }) {
        const selection = computed("selection");
        const value = selection.deselect(event.value);
        context.set("value", Array.from(value));
      },
      setSelectedItems({ context, event }) {
        context.set("value", event.value);
      },
      clearSelectedItems({ context }) {
        context.set("value", []);
      },
      syncSelectedItems({ context, prop }) {
        const next = deriveSelectionState({
          values: context.get("value"),
          collection: prop("collection"),
          selectedItemMap: context.get("selectedItemMap")
        });
        context.set("selectedItemMap", next.nextSelectedItemMap);
      },
      syncHighlightedItem({ context, prop }) {
        const collection22 = prop("collection");
        const highlightedValue = context.get("highlightedValue");
        const highlightedItem = highlightedValue ? collection22.find(highlightedValue) : null;
        context.set("highlightedItem", highlightedItem);
      },
      syncHighlightedValue({ context, prop, refs }) {
        const collection22 = prop("collection");
        const highlightedValue = context.get("highlightedValue");
        const { autoHighlight } = refs.get("inputState");
        if (autoHighlight) {
          queueMicrotask(() => {
            context.set("highlightedValue", prop("collection").firstValue ?? null);
          });
          return;
        }
        if (highlightedValue != null && !collection22.has(highlightedValue)) {
          queueMicrotask(() => {
            context.set("highlightedValue", null);
          });
        }
      },
      setFocused({ context }) {
        context.set("focused", true);
      },
      setDefaultHighlightedValue({ context, prop }) {
        const collection22 = prop("collection");
        const firstValue = collection22.firstValue;
        if (firstValue != null) {
          context.set("highlightedValue", firstValue);
        }
      },
      clearFocused({ context }) {
        context.set("focused", false);
      },
      setInputState({ refs, event }) {
        refs.set("inputState", {
          autoHighlight: !!event.autoHighlight,
          focused: true
        });
      },
      clearInputState({ refs }) {
        refs.set("inputState", {
          autoHighlight: false,
          focused: false
        });
      }
    }
  }
});
var diff = (a, b) => {
  const result = new Set(a);
  for (const item of b) result.delete(item);
  return result;
};
function invokeOnSelect(current, next, onSelect) {
  const added = diff(next, current);
  for (const item of added) {
    onSelect?.({
      value: item
    });
  }
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/listbox/1.43.0/dist/listbox.props.mjs
var props4 = createProps()([
  "collection",
  "defaultHighlightedValue",
  "defaultValue",
  "dir",
  "disabled",
  "deselectable",
  "disallowSelectAll",
  "getRootNode",
  "highlightedValue",
  "id",
  "ids",
  "loopFocus",
  "onHighlightChange",
  "onSelect",
  "onValueChange",
  "orientation",
  "scrollToIndexFn",
  "selectionMode",
  "selectOnHighlight",
  "typeahead",
  "value"
]);
var splitProps5 = createSplitProps(props4);
var itemProps3 = createProps()([
  "item",
  "highlightOnHover"
]);
var splitItemProps3 = createSplitProps(itemProps3);
var itemGroupProps2 = createProps()([
  "id"
]);
var splitItemGroupProps2 = createSplitProps(itemGroupProps2);
var itemGroupLabelProps2 = createProps()([
  "htmlFor"
]);
var splitItemGroupLabelProps2 = createSplitProps(itemGroupLabelProps2);

// interpreter/vendor/entry-zag/select.ts
var select_exports = {};
__export(select_exports, {
  anatomy: () => anatomy5,
  collection: () => collection3,
  connect: () => connect5,
  itemGroupLabelProps: () => itemGroupLabelProps3,
  itemGroupProps: () => itemGroupProps3,
  itemProps: () => itemProps4,
  machine: () => machine5,
  props: () => props5,
  splitItemGroupLabelProps: () => splitItemGroupLabelProps3,
  splitItemGroupProps: () => splitItemGroupProps3,
  splitItemProps: () => splitItemProps4,
  splitProps: () => splitProps6
});

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/select/1.43.0/dist/select.anatomy.mjs
var anatomy5 = createAnatomy("select").parts("label", "positioner", "trigger", "indicator", "clearTrigger", "item", "itemText", "itemIndicator", "itemGroup", "itemGroupLabel", "list", "content", "root", "control", "valueText");
var parts5 = anatomy5.build();

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/select/1.43.0/dist/select.collection.mjs
var collection3 = (options) => {
  return new ListCollection(options);
};
collection3.empty = () => {
  return new ListCollection({
    items: []
  });
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/select/1.43.0/dist/select.dom.mjs
var getRootId5 = (ctx) => ctx.ids?.root ?? `select:${ctx.id}`;
var getContentId4 = (ctx) => ctx.ids?.content ?? `select:${ctx.id}:content`;
var getTriggerId4 = (ctx) => ctx.ids?.trigger ?? `select:${ctx.id}:trigger`;
var getClearTriggerId3 = (ctx) => ctx.ids?.clearTrigger ?? `select:${ctx.id}:clear-trigger`;
var getLabelId5 = (ctx) => ctx.ids?.label ?? `select:${ctx.id}:label`;
var getControlId3 = (ctx) => ctx.ids?.control ?? `select:${ctx.id}:control`;
var getItemId4 = (ctx, id) => ctx.ids?.item?.(id) ?? `select:${ctx.id}:option:${id}`;
var getHiddenSelectId = (ctx) => ctx.ids?.hiddenSelect ?? `select:${ctx.id}:select`;
var getPositionerId3 = (ctx) => ctx.ids?.positioner ?? `select:${ctx.id}:positioner`;
var getItemGroupId3 = (ctx, id) => ctx.ids?.itemGroup?.(id) ?? `select:${ctx.id}:optgroup:${id}`;
var getItemGroupLabelId3 = (ctx, id) => ctx.ids?.itemGroupLabel?.(id) ?? `select:${ctx.id}:optgroup-label:${id}`;
var getHiddenSelectEl = (ctx) => ctx.getById(getHiddenSelectId(ctx));
var getContentEl4 = (ctx) => ctx.getById(getContentId4(ctx));
var getTriggerEl3 = (ctx) => ctx.getById(getTriggerId4(ctx));
var getClearTriggerEl3 = (ctx) => ctx.getById(getClearTriggerId3(ctx));
var getPositionerEl3 = (ctx) => ctx.getById(getPositionerId3(ctx));
var getItemEl3 = (ctx, id) => {
  if (id == null) return null;
  return ctx.getById(getItemId4(ctx, id));
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/select/1.43.0/dist/select.connect.mjs
function connect5(service, normalize) {
  const { context, prop, scope, state: state2, computed, send } = service;
  const translations = prop("translations");
  const disabled = prop("disabled") || context.get("fieldsetDisabled");
  const invalid = !!prop("invalid");
  const required = !!prop("required");
  const readOnly = !!prop("readOnly");
  const composite = prop("composite");
  const collection4 = prop("collection");
  const open = state2.hasTag("open");
  const focused = state2.matches("focused");
  const highlightedValue = context.get("highlightedValue");
  const highlightedItem = context.get("highlightedItem");
  const selectedItems = computed("selectedItems");
  const currentPlacement = context.get("currentPlacement");
  const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : void 0;
  const isTypingAhead = computed("isTypingAhead");
  const interactive = computed("isInteractive");
  const ariaActiveDescendant = highlightedValue ? getItemId4(scope, highlightedValue) : void 0;
  function getItemState(props6) {
    const _disabled = collection4.getItemDisabled(props6.item);
    const value = collection4.getItemValue(props6.item);
    ensure(value, () => `[zag-js] No value found for item ${JSON.stringify(props6.item)}`);
    return {
      value,
      disabled: Boolean(disabled || _disabled),
      highlighted: highlightedValue === value,
      selected: context.get("value").includes(value)
    };
  }
  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement
  });
  return {
    open,
    focused,
    empty: context.get("value").length === 0,
    highlightedItem,
    highlightedValue,
    selectedItems,
    hasSelectedItems: computed("hasSelectedItems"),
    value: context.get("value"),
    valueAsString: computed("valueAsString"),
    collection: collection4,
    multiple: !!prop("multiple"),
    disabled: !!disabled,
    reposition(options = {}) {
      send({
        type: "POSITIONING.SET",
        options
      });
    },
    focus() {
      getTriggerEl3(scope)?.focus({
        preventScroll: true
      });
    },
    setOpen(nextOpen) {
      const open2 = state2.hasTag("open");
      if (open2 === nextOpen) return;
      send({
        type: nextOpen ? "OPEN" : "CLOSE"
      });
    },
    selectValue(value) {
      send({
        type: "ITEM.SELECT",
        value
      });
    },
    setValue(value) {
      send({
        type: "VALUE.SET",
        value
      });
    },
    selectAll() {
      send({
        type: "VALUE.SET",
        value: collection4.getValues()
      });
    },
    setHighlightValue(value) {
      send({
        type: "HIGHLIGHTED_VALUE.SET",
        value
      });
    },
    clearHighlightValue() {
      send({
        type: "HIGHLIGHTED_VALUE.CLEAR"
      });
    },
    clearValue(value) {
      if (value) {
        send({
          type: "ITEM.CLEAR",
          value
        });
      } else {
        send({
          type: "VALUE.CLEAR"
        });
      }
    },
    getItemState,
    getRootProps() {
      return normalize.element({
        ...parts5.root.attrs,
        dir: prop("dir"),
        id: getRootId5(scope),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly)
      });
    },
    getLabelProps() {
      return normalize.label({
        dir: prop("dir"),
        id: getLabelId5(scope),
        ...parts5.label.attrs,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-required": dataAttr(required),
        htmlFor: getHiddenSelectId(scope),
        onClick(event) {
          if (event.defaultPrevented) return;
          if (disabled) return;
          getTriggerEl3(scope)?.focus({
            preventScroll: true
          });
        }
      });
    },
    getControlProps() {
      return normalize.element({
        ...parts5.control.attrs,
        dir: prop("dir"),
        id: getControlId3(scope),
        "data-state": open ? "open" : "closed",
        "data-focus": dataAttr(focused),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid)
      });
    },
    getValueTextProps() {
      return normalize.element({
        ...parts5.valueText.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused)
      });
    },
    getTriggerProps() {
      return normalize.button({
        id: getTriggerId4(scope),
        disabled,
        dir: prop("dir"),
        type: "button",
        role: "combobox",
        "aria-controls": getContentId4(scope),
        "aria-expanded": open,
        "aria-haspopup": "listbox",
        "data-state": open ? "open" : "closed",
        "aria-invalid": invalid,
        "aria-required": required,
        "aria-labelledby": getLabelId5(scope),
        ...parts5.trigger.attrs,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-placement": currentPlacement,
        "data-side": currentPlacementSide,
        "data-placeholder-shown": dataAttr(!computed("hasSelectedItems")),
        onClick(event) {
          if (!interactive) return;
          if (event.defaultPrevented) return;
          send({
            type: "TRIGGER.CLICK"
          });
        },
        onFocus() {
          send({
            type: "TRIGGER.FOCUS"
          });
        },
        onBlur() {
          send({
            type: "TRIGGER.BLUR"
          });
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return;
          if (!interactive) return;
          const keyMap2 = {
            ArrowUp() {
              send({
                type: "TRIGGER.ARROW_UP"
              });
            },
            ArrowDown(event2) {
              send({
                type: event2.altKey ? "OPEN" : "TRIGGER.ARROW_DOWN"
              });
            },
            ArrowLeft() {
              send({
                type: "TRIGGER.ARROW_LEFT"
              });
            },
            ArrowRight() {
              send({
                type: "TRIGGER.ARROW_RIGHT"
              });
            },
            Home() {
              send({
                type: "TRIGGER.HOME"
              });
            },
            End() {
              send({
                type: "TRIGGER.END"
              });
            },
            Enter() {
              send({
                type: "TRIGGER.ENTER"
              });
            },
            Space(event2) {
              if (isTypingAhead) {
                send({
                  type: "TRIGGER.TYPEAHEAD",
                  key: event2.key
                });
              } else {
                send({
                  type: "TRIGGER.ENTER"
                });
              }
            }
          };
          const exec = keyMap2[getEventKey(event, {
            dir: prop("dir"),
            orientation: "vertical"
          })];
          if (exec) {
            exec(event);
            event.preventDefault();
            return;
          }
          if (getByTypeahead.isValidEvent(event)) {
            send({
              type: "TRIGGER.TYPEAHEAD",
              key: event.key
            });
            event.preventDefault();
          }
        }
      });
    },
    getIndicatorProps() {
      return normalize.element({
        ...parts5.indicator.attrs,
        dir: prop("dir"),
        "aria-hidden": true,
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly)
      });
    },
    getItemProps(props6) {
      const itemState = getItemState(props6);
      return normalize.element({
        id: getItemId4(scope, itemState.value),
        role: "option",
        ...parts5.item.attrs,
        dir: prop("dir"),
        "data-value": itemState.value,
        "aria-selected": itemState.selected,
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-disabled": dataAttr(itemState.disabled),
        "aria-disabled": ariaAttr(itemState.disabled),
        onPointerMove(event) {
          if (itemState.disabled || event.pointerType !== "mouse") return;
          if (itemState.value === highlightedValue) return;
          send({
            type: "ITEM.POINTER_MOVE",
            value: itemState.value
          });
        },
        onClick(event) {
          if (event.defaultPrevented) return;
          if (itemState.disabled) return;
          send({
            type: "ITEM.CLICK",
            src: "pointerup",
            value: itemState.value
          });
        },
        onPointerLeave(event) {
          if (itemState.disabled) return;
          if (props6.persistFocus) return;
          if (event.pointerType !== "mouse") return;
          const pointerMoved = service.event.previous()?.type.includes("POINTER");
          if (!pointerMoved) return;
          send({
            type: "ITEM.POINTER_LEAVE"
          });
        }
      });
    },
    getItemTextProps(props6) {
      const itemState = getItemState(props6);
      return normalize.element({
        ...parts5.itemText.attrs,
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted)
      });
    },
    getItemIndicatorProps(props6) {
      const itemState = getItemState(props6);
      return normalize.element({
        "aria-hidden": true,
        ...parts5.itemIndicator.attrs,
        "data-state": itemState.selected ? "checked" : "unchecked",
        hidden: !itemState.selected
      });
    },
    getItemGroupLabelProps(props6) {
      const { htmlFor } = props6;
      return normalize.element({
        ...parts5.itemGroupLabel.attrs,
        id: getItemGroupLabelId3(scope, htmlFor),
        dir: prop("dir"),
        role: "presentation"
      });
    },
    getItemGroupProps(props6) {
      const { id } = props6;
      return normalize.element({
        ...parts5.itemGroup.attrs,
        "data-disabled": dataAttr(disabled),
        id: getItemGroupId3(scope, id),
        "aria-labelledby": getItemGroupLabelId3(scope, id),
        role: "group",
        dir: prop("dir")
      });
    },
    getClearTriggerProps() {
      return normalize.button({
        ...parts5.clearTrigger.attrs,
        id: getClearTriggerId3(scope),
        type: "button",
        "aria-label": translations.clearTriggerLabel,
        "data-invalid": dataAttr(invalid),
        disabled,
        hidden: !computed("hasSelectedItems"),
        dir: prop("dir"),
        onClick(event) {
          if (event.defaultPrevented) return;
          send({
            type: "CLEAR.CLICK"
          });
        }
      });
    },
    getHiddenSelectProps() {
      const value = context.get("value");
      const defaultValue = prop("multiple") ? value : value?.[0];
      const handleChange = (e) => {
        const evt = getNativeEvent(e);
        if (isInternalChangeEvent(evt)) return;
        send({
          type: "VALUE.SET",
          value: getSelectedValues(e.currentTarget)
        });
      };
      return normalize.select({
        name: prop("name"),
        form: prop("form"),
        disabled,
        multiple: prop("multiple"),
        required: prop("required"),
        "aria-hidden": true,
        id: getHiddenSelectId(scope),
        defaultValue,
        style: visuallyHiddenStyle,
        tabIndex: -1,
        autoComplete: prop("autoComplete"),
        onChange: handleChange,
        onInput: handleChange,
        // Some browser extensions will focus the hidden select.
        // Let's forward the focus to the trigger.
        onFocus() {
          getTriggerEl3(scope)?.focus({
            preventScroll: true
          });
        },
        "aria-labelledby": getLabelId5(scope)
      });
    },
    getPositionerProps() {
      return normalize.element({
        ...parts5.positioner.attrs,
        dir: prop("dir"),
        id: getPositionerId3(scope),
        style: popperStyles.floating
      });
    },
    getContentProps() {
      return normalize.element({
        hidden: !open,
        dir: prop("dir"),
        id: getContentId4(scope),
        role: composite ? "listbox" : "dialog",
        ...parts5.content.attrs,
        "data-state": open ? "open" : "closed",
        "data-placement": currentPlacement,
        "data-side": currentPlacementSide,
        "data-activedescendant": ariaActiveDescendant,
        "aria-activedescendant": composite ? ariaActiveDescendant : void 0,
        "aria-multiselectable": prop("multiple") && composite ? true : void 0,
        "aria-labelledby": getLabelId5(scope),
        tabIndex: 0,
        onKeyDown(event) {
          if (!interactive) return;
          if (!contains(event.currentTarget, getEventTarget(event))) return;
          if (event.key === "Tab") {
            const valid = isValidTabEvent(event);
            if (!valid) {
              event.preventDefault();
              return;
            }
          }
          const keyMap2 = {
            ArrowUp() {
              send({
                type: "CONTENT.ARROW_UP"
              });
            },
            ArrowDown() {
              send({
                type: "CONTENT.ARROW_DOWN"
              });
            },
            Home() {
              send({
                type: "CONTENT.HOME"
              });
            },
            End() {
              send({
                type: "CONTENT.END"
              });
            },
            Enter() {
              send({
                type: "ITEM.CLICK",
                src: "keydown.enter"
              });
            },
            Space(event2) {
              if (isTypingAhead) {
                send({
                  type: "CONTENT.TYPEAHEAD",
                  key: event2.key
                });
              } else {
                keyMap2.Enter?.(event2);
              }
            }
          };
          const exec = keyMap2[getEventKey(event)];
          if (exec) {
            exec(event);
            event.preventDefault();
            return;
          }
          const target = getEventTarget(event);
          if (isEditableElement(target)) {
            return;
          }
          if (getByTypeahead.isValidEvent(event)) {
            send({
              type: "CONTENT.TYPEAHEAD",
              key: event.key
            });
            event.preventDefault();
          }
        }
      });
    },
    getListProps() {
      return normalize.element({
        ...parts5.list.attrs,
        tabIndex: 0,
        role: !composite ? "listbox" : void 0,
        "aria-labelledby": getTriggerId4(scope),
        "aria-activedescendant": !composite ? ariaActiveDescendant : void 0,
        "aria-multiselectable": !composite && prop("multiple") ? true : void 0
      });
    }
  };
}
var getSelectedValues = (el) => {
  return el.multiple ? Array.from(el.selectedOptions, (o) => o.value) : el.value ? [
    el.value
  ] : [];
};

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/select/1.43.0/dist/select.machine.mjs
var { and: and3, not: not2, or: or2 } = createGuards();
var machine5 = createMachine({
  props({ props: props6 }) {
    return {
      loopFocus: false,
      closeOnSelect: !props6.multiple,
      composite: true,
      defaultValue: [],
      ...props6,
      collection: props6.collection ?? collection3.empty(),
      translations: {
        clearTriggerLabel: "Clear value",
        ...props6.translations
      },
      positioning: {
        placement: "bottom-start",
        gutter: 8,
        ...props6.positioning
      }
    };
  },
  context({ prop, bindable: bindable2, getContext }) {
    const initialValue = prop("value") ?? prop("defaultValue") ?? [];
    const initialSelectedItems = prop("collection").findMany(initialValue);
    return {
      value: bindable2(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        isEqual,
        onChange(value) {
          const context = getContext();
          const collection22 = prop("collection");
          const selectedItemMap = context.get("selectedItemMap");
          const proposed = deriveSelectionState({
            values: value,
            collection: collection22,
            selectedItemMap
          });
          const effectiveValue = prop("value") ?? value;
          const effective = effectiveValue === value ? proposed : deriveSelectionState({
            values: effectiveValue,
            collection: collection22,
            selectedItemMap: proposed.nextSelectedItemMap
          });
          context.set("selectedItemMap", effective.nextSelectedItemMap);
          return prop("onValueChange")?.({
            value,
            items: proposed.selectedItems
          });
        }
      })),
      highlightedValue: bindable2(() => ({
        defaultValue: prop("defaultHighlightedValue") || null,
        value: prop("highlightedValue"),
        onChange(value) {
          prop("onHighlightChange")?.({
            highlightedValue: value,
            highlightedItem: prop("collection").find(value),
            highlightedIndex: prop("collection").indexOf(value)
          });
        }
      })),
      currentPlacement: bindable2(() => ({
        defaultValue: void 0
      })),
      fieldsetDisabled: bindable2(() => ({
        defaultValue: false
      })),
      highlightedItem: bindable2(() => ({
        defaultValue: null
      })),
      selectedItemMap: bindable2(() => {
        return {
          defaultValue: createSelectedItemMap({
            selectedItems: initialSelectedItems,
            collection: prop("collection")
          })
        };
      })
    };
  },
  refs() {
    return {
      typeahead: {
        ...getByTypeahead.defaultOptions
      }
    };
  },
  computed: {
    hasSelectedItems: ({ context }) => context.get("value").length > 0,
    isTypingAhead: ({ refs }) => refs.get("typeahead").keysSoFar !== "",
    isDisabled: ({ prop, context }) => !!prop("disabled") || !!context.get("fieldsetDisabled"),
    isInteractive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
    selectedItems: ({ context, prop }) => resolveSelectedItems({
      values: context.get("value"),
      collection: prop("collection"),
      selectedItemMap: context.get("selectedItemMap")
    }),
    valueAsString: ({ computed, prop }) => prop("collection").stringifyItems(computed("selectedItems"))
  },
  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen");
    return open ? "open" : "idle";
  },
  entry: [
    "syncSelectElement"
  ],
  watch({ context, prop, track, action }) {
    track([
      () => context.get("value").toString()
    ], () => {
      action([
        "syncSelectedItems",
        "syncSelectElement",
        "dispatchChangeEvent"
      ]);
    });
    track([
      () => prop("open")
    ], () => {
      action([
        "toggleVisibility"
      ]);
    });
    track([
      () => context.get("highlightedValue")
    ], () => {
      action([
        "syncHighlightedItem"
      ]);
    });
    track([
      () => prop("collection").toString()
    ], () => {
      action([
        "syncCollection"
      ]);
    });
  },
  on: {
    "HIGHLIGHTED_VALUE.SET": {
      actions: [
        "setHighlightedItem"
      ]
    },
    "HIGHLIGHTED_VALUE.CLEAR": {
      actions: [
        "clearHighlightedItem"
      ]
    },
    "ITEM.SELECT": {
      actions: [
        "selectItem"
      ]
    },
    "ITEM.CLEAR": {
      actions: [
        "clearItem"
      ]
    },
    "VALUE.SET": {
      actions: [
        "setSelectedItems"
      ]
    },
    "VALUE.CLEAR": {
      actions: [
        "clearSelectedItems"
      ]
    },
    "CLEAR.CLICK": {
      actions: [
        "clearSelectedItems",
        "focusTriggerEl"
      ]
    }
  },
  effects: [
    "trackFormControlState"
  ],
  states: {
    idle: {
      tags: [
        "closed"
      ],
      on: {
        "CONTROLLED.OPEN": [
          {
            guard: "isTriggerClickEvent",
            target: "open",
            actions: [
              "setInitialFocus",
              "highlightFirstSelectedItem"
            ]
          },
          {
            target: "open",
            actions: [
              "setInitialFocus"
            ]
          }
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnOpen"
            ]
          },
          {
            target: "open",
            actions: [
              "invokeOnOpen",
              "setInitialFocus",
              "highlightFirstSelectedItem"
            ]
          }
        ],
        "TRIGGER.FOCUS": {
          target: "focused"
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnOpen"
            ]
          },
          {
            target: "open",
            actions: [
              "setInitialFocus",
              "invokeOnOpen"
            ]
          }
        ]
      }
    },
    focused: {
      tags: [
        "closed"
      ],
      on: {
        "CONTROLLED.OPEN": [
          {
            guard: "isTriggerClickEvent",
            target: "open",
            actions: [
              "setInitialFocus",
              "highlightFirstSelectedItem"
            ]
          },
          {
            guard: "isTriggerArrowUpEvent",
            target: "open",
            actions: [
              "setInitialFocus",
              "highlightComputedLastItem"
            ]
          },
          {
            guard: or2("isTriggerArrowDownEvent", "isTriggerEnterEvent"),
            target: "open",
            actions: [
              "setInitialFocus",
              "highlightComputedFirstItem"
            ]
          },
          {
            target: "open",
            actions: [
              "setInitialFocus"
            ]
          }
        ],
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnOpen"
            ]
          },
          {
            target: "open",
            actions: [
              "setInitialFocus",
              "invokeOnOpen"
            ]
          }
        ],
        "TRIGGER.BLUR": {
          target: "idle"
        },
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnOpen"
            ]
          },
          {
            target: "open",
            actions: [
              "setInitialFocus",
              "invokeOnOpen",
              "highlightFirstSelectedItem"
            ]
          }
        ],
        "TRIGGER.ENTER": [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnOpen"
            ]
          },
          {
            target: "open",
            actions: [
              "setInitialFocus",
              "invokeOnOpen",
              "highlightComputedFirstItem"
            ]
          }
        ],
        "TRIGGER.ARROW_UP": [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnOpen"
            ]
          },
          {
            target: "open",
            actions: [
              "setInitialFocus",
              "invokeOnOpen",
              "highlightComputedLastItem"
            ]
          }
        ],
        "TRIGGER.ARROW_DOWN": [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnOpen"
            ]
          },
          {
            target: "open",
            actions: [
              "setInitialFocus",
              "invokeOnOpen",
              "highlightComputedFirstItem"
            ]
          }
        ],
        "TRIGGER.ARROW_LEFT": [
          {
            guard: and3(not2("multiple"), "hasSelectedItems"),
            actions: [
              "selectPreviousItem"
            ]
          },
          {
            guard: not2("multiple"),
            actions: [
              "selectLastItem"
            ]
          }
        ],
        "TRIGGER.ARROW_RIGHT": [
          {
            guard: and3(not2("multiple"), "hasSelectedItems"),
            actions: [
              "selectNextItem"
            ]
          },
          {
            guard: not2("multiple"),
            actions: [
              "selectFirstItem"
            ]
          }
        ],
        "TRIGGER.HOME": {
          guard: not2("multiple"),
          actions: [
            "selectFirstItem"
          ]
        },
        "TRIGGER.END": {
          guard: not2("multiple"),
          actions: [
            "selectLastItem"
          ]
        },
        "TRIGGER.TYPEAHEAD": {
          guard: not2("multiple"),
          actions: [
            "selectMatchingItem"
          ]
        }
      }
    },
    open: {
      tags: [
        "open"
      ],
      exit: [
        "scrollContentToTop"
      ],
      effects: [
        "trackDismissableElement",
        "trackFocusVisible",
        "computePlacement",
        "scrollToHighlightedItem"
      ],
      on: {
        "CONTROLLED.CLOSE": [
          {
            guard: "restoreFocus",
            target: "focused",
            actions: [
              "focusTriggerEl",
              "clearHighlightedItem"
            ]
          },
          {
            target: "idle",
            actions: [
              "clearHighlightedItem"
            ]
          }
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnClose"
            ]
          },
          {
            guard: "restoreFocus",
            target: "focused",
            actions: [
              "invokeOnClose",
              "focusTriggerEl",
              "clearHighlightedItem"
            ]
          },
          {
            target: "idle",
            actions: [
              "invokeOnClose",
              "clearHighlightedItem"
            ]
          }
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: [
              "invokeOnClose"
            ]
          },
          {
            target: "focused",
            actions: [
              "invokeOnClose",
              "clearHighlightedItem"
            ]
          }
        ],
        "ITEM.CLICK": [
          {
            guard: and3("closeOnSelect", "isOpenControlled"),
            actions: [
              "selectHighlightedItem",
              "invokeOnClose"
            ]
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: [
              "selectHighlightedItem",
              "invokeOnClose",
              "focusTriggerEl",
              "clearHighlightedItem"
            ]
          },
          {
            actions: [
              "selectHighlightedItem"
            ]
          }
        ],
        "CONTENT.HOME": {
          actions: [
            "highlightFirstItem"
          ]
        },
        "CONTENT.END": {
          actions: [
            "highlightLastItem"
          ]
        },
        "CONTENT.ARROW_DOWN": [
          {
            guard: and3("hasHighlightedItem", "loop", "isLastItemHighlighted"),
            actions: [
              "highlightFirstItem"
            ]
          },
          {
            guard: "hasHighlightedItem",
            actions: [
              "highlightNextItem"
            ]
          },
          {
            actions: [
              "highlightFirstItem"
            ]
          }
        ],
        "CONTENT.ARROW_UP": [
          {
            guard: and3("hasHighlightedItem", "loop", "isFirstItemHighlighted"),
            actions: [
              "highlightLastItem"
            ]
          },
          {
            guard: "hasHighlightedItem",
            actions: [
              "highlightPreviousItem"
            ]
          },
          {
            actions: [
              "highlightLastItem"
            ]
          }
        ],
        "CONTENT.TYPEAHEAD": {
          actions: [
            "highlightMatchingItem"
          ]
        },
        "ITEM.POINTER_MOVE": {
          actions: [
            "highlightItem"
          ]
        },
        "ITEM.POINTER_LEAVE": {
          actions: [
            "clearHighlightedItem"
          ]
        },
        "POSITIONING.SET": {
          actions: [
            "reposition"
          ]
        }
      }
    }
  },
  implementations: {
    guards: {
      loop: ({ prop }) => !!prop("loopFocus"),
      multiple: ({ prop }) => !!prop("multiple"),
      hasSelectedItems: ({ computed }) => !!computed("hasSelectedItems"),
      hasHighlightedItem: ({ context }) => context.get("highlightedValue") != null,
      isFirstItemHighlighted: ({ context, prop }) => context.get("highlightedValue") === prop("collection").firstValue,
      isLastItemHighlighted: ({ context, prop }) => context.get("highlightedValue") === prop("collection").lastValue,
      closeOnSelect: ({ prop, event }) => !!(event.closeOnSelect ?? prop("closeOnSelect")),
      restoreFocus: ({ event }) => restoreFocusFn(event),
      // guard assertions (for controlled mode)
      isOpenControlled: ({ prop }) => prop("open") !== void 0,
      isTriggerClickEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.CLICK",
      isTriggerEnterEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ENTER",
      isTriggerArrowUpEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_UP",
      isTriggerArrowDownEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_DOWN"
    },
    effects: {
      trackFocusVisible({ scope }) {
        return trackFocusVisible({
          root: scope.getRootNode?.()
        });
      },
      trackFormControlState({ context, scope }) {
        return trackFormControl(getHiddenSelectEl(scope), {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled);
          },
          onFormReset() {
            const value = context.initial("value");
            context.set("value", value);
          }
        });
      },
      trackDismissableElement({ scope, send, prop }) {
        const contentEl = () => getContentEl4(scope);
        let restoreFocus = true;
        return trackDismissableElement(contentEl, {
          type: "listbox",
          defer: true,
          exclude: [
            getTriggerEl3(scope),
            getClearTriggerEl3(scope)
          ],
          onFocusOutside: prop("onFocusOutside"),
          onPointerDownOutside: prop("onPointerDownOutside"),
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event);
            restoreFocus = !(event.detail.focusable || event.detail.contextmenu);
          },
          onDismiss() {
            send({
              type: "CLOSE",
              src: "interact-outside",
              restoreFocus
            });
          }
        });
      },
      computePlacement({ context, prop, scope }) {
        const positioning = prop("positioning");
        context.set("currentPlacement", positioning.placement);
        const triggerEl = () => getTriggerEl3(scope);
        const positionerEl = () => getPositionerEl3(scope);
        return getPlacement(triggerEl, positionerEl, {
          defer: true,
          ...positioning,
          onComplete(data) {
            context.set("currentPlacement", data.placement);
          }
        });
      },
      scrollToHighlightedItem({ context, prop, scope }) {
        const exec = (immediate) => {
          const highlightedValue = context.get("highlightedValue");
          if (highlightedValue == null) return;
          const modality = getInteractionModality();
          if (modality === "pointer") return;
          const contentEl2 = getContentEl4(scope);
          const scrollToIndexFn = prop("scrollToIndexFn");
          if (scrollToIndexFn) {
            const highlightedIndex = prop("collection").indexOf(highlightedValue);
            scrollToIndexFn?.({
              index: highlightedIndex,
              immediate,
              getElement: () => getItemEl3(scope, highlightedValue)
            });
            return;
          }
          const itemEl = getItemEl3(scope, highlightedValue);
          scrollIntoView(itemEl, {
            rootEl: contentEl2,
            block: "nearest"
          });
        };
        raf(() => {
          setInteractionModality("virtual");
          exec(true);
        });
        const contentEl = () => getContentEl4(scope);
        return observeAttributes(contentEl, {
          defer: true,
          attributes: [
            "data-activedescendant"
          ],
          callback() {
            exec(false);
          }
        });
      }
    },
    actions: {
      reposition({ context, prop, scope, event }) {
        const positionerEl = () => getPositionerEl3(scope);
        getPlacement(getTriggerEl3(scope), positionerEl, {
          ...prop("positioning"),
          ...event.options,
          defer: true,
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement);
          }
        });
      },
      toggleVisibility({ send, prop, event }) {
        send({
          type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
          previousEvent: event
        });
      },
      highlightPreviousItem({ context, prop }) {
        const highlightedValue = context.get("highlightedValue");
        if (highlightedValue == null) return;
        const value = prop("collection").getPreviousValue(highlightedValue, 1, prop("loopFocus"));
        if (value == null) return;
        context.set("highlightedValue", value);
      },
      highlightNextItem({ context, prop }) {
        const highlightedValue = context.get("highlightedValue");
        if (highlightedValue == null) return;
        const value = prop("collection").getNextValue(highlightedValue, 1, prop("loopFocus"));
        if (value == null) return;
        context.set("highlightedValue", value);
      },
      highlightFirstItem({ context, prop }) {
        const value = prop("collection").firstValue;
        context.set("highlightedValue", value);
      },
      highlightLastItem({ context, prop }) {
        const value = prop("collection").lastValue;
        context.set("highlightedValue", value);
      },
      setInitialFocus({ scope }) {
        raf(() => {
          const element = getInitialFocus({
            root: getContentEl4(scope)
          });
          element?.focus({
            preventScroll: true
          });
        });
      },
      focusTriggerEl({ event, scope }) {
        if (!restoreFocusFn(event)) return;
        raf(() => {
          const element = getTriggerEl3(scope);
          element?.focus({
            preventScroll: true
          });
        });
      },
      selectHighlightedItem({ context, prop, event }) {
        let value = event.value ?? context.get("highlightedValue");
        if (value == null || !prop("collection").has(value)) return;
        prop("onSelect")?.({
          value
        });
        const nullable = prop("deselectable") && !prop("multiple") && context.get("value").includes(value);
        value = nullable ? null : value;
        context.set("value", (prev) => {
          if (value == null) return [];
          if (prop("multiple")) return addOrRemove(prev, value);
          return [
            value
          ];
        });
      },
      highlightComputedFirstItem({ context, prop, computed }) {
        const collection22 = prop("collection");
        const value = computed("hasSelectedItems") ? collection22.sort(context.get("value"))[0] : collection22.firstValue;
        context.set("highlightedValue", value);
      },
      highlightComputedLastItem({ context, prop, computed }) {
        const collection22 = prop("collection");
        const value = computed("hasSelectedItems") ? collection22.sort(context.get("value"))[0] : collection22.lastValue;
        context.set("highlightedValue", value);
      },
      highlightFirstSelectedItem({ context, prop, computed }) {
        if (!computed("hasSelectedItems")) return;
        const value = prop("collection").sort(context.get("value"))[0];
        context.set("highlightedValue", value);
      },
      highlightItem({ context, event }) {
        context.set("highlightedValue", event.value);
      },
      highlightMatchingItem({ context, prop, event, refs }) {
        const value = prop("collection").search(event.key, {
          state: refs.get("typeahead"),
          currentValue: context.get("highlightedValue")
        });
        if (value == null) return;
        context.set("highlightedValue", value);
      },
      setHighlightedItem({ context, event }) {
        context.set("highlightedValue", event.value);
      },
      clearHighlightedItem({ context }) {
        context.set("highlightedValue", null);
      },
      selectItem({ context, prop, event }) {
        prop("onSelect")?.({
          value: event.value
        });
        const nullable = prop("deselectable") && !prop("multiple") && context.get("value").includes(event.value);
        const value = nullable ? null : event.value;
        context.set("value", (prev) => {
          if (value == null) return [];
          if (prop("multiple")) return addOrRemove(prev, value);
          return [
            value
          ];
        });
      },
      clearItem({ context, event }) {
        context.set("value", (prev) => prev.filter((v) => v !== event.value));
      },
      setSelectedItems({ context, event }) {
        context.set("value", event.value);
      },
      clearSelectedItems({ context }) {
        context.set("value", []);
      },
      selectPreviousItem({ context, prop }) {
        const [firstItem] = context.get("value");
        const value = prop("collection").getPreviousValue(firstItem);
        if (value) context.set("value", [
          value
        ]);
      },
      selectNextItem({ context, prop }) {
        const [firstItem] = context.get("value");
        const value = prop("collection").getNextValue(firstItem);
        if (value) context.set("value", [
          value
        ]);
      },
      selectFirstItem({ context, prop }) {
        const value = prop("collection").firstValue;
        if (value) context.set("value", [
          value
        ]);
      },
      selectLastItem({ context, prop }) {
        const value = prop("collection").lastValue;
        if (value) context.set("value", [
          value
        ]);
      },
      selectMatchingItem({ context, prop, event, refs }) {
        const value = prop("collection").search(event.key, {
          state: refs.get("typeahead"),
          currentValue: context.get("value")[0]
        });
        if (value == null) return;
        context.set("value", [
          value
        ]);
      },
      scrollContentToTop({ prop, scope }) {
        if (prop("scrollToIndexFn")) {
          const firstValue = prop("collection").firstValue;
          prop("scrollToIndexFn")?.({
            index: 0,
            immediate: true,
            getElement: () => getItemEl3(scope, firstValue)
          });
        } else {
          getContentEl4(scope)?.scrollTo(0, 0);
        }
      },
      invokeOnOpen({ prop, context }) {
        prop("onOpenChange")?.({
          open: true,
          value: context.get("value")
        });
      },
      invokeOnClose({ prop, context }) {
        prop("onOpenChange")?.({
          open: false,
          value: context.get("value")
        });
      },
      syncSelectElement({ context, prop, scope }) {
        const selectEl = getHiddenSelectEl(scope);
        if (!selectEl) return;
        if (context.get("value").length === 0 && !prop("multiple")) {
          selectEl.selectedIndex = -1;
          return;
        }
        for (const option of selectEl.options) {
          option.selected = context.get("value").includes(option.value);
        }
      },
      syncCollection({ context, prop }) {
        const collection22 = prop("collection");
        const highlightedItem = collection22.find(context.get("highlightedValue"));
        if (highlightedItem) context.set("highlightedItem", highlightedItem);
        const next = deriveSelectionState({
          values: context.get("value"),
          collection: collection22,
          selectedItemMap: context.get("selectedItemMap")
        });
        context.set("selectedItemMap", next.nextSelectedItemMap);
      },
      syncSelectedItems({ context, prop }) {
        const next = deriveSelectionState({
          values: context.get("value"),
          collection: prop("collection"),
          selectedItemMap: context.get("selectedItemMap")
        });
        context.set("selectedItemMap", next.nextSelectedItemMap);
      },
      syncHighlightedItem({ context, prop }) {
        const collection22 = prop("collection");
        const highlightedValue = context.get("highlightedValue");
        const highlightedItem = highlightedValue ? collection22.find(highlightedValue) : null;
        context.set("highlightedItem", highlightedItem);
      },
      dispatchChangeEvent({ scope }) {
        queueMicrotask(() => {
          const node = getHiddenSelectEl(scope);
          if (!node) return;
          const win = scope.getWin();
          const evt = new win.Event("change", {
            bubbles: true,
            composed: true
          });
          node.dispatchEvent(markAsInternalChangeEvent(evt));
        });
      }
    }
  }
});
function restoreFocusFn(event) {
  const v = event.restoreFocus ?? event.previousEvent?.restoreFocus;
  return v == null || !!v;
}

// ../../../../../../Library/Caches/deno/npm/registry.npmjs.org/@zag-js/select/1.43.0/dist/select.props.mjs
var props5 = createProps()([
  "autoComplete",
  "closeOnSelect",
  "collection",
  "composite",
  "defaultHighlightedValue",
  "defaultOpen",
  "defaultValue",
  "deselectable",
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "highlightedValue",
  "id",
  "ids",
  "invalid",
  "loopFocus",
  "multiple",
  "name",
  "onFocusOutside",
  "onHighlightChange",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onSelect",
  "onValueChange",
  "open",
  "positioning",
  "readOnly",
  "required",
  "scrollToIndexFn",
  "translations",
  "value"
]);
var splitProps6 = createSplitProps(props5);
var itemProps4 = createProps()([
  "item",
  "persistFocus"
]);
var splitItemProps4 = createSplitProps(itemProps4);
var itemGroupProps3 = createProps()([
  "id"
]);
var splitItemGroupProps3 = createSplitProps(itemGroupProps3);
var itemGroupLabelProps3 = createProps()([
  "htmlFor"
]);
var splitItemGroupLabelProps3 = createSplitProps(itemGroupLabelProps3);

// interpreter/vendor/entry-zag/index.ts
var kinds = {
  combobox: combobox_exports,
  "date-picker": date_picker_exports,
  "file-upload": file_upload_exports,
  listbox: listbox_exports,
  select: select_exports
};
export {
  VanillaMachine,
  kinds,
  normalizeProps,
  spreadProps
};
