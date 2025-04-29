

import { Chart } from "@/components/ui/chart";

document.addEventListener("DOMContentLoaded", () => {
  // Debt Management Tool Functionality
  const debtForm = document.getElementById("debt-form");
  const debtList = document.getElementById("debt-list");
  const totalDebtEl = document.getElementById("total-debt");
  const monthlyPaymentEl = document.getElementById("monthly-payment");
  const debtFreeTimeEl = document.getElementById("debt-free-time");
  const totalInterestEl = document.getElementById("total-interest");
  const calculateDebtBtn = document.getElementById("calculate-payoff");
  const saveDebtBtn = document.getElementById("save-debt");
  const clearDebtBtn = document.getElementById("clear-debt");
  const extraPaymentInput = document.getElementById("extra-payment");
  const strategyRadios = document.querySelectorAll('input[name="strategy"]');

  let debts = JSON.parse(localStorage.getItem("debts")) || [];
  let extraPayment = Number.parseFloat(localStorage.getItem("extraPayment")) || 0;
  let strategy = localStorage.getItem("strategy") || "avalanche";

  // Format currency function
  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  // Initialize Chart.js
  let debtChart;

  function initChart(paymentSchedule) {
    const ctx = document.getElementById("debt-chart").getContext("2d");

    if (debtChart) {
      debtChart.destroy();
    }

    // Extract data for chart
    const labels = [];
    const datasets = [];

    // Create a dataset for each debt
    debts.forEach((debt, index) => {
      const data = [];
      const color = getColorForIndex(index);

      datasets.push({
        label: debt.name,
        data: data,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2,
        fill: false,
      });
    });

    // Add total balance dataset
    datasets.push({
      label: "Total Balance",
      data: [],
      backgroundColor: "#4f46e5",
      borderColor: "#4f46e5",
      borderWidth: 3,
      fill: false,
    });

    // Populate data
    if (paymentSchedule && paymentSchedule.length > 0) {
      paymentSchedule.forEach((month, i) => {
        labels.push(`Month ₹{i + 1}`);

        // Add data for each debt
        debts.forEach((debt, j) => {
          const debtBalance = month.debtBalances[j] || 0;
          datasets[j].data.push(debtBalance);
        });

        // Add total balance
        datasets[datasets.length - 1].data.push(month.totalBalance);
      });
    }

    debtChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => "₹" + value.toLocaleString(),
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

  // Get color for chart
  function getColorForIndex(index) {
    const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6"];
    return colors[index % colors.length];
  }

  // Add debt
  if (debtForm) {
    debtForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("debt-name");
      const balanceInput = document.getElementById("debt-balance");
      const interestInput = document.getElementById("debt-interest");
      const paymentInput = document.getElementById("debt-payment");

      const name = nameInput.value.trim();
      const balance = Number.parseFloat(balanceInput.value);
      const interest = Number.parseFloat(interestInput.value);
      const payment = Number.parseFloat(paymentInput.value);

      if (name && balance > 0 && interest >= 0 && payment > 0) {
        const debt = {
          id: Date.now(),
          name,
          balance,
          interest,
          payment,
        };

        debts.push(debt);
        updateDebtList();

        // Reset input fields
        nameInput.value = "";
        balanceInput.value = "";
        interestInput.value = "";
        paymentInput.value = "";
      }
    });
  }

  // Update debt list
  function updateDebtList() {
    debtList.innerHTML = "";

    debts.forEach((debt) => {
      const item = document.createElement("div");
      item.classList.add("item");

      item.innerHTML = `
        <div class="item-info">
          <div class="item-name">₹{debt.name}</div>
          <div class="item-category">Interest: ₹{debt.interest}%</div>
        </div>
        <div class="item-amount">₹{formatCurrency(debt.balance)}</div>
        <div class="item-actions">
          <button class="delete-btn" data-id="₹{debt.id}"><i class="fas fa-trash"></i></button>
        </div>
      `;

      debtList.appendChild(item);
    });

    // Add delete event listeners
    document.querySelectorAll("#debt-list .delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = Number.parseInt(this.dataset.id);
        debts = debts.filter((debt) => debt.id !== id);
        updateDebtList();
        localStorage.setItem("debts", JSON.stringify(debts));
      });
    });

    // Save to localStorage
    localStorage.setItem("debts", JSON.stringify(debts));
  }

  // Calculate debt payoff
  if (calculateDebtBtn) {
    calculateDebtBtn.addEventListener("click", () => {
      if (debts.length === 0) {
        alert("Please add at least one debt to calculate payoff.");
        return;
      }

      extraPayment = Number.parseFloat(extraPaymentInput.value) || 0;
      localStorage.setItem("extraPayment", extraPayment);

      // Get selected strategy
      strategyRadios.forEach((radio) => {
        if (radio.checked) {
          strategy = radio.value;
        }
      });
      localStorage.setItem("strategy", strategy);

      const paymentSchedule = calculatePaymentSchedule(debts, extraPayment, strategy);
      const lastMonth = paymentSchedule[paymentSchedule.length - 1];

      // Update summary
      totalDebtEl.textContent = formatCurrency(debts.reduce((total, debt) => total + debt.balance, 0));
      monthlyPaymentEl.textContent = formatCurrency(
        debts.reduce((total, debt) => total + debt.payment, 0) + extraPayment,
      );
      debtFreeTimeEl.textContent = `₹{paymentSchedule.length} months (₹{Math.floor(paymentSchedule.length / 12)} years, ₹{paymentSchedule.length % 12} months)`;
      totalInterestEl.textContent = formatCurrency(lastMonth.totalInterestPaid);

      // Update chart
      initChart(paymentSchedule);
    });
  }

  // Calculate payment schedule
  function calculatePaymentSchedule(debts, extraPayment, strategy) {
    let totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    let months = 0;
    let totalInterestPaid = 0;while (totalDebt > 0) {
      months++;
      // Calculate interest and update total debt
      debts.forEach(debt => {
        let interest = (debt.balance * (debt.interest / 100 / 12));
        totalInterestPaid += interest;
        debt.balance += interest; 

        // Apply the minimum payment
        debt.balance -= debt.payment;

        // If there's an extra payment, apply it to the highest priority debt based on the selected strategy
        if (extraPayment > 0) {
          if (strategy === "avalanche") {
            // Apply extra payment to the debt with the highest interest first
            let highestInterestDebt = debts.sort((a, b) => b.interest - a.interest)[0];
            if (highestInterestDebt.balance > 0) {
              let paymentToApply = Math.min(extraPayment, highestInterestDebt.balance);
              highestInterestDebt.balance -= paymentToApply;
              extraPayment -= paymentToApply;
            }
          } else if (strategy === "snowball") {
            // Apply extra payment to the debt with the smallest balance first
            let smallestBalanceDebt = debts.sort((a, b) => a.balance - b.balance)[0];
            if (smallestBalanceDebt.balance > 0) {
              let paymentToApply = Math.min(extraPayment, smallestBalanceDebt.balance);
              smallestBalanceDebt.balance -= paymentToApply;
              extraPayment -= paymentToApply;
            }
          }
        }

        // Ensure the balance does not go negative
        if (debt.balance < 0) {
          debt.balance = 0;
        }
      });

      // Recalculate total debt after payments
      totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    }

    return {
      totalDebt,
      totalInterestPaid,
      months,
    };
  }

  // Save debt plan
  if (saveDebtBtn) {
    saveDebtBtn.addEventListener("click", () => {
      alert("Debt payment plan saved successfully!");
    });
  }

  // Clear all debts
  if (clearDebtBtn) {
    clearDebtBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all debts? This action cannot be undone.")) {
        debts = [];
        extraPaymentInput.value = "";
        localStorage.removeItem("debts");
        localStorage.removeItem("extraPayment");
        updateDebtList();

        // Reset summary
        totalDebtEl.textContent = "₹0";
        monthlyPaymentEl.textContent = "₹0";
        debtFreeTimeEl.textContent = "0 months";
        totalInterestEl.textContent = "₹0";

        // Reset chart
        if (debtChart) {
          debtChart.destroy();
          initChart([]);
        }
      }
    });
  }

  // Set extra payment from localStorage
  if (extraPaymentInput && localStorage.getItem("extraPayment")) {
    extraPaymentInput.value = localStorage.getItem("extraPayment");
  }

  // Set strategy from localStorage
  if (localStorage.getItem("strategy")) {
    document.getElementById(localStorage.getItem("strategy")).checked = true;
  }

  // Initialize
  updateDebtList();

  // Initialize empty chart
  if (document.getElementById("debt-chart")) {
    initChart([]);
  }
});