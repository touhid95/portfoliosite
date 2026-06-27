/**
 * cms.js — Portfolio CMS Content Loader
 * Loads content from /api/content and fills in data-cms elements.
 * Runs silently in background; hardcoded HTML stays as fallback.
 *
 * Usage on any element:
 *   <span data-cms="personal.name">Fallback Text</span>
 *   <a data-cms-href="personal.email" href="mailto:fallback@email.com">Email</a>
 *   <a data-cms-href="personal.linkedin" href="https://fallback.url">LinkedIn</a>
 */

(function() {
  'use strict';

  /**
   * Resolve a dot-path like "personal.name" into a nested object value.
   */
  function resolve(obj, path) {
    return path.split('.').reduce(function(acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : null;
    }, obj);
  }

  /**
   * Apply content to all data-cms elements on the page.
   */
  function applyContent(content) {
    if (!content || typeof content !== 'object') return;

    // Text content: data-cms="key.path"
    var els = document.querySelectorAll('[data-cms]');
    els.forEach(function(el) {
      var path = el.getAttribute('data-cms');
      var val  = resolve(content, path);
      if (val !== null && val !== '') {
        el.textContent = val;
      }
    });

    // HTML content: data-cms-html="key.path"
    var htmlEls = document.querySelectorAll('[data-cms-html]');
    htmlEls.forEach(function(el) {
      var path = el.getAttribute('data-cms-html');
      var val  = resolve(content, path);
      if (val !== null && val !== '') {
        el.innerHTML = val;
      }
    });

    // href attribute: data-cms-href="key.path"
    var hrefEls = document.querySelectorAll('[data-cms-href]');
    hrefEls.forEach(function(el) {
      var path = el.getAttribute('data-cms-href');
      var val  = resolve(content, path);
      if (val !== null && val !== '') {
        el.setAttribute('href', val);
      }
    });

    // src attribute: data-cms-src="key.path"
    var srcEls = document.querySelectorAll('[data-cms-src]');
    srcEls.forEach(function(el) {
      var path = el.getAttribute('data-cms-src');
      var val  = resolve(content, path);
      if (val !== null && val !== '') {
        el.setAttribute('src', val);
      }
    });

    // Projects dynamic rendering
    var projContainer = document.getElementById('cms-projects-container');
    if (projContainer && content.projects && Array.isArray(content.projects) && content.projects.length > 0) {
      projContainer.innerHTML = '';
      content.projects.forEach(function(proj, i) {
        var num = String(i + 1).padStart(2, '0');
        var tags = (proj.tech || '').split(',').map(function(t) {
          return '<span class="tech-tag">' + t.trim() + '</span>';
        }).join('\n');

        var html = [
          '<table width="100%" border="0" cellpadding="0" cellspacing="0">',
          '  <tr valign="top">',
          '    <td width="180">',
          '      <font face="Courier New" size="2" color="#aaaaaa">PROJECT ' + num + '</font>',
          '    </td>',
          '    <td>',
          '      <font face="Georgia" size="4"><b data-cms="projects.' + i + '.title">' + (proj.title || '') + '</b></font>',
          '      <br />',
          '      <font face="Courier New" size="2" color="#888888"><span data-cms="projects.' + i + '.subtitle">' + (proj.subtitle || '') + '</span></font>',
          '      <br /><br />',
          '      <font face="Georgia" size="3"><span data-cms="projects.' + i + '.description">' + (proj.description || '') + '</span></font>',
      proj.link ? '      <br /><br /><font face="Georgia" size="3"><a data-cms-href="projects.' + i + '.link" href="' + proj.link + '" target="_blank">View Project &nearr;</a></font>' : '',
      proj.image ? '      <br /><img data-cms-src="projects.' + i + '.image" src="' + proj.image + '" class="project-img" />' : '',
      '      <br />',
      '      <div style="margin-top: 5px;">' + tags + '</div>',
          '    </td>',
          '  </tr>',
          '</table>',
          '<br /><br />',
          '<hr color="#E0E0E0" size="1" />',
          '<br /><br />'
        ].join('\n');

        projContainer.insertAdjacentHTML('beforeend', html);
      });
    }
  }

  /**
   * Fetch content from the API and apply it.
   */
  function loadContent() {
    fetch('/api/content')
      .then(function(res) { return res.json(); })
      .then(function(data) { 
        applyContent(data);
        document.dispatchEvent(new Event('cms-loaded'));
      })
      .catch(function() { 
        document.dispatchEvent(new Event('cms-loaded'));
      });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();
