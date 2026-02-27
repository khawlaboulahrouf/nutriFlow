const FAVORITES_KEY = "nutriflowFavorites";

export function getFavorites() {
  const fav = localStorage.getItem(FAVORITES_KEY);
  return fav ? JSON.parse(fav) : [];
}

export function toggleFavorite(recipeId) {
  let fav = getFavorites();
  if (fav.includes(recipeId)) {
    fav = fav.filter(id => id !== recipeId);
  } else {
    fav.push(recipeId);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(fav));
  return fav;
}