// Preview Styles Helper for Decap CMS
// Ensures preview iframes match the live site styling
(function() {
  var injected = false;

  function injectPreviewStyles() {
    if (injected) return;
    injected = true;
    var doc = document;
    var style = doc.createElement('style');
    style.textContent = [
      /* Reset iframe defaults to match live site dark theme */
      'body {',
      '  background: #09090b !important;',
      '  color: #e4e4e7 !important;',
      '  font-family: "Source Sans 3", "Source Sans Pro", system-ui, sans-serif !important;',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '}',
      /* Oswald headings */
      'h1, h2, h3, h4, h5, h6 {',
      '  font-family: "Oswald", system-ui, sans-serif !important;',
      '  font-weight: 600 !important;',
      '  color: #ffffff !important;',
      '  margin: 0 0 0.5em 0 !important;',
      '}',
      /* Links */
      'a { color: #facc15 !important; text-decoration: none !important; }',
      /* Scrollbar */
      '::-webkit-scrollbar { width: 6px; }',
      '::-webkit-scrollbar-track { background: #18181b; }',
      '::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }',
      /* Image fallback */
      'img { max-width: 100%; display: block; }',
      /* Utility classes used by preview templates */
      '.cms-preview-root {',
      '  max-width: 640px;',
      '  margin: 1.5rem auto;',
      '  padding: 0 1rem;',
      '}',
      '.cms-preview-card {',
      '  background: #18181b;',
      '  border: 1px solid #27272a;',
      '  border-radius: 12px;',
      '  overflow: hidden;',
      '}',
      '.cms-preview-badge {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 4px;',
      '  padding: 4px 10px;',
      '  border-radius: 9999px;',
      '  font-size: 11px;',
      '  font-weight: 700;',
      '}',
      '.cms-preview-badge--draft {',
      '  background: #ef4444;',
      '  color: #ffffff;',
      '}',
      '.cms-preview-badge--featured {',
      '  background: #facc15;',
      '  color: #09090b;',
      '}',
      '.cms-preview-badge--archived {',
      '  background: #7c3aed;',
      '  color: #ffffff;',
      '}',
      '.cms-preview-meta {',
      '  color: #a1a1aa;',
      '  font-size: 12px;',
      '}',
      '.cms-preview-empty {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 3rem 1rem;',
      '  color: #52525b;',
      '  font-size: 14px;',
      '  text-align: center;',
      '}',
      '.cms-preview-warning {',
      '  background: rgba(251,191,36,0.1);',
      '  border: 1px solid rgba(251,191,36,0.3);',
      '  color: #facc15;',
      '  padding: 10px 14px;',
      '  border-radius: 8px;',
      '  font-size: 13px;',
      '  margin-bottom: 12px;',
      '}',
    ].join('\n');
    doc.head.appendChild(style);
  }

  window.CMSPreviewStyles = {
    inject: injectPreviewStyles,
    // Helper to create elements with consistent classes
    card: function(children) {
      var el = document.createElement('div');
      el.className = 'cms-preview-card';
      if (children) {
        if (!Array.isArray(children)) children = [children];
        children.forEach(function(c) {
          if (c) el.appendChild(c);
        });
      }
      return el;
    },
    badge: function(text, type) {
      var el = document.createElement('span');
      el.className = 'cms-preview-badge cms-preview-badge--' + (type || 'draft');
      el.textContent = text;
      return el;
    },
    meta: function(text) {
      var el = document.createElement('span');
      el.className = 'cms-preview-meta';
      el.textContent = text;
      return el;
    },
    empty: function(text) {
      var el = document.createElement('div');
      el.className = 'cms-preview-empty';
      el.textContent = text || 'No content to preview';
      return el;
    },
    warning: function(text) {
      var el = document.createElement('div');
      el.className = 'cms-preview-warning';
      el.textContent = text;
      return el;
    }
  };
})();
