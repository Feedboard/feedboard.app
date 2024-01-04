const createBoardBtn = document.getElementById("createBoardBtn");

createBoardBtn.addEventListener("click", async function () {
  temp_email = document.getElementById("landingEmailField").value;
  sessionStorage.setItem("temp_email", temp_email);
});
