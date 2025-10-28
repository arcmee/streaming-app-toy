'use client';

import * as React from 'react';

import type { ChatMessage } from '@repo/logic/domain/chat';
import { generateColorFromString } from './lib/color';

export interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

const chatStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    border: '1px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden',
    fontFamily: 'sans-serif',
  },
  messageList: {
    flexGrow: 1,
    padding: '1rem',
    overflowY: 'auto' as const,
    background: '#f9f9f9',
  },
  message: {
    marginBottom: '0.5rem',
    lineHeight: '1.4',
  },
  systemMessage: {
    fontStyle: 'italic' as const,
    color: '#888',
    textAlign: 'center' as const,
  },
  messageUser: {
    fontWeight: 'bold' as const,
    marginRight: '0.5rem',
  },
  timestamp: {
    fontSize: '0.75rem',
    color: '#999',
    marginLeft: '0.5rem',
  },
  form: {
    display: 'flex',
    padding: '1rem',
    borderTop: '1px solid #ccc',
    background: '#fff',
  },
  input: {
    flexGrow: 1,
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginRight: '0.5rem',
  },
  button: {
    padding: '0.5rem 1rem',
    border: 'none',
    background: '#007bff',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  buttonDisabled: {
    background: '#aaa',
    cursor: 'not-allowed',
  },
};

export function Chat({ messages, onSendMessage, disabled = false }: ChatProps) {
  const [text, setText] = React.useState('');
  const messageListRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll to the bottom when new messages arrive
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={chatStyles.container}>
      <div style={chatStyles.messageList} ref={messageListRef}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            style={msg.isSystem ? {...chatStyles.message, ...chatStyles.systemMessage} : chatStyles.message}
          >
            {msg.isSystem ? (
              <span>{msg.text}</span>
            ) : (
              <>
                <span 
                  style={{ 
                    ...chatStyles.messageUser, 
                    color: generateColorFromString(msg.user.id)
                  }}
                >
                  {msg.user.username}:
                </span>
                <span>{msg.text}</span>
                <span style={chatStyles.timestamp}>
                  {formatTimestamp(msg.createdAt)}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={chatStyles.form}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={disabled ? 'Connecting...' : 'Type a message...'}
          style={chatStyles.input}
          disabled={disabled}
        />
        <button 
          type="submit" 
          style={disabled ? {...chatStyles.button, ...chatStyles.buttonDisabled} : chatStyles.button} 
          disabled={disabled}
        >
          Send
        </button>
      </form>
    </div>
  );
}
