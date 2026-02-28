const CALORIES_KEY = "nutriflowDailyCalories";

let totalCalories = loadInitialCalories();

export function addCalories(calories) {
  const value = Number(calories) || 0;
  totalCalories += value;
  persistCalories();
  return totalCalories;
}

export function resetCalories() {
  totalCalories = 0;
  persistCalories();
  return totalCalories;
}

export function getTotalCalories() {
  return totalCalories;
}
export function getCalorieBadge(calories) {
  const value = Number(calories) || 0;
  if (value < 400) return { className: "nf-badge--green", label: "Low cal" };
  if (value <= 800) return { className: "nf-badge--orange", label: "Moderate" };
  return { className: "nf-badge--red", label: "High cal" };
}

function loadInitialCalories() {
  if (typeof window === "undefined") return 0;
  try {
    const stored = window.localStorage.getItem(CALORIES_KEY);
    const value = stored ? Number(stored) : 0;
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function persistCalories() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CALORIES_KEY, String(totalCalories));
  } catch {
    // Fail silently – app should continue working even if storage is unavailable.
  }
}