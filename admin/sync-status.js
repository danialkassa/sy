// Sync Status Indicator for Decap CMS
// Shows whether the latest CMS changes are live on the site
(function() {
  var SYNC_URL = '/health';
  var REGEN_URL = '/regenerate';
  var lastResult = null;
  var lastCheckTime = null;

  function createStatusBadge() {
    var container = document.createElement('div');
    container.id = 'sync-status-container';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;font-family:sans-serif;';

    var badge = document.createElement('div');
    badge.id = 'sync-status-badge';
    badge.style.cssText = 'padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.3s;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;gap:6px;';
    badge.textContent = 'Checking sync...';
    badge.style.background = '#3f3f46';
    badge.style.color = '#a1a1aa';

    var detail = document.createElement('div');
    detail.id = 'sync-status-detail';
    detail.style.cssText = 'display:none;margin-top:6px;padding:10px 14px;border-radius:8px;background:#18181b;border:1px solid #3f3f46;font-size:12px;color:#d4d4d8;max-width:280px;line-height:1.5;box-shadow:0 4px 12px rgba(0,0,0,0.4);';

    var viewSite = document.createElement('a');
    viewSite.id = 'sync-view-site';
    viewSite.href = '/';
    viewSite.target = '_blank';
    viewSite.textContent = 'View on Site →';
    viewSite.style.cssText = 'display:none;margin-top:8px;padding:6px 12px;border-radius:6px;background:#27272a;border:1px solid #3f3f46;color:#e4e4e7;text-decoration:none;font-size:12px;font-weight:600;text-align:center;transition:all 0.2s;';
    viewSite.onmouseenter = function() { viewSite.style.background = '#3f3f46'; };
    viewSite.onmouseleave = function() { viewSite.style.background = '#27272a'; };

    container.appendChild(badge);
    container.appendChild(detail);
    container.appendChild(viewSite);
    document.body.appendChild(container);

    badge.addEventListener('click', function() {
      if (badge.dataset.status === 'failed' || badge.dataset.status === 'error') {
        retrySync();
      } else {
        // Toggle detail panel
        detail.style.display = detail.style.display === 'none' ? 'block' : 'none';
        viewSite.style.display = detail.style.display;
        updateDetailPanel();
      }
    });

    return badge;
  }

  function updateDetailPanel() {
    var detail = document.getElementById('sync-status-detail');
    if (!detail) return;

    var html = '';
    if (lastCheckTime) {
      html += '<div style="margin-bottom:6px;color:#a1a1aa;">Last check: ' + lastCheckTime.toLocaleTimeString() + '</div>';
    }
    if (lastResult && lastResult.regenerate) {
      html += '<div style="margin-bottom:4px;"><strong>Pipeline Steps:</strong></div>';
      html += stepHtml('npm install', lastResult.npm);
      html += stepHtml('Index Regen', lastResult.regenerate);
      html += stepHtml('HTML Build', lastResult.build);
    } else if (lastResult && lastResult.lastDeploy) {
      var ld = lastResult.lastDeploy;
      html += '<div style="margin-bottom:4px;"><strong>Last Deploy: ' + formatTime(ld.timestamp) + '</strong> (' + ld.status + ')</div>';
      if (ld.steps) {
        html += stepHtml('Git Pull', { success: ld.steps.gitPull === 'success' });
        html += stepHtml('npm install', { success: ld.steps.npmInstall === 'success' });
        html += stepHtml('Index Regen', { success: ld.steps.generateIndex === 'success' });
        html += stepHtml('HTML Build', { success: ld.steps.buildHtml === 'success' });
      }
      if (ld.error) {
        html += '<div style="color:#ef4444;margin-top:4px;">Error: ' + ld.error + '</div>';
      }
    } else if (lastResult && lastResult.error) {
      html += '<div style="color:#ef4444;">' + lastResult.error + '</div>';
    } else {
      html += '<div style="color:#a1a1aa;">Click <strong>Retry</strong> to run the full pipeline.</div>';
    }
    detail.innerHTML = html;
  }

  function formatTime(iso) {
    if (!iso) return 'N/A';
    try {
      var d = new Date(iso);
      return d.toLocaleString();
    } catch(e) { return iso; }
  }

  function stepHtml(name, result) {
    if (!result) return '';
    var ok = result.success;
    var color = ok ? '#22c55e' : '#ef4444';
    var icon = ok ? '&#10003;' : '&#10007;';
    var msg = ok ? 'OK' : (result.error || 'Failed');
    return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">' +
      '<span style="color:' + color + ';">' + icon + '</span> ' + name + ': ' + msg +
      '</div>';
  }

  function checkSyncStatus() {
    var badge = document.getElementById('sync-status-badge');
    if (!badge) return;

    fetch(SYNC_URL, { method: 'GET', cache: 'no-store' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        lastResult = data;
        lastCheckTime = new Date();
        if (data.status === 'ok') {
          var ld = data.lastDeploy;
          var label = ld && ld.timestamp ? 'Synced ' + timeAgo(ld.timestamp) : 'Sync Active';
          badge.innerHTML = '<span style="font-size:10px;">&#9679;</span> ' + label;
          badge.style.background = '#166534';
          badge.style.color = '#4ade80';
          badge.dataset.status = 'ok';
        } else {
          badge.innerHTML = '<span style="font-size:10px;">&#9679;</span> Sync Unknown';
          badge.style.background = '#854d0e';
          badge.style.color = '#facc15';
          badge.dataset.status = 'unknown';
        }
      })
      .catch(function(err) {
        lastCheckTime = new Date();
        badge.innerHTML = '<span style="font-size:10px;">&#9679;</span> Webhook Offline — Click to Retry';
        badge.style.background = '#991b1b';
        badge.style.color = '#fca5a5';
        badge.dataset.status = 'failed';
        lastResult = { error: err.message || 'Cannot reach webhook' };
      });
  }

  function timeAgo(iso) {
    try {
      var diff = (Date.now() - new Date(iso).getTime()) / 1000;
      if (diff < 60) return 'just now';
      if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
      if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
      return Math.floor(diff / 86400) + 'd ago';
    } catch(e) { return ''; }
  }

  function retrySync() {
    var badge = document.getElementById('sync-status-badge');
    var detail = document.getElementById('sync-status-detail');
    if (!badge) return;

    var secret = window.__WEBHOOK_SECRET || '';
    badge.innerHTML = '<span style="font-size:10px;">&#9679;</span> Running pipeline...';
    badge.style.background = '#3f3f46';
    badge.style.color = '#a1a1aa';
    if (detail) detail.style.display = 'none';

    fetch(REGEN_URL, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + secret }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      lastResult = data;
      lastCheckTime = new Date();
      var viewSite = document.getElementById('sync-view-site');
      var allOk = data.success === true || (data.regenerate && data.regenerate.success && data.build && data.build.success);
      if (allOk) {
        badge.innerHTML = '<span style="font-size:10px;">&#9679;</span> Sync Complete';
        badge.style.background = '#166534';
        badge.style.color = '#4ade80';
        badge.dataset.status = 'ok';
        if (viewSite) viewSite.style.display = 'block';
      } else {
        badge.innerHTML = '<span style="font-size:10px;">&#9679;</span> Pipeline Failed — Click for Details';
        badge.style.background = '#991b1b';
        badge.style.color = '#fca5a5';
        badge.dataset.status = 'error';
        detail.style.display = 'block';
        if (viewSite) viewSite.style.display = 'block';
        updateDetailPanel();
      }
    })
    .catch(function(err) {
      lastResult = { error: err.message || 'Request failed' };
      lastCheckTime = new Date();
      badge.innerHTML = '<span style="font-size:10px;">&#9679;</span> Sync Failed — Click to Retry';
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
