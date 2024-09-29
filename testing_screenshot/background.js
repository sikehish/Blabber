chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureScreenshot') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      console.log(dataUrl, "HAHAHAHHA")
      chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: "png" }, function (dataUrl) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ screenshotUrl: dataUrl });
        }
      });
    });
  }
  return true; // To ensure async response
});
