const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const toast = document.querySelector(".toast");
const citation = document.querySelector("#citation-code");
const citationDrawer = document.querySelector("#citation");
const progressBar = document.querySelector("#scroll-progress-bar");
const menuText = menuButton.querySelector(".sr-only");
const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

document.documentElement.dataset.viewport = `${window.innerWidth}x${window.innerHeight}`;

const revealElements = [...document.querySelectorAll(".reveal")];
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("reveal-ready");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -7%", threshold: 0.08 });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 12);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;

  let activeId = "";
  navSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= 180) activeId = section.id;
  });
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

function closeMenu() {
  siteNav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuText.textContent = "Open navigation";
}

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  siteNav.classList.toggle("open", !open);
  menuText.textContent = open ? "Open navigation" : "Close navigation";
});

siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
window.addEventListener("resize", () => {
  document.documentElement.dataset.viewport = `${window.innerWidth}x${window.innerHeight}`;
  if (window.innerWidth > 760) closeMenu();
});
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

let toastTimer;
function legacyCopy() {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(citation);
  selection.removeAllRanges();
  selection.addRange(range);
  const copied = document.execCommand("copy");
  selection.removeAllRanges();
  return copied;
}

async function copyCitation() {
  const text = citation.textContent.trim();
  let copied = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      copied = true;
    } else {
      copied = legacyCopy();
    }
  } catch {
    copied = legacyCopy();
  }
  toast.textContent = copied ? "Citation copied" : "Select the citation to copy";
  clearTimeout(toastTimer);
  toast.classList.add("visible");
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
}

document.querySelectorAll("[data-copy-citation], [data-open-citation]").forEach((button) => {
  button.addEventListener("click", copyCitation);
});

document.querySelectorAll('a[href="#citation"]').forEach((link) => {
  link.addEventListener("click", () => {
    citationDrawer.open = true;
  });
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
