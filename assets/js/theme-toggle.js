/**
 * Theme Toggle Functionality
 * Handles switching between light (white) and dark (g100) Carbon themes
 */

(function() {
  'use strict';
  
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const sunIcon = document.querySelector('.sun');
  const moonIcon = document.querySelector('.moon');
  
  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem('theme') || 'white';
  html.setAttribute('data-carbon-theme', currentTheme);
  updateThemeIcon(currentTheme);
  
  // Toggle theme on button click
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = html.getAttribute('data-carbon-theme');
      const newTheme = currentTheme === 'white' ? 'g100' : 'white';
      
      html.setAttribute('data-carbon-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
  
  /**
   * Update the theme toggle icon based on current theme
   * @param {string} theme - Current theme ('white' or 'g100')
   */
  function updateThemeIcon(theme) {
    if (!sunIcon || !moonIcon) return;
    
    if (theme === 'g100') {
      // Dark mode - show moon icon
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      // Light mode - show sun icon
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  }
})();

// Made with Bob
