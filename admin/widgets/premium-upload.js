/**
 * NINGBO SIYANG — PREMIUM UPLOAD WIDGET
 *
 * Enhanced drag-and-drop file upload widget for Decap CMS.
 * Features:
 *   - Drag & drop zone with animated border
 *   - Paste from clipboard (Ctrl+V)
 *   - File preview cards with thumbnails
 *   - Upload progress with shimmer effect
 *   - Toast notifications
 *   - Smooth animations throughout
 *
 * Usage in config.yml:
 *   widget: "premium-upload"  (instead of "image" or "file")
 */

(function() {
  'use strict';

  var CMS = window.CMS;
  if (!CMS) return;

  /* ═══════════════════════════════════════════
     CONTROL COMPONENT
     ═══════════════════════════════════════════ */

  var PremiumUploadControl = React.createClass({
    getInitialState: function() {
      return {
        isDragging: false,
        isUploading: false,
        uploadProgress: 0,
        previewUrl: this.props.value || '',
        error: null,
      };
    },

    componentDidMount: function() {
      // Paste listener
      this._onPaste = this.handlePaste.bind(this);
      document.addEventListener('paste', this._onPaste);
    },

    componentWillUnmount: function() {
      document.removeEventListener('paste', this._onPaste);
    },

    handlePaste: function(e) {
      // Only handle paste when this widget is focused/active
      if (!this._el || !this._el.contains(document.activeElement) && document.activeElement !== this._el) return;

      var items = e.clipboardData && e.clipboardData.items;
      if (!items) return;

      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1 || items[i].type.indexOf('pdf') !== -1) {
          e.preventDefault();
          var file = items[i].getAsFile();
          if (file) this.processFile(file);
          break;
        }
      }
    },

    handleDragOver: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({ isDragging: true });
    },

    handleDragLeave: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({ isDragging: false });
    },

    handleDrop: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({ isDragging: false });

      var files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length > 0) {
        this.processFile(files[0]);
      }
    },

    handleFileInput: function(e) {
      var files = e.target.files;
      if (files && files.length > 0) {
        this.processFile(files[0]);
      }
      e.target.value = '';
    },

    processFile: function(file) {
      var self = this;
      var maxSize = 10 * 1024 * 1024; // 10MB

      if (file.size > maxSize) {
        self.setState({ error: 'File too large. Maximum size is 10MB.' });
        if (window.CMSToast) window.CMSToast.error('File exceeds 10MB limit');
        return;
      }

      self.setState({ isUploading: true, uploadProgress: 0, error: null });

      // Show preview for images
      if (file.type.startsWith('image/')) {
        var reader = new FileReader();
        reader.onload = function(e) {
          self.setState({ previewUrl: e.target.result });
        };
        reader.readAsDataURL(file);
      }

      // Simulate upload progress (Decap CMS handles actual upload via media library)
      var progress = 0;
      var interval = setInterval(function() {
        progress += Math.random() * 25 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Use CMS media library to persist the file
          self.uploadViaMediaLibrary(file);
        }
        self.setState({ uploadProgress: Math.min(progress, 100) });
      }, 120);
    },

    uploadViaMediaLibrary: function(file) {
      var self = this;

      // Try to use the CMS media library insert function
      if (this.props.onAddAsset) {
        // Decap CMS internal API
        var assetProxy = {
          file: file,
          path: this.props.field.get('media_folder') || 'images',
        };
        this.props.onAddAsset(assetProxy);
      }

      // Fallback: create object URL and set value
      var url = URL.createObjectURL(file);
      var fileName = file.name;

      // For the CMS, we need to set the value to the path where the file will be stored
      // The actual upload is handled by the CMS backend
      var mediaFolder = this.props.field && this.props.field.get ?
        (this.props.field.get('media_folder') || '/images') : '/images';
      var relativePath = mediaFolder + '/' + fileName;

      self.setState({ isUploading: false, previewUrl: url });
      self.props.onChange(relativePath);

      if (window.CMSToast) {
        window.CMSToast.success('File uploaded: ' + fileName);
      }
    },

    handleRemove: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({ previewUrl: '', isUploading: false, uploadProgress: 0 });
      this.props.onChange('');
    },

    openFileDialog: function() {
      if (this._fileInput) this._fileInput.click();
    },

    render: function() {
      var self = this;
      var state = this.state;
      var value = state.previewUrl || this.props.value || '';
      var hasValue = !!value;

      var dragActive = state.isDragging;
      var uploading = state.isUploading;

      // File type detection
      var isImage = false;
      var fileName = '';
      if (typeof value === 'string') {
        isImage = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(value);
        fileName = value.split('/').pop() || value;
      }

      return React.createElement('div', {
        ref: function(el) { self._el = el; },
        className: 'premium-upload-widget',
        tabIndex: 0,
        style: { outline: 'none' }
      },

        // Drop zone
        React.createElement('div', {
          className: 'pu-dropzone' + (dragActive ? ' pu-dropzone--active' : '') + (hasValue ? ' pu-dropzone--has-file' : ''),
          onDragOver: this.handleDragOver,
          onDragLeave: this.handleDragLeave,
          onDrop: this.handleDrop,
          onClick: this.openFileDialog,
        },

          // Hidden file input
          React.createElement('input', {
            ref: function(el) { self._fileInput = el; },
            type: 'file',
            accept: 'image/*,.pdf,.doc,.docx',
            style: { display: 'none' },
            onChange: this.handleFileInput,
          }),

          // Preview or placeholder
          hasValue ? (

            // Preview card
            React.createElement('div', { className: 'pu-preview-card' },

              isImage ? React.createElement('div', { className: 'pu-preview-image-wrap' },
                React.createElement('img', {
                  src: state.previewUrl || value,
                  alt: fileName,
                  className: 'pu-preview-image',
                }),
                // Hover overlay
                React.createElement('div', { className: 'pu-preview-overlay' },
                  React.createElement('span', { className: 'pu-preview-filename' }, fileName)
                )
              ) : React.createElement('div', { className: 'pu-preview-file' },
                React.createElement('div', { className: 'pu-file-icon' },
                  React.createElement('svg', { width: 32, height: 32, fill: 'none', stroke: '#facc15', viewBox: '0 0 24 24' },
                    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 1.5, d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
                  )
                ),
                React.createElement('div', { className: 'pu-file-name' }, fileName)
              ),

              // Remove button
              React.createElement('button', {
                type: 'button',
                className: 'pu-remove-btn',
                onClick: this.handleRemove,
                title: 'Remove file',
                'aria-label': 'Remove file',
              },
                React.createElement('svg', { width: 14, height: 14, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
                  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
                )
              )
            )

          ) : (

            // Empty state / drop zone
            React.createElement('div', { className: 'pu-dropzone-content' },
              React.createElement('div', { className: 'pu-dropzone-icon' + (dragActive ? ' pu-dropzone-icon--active' : '') },
                React.createElement('svg', { width: 48, height: 48, fill: 'none', stroke: dragActive ? '#facc15' : '#71717a', viewBox: '0 0 24 24' },
                  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 1.5, d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' })
                ),
                dragActive && React.createElement('div', { className: 'pu-dropzone-sparkle' }, '\u2728')
              ),
              React.createElement('p', { className: 'pu-dropzone-title' },
                dragActive ? 'Drop your file here!' : 'Drag & drop your file'
              ),
              React.createElement('p', { className: 'pu-dropzone-subtitle' },
                React.createElement('span', null, 'or '),
                React.createElement('span', { className: 'pu-dropzone-browse' }, 'browse from device'),
                React.createElement('span', null, ' \u00B7 '),
                React.createElement('span', { className: 'pu-dropzone-paste' }, 'Ctrl+V to paste')
              ),
              React.createElement('p', { className: 'pu-dropzone-hint' }, 'Images, PDFs, Documents (Max 10MB)')
            )
          )
        ),

        // Upload progress bar
        uploading && React.createElement('div', { className: 'pu-progress-wrap' },
          React.createElement('div', { className: 'pu-progress-bar' },
            React.createElement('div', {
              className: 'pu-progress-fill',
              style: { width: state.uploadProgress + '%' }
            }),
            React.createElement('div', { className: 'pu-progress-shimmer' })
          ),
          React.createElement('span', { className: 'pu-progress-text' },
            'Uploading... ' + Math.round(state.uploadProgress) + '%'
          )
        ),

        // Error message
        state.error && React.createElement('div', { className: 'pu-error' }, state.error)
      );
    }
  });

  /* ═══════════════════════════════════════════
     PREVIEW COMPONENT
     ═══════════════════════════════════════════ */

  var PremiumUploadPreview = React.createClass({
    render: function() {
      var value = this.props.value || '';
      if (!value) {
        return React.createElement('div', { className: 'pu-preview-empty' }, 'No file selected');
      }

      var isImage = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(value);

      if (isImage) {
        return React.createElement('img', {
          src: value,
          alt: 'Preview',
          style: { maxWidth: '100%', borderRadius: '8px', border: '1px solid #27272a' }
        });
      }

      return React.createElement('div', {
        style: {
          padding: '12px 16px',
          background: '#18181b',
          borderRadius: '8px',
          border: '1px solid #27272a',
          color: '#d4d4d8',
          fontSize: '14px',
        }
      }, value.split('/').pop());
    }
  });

  /* ═══════════════════════════════════════════
     REGISTER WIDGET
     ═══════════════════════════════════════════ */

  CMS.registerWidget('premium-upload', PremiumUploadControl, PremiumUploadPreview);

  console.log('%c[Premium Upload] Widget registered', 'color: #facc15; font-weight: bold;');

})();
