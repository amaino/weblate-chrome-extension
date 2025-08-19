// Background script for handling API communication with Weblate
class WeblateAPI {
  constructor() {
    this.setupMessageListener();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getTranslation') {
        this.getTranslation(request.key, request.config).then(sendResponse);
        return true; // Keep the message channel open for async response
      } else if (request.action === 'saveTranslation') {
        this.saveTranslation(request.key, request.translation, request.config).then(sendResponse);
        return true; // Keep the message channel open for async response
      }
    });
  }

  async getTranslation(key, config) {
    try {
      if (!config.weblateUrl || !config.apiKey) {
        return { success: false, error: 'Weblate URL and API key are required' };
      }

      // Clean up the URL
      const baseUrl = config.weblateUrl.replace(/\/$/, '');
      
      // First, try to find the translation unit by key
      // This is a simplified approach - you might need to adjust based on your Weblate setup
      const searchUrl = `${baseUrl}/api/units/?q=${encodeURIComponent(key)}`;
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Return the first matching translation
        const unit = data.results[0];
        return { 
          success: true, 
          translation: unit.target || unit.source || '',
          unit: unit
        };
      } else {
        return { 
          success: true, 
          translation: '', 
          message: 'Translation not found in Weblate' 
        };
      }
    } catch (error) {
      console.error('Error fetching translation:', error);
      return { success: false, error: error.message };
    }
  }

  async saveTranslation(key, translation, config) {
    try {
      if (!config.weblateUrl || !config.apiKey) {
        return { success: false, error: 'Weblate URL and API key are required' };
      }

      // Clean up the URL
      const baseUrl = config.weblateUrl.replace(/\/$/, '');
      
      // First, find the translation unit
      const searchUrl = `${baseUrl}/api/units/?q=${encodeURIComponent(key)}`;
      
      const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!searchResponse.ok) {
        return { success: false, error: `Failed to find translation: HTTP ${searchResponse.status}` };
      }

      const searchData = await searchResponse.json();
      
      if (!searchData.results || searchData.results.length === 0) {
        return { success: false, error: 'Translation unit not found in Weblate' };
      }

      const unit = searchData.results[0];
      const unitUrl = `${baseUrl}/api/units/${unit.id}/`;
      
      // Update the translation
      const updateResponse = await fetch(unitUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: translation
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({}));
        return { 
          success: false, 
          error: `Failed to update translation: HTTP ${updateResponse.status} - ${JSON.stringify(errorData)}` 
        };
      }

      return { success: true, message: 'Translation updated successfully' };
    } catch (error) {
      console.error('Error saving translation:', error);
      return { success: false, error: error.message };
    }
  }
}

// Alternative API methods for different Weblate setups
class WeblateAPIAlternative {
  constructor() {
    this.setupMessageListener();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getTranslation') {
        this.getTranslationByComponent(request.key, request.config).then(sendResponse);
        return true;
      } else if (request.action === 'saveTranslation') {
        this.saveTranslationByComponent(request.key, request.translation, request.config).then(sendResponse);
        return true;
      }
    });
  }

  async getTranslationByComponent(key, config) {
    try {
      // This method assumes you know the project and component
      // You might need to configure these in the extension settings
      const baseUrl = config.weblateUrl.replace(/\/$/, '');
      const project = config.project || 'your-project';
      const component = config.component || 'your-component';
      const language = config.language || 'en';
      
      const translationUrl = `${baseUrl}/api/translations/${project}/${component}/${language}/units/?source=${encodeURIComponent(key)}`;
      
      const response = await fetch(translationUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const unit = data.results[0];
        return { 
          success: true, 
          translation: unit.target || unit.source || '',
          unit: unit
        };
      } else {
        return { 
          success: true, 
          translation: '', 
          message: 'Translation not found' 
        };
      }
    } catch (error) {
      console.error('Error fetching translation:', error);
      return { success: false, error: error.message };
    }
  }

  async saveTranslationByComponent(key, translation, config) {
    try {
      const baseUrl = config.weblateUrl.replace(/\/$/, '');
      const project = config.project || 'your-project';
      const component = config.component || 'your-component';
      const language = config.language || 'en';
      
      // First find the unit
      const searchUrl = `${baseUrl}/api/translations/${project}/${component}/${language}/units/?source=${encodeURIComponent(key)}`;
      
      const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!searchResponse.ok) {
        return { success: false, error: `Failed to find translation: HTTP ${searchResponse.status}` };
      }

      const searchData = await searchResponse.json();
      
      if (!searchData.results || searchData.results.length === 0) {
        return { success: false, error: 'Translation unit not found' };
      }

      const unit = searchData.results[0];
      const unitUrl = `${baseUrl}/api/units/${unit.id}/`;
      
      const updateResponse = await fetch(unitUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: translation
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({}));
        return { 
          success: false, 
          error: `Failed to update: HTTP ${updateResponse.status} - ${JSON.stringify(errorData)}` 
        };
      }

      return { success: true, message: 'Translation updated successfully' };
    } catch (error) {
      console.error('Error saving translation:', error);
      return { success: false, error: error.message };
    }
  }
}

// Initialize the API handler
new WeblateAPI();
