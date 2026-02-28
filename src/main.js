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
async function init() {
  showLoader();
  try {
    allRecipes = await getAllRecipes();
    hideLoader();
    displayLayout();
    renderRecipes(allRecipes);
    setupSearch();
    setupNavigation();
    setupCardDelegation();
    displayDashboard(getTotalCalories(), DAILY_GOAL);
  } catch (error) {
    console.error(error);
    hideLoader();
    showError(
      "Désolé, nous n’avons pas pu charger les recettes. Réessayez dans un instant."
    );
  }
}

function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  let debounceId;
  input.addEventListener("input", async () => {
    const query = input.value.trim();
    clearTimeout(debounceId);
    debounceId = setTimeout(async () => {
      if (!query) {
        renderRecipes(allRecipes);
        return;
      }
      showLoader();
      try {
        const recipes = await searchRecipes(query);
        hideLoader();
        renderRecipes(recipes);
      } catch (err) {
        console.error(err);
        hideLoader();
        showError(
          "La recherche a échoué. Vérifiez votre connexion et réessayez."
        );
      }
    }, 300);
  });
}

function setupNavigation() {
  const navHome = document.getElementById("navHome");
  const navFavorites = document.getElementById("navFavorites");
  const navDay = document.getElementById("navDay");
  const homeView = document.getElementById("homeView");
  const favoritesView = document.getElementById("favoritesView");
  const dayView = document.getElementById("dayView");

  if (!navHome || !navFavorites || !navDay || !homeView || !favoritesView || !dayView) return;

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
    renderRecipes(allRecipes);
  });

  navFavorites.addEventListener("click", () => {
    setActive(1);
    const favoriteRecipes = allRecipes.filter((r) => getFavorites().includes(r.id));
    displayFavorites(favoriteRecipes);
  });

  navDay.addEventListener("click", () => {
    setActive(2);
    displayDashboard(getTotalCalories(), DAILY_GOAL);
  });
}

/**
 * Event delegation: card click opens detail view; fav/add buttons do not.
 */
function setupCardDelegation() {
  const main = document.querySelector(".nf-main");
  if (!main) return;

  main.addEventListener("click", (e) => {
    const card = e.target.closest(".nf-card");
    if (!card) return;

    const id = Number(card.dataset.id);
    const recipe = allRecipes.find((r) => r.id === id);
    if (!recipe) return;

    if (e.target.closest(".nf-card-fav")) {
      toggleFavorite(recipe.id);
      e.target.closest(".nf-card-fav").classList.toggle("nf-icon-button--active");
      const btn = e.target.closest(".nf-card-fav");
      btn.setAttribute("aria-pressed", btn.classList.contains("nf-icon-button--active"));
      updateFavoriteCount();
      return;
    }

    if (e.target.closest(".nf-card-add")) {
      const calories = Number(card.dataset.calories) || 0;
      addCalories(calories);
      displayDashboard(getTotalCalories(), DAILY_GOAL);
      return;
    }

    showDetailView();
    renderDetailView(recipe, showRecipesView);
  });
}

init();

