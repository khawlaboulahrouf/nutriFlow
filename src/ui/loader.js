export function showLoader() {
  const overlay = document.getElementById("loader-overlay");
  if (overlay) overlay.hidden = false;
}

export function hideLoader() {
  const overlay = document.getElementById("loader-overlay");
  if (overlay) overlay.hidden = true;
}
