const FAVORITES_KEY = "nutriflowFavorites";

export function getFavorites() {
  try {
    const fav = localStorage.getItem(FAVORITES_KEY);
    return fav ? JSON.parse(fav) : [];
  } catch {
    return [];
  }
}
export function addToFavorites(recipe) {
  const id = recipe?.id;
  if (id == null) return getFavorites();
  const fav = getFavorites();
  if (fav.includes(id)) return fav;
  const next = [...fav, id];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}