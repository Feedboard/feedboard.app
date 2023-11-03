const userEmail = document.getElementById("userEmail");
const userPassword = document.getElementById("userPassword");
const registerBtn = document.getElementById("registerBtn");

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

const loginBtn = document.getElementById("loginBtn");
const googleAuthBtn = document.getElementById("googleAuthBtn");

loginBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  loginBtn.disabled = true;
  const isEmailValid = isValidEmail(userEmail.value);
  const isPasswordValid = isValidPassword(userPassword.value);
  if (isEmailValid) {
    // console.log("valid email address.");
    if (isPasswordValid) {
      // console.log("password ok");
      const { data, error } = await client.auth.signInWithPassword(
        {
          email: userEmail.value,
          password: userPassword.value,
        },
        {
          redirectTo: window.location.origin,
        }
      );
      if (error) {
        document.getElementById("loginHelper").innerHTML = "Email or password not correct";
        loginBtn.disabled = false;
      } else {
        document.getElementById("loginHelper").innerHTML = "";
        console.log(data);
        window.location.replace("/dashboard.html");
        loginBtn.disabled = false;
      }
    } else {
      console.log("not a valid password");
      loginBtn.disabled = false;
    }
  } else {
    console.log("not a valid email address.");
    loginBtn.disabled = false;
  }
});

googleAuthBtn.addEventListener("click", async function () {
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://feedboard.app/dashboard.html",
    },
  });
});
