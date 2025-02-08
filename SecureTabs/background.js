

const riskyKeywords = ["phishing", "scam", "malware", "fake", "suspicious"];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        checkRiskyURL(tab);
    }
});

function checkRiskyURL(tab) {
    const url = tab.url.toLowerCase();
    
    if (riskyKeywords.some(keyword => url.includes(keyword))) {
        chrome.notifications.create({
            type: "basic",
            iconUrl: chrome.runtime.getURL("icons/icon48.png"),
            title: "⚠ Warning: Suspicious Website!",
            message: `The site ${tab.url} may be risky! Proceed with caution.`,
            priority: 2
        });
        
    }
}
