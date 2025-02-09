document.addEventListener("DOMContentLoaded", function () {
   
    let scanButton = document.getElementById("scanTabs");
    let riskList = document.getElementById("riskList");

    // Load risky sites from storage and display them
    chrome.storage.local.get({ riskySites: [] }, (data) => {
        updateRiskList(data.riskySites);
    });

    // Handle Scan Button Click
    scanButton.addEventListener("click", function () {
        chrome.runtime.sendMessage({ action: "scanTabs" }, (response) => {
            console.log(response.status);
            updatePopup();
        });
    });
});

// Function to update the UI with risky sites
function updateRiskList(sites) {
    let riskList = document.getElementById("riskList");
    riskList.innerHTML = sites.length === 0
        ? "<li>No risky sites detected.</li>"
        : sites.map(url => `<li>⚠️ <a href="${url}" target="_blank">${url}</a></li>`).join("");
}

// Function to refresh the popup after scanning
function updatePopup() {
    chrome.storage.local.get({ riskySites: [] }, (data) => {
        updateRiskList(data.riskySites);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    let scanButton = document.getElementById("scanTabs");
    let riskList = document.getElementById("result");

    if (!scanButton || !riskList) {
        console.error("❌ Error: Elements not found in popup.html");
        return;
    }

    scanButton.addEventListener("click", function () {
        riskList.innerHTML = "<p>🔍 Scanning...</p>"; // Update UI before scanning

        // Delay scanning slightly to allow UI to update
        setTimeout(() => {
            chrome.tabs.query({}, function (tabs) {
                let riskyTabs = tabs.filter(tab => isRisky(tab.url));

                if (riskyTabs.length > 0) {
                    let riskyUrls = riskyTabs.map(tab => tab.url);

                    // Highlight risky tabs
                    riskyTabs.forEach(tab => highlightTab(tab.id));

                    // Store risky sites
                    chrome.storage.local.set({ riskySites: riskyUrls });

                    // Show results in popup
                    displayResults(riskyTabs);

                    // Show notification
                    showNotification(riskyUrls);
                } else {
                    riskList.innerHTML = "<p>✅ No risky sites detected.</p>";
                }
            });
        }, 1000); // Small delay to ensure UI updates first
    });

    // Function to check if a URL contains risky keywords
    function isRisky(url) {
        if (!url) return false;
        const riskyKeywords = ["phishing", "scam", "malware", "fake", "suspicious","malicioussite"];
        return riskyKeywords.some(keyword => url.toLowerCase().includes(keyword));
    }

    // Function to highlight a risky tab
    function highlightTab(tabId) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                document.body.style.border = "5px solid red"; // Add red border to risky sites
            }
        }).catch(err => console.error("❌ Error highlighting tab:", err));
    }

    // Function to display scan results
    function displayResults(riskyTabs) {
        riskList.innerHTML = "<h3>⚠️ Risky Sites Detected:</h3>";

        riskyTabs.forEach(tab => {
            let p = document.createElement("p");
            p.innerHTML = `🚨 <b>Suspicious:</b> <a href="${tab.url}" target="_blank">${tab.url}</a>`;
            riskList.appendChild(p);
        });
    }

    // Function to show Chrome notification
    function showNotification(riskyUrls) {
        let message = `⚠️ Suspicious websites detected:\n${riskyUrls.join("\n")}`;
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icons/icon16.png",
            title: "⚠️ Warning!",
            message: message,
            priority: 2
        });
       
    }

    // Load stored risky sites when popup opens
    chrome.storage.local.get({ riskySites: [] }, function (data) {
        if (data.riskySites.length > 0) {
            displayResults(data.riskySites.map(url => ({ url })));
        }
    });
});
