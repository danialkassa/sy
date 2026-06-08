// Sync Status Indicator for Decap CMS
// Shows whether the latest CMS changes are live on the site
(function() {
  var SYNC_URL = '/health';
  var REGEN_URL = '/regenerate';

  function createStatusBadge() {
    var badge = document.createElement('div');
    badge.id = 'sync-status-badge';
    badge.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.3s;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
    badge.textContent = 'Checking sync...';
    badge.style.background = '#3f3f46';
    badge.style.color = '#a1a1aa';
    document.body.appendChild(badge);

    badge.addEventListener('click', function() {
      if (badge.dataset.status === 'failed') {
        retrySync();
      }
    });

    return badge;
  }

  function checkSyncStatus() {
    var badge = document.getElementById('sync-status-badge');
    if (!badge) return;

    fetch(SYNC_URL, { method: 'GET' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.status === 'ok') {
          badge.textContent = '● Sync OK';
          badge.style.background = '#166534';
          badge.style.color = '#4ade80';
          badge.dataset.status = 'ok';
        } else {
          badge.textContent = '● Sync Unknown';
          badge.style.background = '#854d0e';
          badge.style.color = '#facc15';
          badge.dataset.status = 'unknown';
        }
      })
      .catch(function() {
        badge.textContent = '● Sync Failed — Click to Retry';
        badge.style.background = '#991b1b';
        badge.style.color = '#fca5a5';
        badge.dataset.status = 'failed';
      });
  }

  function retrySync() {
    var badge = document.getElementById('sync-status-badge');
    if (!badge) return;

    var secret = window.__WEBHOOK_SECRET || '';
    badge.textContent = 'Retrying...';
    badge.style.background = '#3f3f46';
    badge.style.color = '#a1a1aa';

    fetch(REGEN_URL, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + secret }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.success) {
        badge.textContent = '● Sync OK';
        badge.style.background = '#166534';
        badge.style.color = '#4ade80';
        badge.dataset.status = 'ok';
      } else {
        badge.textContent = '● Sync Failed — Click to Retry';
        badge.style.background = '#991b1b';
        badge.style.color = '#fca5a5';
        badge.dataset.status = 'failed';
      }
    })
    .catch(function() {
      badge.textContent = '● Sync Failed — Click to Retry';
      badge.style.background = '#991b1b';
      badge.style.color = '#fca5a5';
      badge.dataset.status = 'failed';
    });
  }

  // Wait for CMS to load, then add the badge
  function init() {
    if (!document.getElementById('sync-status-badge')) {
      createStatusBadge();
      checkSyncStatus();
      // Check every 60 seconds
      setInterval(checkSyncStatus, 60000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
