// public/scripts/contextToggle.js
(() => {
  "use strict";

  const STORAGE_KEY = "dev-context";
  const DEFAULT_CONTEXT = "reader";
  let isInitialized = false;
  let adminPathPrefix = "/admin"; // Default fallback

  document.addEventListener("DOMContentLoaded", initializeContextToggle);

  function initializeContextToggle() {
    const toggleBtn = document.getElementById("devContextToggle");
    if (!toggleBtn) return;

    if (toggleBtn.dataset.adminPathPrefix) {
      adminPathPrefix = toggleBtn.dataset.adminPathPrefix;
    }

    const currentContext = determineInitialContext();

    setToggleStateInstantly(currentContext);
    localStorage.setItem(STORAGE_KEY, currentContext);

    setTimeout(() => {
      isInitialized = true;
    }, 50);

    toggleBtn.addEventListener("click", handleToggleClick);
    window.addEventListener("storage", handleStorageChange);
  }

  function determineInitialContext() {
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.startsWith(adminPathPrefix);
    const storedContext = localStorage.getItem(STORAGE_KEY);

    if (isAdminPage) {
      return "author";
    }
    return storedContext || DEFAULT_CONTEXT;
  }

  function handleToggleClick(e) {
    e.preventDefault();
    const newContext = getCurrentContext() === "author" ? "reader" : "author";
    setContext(newContext);
  }

  function handleStorageChange(e) {
    if (e.key === STORAGE_KEY && e.newValue !== getCurrentContext()) {
      updateToggleState(e.newValue || DEFAULT_CONTEXT);
    }
  }

  function setContext(context) {
    localStorage.setItem(STORAGE_KEY, context);
    updateToggleState(context);
  }

  function getCurrentContext() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_CONTEXT;
  }

  // Helper function to apply context to DOM elements
  function _applyContextToDOM(context) {
    const toggleBtn = document.getElementById("devContextToggle");
    if (toggleBtn) {
      toggleBtn.setAttribute("data-context", context);
      toggleBtn.setAttribute(
        "aria-label",
        context === "author" ? "Switch to Reader Mode" : "Switch to Author Mode"
      );
    }

    applyContextToNavigation(context);
    document.body.setAttribute("data-dev-context", context);
  }

  function setToggleStateInstantly(context) {
    const toggleBtn = document.getElementById("devContextToggle");
    if (!toggleBtn) return;

    const elementsToDisableTransitions = [
      toggleBtn,
      toggleBtn.querySelector(".toggle-slider"),
      ...toggleBtn.querySelectorAll(".toggle-label"),
    ].filter(Boolean);

    elementsToDisableTransitions.forEach((el) => {
      el.style.transition = "none";
      el.style.animation = "none";
    });

    _applyContextToDOM(context);

    // Force a reflow
    toggleBtn.offsetHeight;

    setTimeout(() => {
      elementsToDisableTransitions.forEach((el) => {
        el.style.transition = ""; // Restore original transitions (or let CSS handle)
        el.style.animation = "";
      });

      // Re-apply specific transitions if they were more complex than CSS defaults
      const slider = toggleBtn.querySelector(".toggle-slider");
      if (slider) {
        slider.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      }
      const labels = toggleBtn.querySelectorAll(".toggle-label");
      labels.forEach((label) => {
        label.style.transition = "all 0.25s ease";
      });
    }, 10);
  }

  function updateToggleState(context) {
    if (!isInitialized) {
      setToggleStateInstantly(context);
      return;
    }
    _applyContextToDOM(context);
  }

  function applyContextToNavigation(context) {
    const navElement = document.querySelector("nav");
    if (!navElement) return;

    const navLinks = navElement.querySelectorAll(".nav-links li");

    navLinks.forEach((li) => {
      const link = li.querySelector("a");
      if (!link) return;

      const href = link.getAttribute("href");
      const isAdminLink = href?.startsWith(adminPathPrefix);

      if (context === "author") {
        li.style.display = isAdminLink ? "" : "none";
      } else {
        li.style.display = isAdminLink ? "none" : "";
      }
    });
  }
})();
