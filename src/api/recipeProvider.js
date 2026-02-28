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