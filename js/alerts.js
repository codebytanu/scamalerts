const sheetBestAPI = 'https://script.google.com/macros/s/AKfycbwuSHDDAPHncZbfNz2cvq4ZSobCUSOQO091Qyte0WKj0E9z8llHOUaLwFq1nvDM-CjOoQ/exec';
const alertsContainer = document.getElementById('alertsContainer');
const scamTypeFilterInput = document.getElementById('scamTypeFilter'); // Changed ID to match HTML
const applyFilterButton = document.getElementById('applyFilter');
const clearFilterButton = document.getElementById('clearFilter');

async function fetchAndDisplayAlerts(filterTerm = '') {
    try {
        let url = `${sheetBestAPI}/status/verified?_sort=timestamp&_order=desc`;

        if (filterTerm) {
            // Updated filtering to target scamType field
            url = `${sheetBestAPI}/status/verified/scamType/*${filterTerm}*?_sort=timestamp&_order=desc`;
        }

        const response = await fetch(url);
        const scams = await response.json();

        alertsContainer.innerHTML = "";

        if (scams.length === 0) {
            alertsContainer.innerHTML = '<p class="no-alerts">No verified scam alerts yet. Stay safe!</p>';
            if (filterTerm) {
                alertsContainer.innerHTML = `<p class="no-alerts">No verified scam alerts found for "${filterTerm}".</p>`;
            }
            return;
        }

        scams.forEach(scam => {
            const alertCard = document.createElement('div');
            alertCard.className = 'alert-card';
            alertCard.innerHTML = `
                <h2>${scam.scamType}</h2>
                ${scam.companyName ? `<p><strong>Company Name:</strong> ${scam.companyName}</p>` : ''}
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

applyFilterButton.addEventListener('click', () => {
    const filterTerm = scamTypeFilterInput.value.trim();
    fetchAndDisplayAlerts(filterTerm);
});

clearFilterButton.addEventListener('click', () => {
    scamTypeFilterInput.value = '';
    fetchAndDisplayAlerts();
});

fetchAndDisplayAlerts();

setInterval(() => {
    const currentFilter = scamTypeFilterInput.value.trim();
    fetchAndDisplayAlerts(currentFilter);
}, 10000);