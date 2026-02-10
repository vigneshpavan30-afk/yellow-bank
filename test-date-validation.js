// Quick test for date validation
function testDateValidation(dateString) {
  const dateMatch = dateString.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
  
  if (!dateMatch) {
    return { valid: false, reason: "Format mismatch" };
  }

  const day = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  const year = parseInt(dateMatch[3], 10); // Fixed: was dateMatch[4], should be dateMatch[3]

  // Validate month
  if (month < 1 || month > 12) {
    return { valid: false, reason: "Invalid month" };
  }

  // Validate day
  if (day < 1 || day > 31) {
    return { valid: false, reason: "Invalid day" };
  }

  // Check if date is valid
  const date = new Date(year, month - 1, day);
  console.log(`Testing ${day}/${month}/${year}:`, {
    created: date,
    yearMatch: date.getFullYear() === year,
    monthMatch: date.getMonth() === (month - 1),
    dayMatch: date.getDate() === day,
    actualYear: date.getFullYear(),
    actualMonth: date.getMonth() + 1,
    actualDay: date.getDate()
  });
  
  const isValidDate = date.getFullYear() === year && 
                      date.getMonth() === (month - 1) && 
                      date.getDate() === day;
  
  if (!isValidDate) {
    return { valid: false, reason: `Invalid date - created ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} from ${day}/${month}/${year}` };
  }

  // Check future date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  if (date > today) {
    return { valid: false, reason: "Future date" };
  }

  // Check age
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1);
  const dayDiff = today.getDate() - day;
  
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  
  if (age < 18) {
    return { valid: false, reason: "Under 18 years old" };
  }

  return { valid: true, age: age };
}

// Test cases
console.log("Testing date validation:");
console.log("22/03/2004:", testDateValidation("22/03/2004"));
console.log("31/02/2004:", testDateValidation("31/02/2004")); // Should be invalid
console.log("29/02/2004:", testDateValidation("29/02/2004")); // Should be valid (leap year)
console.log("29/02/2003:", testDateValidation("29/02/2003")); // Should be invalid (not leap year)
console.log("32/13/2004:", testDateValidation("32/13/2004")); // Should be invalid
console.log("15/01/1990:", testDateValidation("15/01/1990")); // Should be valid
