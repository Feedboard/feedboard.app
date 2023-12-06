const userEmail = document.getElementById("userEmail");
const userPassword = document.getElementById("userPassword");
const registerBtn = document.getElementById("registerBtn");
const googleAuthBtn = document.getElementById("googleAuthBtn");

registerBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  registerBtn.disabled = true;
  const { data, error } = await client.auth.signUp({
    email: userEmail.value,
    password: userPassword.value,
  });
  if (error) {
    document.getElementById("signupHelper").innerHTML = error;
    console.log(error);
    registerBtn.disabled = false;
  } else {
    console.log(data);
    await addUserSettings(data);
    window.location.replace("./success.html");
  }
});

googleAuthBtn.addEventListener("click", async function () {
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://feedboard.app/success.html",
    },
  });
});

async function addUserSettings(data) {
  // Add default settings
  const { users, error } = await client.from("settings").insert([{ user_id: data.user.id, user_email: data.user.email }]);
  if (error) {
    console.log(error);
  }
  if (users) {
    console.log(users);
  }
}
