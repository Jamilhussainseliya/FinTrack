

document.addEventListener("DOMContentLoaded", () => {
  // Investment Calculator Functionality
  const investmentForm = document.getElementById("investment-form");
  const initialInvestmentEl = document.getElementById("initial-investment");
  const totalContributionsEl = document.getElementById("total-contributions");
  const totalInterestEarnedEl = document.getElementById("total-interest-earned");
  const finalBalanceEl = document.getElementById("final-balance");
  const investmentTable = document.getElementById("investment-table").querySelector("tbody");
  const saveInvestmentBtn = document.getElementById("save-investment");
  const clearInvestmentBtn = document.getElementById("clear-investment");

  // Range slider connections
  const returnSlider = document.getElementById("return-slider");
  const annualReturnInput = document.getElementById("annual-return");
  const periodSlider = document.getElementById("period-slider");
  const investmentPeriodInput = document.getElementById("investment-period");

  // Initialize Chart.js
  let investmentChart;

  // Enhanced form validation
  function validateInput(input, min = 0) {
      const value = Number.parseFloat(input.value);
      if (isNaN(value) || value < min) {
          input.classList.add('error');
          return false;
      }
      input.classList.remove('error');
      return true;
  }

  function validateInvestmentInputs() {
      const inputs = [
          document.getElementById("initial-amount"),
          document.getElementById("monthly-contribution"),
          document.getElementById("annual-return"),
          document.getElementById("investment-period")
      ];
      return inputs.every(input => validateInput(input));
  }

  // Calculate investment with validation
  if (investmentForm) {
      investmentForm.addEventListener("submit", (e) => {
          e.preventDefault();

          if (!validateInvestmentInputs()) {
              return; // Exit if validation fails
          }

          const initialAmount = Number.parseFloat(document.getElementById("initial-amount").value) || 0;
          const monthlyContribution = Number.parseFloat(document.getElementById("monthly-contribution").value) || 0;
          const annualReturn = Number.parseFloat(document.getElementById("annual-return").value) || 0;
          const investmentPeriod = Number.parseInt(document.getElementById("investment-period").value) || 0;
          const compoundFrequency = Number.parseInt(document.getElementById("compound-frequency").value) || 12;

          if (investmentPeriod > 0) {
              const result = calculateInvestment(
                  initialAmount,
                  monthlyContribution,
                  annualReturn,
                  investmentPeriod,
                  compoundFrequency,
              );

              // Update summary
              initialInvestmentEl.textContent = formatCurrency(initialAmount);
              totalContributionsEl.textContent = formatCurrency(monthlyContribution * 12 * investmentPeriod);
              totalInterestEarnedEl.textContent = formatCurrency(result.totalInterest);
              finalBalanceEl.textContent = formatCurrency(result.finalBalance);

              // Update table
              updateInvestmentTable(result.yearlyData);

              // Update chart
              initChart(result.yearlyData);

              // Save to localStorage
              const investmentData = {
                  initialAmount,
                  monthlyContribution,
                  annualReturn,
                  investmentPeriod,
                  compoundFrequency,
              };
              localStorage.setItem("investmentData", JSON.stringify(investmentData));
          }
      });
  }

  // Calculate investment growth
  function calculateInvestment(initialAmount, monthlyContribution, annualReturn, years, compoundFrequency) {
      const periodicRate = annualReturn / 100 / compoundFrequency;
      const totalPeriods = years * compoundFrequency;
      let balance = initialAmount;
      let totalInterest = 0;
      let totalPrincipal = initialAmount;
      const yearlyData = [];

      for (let year = 1; year <= years; year++) {
          const yearStartBalance = balance;
          let yearInterest = 0;
          let yearContributions = 0;

          // Calculate for each month in the year
          for (let month = 1; month <= 12; month++) {
              // Add monthly contribution
              balance += monthlyContribution;
              yearContributions += monthlyContribution;
              totalPrincipal += monthlyContribution;

              // If it's time to compound
              if (month % (12 / compoundFrequency) === 0) {
                  const interest = balance * periodicRate;
                  balance += interest;
                  yearInterest += interest;
                  totalInterest += interest;
              }
          } yearlyData.push({
            year,
            startBalance: yearStartBalance,
            contributions: yearContributions,
            interest: yearInterest,
            endBalance: balance,
            principal: totalPrincipal,
            totalInterest,
        });
    }

    return {
        finalBalance: balance,
        totalInterest,
        yearlyData,
    };
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

// Update investment table
function updateInvestmentTable(yearlyData) {
    investmentTable.innerHTML = ""; // Clear existing table data

    yearlyData.forEach((data) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${data.year}</td>
            <td>${formatCurrency(data.startBalance)}</td>
            <td>${formatCurrency(data.contributions)}</td>
            <td>${formatCurrency(data.interest)}</td>
            <td>${formatCurrency(data.endBalance)}</td>
        `;

        investmentTable.appendChild(row);
    });
}

// Initialize Chart.js
function initChart(yearlyData) {
    const ctx = document.getElementById("investment-chart").getContext("2d");

    if (investmentChart) {
        investmentChart.destroy(); // Destroy previous chart instance
    }

    // Extract data for chart
    const labels = yearlyData.map((data) => `Year ${data.year}`);
    const principalData = yearlyData.map((data) => data.principal);
    const interestData = yearlyData.map((data) => data.interest);

    investmentChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Principal",
                    data: principalData,
                    backgroundColor: "#10b981",
                    borderColor: "#10b981",
                    borderWidth: 1,
                },
                {
                    label: "Interest",
                    data: interestData,
                    backgroundColor: "#4f46e5",
                    borderColor: "#4f46e5",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    ticks: {
                        callback: (value) => "$" + value.toLocaleString(),
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue("--text-color"),
                        font: {
                            size: 12,
                        },
                    },
                },
            },
        },
    });
}

// Clear investment
if (clearInvestmentBtn) {
    clearInvestmentBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset the investment calculator? This action cannot be undone.")) {
            document.getElementById("initial-amount").value = "";
            document.getElementById("monthly-contribution").value = "";
            document.getElementById("annual-return").value = "7";
            document.getElementById("investment-period").value = "10";
            document.getElementById("return-slider").value = "7";
            document.getElementById("period-slider").value = "10";

            // Reset summary
            initialInvestmentEl.textContent = "$0";
            totalContributionsEl.textContent = "$0";
            totalInterestEarnedEl.textContent = "$0";
            finalBalanceEl.textContent = "$0";

            // Clear table
            investmentTable.innerHTML = "";

            // Reset chart
            if (investmentChart) {
                investmentChart.destroy();
                initChart([]);
            }

            // Clear localStorage
            localStorage.removeItem("investmentData");
        }
    });
}

// Load saved investment data
const savedInvestmentData = JSON.parse(localStorage.getItem("investmentData"));
if (savedInvestmentData) {
    document.getElementById("initial-amount").value = savedInvestmentData.initialAmount;
    document.getElementById("monthly-contribution").value = savedInvestmentData.monthlyContribution;
    document.getElementById("annual-return").value = savedInvestmentData.annualReturn;
    document.getElementById("investment-period").value = savedInvestmentData.investmentPeriod;
    document.getElementById("return-slider").value = savedInvestmentData.annualReturn;
    document.getElementById("period-slider").value = savedInvestmentData.investmentPeriod;
    savedInvestmentData.compoundFrequency;
  }

  // Initialize empty chart on page load
  if (document.getElementById("investment-chart")) {
      initChart([]);
  }

  // Connect range sliders to inputs
  if (returnSlider && annualReturnInput) {
      returnSlider.addEventListener("input", function () {
          annualReturnInput.value = this.value;
      });

      annualReturnInput.addEventListener("input", function () {
          returnSlider.value = this.value;
      });

      // Set initial value
      annualReturnInput.value = returnSlider.value;
  }

  if (periodSlider && investmentPeriodInput) {
      periodSlider.addEventListener("input", function () {
          investmentPeriodInput.value = this.value;
      });

      investmentPeriodInput.addEventListener("input", function () {
          periodSlider.value = this.value;
      });

      // Set initial value
      investmentPeriodInput.value = periodSlider.value;
  }
});