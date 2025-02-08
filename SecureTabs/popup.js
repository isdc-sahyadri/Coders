document.getElementById("scanTabs").addEventListener("click", async function () {
    chrome.tabs.query({}, (tabs) => {
        let riskyTabs = tabs.filter(tab => isRisky(tab.url));
        displayResults(riskyTabs);
    });
});

const riskyKeywords = ["phishing", "scam", "malware", "fake", "suspicious"];

function isRisky(url) {
    return riskyKeywords.some(keyword => url.toLowerCase().includes(keyword));
}

function displayResults(riskyTabs) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = ""; 

    if (riskyTabs.length === 0) {
        resultDiv.innerHTML = "<p>No risky sites detected.</p>";
    } else {
        riskyTabs.forEach(tab => {
            let p = document.createElement("p");
            p.innerHTML = `⚠ <b>Risky:</b> <a href="${tab.url}" target="_blank">${tab.url}</a>`;
            resultDiv.appendChild(p);
        });
    }
}
