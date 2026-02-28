import { getAllRecipes, searchRecipes } from "./api/recipeProvider.js";
import {
  displayLayout,
  renderRecipes,
  displayFavorites,
  displayDashboard,
  renderDetailView,
  showDetailView,
  showRecipesView,
  updateFavoriteCount,
  showError,
} from "./ui/render.js";
import { showLoader, hideLoader } from "./ui/loader.js";
import { getFavorites, toggleFavorite } from "./services/storageService.js";
import { addCalories, getTotalCalories } from "./services/calorieService.js";

let allRecipes = [];
const DAILY_GOAL = 2000;
