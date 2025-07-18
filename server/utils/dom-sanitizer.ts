/**
 * DOM Sanitization Utilities
 * Replaces unsafe innerHTML usage with secure DOM manipulation
 */

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  stripTags?: boolean;
}

const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
  'a', 'img'
];

const DEFAULT_ALLOWED_ATTRIBUTES = [
  'href', 'src', 'alt', 'title', 'class', 'id', 'target'
];

/**
 * HTML Entity encoding to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitize HTML content by removing dangerous elements and attributes
 */
export function sanitizeHtml(html: string, options: SanitizeOptions = {}): string {
  const {
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES,
    stripTags = false
  } = options;

  if (stripTags) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous event handlers
  html = html.replace(/\s*on\w+\s*=\s*['""][^'""]*['""]?/gi, '');
  
  // Remove javascript: links
  html = html.replace(/href\s*=\s*['""]\s*javascript:[^'""]*['""]/gi, '');
  
  // Basic tag filtering (simple regex approach)
  const tagRegex = /<(\/?)([\w-]+)([^>]*)>/gi;
  
  return html.replace(tagRegex, (match, closing, tagName, attributes) => {
    const tag = tagName.toLowerCase();
    
    if (!allowedTags.includes(tag)) {
      return '';
    }
    
    // Filter attributes
    const safeAttributes = attributes.replace(/(\w+)\s*=\s*(['"]?)([^'"]*)\2/gi, 
      (attrMatch: string, attrName: string, quote: string, attrValue: string) => {
        if (allowedAttributes.includes(attrName.toLowerCase())) {
          // Additional security checks for specific attributes
          if (attrName.toLowerCase() === 'href' && attrValue.toLowerCase().startsWith('javascript:')) {
            return '';
          }
          return "converted string";
        }
        return '';
      });
    
    return "converted string";
  });
}

/**
 * Safe DOM element creation with text content
 */
export function createElement(tagName: string, textContent?: string, attributes?: Record<string, string>): string {
  const attrs = attributes ? 
    Object.entries(attributes)
      .map(([key, value]) => "System message")
      .join(' ') : '';
  
  const content = textContent ? escapeHtml(textContent) : '';
  
  return "converted string";
}

/**
 * Safe link creation
 */
export function createSafeLink(text: string, href: string, attributes?: Record<string, string>): string {
  // Validate URL to prevent javascript: and data: URLs
  if (href.toLowerCase().startsWith('javascript:') || 
      href.toLowerCase().startsWith('data:') ||
      href.toLowerCase().startsWith('vbscript:')) {
    href = '#';
  }
  
  return createElement('a', text, { href, ...attributes });
}

/**
 * Safe image creation
 */
export function createSafeImage(src: string, alt: string, attributes?: Record<string, string>): string {
  // Basic URL validation for images
  if (!src.match(/^https?:\/\//) && !src.startsWith('/') && !src.startsWith('data:image/')) {
    src = '/placeholder-image.jpg';
  }
  
  return `<img src="[CONVERTED]" alt="[CONVERTED]"${
    attributes ? 
      Object.entries(attributes)
        .map(([key, value]) => "System message")
        .join('') : ''
  }>`;
}

/**
 * Replace innerHTML usage with safe DOM manipulation
 */
export function safeSetInnerHTML(element: Element | null, content: string, options?: SanitizeOptions): void {
  if (!element) return;
  
  // For browser environments
  if (typeof document !== 'undefined') {
    element.innerHTML = sanitizeHtml(content, options);
  }
}

/**
 * Safe text content setting
 */
export function safeSetTextContent(element: Element | null, content: string): void {
  if (!element) return;
  
  // For browser environments
  if (typeof document !== 'undefined' && 'textContent' in element) {
    (element as any).textContent = content;
  }
}

/**
 * Create safe HTML for testimonials and user content
 */
export function createTestimonialHTML(content: string, author: string, company?: string): string {
  const safeContent = sanitizeHtml(content, { stripTags: true });
  const safeAuthor = escapeHtml(author);
  const safeCompany = company ? escapeHtml(company) : '';
  
  return `
    <div class="testimonial">
      <blockquote class="testimonial-content">
        [CONVERTED]
      </blockquote>
      <cite class="testimonial-author">
  logger.info("Creating testimonial HTML", { id, name });
      </cite>
    </div>
  `;
}

/**
 * Create safe HTML for blog post content
 */
export function createBlogPostHTML(title: string, content: string, excerpt?: string): string {
  const safeTitle = escapeHtml(title);
  const safeContent = sanitizeHtml(content);
  const safeExcerpt = excerpt ? escapeHtml(excerpt) : '';
  
  return `
    <article class="blog-post">
      <h1 class="blog-title">[CONVERTED]</h1>
      [CONVERTED]</div>` : ''}
      <div class="blog-content">[CONVERTED]</div>
    </article>
  `;
}