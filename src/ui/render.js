import { getFavorites, toggleFavorite } from "../services/storageService.js";
import {
  addCalories,
  getTotalCalories,
  resetCalories,
  getCalorieBadge,
} from "../services/calorieService.js";

const DAILY_GOAL = 2000;

export function displayLayout() {
  const container = document.getElementById("recipes-view");
  if (!container) return;

  container.innerHTML = `
    <div class="nf-shell">
      <header class="nf-header">
        <div class="nf-logo">
          <div class="nf-logo-circle">N</div>
          <span class="nf-logo-text">NutriFlow</span>
        </div>
        <nav class="nf-nav">
          <button id="navHome" class="nf-nav-link nf-nav-link--active" type="button">Home</button>
          <button id="navFavorites" class="nf-nav-link" type="button">
            Favorites
            <span id="favCount" class="nf-badge nf-badge--pill">0</span>
          </button>
          <button id="navDay" class="nf-nav-link nf-nav-link--cta" type="button">Ma Journée</button>
        </nav>
      </header>

      <main class="nf-main">
        <section class="search-section">
          <input id="searchInput" type="text" placeholder="Search recipes..." aria-label="Search recipes" />
        </section>

        <section id="homeView" class="nf-view nf-view--active" aria-label="All recipes">
          <div id="recipesGrid" class="nf-grid"></div>
          <p id="noResults" class="nf-empty" hidden>No recipes match your search yet. Try another keyword.</p>
        </section>

        <section id="favoritesView" class="nf-view" aria-label="Favorite recipes" hidden>
          <h2 class="nf-section-title">Your Favorites</h2>
          <div id="favoritesGrid" class="nf-grid"></div>
          <p id="noFavorites" class="nf-empty">You haven't added any favorites yet. Tap the heart on recipes you love.</p>
        </section>

        <section id="dayView" class="nf-view" aria-label="My day dashboard" hidden>
          <h2 class="nf-section-title">Ma Journée</h2>
          <div id="daySummary" class="nf-dashboard"></div>
          <button id="resetDay" class="nf-button nf-button--ghost" type="button">
            Reset today
          </button>
        </section>
      </main>
    </div>
  `;

  displayDashboard(getTotalCalories(), DAILY_GOAL);
  updateFavoriteCount();
}
/**
 * Renders the recipe grid only (no detail view).
 */
export function renderRecipes(recipes) {
  const grid = document.getElementById("recipesGrid");
  const empty = document.getElementById("noResults");
  if (!grid) return;

  if (!recipes || recipes.length === 0) {
    grid.innerHTML = "";
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;
  const favorites = getFavorites();

  grid.innerHTML = recipes
    .map((recipe) => {
      const calories = recipe.caloriesPerServing ?? recipe.calories ?? 0;
      const badge = getCalorieBadge(calories);
      const isFavorite = favorites.includes(recipe.id);

      return `
        <article class="nf-card" data-id="${recipe.id}" data-calories="${calories}">
          <div class="nf-card-image-wrapper">
            <img class="nf-card-image" src="${escapeAttr(recipe.image)}" alt="${escapeAttr(recipe.name)}" loading="lazy" />
            <span class="nf-badge ${badge.className}">${escapeHtml(badge.label)}</span>
          </div>
          <div class="nf-card-body">
            <h3 class="nf-card-title">${escapeHtml(recipe.name)}</h3>
            <p class="nf-card-meta">${calories} KCal · ${escapeHtml(recipe.cuisine || "Balanced")}</p>
            <div class="nf-card-actions">
              <button class="nf-button nf-button--primary nf-card-add" type="button">Add in my day</button>
              <button
                class="nf-icon-button nf-card-fav ${isFavorite ? "nf-icon-button--active" : ""}"
                type="button"
                aria-pressed="${isFavorite}"
                aria-label="Toggle favorite"
              >♥</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}
/**
 * Shows the recipes grid view and hides the detail view.
 */
export function showRecipesView() {
  const recipesEl = document.getElementById("recipes-view");
  const detailEl = document.getElementById("detail-view");
  if (recipesEl) recipesEl.classList.remove("hidden");
  if (detailEl) detailEl.classList.add("hidden");
}

/**
 * Hides the recipes grid view and shows the detail view with one recipe.
 */
export function showDetailView() {
  const recipesEl = document.getElementById("recipes-view");
  const detailEl = document.getElementById("detail-view");
  if (recipesEl) recipesEl.classList.add("hidden");
  if (detailEl) detailEl.classList.remove("hidden");
}

/**
 * Renders the full detail screen (replaces grid). White background, big image, title, calories badge, ingredients, instructions, back button.
 */
export function renderDetailView(recipe, onBack) {
  const container = document.getElementById("detail-view");
  if (!container || !recipe) return;

  const calories = recipe.caloriesPerServing ?? recipe.calories ?? 0;
  const badge = getCalorieBadge(calories);
  const favorites = getFavorites();
  const isFavorite = favorites.includes(recipe.id);
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];

  container.innerHTML = `
    <div class="nf-detail-page">
      <button type="button" class="nf-detail-back" aria-label="Back to recipes">← Back</button>
      <div class="nf-detail-banner">
        <img src="${escapeAttr(recipe.image)}" alt="${escapeAttr(recipe.name)}" loading="lazy" />
      </div>
      <div class="nf-detail-content-wrap">
        <h1 class="nf-detail-title">${escapeHtml(recipe.name)}</h1>
        <span class="nf-badge ${badge.className} nf-detail-calories">${calories} KCal</span>
        <div class="nf-detail-actions">
          <button type="button" class="nf-button nf-button--primary nf-detail-add-day">Add to my day</button>
          <button type="button" class="nf-icon-button nf-detail-fav ${isFavorite ? "nf-icon-button--active" : ""}" aria-pressed="${isFavorite}" aria-label="Save to favorites">♥</button>
        </div>
        ${ingredients.length ? `
        <div class="nf-detail-section">
          <h2 class="nf-detail-section-title">Ingredients</h2>
          <ul class="nf-detail-list">${ingredients.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
        </div>
        ` : ""}
        ${instructions.length ? `
        <div class="nf-detail-section">
          <h2 class="nf-detail-section-title">Instructions</h2>
          <div class="nf-detail-instructions">${instructions.map((s) => `<p>${escapeHtml(s)}</p>`).join("")}</div>
        </div>
        ` : ""}
      </div>
    </div>
  `;

  const backBtn = container.querySelector(".nf-detail-back");
  if (backBtn && typeof onBack === "function") {
    backBtn.addEventListener("click", onBack);
  }

  const addDayBtn = container.querySelector(".nf-detail-add-day");
  if (addDayBtn) {
    addDayBtn.addEventListener("click", () => {
      addCalories(calories);
      displayDashboard(getTotalCalories(), DAILY_GOAL);
    });
  }

  const favBtn = container.querySelector(".nf-detail-fav");
  if (favBtn) {
    favBtn.addEventListener("click", () => {
      toggleFavorite(recipe.id);
      favBtn.classList.toggle("nf-icon-button--active");
      favBtn.setAttribute("aria-pressed", favBtn.classList.contains("nf-icon-button--active"));
      updateFavoriteCount();
    });
  }
}

export function displayFavorites(recipes) {
  const grid = document.getElementById("favoritesGrid");
  const empty = document.getElementById("noFavorites");
  if (!grid) return;

  const favoritesIds = getFavorites();
  const filtered = (recipes || []).filter((r) => favoritesIds.includes(r.id));

  if (!filtered.length) {
    grid.innerHTML = "";
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;
  const favorites = getFavorites();

  grid.innerHTML = filtered
    .map((recipe) => {
      const calories = recipe.caloriesPerServing ?? recipe.calories ?? 0;
      const badge = getCalorieBadge(calories);

      return `
        <article class="nf-card" data-id="${recipe.id}" data-calories="${calories}">
          <div class="nf-card-image-wrapper">
            <img class="nf-card-image" src="${escapeAttr(recipe.image)}" alt="${escapeAttr(recipe.name)}" loading="lazy" />
            <span class="nf-badge ${badge.className}">${escapeHtml(badge.label)}</span>
          </div>
          <div class="nf-card-body">
            <h3 class="nf-card-title">${escapeHtml(recipe.name)}</h3>
            <p class="nf-card-meta">${calories} KCal · ${escapeHtml(recipe.cuisine || "Balanced")}</p>
            <div class="nf-card-actions">
              <button class="nf-button nf-button--primary nf-card-add" type="button">Add in my day</button>
              <button class="nf-icon-button nf-card-fav nf-icon-button--active" type="button" aria-pressed="true" aria-label="Toggle favorite">♥</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

export function displayDashboard(totalCalories, goal = DAILY_GOAL) {
  const container = document.getElementById("daySummary");
  if (!container) return;

  const safeTotal = Math.max(0, Number(totalCalories) || 0);
  const safeGoal = goal > 0 ? goal : DAILY_GOAL;
  const remaining = Math.max(0, safeGoal - safeTotal);
  const progress = Math.min(100, Math.round((safeTotal / safeGoal) * 100));

  container.innerHTML = `
    <div class="nf-dashboard-grid">
      <div class="nf-dashboard-card">
        <span class="nf-dashboard-label">Total Calories</span>
        <span class="nf-dashboard-value">${safeTotal}</span>
        <span class="nf-dashboard-unit">KCal</span>
      </div>
      <div class="nf-dashboard-card">
        <span class="nf-dashboard-label">Daily Goal</span>
        <span class="nf-dashboard-value">${safeGoal}</span>
        <span class="nf-dashboard-unit">KCal</span>
      </div>
      <div class="nf-dashboard-card">
        <span class="nf-dashboard-label">Remaining</span>
        <span class="nf-dashboard-value">${remaining}</span>
        <span class="nf-dashboard-unit">KCal</span>
      </div>
    </div>
    <div class="nf-progress">
      <div class="nf-progress-header">
        <span>Daily Progress</span>
        <span>${progress}%</span>
      </div>
      <div class="nf-progress-bar">
        <div class="nf-progress-bar-fill" style="width: ${progress}%"></div>
      </div>
      <p class="nf-progress-caption">
        ${remaining > 0 ? `You've added meals today – ${remaining} KCal left to reach your goal.` : "You've reached or exceeded your goal for today."}
      </p>
    </div>
  `;

  const resetButton = document.getElementById("resetDay");
  if (resetButton && !resetButton.dataset.bound) {
    resetButton.dataset.bound = "true";
    resetButton.addEventListener("click", () => {
      resetCalories();
      displayDashboard(getTotalCalories(), DAILY_GOAL);
    });
  }
}

export function updateFavoriteCount() {
  const el = document.getElementById("favCount");
  if (el) el.textContent = String(getFavorites().length);
}

export function showError(message) {
  const container = document.getElementById("recipes-view");
  if (!container) return;
  container.innerHTML = `<p class="nf-error">${escapeHtml(message)}</p>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return escapeHtml(String(str ?? ""));
}
