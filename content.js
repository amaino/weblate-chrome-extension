// Content script that runs on all pages
class WeblateContentEditor {
  constructor() {
    this.targetAttribute = 'data-lokalise'; // Default attribute
    this.config = null;
    this.init();
  }

  async init() {
    // Load configuration from storage first
    await this.loadConfig();
    
    // Then check if this page should have Weblate editing enabled
    if (!this.shouldActivateOnPage()) {
      console.log('Weblate extension: Page not marked for translation editing');
      return;
    }
    
    // Only proceed if we have valid configuration
    if (this.config && this.config.weblateUrl && this.config.apiKey) {
      console.log('Weblate extension: Activated on page');
      this.scanAndAddIcons();
      this.setupMutationObserver();
    }
  }

  shouldActivateOnPage() {
    // If meta tag requirement is disabled, always activate
    if (this.config && this.config.requireMetaTag === false) {
      return true;
    }
    
    // Check for meta tag indicating this page supports Weblate editing
    const metaTag = document.querySelector('meta[name="weblate-enabled"]');
    if (metaTag) {
      return true;
    }
    
    // Check for data attribute on html element
    const htmlElement = document.documentElement;
    if (htmlElement.hasAttribute('data-weblate-enabled')) {
      return true;
    }
    
    // Check for specific class on body or html
    if (document.body && document.body.classList.contains('weblate-enabled')) {
      return true;
    }
    if (htmlElement.classList.contains('weblate-enabled')) {
      return true;
    }
    
    // Optional: Allow override via URL parameter (for development/testing)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('weblate-force') === 'true') {
      return true;
    }
    
    return false;
  }

  async loadConfig() {
    try {
      const result = await chrome.storage.sync.get([
        'weblateUrl', 
        'apiKey', 
        'targetAttribute',
        'requireMetaTag'
      ]);
      this.config = {
        weblateUrl: result.weblateUrl,
        apiKey: result.apiKey,
        targetAttribute: result.targetAttribute || 'data-lokalise',
        requireMetaTag: result.requireMetaTag !== false // Default to true
      };
      this.targetAttribute = this.config.targetAttribute;
    } catch (error) {
      console.error('Failed to load Weblate configuration:', error);
    }
  }

  scanAndAddIcons() {
    // Find all elements with the target attribute
    const elements = document.querySelectorAll(`[${this.targetAttribute}]`);
    
    elements.forEach(element => {
      if (!element.dataset.weblateProcessed) {
        this.addEditIcon(element);
        element.dataset.weblateProcessed = 'true';
      }
    });
  }

  addEditIcon(element) {
    // Create the edit icon
    const icon = document.createElement('div');
    icon.className = 'weblate-edit-icon';
    icon.innerHTML = '✏️';
    icon.title = 'Edit translation';
    
    // Make the element position relative if it's not already positioned
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.position === 'static') {
      element.style.position = 'relative';
    }
    
    // Add hover event listeners to the element to show/hide icon
    element.addEventListener('mouseenter', () => {
      icon.style.opacity = '1';
      icon.style.visibility = 'visible';
    });
    
    element.addEventListener('mouseleave', () => {
      icon.style.opacity = '0';
      icon.style.visibility = 'hidden';
    });
    
    // Add click handler
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.openEditDialog(element);
    });
    
    // Add the icon inside the element
    element.appendChild(icon);
    
    // Store reference for cleanup
    element.dataset.weblateIconId = icon.dataset.iconId = Date.now().toString();
  }

  async openEditDialog(element) {
    const translationKey = element.getAttribute(this.targetAttribute);
    const currentText = element.firstChild.textContent;

    // Create dialog container
    const dialogContainer = document.createElement('div');
    dialogContainer.id = 'weblate-dialog-container';
    dialogContainer.innerHTML = `
      <div class="weblate-dialog-overlay">
        <div class="weblate-dialog">
          <div class="weblate-dialog-header">
            <h3>Edit Translation</h3>
            <button class="weblate-close-btn">&times;</button>
          </div>
          <div class="weblate-dialog-content">
            <div class="weblate-field">
              <label>Translation Key:</label>
              <input type="text" id="translation-key" value="${translationKey}" readonly>
            </div>
            <div class="weblate-field">
              <label>Current Text:</label>
              <textarea id="current-text" rows="3">${currentText}</textarea>
            </div>
            <div class="weblate-field">
              <label>Translation from Weblate:</label>
              <textarea id="weblate-text" rows="3" placeholder="Loading..."></textarea>
            </div>
            <div class="weblate-actions">
              <button id="weblate-save" class="weblate-btn weblate-btn-primary">Save to Weblate</button>
              <button id="weblate-cancel" class="weblate-btn weblate-btn-secondary">Cancel</button>
            </div>
            <div id="weblate-status" class="weblate-status"></div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialogContainer);
    
    // Load current translation from Weblate
    await this.loadTranslationFromWeblate(translationKey);
    
    // Setup event handlers
    this.setupDialogHandlers(element, translationKey);
  }

  async loadTranslationFromWeblate(translationKey) {
    const statusEl = document.getElementById('weblate-status');
    const weblateTextEl = document.getElementById('weblate-text');
    
    try {
      statusEl.textContent = 'Loading translation from Weblate...';
      
      // Send message to background script to fetch translation
      const response = await chrome.runtime.sendMessage({
        action: 'getTranslation',
        key: translationKey,
        config: this.config
      });
      
      if (response.success) {
        weblateTextEl.value = response.translation || '';
        statusEl.textContent = 'Translation loaded successfully';
        statusEl.className = 'weblate-status weblate-status-success';
      } else {
        weblateTextEl.value = '';
        statusEl.textContent = `Error: ${response.error}`;
        statusEl.className = 'weblate-status weblate-status-error';
      }
    } catch (error) {
      console.error('Failed to load translation:', error);
      statusEl.textContent = 'Failed to load translation';
      statusEl.className = 'weblate-status weblate-status-error';
    }
  }

  setupDialogHandlers(element, translationKey) {
    const container = document.getElementById('weblate-dialog-container');
    const saveBtn = document.getElementById('weblate-save');
    const cancelBtn = document.getElementById('weblate-cancel');
    const closeBtn = container.querySelector('.weblate-close-btn');
    const weblateTextEl = document.getElementById('weblate-text');
    const statusEl = document.getElementById('weblate-status');
    
    const closeDialog = () => {
      container.remove();
    };
    
    // Close handlers
    cancelBtn.addEventListener('click', closeDialog);
    closeBtn.addEventListener('click', closeDialog);
    container.addEventListener('click', (e) => {
      if (e.target === container.querySelector('.weblate-dialog-overlay')) {
        closeDialog();
      }
    });
    
    // Save handler
    saveBtn.addEventListener('click', async () => {
      const newTranslation = weblateTextEl.value;
      
      try {
        statusEl.textContent = 'Saving translation to Weblate...';
        statusEl.className = 'weblate-status';
        
        // Send message to background script to save translation
        const response = await chrome.runtime.sendMessage({
          action: 'saveTranslation',
          key: translationKey,
          translation: newTranslation,
          config: this.config
        });
        
        if (response.success) {
          // Update the element's content
          element.textContent = newTranslation;
          statusEl.textContent = 'Translation saved successfully!';
          statusEl.className = 'weblate-status weblate-status-success';
          
          // Close dialog after a short delay
          setTimeout(closeDialog, 1500);
        } else {
          statusEl.textContent = `Error saving: ${response.error}`;
          statusEl.className = 'weblate-status weblate-status-error';
        }
      } catch (error) {
        console.error('Failed to save translation:', error);
        statusEl.textContent = 'Failed to save translation';
        statusEl.className = 'weblate-status weblate-status-error';
      }
    });
  }

  setupMutationObserver() {
    // Watch for DOM changes to add icons to new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node has the target attribute
              if (node.hasAttribute && node.hasAttribute(this.targetAttribute)) {
                this.addEditIcon(node);
              }
              
              // Check for child elements with the target attribute
              const childElements = node.querySelectorAll ? node.querySelectorAll(`[${this.targetAttribute}]`) : [];
              childElements.forEach((child) => {
                if (!child.dataset.weblateProcessed) {
                  this.addEditIcon(child);
                }
              });
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize the content editor when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WeblateContentEditor();
  });
} else {
  new WeblateContentEditor();
}

// Listen for configuration changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.weblateUrl || changes.apiKey || changes.targetAttribute)) {
    // Reload the page to apply new configuration
    location.reload();
  }
});
