/**
 * Lab Content Loader
 * Fetches and renders markdown content from lab files
 */

(function() {
  'use strict';
  
  // Get GitHub configuration from config.js
  const config = window.GITHUB_CONFIG || {};
  
  // Auto-detect GitHub username from URL if not configured
  let GITHUB_USER = config.user;
  
  // Check if user needs to be auto-detected
  if (!GITHUB_USER || GITHUB_USER === 'YOUR_GITHUB_USERNAME' || GITHUB_USER.trim() === '') {
    // Try to extract from GitHub Pages URL
    if (window.location.hostname.includes('github.io')) {
      // Extract username from hostname (e.g., jrtorres.github.io -> jrtorres)
      GITHUB_USER = window.location.hostname.split('.')[0];
      console.log('Auto-detected GitHub username from URL:', GITHUB_USER);
    } else {
      // Fallback for local development - show helpful error
      console.error('Cannot auto-detect GitHub username. Please update config.js with your GitHub username.');
      GITHUB_USER = 'YOUR_GITHUB_USERNAME';
    }
  }
  
  const GITHUB_REPO = config.repo || 'us-fsm-ce-fis-bob-a-thon';
  const GITHUB_BRANCH = config.branch || 'main';
  
  // Log configuration for debugging
  console.log('GitHub Pages Configuration:', {
    user: GITHUB_USER,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
    baseUrl: `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}`
  });
  
  // Base URL for raw content
  const RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;
  
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const track = params.get('track');
  const lab = params.get('lab');
  const page = params.get('page');
  
  // Determine markdown file path
  let markdownPath;
  let shouldLoadFirstLab = false;
  
  if (page) {
    // Root level files (e.g., PREREQUISITES.md, README.md)
    markdownPath = `${RAW_BASE_URL}/${page}.md`;
  } else if (track && lab) {
    // Lab files within a track
    markdownPath = `${RAW_BASE_URL}/labs/${track}/${lab}.md`;
  } else if (track) {
    // Track specified but no lab - redirect to first lab
    shouldLoadFirstLab = true;
  }
  
  /**
   * Fetch and render markdown content
   */
  async function loadLab() {
    const labContent = document.getElementById('lab-content');
    
    if (!labContent) return;
    
    // If track specified but no lab, redirect to first lab in that track
    if (shouldLoadFirstLab) {
      redirectToFirstLab(track);
      return;
    }
    
    if (!markdownPath) {
      labContent.innerHTML = `
        <div class="bx--inline-notification bx--inline-notification--info">
          <div class="bx--inline-notification__details">
            <p class="bx--inline-notification__title">No lab selected</p>
            <p class="bx--inline-notification__subtitle">
              Please select a lab from the sidebar or <a href="index.html">return to homepage</a>.
            </p>
          </div>
        </div>
      `;
      return;
    }
    
    try {
      const response = await fetch(markdownPath);
      
      if (!response.ok) {
        throw new Error(`Lab not found: ${markdownPath}`);
      }
      
      const markdown = await response.text();
      
      // Configure marked for syntax highlighting and GitHub Flavored Markdown
      marked.setOptions({
        highlight: function(code, lang) {
          if (lang && Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
          }
          return code;
        },
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
      });
      
      // Convert markdown to HTML
      const html = marked.parse(markdown);
      
      // Render in page
      labContent.innerHTML = html;
      
      // Post-processing
      addCopyButtons();
      fixRelativeLinks();
      addTableWrappers();
      
      // Scroll to top
      window.scrollTo(0, 0);
      
      // Update page title
      updatePageTitle();
      
    } catch (error) {
      console.error('Error loading lab:', error);
      labContent.innerHTML = `
        <div class="bx--inline-notification bx--inline-notification--error">
          <div class="bx--inline-notification__details">
            <p class="bx--inline-notification__title">Error loading lab</p>
            <p class="bx--inline-notification__subtitle">${error.message}</p>
            <p class="bx--inline-notification__subtitle">
              <a href="index.html">Return to homepage</a> or 
              <a href="javascript:location.reload()">try again</a>
            </p>
          </div>
        </div>
      `;
    }
  }
  
  /**
   * Add copy buttons to code blocks
   */
  function addCopyButtons() {
    document.querySelectorAll('pre code').forEach(function(block) {
      // Skip if button already exists
      if (block.parentElement.querySelector('.copy-btn')) return;
      
      const button = document.createElement('button');
      button.className = 'bx--btn bx--btn--sm bx--btn--ghost copy-btn';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      
      button.onclick = function() {
        navigator.clipboard.writeText(block.textContent).then(function() {
          button.textContent = 'Copied!';
          setTimeout(function() {
            button.textContent = 'Copy';
          }, 2000);
        }).catch(function(err) {
          console.error('Failed to copy:', err);
          button.textContent = 'Failed';
          setTimeout(function() {
            button.textContent = 'Copy';
          }, 2000);
        });
      };
      
      block.parentElement.style.position = 'relative';
      block.parentElement.appendChild(button);
    });
  }
  
  /**
   * Fix relative links in markdown to work with GitHub Pages
   */
  function fixRelativeLinks() {
    const labContent = document.getElementById('lab-content');
    if (!labContent) return;
    
    // Fix image paths to point to GitHub raw content
    labContent.querySelectorAll('img').forEach(function(img) {
      const src = img.getAttribute('src');
      
      // Skip external images
      if (!src || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
        return;
      }
      
      // Convert relative image paths to GitHub raw URLs
      let newSrc;
      if (src.startsWith('../')) {
        // Path relative to repo root
        newSrc = `${RAW_BASE_URL}/${src.substring(3)}`;
      } else if (src.startsWith('./')) {
        // Path relative to current lab
        newSrc = `${RAW_BASE_URL}/labs/${track}/${src.substring(2)}`;
      } else if (!src.startsWith('/')) {
        // Relative path without prefix
        newSrc = `${RAW_BASE_URL}/labs/${track}/${src}`;
      }
      
      if (newSrc) {
        img.setAttribute('src', newSrc);
      }
    });
    
    // Fix links to other markdown files
    labContent.querySelectorAll('a[href$=".md"]').forEach(function(link) {
      const href = link.getAttribute('href');
      
      // Skip external links
      if (href.startsWith('http://') || href.startsWith('https://')) {
        return;
      }
      
      // Convert relative markdown links to lab.html links
      if (href.startsWith('../')) {
        // Link to another track
        const parts = href.split('/');
        if (parts.length >= 3) {
          const targetTrack = parts[1];
          const targetLab = parts.slice(2).join('/').replace('.md', '');
          link.setAttribute('href', `lab.html?track=${targetTrack}&lab=${targetLab}`);
        }
      } else if (href.startsWith('./') || !href.startsWith('/')) {
        // Link within same track
        const targetLab = href.replace('./', '').replace('.md', '');
        if (track) {
          link.setAttribute('href', `lab.html?track=${track}&lab=${targetLab}`);
        }
      }
    });
    
    // Make external links open in new tab
    labContent.querySelectorAll('a[href^="http"]').forEach(function(link) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }
  
  /**
   * Wrap tables in responsive containers
   */
  function addTableWrappers() {
    document.querySelectorAll('#lab-content table').forEach(function(table) {
      if (!table.parentElement.classList.contains('table-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        wrapper.style.overflowX = 'auto';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });
  }
  
  /**
   * Update page title based on content
   */
  function updatePageTitle() {
    const h1 = document.querySelector('#lab-content h1');
    if (h1) {
      document.title = `${h1.textContent} - FIS Bob-a-thon Workshop`;
    }
  }
  
  /**
   * Redirect to first lab in a track
   */
  function redirectToFirstLab(track) {
    const firstLabMap = {
      'intro-labs': 'bob-lab-1-fundamentals',
      'sre': '00_SETUP',
      'app': 'lab1/LAB1_CODE_REVIEW',
      'handoff-labs': 'bob-auto-recovery-self-healing-lab'
    };
    
    const firstLab = firstLabMap[track];
    if (firstLab) {
      window.location.href = `lab.html?track=${track}&lab=${firstLab}`;
    } else {
      document.getElementById('lab-content').innerHTML = `
        <div class="bx--inline-notification bx--inline-notification--warning">
          <div class="bx--inline-notification__details">
            <p class="bx--inline-notification__title">Track not found</p>
            <p class="bx--inline-notification__subtitle">
              The track "${track}" doesn't exist. <a href="index.html">Return to homepage</a> to select a valid track.
            </p>
          </div>
        </div>
      `;
    }
  }
  
  // Load the lab when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLab);
  } else {
    loadLab();
  }
})();

// Made with Bob
