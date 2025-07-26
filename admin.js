const sheetBestAPI = 'https://api.sheetbest.com/sheets/954fa3c2-efc7-499e-bd88-83599bcf71ad'; // *** REPLACE THIS WITH YOUR ACTUAL SHEET.BEST API URL ***
const ADMIN_PASSWORD = 'hackathonadmin'; // *** CHANGE THIS TO SOMETHING SIMPLE FOR THE HACKATHON ***

const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const adminPasswordInput = document.getElementById('adminPassword');
const loginMessage = document.getElementById('loginMessage');
const reportsContainer = document.getElementById('reportsContainer');

// Global function to be called from HTML (onclick)
function checkPassword() {
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
        localStorage.setItem('isAdminLoggedin', 'true'); // Remember login
        showAdminPanel();
    } else {
        loginMessage.textContent = 'Incorrect password.';
    }
}

// Global function to be called from HTML (onclick)
function logout() {
    localStorage.removeItem('isAdminLoggedIn');
    showLoginPanel();
    reportsContainer.innerHTML = ""; // Clear reports on logout
}

function showAdminPanel() {
    loginSection.style.display = 'none';
    adminSection.style.display = 'block';
    fetchPendingReports();
    // Refresh reports every 10 seconds while admin is logged in
    setInterval(fetchPendingReports, 10000);
}

function showLoginPanel() {
    loginSection.style.display = 'block';
    adminSection.style.display = 'none';
    adminPasswordInput.value = ""; // Clear password field
    loginMessage.textContent = "";
}

async function fetchPendingReports() {
    try {
        // Fetch all reports, regardless of status, for admin to review
        const response = await fetch(`${sheetBestAPI}?_sort=timestamp&_order=asc`);
        const reports = await response.json();

        reportsContainer.innerHTML = ""; // Clear existing reports

        if (reports.length === 0) {
            reportsContainer.innerHTML = '<p class="no-reports">No scam reports to review.</p>';
            return;
        }

        reports.forEach(report => {
            const reportCard = document.createElement('div');
            reportCard.className = `report-card ${report.status}`; // Add status class for styling
            reportCard.innerHTML = `
                <h2>${report.scamType} - <span style="color: ${report.status === 'verified' ? 'green' : 'orange'};">${report.status.toUpperCase()}</span></h2>
                <p><strong>Description:</strong> ${report.description}</p>
                <p><strong>Reporter Contact:</strong> ${report.reporterContact || 'N/A'}</p>
                <p><strong>Location:</strong> ${report.location}</p>
                ${report.reporterType ? `<p><strong>Reported by:</strong> ${report.reporterType}</p>` : ''}
                <p><strong>Reported:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
                <p style="font-size: 0.9em; color: #888;">Alert ID: ${report.alertid}</p>
                ${report.status === 'pending' ?
                    `<button onclick="verifyScam('${report.alertid}')">Mark as Verified</button>` : ''}
            `;
            reportsContainer.appendChild(reportCard);
        });
    } catch (error) {
        reportsContainer.innerHTML = '<p class="no-reports" style="color: red;">Error loading reports.</p>';
        console.error('Error fetching reports:', error);
    }
}

// Global function to be called from HTML (onclick)
async function verifyScam(alertid) {
    try {
        // Find the row in Google Sheet to update based on alertid
        const response = await fetch(`${sheetBestAPI}/alertid/${alertid}`, {
            method: 'PATCH', // Use PATCH to update existing data
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                verifiedByAdmin: 'Admin ' + new Date().toLocaleString(), // Stamp who verified
                status: 'verified',
            }),
        });

        if (response.ok) {
            alert('Scam marked as verified!');
            fetchPendingReports(); // Refresh the list
        } else {
            alert('Failed to verify scam. Please try again.');
            console.error('Error verifying scam:', response.statusText);
        }
    } catch (error) {
        alert('Network error while verifying scam.');
        console.error('Network error:', error);
    }
}

// Check login status on page load
if (localStorage.getItem('isAdminLoggedIn') === 'true') {
    showAdminPanel();
} else {
    showLoginPanel();
}