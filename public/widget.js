(function() {
  'use strict';
  
  // Get configuration from global variable
  const config = window.RankItProConfig || {};
  const apiKey = config.apiKey;
  const endpoint = config.endpoint || 'https://rankitpro.com';
  
  if (!apiKey) {
    console.error('RankItPro: API key is required');
    return;
  }
  
  // Create namespace
  window.RankItPro = window.RankItPro || {};
  
  // Utility functions
  function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    Object.keys(attributes).forEach(key => {
      if (key === 'className') {
        element.className = attributes[key];
      } else if (key === 'innerHTML') {
        // Sanitize HTML to prevent XSS attacks
        const sanitizedHTML = attributes[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
        element.innerHTML = sanitizedHTML;
      } else {
        element.setAttribute(key, attributes[key]);
      }
    });
    if (content) element.textContent = content;
    return element;
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  function truncateText(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  // API client
  const api = {
    async request(path, options = {}) {
      const url = `${endpoint}/api/public/${path}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      return response.json();
    },
    
    async getCheckIns(companyId, limit = 10) {
      return this.request(`check-ins?company_id=${companyId}&limit=${limit}`);
    },
    
    async getBlogPosts(companyId, limit = 10) {
      return this.request(`blog/published?company_id=${companyId}&limit=${limit}`);
    },
    
    async getReviews(companyId, limit = 10) {
      return this.request(`reviews?company_id=${companyId}&limit=${limit}`);
    },
    
    async getCompanyInfo(companyId) {
      return this.request(`company/${companyId}`);
    }
  };
  
  // CSS injection
  function injectCSS() {
    const css = `
      .rankitpro-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.5;
        color: #333;
        box-sizing: border-box;
      }
      
      .rankitpro-widget * {
        box-sizing: border-box;
      }
      
      .rankitpro-grid {
        display: grid;
        gap: 20px;
        margin: 20px 0;
      }
      
      .rankitpro-grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
      .rankitpro-grid-3 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
      .rankitpro-grid-4 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
      
      .rankitpro-card {
        background: #fff;
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .rankitpro-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      .rankitpro-card-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 10px 0;
        color: #1a1a1a;
      }
      
      .rankitpro-card-meta {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
      }
      
      .rankitpro-card-content {
        font-size: 14px;
        line-height: 1.6;
        color: #555;
      }
      
      .rankitpro-badge {
        display: inline-block;
        padding: 4px 8px;
        background: #e3f2fd;
        color: #1976d2;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        margin-right: 8px;
      }
      
      .rankitpro-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 6px;
        margin-bottom: 12px;
      }
      
      .rankitpro-rating {
        color: #ffc107;
        font-size: 16px;
        margin-bottom: 8px;
      }
      
      .rankitpro-loading {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }
      
      .rankitpro-error {
        background: #ffebee;
        color: #c62828;
        padding: 16px;
        border-radius: 4px;
        border-left: 4px solid #c62828;
        margin: 20px 0;
      }
      
      .rankitpro-link {
        color: #1976d2;
        text-decoration: none;
        font-weight: 500;
      }
      
      .rankitpro-link:hover {
        text-decoration: underline;
      }
      
      .rankitpro-header {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .rankitpro-header h2 {
        margin: 0 0 10px 0;
        font-size: 24px;
        color: #1a1a1a;
      }
      
      .rankitpro-header p {
        margin: 0;
        color: #666;
        font-size: 16px;
      }
    `;
    
    const style = createElement('style', { type: 'text/css' });
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }
  
  // Widget renderers
  const widgets = {
    // Recent Check-ins Widget
    async checkIns(container, options = {}) {
      const { 
        companyId, 
        limit = 6, 
        columns = 3,
        showImages = true,
        title = 'Recent Service Calls'
      } = options;
      
      if (!companyId) {
        container.innerHTML = '<div class="rankitpro-error">Company ID is required for check-ins widget</div>';
        return;
      }
      
      container.innerHTML = '<div class="rankitpro-loading">Loading recent service calls...</div>';
      
      try {
        const data = await api.getCheckIns(companyId, limit);
        const checkIns = data.checkIns || [];
        
        let html = `
          <div class="rankitpro-widget">
            <div class="rankitpro-header">
              <h2>${title}</h2>
              <p>Professional service documentation from our field team</p>
            </div>
            <div class="rankitpro-grid rankitpro-grid-${columns}">
        `;
        
        checkIns.forEach(checkIn => {
          const imageHtml = showImages && checkIn.photos?.length > 0 
            ? `<img src="${checkIn.photos[0]}" alt="Service photo" class="rankitpro-image" loading="lazy">` 
            : '';
          
          html += `
            <div class="rankitpro-card">
              ${imageHtml}
              <div class="rankitpro-card-meta">
                <span class="rankitpro-badge">${checkIn.jobType || 'Service Call'}</span>
                ${formatDate(checkIn.createdAt)}
              </div>
              <h3 class="rankitpro-card-title">${checkIn.customerName || 'Professional Service'}</h3>
              <div class="rankitpro-card-content">
                ${truncateText(checkIn.notes || 'Quality service completed by our professional team.')}
              </div>
            </div>
          `;
        });
        
        html += '</div></div>';
        container.innerHTML = html;
        
      } catch (error) {
        container.innerHTML = '<div class="rankitpro-error">Failed to load service calls. Please try again later.</div>';
        console.error('RankItPro CheckIns Widget Error:', error);
      }
    },
    
    // Blog Posts Widget
    async blog(container, options = {}) {
      const { 
        companyId, 
        limit = 6, 
        columns = 2,
        showImages = true,
        title = 'Latest Updates'
      } = options;
      
      if (!companyId) {
        container.innerHTML = '<div class="rankitpro-error">Company ID is required for blog widget</div>';
        return;
      }
      
      container.innerHTML = '<div class="rankitpro-loading">Loading latest updates...</div>';
      
      try {
        const data = await api.getBlogPosts(companyId, limit);
        const posts = data.posts || [];
        
        let html = `
          <div class="rankitpro-widget">
            <div class="rankitpro-header">
              <h2>${title}</h2>
              <p>Stay informed with our latest news and insights</p>
            </div>
            <div class="rankitpro-grid rankitpro-grid-${columns}">
        `;
        
        posts.forEach(post => {
          const imageHtml = showImages && post.featuredImage 
            ? `<img src="${post.featuredImage}" alt="${post.title}" class="rankitpro-image" loading="lazy">` 
            : '';
          
          html += `
            <div class="rankitpro-card">
              ${imageHtml}
              <div class="rankitpro-card-meta">${formatDate(post.publishDate)}</div>
              <h3 class="rankitpro-card-title">${post.title}</h3>
              <div class="rankitpro-card-content">
                ${truncateText(post.excerpt || post.content)}
              </div>
            </div>
          `;
        });
        
        html += '</div></div>';
        container.innerHTML = html;
        
      } catch (error) {
        container.innerHTML = '<div class="rankitpro-error">Failed to load blog posts. Please try again later.</div>';
        console.error('RankItPro Blog Widget Error:', error);
      }
    },
    
    // Reviews Widget
    async reviews(container, options = {}) {
      const { 
        companyId, 
        limit = 6, 
        columns = 3,
        title = 'Customer Reviews'
      } = options;
      
      if (!companyId) {
        container.innerHTML = '<div class="rankitpro-error">Company ID is required for reviews widget</div>';
        return;
      }
      
      container.innerHTML = '<div class="rankitpro-loading">Loading customer reviews...</div>';
      
      try {
        const data = await api.getReviews(companyId, limit);
        const reviews = data.reviews || [];
        
        let html = `
          <div class="rankitpro-widget">
            <div class="rankitpro-header">
              <h2>${title}</h2>
              <p>See what our customers are saying</p>
            </div>
            <div class="rankitpro-grid rankitpro-grid-${columns}">
        `;
        
        reviews.forEach(review => {
          const stars = '★'.repeat(review.rating || 5) + '☆'.repeat(5 - (review.rating || 5));
          
          html += `
            <div class="rankitpro-card">
              <div class="rankitpro-rating">${stars}</div>
              <div class="rankitpro-card-content">
                "${truncateText(review.feedback || 'Excellent service and professional work.')}"
              </div>
              <div class="rankitpro-card-meta">
                - ${review.customerName || 'Satisfied Customer'}
              </div>
            </div>
          `;
        });
        
        html += '</div></div>';
        container.innerHTML = html;
        
      } catch (error) {
        container.innerHTML = '<div class="rankitpro-error">Failed to load reviews. Please try again later.</div>';
        console.error('RankItPro Reviews Widget Error:', error);
      }
    }
  };
  
  // Auto-initialization for data attributes
  function initializeWidgets() {
    document.querySelectorAll('[data-rankitpro-widget]').forEach(element => {
      const widgetType = element.getAttribute('data-rankitpro-widget');
      const companyId = element.getAttribute('data-company-id') || config.companyId;
      const limit = parseInt(element.getAttribute('data-limit')) || 6;
      const columns = parseInt(element.getAttribute('data-columns')) || 3;
      const showImages = element.getAttribute('data-show-images') !== 'false';
      const title = element.getAttribute('data-title');
      
      const options = { 
        companyId, 
        limit, 
        columns, 
        showImages,
        ...(title && { title })
      };
      
      if (widgets[widgetType]) {
        widgets[widgetType](element, options);
      } else {
        element.innerHTML = `<div class="rankitpro-error">Unknown widget type: ${widgetType}</div>`;
      }
    });
  }
  
  // Expose public API
  window.RankItPro = {
    init: initializeWidgets,
    widgets: widgets,
    api: api
  };
  
  // Inject CSS and auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      injectCSS();
      initializeWidgets();
    });
  } else {
    injectCSS();
    initializeWidgets();
  }
})();