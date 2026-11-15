// Steps through the 3-slide onboarding walkthrough on /intro and first-time / visit, persisting completion on device.
({ context, event }) => {
  if (event.type !== "click") {
    return { updates: [] };
  }
  const current = context.items && context.items[0] ? context.items[0] : { id: "step", step: "1", visited: "false" };
  const visited = current.visited === "true" ? "true" : "false";
  if (event.from === "intro-step-1") {
    return { updates: [{ op: "put", entity: "onboarding_step", id: "step", row: { id: "step", step: "1", visited } }] };
  }
  if (event.from === "intro-step-2" || event.from === "intro-next-1") {
    return { updates: [{ op: "put", entity: "onboarding_step", id: "step", row: { id: "step", step: "2", visited } }] };
  }
  if (event.from === "intro-step-3" || event.from === "intro-next-2") {
    return { updates: [{ op: "put", entity: "onboarding_step", id: "step", row: { id: "step", step: "3", visited } }] };
  }
  if (event.from === "intro-skip-1" || event.from === "intro-skip-2" || event.from === "intro-start") {
    return { updates: [{ op: "put", entity: "onboarding_step", id: "step", row: { id: "step", step: "1", visited: "true" } }] };
  }
  return { updates: [] };
}
