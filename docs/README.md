# Bob-a-thon Workshop - GitHub Pages Site

This directory contains the GitHub Pages site for the Bob-a-thon Workshop. The site provides a modern, user-friendly interface for accessing workshop content with IBM Carbon Design System styling, sidebar navigation, and dark mode support.

## 📁 Directory Structure

```
docs/
├── index.html                    # Homepage with track overview
├── lab.html                      # Lab content viewer with sidebar
├── 404.html                      # Custom error page
├── _config.yml                   # GitHub Pages configuration
├── assets/
│   ├── css/
│   │   └── custom.css           # Custom styles and theme support
│   └── js/
│       ├── theme-toggle.js      # Dark mode switcher
│       ├── sidebar.js           # Sidebar navigation
│       └── lab-loader.js        # Markdown content loader
└── README.md                     # This file
```

## 🔧 Maintenance

### Adding New Labs

1. Add the markdown file to the appropriate `labs/` directory
2. Update the sidebar configuration in `docs/assets/js/sidebar.js`:
   ```javascript
   'your-track': {
     title: '🎯 Your Track',
     items: [
       { title: 'New Lab', path: 'path/to/lab' }
     ]
   }
   ```
3. Commit and push - changes are live immediately

### Updating Existing Content

1. Edit the markdown file in `labs/`
2. Commit and push
3. Refresh the page - changes appear immediately (no build needed)

### Modifying Styles

1. Edit `docs/assets/css/custom.css`
2. Commit and push
3. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R) to see changes

### Updating Navigation

Edit `docs/assets/js/sidebar.js` to modify:
- Track names and icons
- Lab titles and paths
- Navigation structure

## 🎨 Customization

### Changing Colors

Edit CSS variables in `docs/assets/css/custom.css`:

```css
:root {
  --header-height: 48px;
  --sidebar-width: 280px;
}
```

Carbon Design System colors are automatically applied via the `data-carbon-theme` attribute.

### Adding New Tracks

1. Add track configuration to `sidebar.js`:
   ```javascript
   'new-track': {
     title: '🆕 New Track',
     items: [
       { title: 'Lab 1', path: 'lab1' }
     ]
   }
   ```

2. Add track card to `index.html`:
   ```html
   <div class="bx--col-lg-6">
     <div class="bx--tile bx--tile--clickable track-card">
       <div class="track-icon">🆕</div>
       <h3>New Track</h3>
       <p>Description</p>
       <a href="lab.html?track=new-track" class="bx--btn bx--btn--ghost">Start Track →</a>
     </div>
   </div>
   ```
