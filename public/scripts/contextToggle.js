// public/scripts/contextToggle.js
(() => {
  'use strict';
  
  const STORAGE_KEY = 'dev-context';
  const DEFAULT_CONTEXT = 'reader';
  let isInitialized = false;
  
  document.addEventListener('DOMContentLoaded', initializeContextToggle);

  function initializeContextToggle() {
    const toggleBtn = document.getElementById('devContextToggle');
    if (!toggleBtn) return;

    // Determine initial context based on URL and stored preference
    const currentContext = determineInitialContext();
    
    // Set initial state instantly without any transitions
    setToggleStateInstantly(currentContext);
    
    // Store the determined context
    localStorage.setItem(STORAGE_KEY, currentContext);
    
    // Mark as initialized after initial setup
    setTimeout(() => {
      isInitialized = true;
    }, 50);
    
    toggleBtn.addEventListener('click', handleToggleClick);
    window.addEventListener('storage', handleStorageChange);
  }

  function determineInitialContext() {
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.startsWith('/admin');
    const storedContext = localStorage.getItem(STORAGE_KEY);
    
    // If we're on an admin page, default to 'author' mode
    if (isAdminPage) {
      return 'author';
    }
    
    // If we're not on an admin page, use stored preference or default to 'reader'
    return storedContext || DEFAULT_CONTEXT;
  }

  function handleToggleClick(e) {
    e.preventDefault();
    const newContext = getCurrentContext() === 'author' ? 'reader' : 'author';
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

  function setToggleStateInstantly(context) {
    const toggleBtn = document.getElementById('devContextToggle');
    if (!toggleBtn) return;

    // Completely disable all transitions on the toggle and its children
    const elementsToDisable = [
      toggleBtn,
      toggleBtn.querySelector('.toggle-slider'),
      ...toggleBtn.querySelectorAll('.toggle-label')
    ].filter(Boolean);

    elementsToDisable.forEach(el => {
      el.style.transition = 'none';
      el.style.animation = 'none';
    });

    // Force the toggle to the correct initial state
    toggleBtn.setAttribute('data-context', context);
    toggleBtn.setAttribute('aria-label', 
      context === 'author' ? 'Switch to Reader Mode' : 'Switch to Author Mode'
    );
    
    applyContextToNavigation(context);
    document.body.setAttribute('data-dev-context', context);

    // Force a reflow to ensure the styles are applied
    toggleBtn.offsetHeight;

    // Re-enable transitions after ensuring the DOM has updated
    setTimeout(() => {
      elementsToDisable.forEach(el => {
        el.style.transition = '';
        el.style.animation = '';
      });
      
      // Re-apply specific transitions
      const slider = toggleBtn.querySelector('.toggle-slider');
      if (slider) {
        slider.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      }
      
      const labels = toggleBtn.querySelectorAll('.toggle-label');
      labels.forEach(label => {
        label.style.transition = 'all 0.25s ease';
      });
    }, 10);
  }

  function updateToggleState(context) {
    if (!isInitialized) {
      setToggleStateInstantly(context);
      return;
    }

    const toggleBtn = document.getElementById('devContextToggle');
    if (!toggleBtn) return;

    toggleBtn.setAttribute('data-context', context);
    toggleBtn.setAttribute('aria-label', 
      context === 'author' ? 'Switch to Reader Mode' : 'Switch to Author Mode'
    );
    
    applyContextToNavigation(context);
    document.body.setAttribute('data-dev-context', context);
  }

  function applyContextToNavigation(context) {
    const navElement = document.querySelector('nav');
    if (!navElement) return;

    const navLinks = navElement.querySelectorAll('.nav-links li');
    
    navLinks.forEach(li => {
      const link = li.querySelector('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      const isAdminLink = href?.startsWith('/admin');
      
      // In author mode: only show admin links, hide others
      // In reader mode: show all non-admin links, hide admin links
      if (context === 'author') {
        li.style.display = isAdminLink ? '' : 'none';
      } else {
        li.style.display = isAdminLink ? 'none' : '';
      }
    });
  }
})();
