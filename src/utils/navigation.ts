/**
 * Utility function untuk navigasi programmatically di luar React component
 * Menggunakan window.history.pushState yang kompatibel dengan React Router
 */
export const navigateTo = (path: string, replace: boolean = false) => {
  if (replace) {
    window.history.replaceState({}, "", path)
  } else {
    window.history.pushState({}, "", path)
  }

  // Trigger popstate event untuk memberitahu React Router tentang perubahan
  window.dispatchEvent(new PopStateEvent("popstate"))
}
