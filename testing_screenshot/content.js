// Create overlay button for screenshot
const screenshotButton = document.createElement("button");
screenshotButton.textContent = "Capture Screenshot";
screenshotButton.style.position = "fixed";
screenshotButton.style.bottom = "20px";
screenshotButton.style.right = "20px";
screenshotButton.style.zIndex = "1000";
document.body.appendChild(screenshotButton);

// Add click event listener
screenshotButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "captureScreenshot" }, function (response) {
    console.log(response)
    if (response && response.screenshotUrl) {
      const img = new Image();
      img.src = response.screenshotUrl;
      document.body.appendChild(img); // Display the screenshot on the page
    } else {
      console.error(response.error || "Failed to capture screenshot");
    }
  });
});
