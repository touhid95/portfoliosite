/**
 * cms.js — Portfolio CMS Content Loader
 * Loads content from /api/content and fills in data-cms elements.
 * Runs silently in background; hardcoded HTML stays as fallback.
 *
 * Usage on any element:
 *   <span data-cms="personal.name">Fallback Text</span>
 *   <a data-cms-href="personal.email" href="mailto:fallback@email.com">Email</a>
 *   <img data-cms-src="projects.0.image1" src="" />
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
        el.style.display = '';
      }
    });

    // Projects: inject body into each #project-XX section
    renderProjects(content);

    // Research: inject body into each #research-XX section
    renderResearch(content);
  }

  /**
   * Render research article body content into the static shell sections.
   * Each section has id="research-01" ... and a <div class="research-body"> slot.
   */
  function renderResearch(content) {
    var articles = content.research;
    if (!articles || !articles.length) return;

    articles.forEach(function(art, i) {
      var num  = String(i + 1).padStart(2, '0');
      var slot = document.querySelector('#research-' + num + ' .research-body');
      if (!slot) return;

      var section = document.getElementById('research-' + num);
      if (section) {
        var metaType   = section.querySelector('.res-type');
        var metaDomain = section.querySelector('.res-domain');
        var metaStatus = section.querySelector('.res-status');
        var metaYear   = section.querySelector('.res-year');
        if (metaType   && art.type)   metaType.textContent   = art.type;
        if (metaDomain && art.domain) metaDomain.textContent = art.domain;
        if (metaStatus && art.status) {
          metaStatus.textContent = art.status;
          metaStatus.className   = 'res-status okf-status-' + art.status;
        }
        if (metaYear   && art.year)   metaYear.textContent   = art.year;
        var titleEl    = section.querySelector('.res-title-text');
        var subtitleEl = section.querySelector('.res-subtitle-text');
        if (titleEl    && art.title)    titleEl.textContent    = art.title;
        if (subtitleEl && art.subtitle) subtitleEl.textContent = art.subtitle;
      }

      // Byline — journal / authors / conference
      var bylineHtml = '';
      if (art.journal || art.authors) {
        bylineHtml = '<div class="research-byline">';
        if (art.authors) bylineHtml += '<strong>Authors:</strong> ' + escHtml(art.authors) + '&nbsp;&nbsp;';
        if (art.journal) bylineHtml += '<strong>In:</strong> ' + escHtml(art.journal);
        bylineHtml += '</div>';
      }

      // Abstract
      var abstractHtml = art.abstract
        ? '<div class="font-serif text-md mb-3">' + escHtml(art.abstract) + '</div>'
        : '';

      // Key findings
      var f1 = art.finding1 || '';
      var f2 = art.finding2 || '';
      var f3 = art.finding3 || '';
      var findingsHtml = '';
      if (f1 || f2 || f3) {
        findingsHtml = [
          '<div class="font-serif text-md mb-3">',
          '  <span class="font-mono text-sm text-muted-light">KEY FINDINGS</span>',
          '  <ul class="findings-list">',
          f1 ? '<li>' + escHtml(f1) + '</li>' : '',
          f2 ? '<li>' + escHtml(f2) + '</li>' : '',
          f3 ? '<li>' + escHtml(f3) + '</li>' : '',
          '  </ul>',
          '</div>'
        ].join('');
      }

      // Two photo slots (figures / charts)
      var img1url   = art.image1    || '';
      var img1label = art.img1label || 'FIGURE 1';
      var img2url   = art.image2    || '';
      var img2label = art.img2label || 'FIGURE 2';
      var photoHtml = [
        '<div class="project-photos">',
        '  <div class="project-photo-slot' + (img1url ? '' : ' ph') + '" data-label="Figure 1">',
        img1url ? '    <img src="' + escAttr(img1url) + '" alt="' + escAttr(img1label) + '" loading="lazy" onerror="this.style.display=\'none\'" />' : '',
        '    <span class="project-photo-label">' + img1label + '</span>',
        '  </div>',
        '  <div class="project-photo-slot' + (img2url ? '' : ' ph') + '" data-label="Figure 2">',
        img2url ? '    <img src="' + escAttr(img2url) + '" alt="' + escAttr(img2label) + '" loading="lazy" onerror="this.style.display=\'none\'" />' : '',
        '    <span class="project-photo-label">' + img2label + '</span>',
        '  </div>',
        '</div>'
      ].join('');

      // Tags
      var tags = '';
      if (art.tags) {
        tags = art.tags.split(',').map(function(t) {
          return '<span class="tech-tag">' + escHtml(t.trim()) + '</span>';
        }).join(' ');
      }

      // Links (DOI, PDF, etc.)
      var linkHtml = '';
      if (art.doi || art.link) {
        linkHtml = '<div class="article-links">';
        if (art.doi)  linkHtml += '<a href="' + escAttr(art.doi)  + '" target="_blank">&nearr; DOI / Full Paper</a>';
        if (art.link) linkHtml += '<a href="' + escAttr(art.link) + '" target="_blank">&nearr; View / Download</a>';
        linkHtml += '</div>';
      }

      slot.innerHTML = [
        bylineHtml,
        abstractHtml,
        findingsHtml,
        photoHtml,
        '<div style="margin-top:12px;">' + tags + '</div>',
        linkHtml
      ].join('');
    });
  }

  /**
   * Render project body content into the static shell sections.
   * Each section has id="project-01" ... "project-04" and
   * a <div class="proj-body"> slot for CMS-injected content.
   */
  function renderProjects(content) {
    var projs = content.projects;
    if (!projs || !projs.length) return;

    projs.forEach(function(proj, i) {
      var num  = String(i + 1).padStart(2, '0');
      var slot = document.querySelector('#project-' + num + ' .proj-body');
      if (!slot) return;

      // Update the static OKF meta header fields
      var section = document.getElementById('project-' + num);
      if (section) {
        // OKF meta items
        var metaType   = section.querySelector('.okf-type');
        var metaDomain = section.querySelector('.okf-domain');
        var metaStatus = section.querySelector('.okf-status');
        var metaYear   = section.querySelector('.okf-year');
        if (metaType   && proj.type)   metaType.textContent   = proj.type;
        if (metaDomain && proj.domain) metaDomain.textContent = proj.domain;
        if (metaStatus && proj.status) {
          metaStatus.textContent  = proj.status;
          metaStatus.className    = 'okf-status-' + proj.status;
        }
        if (metaYear   && proj.year)   metaYear.textContent   = proj.year;
        // Title / subtitle (static already, also update)
        var titleEl    = section.querySelector('.proj-title-text');
        var subtitleEl = section.querySelector('.proj-subtitle-text');
        if (titleEl    && proj.title)    titleEl.textContent    = proj.title;
        if (subtitleEl && proj.subtitle) subtitleEl.textContent = proj.subtitle;
      }

      // Build tech tags
      var tags = '';
      if (proj.tech) {
        tags = proj.tech.split(',').map(function(t) {
          return '<span class="tech-tag">' + escHtml(t.trim()) + '</span>';
        }).join(' ');
      }

      // Contributions
      var c1 = proj.contrib1 || '';
      var c2 = proj.contrib2 || '';
      var c3 = proj.contrib3 || '';
      var contribHtml = '';
      if (c1 || c2 || c3) {
        contribHtml = [
          '<div class="font-serif text-md mb-3">',
          '  <span class="font-mono text-sm text-muted-light">KEY CONTRIBUTIONS</span>',
          '  <ul class="contrib-list">',
          c1 ? '<li>' + escHtml(c1) + '</li>' : '',
          c2 ? '<li>' + escHtml(c2) + '</li>' : '',
          c3 ? '<li>' + escHtml(c3) + '</li>' : '',
          '  </ul>',
          '</div>'
        ].join('');
      }

      // Two photo slots
      var img1url   = proj.image1   || '';
      var img1label = proj.img1label || ('OUTPUT &mdash; PHOTO 1');
      var img2url   = proj.image2   || '';
      var img2label = proj.img2label || ('DETAIL &mdash; PHOTO 2');

      var photoHtml = [
        '<div class="project-photos">',
        '  <div class="project-photo-slot' + (img1url ? '' : ' ph') + '" data-label="Photo 1">',
        img1url
          ? '    <img src="' + escAttr(img1url) + '" alt="' + escAttr(img1label) + '" loading="lazy" onerror="this.style.display=\'none\'" />'
          : '',
        '    <span class="project-photo-label">' + img1label + '</span>',
        '  </div>',
        '  <div class="project-photo-slot' + (img2url ? '' : ' ph') + '" data-label="Photo 2">',
        img2url
          ? '    <img src="' + escAttr(img2url) + '" alt="' + escAttr(img2label) + '" loading="lazy" onerror="this.style.display=\'none\'" />'
          : '',
        '    <span class="project-photo-label">' + img2label + '</span>',
        '  </div>',
        '</div>'
      ].join('');

      // Project link
      var linkHtml = proj.link
        ? '<div class="proj-links"><a href="' + escAttr(proj.link) + '" target="_blank">&nearr; View Project</a></div>'
        : '';

      // Description
      var descHtml = proj.description
        ? '<div class="font-serif text-md mb-3">' + escHtml(proj.description) + '</div>'
        : '';

      // Assemble body
      slot.innerHTML = [
        descHtml,
        contribHtml,
        photoHtml,
        '<div style="margin-top:12px;">' + tags + '</div>',
        linkHtml
      ].join('');
    });
  }

  /* Escape helpers */
  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function escAttr(s) {
    return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
