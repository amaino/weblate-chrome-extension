# Quick Start Guide

## Installation Steps

1. **Download the Extension**
   - Clone this repository or download as ZIP
   - Extract to a folder on your computer

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extension folder

3. **Configure Weblate**
   - Click the extension icon in Chrome toolbar
   - Enter your Weblate URL (e.g., `https://hosted.weblate.org`)
   - Enter your API token from Weblate Settings → API access
   - Save configuration

## Testing the Extension

1. Open the included `demo.html` file in Chrome
2. You should see small edit icons (✏️) next to highlighted elements
3. Click an icon to test the translation editing dialog

## Adding to Your Website

Add the `data-lokalise` attribute to any HTML element:

```html
<h1 data-lokalise="page_title">My Page Title</h1>
<p data-lokalise="description">Page description text</p>
<button data-lokalise="button_save">Save</button>
```

## Troubleshooting

- **No edit icons appearing**: Check browser console for errors, verify Weblate configuration
- **Cannot load translations**: Verify API token permissions and Weblate URL
- **Cannot save translations**: Check API token write permissions

## API Token Setup

1. Log into your Weblate instance
2. Go to Settings → API access
3. Create a new token with:
   - Read access to translations
   - Write access to translations
4. Copy the token to the extension settings
