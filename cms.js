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

    // Links: data-cms-href="key.path"
    var linkEls = document.querySelectorAll('[data-cms-href]');
    linkEls.forEach(function(el) {
      var path = el.getAttribute('data-cms-href');
      var val  = resolve(content, path);
      if (val !== null && val !== '') {
        el.setAttribute('href', val);
      }
    });

    // Images: data-cms-src="key.path"
    var imgEls = document.querySelectorAll('[data-cms-src]');
    imgEls.forEach(function(el) {
      var path = el.getAttribute('data-cms-src');
      var val  = resolve(content, path);
      if (val !== null && val !== '') {
        el.setAttribute('src', val);
      }
    });

    // Projects: render into #projects-list-container
    renderProjects(content);

    // Research: render into #research-list-container
    renderResearch(content);
  }

  /**
   * Build a full project/research section element.
   */
  function buildShell(type, num, data) {
    data = data || {};
    var id = type + '-' + num;
    var isProj = (type === 'project');
    var labelText = isProj ? 'PROJECT' : 'ARTICLE';
    var titleText = isProj ? '// DOCUMENT ' + num : '// ARTICLE ' + num;
    var typeClass = isProj ? 'okf-type' : 'res-type';
    var domainClass = isProj ? 'okf-domain' : 'res-domain';
    var statusClass = isProj ? 'okf-status' : 'res-status';
    var yearClass = isProj ? 'okf-year' : 'res-year';
    var titleClass = isProj ? 'proj-title-text' : 'res-title-text';
    var subClass = isProj ? 'proj-subtitle-text' : 'res-subtitle-text';
    var bodyClass = isProj ? 'proj-body' : 'research-body';

    var statusVal = data.status || (isProj ? 'complete' : 'draft');
    var statusCssClass = 'okf-status-' + statusVal;

    var section = document.createElement('section');
    section.className = 'row mt-4';
    section.id = id;

    section.innerHTML = [
      '<div class="col-label">',
      '  <div class="font-mono text-sm text-muted-light" style="line-height:1.8;">',
      '    ' + labelText + '<br />' + num,
      '  </div>',
      '</div>',
      '<div class="col-content">',
      '  <div class="okf-meta">',
      '    <span class="okf-meta-item"><strong>id:</strong> <span>' + id + '</span></span>',
      '    <span class="okf-meta-item"><strong>type:</strong> <span class="' + typeClass + '">' + escHtml(data.type || '') + '</span></span>',
      '    <span class="okf-meta-item"><strong>domain:</strong> <span class="' + domainClass + '">' + escHtml(data.domain || '') + '</span></span>',
      '    <span class="okf-meta-item"><strong>status:</strong> <span class="' + statusClass + ' ' + statusCssClass + '">' + escHtml(statusVal) + '</span></span>',
      '    <span class="okf-meta-item"><strong>year:</strong> <span class="' + yearClass + '">' + escHtml(data.year || '') + '</span></span>',
      '  </div>',
      '  <div class="okf-title-block">',
      '    <span class="proj-num">' + titleText + '</span>',
      '    <div class="font-serif text-lg font-bold mb-1">',
      '      <span class="' + titleClass + '">' + escHtml(data.title || '') + '</span>',
      '    </div>',
      '    <div class="font-mono text-sm text-muted">',
      '      <span class="' + subClass + '">' + escHtml(data.subtitle || '') + '</span>',
      '    </div>',
      '  </div>',
      '  <div class="' + bodyClass + '"></div>',
      '</div>'
    ].join('\n');

    return section;
  }

  /**
   * Render all projects into #projects-list-container.
   * Clears the container first to ensure a clean sync.
   */
  function renderProjects(content) {
    var projs = content.projects || [];
    var container = document.getElementById('projects-list-container');
    if (!container) return;

    // Clear previous content completely for a clean re-render
    container.innerHTML = '';

    if (projs.length === 0) {
      container.innerHTML = '<div class="font-mono text-sm text-muted-lighter" style="padding:40px 0;text-align:center;">No projects yet. Add them via the Admin Panel.</div>';
      return;
    }

    projs.forEach(function(proj, i) {
      var num = String(i + 1).padStart(2, '0');
      var section = buildShell('project', num, proj);

      // Populate the body slot
      var slot = section.querySelector('.proj-body');
      if (slot) {
        var tags = '';
        if (proj.tech) {
          tags = proj.tech.split(',').map(function(t) {
            return '<span class="tech-tag">' + escHtml(t.trim()) + '</span>';
          }).join(' ');
        }

        var c1 = proj.contrib1 || '', c2 = proj.contrib2 || '', c3 = proj.contrib3 || '';
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

        var img1url   = proj.image1   || '';
        var img1label = proj.img1label || ('OUTPUT &mdash; PHOTO 1');
        var img2url   = proj.image2   || '';
        var img2label = proj.img2label || ('DETAIL &mdash; PHOTO 2');

        var photoHtml = '';
        if (img1url || img2url) {
          photoHtml = '<div class="project-photos">';
          if (img1url) {
            photoHtml += '  <div class="project-photo-slot" data-label="Photo 1">';
            photoHtml += '    <img src="' + escAttr(img1url) + '" alt="' + escAttr(img1label) + '" loading="lazy" onerror="this.style.display=\'none\'" />';
            photoHtml += '    <span class="project-photo-label">' + img1label + '</span>';
            photoHtml += '  </div>';
          }
          if (img2url) {
            photoHtml += '  <div class="project-photo-slot" data-label="Photo 2">';
            photoHtml += '    <img src="' + escAttr(img2url) + '" alt="' + escAttr(img2label) + '" loading="lazy" onerror="this.style.display=\'none\'" />';
            photoHtml += '    <span class="project-photo-label">' + img2label + '</span>';
            photoHtml += '  </div>';
          }
          photoHtml += '</div>';
        }

        var linkHtml = proj.link
          ? '<div class="proj-links"><a href="' + escAttr(proj.link) + '" target="_blank">&nearr; View Project</a></div>'
          : '';

        var descHtml = proj.description
          ? '<div class="font-serif text-md mb-3">' + escHtml(proj.description) + '</div>'
          : '';

        slot.innerHTML = descHtml + contribHtml + photoHtml + '<div style="margin-top:12px;">' + tags + '</div>' + linkHtml;
      }

      container.appendChild(section);

      // Add separator HR after each project (except the last)
      if (i < projs.length - 1) {
        var hr = document.createElement('hr');
        hr.className = 'hr-light mb-4 mt-2';
        container.appendChild(hr);
      }
    });
  }

  /**
   * Render all research articles into #research-list-container.
   * Clears the container first to ensure a clean sync.
   */
  function renderResearch(content) {
    var articles = content.research || [];
    var container = document.getElementById('research-list-container');
    if (!container) return;

    // Clear previous content completely for a clean re-render
    container.innerHTML = '';

    if (articles.length === 0) {
      container.innerHTML = '<div class="font-mono text-sm text-muted-lighter" style="padding:40px 0;text-align:center;">No research articles yet. Add them via the Admin Panel.</div>';
      return;
    }

    articles.forEach(function(art, i) {
      var num = String(i + 1).padStart(2, '0');
      var section = buildShell('research', num, art);

      // Populate the body slot
      var slot = section.querySelector('.research-body');
      if (slot) {
        var bylineHtml = '';
        if (art.authors || art.journal) {
          bylineHtml = '<div class="font-mono text-sm text-muted mb-2">';
          if (art.authors) bylineHtml += '<strong>Authors:</strong> ' + escHtml(art.authors);
          if (art.authors && art.journal) bylineHtml += ' &nbsp;&middot;&nbsp; ';
          if (art.journal) bylineHtml += '<strong>Journal:</strong> ' + escHtml(art.journal);
          bylineHtml += '</div>';
        }

        var abstractHtml = '';
        if (art.abstract) {
          abstractHtml = '<div class="font-serif text-md mb-3">' + escHtml(art.abstract) + '</div>';
        }

        var f1 = art.finding1 || '', f2 = art.finding2 || '', f3 = art.finding3 || '';
        var findingsHtml = '';
        if (f1 || f2 || f3) {
          findingsHtml = [
            '<div class="font-serif text-md mb-3">',
            '  <span class="font-mono text-sm text-muted-light">KEY FINDINGS</span>',
            '  <ul class="contrib-list">',
            f1 ? '<li>' + escHtml(f1) + '</li>' : '',
            f2 ? '<li>' + escHtml(f2) + '</li>' : '',
            f3 ? '<li>' + escHtml(f3) + '</li>' : '',
            '  </ul>',
            '</div>'
          ].join('');
        }

        var img1url   = art.image1   || '';
        var img1label = art.img1label || 'FIGURE 1';
        var img2url   = art.image2   || '';
        var img2label = art.img2label || 'FIGURE 2';

        var photoHtml = '';
        if (img1url || img2url) {
          photoHtml = '<div class="project-photos">';
          if (img1url) {
            photoHtml += '  <div class="project-photo-slot" data-label="Figure 1">';
            photoHtml += '    <img src="' + escAttr(img1url) + '" alt="' + escAttr(img1label) + '" loading="lazy" onerror="this.style.display=\'none\'" />';
            photoHtml += '    <span class="project-photo-label">' + img1label + '</span>';
            photoHtml += '  </div>';
          }
          if (img2url) {
            photoHtml += '  <div class="project-photo-slot" data-label="Figure 2">';
            photoHtml += '    <img src="' + escAttr(img2url) + '" alt="' + escAttr(img2label) + '" loading="lazy" onerror="this.style.display=\'none\'" />';
            photoHtml += '    <span class="project-photo-label">' + img2label + '</span>';
            photoHtml += '  </div>';
          }
          photoHtml += '</div>';
        }

        var tags = '';
        if (art.tags) {
          tags = art.tags.split(',').map(function(t) {
            return '<span class="tech-tag">' + escHtml(t.trim()) + '</span>';
          }).join(' ');
        }

        var linkHtml = '';
        if (art.doi || art.link) {
          linkHtml = '<div class="article-links">';
          if (art.doi)  linkHtml += '<a href="' + escAttr(art.doi)  + '" target="_blank">&nearr; DOI / Full Paper</a>';
          if (art.link) linkHtml += '<a href="' + escAttr(art.link) + '" target="_blank">&nearr; View / Download</a>';
          linkHtml += '</div>';
        }

        slot.innerHTML = bylineHtml + abstractHtml + findingsHtml + photoHtml + '<div style="margin-top:12px;">' + tags + '</div>' + linkHtml;
      }

      container.appendChild(section);

      // Add separator HR after each article (except the last)
      if (i < articles.length - 1) {
        var hr = document.createElement('hr');
        hr.className = 'hr-light mb-4 mt-2';
        container.appendChild(hr);
      }
    });
  }

  /* ── Escape helpers ─────────────────────────────────── */
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

  /* ── Fallback content (shown when KV has no data yet) ── */
  var FALLBACK_CONTENT = {
    projects: [
      {
        title: 'JACSU Election Survey Analysis',
        subtitle: 'EDA on Survey Data',
        type: 'case-study',
        domain: 'Policy Research',
        status: 'complete',
        year: '2025',
        description: 'Comprehensive analysis of voter trends among Jahangirnagar University students ahead of the JACSU Election 2025. Provides data-driven insights into political leanings, reform priorities, and attitudes toward leadership.',
        contrib1: 'Designed and distributed structured survey instruments capturing student political inclinations across demographic segments.',
        contrib2: 'Performed exploratory data analysis revealing key voter blocs and reform priority clusters.',
        contrib3: 'Produced visualised reports equipping political stakeholders with actionable campaign strategy insights.',
        tech: 'Python, Pandas, Power BI',
        link: '',
        image1: '',
        img1label: '',
        image2: 'https://res.cloudinary.com/doonxbwcz/image/upload/v1783174710/Screenshot_2026-07-04_201755_cvxopt.png',
        img2label: 'Political Spectrum'
      },
      {
        title: 'Financial Market Predictive Analytics',
        subtitle: 'Portfolio Forecasting & Asset Optimization',
        type: 'case-study',
        domain: 'finance / analytics',
        status: 'complete',
        year: '2024',
        description: 'A stock trend forecasting and risk simulation model based on Modern Portfolio Theory (MPT) principles. Fetches public financial data, runs Monte Carlo allocations, and exports core risk-return metrics.',
        contrib1: 'Automated streaming of ticker histories with Python yfinance API, performing daily data cleanses.',
        contrib2: 'Executed 5,000 portfolio simulation iterations, finding the optimal weights for the Sharpe Ratio.',
        contrib3: 'Crafted interactive dashboards displaying rolling standard deviations, beta values, and asset distributions.',
        tech: 'Python, Pandas, NumPy, Power BI, yfinance, Monte Carlo',
        link: 'https://github.com/touhid95/portfolio',
        image1: '',
        img1label: '',
        image2: '',
        img2label: ''
      },
      {
        title: 'Retail Sales Database Optimization',
        subtitle: 'Database Normalisation & Analytical Queries',
        type: 'database-design',
        domain: 'retail / SQL',
        status: 'complete',
        year: '2024',
        description: 'An enterprise schema refactoring project designed to minimize storage redundancy and accelerate query times. Raw transaction files were modeled into Third Normal Form (3NF) tables.',
        contrib1: 'Structured a 3NF database layout supporting 200,000 purchase logs.',
        contrib2: 'Wrote query pipelines using SQL Common Table Expressions (CTEs), Subqueries, and Window Functions.',
        contrib3: 'Designed retail performance boards mapped onto geographic areas with Tableau heatmaps.',
        tech: 'SQL Server, 3NF Design, Window Functions, CTEs, Tableau',
        link: '',
        image1: '',
        img1label: '',
        image2: '',
        img2label: ''
      },
      {
        title: 'Customer Segmentation & RFM Analysis',
        subtitle: 'Unsupervised Machine Learning & Segment Analysis',
        type: 'ml-analysis',
        domain: 'marketing / data-science',
        status: 'complete',
        year: '2023',
        description: 'An analytical approach to segmenting retail store buyers using historical activity (Recency, Frequency, Monetary). By grouping buyers, businesses can tailor their retention campaigns.',
        contrib1: 'Engineered cohort RFM scores from high-volume transactional audit files.',
        contrib2: 'Applied KMeans clustering algorithms, evaluating clusters via the Elbow method and Silhouette analysis.',
        contrib3: 'Profiled buyer segments, producing customised activation advice for the marketing division.',
        tech: 'Python, Scikit-Learn, Pandas, KMeans Clustering, RFM Modeling, Seaborn',
        link: '',
        image1: '',
        img1label: '',
        image2: '',
        img2label: ''
      },
      {
        title: 'Cadet College Sports Analytics',
        subtitle: 'Historical Sports Records Modeling & Forecasting',
        type: 'sports-analytics',
        domain: 'education / sports',
        status: 'complete',
        year: '2023',
        description: "An athletic performance tracking dashboard consolidating Mirzapur Cadet College's historic scores. This analysis visualizes progress over multiple seasons and forecasts tournament outcomes.",
        contrib1: 'Consolidated, digitised, and normalised sports metrics spanning a 10-year period.',
        contrib2: 'Constructed predictive trends to project house standings under changing constraints.',
        contrib3: 'Configured an automated tracker using Excel VBA scripts to dynamically calculate house margins.',
        tech: 'Python, Excel VBA, Matplotlib, Data Cleaning, Time Series',
        link: '',
        image1: '',
        img1label: '',
        image2: '',
        img2label: ''
      }
    ],
    research: [
      {
        title: 'JACSU Election 2025 — Voter Trend Analysis',
        subtitle: 'A Survey-Based Study of Student Political Inclinations at Jahangirnagar University',
        type: 'research-article',
        domain: 'political science / data science',
        status: 'published',
        year: '2025',
        authors: 'Mahfujul Kader Touhid',
        journal: 'Jahangirnagar University — Independent Research',
        abstract: 'The Jahangirnagar University Central Students\' Union (JUCSU) election is one of the most significant political events in Bangladesh, often referred to as the "Second Parliament." This study provides a comprehensive analysis of voter trends among Jahangirnagar University students ahead of the 2025 election, offering data-driven insights into political leanings, reform priorities, and attitudes toward leadership.',
        finding1: 'Identified distinct political spectrum clusters among students, revealing divergent reform priorities between partisan and independent voter blocs.',
        finding2: 'Quality education and job creation ranked as the top reform priorities across all political affiliations.',
        finding3: 'Youth engagement and willingness to participate in organized political activity has increased significantly post-July Revolution.',
        tags: 'Political Science, EDA, Python, Survey Analysis, Bangladesh',
        doi: '',
        link: '',
        image1: '',
        img1label: '',
        image2: 'https://res.cloudinary.com/doonxbwcz/image/upload/v1783174710/Screenshot_2026-07-04_201755_cvxopt.png',
        img2label: 'Political Spectrum Distribution'
      }
    ]
  };

  /**
   * Fetch content from the API and apply it.
   * Falls back to FALLBACK_CONTENT if KV returns empty.
   */
  function loadContent() {
    fetch('/api/content?t=' + Date.now(), { cache: 'no-store' })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        /* Use API data if it has projects/research, otherwise fall back */
        var projs = data && data.projects ? (Array.isArray(data.projects) ? data.projects : Object.values(data.projects)) : [];
        var arts = data && data.research ? (Array.isArray(data.research) ? data.research : Object.values(data.research)) : [];

        var merged = {};
        if (data && typeof data === 'object') {
          merged = data;
        }
        
        merged.projects = projs.length > 0 ? projs : FALLBACK_CONTENT.projects;
        merged.research = arts.length > 0 ? arts : FALLBACK_CONTENT.research;

        applyContent(merged);
        document.dispatchEvent(new Event('cms-loaded'));
      })
      .catch(function() {
        /* API unavailable — use full fallback */
        applyContent(FALLBACK_CONTENT);
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
