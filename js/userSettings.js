checkSession();

async function checkSession() {
  const { data, error } = await client.auth.getSession();
  if (data.session == null) {
    userNotLogged();
  } else {
    user_email = data.session.user.email;
    user_id = data.session.user.id;
    addUserSettings(user_id, user_email);
  }
}

function userNotLogged() {
  user_id = null;
  console.log("User not logged in");
  if (window.location.pathname == "/dashboard.html") {
    window.location.replace("/login.html");
  } else {
    window.location.replace("/login.html");
  }
}

async function checkSettings(user_id) {
  const { data, error } = await client.from("settings").select("*").eq("user_id", user_id);
  if (error) {
    console.log(error);
  }
  if (data.length <= 0) {
    return false;
  } else {
    return true;
  }
}

async function addUserSettings(user_id, user_email) {
  if (await checkSettings(user_id)) {
    console.log("Settings already declared");
    window.location.replace("/dashboard.html");
  } else {
    // Add default settings
    const { users, error } = await client.from("settings").insert([{ user_id: user_id, user_email: user_email }]);
    if (error) {
      console.log(error);
    }
    if (users) {
      console.log(users);
    }
  }
}
