chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    details.requestHeaders.push({ name: "Origin", value: "jbfnkhlbomdckbnigbffjljcagildgon" }); // Replace with your extension ID
    return { requestHeaders: details.requestHeaders };
  },
  { urls: ["https://dev.mokapen.uno*"] }, // Adjust to match your backend API URL
  ["blocking", "requestHeaders"]
);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    tab.url.includes("linkedin.com/in/") &&
    changeInfo.status === "complete"
  ) {
    chrome.tabs.executeScript(tabId, { file: "content.js" });
  }
});


// Function to get a specific cookie by name from the local URL
function getCookie(name, callback) {
  chrome.cookies.get({ url: "https://dev.mokapen.uno/api/login", name: name }, (cookie) => {
      if (cookie) {
          callback(cookie.value);
      } else {
          callback(null);
      }
  });
}

// Listen for messages from content scripts
// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getCookies") {
      // Get both cookies
      getCookie("access_token", (accessToken) => {
          getCookie("extension_org_id", (extension_org_id) => {
              sendResponse({ accessToken: accessToken, extension_org_id: extension_org_id });
          });
      });
      return true; // Keep the message channel open for sendResponse
  }
});
