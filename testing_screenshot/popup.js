document.addEventListener("DOMContentLoaded", function() {
    const captureButton = document.getElementById("capture");
    const screenshotContainer = document.getElementById("screenshotContainer");

    captureButton.addEventListener("click", function() {
        chrome.runtime.sendMessage({action: "captureScreenshot"}, (response) => {
            if (response.error) {
                console.error("Error capturing screenshot: ", response.error);
            } else {
                const screenshotImage = new Image();
                screenshotImage.src = response.screenshotUrl;
                screenshotContainer.appendChild(screenshotImage);
            }
        });
    });
});
