export async function getAllRecipes() {
  try {
    const response = await fetch("https://dummyjson.com/recipes");

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des recettes");
    }

    const data = await response.json();
    return data.recipes;

  } catch (error) {
    console.error(error);
    throw error;
  }
}