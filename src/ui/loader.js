export function showLoader() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="loader-container">
      <div class="spinner"></div>
      <p>Chargement des recettes...</p>
    </div>
  `;
}

export function hideLoader() {
  const loader = document.querySelector(".loader-container");
  if (loader) loader.remove();
}