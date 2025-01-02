// Declare global variables
let user_id = null;
let user_email = null;

// Check if the user is logged in or not
checkSession();

function userLogged() {
  console.log("User logged in");
  if (window.location.pathname == "/login.html") {
    window.location.replace("/dashboard.html");
  }
}

function userNotLogged() {
  user_id = null;
  console.log("User not logged in");
  if (window.location.pathname == "/dashboard.html") {
    window.location.replace("/login.html");
  }
}

async function checkSession() {
  try {
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.error("Error retrieving session:", error);
      userNotLogged();
      return;
    }
    if (data.session == null) {
      userNotLogged();
    } else {
      userLogged();
      if (document.getElementById("displayAccountEmail")) {
        document.getElementById("displayAccountEmail").innerHTML = data.session.user.email;
      }
      user_email = data.session.user.email;
      user_id = data.session.user.id;
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    userNotLogged();
  }
}
