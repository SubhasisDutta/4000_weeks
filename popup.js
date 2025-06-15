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
  chrome.storage.local.get(['dob', 'lifespan', 'totalWeeklyHours'], function (items) {
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
    // Automatically calculate if all values are present
    if (items.dob && items.lifespan) { // totalWeeklyHours will have a default
        performCalculation();
    } else { // If not all main calc inputs are there, still try to calc weekly hours
        calculateWeeklyHours();
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

  function calculateWeeklyHours() {
    const now = new Date();
    let totalConfiguredWeeklyHours = parseInt(totalWeeklyHoursInput.value, 10);

    if (isNaN(totalConfiguredWeeklyHours) || totalConfiguredWeeklyHours < 1) {
      totalConfiguredWeeklyHours = 168; // Default if input is invalid
    }

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
    const dobString = dobInput.value;
    const lifespanYears = parseInt(lifespanInput.value, 10);

    // Clear previous results for total life hours
    if (totalLifeHoursResultDiv) totalLifeHoursResultDiv.textContent = '';

    if (!dobString) {
      resultDiv.textContent = 'Please enter your date of birth.';
      resultDiv.style.color = 'red';
      if (weeklyHoursResultDiv) weeklyHoursResultDiv.textContent = ''; // Also clear weekly
      return;
    }

    if (isNaN(lifespanYears) || lifespanYears <= 0) {
      resultDiv.textContent = 'Please enter a valid lifespan in years.';
      resultDiv.style.color = 'red';
      if (weeklyHoursResultDiv) weeklyHoursResultDiv.textContent = ''; // Also clear weekly
      return;
    }

    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) {
        resultDiv.textContent = 'Invalid date of birth format.';
        resultDiv.style.color = 'red';
        if (weeklyHoursResultDiv) weeklyHoursResultDiv.textContent = ''; // Also clear weekly
        return;
    }

    const currentDate = new Date();

    if (dob > currentDate) {
        resultDiv.textContent = 'Date of birth cannot be in the future.';
        resultDiv.style.color = 'red';
        if (weeklyHoursResultDiv) weeklyHoursResultDiv.textContent = ''; // Also clear weekly
        return;
    }

    const expectedDeathDate = new Date(dob);
    expectedDeathDate.setFullYear(dob.getFullYear() + lifespanYears);

    const remainingMilliseconds = expectedDeathDate - currentDate;
    const remainingTotalHours = remainingMilliseconds / (1000 * 60 * 60);

    if (remainingMilliseconds < 0) {
      resultDiv.textContent = 'You have lived past your expected lifespan!';
      resultDiv.style.color = 'green';
      // totalLifeHoursResultDiv is already cleared or we can set a specific message here if desired
      // For now, sticking to clearing it as per plan.
      if (totalLifeHoursResultDiv) totalLifeHoursResultDiv.textContent = '';
    } else {
      const weeksInMs = 1000 * 60 * 60 * 24 * 7;
      const remainingWeeks = Math.ceil(remainingMilliseconds / weeksInMs);
      resultDiv.textContent = `You have approximately ${remainingWeeks} weeks remaining.`;
      resultDiv.style.color = 'black'; // Default color

      if (totalLifeHoursResultDiv) {
        totalLifeHoursResultDiv.textContent = `Approximately ${remainingTotalHours.toLocaleString(undefined, {maximumFractionDigits: 0})} total hours remaining.`;
        totalLifeHoursResultDiv.style.color = 'black';
      }
    }

    // Save current valid inputs for DOB and Lifespan
    // totalWeeklyHours is saved in its own event listener
    chrome.storage.local.set({
      dob: dobString,
      lifespan: lifespanYears.toString()
    });

    // Calculate and display weekly hours
    calculateWeeklyHours();
  }
});
