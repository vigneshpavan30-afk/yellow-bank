/**
 * Clear Authentication Slots Function
 * 
 * Clears authentication-related slots when user requests phone number change.
 * This function is triggered when the user says things like:
 * - "Wait, that's my old number"
 * - "I want to check for a different number"
 * 
 * @param {Object} slots - Current slot values
 * @returns {Object} Updated slots with cleared authentication data
 */
function clearAuthSlots(slots) {
  try {
    // Create a copy of slots to avoid mutation
    const updatedSlots = { ...slots };
    
    // Clear authentication slots
    updatedSlots.phoneNumber = null;
    updatedSlots.dob = null;
    updatedSlots.otp = null;
    updatedSlots.otpVerified = false;
    updatedSlots.otpRetryCount = 0;
    
    // Retain intent and other non-auth slots
    // selectedAccountId, loanAccounts, etc. are kept if needed
    
    return {
      success: true,
      slots: updatedSlots,
      message: "Authentication slots cleared. Please provide your current phone number."
    };
    
  } catch (error) {
    console.error('Error clearing auth slots:', error);
    return {
      success: false,
      slots: slots,
      message: "Error occurred while clearing authentication data.",
      error: error.message
    };
  }
}

// Export for use in Yellow.ai workflow
module.exports = clearAuthSlots;

// For direct testing
if (typeof window === 'undefined' && require.main === module) {
  const testSlots = {
    phoneNumber: "9876543210",
    dob: "15/01/1990",
    otp: "1234",
    otpVerified: true,
    otpRetryCount: 0,
    selectedAccountId: null,
    intent: "view_loan_details"
  };
  
  const result = clearAuthSlots(testSlots);
  console.log('Cleared slots:', JSON.stringify(result, null, 2));
}
