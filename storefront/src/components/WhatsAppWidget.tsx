import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const SUPPORT_NUMBER = '919350931316'; // Official Gymmm Tank WhatsApp Number (with country code)

  const quickReplies = [
    { label: '💊 Dose / Stack Advice', text: 'Hey GYMMM TANK! I need some advice on stacking supplements for my training goals. 🏋️' },
    { label: '📦 Check Order Status', text: 'Hey GYMMM TANK! I want to check the status of my order.' },
    { label: '🤝 Dealer / Business', text: 'Hey GYMMM TANK! I am interested in becoming a dealer/distributor.' }
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
              Hey builder! How can we help you crush your training goals today?
            </p>

            <div className="wa-quick-replies-list">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  className="wa-quick-reply-chip"
                  onClick={() => handleStartChat(reply.text)}
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
        <MessageCircle size={26} className="wa-icon" />
        <span className="wa-fab-pulse"></span>
      </button>
    </div>
  );
};
