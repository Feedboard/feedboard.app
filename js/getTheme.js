const savedTheme = localStorage.getItem("data-bs-theme");

if (savedTheme == "dark") {
  document.documentElement.setAttribute("data-bs-theme", "dark");
}
if (savedTheme == "light") {
  document.documentElement.setAttribute("data-bs-theme", "light");
}
if (savedTheme == "") {
  document.documentElement.setAttribute("data-bs-theme", "default");
}
