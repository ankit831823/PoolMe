import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Send, X, User } from 'lucide-react';

export default function ChatModal({ ride, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(true);
  const { user }                = useAuth();
  const { addToast }            = useToast();
  const scrollRef               = useRef(null);

  const fetchMsgs = async () => {
    try {
      const res = await getMessages(ride.id);
      setMessages(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000); // Polling for demo
    return () => clearInterval(interval);
  }, [ride.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await sendMessage(ride.id, input);
      setInput('');
      fetchMsgs();
    } catch {
      addToast('❌ Could not send message', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ padding: 0, height: 500, display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 className="modal-title">Chat: {ride.origin} → {ride.destination}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="chat-messages" ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No messages yet</div>
              <div className="empty-state-text">Say hello to the co-travelers!</div>
            </div>
          ) : (
            messages.map(m => {
              const itemIsOwn = m.sender_id === user?.id;
              const isDriverMsg = m.sender_id === ride.driver_id;
              
              return (
                <div key={m.id} className={`chat-msg ${itemIsOwn ? 'own' : 'other'}`}>
                  <div className="chat-bubble">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isDriverMsg ? 'var(--accent)' : 'var(--primary)' }}>
                        {m.sender.name} {isDriverMsg ? '🚗 Driver' : '👤 Passenger'}
                      </span>
                    </div>
                    <div>{m.content}</div>
                    <div style={{ fontSize: '0.6rem', opacity: 0.5, marginTop: 4, textAlign: 'right' }}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form className="chat-input-row" onSubmit={handleSend} style={{ padding: 16, borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}>
          <input
            className="form-input"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={!input.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
