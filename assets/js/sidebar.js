/**
 * Sidebar Navigation
 * Dynamically builds sidebar navigation based on the current track
 */

(function() {
  'use strict';
  
  // Sidebar navigation configuration
  const sidebarConfig = {
    'intro-labs': {
      title: '🎓 Intro Labs',
      items: [
        { title: 'Lab 1: Fundamentals', path: 'bob-lab-1-fundamentals' },
        { title: 'Lab 2: Advanced Features', path: 'bob-lab-2-advanced-features' },
        { title: 'Bob Differentiators', path: 'bob-differentiators' }
      ]
    },
    'sre': {
      title: '🏗️ SRE Track',
      items: [
        { title: 'Lab 0: Setup', path: '00_SETUP' },
        { title: 'Lab 1: PR Review', path: 'lab1/LAB1_PR_REVIEW' },
        { title: 'Lab 2: Unit Testing', path: 'lab2/LAB2_UNIT_TESTING' },
        { title: 'Lab 3: Security Analysis', path: 'lab3/LAB3_SECURITY_ANALYSIS' },
        { title: 'Lab 4: Linting', path: 'lab4/LAB4_LINTING' },
        { title: 'Lab 5: DCR & Jira', path: 'lab5/LAB5_DCR_JIRA' },
        { title: 'Lab 6: Jenkins MCP', path: 'lab6/LAB6_JENKINS_MCP' }
      ]
    },
    'app': {
      title: '💻 App Track',
      items: [
        { title: 'Lab 1: Code Review', path: 'lab1/LAB1_CODE_REVIEW' }
      ]
    },
    'handoff-labs': {
      title: '🚀 Handoff Labs',
      items: [
        { title: 'Auto-Recovery & Self-Healing', path: 'bob-auto-recovery-self-healing-lab' },
        { title: 'OpenShift Deployment', path: 'bob-openshift-deployment-lab' },
        { title: 'Bob Mode Builder', path: 'bob-mode-labs/README' },
        { title: 'Example MCP Servers', path: 'ibm-bob-example-mcp-servers-main/README' }
      ]
    }
  };
  
  // Get current track and lab from URL
  const params = new URLSearchParams(window.location.search);
  const currentTrack = params.get('track');
  const currentLab = params.get('lab');
  const currentPage = params.get('page');
  
  /**
   * Build sidebar navigation based on current track
   */
  function buildSidebar() {
    const sidebarContent = document.getElementById('sidebar-content');
    
    if (!sidebarContent) return;
    
    // If viewing a special page (not a track), show minimal sidebar
    if (currentPage) {
      sidebarContent.innerHTML = `
        <div class="sidebar-special">
          <h3 class="sidebar-title">Navigation</h3>
          <ul class="sidebar-list">
            <li class="sidebar-item">
              <a href="index.html" class="sidebar-link">← Back to Home</a>
            </li>
          </ul>
        </div>
      `;
      return;
    }
    
    // If no track selected, show track selection
    if (!currentTrack || !sidebarConfig[currentTrack]) {
      sidebarContent.innerHTML = `
        <div class="sidebar-empty">
          <p>Select a track to view labs:</p>
          <ul class="sidebar-list">
            <li class="sidebar-item">
              <a href="lab.html?track=intro-labs" class="sidebar-link">🎓 Intro Labs</a>
            </li>
            <li class="sidebar-item">
              <a href="lab.html?track=sre" class="sidebar-link">🏗️ SRE Track</a>
            </li>
            <li class="sidebar-item">
              <a href="lab.html?track=app" class="sidebar-link">💻 App Track</a>
            </li>
            <li class="sidebar-item">
              <a href="lab.html?track=handoff-labs" class="sidebar-link">🚀 Handoff Labs</a>
            </li>
          </ul>
        </div>
      `;
      return;
    }
    
    // Build Quick Navigation section for all tracks
    let html = `
      <div style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--cds-ui-03);">
        <h4 style="font-size: 0.875rem; font-weight: 600; color: var(--cds-text-02); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">Quick Navigation</h4>
        <ul class="sidebar-list" style="margin-bottom: 0;">
    `;
    
    // Add links to all tracks (highlight current track)
    Object.keys(sidebarConfig).forEach(function(trackKey) {
      const trackConfig = sidebarConfig[trackKey];
      const isCurrentTrack = trackKey === currentTrack;
      const trackClass = isCurrentTrack ? 'active' : '';
      html += `
        <li class="sidebar-item ${trackClass}">
          <a href="lab.html?track=${trackKey}" class="sidebar-link" style="font-size: 0.875rem;">
            ${trackConfig.title}
          </a>
        </li>
      `;
    });
    
    html += `
        </ul>
      </div>
    `;
    
    // Build navigation for selected track
    const config = sidebarConfig[currentTrack];
    html += `<h3 class="sidebar-title">${config.title}</h3><ul class="sidebar-list">`;
    
    config.items.forEach(function(item) {
      const isActive = currentLab === item.path;
      const activeClass = isActive ? 'active' : '';
      html += `
        <li class="sidebar-item ${activeClass}">
          <a href="lab.html?track=${currentTrack}&lab=${item.path}" class="sidebar-link">
            ${item.title}
          </a>
        </li>
      `;
    });
    
    html += '</ul>';
    
    // Add back to home link
    html += `
      <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--cds-ui-03);">
        <a href="index.html" class="sidebar-link">← Back to Home</a>
      </div>
    `;
    
    sidebarContent.innerHTML = html;
  }
  
  /**
   * Toggle sidebar on mobile
   */
  function setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (!sidebarToggle || !sidebar) return;
    
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('sidebar-open');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
      if (window.innerWidth < 768 && 
          sidebar && 
          !sidebar.contains(e.target) && 
          !sidebarToggle.contains(e.target) &&
          sidebar.classList.contains('sidebar-open')) {
        sidebar.classList.remove('sidebar-open');
      }
    });
    
    // Close sidebar when clicking a link on mobile
    const sidebarLinks = sidebar.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        if (window.innerWidth < 768) {
          sidebar.classList.remove('sidebar-open');
        }
      });
    });
  }
  
  // Initialize sidebar
  buildSidebar();
  setupSidebarToggle();
})();

// Made with Bob
