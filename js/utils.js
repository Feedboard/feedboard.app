function convertHnDate(datetime) {
  // Parse the input date string
  const inputDate = new Date(datetime);

  // Define an array of month abbreviations
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Get the day, month, and year components from the parsed date
  const day = inputDate.getDate();
  const month = inputDate.getMonth();
  const year = inputDate.getFullYear();

  // Format the date as "Day, DD Mon YYYY"
  const formattedDate = inputDate.toLocaleString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return formattedDate;
}

function convertTime(datetime) {
  const inputDate = new Date(datetime);

  const formattedDate = inputDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  });

  return formattedDate;
}

function scrollToPos(id) {
  document.getElementById(id).scrollIntoView({
    behavior: "smooth",
  });
}

function hideEmpty() {
  const spinnerContainer = document.getElementById("spinnerContainer");
  if (spinnerContainer) {
    spinnerContainer.setAttribute("style", "display:none !important");
  }
}

function checkInputFill(input, button) {
  if (input.value.trim() === "") {
    button.disabled = true; // Disable the button when the input is empty
  } else {
    button.disabled = false; // Enable the button when the input has content
  }
}

function closeModal(modalId) {
  var myModalEl = document.getElementById(modalId);
  var modal = bootstrap.Modal.getInstance(myModalEl);
  modal.hide();
}
function showToast(header) {
  const toast = document.getElementById("toast");

  document.getElementById("toastHeader").innerHTML = header;
  toast.classList.add("toast-fadein");

  setTimeout(function () {
    toast.classList.remove("toast-fadein");
  }, 3000);
}
