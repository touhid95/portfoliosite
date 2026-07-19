'use client';

import { useState, useId } from 'react';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm() {
  const uid     = useId();
  const nameId  = `${uid}-name`;
  const emailId = `${uid}-email`;
  const msgId   = `${uid}-message`;

  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [message, setMessage] = useState('');
  const [status,  setStatus]  = useState<Status>('idle');
  const [aiReply, setAiReply] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus('sending');
    setAiReply('');

    /* Build a structured prompt the AI understands as a contact-form submission */
    const prompt =
      `[CONTACT FORM SUBMISSION]\n` +
      `Name: ${name.trim()}\n` +
      `Email: ${email.trim()}\n` +
      `Message: ${message.trim()}`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAiReply(data.reply || 'Message received!');
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  const isBusy    = status === 'sending';
  const canSubmit = !isBusy && name.trim() && email.trim() && message.trim();

  return (
    <>
      <style>{`
        /* ── Contact form inputs ─────────────────────────── */
        .cf-input,
        .cf-textarea {
          width: 100%;
          max-width: 400px;
          padding: 8px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          border: 1px solid #E0E0E0;
          background: #FCFAF2;
          color: #2C2C2C;
          margin-top: 5px;
          transition: border-color 0.15s ease;
          outline: none;
          display: block;
        }
        .cf-input:focus,
        .cf-textarea:focus { border-color: #2C2C2C !important; }
        .cf-input:disabled,
        .cf-textarea:disabled { opacity: 0.55; cursor: not-allowed; }

        .cf-submit {
          padding: 10px 20px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          border: 1px solid #2C2C2C;
          background: #FCFAF2;
          color: #2C2C2C;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, opacity 0.15s;
          letter-spacing: 0.04em;
        }
        .cf-submit:hover:not(:disabled) {
          background: #BC2026;
          color: #FCFAF2;
          border-color: #BC2026;
        }
        .cf-submit:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Status feedback box ─────────────────────────── */
        .cf-feedback {
          max-width: 400px;
          margin-top: 14px;
          padding: 10px 14px;
          border-left: 3px solid #BC2026;
          background: #f9f8f2;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 13px;
          line-height: 1.6;
          color: #2C2C2C;
          animation: cf-slide-in 0.22s ease;
        }
        .cf-feedback.cf-error {
          border-left-color: #888;
          color: #888;
        }
        @keyframes cf-slide-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Sending dots */
        .cf-dots span {
          display: inline-block;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #888888;
          margin: 0 2px;
          animation: cf-bounce 1.1s infinite ease;
          vertical-align: middle;
        }
        .cf-dots span:nth-child(2) { animation-delay: 0.18s; }
        .cf-dots span:nth-child(3) { animation-delay: 0.36s; }
        @keyframes cf-bounce {
          0%,80%,100% { transform: translateY(0); opacity: 0.4; }
          40%          { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor={nameId} className="font-mono text-sm text-muted block">YOUR NAME</label>
          <br />
          <input
            id={nameId}
            name="name"
            type="text"
            className="cf-input"
            placeholder="e.g. John Doe"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={isBusy}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor={emailId} className="font-mono text-sm text-muted block">YOUR EMAIL</label>
          <br />
          <input
            id={emailId}
            name="email"
            type="email"
            className="cf-input"
            placeholder="e.g. john@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isBusy}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor={msgId} className="font-mono text-sm text-muted block">MESSAGE</label>
          <br />
          <textarea
            id={msgId}
            name="message"
            className="cf-textarea"
            rows={6}
            placeholder="Write your message here..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={isBusy}
          />
        </div>

        <div>
          <button
            id="contact-send-btn"
            type="submit"
            className="cf-submit"
            disabled={!canSubmit}
          >
            {isBusy ? 'Sending\u2026' : 'Send Message'}
          </button>
        </div>

        {/* Sending indicator */}
        {status === 'sending' && (
          <div className="cf-feedback" role="status" aria-live="polite">
            <span className="font-mono text-xs text-muted">Delivering your message</span>{' '}
            <span className="cf-dots" aria-hidden="true">
              <span /><span /><span />
            </span>
          </div>
        )}

        {/* AI acknowledgement on success */}
        {status === 'success' && aiReply && (
          <div className="cf-feedback" role="status" aria-live="polite">
            <span className="font-mono text-xs text-muted block" style={{ marginBottom: 6 }}>
              RESPONSE FROM TOUHID&rsquo;S ASSISTANT
            </span>
            {aiReply}
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="cf-feedback cf-error" role="alert" aria-live="assertive">
            <span className="font-mono text-xs block" style={{ marginBottom: 4 }}>DELIVERY FAILED</span>
            Something went wrong. Please try again, or reach out directly via email.
          </div>
        )}
      </form>
    </>
  );
}
