document.addEventListener('DOMContentLoaded', function () {
  const dobInput = document.getElementById('dob');
  const lifespanInput = document.getElementById('lifespan');
  const calculateBtn = document.getElementById('calculateBtn');
  const resultDiv = document.getElementById('result');
  const toggleInputsBtn = document.getElementById('toggleInputsBtn');
  const calculationInputsDiv = document.getElementById('calculationInputsDiv');
  const totalWeeklyHoursInput = document.getElementById('totalWeeklyHours');
  const weeklyHoursResultDiv = document.getElementById('weeklyHoursResult');
  const totalLifeHoursResultDiv = document.getElementById('totalLifeHoursResult');
  const netWorthInput = document.getElementById('netWorth');
  const hourWorthResultDiv = document.getElementById('hourWorthResult');
  const financialFreedomResultDiv = document.getElementById('financialFreedomResult');
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
    } else { // If not all main calc inputs are there, still try to calc weekly hours
        calculateWeeklyHours();
        // also clear financial results if not all inputs are present
        if (hourWorthResultDiv) hourWorthResultDiv.textContent = '';
        if (financialFreedomResultDiv) financialFreedomResultDiv.textContent = '';
    }
  });

  calculateBtn.addEventListener('click', performCalculation);
  dobInput.addEventListener('change', () => {
      if (lifespanInput.value) performCalculation();
  });
  lifespanInput.addEventListener('input', () => {
      if (dobInput.value) performCalculation();
  });
  totalWeeklyHoursInput.addEventListener('input', () => {
    const value = totalWeeklyHoursInput.value;
    chrome.storage.local.set({ totalWeeklyHours: value }, () => {
        calculateWeeklyHours(); // Always update weekly hours
        // If other fields are also valid, update the main calculation
        if (dobInput.value && lifespanInput.value) {
            performCalculation();
        }
    });
  });
  netWorthInput.addEventListener('input', () => {
    const value = netWorthInput.value;
    chrome.storage.local.set({ netWorth: value }, () => {
        // If other fields are also valid, update the main calculation
        if (dobInput.value && lifespanInput.value) {
            performCalculation();
        } else { // If main fields not valid, clear financial results
            if (hourWorthResultDiv) hourWorthResultDiv.textContent = '';
            if (financialFreedomResultDiv) financialFreedomResultDiv.textContent = '';
        }
    });
  });

  function calculateWeeklyHours() {
    const now = new Date();
    const totalConfiguredWeeklyHours = getValidatedWeeklyHours();

    const currentDay = now.getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6
    const dayOfWeek = (currentDay === 0) ? 6 : currentDay - 1; // Monday is 0, ..., Sunday is 6

    const hoursPassedInWeek = (dayOfWeek * 24) + now.getHours() + (now.getMinutes() / 60) + (now.getSeconds() / 3600);
    const remainingWeeklyHours = totalConfiguredWeeklyHours - hoursPassedInWeek;

    if (weeklyHoursResultDiv) {
        weeklyHoursResultDiv.textContent = `Hours remaining this week: ${remainingWeeklyHours.toFixed(2)}`;
        if (remainingWeeklyHours < 0) {
            weeklyHoursResultDiv.style.color = 'orange'; // Or some other indicator
        } else {
            weeklyHoursResultDiv.style.color = 'black';
        }
    }
  }

  function performCalculation() {
    if (errorMessagesDiv) errorMessagesDiv.textContent = '';
    resultDiv.style.color = 'black'; // Reset result color

    const dobString = dobInput.value;
    const lifespanYears = parseInt(lifespanInput.value, 10);
    // validatedNetWorth and actualTotalWeeklyHours will be retrieved later, only when needed.

    // 1. Initialization
    let displayRemainingWeeks = "N/A";
    let displayRemainingHours = "N/A";
    let displayHourWorth = "N/A";
    let displayFinancialFreedom = "N/A";

    // Initial state for other divs
    if (totalLifeHoursResultDiv) totalLifeHoursResultDiv.textContent = '';
    if (weeklyHoursResultDiv) weeklyHoursResultDiv.textContent = '';

    const validatedNetWorth = getValidatedNetWorth(); // Get it once for financial freedom if possible

    if (!dobString) {
      if (errorMessagesDiv) errorMessagesDiv.textContent = 'Please enter your date of birth.';
      // display variables remain "N/A"
    } else if (isNaN(lifespanYears) || lifespanYears <= 0) {
      if (errorMessagesDiv) errorMessagesDiv.textContent = 'Please enter a valid lifespan in years.';
      // display variables remain "N/A"
    } else {
      const dob = new Date(dobString);
      if (isNaN(dob.getTime())) {
        if (errorMessagesDiv) errorMessagesDiv.textContent = 'Invalid date of birth format.';
        // display variables remain "N/A"
      } else {
        const currentDate = new Date();
        if (dob > currentDate) {
          if (errorMessagesDiv) errorMessagesDiv.textContent = 'Date of birth cannot be in the future.';
          // display variables remain "N/A"
        } else {
          // All primary inputs are valid enough to proceed with calculations
          const expectedDeathDate = new Date(dob);
          expectedDeathDate.setFullYear(dob.getFullYear() + lifespanYears);
          const remainingMilliseconds = expectedDeathDate - currentDate;
          const remainingTotalHours = remainingMilliseconds / (1000 * 60 * 60);
          const actualTotalWeeklyHours = getValidatedWeeklyHours();

          if (remainingMilliseconds < 0) {
            // 3. "Lived Past Lifespan" Block
            if (errorMessagesDiv) errorMessagesDiv.textContent = 'You have lived past your expected lifespan!';
            resultDiv.style.color = 'green'; // Special color for this message in resultDiv
            displayRemainingWeeks = "0";
            displayRemainingHours = "0";
            displayHourWorth = "N/A";
            displayFinancialFreedom = (validatedNetWorth * 0.01 / 12);
            if (totalLifeHoursResultDiv) totalLifeHoursResultDiv.textContent = 'Approximately 0 total hours remaining.';
          } else {
            // 4. Main Calculation Block
            const weeksInMs = 1000 * 60 * 60 * 24 * 7;
            const calculatedRemainingWeeks = Math.ceil(remainingMilliseconds / weeksInMs);
            const calculatedRemainingHours = calculatedRemainingWeeks * actualTotalWeeklyHours;

            displayRemainingWeeks = calculatedRemainingWeeks; // Number
            displayRemainingHours = calculatedRemainingHours; // Number

            if (calculatedRemainingHours > 0) {
              displayHourWorth = (validatedNetWorth / calculatedRemainingHours); // Number
            } else {
              displayHourWorth = "N/A";
            }
            displayFinancialFreedom = (validatedNetWorth * 0.01 / 12); // Number

            if (totalLifeHoursResultDiv) {
              totalLifeHoursResultDiv.textContent = `Approximately ${remainingTotalHours.toLocaleString(undefined, {maximumFractionDigits: 0})} total hours remaining.`;
              totalLifeHoursResultDiv.style.color = 'black';
            }
          }
          // Save valid inputs (only if we got this far, meaning basic dates were valid)
          chrome.storage.local.set({
            dob: dobString,
            lifespan: lifespanYears.toString(),
            netWorth: validatedNetWorth.toString()
          });
          // Calculate and display weekly hours separately (only if dates were valid)
          calculateWeeklyHours();
        }
      }
    }

    // 6. Management of Other Divs (Post-error check)
    if (errorMessagesDiv && errorMessagesDiv.textContent !== '') {
        if (totalLifeHoursResultDiv) totalLifeHoursResultDiv.textContent = '';
        if (weeklyHoursResultDiv) weeklyHoursResultDiv.textContent = '';
    }


    // 5. Final Update of Result Divs
    resultDiv.textContent = `You have approximately : ${(typeof displayRemainingWeeks === 'number' ? displayRemainingWeeks.toLocaleString() : displayRemainingWeeks)} weeks (~ ${(typeof displayRemainingHours === 'number' ? displayRemainingHours.toLocaleString(undefined, {maximumFractionDigits: 0}) : displayRemainingHours)} hours) remaining.`;
    hourWorthResultDiv.textContent = `Each hour is worth: ${typeof displayHourWorth === 'number' ? '$' + displayHourWorth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : displayHourWorth}.`;
    financialFreedomResultDiv.textContent = `Your Financial Freedom number (monthly): ${typeof displayFinancialFreedom === 'number' ? '$' + displayFinancialFreedom.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : displayFinancialFreedom}.`;
  }
});
