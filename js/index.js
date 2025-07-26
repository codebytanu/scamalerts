const sheetBestAPI = 'https://api.sheetbest.com/sheets/954fa3c2-efc7-499e-bd88-83599bcf71ad'; // Updated API URL
const form = document.getElementById('scamReportForm');
const messageDiv = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop the form from refreshing the page

    const scamType = document.getElementById('scamType').value;
    const companyName = document.getElementById('companyName').value; // New: Capture Company Name
    const description = document.getElementById('description').value;
    const reporterContact = document.getElementById('reporterContact').value;
    const location = document.getElementById('location').value;
    const reporterType = document.getElementById('reporterType')? document.getElementById('reporterType').value : ""; // Optional reporter type

    // Generate a simple unique ID for this alert
    const alertid = 'scam-' + Date.now();

    const data = {
        scamType: scamType,
        companyName: companyName, // New: Add Company Name to data
        description: description,
        reporterContact: reporterContact,
        location: location,
        reporterType: reporterType, // Add to data
        status: 'pending', // Always start as pending
        timestamp: new Date().toISOString(),
        verifiedByAdmin: "", // Empty until verified
        alertid: alertid
    };

    try {
        const response = await fetch(sheetBestAPI, {
            method: 'POST',
            mode: 'cors', // Important for Sheet.best
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            messageDiv.style.color = 'green';
            messageDiv.textContent = 'Scam reported successfully! Thank you.';
            form.reset(); // Clear the form
        } else {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Failed to report scam. Please try again.';
            console.error('Error submitting form:', response.statusText);
        }
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Network error. Please check your connection.';
        console.error('Network error:', error);
    }
});