// Archive Widget for Decap CMS
// Hides the default delete button and adds visual cues for archiving
(function() {
  function init() {
    if (!document.body) {
      setTimeout(init, 100);
      return;
    }

    // Hide the default delete button in the CMS editor
    var style = document.createElement('style');
    style.textContent = `
      /* Hide default delete button */
      .nc-entryEditor-toolbar-deleteButton,
      [data-testid="delete-button"],
      button[class*="delete"] {
        display: none !important;
      }
      /* Highlight archived items in the collection list */
      .nc-listItem [class*="archived"],
      .nc-listItem[data-archived="true"] {
        opacity: 0.6;
      }
      /* Add a subtle archive icon hint in the editor */
      .nc-entryEditor-container {
        position: relative;
      }
    `;
    document.head.appendChild(style);

    // Add a visual banner when editing an archived item
    function checkArchivedBanner() {
      var fields = document.querySelectorAll('.nc-field');
      fields.forEach(function(field) {
        var label = field.querySelector('label');
        if (label && label.textContent.indexOf('Archive This Item') !== -1) {
          var checkbox = field.querySelector('input[type="checkbox"]');
          if (checkbox && checkbox.checked) {
            // Item is archived — add banner if not already present
            if (!document.getElementById('archive-banner')) {
              var banner = document.createElement('div');
              banner.id = 'archive-banner';
              banner.style.cssText = 'background:#854d0e;color:#facc15;padding:10px 16px;border-radius:6px;margin-bottom:16px;font-size:13px;font-weight:600;';
              banner.textContent = '\u26A0  This item is ARCHIVED. It is hidden from the live website but can be unarchived at any time.';
              var editor = document.querySelector('.nc-entryEditor-container');
              if (editor) {
                editor.insertBefore(banner, editor.firstChild);
              }
            }
          } else {
            // Remove banner if unarchived
            var banner = document.getElementById('archive-banner');
            if (banner) banner.remove();
          }
        }
      });
    }

    // Poll for CMS editor changes
    setInterval(checkArchivedBanner, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
