const weeklyEmailSwitch = document.getElementById("weeklyEmailSwitch");

document.addEventListener("DOMContentLoaded", async function () {
  await checkSession();
  getEmailState(user_id);
});

async function getEmailState(user_id) {
  try {
    if (!user_id) {
      console.log("No user ID available");
      return;
    }

    const { data, error } = await client.from("settings").select("*").eq("user_id", user_id);

    if (error) {
      console.error("Error fetching email settings:", error);
      return;
    }

    if (data && data.length > 0 && data[0]?.newsletter !== undefined) {
      weeklyEmailSwitch.checked = data[0].newsletter === "TRUE";
    } else {
      weeklyEmailSwitch.checked = false; // default state
      console.log("No newsletter settings found for user");
    }
  } catch (err) {
    console.error("Unexpected error in getEmailState:", err);
    weeklyEmailSwitch.checked = false; // fallback to default state
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
