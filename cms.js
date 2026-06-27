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
    if (projContainer && content.projects && (Array.isArray(content.projects) || typeof content.projects === 'object') && Object.keys(content.projects).length > 0) {
      projContainer.innerHTML = '';
      Object.values(content.projects).forEach(function(proj, i) {
        var num = String(i + 1).padStart(2, '0');
        var tags = (proj.tech || '').split(',').map(function(t) {
          return '<span class="tech-tag">' + t.trim() + '</span>';
        }).join('\n');

        var defC1 = "", defC2 = "", defC3 = "";
        if (i === 0) {
          defC1 = "Automated streaming of ticker histories with python `yfinance` api, performing daily data cleanses.";
          defC2 = "Executed 5,000 portfolio simulation iterations, finding the optimal weights for the Sharpe Ratio.";
          defC3 = "Crafted interactive dashboards displaying rolling standard deviations, beta values, and asset distributions.";
        } else if (i === 1) {
          defC1 = "Structured a 3NF database layout supporting 200,000 purchase logs.";
          defC2 = "Wrote query pipelines using SQL Common Table Expressions (CTEs), Subqueries, and Window Functions.";
          defC3 = "Designed retail performance boards mapped onto geographic areas with Tableau heatmaps.";
        } else if (i === 2) {
          defC1 = "Engineered cohort RFM scores from high-volume transactional audit files.";
          defC2 = "Applied KMeans clustering algorithms, evaluating clusters via the Elbow method and Silhouette analysis.";
          defC3 = "Profiled buyer segments, producing customized activation advice for the marketing division.";
        } else if (i === 3) {
          defC1 = "Consolidated, digitized, and normalized sports metrics spanning a 10-year period.";
          defC2 = "Constructed predictive trends to project house standings under changing constraints.";
          defC3 = "Configured an automated tracker using Excel VBA scripts to dynamically calculate house margins.";
        }
        var c1 = proj.contrib1 || defC1;
        var c2 = proj.contrib2 || defC2;
        var c3 = proj.contrib3 || defC3;

        var html = [
          '<section class="row mt-4">',
          '  <div class="col-label font-mono text-sm text-muted-light">PROJECT ' + num + '</div>',
          '  <div class="col-content">',
          '    <div class="font-serif text-lg font-bold mb-1"><span data-cms="projects.' + i + '.title">' + (proj.title || '') + '</span></div>',
          '    <div class="font-mono text-sm text-muted mb-3"><span data-cms="projects.' + i + '.subtitle">' + (proj.subtitle || '') + '</span></div>',
          '    <div class="font-serif text-md mb-3">',
          '      <span data-cms="projects.' + i + '.description">' + (proj.description || '') + '</span>',
          '    </div>',
          '    <div class="font-serif text-md mb-3">',
          '      <b>Key Contributions:</b>',
          '      <ul style="margin: 5px 0 0 20px; padding: 0; color: #555;">',
          '        <li><span data-cms="projects.' + i + '.contrib1">' + c1 + '</span></li>',
          '        <li><span data-cms="projects.' + i + '.contrib2">' + c2 + '</span></li>',
          '        <li><span data-cms="projects.' + i + '.contrib3">' + c3 + '</span></li>',
          '      </ul>',
          '    </div>',
      proj.link ? '    <div class="font-serif text-md mb-3"><a data-cms-href="projects.' + i + '.link" href="' + proj.link + '" target="_blank" class="text-blue">View Project &nearr;</a></div>' : '',
      proj.image ? '    <img data-cms-src="projects.' + i + '.image" src="' + proj.image + '" class="project-img" onerror="this.style.display=\'none\'" />' : '',
      '    <div style="margin-top: 5px;">' + tags + '</div>',
          '  </div>',
          '</section>',
          '<hr class="hr-light mb-4 mt-4" />'
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
