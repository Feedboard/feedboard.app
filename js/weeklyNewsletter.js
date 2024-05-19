const weeklyEmailSwitch = document.getElementById("weeklyEmailSwitch");

document.addEventListener("DOMContentLoaded", async function () {
  await checkSession();
  getEmailState(user_id);
});

async function getEmailState(user_id) {
  const { data, error } = await client.from("settings").select("*").eq("user_id", user_id);
  if (error) {
    console.log(error);
  }
  if (data) {
    if (data[0].newsletter) {
      weeklyEmailSwitch.checked = true;
    } else {
      weeklyEmailSwitch.checked = false;
    }
  }
}

weeklyEmailSwitch.addEventListener("click", async function () {
  if (weeklyEmailSwitch.checked) {
    console.log("Newsletter is on");
    const { data, error } = await client.from("settings").update({ newsletter: "TRUE" }).eq("user_id", user_id).select();
    if (error) {
      console.log(error);
    }
  } else {
    console.log("Newsletter is off");
    const { data, error } = await client.from("settings").update({ newsletter: "FALSE" }).eq("user_id", user_id).select();
    if (error) {
      console.log(error);
    }
  }
});
