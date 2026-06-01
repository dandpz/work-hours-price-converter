import type { WorkHoursResult } from "./workHoursCalculator";

export function injectWorkHours(
  element: HTMLElement,
  result: WorkHoursResult,
): void {
  const container = document.createElement("span");
  container.className = "work-hours";
  container.setAttribute("data-work-hours", "true");

  const text = document.createElement("span");
  text.textContent = result.formatted;

  const tooltip = document.createElement("span");
  tooltip.className = "work-hours-tooltip";
  tooltip.textContent = `You need to work ${result.formatted}`;

  container.appendChild(text);
  container.appendChild(tooltip);
  element.parentElement?.appendChild(container);
}

export function removeWorkHoursElements(): void {
  document.querySelectorAll(".work-hours").forEach((el) => {
    el.remove();
  });
}
