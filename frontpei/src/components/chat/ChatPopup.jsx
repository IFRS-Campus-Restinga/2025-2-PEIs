// src/components/chat/ChatPopup.jsx
import "./chatPopup.css";

export default function ChatPopup({ onClose, children }) {
  return (
    <div className="chat-overlay">
      <div className="chat-popup-window">
        <button className="chat-popup-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
