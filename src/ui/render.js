import { toggleFavorite, getFavorites } from "../services/storageService.js";
import {
  addCalories,
  getTotalCalories,
  resetCalories,
} from "../services/calorieService.js";

const DAILY_GOAL = 2000;

export function displayLayout() {
  const app = document.getElementById("app");

  if (!app) return;

  app.innerHTML = `
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
          <button id="navDay" class="nf-nav-link nf-nav-link--cta" type="button">My Day</button>
        </nav>
      </header>

      <main class="nf-main">
        <section class="nf-hero">
          <div class="nf-hero-text">
            <h1>Eat Better, Live Better</h1>
            <p>
              Discover nutritious recipes tailored to your wellness journey.
              Track calories, save favorites, and build healthier habits every day.
            </p>
          </div>
          <div class="nf-hero-search">
            <span class="nf-hero-search-icon" aria-hidden="true">🔍</span>
            <input
              id="searchInput"
              type="search"
              placeholder="Search for recipes, ingredients or meals"
              aria-label="Search recipes"
            />
          </div>
        </section>

        <section id="homeView" class="nf-view nf-view--active" aria-label="All recipes">
          <div id="recipesGrid" class="nf-grid"></div>
          <p id="noResults" class="nf-empty" hidden>No recipes match your search yet. Try another keyword.</p>
        </section>

        <section class="nf-detail" aria-label="Recipe detail example">
          <div class="nf-detail-banner">
            <img
              src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
              alt="Grilled veggie power bowl"
              loading="lazy"
            />
          </div>
          <div class="nf-detail-header">
            <div>
              <h2 class="nf-detail-title">Grilled Veggie Power Bowl</h2>
              <p class="nf-detail-meta">540 KCal · Balanced · High in fiber</p>
            </div>
          </div>
          <div class="nf-detail-actions">
            <button class="nf-button nf-button--primary" type="button">
              Add to my day
            </button>
            <button
              class="nf-icon-button"
              type="button"
              aria-label="Save this recipe to favorites"
            >
              ♥
            </button>
          </div>
          <div class="nf-detail-sections">
            <div class="nf-detail-section">
              <details open>
                <summary>
                  <span class="nf-detail-section-title">Ingredients</span>
                  <span class="nf-detail-section-arrow" aria-hidden="true">▾</span>
                </summary>
                <div class="nf-detail-content">
                  <ul>
                    <li>1 cup cooked quinoa</li>
                    <li>1 cup roasted mixed vegetables</li>
                    <li>½ avocado, sliced</li>
                    <li>1 tbsp olive oil & lemon dressing</li>
                  </ul>
                </div>
              </details>
            </div>
            <div class="nf-detail-section">
              <details>
                <summary>
                  <span class="nf-detail-section-title">Description</span>
                  <span class="nf-detail-section-arrow" aria-hidden="true">▾</span>
                </summary>
                <div class="nf-detail-content">
                  <p>
                    A warm bowl loaded with colorful grilled vegetables, whole grains,
                    and healthy fats. Perfect for a light yet satisfying lunch that
                    keeps your energy steady through the afternoon.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </section>

        <section id="favoritesView" class="nf-view" aria-label="Favorite recipes" hidden>
          <h2 class="nf-section-title">Your Favorites</h2>
          <div id="favoritesGrid" class="nf-grid"></div>
          <p id="noFavorites" class="nf-empty">You haven’t added any favorites yet. Tap the heart on recipes you love.</p>
        </section>

        <section id="dayView" class="nf-view" aria-label="My day dashboard" hidden>
          <h2 class="nf-section-title">My Day Dashboard</h2>
          <div id="daySummary" class="nf-dashboard"></div>
          <button id="resetDay" class="nf-button nf-button--ghost" type="button">
            Reset today
          </button>
        </section>
      </main>
    </div>
  `;

  // Initialize dashboard immediately with any stored calories.
  renderDashboard();
  updateFavoriteCount();
}

export function displayRecipes(recipes) {
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
            <img class="nf-card-image" src="${recipe.image}" alt="${recipe.name}" loading="lazy" />
            <span class="nf-badge ${badge.className}">${badge.label}</span>
          </div>
          <div class="nf-card-body">
            <h3 class="nf-card-title">${recipe.name}</h3>
            <p class="nf-card-meta">${calories} KCal · ${recipe.cuisine || "Balanced"}</p>
            <div class="nf-card-actions">
              <button
                class="nf-button nf-button--primary nf-card-add"
                type="button"
              >
                Add in my day
              </button>
              <button
                class="nf-icon-button nf-card-fav ${isFavorite ? "nf-icon-button--active" : ""}"
                type="button"
                aria-pressed="${isFavorite}"
                aria-label="Toggle favorite"
              >
                ♥
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  wireCardInteractions(grid, recipes);
}

export function displayFavorites(recipes) {
  const grid = document.getElementById("favoritesGrid");
  const empty = document.getElementById("noFavorites");

  if (!grid) return;

  const favoritesIds = getFavorites();
  const filtered = recipes.filter((r) => favoritesIds.includes(r.id));

  if (!filtered.length) {
    grid.innerHTML = "";
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;

  grid.innerHTML = "";
  filtered.forEach((recipe) => {
    const card = document.querySelector(
      `.nf-card[data-id="${recipe.id}"]`
    );

    if (card) {
      // Reuse the markup from the main grid when available.
      grid.appendChild(card.cloneNode(true));
    } else {
      const calories = recipe.caloriesPerServing ?? recipe.calories ?? 0;
      const badge = getCalorieBadge(calories);

      grid.insertAdjacentHTML(
        "beforeend",
        `
        <article class="nf-card" data-id="${recipe.id}" data-calories="${calories}">
          <div class="nf-card-image-wrapper">
            <img class="nf-card-image" src="${recipe.image}" alt="${recipe.name}" loading="lazy" />
            <span class="nf-badge ${badge.className}">${badge.label}</span>
          </div>
          <div class="nf-card-body">
            <h3 class="nf-card-title">${recipe.name}</h3>
            <p class="nf-card-meta">${calories} KCal · ${recipe.cuisine || "Balanced"}</p>
            <div class="nf-card-actions">
              <button
                class="nf-button nf-button--primary nf-card-add"
                type="button"
              >
                Add in my day
              </button>
              <button
                class="nf-icon-button nf-card-fav nf-icon-button--active"
                type="button"
                aria-pressed="true"
                aria-label="Toggle favorite"
              >
                ♥
              </button>
            </div>
          </div>
        </article>
        `
      );
    }
  });

  wireCardInteractions(grid, filtered);
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
        You’ve added meals today – ${remaining > 0
          ? `${remaining} KCal left to reach your goal.`
          : "you’ve reached or exceeded your goal for today."}
      </p>
    </div>
  `;

  const resetButton = document.getElementById("resetDay");
  if (resetButton && !resetButton.dataset.bound) {
    resetButton.dataset.bound = "true";
    resetButton.addEventListener("click", () => {
      resetCalories();
      renderDashboard();
    });
  }
}

function wireCardInteractions(container, recipes) {
  const favorites = getFavorites();
  const favCountElement = document.getElementById("favCount");

  container.querySelectorAll(".nf-card").forEach((card) => {
    const id = Number(card.dataset.id);
    const calories = Number(card.dataset.calories) || 0;
    const recipe = recipes.find((r) => r.id === id);

    const favButton = card.querySelector(".nf-card-fav");
    const addButton = card.querySelector(".nf-card-add");

    if (favButton && recipe) {
      favButton.addEventListener("click", () => {
        const updatedFavorites = toggleFavorite(recipe.id);
        favButton.classList.toggle("nf-icon-button--active");
        const isActive = favButton.classList.contains("nf-icon-button--active");
        favButton.setAttribute("aria-pressed", String(isActive));

        if (favCountElement) {
          favCountElement.textContent = String(updatedFavorites.length);
        }
      });
    }

    if (addButton) {
      addButton.addEventListener("click", () => {
        const newTotal = addCalories(calories);
        renderDashboard(newTotal);
        showInlineToast(card, `${recipe?.name || "Recipe"} added to your day.`);
      });
    }
  });

  // Ensure header count is up to date when re-rendering.
  updateFavoriteCount();
}

function getCalorieBadge(calories) {
  if (calories <= 400) {
    return { label: "Low cal", className: "nf-badge--green" };
  }
  if (calories <= 700) {
    return { label: "Moderate", className: "nf-badge--orange" };
  }
  return { label: "High cal", className: "nf-badge--red" };
}

function renderDashboard(total = getTotalCalories()) {
  displayDashboard(total, DAILY_GOAL);
}

function updateFavoriteCount() {
  const favCountElement = document.getElementById("favCount");
  if (!favCountElement) return;
  favCountElement.textContent = String(getFavorites().length);
}

function showInlineToast(card, message) {
  let toast = card.querySelector(".nf-card-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "nf-card-toast";
    card.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("nf-card-toast--visible");

  window.clearTimeout(toast._timeoutId);
  toast._timeoutId = window.setTimeout(() => {
    toast.classList.remove("nf-card-toast--visible");
  }, 2000);
}
