document.addEventListener('DOMContentLoaded', function () {
  const dobInput = document.getElementById('dob');
  const lifespanInput = document.getElementById('lifespan');
  // calculateBtn selector removed
  const resultDiv = document.getElementById('result');
  const toggleInputsBtn = document.getElementById('toggleInputsBtn');
  const calculationInputsDiv = document.getElementById('calculationInputsDiv');
  const totalWeeklyHoursInput = document.getElementById('totalWeeklyHours');
  // weeklyHoursResultDiv selector removed
  // totalLifeHoursResultDiv selector removed
  const netWorthInput = document.getElementById('netWorth');
  // hourWorthResultDiv selector removed
  // financialFreedomResultDiv selector removed
  const errorMessagesDiv = document.getElementById('errorMessages');
  const monthSpendingInput = document.getElementById('monthSpendingInput');
  const monthSavingsInput = document.getElementById('monthSavingsInput');
  const annualReturnRateInput = document.getElementById('annualReturnRate');

  function getValidatedWeeklyHours() {
    let hours = parseInt(totalWeeklyHoursInput.value, 10);
    if (isNaN(hours) || hours < 1) {
      hours = 168; // Default if input is invalid
    }
    return hours;
  }

  function getValidatedNetWorth() {
    let netWorth = parseFloat(netWorthInput.value);
    if (isNaN(netWorth) || netWorth < 0) {
      netWorth = 1000000; // Default if input is invalid
    }
    return netWorth;
  }

  function getValidatedMonthSpending() {
    let spending = parseFloat(monthSpendingInput.value);
    if (isNaN(spending) || spending < 0) {
      spending = 0; // Default if input is invalid
    }
    return spending;
  }

  function getValidatedMonthSavings() {
    let savings = parseFloat(monthSavingsInput.value);
    if (isNaN(savings) || savings < 0) {
      savings = 0; // Default if input is invalid
    }
    return savings;
  }

  function getValidatedAnnualReturnRate() {
    let rate = parseFloat(annualReturnRateInput.value);
    if (isNaN(rate) || rate < 0) {
      rate = 1; // Default if input is invalid or negative
    }
    return rate / 100; // Convert percentage to decimal for calculations
  }

  // Function to toggle visibility of calculation inputs
  function toggleCalculationInputs() {
    if (toggleInputsBtn.checked) {
      calculationInputsDiv.style.display = 'block';
    } else {
      calculationInputsDiv.style.display = 'none';
    }
  }

  // Initial call to set the state based on checkbox (should be unchecked by default)
  toggleCalculationInputs();

  // Add event listener for the toggle button
  toggleInputsBtn.addEventListener('change', toggleCalculationInputs);

  // Load saved values
  chrome.storage.local.get(['dob', 'lifespan', 'totalWeeklyHours', 'netWorth', 'annualReturnRate', 'monthSpending', 'monthSavings'], function (items) {
    if (items.dob) {
      dobInput.value = items.dob;
    }
    if (items.lifespan) {
      lifespanInput.value = items.lifespan;
    }
    if (items.totalWeeklyHours) {
      totalWeeklyHoursInput.value = items.totalWeeklyHours;
    } else {
      totalWeeklyHoursInput.value = '168'; // Default value
    }
    if (items.netWorth) {
      netWorthInput.value = items.netWorth;
    } else {
      netWorthInput.value = '1000000'; // Default value
    }
    if (items.annualReturnRate) {
      annualReturnRateInput.value = items.annualReturnRate;
    } else {
      annualReturnRateInput.value = '1'; // Default value
    }
    if (items.monthSpending) {
      monthSpendingInput.value = items.monthSpending;
    } else {
      monthSpendingInput.value = '0'; // Default value
    }
    if (items.monthSavings) {
      monthSavingsInput.value = items.monthSavings;
    } else {
      monthSavingsInput.value = '0'; // Default value
    }
    // Automatically calculate if all values are present
    // No need to check for monthSpending and monthSavings here for initial calculation trigger,
    // as performCalculation will use their validated values (or defaults).
    if (items.dob && items.lifespan && items.netWorth) { // Keep this check simple, performCalculation handles detailed logic
        performCalculation();
    } else {
        // If not all main calc inputs are there, we still want to update display with N/A or defaults
        performCalculation();
    }
  });

  // calculateBtn.addEventListener('click', performCalculation); // Removed
  dobInput.addEventListener('change', () => {
      chrome.storage.local.set({ dob: dobInput.value }, () => {
          performCalculation();
      });
  });
  lifespanInput.addEventListener('input', () => {
      chrome.storage.local.set({ lifespan: lifespanInput.value }, () => {
          performCalculation();
      });
  });
  totalWeeklyHoursInput.addEventListener('input', () => {
    const value = totalWeeklyHoursInput.value;
    chrome.storage.local.set({ totalWeeklyHours: value }, () => {
        // Call performCalculation directly, it handles checks
        performCalculation();
    });
  });
  netWorthInput.addEventListener('input', () => {
    const value = netWorthInput.value;
    chrome.storage.local.set({ netWorth: value }, () => {
        // Call performCalculation directly, it handles checks
        performCalculation();
    });
  });

  monthSpendingInput.addEventListener('input', () => {
    // No need for explicit validation before saving, performCalculation will handle display
    chrome.storage.local.set({ monthSpending: monthSpendingInput.value }, () => {
        performCalculation();
    });
  });

  monthSavingsInput.addEventListener('input', () => {
    // No need for explicit validation before saving, performCalculation will handle display
    chrome.storage.local.set({ monthSavings: monthSavingsInput.value }, () => {
        performCalculation();
    });
  });

  annualReturnRateInput.addEventListener('input', () => {
    chrome.storage.local.set({ annualReturnRate: annualReturnRateInput.value }, () => {
        performCalculation();
    });
  });

  // function calculateWeeklyHours() removed entirely

  function performCalculation() {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDate = new Date(); // Moved to top
    let displayTodaysDate = `${monthsOfYear[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()} (${daysOfWeek[currentDate.getDay()]})`; // Calculated immediately

    if (errorMessagesDiv) {
      errorMessagesDiv.textContent = '';
      errorMessagesDiv.style.display = 'none'; // Hide it by default
    }
    // resultDiv.style.color = 'black'; // color is handled by errorMessagesDiv or general result styling

    const dobString = dobInput.value;
    const lifespanYears = parseInt(lifespanInput.value, 10);
    // validatedNetWorth and actualTotalWeeklyHours will be retrieved later, only when needed.

    // 1. Initialization of input-dependent variables
    let displayRemainingWeeks = "N/A";
    let displayRemainingHours = "N/A";
    let displayHourWorth = "N/A";
    let displayFinancialFreedom = "N/A";
    let displayAmountNeeded = "N/A";
    let displayExpense = "N/A";
    let displayExpectedDayOfPassing = "N/A";
    // displayTodaysDate is already set
    let displayProgressBar = ""; // Initialize progress bar display

    // Initial state for other divs - REMOVED as these divs are gone
    // if (totalLifeHoursResultDiv) totalLifeHoursResultDiv.textContent = '';
    // if (weeklyHoursResultDiv) weeklyHoursResultDiv.textContent = '';

    const validatedNetWorth = getValidatedNetWorth(); // Get it once
    const validatedAnnualReturnRate = getValidatedAnnualReturnRate();
    const monthSpending = getValidatedMonthSpending();
    const monthSavings = getValidatedMonthSavings();
    const expense = monthSpending - monthSavings; // Calculate expense here

    if (!dobString) {
      if (errorMessagesDiv) {
        errorMessagesDiv.textContent = 'Please enter your date of birth.';
        errorMessagesDiv.style.display = 'block'; // Show it
      }
    } else if (isNaN(lifespanYears) || lifespanYears <= 0) {
      if (errorMessagesDiv) {
        errorMessagesDiv.textContent = 'Please enter a valid lifespan in years.';
        errorMessagesDiv.style.display = 'block'; // Show it
      }
    } else {
      const dob = new Date(dobString);
      if (isNaN(dob.getTime())) {
        if (errorMessagesDiv) {
          errorMessagesDiv.textContent = 'Invalid date of birth format.';
          errorMessagesDiv.style.display = 'block'; // Show it
        }
      } else {
        // currentDate is already defined at the top of performCalculation
        if (dob > currentDate) { // currentDate here refers to the one from the top
          if (errorMessagesDiv) {
            errorMessagesDiv.textContent = 'Date of birth cannot be in the future.';
            errorMessagesDiv.style.display = 'block'; // Show it
          }
        } else {
          // All primary inputs are valid enough to proceed with calculations
          // displayTodaysDate is already set using currentDate from the top
          const expectedDeathDate = new Date(dob);
          expectedDeathDate.setFullYear(dob.getFullYear() + lifespanYears);
          // Format Expected Day of Passing here
          displayExpectedDayOfPassing = `${monthsOfYear[expectedDeathDate.getMonth()]} ${expectedDeathDate.getDate()}, ${expectedDeathDate.getFullYear()}`;

          const remainingMilliseconds = expectedDeathDate - currentDate;
          // const remainingTotalHours = remainingMilliseconds / (1000 * 60 * 60); // No longer displayed
          const actualTotalWeeklyHours = getValidatedWeeklyHours();

          // Expense and AmountNeeded are calculated regardless of remainingMilliseconds (as long as DOB/Lifespan valid)
          displayExpense = `<b>$${expense.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</b>`;

          let rawAmountNeeded;
          let amountNeededText = "N/A"; // Default text for display

          if (validatedAnnualReturnRate > 0 && expense > 0) {
              rawAmountNeeded = (expense * 12) / validatedAnnualReturnRate;
              amountNeededText = `<b>$${rawAmountNeeded.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</b>`;
          } else if (expense > 0 && validatedAnnualReturnRate <= 0) {
              rawAmountNeeded = Infinity; // Mark as infinitely large
              amountNeededText = "<b>N/A (Return rate must be > 0%)</b>";
          } else { // expense <= 0
              rawAmountNeeded = 0; // No expenses to cover
              amountNeededText = `<b>$0.00</b>`;
          }
          displayAmountNeeded = amountNeededText;

          // Progress Bar Calculation
          let netWorthDisplay = validatedNetWorth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
          let progressPercentage = 0;
          let amountNeededDisplayForBar;

          if (rawAmountNeeded === Infinity) {
              amountNeededDisplayForBar = "Aim: N/A (Return > 0%)";
              progressPercentage = 0;
          } else if (rawAmountNeeded > 0) {
              amountNeededDisplayForBar = `Aim: $${rawAmountNeeded.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
              progressPercentage = (validatedNetWorth / rawAmountNeeded) * 100;
          } else { // rawAmountNeeded is 0 (or less)
              amountNeededDisplayForBar = "Aim: $0.00";
              progressPercentage = validatedNetWorth > 0 ? 100 : 0;
          }
          progressPercentage = Math.min(progressPercentage, 100);
          progressPercentage = Math.max(progressPercentage, 0);

          // Construct Progress Bar HTML
          if (rawAmountNeeded === Infinity) {
              displayProgressBar = `
                <div id="progress-bar-container">
                  <div id="progress-bar-text-details">
                    Progress: <b>$${netWorthDisplay}</b> / ${amountNeededDisplayForBar}
                  </div>
                  <div id="progress-bar-outer">
                    <div id="progress-bar-inner" style="width: 0%;">
                      <b>0%</b>
                    </div>
                  </div>
                </div>`;
          } else if (rawAmountNeeded > 0) {
              displayProgressBar = `
                <div id="progress-bar-container">
                  <div id="progress-bar-text-details">
                    Progress: <b>$${netWorthDisplay}</b> / ${amountNeededDisplayForBar.replace("Aim: ", "")}
                  </div>
                  <div id="progress-bar-outer">
                    <div id="progress-bar-inner" style="width: ${progressPercentage.toFixed(2)}%;">
                      <b>${progressPercentage.toFixed(2)}%</b>
                    </div>
                  </div>
                </div>`;
          } else { // rawAmountNeeded is 0 (or less)
              displayProgressBar = `
                <div id="progress-bar-container">
                  <div id="progress-bar-text-details">
                    Current Net Worth: <b>$${netWorthDisplay}</b> (${amountNeededDisplayForBar})
                  </div>
                  <div id="progress-bar-outer">
                    <div id="progress-bar-inner" style="width: ${progressPercentage.toFixed(2)}%;">
                      <b>${progressPercentage.toFixed(2)}%</b>
                    </div>
                  </div>
                </div>`;
          }

          if (remainingMilliseconds < 0) {
            if (errorMessagesDiv) {
              errorMessagesDiv.textContent = 'You have lived past your expected lifespan!';
              errorMessagesDiv.style.display = 'block'; // Show it
            }
            displayRemainingWeeks = "<b>0</b>";
            displayRemainingHours = "<b>0</b>";
            displayHourWorth = "N/A"; // Still N/A as there are no remaining hours to calculate worth against
            displayFinancialFreedom = `<b>$${(validatedNetWorth * validatedAnnualReturnRate / 12).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</b>`;
            // displayExpense and displayAmountNeeded already calculated and bolded above
          } else {
            const weeksInMs = 1000 * 60 * 60 * 24 * 7;
            const calculatedRemainingWeeks = Math.ceil(remainingMilliseconds / weeksInMs);
            const calculatedRemainingHours = calculatedRemainingWeeks * actualTotalWeeklyHours;

            displayRemainingWeeks = `<b>${calculatedRemainingWeeks.toLocaleString()}</b>`;
            displayRemainingHours = `<b>${calculatedRemainingHours.toLocaleString(undefined, {maximumFractionDigits: 0})}</b>`;

            if (calculatedRemainingHours > 0) {
              displayHourWorth = `<b>$${(validatedNetWorth / calculatedRemainingHours).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</b>`;
            } else {
              displayHourWorth = "N/A"; // Keep as N/A if no hours left or invalid
            }
            displayFinancialFreedom = `<b>$${(validatedNetWorth * validatedAnnualReturnRate / 12).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</b>`;
            // displayExpense and displayAmountNeeded already calculated and bolded above

            // if (totalLifeHoursResultDiv) { // Removed
            //   totalLifeHoursResultDiv.textContent = `Approximately ${remainingTotalHours.toLocaleString(undefined, {maximumFractionDigits: 0})} total hours remaining.`;
            //   totalLifeHoursResultDiv.style.color = 'black';
            // }
          }
          chrome.storage.local.set({
            dob: dobString,
            lifespan: lifespanYears.toString(),
            netWorth: validatedNetWorth.toString(),
            monthSpending: monthSpending.toString(),
            monthSavings: monthSavings.toString()
          });
          // calculateWeeklyHours(); // Removed call
        }
      }
    }
    // If primary calculations failed, amountNeeded and expense should also be N/A
    // If primary calculations failed, many displays revert to "N/A"
    // Also, if primary calculations failed, the progress bar should reflect this.
    if (errorMessagesDiv && errorMessagesDiv.textContent !== '') {
        displayAmountNeeded = "N/A";
        displayExpense = "N/A";
        displayExpectedDayOfPassing = "N/A"; // Ensure this is N/A on error
        // displayTodaysDate is set unconditionally at the start, so it will always show current date.

        // Fallback for progress bar if core calculations failed
        let netWorthDisplayOnError = validatedNetWorth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        displayProgressBar = `
          <div id="progress-bar-container">
            <div id="progress-bar-text-details">
              Current Net Worth: <b>$${netWorthDisplayOnError}</b> (Calculation error occurred)
            </div>
            <div id="progress-bar-outer">
              <div id="progress-bar-inner" style="width: 0%;">
                <b>0%</b>
              </div>
            </div>
          </div>`;
        // Other specific displays like weeks, hours, hourworth, financialfreedom are set to "N/A"
        // by default or specifically in error conditions.
    }


    // Management of Other Divs (Post-error check) - REMOVED as these divs are gone
    // if (errorMessagesDiv && errorMessagesDiv.textContent !== '') {
    //     if (totalLifeHoursResultDiv) totalLifeHoursResultDiv.textContent = '';
    //     if (weeklyHoursResultDiv) weeklyHoursResultDiv.textContent = '';
    // }

    // Final Update of Result Div (Consolidated)
    let line1 = `You have REMAINING : ${displayRemainingWeeks} weeks (~ ${displayRemainingHours} hours).`;
    let line2 = `Each hour is worth: ${displayHourWorth}.`;
    let line3 = `Auto Income: ${displayFinancialFreedom}.`;
    let line4 = `Monthly Expense: ${displayExpense}.`;
    let line5 = `Freedom Aim : ${displayAmountNeeded}`;
    // Progress bar (displayProgressBar) is a full HTML block, so no <br> needed after line5 if progress bar is present.
    // However, to ensure spacing if it were empty, but it always generates a div.
    // Add <br> before displayProgressBar for spacing from line5.
    let line6 = "<hr>";
    let line7 = `Today's Date: ${displayTodaysDate}`;
    let line8 = `Expected Day of Passing: ${displayExpectedDayOfPassing}`;

    resultDiv.innerHTML = `${line1}<br>${line2}<br>${line3}<br>${line4}<br>${line5}<br>${displayProgressBar}${line6}${line7}<br>${line8}`;
  }
});
