window.onload = function () {
  chrome.storage.local.get(["oauthEmail"], function (result) {
    if (result.oauthEmail) {
      document.querySelector("#email").innerText = `Logged in as ${result.oauthEmail}!`;
      document.querySelector(".signed-in-only").style.display = "block";
    } else {
      document.querySelector("#email").innerText = "Not signed in!";
      document.querySelector(".signed-in-only").style.display = "none";
    }
  }
  )
}