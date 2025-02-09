chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ riskySites: [] });
});

// Listen for tab updates (when a website loads)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        checkTab(tab);
    }
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scanTabs") {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => checkTab(tab));
        });
        sendResponse({ status: "Scan Completed" });
    }
});

// Function to check if a URL is risky
function checkTab(tab) {
    if (!tab.url || tab.url.startsWith("chrome://") ||tab.url.startsWith("https://www.google.com/") || tab.url.startsWith("https://en.wikipedia.org/") || tab.url.startsWith("https://support.microsoft.com/") || tab.url.startsWith("https://www.ibm.com/") || tab.url.startsWith("https://www.youtube.com/") || tab.url.startsWith("https://www.linkedin.com/") || tab.url.startsWith("https://www.chatgpt.com/") || tab.url.startsWith("https://www.flipcart.com/") || tab.url.startsWith("https://www.amazon.com/") || tab.url.startsWith("https://www.whatsapp.com/") || tab.url.startsWith("https://www.facebook.com/") || tab.url.startsWith("https://www.google.com/") || tab.url.startsWith("https://www.mcafee.com/") || tab.url.startsWith("https://www.github.com/") || tab.url.startsWith("https://chrome.google.com/webstore")) {
        return; // Ignore system URLs
    }

    const riskyKeywords = ["phishing", "scam", "malware", "fake", "suspicious", "fraud","malicioussite"];
    let isRisky = riskyKeywords.some(keyword => tab.url.toLowerCase().includes(keyword));

    if (isRisky) {
        chrome.storage.local.get({ riskySites: [] }, (data) => {
            let sites = data.riskySites;
            if (!sites.includes(tab.url)) {
                sites.push(tab.url);
                chrome.storage.local.set({ riskySites: sites });

                showNotification(tab.url);
            }
        });
    }
}

// Function to show a warning notification
function showNotification(url) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon16.png",
        title: "⚠️ Warning!",
        message: `This website may be unsafe: ${url}`,
        priority: 2
    });
}



