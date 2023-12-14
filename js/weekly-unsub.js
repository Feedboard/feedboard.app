// Check if the user is logged in or not
checkSession();

async function userLogged(user_id) {
  console.log("User logged in");
  console.log("Unsubbing");
  const { data, error } = await client.from("settings").update({ newsletter: "FALSE" }).eq("user_id", user_id).select();
  if (error) {
    console.log(error);
  }
}

function userNotLogged() {
  user_id = null;
  console.log("User not logged in");
  if (window.location.pathname == "/weekly-unsub.html") {
    window.location.replace("/login.html");
  }
}

async function checkSession() {
  const { data, error } = await client.auth.getSession();
  if (data.session == null) {
    userNotLogged();
  } else {
    userLogged(data.session.user.id);
    if (document.getElementById("displayAccountEmail")) {
      document.getElementById("displayAccountEmail").innerHTML = data.session.user.email;
    }
    user_email = data.session.user.email;
    user_id = data.session.user.id;
  }
}
