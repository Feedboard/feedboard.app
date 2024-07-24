const displaySuccess = document.getElementById("displaySuccess");

checkSession();

async function checkSession() {
  const { data, error } = await client.auth.getSession();
  if (data.session == null) {
    userNotLogged();
  } else {
    user_email = data.session.user.email;
    user_id = data.session.user.id;
    await createStarterBoard(user_id);
    addUserSettings(user_id, user_email);
    addUserViaLoop(user_email);
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
    displaySuccess.style.display = "block";
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

async function addUserViaLoop(user_email) {
  const url = "https://feedboard-api-relay-production.up.railway.app/adduser/" + user_email;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function createStarterBoard(user_id) {
  const { users, error } = await client.from("boards").insert([{ user_id: user_id, board_name: "main" }]);
  if (error) {
    console.log(error);
  }
  if (users) {
    console.log(users);
  }
}
