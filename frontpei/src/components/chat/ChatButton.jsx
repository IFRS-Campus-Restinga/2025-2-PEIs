// src/components/chat/ChatButton.jsx
import "./chatButton.css";

export default function ChatButton({ onClick }) {
  return (
    <button className="chat-button" onClick={onClick}>
      Chat
    </button>
  );
}
