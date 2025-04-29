document.addEventListener("DOMContentLoaded", () => {
  // Budget Tool Functionality
  const incomeForm = document.getElementById("income-form")
  const expenseForm = document.getElementById("expense-form")
  const incomeList = document.getElementById("income-list")
  const expenseList = document.getElementById("expense-list")
  const totalIncomeEl = document.getElementById("total-income")
  const totalExpensesEl = document.getElementById("total-expenses")
  const balanceEl = document.getElementById("balance")
  const saveBudgetBtn = document.getElementById("save-budget")
  const clearBudgetBtn = document.getElementById("clear-budget")
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabPanes = document.querySelectorAll(".tab-pane")

  let incomes = JSON.parse(localStorage.getItem("incomes")) || []
  let expenses = JSON.parse(localStorage.getItem("expenses")) || []

  document.addEventListener("DOMContentLoaded", () => {
    // Existing budget tool functionality...
    // [Keep all existing variable declarations and functions]

      // Enhanced form validation
      function validateInput(input, min = 0) {
          const value = Number.parseFloat(input.value);
          if (isNaN(value)  ) {
              input.classList.add('error');
              return false;
          }
        if (value < min) {
            input.classList.add('error');
            return false;
        }
        input.classList.remove('error');
        return true;
    }

    // Add income with validation
    if (incomeForm) {
        incomeForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const nameInput = document.getElementById("income-name");
            const amountInput = document.getElementById("income-amount");

            const name = nameInput.value.trim();
            const amount = Number.parseFloat(amountInput.value);

            // Validate
            if (!name || !validateInput(amountInput, 0.01)) {
                if (!name) nameInput.classList.add('error');
                return;
            }

            // Clear errors
            nameInput.classList.remove('error');
            amountInput.classList.remove('error');

            const income = {
                id: Date.now(),
                name,
                amount,
            };

            incomes.push(income);
            updateIncomeList();
            updateBudgetSummary();

            nameInput.value = "";
            amountInput.value = "";
        });
    }

    // Add expense with validation
    if (expenseForm) {
        expenseForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const categorySelect = document.getElementById("expense-category");
            const nameInput = document.getElementById("expense-name");
            const amountInput = document.getElementById("expense-amount");

            const category = categorySelect.value;
            const name = nameInput.value.trim();
            const amount = Number.parseFloat(amountInput.value);

            // Validate
            if (!name || !validateInput(amountInput, 0.01)) {
                if (!name) nameInput.classList.add('error');
                return;
            }

            // Clear errors
            nameInput.classList.remove('error');
            amountInput.classList.remove('error');

            const expense = {
                id: Date.now(),
                category,
                name,
                amount,
            };

            expenses.push(expense);
            updateExpenseList();
            updateBudgetSummary();

            nameInput.value = "";
            amountInput.value = "";
        });
    }

    // Export functionality
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export as CSV';
    exportBtn.classList.add('btn', 'btn-secondary');
    exportBtn.addEventListener('click', exportBudgetData);
    
    if (document.querySelector('.budget-summary')) {
        document.querySelector('.budget-summary').appendChild(exportBtn);
    }

    function exportBudgetData() {
        let csv = 'Type,Name,Amount,Category\n';
        
        incomes.forEach(income => {
            csv += `Income,"₹{income.name.replace(/"/g, '""')}",₹{income.amount.toFixed(2)},\n`;
        });
        
        expenses.forEach(expense => {
            csv += `Expense,"₹{expense.name.replace(/"/g, '""')}",₹{expense.amount.toFixed(2)},"₹{expense.category}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `fintrack-budget-₹{new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Rest of existing budget.js code...
    // [Keep all other existing code below this point]
});
  // Function to format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Initialize Chart.js
  let expenseChart

  function initChart() {
    const ctx = document.getElementById("expense-chart").getContext("2d")

    // Group expenses by category
    const expensesByCategory = {}
    expenses.forEach((expense) => {
      if (expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] += expense.amount
      } else {
        expensesByCategory[expense.category] = expense.amount
      }
    })

    const categories = Object.keys(expensesByCategory)
    const amounts = Object.values(expensesByCategory)

    // Define colors for categories
    const categoryColors = {
      housing: "#4f46e5",
      transportation: "#10b981",
      food: "#f59e0b",
      utilities: "#ef4444",
      healthcare: "#6366f1",
      entertainment: "#8b5cf6",
      other: "#ec4899",
    }

    const colors = categories.map((category) => categoryColors[category] || "#6b7280")

    if (expenseChart) {
      expenseChart.destroy()
    }

    expenseChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: categories.map((category) => category.charAt(0).toUpperCase() + category.slice(1)),
        datasets: [
          {
            data: amounts,
            backgroundColor: colors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
    })
  }

  // Tab functionality
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabId = this.dataset.tab

      tabBtns.forEach((btn) => btn.classList.remove("active"))
      tabPanes.forEach((pane) => pane.classList.remove("active"))

      this.classList.add("active")
      document.getElementById(`₹{tabId}-tab`).classList.add("active")
    })
  })

  // Add income
  if (incomeForm) {
    incomeForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const nameInput = document.getElementById("income-name")
      const amountInput = document.getElementById("income-amount")

      const name = nameInput.value.trim()
      const amount = Number.parseFloat(amountInput.value)

      if (name && amount > 0) {
        const income = {
          id: Date.now(),
          name,
          amount,
        }

        incomes.push(income)
        updateIncomeList()
        updateBudgetSummary()

        nameInput.value = ""
        amountInput.value = ""
      }
    })
  }

  // Add expense
  if (expenseForm) {
    expenseForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const categorySelect = document.getElementById("expense-category")
      const nameInput = document.getElementById("expense-name")
      const amountInput = document.getElementById("expense-amount")

      const category = categorySelect.value
      const name = nameInput.value.trim()
      const amount = Number.parseFloat(amountInput.value)

      if (category && name && amount > 0) {
        const expense = {
          id: Date.now(),
          category,
          name,
          amount,
        }

        expenses.push(expense)
        updateExpenseList()
        updateBudgetSummary()

        nameInput.value = ""
        amountInput.value = ""
      }
    })
  }

  // Update income list
  function updateIncomeList() {
    incomeList.innerHTML = ""

    incomes.forEach((income) => {
      const item = document.createElement("div")
      item.classList.add("item")

      item.innerHTML = `
                <div class="item-info">
                    <div class="item-name">₹{income.name}</div>
                </div>
                <div class="item-amount">₹{formatCurrency(income.amount)}</div>
                <div class="item-actions">
                    <button class="delete-btn" data-id="₹{income.id}"><i class="fas fa-trash"></i></button>
                </div>
            `

      incomeList.appendChild(item)
    })

    // Add delete event listeners
    document.querySelectorAll("#income-list .delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = Number.parseInt(this.dataset.id)
        incomes = incomes.filter((income) => income.id !== id)
        updateIncomeList()
        updateBudgetSummary()
      })
    })

    // Save to localStorage
    localStorage.setItem("incomes", JSON.stringify(incomes))
  }

  // Update expense list
  function updateExpenseList() {
    expenseList.innerHTML = ""

    expenses.forEach((expense) => {
      const item = document.createElement("div")
      item.classList.add("item")

      item.innerHTML = `
                <div class="item-info">
                    <div class="item-name">₹{expense.name}</div>
                    <div class="item-category">₹{expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</div>
                </div>
                <div class="item-amount">₹{formatCurrency(expense.amount)}</div>
                <div class="item-actions">
                    <button class="delete-btn" data-id="₹{expense.id}"><i class="fas fa-trash"></i></button>
                </div>
            `

      expenseList.appendChild(item)
    })

    // Add delete event listeners
    document.querySelectorAll("#expense-list .delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = Number.parseInt(this.dataset.id)
        expenses = expenses.filter((expense) => expense.id !== id)
        updateExpenseList()
        updateBudgetSummary()
      })
    })

    // Save to localStorage
    localStorage.setItem("expenses", JSON.stringify(expenses))
  }
  // Example for budget form
form.addEventListener('submit', (e) => {
  if (Number(input.value) <= 0) {
    e.preventDefault();
    input.classList.add('error-border');
  }
});

  // Update budget summary
  function updateBudgetSummary() {
    const totalIncome = incomes.reduce((total, income) => total + income.amount, 0)
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0)
    const balance = totalIncome - totalExpenses

    totalIncomeEl.textContent = formatCurrency(totalIncome)
    totalExpensesEl.textContent = formatCurrency(totalExpenses)
    balanceEl.textContent = formatCurrency(balance)

    // Update chart
    if (document.getElementById("expense-chart")) {
      initChart()
    }

    // Change balance color based on value
    if (balance < 0) {
      balanceEl.style.color = "var(--danger-color)"
    } else if (balance === 0) {
      balanceEl.style.color = "var(--warning-color)"
    } else {
      balanceEl.style.color = "var(--success-color)"
    }
  }

  // Save budget
  if (saveBudgetBtn) {
    saveBudgetBtn.addEventListener("click", () => {
      alert("Budget saved successfully!")
    })
  }

  // Clear budget
  if (clearBudgetBtn) {
    clearBudgetBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your budget? This action cannot be undone.")) {
        incomes = []
        expenses = []
        localStorage.removeItem("incomes")
        localStorage.removeItem("expenses")
        updateIncomeList()
        updateExpenseList()
        updateBudgetSummary()
      }
    })
  }

  // Initialize
  updateIncomeList()
  updateExpenseList()
  updateBudgetSummary()
})
