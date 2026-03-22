import { fetchAPI } from './tools/fetcAPI.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Target exact IDs (No querySelectors)
    const usableCapitalDisplay = document.getElementById('usable-capital-display');
    const trueReservesDisplay = document.getElementById('true-reserves-display');
    const mandatoryHoardDisplay = document.getElementById('mandatory-hoard-display');
    const sinsStatusContainer = document.getElementById('sins-status-container'); 

    // Formatting helper
    const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

    // 2. Ensure the Contract exists
    const dbUrl = localStorage.getItem('sovereign_db_endpoint');
    if (!dbUrl) {
        usableCapitalDisplay.innerText = "NO_PACT";
        return; 
    }

    // ==========================================
    // CORE RENDER FUNCTION
    // ==========================================
    const renderDashboard = (ledgerData) => {
        const summary = ledgerData[0]; // Extract the summary object
        
        const totalCredit = parseFloat(summary.total_credit) || 0;
        const totalDebit = parseFloat(summary.total_debit) || 0;
        const mandatoryHoard = parseFloat(summary.hold_amount) || 0; // Flat amount now!

        // THE EXACT MATH YOU REQUESTED:
        const trueReserves = totalCredit - totalDebit;
        const usableCapital = totalCredit - mandatoryHoard - totalDebit;

        // Update DOM
        trueReservesDisplay.innerText = formatCurrency(trueReserves);
        mandatoryHoardDisplay.innerText = formatCurrency(mandatoryHoard);
        
        // Terminal Styling for Usable Capital
        if (usableCapital <= 0) {
            usableCapitalDisplay.innerText = formatCurrency(usableCapital);
            usableCapitalDisplay.style.color = '#ff003c'; // Breach (Red)
        } else {
            usableCapitalDisplay.innerText = formatCurrency(usableCapital);
            usableCapitalDisplay.style.color = '#00ff41'; // Safe (Green)
        }

        // Status Indicator Toggle
        if (totalDebit > 0) {
            sinsStatusContainer.classList.remove('muted');
        }
    };

    // ==========================================
    // DATA FETCHING & CACHE LOGIC
    // ==========================================
    
    // 3. Check Session Storage FIRST
    const cachedData = sessionStorage.getItem('ledger_session_data');

    if (cachedData) {
        // CACHE HIT: Parse the data and render immediately. NO API CALL.
        console.log("SYSTEM CACHE: Loading from Session Storage...");
        const parsedData = JSON.parse(cachedData);
        renderDashboard(parsedData);
    } else {
        // CACHE MISS: We need to talk to the server.
        console.log("SYSTEM CACHE MISS: Fetching from Server...");
        usableCapitalDisplay.innerText = "SYNCING...";
        usableCapitalDisplay.style.color = "#ffffff"; 

        const response = await fetchAPI('Get');

        if (response && response.success) {
            // Save to session storage so we don't have to fetch again this session
            sessionStorage.setItem('ledger_session_data', JSON.stringify(response.data));
            
            // Render the UI
            renderDashboard(response.data);
        } else {
            usableCapitalDisplay.innerText = "SYNC_FAILED";
            usableCapitalDisplay.style.color = '#ff003c';
        }
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Failed', err));
    });
}