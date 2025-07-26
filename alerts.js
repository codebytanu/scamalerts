const sheetBestAPI = 'https://api.sheetbest.com/sheets/954fa3c2-efc7-499e-bd88-83599bcf71ad'; // *** REPLACE THIS WITH YOUR ACTUAL SHEET.BEST API URL IF IT'S DIFFERENT ***
const alertsContainer = document.getElementById('alertsContainer');

async function fetchAndDisplayAlerts() {
    try {
        // Fetch only verified scams, sorted by timestamp (newest first)
        const response = await fetch(`${sheetBestAPI}/status/verified?_sort=timestamp&_order=desc`);
        const scams = await response.json();

        alertsContainer.innerHTML = ""; // Clear existing alerts

        if (scams.length === 0) {
            alertsContainer.innerHTML = '<p class="no-alerts">No verified scam alerts yet. Stay safe!</p>';
            return;
        }

        scams.forEach(scam => {
            const alertCard = document.createElement('div');
            alertCard.className = 'alert-card';
            alertCard.innerHTML = `
                <h2>${scam.scamType}</h2>
                <p><strong>Description:</strong> ${scam.description}</p>
                <p><strong>Location:</strong> ${scam.location}</p>
                ${scam.reporterType ? `<p><strong>Reported by:</strong> ${scam.reporterType}</p>` : ''}
                <p><strong>Reported:</strong> ${new Date(scam.timestamp).toLocaleString()}</p>
                <p style="font-size: 0.9em; color: #888;">Alert ID: ${scam.alertid}</p>
            `;
            alertsContainer.appendChild(alertCard);
        });
    } catch (error) {
        alertsContainer.innerHTML = '<p class="no-alerts" style="color: red;">Error loading alerts. Please try again later.</p>';
        console.error('Error fetching alerts:', error);
    }
}

// Fetch alerts immediately on page load
fetchAndDisplayAlerts();

// Refresh alerts every 10 seconds (for "real-time" effect)
setInterval(fetchAndDisplayAlerts, 10000); // 10 seconds