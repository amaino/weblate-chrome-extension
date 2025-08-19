# Development Guide

## VS Code Tasks Available

### 🚀 Primary Development Tasks

#### 1. **Start Extension (Batch)** (Recommended)
- **Command**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Extension (Batch)"
- **What it does**: 
  - Starts Chrome with the extension pre-loaded
  - Automatically opens the demo.html page for immediate testing
  - Uses a dedicated Chrome profile for development
  - Shows helpful instructions in the terminal
- **Best for**: Daily development workflow and immediate testing

#### 2. **Load Chrome Extension**
- **Command**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Load Chrome Extension"  
- **What it does**: Opens Chrome with extension loaded using PowerShell
- **Best for**: Quick extension loading

### 🧪 Testing Tasks

#### 3. **Validate Extension**
- **Command**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Validate Extension"
- **What it does**:
  - Validates manifest.json syntax
  - Checks all required files exist
  - Shows extension metadata
  - Provides usage instructions
- **Best for**: Pre-deployment validation

#### 4. **Open Extension Demo Page**
- **Command**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Open Extension Demo Page"
- **What it does**: Opens Chrome with the demo.html page and extension loaded
- **Best for**: Quick testing of extension functionality

#### 5. **Open Chrome Extensions Page**
- **Command**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Open Chrome Extensions Page"
- **What it does**: Opens chrome://extensions/ page with development profile
- **Best for**: Managing extension settings and debugging

### 🔄 Composite Tasks

#### 6. **Start Extension Development**
- **Command**: `Ctrl+Shift+B` (default build task)
- **What it does**: Runs both "Load Chrome Extension" and "Open Extension Demo Page" in sequence
- **Best for**: Complete development setup

## Manual Methods

### Using Batch File
Double-click `start-extension.bat` in the project folder for the simplest startup method. This will automatically:
- Start Chrome with the extension loaded
- Open the demo.html page for immediate testing
- Use an isolated development profile

### Manual Chrome Loading
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder

## Development Workflow

### Initial Setup
1. Run **"Validate Extension"** to ensure everything is correct
2. Run **"Start Extension (Batch)"** to launch Chrome with the extension

### Daily Development
1. Make changes to extension files
2. In Chrome, go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Test changes on demo.html or your target website

### Configuration Testing
1. Click the extension icon in Chrome toolbar
2. Enter test Weblate URL and API key
3. Configure target attribute if needed
4. Test on demo.html page

## Files Structure

```
.vscode/
├── tasks.json              # VS Code task definitions

Extension Files:
├── manifest.json            # Extension configuration
├── content.js              # Main functionality
├── content.css             # Styling
├── background.js           # API integration
├── popup.html              # Settings interface
├── popup.js                # Settings logic

Development Files:
├── start-extension.bat     # Manual startup script
├── validate.js             # Validation script
├── demo.html               # Test page
└── .chrome-dev-profile/    # Development Chrome profile (auto-created)
```

## Debugging Tips

### Extension Not Loading
- Check VS Code terminal output for errors
- Verify Chrome is installed and in PATH
- Try the manual loading method
- Check manifest.json syntax with "Validate Extension" task

### Edit Icons Not Appearing
- Hover over elements with the correct translation attribute to reveal icons
- Verify extension is configured with Weblate URL/API key
- Check browser console for JavaScript errors
- Ensure target elements have the correct attribute (default: `data-lokalise`)
- Test with demo.html first

### API Connection Issues
- Use "Test Connection" button in extension popup
- Verify Weblate URL format (include https://)
- Check API token permissions in Weblate
- Review network tab in browser developer tools

## Hot Reload Development

The extension supports hot reload during development:

1. Make changes to any extension file
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension card
4. Changes will be applied immediately (no need to restart Chrome)

## Keyboard Shortcuts

- `Ctrl+Shift+B` - Run default build task (Start Extension Development)
- `Ctrl+Shift+P` - Open command palette to access all tasks
- `F12` - Open browser developer tools for debugging

## Production Build

When ready to distribute:

1. Run "Validate Extension" task to ensure everything is correct
2. Remove development files (demo.html, validate.js, etc.)
3. Package the extension folder as a ZIP file
4. Upload to Chrome Web Store or distribute privately
