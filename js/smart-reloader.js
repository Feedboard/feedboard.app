document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    sessionStorage.setItem("lastDate", Date.now());
  } else {
    let lastDate = sessionStorage.getItem("lastDate");
    if (lastDate) {
      let currrentDate = Date.now();

      // Calculate the time difference in milliseconds
      var timeDifferenceMillis = Math.abs(currrentDate - lastDate);

      // Calculate time difference in minutes and hours
      var minutes = Math.floor(timeDifferenceMillis / (1000 * 60));
      var hours = Math.floor(minutes / 60);

      if (minutes >= 5) {
        console.log("Reloading feeds");
        loadFeed();
      }
    }
  }
});
