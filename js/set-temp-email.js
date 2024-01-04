const createBoardBtn = document.getElementById("createBoardBtn");

createBoardBtn.addEventListener("click", function () {
  temp_email = document.getElementById("landingEmailField").value;
  sessionStorage.setItem("temp_email", temp_email);
});
