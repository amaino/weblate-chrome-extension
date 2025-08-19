# Weblate Chrome Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Chrome extension that enables in-context editing of translation strings directly on web pages using the Weblate API.

## Features

- 🔍 **Automatic Detection**: Scans web pages for elements with configurable translation attributes (default: `data-lokalise`)
- ✏️ **In-Context Editing**: Adds hover-activated edit icons inside translatable elements for clean UI
- 🌐 **Weblate Integration**: Fetches and updates translations directly from your Weblate instance
- ⚙️ **Configurable**: Easy setup through extension popup with Weblate URL and API key
- 🎯 **Real-time Updates**: Changes are immediately reflected on the page and saved to Weblate

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The Weblate Editor icon will appear in your extensions toolbar

## Configuration

1. Click the Weblate Editor icon in your browser toolbar
2. Enter your Weblate instance URL (e.g., `https://hosted.weblate.org` or your self-hosted instance)
3. Enter your Weblate API token (get it from Weblate Settings → API access)
4. Optionally configure the target attribute (default: `data-lokalise`)
5. Click "Save Configuration"

### Advanced Settings

For more complex Weblate setups, you can configure:
- **Project**: Specific Weblate project name
- **Component**: Specific Weblate component name  
- **Language**: Target language code (default: `en`)
- **Require Meta Tag**: Only activate on pages with `<meta name="weblate-enabled">` (recommended for security)

## Usage

1. Navigate to any webpage that contains elements with translation attributes
2. Hover over translatable elements to reveal edit icons (✏️) in the top right corner
3. Click an edit icon to open the translation dialog
4. Edit the translation text and click "Save to Weblate"
5. The page content and Weblate translation will be updated immediately

## HTML Markup Requirements

### Page Activation (Recommended)

For security and performance, the extension can be configured to only activate on pages that explicitly opt-in. Add this meta tag to your page's `<head>`:

```html
<meta name="weblate-enabled" content="true">
```

### Alternative Activation Methods

```html
<!-- Option 1: Meta tag (recommended) -->
<meta name="weblate-enabled" content="true">

<!-- Option 2: HTML data attribute -->
<html data-weblate-enabled>

<!-- Option 3: CSS class on html or body -->
<html class="weblate-enabled">
<body class="weblate-enabled">

<!-- Option 4: URL parameter (development only) -->
<!-- Add ?weblate-force=true to any URL -->
```

### Translation Attributes

Add the translation attribute to any HTML element you want to make editable:

```html
<!-- Default attribute -->
<span data-lokalise="welcome_message">Welcome to our site!</span>

<!-- Custom attribute (configure in extension settings) -->
<h1 data-i18n="page_title">Page Title</h1>

<!-- Works with any element -->
<button data-lokalise="button_submit">Submit</button>
<p data-lokalise="description">This is a description.</p>
```

## Weblate API Requirements

This extension requires:
- A Weblate instance with API access enabled
- A valid API token with permissions to read and modify translations
- Translation units that can be found by their source text or key

## File Structure

```
weblate-chrome-extension/
├── manifest.json          # Extension configuration
├── content.js             # Main content script
├── content.css            # Styles for edit icons and dialog
├── background.js          # Background script for API calls
├── popup.html             # Configuration popup interface
├── popup.js               # Popup logic
├── icons/                 # Extension icons
└── README.md              # This file
```

## Development

### API Integration

The extension uses the Weblate REST API v4. Key endpoints:
- `GET /api/units/?q={search}` - Search for translation units
- `PATCH /api/units/{id}/` - Update translation content

### Customization

You can modify the extension for your specific needs:
- Change the default attribute in `content.js`
- Customize the edit icon appearance in `content.css`
- Modify API integration in `background.js`
- Add additional configuration options in `popup.html`

## Troubleshooting

### Common Issues

1. **Edit icons not appearing**
   - Hover over elements with the correct translation attribute
   - Verify Weblate URL and API key are configured
   - Check browser console for errors

2. **Translation not loading**
   - Verify API token has read permissions
   - Check that translation units exist in Weblate
   - Ensure Weblate URL is correct and accessible

3. **Cannot save translations**
   - Verify API token has write permissions
   - Check that the translation unit exists
   - Review Weblate project/component permissions

### Debug Mode

Open browser developer tools (F12) and check the console for detailed error messages.

## Security Notes

- API tokens are stored securely using Chrome's storage API
- All API calls are made from the background script to prevent CORS issues
- The extension only runs on pages where you explicitly configure it

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with your Weblate instance
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the browser console for errors
3. Verify your Weblate API configuration
4. Create an issue on the project repository
