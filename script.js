document.addEventListener("DOMContentLoaded", () => {
  const records = JSON.parse(localStorage.getItem("records")) || [];

  // Language switcher
  const switcher = document.getElementById("lang-switch");
  const lang = localStorage.getItem("lang") || "en";
  const i18n = {
    en: {
      dashboardTitle: "Expense & Income Tracker",
      addExpense: "Add Expense",
      addIncome: "Add Income",
      totalIncome: "Total Income",
      totalExpense: "Total Expenses",
      balance: "Balance",
      byCategory: "Expense Breakdown",
      monthlyOverview: "Monthly Trends",
      desc: "Description",
      amount: "Amount (₹)",
      date: "Date",
      category: "Category",
      selectCategory: "Select category",
      back: "Back",
      history: "History",
      type: "Type",
      quickActions: "Quick Actions",
      budgets: "Budgets",
      recent: "Recent Transactions"
    },
    mr: {
      dashboardTitle: "खर्च आणि उत्पन्न ट्रॅकर",
      addExpense: "खर्च जोडा",
      addIncome: "उत्पन्न जोडा",
      totalIncome: "एकूण उत्पन्न",
      totalExpense: "एकूण खर्च",
      balance: "शिल्लक",
      byCategory: "वर्गानुसार खर्च",
      monthlyOverview: "मासिक आढावा",
      desc: "वर्णन",
      amount: "रक्कम (₹)",
      date: "दिनांक",
      category: "वर्ग",
      selectCategory: "वर्ग निवडा",
      back: "परत",
      history: "इतिहास",
      type: "प्रकार",
      quickActions: "त्वरित क्रिया",
      budgets: "बजेट"
    }
  };

  if (switcher) {
    switcher.value = lang;
    switcher.addEventListener("change", () => {
      localStorage.setItem("lang", switcher.value);
      location.reload();
    });
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = i18n[lang][key] || el.textContent;
    });
  }

  // Forms
  const expenseForm = document.getElementById("expense-form");
  const incomeForm  = document.getElementById("income-form");
  const historyBody = document.getElementById("history-body");
  const recentBody  = document.getElementById("recent-body");

  function saveRecords() {
    localStorage.setItem("records", JSON.stringify(records));
  }

  if (expenseForm) {
    expenseForm.addEventListener("submit", e => {
      e.preventDefault();
      records.push({
        type: "Expense",
        desc: document.getElementById("desc").value,
        amount: +document.getElementById("amount").value,
        date: document.getElementById("date").value,
        category: document.getElementById("category").value
      });
      saveRecords();
      location.href = "index.html";
    });
  }

  if (incomeForm) {
    incomeForm.addEventListener("submit", e => {
      e.preventDefault();
      records.push({
        type: "Income",
        desc: document.getElementById("income-desc").value,
        amount: +document.getElementById("income-amount").value,
        date: document.getElementById("income-date").value,
        category: ""
      });
      saveRecords();
      location.href = "index.html";
    });
  }

  // Populate History
  if (historyBody) {
    records.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.type}</td>
        <td>${r.desc}</td>
        <td>₹${r.amount.toFixed(2)}</td>
        <td>${r.date}</td>
        <td>${r.category}</td>
      `;
      historyBody.appendChild(tr);
    });
  }

  // Populate Recent (last 5)
  if (recentBody) {
    records.slice(-5).reverse().forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.type}</td>
        <td>${r.desc}</td>
        <td>₹${r.amount.toFixed(2)}</td>
        <td>${r.date}</td>
      `;
      recentBody.appendChild(tr);
    });
  }

  // Dashboard summaries & charts
  const totalIncomeEl  = document.getElementById("total-income");
  const totalExpenseEl = document.getElementById("total-expense");
  const balanceEl      = document.getElementById("balance");
  const expenseCtx     = document.getElementById("expenseChart");
  const monthlyCtx     = document.getElementById("monthlyChart");

  if (totalIncomeEl && totalExpenseEl && balanceEl) {
    let inc = 0, exp = 0;
    const catMap = {}, monthly = {};

    records.forEach(r => {
      const m = r.date.slice(0,7);
      monthly[m] = monthly[m] || { Income:0, Expense:0 };
      if (r.type==="Income") {
        inc += r.amount;
        monthly[m].Income += r.amount;
      } else {
        exp += r.amount;
        catMap[r.category] = (catMap[r.category]||0) + r.amount;
        monthly[m].Expense += r.amount;
      }
    });

    totalIncomeEl.textContent  = `₹${inc.toFixed(2)}`;
    totalExpenseEl.textContent = `₹${exp.toFixed(2)}`;
    balanceEl.textContent      = `₹${(inc-exp).toFixed(2)}`;

    // Pie chart
    if (expenseCtx) {
      new Chart(expenseCtx, {
        type: "pie",
        data: {
          labels: Object.keys(catMap),
          datasets: [{
            data: Object.values(catMap),
            backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40']
          }]
        }
      });
    }

    // Bar chart
    if (monthlyCtx) {
      const labels = Object.keys(monthly).sort();
      new Chart(monthlyCtx,{
        type:"bar",
        data:{
          labels,
          datasets:[
            { label:"Income", data:labels.map(m=>monthly[m].Income), backgroundColor:"#36A2EB" },
            { label:"Expense", data:labels.map(m=>monthly[m].Expense), backgroundColor:"#FF6384" }
          ]
        },
        options:{scales:{y:{beginAtZero:true}}}
      });
    }
  }
});
