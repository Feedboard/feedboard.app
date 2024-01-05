const userEmail = document.getElementById("userEmail");
const userPassword = document.getElementById("userPassword");
const registerBtn = document.getElementById("registerBtn");
const googleAuthBtn = document.getElementById("googleAuthBtn");

if (sessionStorage.getItem("temp_email")) {
  let temp_email = sessionStorage.getItem("temp_email");
  addTempEmail(temp_email);
  userEmail.value = temp_email;
  sessionStorage.removeItem("temp_email");
}

async function addTempEmail(temp_email) {
  const { data, error } = await client
    .from("generic-newsletter")
    .insert([{ user_email: temp_email }])
    .select();
  if (error) {
    console.log(error);
  }
}

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
