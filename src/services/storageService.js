const FAVORITES_KEY = "nutriflowFavorites";

export function getFavorites() {
  try {
    const fav = localStorage.getItem(FAVORITES_KEY);
    return fav ? JSON.parse(fav) : [];
  } catch {
    return [];
  }
}
