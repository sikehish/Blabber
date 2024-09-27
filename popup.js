document.getElementById("fetch-html").addEventListener("click", () => {
    // Send a message to the content script to get the HTML
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getHTML" }, (response) => {
        if (response && response.html) {
          document.getElementById("html-output").textContent = response.html;
        } else {
          document.getElementById("html-output").textContent = "Failed to retrieve HTML.";
        }
      });
    });
  });
  