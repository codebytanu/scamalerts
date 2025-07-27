const sheetBestAPI = 'https://script.google.com/macros/s/AKfycbwuSHDDAPHncZbfNz2cvq4ZSobCUSOQO091Qyte0WKj0E9z8llHOUaLwFq1nvDM-CjOoQ/exec';
const form = document.getElementById('scamReportForm');
const messageDiv = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const scamType = document.getElementById('scamType').value;
    const companyName = document.getElementById('companyName').value;
    const description = document.getElementById('description').value;
    const reporterContact = document.getElementById('reporterContact').value;
    const location = document.getElementById('location').value;
    const reporterType = document.getElementById('reporterType')? document.getElementById('reporterType').value : "";

    const alertid = 'scam-' + Date.now();

    const data = {
        scamType: scamType,
        companyName: companyName,
        description: description,
        reporterContact: reporterContact,
        location: location,
        reporterType: reporterType,
        status: 'pending', // Always start as pending
        timestamp: new Date().toISOString(),
        verifiedByAdmin: "", // Empty until verified
        alertid: alertid
    };

    try {
        const response = await fetch(sheetBestAPI, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            messageDiv.style.color = 'green';
            messageDiv.textContent = 'Scam reported successfully! Thank you.';
            form.reset(); // Clear the form
            messageDiv.style.display = "block"; // MAKE THE MESSAGE VISIBLE
            setTimeout(() => {
                messageDiv.style.display = "none"; // Hide the message after 5 seconds
                messageDiv.textContent = ""; // Clear the text
            }, 5000);
        } else {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Failed to report scam. Please try again.';
            messageDiv.style.display = "block"; // MAKE THE ERROR MESSAGE VISIBLE
            setTimeout(() => {
                messageDiv.style.display = "none";
                messageDiv.textContent = "";
            }, 5000);
            console.error('Error submitting form:', response.statusText);
        }
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Network error. Please check your connection.';
        messageDiv.style.display = "block"; // MAKE THE NETWORK ERROR VISIBLE
        setTimeout(() => {
            messageDiv.style.display = "none";
            messageDiv.textContent = "";
        }, 5000);
        console.error('Network error:', error);
    }
});
