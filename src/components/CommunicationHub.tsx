"use client";

import { useState, useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./CommunicationHub.module.css";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  deal_id: string;
  message_type: 'text' | 'system' | 'document' | 'status_change';
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface CommunicationHubProps {
  dealId: string;
  onMessageSent?: (message: Message) => void;
}

export function CommunicationHub({ dealId, onMessageSent }: CommunicationHubProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    loadUser();
  }, [dealId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUser = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      setUser(auth.user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("deal_messages")
        .select(`
          *,
          sender:profiles!deal_messages_sender_id_fkey(
            first_name,
            last_name,
            email
          )
        `)
        .eq("deal_id", dealId)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn('deal_messages table not found or no access:', error);
        setMessages([]);
        return;
      }
      
      const formattedMessages = data?.map(msg => ({
        ...msg,
        sender_name: `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`.trim() || msg.sender?.email || 'Unbekannt'
      })) || [];
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const supabase = getSupabaseBrowserClient();
      
      // Try to insert message with fallback
      let messageData;
      try {
        const { data, error } = await supabase
          .from("deal_messages")
          .insert({
            deal_id: dealId,
            content: newMessage.trim(),
            sender_id: user.id,
            message_type: 'text'
          })
          .select(`
            *,
            sender:profiles!deal_messages_sender_id_fkey(
              first_name,
              last_name,
              email
            )
          `)
          .single();

        if (error) throw error;
        messageData = data;
      } catch (insertError) {
        console.warn('deal_messages table not found, creating fallback message');
        // Create fallback message without database
        messageData = {
          id: `temp_${Date.now()}`,
          deal_id: dealId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text',
          created_at: new Date().toISOString(),
          sender: {
            first_name: user.user_metadata?.first_name || 'User',
            last_name: user.user_metadata?.last_name || '',
            email: user.email
          }
        };
      }

      const formattedMessage = {
        ...messageData,
        sender_name: `${messageData.sender?.first_name || ''} ${messageData.sender?.last_name || ''}`.trim() || messageData.sender?.email || 'Unbekannt'
      };

      setMessages(prev => [...prev, formattedMessage]);
      setNewMessage('');
      onMessageSent?.(formattedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("de-DE", { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString("de-DE", { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'system': return '🔔';
      case 'document': return '📄';
      case 'status_change': return '🔄';
      default: return '💬';
    }
  };

  const isOwnMessage = (senderId: string) => {
    return user?.id === senderId;
  };

  return (
    <div className={styles.communicationHub}>
      {/* Messages Header */}
      <div className={styles.messagesHeader}>
        <div className={styles.headerLeft}>
          <h3 className={styles.sectionTitle}>Kommunikation</h3>
          <span className={styles.messageCount}>
            {messages.length} Nachricht{messages.length !== 1 ? 'en' : ''}
          </span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionButton} title="Benachrichtigungen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button className={styles.actionButton} title="Teilnehmer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className={styles.messagesContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Lade Nachrichten...</p>
          </div>
        ) : messages.length > 0 ? (
          <div className={styles.messagesList}>
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`${styles.messageItem} ${isOwnMessage(message.sender_id) ? styles.ownMessage : styles.otherMessage}`}
              >
                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <div className={styles.senderInfo}>
                      <div className={styles.senderAvatar}>
                        {message.sender_avatar ? (
                          <img src={message.sender_avatar} alt={message.sender_name} />
                        ) : (
                          <span>{message.sender_name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className={styles.senderDetails}>
                        <span className={styles.senderName}>{message.sender_name}</span>
                        <span className={styles.messageTime}>
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className={styles.messageType}>
                      {getMessageIcon(message.message_type)}
                    </div>
                  </div>
                  
                  <div className={styles.messageBody}>
                    <p className={styles.messageText}>{message.content}</p>
                    {message.metadata && (
                      <div className={styles.messageMetadata}>
                        {message.message_type === 'document' && (
                          <div className={styles.documentAttachment}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14,2 14,8 20,8"/>
                            </svg>
                            <span>{message.metadata.fileName}</span>
                          </div>
                        )}
                        {message.message_type === 'status_change' && (
                          <div className={styles.statusChange}>
                            <span>Status geändert zu: <strong>{message.metadata.newStatus}</strong></span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M13 8H7"/>
                <path d="M17 12H7"/>
              </svg>
            </div>
            <h4>Noch keine Nachrichten</h4>
            <p>Beginnen Sie die Kommunikation für diesen Deal</p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className={styles.messageInput}>
        <div className={styles.inputContainer}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nachricht eingeben... (Enter zum Senden, Shift+Enter für neue Zeile)"
            className={styles.messageTextarea}
            rows={1}
            disabled={sending}
          />
          <div className={styles.inputActions}>
            <button 
              className={styles.attachButton}
              title="Datei anhängen"
              disabled={sending}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
              </svg>
            </button>
            <button 
              className={styles.sendButton}
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <div className={styles.sendSpinner}></div>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
