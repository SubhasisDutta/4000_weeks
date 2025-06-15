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
  chrome.storage.local.get(['dob', 'lifespan', 'totalWeeklyHours', 'netWorth'], function (items) {
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
    // Automatically calculate if all values are present
    if (items.dob && items.lifespan && items.netWorth) {
        performCalculation();
    } else {
        // If not all main calc inputs are there, we still want to update display with N/A
        performCalculation();
    }
  });

  // calculateBtn.addEventListener('click', performCalculation); // Removed
  dobInput.addEventListener('change', () => {
      // No need to check lifespanInput.value, performCalculation handles it
      performCalculation();
  });
  lifespanInput.addEventListener('input', () => {
      // No need to check dobInput.value, performCalculation handles it
      performCalculation();
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

  // function calculateWeeklyHours() removed entirely

  function performCalculation() {
    if (errorMessagesDiv) {
      errorMessagesDiv.textContent = '';
      errorMessagesDiv.style.display = 'none'; // Hide it by default
    }
    // resultDiv.style.color = 'black'; // color is handled by errorMessagesDiv or general result styling

    const dobString = dobInput.value;
    const lifespanYears = parseInt(lifespanInput.value, 10);
    // validatedNetWorth and actualTotalWeeklyHours will be retrieved later, only when needed.

    // 1. Initialization
    let displayRemainingWeeks = "N/A";
    let displayRemainingHours = "N/A";
    let displayHourWorth = "N/A";
    let displayFinancialFreedom = "N/A";

    // Initial state for other divs - REMOVED as these divs are gone
    // if (totalLifeHoursResultDiv) totalLifeHoursResultDiv.textContent = '';
    // if (weeklyHoursResultDiv) weeklyHoursResultDiv.textContent = '';

    const validatedNetWorth = getValidatedNetWorth(); // Get it once

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
        const currentDate = new Date();
        if (dob > currentDate) {
          if (errorMessagesDiv) {
            errorMessagesDiv.textContent = 'Date of birth cannot be in the future.';
            errorMessagesDiv.style.display = 'block'; // Show it
          }
        } else {
          // All primary inputs are valid enough to proceed with calculations
          const expectedDeathDate = new Date(dob);
          expectedDeathDate.setFullYear(dob.getFullYear() + lifespanYears);
          const remainingMilliseconds = expectedDeathDate - currentDate;
          // const remainingTotalHours = remainingMilliseconds / (1000 * 60 * 60); // No longer displayed
          const actualTotalWeeklyHours = getValidatedWeeklyHours();

          if (remainingMilliseconds < 0) {
            if (errorMessagesDiv) {
              errorMessagesDiv.textContent = 'You have lived past your expected lifespan!';
              errorMessagesDiv.style.display = 'block'; // Show it
            }
            // resultDiv.style.color = 'green'; // Style error message div directly if needed
            displayRemainingWeeks = "0";
            displayRemainingHours = "0";
            displayHourWorth = "N/A";
            displayFinancialFreedom = (validatedNetWorth * 0.01 / 12);
            // if (totalLifeHoursResultDiv) totalLifeHoursResultDiv.textContent = 'Approximately 0 total hours remaining.'; // Removed
          } else {
            const weeksInMs = 1000 * 60 * 60 * 24 * 7;
            const calculatedRemainingWeeks = Math.ceil(remainingMilliseconds / weeksInMs);
            const calculatedRemainingHours = calculatedRemainingWeeks * actualTotalWeeklyHours;

            displayRemainingWeeks = calculatedRemainingWeeks;
            displayRemainingHours = calculatedRemainingHours;

            if (calculatedRemainingHours > 0) {
              displayHourWorth = (validatedNetWorth / calculatedRemainingHours);
            } else {
              displayHourWorth = "N/A";
            }
            displayFinancialFreedom = (validatedNetWorth * 0.01 / 12);

            // if (totalLifeHoursResultDiv) { // Removed
            //   totalLifeHoursResultDiv.textContent = `Approximately ${remainingTotalHours.toLocaleString(undefined, {maximumFractionDigits: 0})} total hours remaining.`;
            //   totalLifeHoursResultDiv.style.color = 'black';
            // }
          }
          chrome.storage.local.set({
            dob: dobString,
            lifespan: lifespanYears.toString(),
            netWorth: validatedNetWorth.toString()
          });
          // calculateWeeklyHours(); // Removed call
        }
      }
    }

    // Management of Other Divs (Post-error check) - REMOVED as these divs are gone
    // if (errorMessagesDiv && errorMessagesDiv.textContent !== '') {
    //     if (totalLifeHoursResultDiv) totalLifeHoursResultDiv.textContent = '';
    //     if (weeklyHoursResultDiv) weeklyHoursResultDiv.textContent = '';
    // }

    // Final Update of Result Div (Consolidated)
    let line1 = `You have approximately : ${(typeof displayRemainingWeeks === 'number' ? displayRemainingWeeks.toLocaleString() : displayRemainingWeeks)} weeks (~ ${(typeof displayRemainingHours === 'number' ? displayRemainingHours.toLocaleString(undefined, {maximumFractionDigits: 0}) : displayRemainingHours)} hours) remaining.`;
    let line2 = `Each hour is worth: ${typeof displayHourWorth === 'number' ? '$' + displayHourWorth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : displayHourWorth}.`;
    let line3 = `Your Financial Freedom number (monthly): ${typeof displayFinancialFreedom === 'number' ? '$' + displayFinancialFreedom.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : displayFinancialFreedom}.`;

    resultDiv.innerHTML = `${line1}<br>${line2}<br>${line3}`;
  }
});
