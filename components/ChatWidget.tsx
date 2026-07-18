'use client';
import { useEffect } from 'react';

// Dynamically loads chat-widget.js (kept as public static script)
export default function ChatWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/chat-widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      {/* Floating "Ask Touhid" button */}
      <button id="ask-touhid-btn" aria-label="Ask Touhid AI">
        <span className="btn-dot" />
        ASK TOUHID
      </button>

      {/* Chat panel */}
      <div id="ask-touhid-panel" role="dialog" aria-modal="true" aria-label="AI Chat">
        <div id="chat-header">
          <span id="chat-header-title">TOUHID — AI ASSISTANT</span>
          <button id="chat-close-btn" aria-label="Close chat">✕</button>
        </div>
        <div id="chat-api-notice" />
        <div id="chat-body" />
        <div id="chat-quick" />
        <div id="chat-input-area">
          <textarea
            id="chat-input"
            rows={1}
            placeholder="Ask me anything…"
            aria-label="Chat message input"
          />
          <button id="chat-send-btn" aria-label="Send message">SEND</button>
        </div>
      </div>
    </>
  );
}
