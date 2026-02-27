import { getAllRecipes } from "./api/recipeProvider.js";
import {
  displayLayout,
  displayRecipes,
  displayFavorites,
  displayDashboard,
} from "./ui/render.js";
import { showLoader, hideLoader } from "./ui/loader.js";
import { getFavorites } from "./services/storageService.js";
import { getTotalCalories } from "./services/calorieService.js";

let allRecipes = [];
const DAILY_GOAL = 2000;

async function init() {
  try {
    showLoader();

    allRecipes = await getAllRecipes();

    hideLoader();

    displayLayout();
    displayRecipes(allRecipes);

    setupSearch();
    setupNavigation();
    refreshDashboard();
  } catch (error) {
    console.error(error);
    hideLoader();
    const app = document.getElementById("app");
    if (app) {
      app.innerHTML =
        "<p class=\"nf-error\">Sorry, we couldn’t load recipes right now. Please try again in a moment.</p>";
    }
  }
}

function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", (e) => {
    const searchText = e.target.value.toLowerCase().trim();

    const filtered = allRecipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchText)
    );

    displayRecipes(filtered);
  });
}

function setupNavigation() {
  const navHome = document.getElementById("navHome");
  const navFavorites = document.getElementById("navFavorites");
  const navDay = document.getElementById("navDay");

  const homeView = document.getElementById("homeView");
  const favoritesView = document.getElementById("favoritesView");
  const dayView = document.getElementById("dayView");

  if (!navHome || !navFavorites || !navDay) return;
  if (!homeView || !favoritesView || !dayView) return;

  const navLinks = [navHome, navFavorites, navDay];
  const views = [homeView, favoritesView, dayView];

  function setActive(index) {
    navLinks.forEach((link, i) => {
      link.classList.toggle("nf-nav-link--active", i === index);
    });
    views.forEach((view, i) => {
      const isActive = i === index;
      view.classList.toggle("nf-view--active", isActive);
      view.hidden = !isActive;
    });
  }

  navHome.addEventListener("click", () => {
    setActive(0);
    displayRecipes(allRecipes);
  });

  navFavorites.addEventListener("click", () => {
    setActive(1);
    const favoritesIds = getFavorites();
    const favoriteRecipes = allRecipes.filter((recipe) =>
      favoritesIds.includes(recipe.id)
    );
    displayFavorites(favoriteRecipes);
  });

  navDay.addEventListener("click", () => {
    setActive(2);
    refreshDashboard();
  });
}

function refreshDashboard() {
  const total = getTotalCalories();
  displayDashboard(total, DAILY_GOAL);
}

init();