const sheetBestAPI = 'https://api.sheetbest.com/sheets/42cb07b2-34ed-48ea-8d06-66c3b985edf4';
const ADMIN_PASSWORD = 'hackathonadmin'; // *** FOR HACKATHON ONLY - DO NOT USE IN PRODUCTION ***

const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const adminPasswordInput = document.getElementById('adminPassword');
const loginMessage = document.getElementById('loginMessage');
const reportsContainer = document.getElementById('reportsContainer');

let refreshIntervalId; // Variable to store the interval ID

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
    if (refreshIntervalId) { // Clear the interval when logging out
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
    }
}

function showAdminPanel() {
    loginSection.style.display = 'none';
    adminSection.style.display = 'block';
    fetchPendingReports();
    // Refresh reports every 10 seconds while admin is logged in
    // Store the interval ID to clear it later
    if (!refreshIntervalId) { // Prevent multiple intervals
        refreshIntervalId = setInterval(fetchPendingReports, 10000);
    }
}

function showLoginPanel() {
    loginSection.style.display = 'block';
    adminPasswordInput.value = ""; // Clear password field
    loginMessage.textContent = "";
    adminSection.style.display = 'none';
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
            // Add classes for 'solved' status if implemented
            reportCard.className = `report-card ${report.status}`;
            reportCard.innerHTML = `
                <h2>${report.scamType} - <span style="color: ${report.status === 'verified' ? 'green' : (report.status === 'solved' ? 'blue' : 'orange')};">${report.status.toUpperCase()}</span></h2>
                ${report.companyName ? `<p><strong>Company Name:</strong> ${report.companyName}</p>` : ''}
                <p><strong>Description:</strong> ${report.description}</p>
                <p><strong>Reporter Contact:</strong> ${report.reporterContact || 'N/A'}</p>
                <p><strong>Location:</strong> ${report.location}</p>
                ${report.reporterType ? `<p><strong>Reported by:</strong> ${report.reporterType}</p>` : ''}
                <p><strong>Reported:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
                <p style="font-size: 0.9em; color: #888;">Alert ID: ${report.alertid}</p>
                <div class="report-actions">
                    ${report.status === 'pending' ?
                        `<button onclick="verifyScam('${report.alertid}')">Mark as Verified</button>` : ''}
                    ${report.status !== 'solved' ? // Show 'Mark as Solved' for anything not already solved
                        `<button onclick="solveScam('${report.alertid}')" style="background-color: #28a745;">Mark as Solved</button>` : ''}
                    ${report.status !== 'pending' ? // Show 'Delete' for anything not pending (i.e., verified or solved)
                        `<button onclick="deleteScam('${report.alertid}')" style="background-color: #dc3545;">Delete Report</button>` : ''}
                </div>
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
        const response = await fetch(`${sheetBestAPI}/alertid/${alertid}`, {
            method: 'PATCH', // Use PATCH to update existing data
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                verifiedByAdmin: new Date().toISOString(), // Stamp who verified
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

// New function to mark a scam as 'solved'
async function solveScam(alertid) {
    if (!confirm('Are you sure you want to mark this scam as SOLVED? It will be removed from live alerts.')) {
        return; // Stop if admin cancels
    }
    try {
        const response = await fetch(`${sheetBestAPI}/alertid/${alertid}`, {
            method: 'PATCH',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                resolvedByAdmin: new Date().toISOString(), // New field for resolution timestamp
                status: 'solved', // Set status to 'solved'
            }),
        });

        if (response.ok) {
            alert('Scam marked as SOLVED!');
            fetchPendingReports(); // Refresh the list
        } else {
            alert('Failed to mark scam as solved. Please try again.');
            console.error('Error marking scam as solved:', response.statusText);
        }
    } catch (error) {
        alert('Network error while marking scam as solved.');
        console.error('Network error:', error);
    }
}

// New function to delete a scam report
async function deleteScam(alertid) {
    if (!confirm('WARNING: Are you sure you want to PERMANENTLY DELETE this scam report? This action cannot be undone.')) {
        return; // Stop if admin cancels
    }
    try {
        const response = await fetch(`${sheetBestAPI}/alertid/${alertid}`, {
            method: 'DELETE', // Use DELETE method to remove a row
            mode: 'cors',
        });

        if (response.ok) {
            alert('Scam report deleted successfully!');
            fetchPendingReports(); // Refresh the list
        } else {
            alert('Failed to delete scam report. Please try again.');
            console.error('Error deleting scam:', response.statusText);
        }
    } catch (error) {
        alert('Network error while deleting scam.');
        console.error('Network error:', error);
    }
}


// Check login status on page load
if (localStorage.getItem('isAdminLoggedIn') === 'true') {
    showAdminPanel();
} else {
    showLoginPanel();
}