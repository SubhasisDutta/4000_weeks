document.addEventListener('DOMContentLoaded', function () {
  const dobInput = document.getElementById('dob');
  const lifespanInput = document.getElementById('lifespan');
  const calculateBtn = document.getElementById('calculateBtn');
  const resultDiv = document.getElementById('result');

  // Load saved values
  chrome.storage.local.get(['dob', 'lifespan'], function (items) {
    if (items.dob) {
      dobInput.value = items.dob;
    }
    if (items.lifespan) {
      lifespanInput.value = items.lifespan;
    }
    // Automatically calculate if both values are present
    if (items.dob && items.lifespan) {
        performCalculation();
    }
  });

  calculateBtn.addEventListener('click', performCalculation);
  // Also calculate when inputs change if both are filled
  dobInput.addEventListener('change', () => {
      if (lifespanInput.value) performCalculation();
  });
  lifespanInput.addEventListener('input', () => { // 'input' for immediate feedback on number change
      if (dobInput.value) performCalculation();
  });


  function performCalculation() {
    const dobString = dobInput.value;
    const lifespanYears = parseInt(lifespanInput.value, 10);

    if (!dobString) {
      resultDiv.textContent = 'Please enter your date of birth.';
      resultDiv.style.color = 'red';
      return;
    }

    if (isNaN(lifespanYears) || lifespanYears <= 0) {
      resultDiv.textContent = 'Please enter a valid lifespan in years.';
      resultDiv.style.color = 'red';
      return;
    }

    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) {
        resultDiv.textContent = 'Invalid date of birth format.';
        resultDiv.style.color = 'red';
        return;
    }

    const currentDate = new Date();

    if (dob > currentDate) {
        resultDiv.textContent = 'Date of birth cannot be in the future.';
        resultDiv.style.color = 'red';
        return;
    }

    const expectedDeathDate = new Date(dob);
    expectedDeathDate.setFullYear(dob.getFullYear() + lifespanYears);

    const remainingMilliseconds = expectedDeathDate - currentDate;

    if (remainingMilliseconds < 0) {
      resultDiv.textContent = 'You have lived past your expected lifespan!';
      resultDiv.style.color = 'green';
    } else {
      const weeksInMs = 1000 * 60 * 60 * 24 * 7;
      const remainingWeeks = Math.ceil(remainingMilliseconds / weeksInMs);
      resultDiv.textContent = `You have approximately ${remainingWeeks} weeks remaining.`;
      resultDiv.style.color = 'black'; // Default color
    }

    // Save current valid inputs
    chrome.storage.local.set({
      dob: dobString,
      lifespan: lifespanYears.toString() // Ensure lifespan is stored as string if needed, or keep as number
    });
  }
});
