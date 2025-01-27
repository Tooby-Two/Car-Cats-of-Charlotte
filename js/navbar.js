// load-navbar.js

// main.js
$(document).ready(function() {
  // Load the navbar
  $('#navbar-container').load('navbar.html', function(response, status, xhr) {
      if (status === "error") {
          console.log("Error loading navbar: ", xhr.status, xhr.statusText);
      } else {
          // Dark mode script

          const darkModeToggle = document.getElementById('darkModeToggle');
          const body = document.body;

          // Check if a theme is saved in localStorage
          const savedTheme = localStorage.getItem('theme');
          if (savedTheme) {
              body.className = savedTheme; // Apply saved theme
              if (darkModeToggle) {
                  darkModeToggle.checked = savedTheme.includes('bg-dark');                  // Update toggle state
              }
              if (savedTheme.includes('bg-dark')){
                document.body.setAttribute('data-theme', "dark");
              }
          }

          // Event listener for the toggle switch
          if (darkModeToggle) {
              darkModeToggle.addEventListener('change', () => {
                  if (darkModeToggle.checked) {
                      body.className = 'bg-dark text-light'; // Dark mode
                      localStorage.setItem('theme', 'bg-dark text-light');
                      document.body.setAttribute('data-theme', "dark");
                  } else {
                      body.className = 'bg-light text-dark'; // Light mode
                      localStorage.setItem('theme', 'bg-light text-dark');
                      localStorage.setItem('data-theme', 'light');
                      document.body.setAttribute('data-theme', "light");
                  }
              });
          }
      }
  });
});
