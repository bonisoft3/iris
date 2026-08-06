// A declarative dataflow engine for Tier 2 widgets: CDC events -> XState state
// fold -> JsonML view delta -> RFC 6902 JSON patch -> DOM sink. A widget is a
// TIER2_WIDGET_SPECS entry, not a module.

import { buildNodes } from "./render.js";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function pad2(n) {
  return String(n).padStart(2, "0");
}
function formatDateISO(year, month, day) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

// month is 0-indexed, as Date's is.
export function buildCalendarGrid(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const daysInMonth = lastDayOfMonth.getDate();

  const weeks = [];
  let currentWeek = [];

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const dateStr = formatDateISO(year, month === 0 ? 11 : month - 1, dayNum);
    currentWeek.push({ day: dayNum, dateStr, outside: true });
  }

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dateStr = formatDateISO(year, month, dayNum);
    currentWeek.push({ day: dayNum, dateStr, outside: false });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    let nextDayNum = 1;
    while (currentWeek.length < 7) {
      const dateStr = formatDateISO(year, month === 11 ? 0 : month + 1, nextDayNum);
      currentWeek.push({ day: nextDayNum, dateStr, outside: true });
      nextDayNum++;
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

export function generateCalendarJsonML(weeks, selectedDateStr = "") {
  const todayStr = new Date().toISOString().split("T")[0];

  const tableHeadNodes = [
    {
      tag: "tr",
      attrs: { "data-part": "tableRow" },
      children: WEEK_DAYS.map((day) => ({
        tag: "th",
        attrs: { "data-part": "tableHeader", scope: "col" },
        children: [day],
      })),
    },
  ];

  const tableBodyNodes = weeks.map((week) => ({
    tag: "tr",
    attrs: { "data-part": "tableRow" },
    children: week.map((cell) => {
      const attrs = {
        "data-part": "dayTableCellTrigger",
        "data-cell": cell.dateStr,
        "data-value": cell.dateStr,
        "data-scope": "date-picker",
      };
      if (cell.outside) attrs["data-outside-range"] = "true";
      if (cell.dateStr === todayStr) attrs["data-today"] = "true";
      if (cell.dateStr === selectedDateStr) attrs["data-selected"] = "true";

      return {
        tag: "td",
        attrs: {
          "data-part": "dayTableCell",
          "data-cell": cell.dateStr,
          "data-value": cell.dateStr,
          "data-scope": "date-picker",
        },
        children: [
          {
            tag: "div",
            attrs,
            children: [String(cell.day)],
          },
        ],
      };
    }),
  }));

  return { tableHeadNodes, tableBodyNodes };
}

export function transitionMachine(machineConfig, currentState, event) {
  const stateDef = machineConfig.states?.[currentState];
  if (!stateDef || !stateDef.on) return currentState;

  const transition = stateDef.on[event.type] || stateDef.on["*"];
  if (!transition) return currentState;

  if (typeof transition === "string") return transition;
  if (typeof transition === "object" && transition.target) return transition.target;

  return currentState;
}

export function computeDomPatches(targetSelector, attrName, nextValue) {
  if (nextValue === undefined || nextValue === null || nextValue === false || (nextValue === "false" && attrName === "hidden")) {
    return [
      {
        op: "remove",
        path: `${targetSelector}/@${attrName}`,
      },
    ];
  }

  return [
    {
      op: "replace",
      path: `${targetSelector}/@${attrName}`,
      value: String(nextValue),
    },
  ];
}

export function applyDomPatch(rootElement, patches) {
  for (const patch of patches) {
    const path = patch.path;
    const slashIdx = path.lastIndexOf("/@");
    if (slashIdx === -1) continue;

    const selector = path.slice(0, slashIdx);
    const attrPart = path.slice(slashIdx + 2);

    const targetNode = selector === "" || selector === "." ? rootElement : rootElement.querySelector(selector);
    if (!targetNode || !attrPart) continue;

    if (patch.op === "remove") {
      targetNode.removeAttribute(attrPart);
    } else if (patch.op === "replace" || patch.op === "add") {
      targetNode.setAttribute(attrPart, String(patch.value));
    }
  }
}

export function mountTier2Widget(rootElement, { machineConfig, bindings = [] }) {
  let currentState = machineConfig.initial;

  rootElement.setAttribute("data-state", currentState);
  for (const binding of bindings) {
    const val = binding.derive ? binding.derive(currentState) : currentState;
    const patches = computeDomPatches(binding.selector, binding.attribute, val);
    applyDomPatch(rootElement, patches);
  }

  const dispatch = (event) => {
    const nextState = transitionMachine(machineConfig, currentState, event);
    if (nextState !== currentState) {
      currentState = nextState;

      const rootPatches = computeDomPatches(".", "data-state", currentState);
      applyDomPatch(rootElement, rootPatches);

      for (const binding of bindings) {
        const val = binding.derive ? binding.derive(currentState) : currentState;
        const patches = computeDomPatches(binding.selector, binding.attribute, val);
        applyDomPatch(rootElement, patches);
      }
    }
    return currentState;
  };

  return {
    getState: () => currentState,
    dispatch,
  };
}

export const TIER2_WIDGET_SPECS = {
  "date-picker": {
    machine: {
      initial: "closed",
      states: {
        closed: { on: { TOGGLE: "open", OPEN: "open" } },
        open: { on: { TOGGLE: "closed", CLOSE: "closed", SELECT_DATE: "closed" } },
      },
    },
    bindings: [
      { selector: '[data-part="content"]', attribute: "data-state", derive: (s) => s },
      { selector: '[data-part="positioner"]', attribute: "hidden", derive: (s) => (s === "closed" ? "true" : "false") },
    ],
  },
};

export function hydrateTier2DataflowWidget(rootElement, inputElement, widgetName = "date-picker") {
  const spec = TIER2_WIDGET_SPECS[widgetName];
  if (!spec) {
    throw new Error(`Unknown Tier 2 Dataflow Widget: ${widgetName}`);
  }

  const now = new Date();
  let currentYear = now.getFullYear();
  let currentMonth = now.getMonth();
  let selectedDateStr = "";

  if (inputElement?.value) {
    const raw = inputElement.value.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      selectedDateStr = raw;
      const parts = raw.split("-");
      currentYear = parseInt(parts[0], 10);
      currentMonth = parseInt(parts[1], 10) - 1;
    }
  }

  const renderCalendarView = () => {
    const weeks = buildCalendarGrid(currentYear, currentMonth);
    const { tableHeadNodes, tableBodyNodes } = generateCalendarJsonML(weeks, selectedDateStr);

    const viewTriggerEl = rootElement.querySelector('[data-part="viewTrigger"]');
    if (viewTriggerEl) {
      viewTriggerEl.textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
    }

    const tableHeadEl = rootElement.querySelector('[data-part="tableHead"]');
    if (tableHeadEl) {
      tableHeadEl.replaceChildren();
      buildNodes(tableHeadNodes, tableHeadEl, { trusted: true });
    }

    const tableBodyEl = rootElement.querySelector('[data-part="tableBody"]');
    if (tableBodyEl) {
      tableBodyEl.replaceChildren();
      buildNodes(tableBodyNodes, tableBodyEl, { trusted: true });
      for (const td of tableBodyEl.querySelectorAll("td")) {
        td.setAttribute("role", "gridcell");
        td.setAttribute("data-scope", "date-picker");
        const cellVal = td.dataset.cell || td.dataset.value;
        if (cellVal) td.setAttribute("data-value", cellVal);
      }
    }
  };

  const widget = mountTier2Widget(rootElement, {
    machineConfig: spec.machine,
    bindings: spec.bindings,
  });

  renderCalendarView();

  const onRootClick = (evt) => {
    const target = evt.target;
    if (!target) return;

    const triggerBtn = target.closest('[data-part="trigger"]');
    if (triggerBtn) {
      evt.preventDefault();
      const nextState = widget.dispatch({ type: "TOGGLE" });
      if (nextState === "open") {
        renderCalendarView();
      }
      return;
    }

    const prevBtn = target.closest('[data-part="prevTrigger"]');
    if (prevBtn) {
      evt.preventDefault();
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendarView();
      return;
    }

    const nextBtn = target.closest('[data-part="nextTrigger"]');
    if (nextBtn) {
      evt.preventDefault();
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendarView();
      return;
    }

    const cellDiv = target.closest('[data-cell], [data-value]');
    if (cellDiv) {
      evt.preventDefault();
      const pickedDate = cellDiv.dataset.cell || cellDiv.dataset.value;
      if (pickedDate) {
        selectedDateStr = pickedDate;
        if (inputElement) {
          const timePart = inputElement.type === "datetime-local"
            ? (inputElement.value.split("T")[1] || "09:00")
            : "";
          inputElement.value = timePart ? `${pickedDate}T${timePart}` : pickedDate;
          inputElement.dispatchEvent(new Event("change", { bubbles: true }));
        }
        renderCalendarView();
        widget.dispatch({ type: "SELECT_DATE" });
      }
    }
  };

  const onDocClick = (evt) => {
    if (widget.getState() === "open" && !rootElement.contains(evt.target)) {
      widget.dispatch({ type: "CLOSE" });
    }
  };

  rootElement.addEventListener("click", onRootClick);
  if (typeof document !== "undefined") {
    document.addEventListener("click", onDocClick);
  }

  return {
    getState: widget.getState,
    destroy() {
      rootElement.removeEventListener("click", onRootClick);
      if (typeof document !== "undefined") {
        document.removeEventListener("click", onDocClick);
      }
    },
  };
}
