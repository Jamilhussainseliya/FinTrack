// Theme Toggle Functionality
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.querySelector(".theme-toggle")
  const body = document.body

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "dark") {
    body.classList.add("dark-mode")
    updateThemeIcon()
  }

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode")
    updateThemeIcon()

    // Save theme preference
    const currentTheme = body.classList.contains("dark-mode") ? "dark" : "light"
    localStorage.setItem("theme", currentTheme)
  })

  function updateThemeIcon() {
    const moonIcon = themeToggle.querySelector(".fa-moon")
    const sunIcon = document.createElement("i")
    sunIcon.classList.add("fas", "fa-sun")

    if (body.classList.contains("dark-mode")) {
      moonIcon.style.display = "none"
      if (!themeToggle.querySelector(".fa-sun")) {
        themeToggle.appendChild(sunIcon)
      } else {
        themeToggle.querySelector(".fa-sun").style.display = "block"
      }
    } else {
      moonIcon.style.display = "block"
      if (themeToggle.querySelector(".fa-sun")) {
        themeToggle.querySelector(".fa-sun").style.display = "none"
      }
    }
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
  const nav = document.querySelector("nav")

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      nav.style.display = nav.style.display === "block" ? "none" : "block"
    })
  }
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
  });

  // Testimonial Slider
  const testimonialSlides = document.querySelectorAll(".testimonial-slide")
  const dots = document.querySelectorAll(".dot")
  const prevBtn = document.querySelector(".prev-btn")
  const nextBtn = document.querySelector(".next-btn")

  if (testimonialSlides.length > 0) {
    let currentSlide = 0

    function showSlide(index) {
      testimonialSlides.forEach((slide) => slide.classList.remove("active"))
      dots.forEach((dot) => dot.classList.remove("active"))

      testimonialSlides[index].classList.add("active")
      dots[index].classList.add("active")
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        currentSlide = (currentSlide + 1) % testimonialSlides.length
        showSlide(currentSlide)
      })
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        currentSlide = (currentSlide - 1 + testimonialSlides.length) % testimonialSlides.length
        showSlide(currentSlide)
      })
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        currentSlide = index
        showSlide(currentSlide)
      })
    })

    // Auto slide every 5 seconds
    setInterval(() => {
      currentSlide = (currentSlide + 1) % testimonialSlides.length
      showSlide(currentSlide)
    }, 5000)
  }

  // Quick Budget Calculator
  const quickIncomeInput = document.getElementById("quick-income")
  const quickExpensesInput = document.getElementById("quick-expenses")
  const calculateQuickBtn = document.getElementById("calculate-quick")
  const balanceAmount = document.querySelector(".balance-amount")
  const progressBar = document.querySelector(".progress")

  if (calculateQuickBtn) {
    calculateQuickBtn.addEventListener("click", () => {
      const income = Number.parseFloat(quickIncomeInput.value) || 0
      const expenses = Number.parseFloat(quickExpensesInput.value) || 0
      const balance = income - expenses

      balanceAmount.textContent = `₹₹{balance.toFixed(2)}`

      // Update progress bar
      const percentage = income > 0 ? Math.min(100, Math.max(0, ((income - expenses) / income) * 100)) : 0
      progressBar.style.width = `₹{percentage}%`

      // Change color based on balance
      if (balance < 0) {
        balanceAmount.style.color = "var(--danger-color)"
        progressBar.style.backgroundColor = "var(--danger-color)"
      } else if (balance === 0) {
        balanceAmount.style.color = "var(--warning-color)"
        progressBar.style.backgroundColor = "var(--warning-color)"
      } else {
        balanceAmount.style.color = "var(--success-color)"
        progressBar.style.backgroundColor = "var(--success-color)"
      }
    })
  }
})

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}
