import { fetchAPI } from '../tools/fetcAPI.js';

// Grab required elements
const btnDebit = document.getElementById('btn-debit');
const btnCredit = document.getElementById('btn-credit');
const amountInput = document.getElementById('amount-input');
const actionBtn = document.getElementById('action-btn');
const tagCells = document.querySelectorAll('.tag-cell');
const tagGrid = document.querySelector('.tag-grid');

// State variables
let currentTransactionType = 'debit'; 
let currentSelectedTag = null;

// --- 1. TOGGLE LOGIC ---

btnDebit.addEventListener('click', () => {
    btnDebit.classList.add('active');
    btnCredit.classList.remove('active');
    amountInput.classList.remove('color-credit');
    amountInput.classList.add('color-debit');
    actionBtn.innerText = 'Log Sin';
    currentTransactionType = 'debit';
    tagGrid.style.opacity = '1';
    tagGrid.style.pointerEvents = 'auto';
});

btnCredit.addEventListener('click', () => {
    btnCredit.classList.add('active');
    btnDebit.classList.remove('active');
    amountInput.classList.remove('color-debit');
    amountInput.classList.add('color-credit');
    actionBtn.innerText = 'Add Life';
    currentTransactionType = 'credit';
    tagGrid.style.opacity = '0.3';
    tagGrid.style.pointerEvents = 'none';
    tagCells.forEach(c => c.style.backgroundColor = 'transparent');
    currentSelectedTag = null;
});

// --- 2. TAG SELECTION LOGIC ---

tagCells.forEach(cell => {
    cell.addEventListener('click', () => {
        // Clear previous selection
        tagCells.forEach(c => c.style.backgroundColor = 'transparent');
        // Apply new selection
        cell.style.backgroundColor = '#2a2a2a';
        // Get the tag and force to Uppercase for backend compatibility
        currentSelectedTag = cell.getAttribute('data-tag').toUpperCase();
        console.log("Selected Tag:", currentSelectedTag);
    });
});

// --- 3. PERCENTAGE CALCULATION ---

async function updatePercentages() {
    const response = await fetchAPI('Get');
    if (response && response.success) {
        const summary = response.data[0];
        const totalCredit = parseFloat(summary.total_credit) || 1; 
        const categoryData = summary.spent_by_category;

        // Loop through the 6 tags and update UI
        for (const [tag, spent] of Object.entries(categoryData)) {
            const displayElement = document.getElementById(`percent-${tag.toLowerCase()}`);
            if (displayElement) {
                const percentage = ((spent / totalCredit) * 100).toFixed(0);
                displayElement.innerText = `${percentage}%`;
            }
        }
    }
}

// --- 4. SUBMIT LOGIC ---

actionBtn.addEventListener('click', async () => {
    const amount = parseFloat(amountInput.value) || 0;

    // Validation
    if (amount <= 0) {
        alert("Enter a valid amount.");
        return;
    }

    if (currentTransactionType === 'debit' && !currentSelectedTag) {
        alert("You must select a Tag to confess a Sin.");
        return;
    }

    // UI Feedback
    actionBtn.innerText = "TRANSMITTING...";
    actionBtn.disabled = true;

    // Prepare Payload
    // Action must be exactly 'Debit' or 'Credit'
    const apiAction = currentTransactionType === 'debit' ? 'Debit' : 'Credit';
    const payload = {
        amount: amount,
        tag: currentTransactionType === 'debit' ? currentSelectedTag : null
    };

    // Execute API Call
    const result = await fetchAPI(apiAction, payload);

    if (result && result.success) {
        // Clear session cache so Home page shows new balance
        sessionStorage.removeItem('ledger_session_data');
        
        actionBtn.innerText = "SUCCESS";
        actionBtn.style.backgroundColor = "#00ff41";

        // Update the tags on this page immediately
        await updatePercentages();

        // Reset UI after 2 seconds
        setTimeout(() => {
            amountInput.value = "00.00";
            actionBtn.disabled = false;
            actionBtn.style.backgroundColor = "";
            actionBtn.innerText = currentTransactionType === 'debit' ? 'Log Sin' : 'Add Life';
            // Clear tag selection highlight
            tagCells.forEach(c => c.style.backgroundColor = 'transparent');
            currentSelectedTag = null;
        }, 2000);
    } else {
        actionBtn.innerText = "FAILED";
        actionBtn.disabled = false;
        actionBtn.style.backgroundColor = "#ff003c";
    }
});

// Initial Load
window.addEventListener('DOMContentLoaded', updatePercentages);