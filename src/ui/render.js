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