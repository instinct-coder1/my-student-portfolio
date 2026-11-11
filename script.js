const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navItems = [...document.querySelectorAll(".nav-link")];

function setTheme(theme) {
  const isLight = theme === "light";
  body.classList.toggle("light-theme", isLight);
  themeIcon.textContent = isLight ? "☾" : "☼";
  themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
  document.querySelector('meta[name="theme-color"]').content = isLight ? "#f6f8fc" : "#0b1020";
  try { localStorage.setItem("portfolio-theme", theme); } catch (_) {}
}

let savedTheme = "dark";
try { savedTheme = localStorage.getItem("portfolio-theme") || "dark"; } catch (_) {}
setTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  setTheme(body.classList.contains("light-theme") ? "dark" : "light");
});

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const sections = [...document.querySelectorAll("main section[id]")];
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navItems.forEach((link) => {
      const active = link.getAttribute("href") === "#" + entry.target.id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  });
}, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
sections.forEach((section) => observer.observe(section));

document.getElementById("year").textContent = new Date().getFullYear();

const contactForm = document.getElementById("contactForm");
const feedback = document.getElementById("formFeedback");
const fields = ["name", "email", "message"].map((id) => document.getElementById(id));

function showError(field, message) {
  field.setAttribute("aria-invalid", "true");
  feedback.textContent = message;
  feedback.classList.add("error");
  field.focus();
}

fields.forEach((field) => {
  field.addEventListener("input", () => field.removeAttribute("aria-invalid"));
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  feedback.textContent = "";
  feedback.classList.remove("error");

  const [name, email, message] = fields;
  if (!name.value.trim()) return showError(name, "Please enter your name.");
  if (!email.value.trim()) return showError(email, "Please enter your email address.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) return showError(email, "Please enter a valid email address.");
  if (!message.value.trim()) return showError(message, "Please write a message.");

  feedback.textContent = "Your details look valid. This demo does not send messages because no backend or email service is connected.";
  contactForm.reset();
});