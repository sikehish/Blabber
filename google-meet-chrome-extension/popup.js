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

document.getElementById('screenshot-btn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: captureScreenshot
    }, (results) => {
      if (chrome.runtime.lastError) {
        alert('Error capturing screenshot: ' + chrome.runtime.lastError.message);
      } else {
        if (results && results[0] && results[0].result) {
          alert('Screenshot capture initiated.');
        }
      }
    });
  });
});

function captureScreenshot() {
  chrome.runtime.sendMessage({ action: "capture_screenshot" }, (response) => {
    return response; // Return the response to indicate whether it's initiated
  });
}
