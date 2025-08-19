// Popup script for managing Weblate configuration
class WeblatePopup {
  constructor() {
    this.form = document.getElementById('configForm');
    this.statusEl = document.getElementById('status');
    this.saveBtn = document.getElementById('saveBtn');
    this.advancedToggle = document.getElementById('advancedToggle');
    this.advancedContent = document.getElementById('advancedContent');
    
    this.initializeForm();
    this.setupEventListeners();
  }

  async initializeForm() {
    try {
      // Load existing configuration
      const config = await chrome.storage.sync.get([
        'weblateUrl', 
        'apiKey', 
        'targetAttribute',
        'project',
        'component',
        'language',
        'requireMetaTag'
      ]);
      
      // Populate form fields
      if (config.weblateUrl) {
        document.getElementById('weblateUrl').value = config.weblateUrl;
      }
      if (config.apiKey) {
        document.getElementById('apiKey').value = config.apiKey;
      }
      if (config.targetAttribute) {
        document.getElementById('targetAttribute').value = config.targetAttribute;
      } else {
        document.getElementById('targetAttribute').value = 'data-lokalise';
      }
      if (config.project) {
        document.getElementById('project').value = config.project;
      }
      if (config.component) {
        document.getElementById('component').value = config.component;
      }
      if (config.language) {
        document.getElementById('language').value = config.language;
      } else {
        document.getElementById('language').value = 'en';
      }
      
      // Set requireMetaTag checkbox (default to true)
      document.getElementById('requireMetaTag').checked = config.requireMetaTag !== false;
      
    } catch (error) {
      console.error('Failed to load configuration:', error);
      this.showStatus('Failed to load existing configuration', 'error');
    }
  }

  setupEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveConfiguration();
    });

    // Advanced settings toggle
    this.advancedToggle.addEventListener('click', () => {
      this.advancedContent.classList.toggle('show');
      this.advancedToggle.textContent = this.advancedContent.classList.contains('show') 
        ? 'Hide Advanced Settings' 
        : 'Advanced Settings';
    });

    // Test connection button (optional)
    const testBtn = document.createElement('button');
    testBtn.type = 'button';
    testBtn.className = 'btn';
    testBtn.textContent = 'Test Connection';
    testBtn.style.marginTop = '10px';
    testBtn.style.background = '#2196F3';
    testBtn.addEventListener('click', () => this.testConnection());
    
    this.form.insertBefore(testBtn, this.statusEl);
  }

  async saveConfiguration() {
    try {
      this.saveBtn.disabled = true;
      this.saveBtn.textContent = 'Saving...';
      
      const config = {
        weblateUrl: document.getElementById('weblateUrl').value.trim(),
        apiKey: document.getElementById('apiKey').value.trim(),
        targetAttribute: document.getElementById('targetAttribute').value.trim() || 'data-lokalise',
        project: document.getElementById('project').value.trim(),
        component: document.getElementById('component').value.trim(),
        language: document.getElementById('language').value.trim() || 'en',
        requireMetaTag: document.getElementById('requireMetaTag').checked
      };

      // Validate required fields
      if (!config.weblateUrl) {
        throw new Error('Weblate URL is required');
      }
      if (!config.apiKey) {
        throw new Error('API Token is required');
      }

      // Validate URL format
      try {
        new URL(config.weblateUrl);
      } catch {
        throw new Error('Please enter a valid Weblate URL');
      }

      // Save to storage
      await chrome.storage.sync.set(config);
      
      this.showStatus('Configuration saved successfully!', 'success');
      
      // Optionally close popup after a delay
      setTimeout(() => {
        window.close();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to save configuration:', error);
      this.showStatus(error.message, 'error');
    } finally {
      this.saveBtn.disabled = false;
      this.saveBtn.textContent = 'Save Configuration';
    }
  }

  async testConnection() {
    try {
      const testBtn = event.target;
      testBtn.disabled = true;
      testBtn.textContent = 'Testing...';
      
      const config = {
        weblateUrl: document.getElementById('weblateUrl').value.trim(),
        apiKey: document.getElementById('apiKey').value.trim()
      };

      if (!config.weblateUrl || !config.apiKey) {
        throw new Error('Please enter both Weblate URL and API Token');
      }

      // Test the API connection
      const baseUrl = config.weblateUrl.replace(/\/$/, '');
      const testUrl = `${baseUrl}/api/projects/`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.showStatus('Connection successful! API is working.', 'success');
      } else {
        throw new Error(`Connection failed: HTTP ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Connection test failed:', error);
      this.showStatus(`Connection test failed: ${error.message}`, 'error');
    } finally {
      event.target.disabled = false;
      event.target.textContent = 'Test Connection';
    }
  }

  showStatus(message, type) {
    this.statusEl.textContent = message;
    this.statusEl.className = `status ${type}`;
    this.statusEl.classList.remove('hidden');
    
    // Auto-hide success messages
    if (type === 'success') {
      setTimeout(() => {
        this.statusEl.classList.add('hidden');
      }, 3000);
    }
  }
}

// Initialize the popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new WeblatePopup();
});
