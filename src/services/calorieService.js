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
