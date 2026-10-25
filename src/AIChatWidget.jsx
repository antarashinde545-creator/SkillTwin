
import { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { sendCareerChat } from './aiClient';
import './AIChatWidget.css';

export default function AIChatWidget({ profile, analysis }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [history, setHistory] = useState([
    {
      role: 'assistant',
      content: 'Hi! I am your SkillTwin AI career coach. Ask me about your skill gaps, career readiness, projects or roadmap.'
    }
  ]);

  async function handleSubmit(event) {
    event.preventDefault();

    const text = message.trim();

    if (!text || busy) return;

    const previousMessages = history.slice(1);

    setHistory(prev => [
      ...prev,
      { role: 'user', content: text }
    ]);

    setMessage('');
    setBusy(true);
    setError('');

    try {
      const result = await sendCareerChat({
        message: text,
        profile,
        analysis,
        history: previousMessages.slice(-10)
      });

      setHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: result.reply
        }
      ]);
    } catch (err) {
      setError(err.message || 'Could not connect to SkillTwin AI.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        className="skilltwin-ai-fab"
        onClick={() => setOpen(value => !value)}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        {!open && 'AI Career Coach'}
      </button>

      {open && (
        <section className="skilltwin-ai-panel">
          <header className="skilltwin-ai-header">
            <Sparkles size={20} />
            <div>
              <strong>SkillTwin AI</strong>
              <small>Your personal career coach</small>
            </div>
            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </header>

          <div className="skilltwin-ai-messages">
            {history.map((item, index) => (
              <div
                key={index}
                className={`skilltwin-ai-message ${item.role}`}
              >
                {item.content}
              </div>
            ))}

            {busy && (
              <div className="skilltwin-ai-message assistant">
                Thinking...
              </div>
            )}

            {error && (
              <div className="skilltwin-ai-error">{error}</div>
            )}
          </div>

          <form className="skilltwin-ai-input" onSubmit={handleSubmit}>
            <input
              value={message}
              onChange={event => setMessage(event.target.value)}
              placeholder="Ask about your career..."
              maxLength={4000}
            />

            <button disabled={busy || !message.trim()}>
              <Send size={17} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
