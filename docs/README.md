# FIS Bob-a-thon Workshop - GitHub Pages Site

This directory contains the GitHub Pages site for the FIS Bob-a-thon Workshop.

## 🚀 Quick Setup

### 1. Configure Your Repository

Edit [`config.js`](config.js) and update the GitHub username:

```javascript
window.GITHUB_CONFIG = {
  user: 'YOUR_GITHUB_USERNAME',  // ← Change this to your GitHub username
  repo: 'us-fsm-ce-fis-bob-a-thon',
  branch: 'main'
};
```

**Important:** Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username or organization name.

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/docs`
4. Click **Save**

### 3. Access Your Site

Your site will be available at:
```
https://YOUR_GITHUB_USERNAME.github.io/us-fsm-ce-fis-bob-a-thon/
```

GitHub Pages typically takes 1-2 minutes to build and deploy.

---

## 📁 Site Structure

```
docs/
├── index.html              # Homepage with track cards
├── lab.html                # Lab viewer with sidebar navigation
├── 404.html                # Custom error page
├── config.js               # GitHub repository configuration
├── _config.yml             # Jekyll configuration
├── assets/
│   ├── css/
│   │   └── custom.css      # Custom styles with dark mode
│   └── js/
│       ├── theme-toggle.js # Dark/light mode switcher
│       ├── sidebar.js      # Sidebar navigation
│       └── lab-loader.js   # Markdown content loader
└── .github/
    └── workflows/
        └── link-check.yml  # Automated link checking
```

---

## 🎨 Features

### ✅ Modern UI
- IBM Carbon Design System
- Responsive layout (mobile, tablet, desktop)
- Dark/Light mode toggle
- Smooth animations and transitions

### ✅ Navigation
- Sidebar with all labs in current track
- Quick Navigation section to jump between tracks
- Breadcrumb navigation
- Mobile-friendly hamburger menu

### ✅ Content Rendering
- Client-side markdown rendering with Marked.js
- Syntax highlighting with Prism.js (Java, Bash, YAML, Groovy, Python, JSON, JavaScript)
- Copy buttons on all code blocks
- Responsive tables
- Image support with GitHub raw content URLs

### ✅ Smart Path Handling
- Fetches markdown files from GitHub raw content
- Automatically fixes relative links and images
- Converts markdown links to site navigation
- Opens external links in new tabs

---

## 🔧 How It Works

### Content Loading

The site fetches markdown files directly from your GitHub repository using the raw content URL:

```
https://raw.githubusercontent.com/USERNAME/REPO/BRANCH/labs/track/lab.md
```

This means:
- ✅ No need to copy lab files into `docs/`
- ✅ Labs stay in their original location
- ✅ Single source of truth
- ✅ Easy to maintain

### URL Structure

- **Homepage**: `index.html`
- **Track starting page**: `lab.html?track=intro-labs`
- **Specific lab**: `lab.html?track=intro-labs&lab=bob-lab-1-fundamentals`
- **Root-level pages**: `lab.html?page=PREREQUISITES`

### Auto-Detection

If you don't configure `config.js`, the site will attempt to auto-detect your GitHub username from the URL:
- URL: `https://jsmith.github.io/us-fsm-ce-fis-bob-a-thon/`
- Detected username: `jsmith`

However, **manual configuration is recommended** for reliability.

---

## 🛠️ Customization

### Change Repository Name

If you forked the repository with a different name, update `config.js`:

```javascript
window.GITHUB_CONFIG = {
  user: 'your-username',
  repo: 'your-repo-name',  // ← Change this
  branch: 'main'
};
```

### Change Branch

To serve content from a different branch:

```javascript
window.GITHUB_CONFIG = {
  user: 'your-username',
  repo: 'us-fsm-ce-fis-bob-a-thon',
  branch: 'develop'  // ← Change this
};
```

### Modify Styles

Edit [`assets/css/custom.css`](assets/css/custom.css) to customize:
- Colors and themes
- Typography
- Layout and spacing
- Dark mode colors

### Add New Tracks

Edit [`assets/js/sidebar.js`](assets/js/sidebar.js) and add to `sidebarConfig`:

```javascript
'new-track': {
  title: '🎯 New Track',
  items: [
    { title: 'Lab 1: Introduction', path: 'lab1/LAB1_INTRO' },
    { title: 'Lab 2: Advanced', path: 'lab2/LAB2_ADVANCED' }
  ]
}
```

Also update [`assets/js/lab-loader.js`](assets/js/lab-loader.js) `firstLabMap`:

```javascript
const firstLabMap = {
  'intro-labs': 'bob-lab-1-fundamentals',
  'sre': '00_SETUP',
  'app': 'lab1/LAB1_CODE_REVIEW',
  'handoff-labs': 'bob-auto-recovery-self-healing-lab',
  'new-track': 'lab1/LAB1_INTRO'  // ← Add this
};
```

---

## 🐛 Troubleshooting

### Labs Not Loading

**Error**: "Lab not found: ..."

**Solutions**:
1. Verify `config.js` has correct GitHub username
2. Check that the repository is public (or you're logged into GitHub)
3. Verify the branch name is correct (default: `main`)
4. Check browser console for detailed error messages

### Images Not Displaying

**Cause**: Image paths in markdown files must be relative to the repository root.

**Solution**: Images should use paths like:
```markdown
![Screenshot](assets/screenshot.png)           # ✅ Relative to lab directory
![Screenshot](../assets/screenshot.png)        # ✅ Relative to labs directory
![Screenshot](../../assets/screenshot.png)     # ✅ Relative to repo root
```

### Dark Mode Not Working

**Solution**: Clear browser cache and reload. Theme preference is stored in `localStorage`.

### Sidebar Not Showing

**Solution**: Check browser console for JavaScript errors. Ensure all script files are loading correctly.

---

## 📝 Development

### Local Testing

You can test the site locally using any static file server:

```bash
# Using Python
cd docs
python3 -m http.server 8000

# Using Node.js
npx http-server docs -p 8000

# Using PHP
cd docs
php -S localhost:8000
```

Then visit: `http://localhost:8000`

### Testing with Different Configurations

Create a test `config.js`:

```javascript
window.GITHUB_CONFIG = {
  user: 'test-user',
  repo: 'test-repo',
  branch: 'test-branch'
};
```

---

## 🔗 Links

- **Live Site**: https://YOUR_GITHUB_USERNAME.github.io/us-fsm-ce-fis-bob-a-thon/
- **Repository**: https://github.com/YOUR_GITHUB_USERNAME/us-fsm-ce-fis-bob-a-thon
- **IBM Carbon Design**: https://carbondesignsystem.com/
- **Marked.js**: https://marked.js.org/
- **Prism.js**: https://prismjs.com/

---

## 📄 License

This site is part of the FIS Bob-a-thon Workshop. See the main repository for license information.

---

**Made with Bob** 🤖
