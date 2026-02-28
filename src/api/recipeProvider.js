const RECIPES_BASE = "https://dummyjson.com/recipes";

export async function getAllRecipes() {
  try {
    const response = await fetch(`${RECIPES_BASE}?limit=100`);
    if (!response.ok) {
      throw new Error("Failed to fetch recipes");
    }
    const data = await response.json();
    return data.recipes ?? [];
  } catch (error) {
    console.error("[recipeProvider] getAllRecipes:", error);
    throw error;
  }
}

export async function searchRecipes(query) {
  try {
    const trimmed = String(query ?? "").trim();
    if (!trimmed) {
      return getAllRecipes();
    }
    const response = await fetch(
      `${RECIPES_BASE}/search?q=${encodeURIComponent(trimmed)}`
    );
    if (!response.ok) {
      throw new Error("Search failed");
    }
    const data = await response.json();
    return data.recipes ?? [];
  } catch (error) {
    console.error("[recipeProvider] searchRecipes:", error);
    throw error;
  }
}
