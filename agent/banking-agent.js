/**
 * Yellow Bank - AI Banking Agent
 * Complete implementation of the banking agent logic
 */

let fetch = require('node-fetch');

// Allow fetch to be mocked for testing
if (typeof global.fetch === 'function') {
  fetch = global.fetch;
}

class BankingAgent {
  constructor() {
    this.state = {
      phoneNumber: null,
      dob: null,
      otp: null,
      otpValue: null,
      otpVerified: false,
      otpRetryCount: 0,
      selectedAccountId: null,
      loanAccounts: [],
      loanDetails: null,
      currentStep: 'idle',
      intent: null
    };
    
    this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    this.maxOtpRetries = 2;
  }

  /**
   * Process user message and return agent response
   */
  async processMessage(userMessage) {
    const message = userMessage.trim().toLowerCase();

    // Language check
    if (!this.isEnglish(message)) {
      return {
        message: "I apologize, but I'm restricted to operating in English only. Please continue our conversation in English.",
        action: 'wait_for_input'
      };
    }

    // Intent recognition
    if (this.isLoanDetailsIntent(message)) {
      this.state.intent = 'view_loan_details';
      this.state.currentStep = 'collecting_phone';
      return {
        message: "To access your loan details, I'll need to verify your identity. Please provide your registered phone number.",
        action: 'collect_phone',
        nextStep: 'collecting_phone'
      };
    }

    // Phone number correction
    if (this.isPhoneNumberCorrection(message)) {
      return await this.handlePhoneNumberCorrection();
    }

    // Handle based on current step
    switch (this.state.currentStep) {
      case 'collecting_phone':
        return await this.handlePhoneNumber(message);
      
      case 'collecting_dob':
        return await this.handleDOB(message);
      
      case 'verifying_otp':
        return await this.handleOTP(message);
      
      case 'showing_accounts':
        return await this.handleAccountSelection(message);
      
      case 'showing_details':
        return await this.handleDetailsView(message);
      
      default:
        // If no specific step, check if it's a general banking query
        if (message.includes('help') || message.includes('what can you do')) {
          return {
            message: "I can help you check your loan account details. Would you like to view your loan information?",
            action: 'wait_for_input'
          };
        }
        return {
          message: "Try saying: 'I want to check my bank details'",
          action: 'wait_for_input'
        };
    }
  }

  /**
   * Check if message is in English
   */
  isEnglish(message) {
    // Allow dates (DD/MM/YYYY or DD-MM-YYYY), phone numbers, OTPs, and account IDs
    const datePattern = /^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/;
    const phonePattern = /^\d{10}$/;
    const otpPattern = /^\d{4}$/;
    const accountIdPattern = /^LA\d{6}$/i;
    const numberPattern = /^\d+$/;
    
    // If it's a date, phone, OTP, account ID, or just numbers, allow it
    if (datePattern.test(message) || phonePattern.test(message) || 
        otpPattern.test(message) || accountIdPattern.test(message) || 
        numberPattern.test(message)) {
      return true;
    }
    
    // For text, check if it contains mostly English characters
    const englishPattern = /^[a-zA-Z0-9\s.,!?'-]+$/;
    return englishPattern.test(message);
  }

  /**
   * Intent recognition for loan details
   */
  isLoanDetailsIntent(message) {
    const patterns = [
      'loan details',
      'check loan',
      'view loan',
      'show loan',
      'loan information',
      'loan account',
      'bank details',
      'check bank',
      'view bank',
      'show bank',
      'bank information',
      'account details',
      'check account',
      'view account',
      'show account',
      'my details',
      'account information'
    ];
    return patterns.some(pattern => message.includes(pattern));
  }

  /**
   * Check for phone number correction intent
   */
  isPhoneNumberCorrection(message) {
    const patterns = [
      "that's my old number",
      "that's not my current number",
      "wrong number",
      "different number",
      "change my phone number",
      "update my phone number"
    ];
    return patterns.some(pattern => message.includes(pattern));
  }

  /**
   * Handle phone number correction
   */
  async handlePhoneNumberCorrection() {
    // Clear authentication slots
    this.state.phoneNumber = null;
    this.state.dob = null;
    this.state.otp = null;
    this.state.otpVerified = false;
    this.state.otpRetryCount = 0;
    
    // Retain intent
    this.state.intent = 'view_loan_details';
    this.state.currentStep = 'collecting_phone';
    
    return {
      message: "No problem! Let me update your information. Please provide your current registered phone number.",
      action: 'collect_phone',
      nextStep: 'collecting_phone'
    };
  }

  /**
   * Handle phone number collection
   */
  async handlePhoneNumber(message) {
    const phoneNumber = message.replace(/\D/g, ''); // Extract digits only
    
    if (phoneNumber.length !== 10) {
      return {
        message: "The phone number format appears incorrect. Please provide a valid 10-digit phone number.",
        action: 'retry_phone',
        nextStep: 'collecting_phone'
      };
    }

    this.state.phoneNumber = phoneNumber;
    this.state.currentStep = 'collecting_dob';
    
    return {
      message: "Thank you. Now, please provide your date of birth (format: DD/MM/YYYY or DD-MM-YYYY).",
      action: 'collect_dob',
      nextStep: 'collecting_dob'
    };
  }

  /**
   * Handle DOB collection
   */
  async handleDOB(message) {
    // Parse date formats: DD/MM/YYYY or DD-MM-YYYY
    const dateMatch = message.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    
    if (!dateMatch) {
      return {
        message: "Please provide your date of birth in DD/MM/YYYY or DD-MM-YYYY format.",
        action: 'retry_dob',
        nextStep: 'collecting_dob'
      };
    }

    // Extract date components
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const year = parseInt(dateMatch[3], 10); // Fixed: was dateMatch[4], should be dateMatch[3]

    // Validate date components
    if (month < 1 || month > 12) {
      return {
        message: "Invalid date. Month must be between 01 and 12. Please provide your date of birth in DD/MM/YYYY or DD-MM-YYYY format.",
        action: 'retry_dob',
        nextStep: 'collecting_dob'
      };
    }

    if (day < 1 || day > 31) {
      return {
        message: "Invalid date. Day must be between 01 and 31. Please provide your date of birth in DD/MM/YYYY or DD-MM-YYYY format.",
        action: 'retry_dob',
        nextStep: 'collecting_dob'
      };
    }

    // Check if date is valid (handles leap years, different month lengths)
    // Use local date to properly validate
    const date = new Date(year, month - 1, day);
    const isValidDate = date.getFullYear() === year && 
                        date.getMonth() === (month - 1) && 
                        date.getDate() === day;
    
    if (!isValidDate) {
      return {
        message: "Invalid date. Please provide a valid date of birth in DD/MM/YYYY or DD-MM-YYYY format (e.g., 15/01/1990).",
        action: 'retry_dob',
        nextStep: 'collecting_dob'
      };
    }

    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    if (date > today) {
      return {
        message: "Invalid date. Date of birth cannot be in the future. Please provide a valid date of birth.",
        action: 'retry_dob',
        nextStep: 'collecting_dob'
      };
    }

    // Check if date is too old (reasonable age limit, e.g., 150 years)
    const minYear = today.getFullYear() - 150;
    if (year < minYear) {
      return {
        message: "Invalid date. Please provide a valid date of birth.",
        action: 'retry_dob',
        nextStep: 'collecting_dob'
      };
    }

    // Check if person is too young (e.g., must be at least 18 years old for banking)
    // Calculate age more accurately (accounting for whether birthday has passed)
    let age = today.getFullYear() - year;
    const monthDiff = today.getMonth() - (month - 1);
    const dayDiff = today.getDate() - day;
    
    // If birthday hasn't occurred this year, subtract 1 from age
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    
    if (age < 18) {
      return {
        message: "You must be at least 18 years old to access banking services. Please provide a valid date of birth.",
        action: 'retry_dob',
        nextStep: 'collecting_dob'
      };
    }

    this.state.dob = message;
    this.state.currentStep = 'triggering_otp';
    
    // Trigger OTP
    try {
      const otpResult = await this.triggerOTP();
      if (otpResult.success) {
        this.state.otpValue = otpResult.otp;
        this.state.currentStep = 'verifying_otp';
        return {
          message: "An OTP has been sent to your registered phone number. Please provide the OTP you received.",
          action: 'collect_otp',
          nextStep: 'verifying_otp',
          otpValue: otpResult.otp // For testing purposes
        };
      } else {
        return {
          message: "I'm experiencing a technical issue. Please try again in a moment, or contact our support team.",
          action: 'error',
          nextStep: 'collecting_dob'
        };
      }
    } catch (error) {
      return {
        message: "I'm experiencing a technical issue. Please try again in a moment, or contact our support team.",
        action: 'error',
        nextStep: 'collecting_dob'
      };
    }
  }

  /**
   * Trigger OTP API
   */
  async triggerOTP() {
    try {
      const apiKey = process.env.YB_API_KEY || 'AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY';
      
      const response = await fetch(`${this.apiBaseUrl}/trigger-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          phoneNumber: this.state.phoneNumber,
          dob: this.state.dob
        })
      });

      if (!response.ok) {
        return {
          success: false,
          error: `API error: ${response.status}`
        };
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.otp) {
        return {
          success: true,
          otp: data.otp
        };
      } else {
        return {
          success: false,
          error: data.message || 'OTP trigger failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }

  /**
   * Handle OTP verification
   */
  async handleOTP(message) {
    const userOTP = message.replace(/\D/g, ''); // Extract digits only
    
    if (userOTP.length !== 4) {
      return {
        message: "Please provide a valid 4-digit OTP.",
        action: 'retry_otp',
        nextStep: 'verifying_otp'
      };
    }

    // Verify OTP
    const isValid = this.verifyOTP(userOTP, this.state.otpValue);
    
    if (isValid) {
      this.state.otpVerified = true;
      this.state.otpRetryCount = 0;
      this.state.currentStep = 'fetching_accounts';
      
      // Fetch loan accounts
      try {
        const accountsResult = await this.getLoanAccounts();
        if (accountsResult.success) {
          this.state.loanAccounts = accountsResult.accounts;
          this.state.currentStep = 'showing_accounts';
          
          return {
            message: "Here are your loan accounts. Please select one to view details:",
            action: 'show_accounts',
            nextStep: 'showing_accounts',
            accounts: accountsResult.accounts,
            drmType: 'interactive_cards'
          };
        } else {
          return {
            message: "Unable to retrieve your loan accounts at this time. Please try again later or contact support.",
            action: 'error',
            nextStep: 'idle'
          };
        }
      } catch (error) {
        return {
          message: "Unable to retrieve your loan accounts at this time. Please try again later or contact support.",
          action: 'error',
          nextStep: 'idle'
        };
      }
    } else {
      this.state.otpRetryCount++;
      
      if (this.state.otpRetryCount >= this.maxOtpRetries) {
        // Max retries reached - restart authentication
        this.state.phoneNumber = null;
        this.state.dob = null;
        this.state.otp = null;
        this.state.otpValue = null;
        this.state.otpRetryCount = 0;
        this.state.currentStep = 'collecting_phone';
        
        return {
          message: "Maximum OTP retry attempts reached. Please start over. To access your loan details, please provide your registered phone number.",
          action: 'restart_auth',
          nextStep: 'collecting_phone'
        };
      } else {
        return {
          message: `The OTP you entered is incorrect. Please try again. (Attempt ${this.state.otpRetryCount}/${this.maxOtpRetries})`,
          action: 'retry_otp',
          nextStep: 'verifying_otp'
        };
      }
    }
  }

  /**
   * Verify OTP
   */
  verifyOTP(userOTP, generatedOTP) {
    const validOTPs = ["1234", "5678", "7889", "1209"];
    const normalizedUserOTP = String(userOTP).trim();
    const normalizedGeneratedOTP = String(generatedOTP).trim();
    
    return validOTPs.includes(normalizedUserOTP) && 
           normalizedUserOTP === normalizedGeneratedOTP;
  }

  /**
   * Get loan accounts with token optimization
   */
  async getLoanAccounts() {
    try {
      const apiKey = process.env.YB_API_KEY || '';
      const response = await fetch(`${this.apiBaseUrl}/get-loan-accounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const rawData = await response.json();
      
      // Apply token optimization projection
      const projectedData = this.projectLoanAccounts(rawData);
      
      return {
        success: true,
        accounts: projectedData.accounts
      };
    } catch (error) {
      console.error('Get loan accounts error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Token optimization: Project loan accounts
   */
  projectLoanAccounts(apiResponse) {
    try {
      const accounts = apiResponse.accounts || [];
      
      const projectedAccounts = accounts
        .filter(account => account && account.loan_account_id)
        .map(account => ({
          loan_account_id: account.loan_account_id || '',
          type_of_loan: account.type_of_loan || 'N/A',
          tenure: account.tenure || 'N/A'
        }));
      
      return {
        status: apiResponse.status || 'success',
        accounts: projectedAccounts,
        count: projectedAccounts.length
      };
    } catch (error) {
      console.error('Projection error:', error);
      return {
        status: 'error',
        accounts: [],
        count: 0
      };
    }
  }

  /**
   * Handle account selection
   */
  async handleAccountSelection(message) {
    // Extract account ID from message (could be from button click or typed)
    const accountIdMatch = message.match(/LA\d{6}/i) || message.match(/la\d{6}/i);
    
    if (!accountIdMatch) {
      // Check if it's a number selection (e.g., "1", "first", "select account 1")
      const numberMatch = message.match(/\d+/);
      if (numberMatch) {
        const index = parseInt(numberMatch[0]) - 1;
        if (index >= 0 && index < this.state.loanAccounts.length) {
          this.state.selectedAccountId = this.state.loanAccounts[index].loan_account_id;
        } else {
          return {
            message: "Please select a valid account from the list above.",
            action: 'retry_selection',
            nextStep: 'showing_accounts',
            accounts: this.state.loanAccounts
          };
        }
      } else {
        return {
          message: "Please select an account from the list above.",
          action: 'retry_selection',
          nextStep: 'showing_accounts',
          accounts: this.state.loanAccounts
        };
      }
    } else {
      this.state.selectedAccountId = accountIdMatch[0].toUpperCase();
    }

    // Fetch loan details
    this.state.currentStep = 'fetching_details';
    
    try {
      const detailsResult = await this.getLoanDetails(this.state.selectedAccountId);
      if (detailsResult.success) {
        this.state.loanDetails = detailsResult.details;
        this.state.currentStep = 'showing_details';
        
        return {
          message: "Your Loan Account Details:",
          action: 'show_details',
          nextStep: 'showing_details',
          details: detailsResult.details,
          drmType: 'quick_replies',
          csatUrl: process.env.CSAT_AGENT_URL || 'https://csat-agent.yellow.ai'
        };
      } else {
        return {
          message: "Unable to retrieve loan details. Please try again or contact support.",
          action: 'error',
          nextStep: 'showing_accounts'
        };
      }
    } catch (error) {
      return {
        message: "Unable to retrieve loan details. Please try again or contact support.",
        action: 'error',
        nextStep: 'showing_accounts'
      };
    }
  }

  /**
   * Get loan details
   */
  async getLoanDetails(accountId) {
    try {
      const apiKey = process.env.YB_API_KEY || '';
      const response = await fetch(`${this.apiBaseUrl}/get-loan-details?accountId=${accountId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        return {
          success: true,
          details: {
            account_id: data.account_id,
            tenure: data.tenure,
            interest_rate: data.interest_rate,
            principal_pending: data.principal_pending,
            interest_pending: data.interest_pending,
            nominee: data.nominee
          }
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to get loan details'
        };
      }
    } catch (error) {
      console.error('Get loan details error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle details view
   */
  handleDetailsView(message) {
    if (message.includes('rate') || message.includes('feedback') || message.includes('csat')) {
      return {
        message: "Redirecting to CSAT survey...",
        action: 'redirect_to_csat',
        csatUrl: process.env.CSAT_AGENT_URL || 'https://csat-agent.yellow.ai'
      };
    }
    
    return {
      message: "Is there anything else I can help you with?",
      action: 'wait_for_input'
    };
  }

  /**
   * Get current state (for debugging)
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Reset agent state
   */
  reset() {
    this.state = {
      phoneNumber: null,
      dob: null,
      otp: null,
      otpValue: null,
      otpVerified: false,
      otpRetryCount: 0,
      selectedAccountId: null,
      loanAccounts: [],
      loanDetails: null,
      currentStep: 'idle',
      intent: null
    };
  }
}

module.exports = BankingAgent;
