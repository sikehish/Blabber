// This script runs in the context of the webpage
function getPageHTML() {
  return document.documentElement.outerHTML; // Get the entire HTML of the page
}

// Send the HTML to the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getHTML") {
    const html = getPageHTML();
    sendResponse({ html: html });
  }
});
