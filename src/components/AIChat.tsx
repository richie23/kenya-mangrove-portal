'use client';
import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Kenya Mangrove AI assistant. Ask me anything about mangroves, counties, species, or the management plan.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Sorry I could not get a response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Backend not connected. Start your FastAPI server to enable AI chat.' }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: '#0F6E56',
          color: 'white',
          border: 'none',
          fontSize: '22px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {open ? '✕' : '🌿'}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: '84px',
          right: '20px',
          width: '320px',
          height: '420px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 20,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: '#0F6E56',
            padding: '12px 16px',
            color: 'white',
          }}>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '13px' }}>
              Kenya Mangrove AI
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#9FE1CB' }}>
              Powered by local Ollama
            </p>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#0F6E56' : '#f0f0f0',
                color: msg.role === 'user' ? 'white' : '#1a1a1a',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                maxWidth: '85%',
                lineHeight: '1.4',
              }}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                background: '#f0f0f0',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                color: '#888',
              }}>
                Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '10px',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '8px',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about mangroves..."
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                padding: '8px 12px',
                background: '#0F6E56',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}