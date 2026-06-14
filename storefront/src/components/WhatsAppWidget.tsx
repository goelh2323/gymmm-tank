import React, { useState } from 'react';
import { MessageCircle, X, Send, Dumbbell } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const SUPPORT_NUMBER = '919350931316'; // Official Gymmm Tank WhatsApp Number (with country code)

  const quickReplies = [
    { label: '🏋️‍♂️ PR & Stack Advice', text: 'Hey GYMMM TANK! Need professional stack advice to smash my next PR. 💪' },
    { label: '📦 Track My Fuel', text: 'Hey GYMMM TANK! Checking status on my order.' },
    { label: '🤝 Business & Dealership', text: 'Hey GYMMM TANK! Interested in franchise/dealership opportunities.' }
  ];

  const handleStartChat = (customText?: string) => {
    const textToSend = customText || message || 'Hello GYMMM TANK support!';
    const encoded = encodeURIComponent(textToSend);
    const whatsappUrl = `https://wa.me/${SUPPORT_NUMBER}?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="wa-widget-container">
      {/* Mini Pop-up Card */}
      {isOpen && (
        <div className="wa-popup-card animate-scale-up">
          <div className="wa-popup-header">
            <div className="wa-avatar-title-wrap">
              <div className="wa-support-avatar">
                <img src="/images/logo.png" alt="GYMMM TANK Support" onError={(e) => { (e.target as HTMLImageElement).src = '/images/logo.jpg' }} />
                <span className="wa-online-dot"></span>
              </div>
              <div className="wa-header-text">
                <h4>GYMMM TANK SUPPORT</h4>
                <p>Typically replies in minutes</p>
              </div>
            </div>
            <button className="wa-popup-close-btn" onClick={() => setIsOpen(false)} aria-label="Close panel">
              <X size={16} />
            </button>
          </div>

          <div className="wa-popup-body">
            <p className="wa-welcome-msg">
              Hey builder! <Dumbbell size={14} className="wa-inline-icon" /> How can we help you crush your training goals today?
            </p>

            <div className="wa-quick-replies-list">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  className="wa-quick-reply-chip"
                  onClick={() => handleStartChat(reply.text)}
                  style={{ animationDelay: `${(idx + 1) * 0.1}s` }}
                >
                  {reply.label}
                </button>
              ))}
            </div>

            <form 
              className="wa-popup-footer-form" 
              onSubmit={(e) => { e.preventDefault(); handleStartChat(); }}
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="wa-message-input"
              />
              <button 
                type="submit" 
                className="wa-send-btn" 
                aria-label="Send WhatsApp"
                disabled={!message.trim()}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        className={`wa-float-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat on WhatsApp"
        aria-label="Toggle WhatsApp chat window"
      >
        <div className="wa-fab-content">
          <MessageCircle size={28} className="wa-icon" />
          <Dumbbell size={16} className="wa-dumbbell-overlay" />
        </div>
        <span className="wa-fab-pulse"></span>
        <span className="wa-fab-double-pulse"></span>
      </button>
    </div>
  );
};
