/**
 * Yellow Bank - Frontend Application
 * Connects to the banking agent backend
 */

const API_BASE_URL = 'http://localhost:3001';
// Use relative URLs for Vercel, localhost for local development
const AGENT_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3002' 
    : '/api';

let agentState = {
    currentStep: 'idle',
    phoneNumber: null,
    dob: null,
    otpValue: null,
    loanAccounts: [],
    selectedAccountId: null,
    loanDetails: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    userInput.focus();
    
    // Show welcome message
    showWelcomeMessage();
});

// Handle Enter key
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Send message to agent
async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (!message) return;

    const lower = message.toLowerCase();

    // Handle restart command locally
    if (lower === 'restart' || lower === 'reset') {
        // Add user message
        addMessage('user', message);
        input.value = '';
        await resetConversation();
        return;
    }
    
    // Hide welcome message
    document.getElementById('welcomeMessage').style.display = 'none';
    
    // Add user message to chat
    addMessage('user', message);
    
    // Clear input
    input.value = '';
    
    // Show loading
    const loadingId = addMessage('agent', 'Thinking...', true);
    
    try {
        // Call agent API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${AGENT_API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message,
                state: agentState // Send current state with request
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove loading
        removeMessage(loadingId);
        
        // Handle response
        handleAgentResponse(data);
        
    } catch (error) {
        removeMessage(loadingId);
        if (error.name === 'AbortError') {
            addMessage('agent', "Request timed out. Please try again.");
        } else {
            addMessage('agent', "I'm experiencing a technical issue. Please try again.");
        }
    }
}

// Handle agent response
function handleAgentResponse(response) {
    // Update state
    if (response.state) {
        agentState = { ...agentState, ...response.state };
    }
    
    // Add agent message
    if (response.message) {
        addMessage('agent', response.message);
        
        // Show OTP if provided (for testing)
        if (response.otpValue) {
            showOTP(response.otpValue);
        }
    }
    
    // Handle different response types
    if (response.action === 'show_accounts') {
        console.log('show_accounts action received:', response);
        console.log('Accounts array:', response.accounts);
        console.log('Accounts length:', response.accounts ? response.accounts.length : 0);
        
        if (response.accounts && response.accounts.length > 0) {
            showLoanAccounts(response.accounts);
        } else {
            console.error('No accounts in response or empty array!');
            addMessage('agent', 'No loan accounts found. Please contact support.');
        }
    }
    
    if (response.action === 'show_details' && response.details) {
        showLoanDetails(response.details);
    }
    
    // Update quick actions
    updateQuickActions(response);
}

// Add message to chat
function addMessage(sender, text, isLoading = false) {
    const messagesContainer = document.getElementById('messages');
    const messageId = 'msg-' + Date.now();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.id = messageId;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (isLoading) {
        contentDiv.innerHTML = '<span class="loading"></span> ' + text;
    } else {
        contentDiv.textContent = text;
    }
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    scrollToBottom();
    
    return messageId;
}

// Remove message
function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

// Show OTP (for testing)
function showOTP(otp) {
    const messagesContainer = document.getElementById('messages');
    const otpDiv = document.createElement('div');
    otpDiv.className = 'message-otp';
    otpDiv.innerHTML = `🔐 <strong>TEST MODE</strong><br>Generated OTP: <span style="font-size: 24px; color: #FF6B6B;">${otp}</span>`;
    messagesContainer.appendChild(otpDiv);
    scrollToBottom();
}

// Show loan accounts
function showLoanAccounts(accounts) {
    console.log('showLoanAccounts called with:', accounts);
    console.log('Accounts count:', accounts ? accounts.length : 0);
    
    if (!accounts || accounts.length === 0) {
        console.error('showLoanAccounts: No accounts provided!');
        addMessage('agent', 'No loan accounts found. Please contact support.');
        return;
    }
    
    const container = document.getElementById('loanAccountsContainer');
    const grid = document.getElementById('loanAccountsGrid');
    
    if (!container || !grid) {
        console.error('showLoanAccounts: Container or grid not found!');
        console.error('Container exists:', !!container, 'Grid exists:', !!grid);
        return;
    }
    
    // Clear grid first
    grid.innerHTML = '';
    
    // Process and add accounts
    let cardsAdded = 0;
    accounts.forEach((account, index) => {
        console.log(`Processing account ${index}:`, account);
        
        // Support multiple field name formats
        const loanAccountId = account.loan_account_id || account.accountNumber || account.account_id || account.id;
        
        if (!loanAccountId) {
            console.warn(`Skipping account ${index} - missing ID:`, account);
            return;
        }
        
        const card = document.createElement('div');
        card.className = 'loan-account-card';
        card.onclick = () => {
            console.log('Account card clicked:', loanAccountId);
            selectAccount(loanAccountId);
        };
        
        const typeOfLoan = account.type_of_loan || account.accountType || account.type || 'Unknown Loan';
        const tenure = account.tenure || account.tenure_years || account.duration || 'N/A';
        
        card.innerHTML = `
            <h4>${typeOfLoan}</h4>
            <p>Tenure: ${tenure}</p>
            <div class="loan-account-id">${loanAccountId}</div>
        `;
        
        grid.appendChild(card);
        cardsAdded++;
        console.log(`Added account card ${index}: ${typeOfLoan} (${loanAccountId})`);
    });
    
    console.log('Total cards added:', cardsAdded, 'out of', accounts.length);
    
    if (cardsAdded === 0) {
        console.error('No valid account cards were created!');
        addMessage('agent', 'Unable to display loan accounts. Please contact support.');
        return;
    }
    
    // Show container AFTER adding all cards
    container.style.display = 'block';
    console.log('Loan accounts container displayed');
    
    // Force a reflow to ensure visibility
    container.offsetHeight;
    
    scrollToBottom();
    
    // Double-check visibility after a short delay
    setTimeout(() => {
        if (container.style.display === 'none') {
            console.warn('Container was hidden after display! Re-showing...');
            container.style.display = 'block';
        }
    }, 100);
}

// Select account
async function selectAccount(accountId) {
    console.log('Account selected:', accountId);
    
    // Hide accounts container IMMEDIATELY
    const accountsContainer = document.getElementById('loanAccountsContainer');
    if (accountsContainer) {
        accountsContainer.style.display = 'none';
        console.log('Loan accounts container hidden');
    }
    
    // Also hide the grid to ensure it's not visible
    const accountsGrid = document.getElementById('loanAccountsGrid');
    if (accountsGrid) {
        accountsGrid.innerHTML = '';
        console.log('Loan accounts grid cleared');
    }
    
    agentState.selectedAccountId = accountId;
    
    // Show loading
    const loadingId = addMessage('agent', 'Fetching loan details...', true);
    
    try {
        // Call agent to get loan details
        const response = await fetch(`${AGENT_API_URL}/select-account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                accountId,
                state: agentState // Send state for stateless serverless functions
            })
        });
        
        const data = await response.json();
        removeMessage(loadingId);
        
        // Update state if provided
        if (data.state) {
            agentState = { ...agentState, ...data.state };
        }
        
        if (data.details) {
            showLoanDetails(data.details);
        } else {
            addMessage('agent', data.message || 'Unable to fetch loan details.');
        }
        
    } catch (error) {
        console.error('Error:', error);
        removeMessage(loadingId);
        addMessage('agent', 'Error fetching loan details. Please try again.');
    }
}

// Show loan details
function showLoanDetails(details) {
    console.log('Showing loan details:', details);
    
    // Ensure loan accounts container is hidden (safety check)
    const accountsContainer = document.getElementById('loanAccountsContainer');
    if (accountsContainer) {
        accountsContainer.style.display = 'none';
    }
    
    const container = document.getElementById('loanDetailsContainer');
    const card = document.getElementById('loanDetailsCard');
    
    card.innerHTML = `
        <div class="detail-item">
            <label>Account ID</label>
            <value>${details.account_id}</value>
        </div>
        <div class="detail-item">
            <label>Tenure</label>
            <value>${details.tenure}</value>
        </div>
        <div class="detail-item">
            <label>Interest Rate</label>
            <value>${details.interest_rate}%</value>
        </div>
        <div class="detail-item">
            <label>Principal Pending</label>
            <value>₹${details.principal_pending}</value>
        </div>
        <div class="detail-item">
            <label>Interest Pending</label>
            <value>₹${details.interest_pending}</value>
        </div>
        <div class="detail-item">
            <label>Nominee</label>
            <value>${details.nominee}</value>
        </div>
    `;
    
    container.style.display = 'block';
    scrollToBottom();
}

// Update quick actions
function updateQuickActions(response) {
    const container = document.getElementById('quickActions');
    container.innerHTML = '';
    
    // Add quick action buttons based on response
    if (response.quickActions) {
        response.quickActions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'quick-action-btn';
            btn.textContent = action.label;
            btn.onclick = () => {
                document.getElementById('userInput').value = action.value;
                sendMessage();
            };
            container.appendChild(btn);
        });
    }
}

// Redirect to CSAT
function redirectToCSAT() {
    alert('Redirecting to CSAT survey...\n(In production, this would redirect to the CSAT agent)');
    // In production: window.location.href = CSAT_AGENT_URL;
}

// Scroll to bottom
function scrollToBottom() {
    const container = document.getElementById('chatContainer');
    container.scrollTop = container.scrollHeight;
}

// Reset conversation (clear UI + reset agent on server)
async function resetConversation() {
    try {
        // Call backend to reset agent state
        await fetch(`${AGENT_API_URL}/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error) {
        // Even if backend reset fails, still clear UI for user
        console.error('Error resetting agent:', error);
    }

    // Reset local state
    agentState = {
        currentStep: 'idle',
        phoneNumber: null,
        dob: null,
        otpValue: null,
        loanAccounts: [],
        selectedAccountId: null,
        loanDetails: null
    };

    // Clear messages
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';

    // Hide loan sections
    document.getElementById('loanAccountsContainer').style.display = 'none';
    document.getElementById('loanDetailsContainer').style.display = 'none';

    // Clear quick actions
    document.getElementById('quickActions').innerHTML = '';

    // Show welcome message again
    document.getElementById('welcomeMessage').style.display = 'block';

    // Add system message
    addMessage('agent', 'Conversation restarted. How can I help you?');

    scrollToBottom();
}

// Show welcome message
function showWelcomeMessage() {
    // Welcome message is shown by default in HTML
}
