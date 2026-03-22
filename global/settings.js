// 1. IMPORT YOUR TOOL AT THE VERY TOP
import { fetchAPI } from '../tools/fetcAPI.js';

// Grab the elements using their specific IDs
const ackCheckbox = document.getElementById('ack-checkbox');
const sealBtn = document.getElementById('seal-btn');
const initialCapitalInput = document.getElementById('capital-input');
const mandatoryHoardInput = document.getElementById('hoard-input');
const dbApiInput = document.getElementById('db-api-input');
const llmApiInput = document.getElementById('llm-api-input');
const statusDisplay = document.getElementById('status-display');

// Load existing data if they already sealed the pact previously
window.addEventListener('DOMContentLoaded', () => {
    const savedCapital = localStorage.getItem('sovereign_capital');
    const savedHoard = localStorage.getItem('sovereign_hoard');
    const savedDbApi = localStorage.getItem('sovereign_db_endpoint');
    const savedLlmKey = localStorage.getItem('sovereign_llm_key');

    // Populate the inputs if data exists
    if (savedCapital) initialCapitalInput.value = savedCapital;
    if (savedHoard) mandatoryHoardInput.value = savedHoard;
    if (savedDbApi) dbApiInput.value = savedDbApi;
    if (savedLlmKey) llmApiInput.value = savedLlmKey;
    
    // If they have their DB link setup, show a connected status
    if (savedDbApi) {
        statusDisplay.innerText = 'LEDGER_SYNCED';
        statusDisplay.style.color = '#00ff41'; // Terminal green
    }
});

// Listen for clicks on the checkbox to enable/disable the button
ackCheckbox.addEventListener('change', (event) => {
    if (event.target.checked) {
        sealBtn.removeAttribute('disabled');
        sealBtn.style.backgroundColor = '#ffffff';
        sealBtn.style.color = '#000000';
    } else {
        sealBtn.setAttribute('disabled', 'true');
        sealBtn.style.backgroundColor = '#333';
        sealBtn.style.color = '#111';
    }
});

// Submit logic - NOW ASYNC to handle the API call
sealBtn.addEventListener('click', async () => {
    const capital = initialCapitalInput.value.trim();
    const hoard = mandatoryHoardInput.value.trim();
    const dbEndpoint = dbApiInput.value.trim();
    const llmKey = llmApiInput.value.trim();

    // Basic validation (At least require the DB endpoint)
    if (!dbEndpoint) {
        alert("CRITICAL ERROR: Server Link [DB_ENDPOINT] is required to save the contract.");
        return;
    }

    // 2. CRITICAL STEP: Save the DB URL to LocalStorage FIRST.
    // Our fetchAPI() tool needs to read this to know where to send the data.
    localStorage.setItem('sovereign_db_endpoint', dbEndpoint);

    // 3. UI Feedback: Let the user know we are talking to the server
    sealBtn.innerText = 'TRANSMITTING...';
    sealBtn.style.backgroundColor = '#555';
    sealBtn.style.color = '#ffffff';
    sealBtn.setAttribute('disabled', 'true');

    // 4. Build the payload for the backend
    const payload = {
        capital: parseFloat(capital) || 0,
        hoard: parseFloat(hoard) || 20
    };

    // 5. Fire the API call and wait for the response
    const response = await fetchAPI('Contract', payload);

    // 6. Handle the result
    if (response && response.success) {
        // Only save the rest of the data locally if the database accepted it
        localStorage.setItem('sovereign_capital', capital || '0.00');
        localStorage.setItem('sovereign_hoard', hoard || '20');
        localStorage.setItem('sovereign_llm_key', llmKey);

        // Success terminal feedback effect
        sealBtn.innerText = 'PACT SEALED';
        sealBtn.style.backgroundColor = '#00ff41'; // Green
        sealBtn.style.color = '#000000';
        
        statusDisplay.innerText = 'CONNECTION_ESTABLISHED';
        statusDisplay.style.color = '#00ff41';
    } else {
        // Failure feedback
        sealBtn.innerText = 'TRANSMISSION FAILED';
        sealBtn.style.backgroundColor = '#ff003c'; // Red
        sealBtn.style.color = '#ffffff';
        
        statusDisplay.innerText = 'CONNECTION_FAILED';
        statusDisplay.style.color = '#ff003c';
    }

    // 7. Reset button text and uncheck box after 2 seconds
    setTimeout(() => {
        sealBtn.innerText = 'UPDATE PARAMETERS';
        sealBtn.style.backgroundColor = '#ffffff';
        sealBtn.style.color = '#000000';
        ackCheckbox.checked = false;
        // Keep button disabled until they check the box again
    }, 2000);
});