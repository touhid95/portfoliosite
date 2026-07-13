/*!
 * Portfolio AI Assistant — Chat Widget v3
 * Neutral assistant branding (no hardcoded owner name in UI)
 * Session-persistent · Gemini/NVIDIA powered · Offline KB fallback
 */
(function () {
  'use strict';

  /* ── CONFIG ───────────────────────────────────────────── */
  var API   = '/api/chat';
  var SK    = 'pac_v3';       // session storage key
  var SPEED = 14;             // typewriter ms/char
  var DELAY = 480;            // ms before AI starts typing

  var QUICK = [
    'Who is this portfolio about?',
    'What are the key skills?',
    'Tell me about the projects',
    'What is the educational background?',
    'How can I get in touch?'
  ];

  /* ── OFFLINE FALLBACK KB ──────────────────────────────── */
  /*
   * This mirrors the hard facts from the knowledge base so the
   * widget works fully offline (local dev / API not configured).
   * It is NOT used when the API is reachable.
   */
  var KB = [
    {
      k: ['who', 'introduce', 'name', 'person', 'portfolio', 'yourself'],
      r: 'This portfolio belongs to Mahfujul Kader Touhid — a Data Analyst and BBA undergraduate at IBA, Jahangirnagar University. He is passionate about data science and finance, with a goal to become a data-driven decision-maker. His strengths: learns fast, maintains deadlines, and thrives under pressure.'
    },
    {
      k: ['skill', 'know', 'tech', 'expertise', 'capable', 'good at', 'proficient'],
      r: 'Key skills include: SQL (5-star Gold on HackerRank), Python (Pandas, NumPy, Matplotlib, Seaborn), Power BI, Tableau, Microsoft Excel, and R. Additional tools: MS Office, Prezi, Photoshop, and Illustrator. Certified in Data Science, SQL, Python, R, and HTML (Sololearn).'
    },
    {
      k: ['project', 'work', 'portfolio', 'built', 'made', 'developed', 'case'],
      r: 'Projects include: (1) Financial Market Predictive Analytics — stock forecasting in Python & Power BI; (2) Retail Sales Database Optimization — 3NF design, Window Functions, CTEs, Tableau; (3) Customer Segmentation — KMeans RFM clustering in Python; (4) Cadet College Sports Analytics — tracking & visualization in Python/Excel. More at github.com/touhid95/portfolio.'
    },
    {
      k: ['education', 'study', 'degree', 'university', 'bba', 'iba', 'gpa', 'cgpa', 'academic', 'school'],
      r: 'BBA at IBA, Jahangirnagar University — 6 semesters, CGPA 3.24/4.00. Prior: Mirzapur Cadet College — SSC GPA 5.00 (2019) and HSC GPA 5.00 (2020), Science stream. The cadet background provided strong discipline and leadership foundations.'
    },
    {
      k: ['contact', 'reach', 'email', 'phone', 'linkedin', 'connect', 'touch', 'hire', 'message'],
      r: 'You can reach out directly at m.k.touhid95@gmail.com or +880 1734773509. Also on LinkedIn: linkedin.com/in/mktouhid/ and GitHub: github.com/touhid95/portfolio. Responses come within 24 hours.'
    },
    {
      k: ['available', 'open', 'job', 'internship', 'opportunity', 'looking', 'position', 'recruit', 'hire'],
      r: 'Yes — actively seeking data analyst internships and entry-level roles in data or finance. Fast learner, deadline-driven, and performs well under pressure. Reach out at m.k.touhid95@gmail.com for opportunities.'
    },
    {
      k: ['sql', 'hackerrank', 'database', 'query', 'schema'],
      r: 'SQL is a core strength — 5-star Gold rating on HackerRank. Proficient in Window Functions, CTEs, subqueries, query optimisation, and 3NF relational database design.'
    },
    {
      k: ['python', 'pandas', 'numpy', 'matplotlib', 'seaborn'],
      r: 'Python is the primary data analysis language used. Key libraries: Pandas and NumPy for data wrangling, Matplotlib and Seaborn for visualisation, and KMeans clustering for segmentation work. Certified: Python Core (CT-VIWPDMXG).'
    },
    {
      k: ['cadet', 'mirzapur', 'hsc', 'ssc', 'college', 'school'],
      r: 'Attended Mirzapur Cadet College — SSC GPA 5.00 (2019) and HSC GPA 5.00 (2020), Science. The cadet system instilled strong discipline, leadership under pressure, and consistent high performance.'
    },
    {
      k: ['certif', 'sololearn', 'course', 'certificate', 'credential'],
      r: 'Certifications (Sololearn): Data Science — CC-9FYOGHRZ, SQL — CC-RPHT4UCX, R — CC-ONCVDTPD, Python Core — CT-VIWPDMXG, HTML — CC-PCKFQGVS.'
    },
    {
      k: ['goal', 'aspire', 'dream', 'future', 'blackrock', 'aladdin', 'finance', 'vision', 'career'],
      r: "The career goal is to become a data-driven decision-maker at the intersection of finance and technology. Long-term aspiration: build something at the scale of BlackRock's Aladdin — advanced data science applied to real-world financial risk management."
    },
    {
      k: ['power bi', 'tableau', 'excel', 'dashboard', 'visuali', 'bi'],
      r: 'Proficient in Power BI, Tableau, and Excel for business intelligence dashboards. Used Power BI for financial analytics and Tableau for retail sales visualisation — turning raw data into actionable insights.'
    }
  ];

  var isBlocked = false;
  var rudeWords = ['stupid', 'idiot', 'dumb', 'hate', 'useless', 'shut up', 'fuck', 'shit', 'bastard', 'asshole', 'crap', 'fool'];

  function fallback(msg) {
    var lower = msg.toLowerCase();
    
    if (isBlocked) {
      return "I'm here to have a respectful conversation about Mahfujul Kader Touhid's work. I won't be able to continue this chat.";
    }
    
    for (var r = 0; r < rudeWords.length; r++) {
      if (lower.indexOf(rudeWords[r]) !== -1) {
        isBlocked = true;
        return "I'm here to have a respectful conversation about Mahfujul Kader Touhid's work. I won't be able to continue this chat.";
      }
    }

    var queryTerms = lower.split(/\s+/).filter(function (t) { return t.length > 2; });
    var bestMatch = null;
    var maxScore = 0;

    for (var i = 0; i < KB.length; i++) {
      var item = KB[i];
      var score = 0;
      for (var j = 0; j < item.k.length; j++) {
        var keyword = item.k[j];
        for (var k = 0; k < queryTerms.length; k++) {
          var term = queryTerms[k];
          if (term === keyword) {
            score += 3;
          } else if (term.indexOf(keyword) !== -1 || keyword.indexOf(term) !== -1) {
            score += 1;
          }
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestMatch = item.r;
      }
    }

    if (bestMatch && maxScore > 0) {
      return bestMatch;
    }
    /* Hard rule: out-of-scope redirect */
    return "I don't have information on that. For anything beyond my knowledge, feel free to reach out directly at m.k.touhid95@gmail.com.";
  }

  // Expose fallback globally for local testing in the admin panel
  window.PortfolioAssistantFallback = fallback;

  /* ── SESSION STORAGE ──────────────────────────────────── */
  function loadHistory() {
    try { var r = sessionStorage.getItem(SK); return r ? JSON.parse(r) : []; }
    catch (e) { return []; }
  }
  function saveHistory(h) {
    try { sessionStorage.setItem(SK, JSON.stringify(h.slice(-40))); } catch (e) {}
  }

  /* ── STATE ────────────────────────────────────────────── */
  var isOpen    = false;
  var isBusy    = false;
  var isOffline = false;
  var history   = [];
  var username  = localStorage.getItem('pac_username') || null;
  var $panel, $btn, $body, $input, $sendBtn, $notice;

  /* ── API CALL ─────────────────────────────────────────── */
  function callAPI(message, isFetchHistory, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', API, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = 15000;
    xhr.onload = function () {
      try {
        var data = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && data.reply) {
          isOffline = false;
          cb(null, data.reply, data.history);
        } else {
          throw new Error('bad');
        }
      } catch (e) {
        isOffline = true;
        cb(null, fallback(message));
      }
    };
    xhr.onerror = xhr.ontimeout = function () {
      isOffline = true;
      cb(null, fallback(message));
    };
    xhr.send(JSON.stringify({ message: message, username: username, fetchHistory: isFetchHistory }));
  }

  /* ── TYPEWRITER ───────────────────────────────────────── */
  function typewrite(el, text, done) {
    var i = 0;
    (function step() {
      if (i < text.length) {
        el.textContent += text[i++];
        if ($body) $body.scrollTop = $body.scrollHeight;
        setTimeout(step, SPEED);
      } else { if (done) done(); }
    })();
  }

  /* ── RENDER MESSAGE ───────────────────────────────────── */
  function renderMsg(role, text, animate, done) {
    var wrap   = document.createElement('div');
    var label  = document.createElement('div');
    var bubble = document.createElement('div');
    wrap.className    = 'chat-msg ' + role;
    label.className   = 'msg-label';
    label.textContent = role === 'user' ? 'You' : 'Assistant';
    bubble.className  = 'msg-bubble';
    wrap.appendChild(label);
    wrap.appendChild(bubble);
    $body.appendChild(wrap);
    $body.scrollTop = $body.scrollHeight;
    if (animate && role === 'ai') {
      typewrite(bubble, text, done);
    } else {
      bubble.textContent = text;
      if (done) done();
    }
  }

  /* ── TYPING INDICATOR ─────────────────────────────────── */
  function showTyping() {
    var wrap   = document.createElement('div');
    wrap.className = 'chat-msg ai';
    wrap.id = '_t';
    var label  = document.createElement('div');
    label.className = 'msg-label';
    label.textContent = 'Assistant';
    var bubble = document.createElement('div');
    bubble.className = 'typing-bubble';
    bubble.innerHTML = '<span></span><span></span><span></span>';
    wrap.appendChild(label);
    wrap.appendChild(bubble);
    $body.appendChild(wrap);
    $body.scrollTop = $body.scrollHeight;
  }
  function hideTyping() {
    var el = document.getElementById('_t');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  /* ── SEND ─────────────────────────────────────────────── */
  function send(text) {
    var msg = (text || '').trim();
    if (!msg || isBusy) return;
    isBusy = true;
    $sendBtn.disabled = true;
    $input.value = '';
    $input.style.height = 'auto';

    renderMsg('user', msg);

    if (!username) {
      username = msg;
      localStorage.setItem('pac_username', username);
      
      setTimeout(function () {
        showTyping();
        callAPI('', true, function (err, reply, serverHistory) {
          hideTyping();
          if (serverHistory && serverHistory.length > 0) {
            $body.innerHTML = '';
            history = serverHistory;
            history.forEach(function (m) { renderMsg(m.role, m.text); });
          } else {
            var welcome = "Nice to meet you, " + username + "! How can I help you explore this portfolio?";
            history = [{ role: 'ai', text: welcome }];
            renderMsg('ai', welcome, true, function() {
              isBusy = false;
              $sendBtn.disabled = false;
              $input.focus();
            });
            saveHistory(history);
            return;
          }
          isBusy = false;
          $sendBtn.disabled = false;
          $input.focus();
        });
      }, DELAY);
      return;
    }

    history.push({ role: 'user', text: msg });
    saveHistory(history);

    setTimeout(function () {
      showTyping();
      callAPI(msg, false, function (err, reply) {
        hideTyping();
        if (isOffline) $notice.style.display = 'block';
        else $notice.style.display = 'none';

        history.push({ role: 'ai', text: reply });
        saveHistory(history);

        renderMsg('ai', reply, true, function () {
          isBusy = false;
          $sendBtn.disabled = false;
          $input.focus();
        });
      });
    }, DELAY);
  }

  /* ── OPEN / CLOSE ─────────────────────────────────────── */
  function openChat() {
    isOpen = true;
    $panel.classList.add('open');
    $body.scrollTop = $body.scrollHeight;
    setTimeout(function () { $input.focus(); }, 220);
  }
  function closeChat() {
    isOpen = false;
    $panel.classList.remove('open');
  }

  /* ── BUILD DOM ────────────────────────────────────────── */
  function build() {
    /* Toggle button — neutral label */
    $btn = document.createElement('button');
    $btn.id = 'ask-touhid-btn';
    $btn.setAttribute('aria-label', 'Open Portfolio AI Assistant');
    $btn.innerHTML = '<span class="btn-dot"></span>Portfolio Assistant';

    /* Panel */
    $panel = document.createElement('div');
    $panel.id = 'ask-touhid-panel';
    $panel.setAttribute('role', 'dialog');
    $panel.setAttribute('aria-label', 'Portfolio AI Assistant');

    /* Header */
    var hdr   = document.createElement('div');
    hdr.id    = 'chat-header';
    var title = document.createElement('span');
    title.id  = 'chat-header-title';
    title.textContent = 'Portfolio Assistant';
    var cls   = document.createElement('button');
    cls.id    = 'chat-close-btn';
    cls.setAttribute('aria-label', 'Close');
    cls.innerHTML = '&times;';
    hdr.appendChild(title);
    hdr.appendChild(cls);

    /* Offline notice */
    $notice = document.createElement('div');
    $notice.id = 'chat-api-notice';
    $notice.textContent = '[ Offline mode \u2014 local knowledge active ]';

    /* Message log */
    $body = document.createElement('div');
    $body.id = 'chat-body';
    $body.setAttribute('role', 'log');
    $body.setAttribute('aria-live', 'polite');

    /* Quick questions */
    var quick = document.createElement('div');
    quick.id  = 'chat-quick';
    QUICK.forEach(function (q) {
      var qb = document.createElement('button');
      qb.className   = 'quick-btn';
      qb.textContent = q;
      qb.addEventListener('click', function () {
        if (!isOpen) openChat();
        send(q);
      });
      quick.appendChild(qb);
    });

    /* Input area */
    var ia = document.createElement('div');
    ia.id  = 'chat-input-area';
    $input = document.createElement('textarea');
    $input.id          = 'chat-input';
    $input.rows        = 2;
    $input.placeholder = 'Ask about this portfolio\u2026';
    $input.setAttribute('aria-label', 'Your message');
    $sendBtn = document.createElement('button');
    $sendBtn.id          = 'chat-send-btn';
    $sendBtn.textContent = 'Send';
    ia.appendChild($input);
    ia.appendChild($sendBtn);

    $panel.appendChild(hdr);
    $panel.appendChild($notice);
    $panel.appendChild($body);
    $panel.appendChild(quick);
    $panel.appendChild(ia);
    document.body.appendChild($btn);
    document.body.appendChild($panel);
  }

  /* ── INIT ─────────────────────────────────────────────── */
  function init() {
    build();

    if (!username) {
      var greeting = "Hi! Before we start, what is your name? (This lets me remember our conversation if you return!)";
      renderMsg('ai', greeting);
    } else {
      showTyping();
      callAPI('', true, function(err, reply, serverHistory) {
        hideTyping();
        if (serverHistory && serverHistory.length > 0) {
          history = serverHistory;
          history.forEach(function (m) { renderMsg(m.role, m.text); });
          saveHistory(history);
        } else {
          history = loadHistory();
          if (history.length === 0) {
            var greeting = "Welcome back, " + username + "! What would you like to know?";
            history.push({ role: 'ai', text: greeting });
            renderMsg('ai', greeting);
            saveHistory(history);
          } else {
            history.forEach(function (m) { renderMsg(m.role, m.text); });
          }
        }
      });
    }

    $btn.addEventListener('click', openChat);
    document.getElementById('chat-close-btn').addEventListener('click', closeChat);
    $sendBtn.addEventListener('click', function () { send($input.value); });
    $input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send($input.value); }
    });
    $input.addEventListener('input', function () {
      $input.style.height = 'auto';
      $input.style.height = Math.min($input.scrollHeight, 100) + 'px';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeChat();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

}());
