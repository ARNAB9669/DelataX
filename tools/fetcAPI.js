/**
 * Core communication protocol for the Sovereign Ledger.
  @param {string} action - 'Debit', 'Credit', or 'Get'
  @param {object|null} payload - The JSON dictionary (not required for 'Get')
  @returns {object|null} - The JSON response from the backend
 */
export async function fetchAPI(action, payload = null) {
    // 1. Pull the user's custom database URL from their local storage
    const dbUrl = localStorage.getItem('sovereign_db_endpoint');

    // Safety Check: If they haven't set up the contract yet, stop immediately.
    if (!dbUrl) {
        console.error("CRITICAL: No DB Endpoint found in local storage.");
        alert("SYSTEM ERROR: Ledger not synced. Please configure THE CONTRACT.");
        return null; // Exit early
    }

    // 2. Build the outgoing packet.
    // We always include the action so the backend knows what to do.
    const requestBody = {
        action: action
    };

    // Only attach the payload data if it actually exists (e.g., skips this on 'Get')
    if (payload) {
        requestBody.data = payload;
    }

    try {
        // 3. Fire the POST request. 
        // Notice it ALWAYS uses 'POST', even if the action is 'Get'.
        const response = await fetch(dbUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // 4. Catch server errors (like a 404 or 500)
        if (!response.ok) {
            throw new Error(`LEDGER REJECTED: HTTP ${response.status}`);
        }

        // 5. Parse and return the JSON response from your backend
        const responseData = await response.json();
        return responseData;

    } catch (error) {
        // Catch network errors (like if their server is offline)
        console.error("TRANSMISSION FAILED:", error);
        alert("TRANSMISSION FAILED. Is your backend server running?");
        return null;
    }
}