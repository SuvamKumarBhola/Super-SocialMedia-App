import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { Loader2, Send, MessageSquare, AtSign, Search, Smile, Frown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PLATFORM_COLORS = {
  instagram: '#e1306c',
  facebook: '#1877f2',
  x: '#2a1f0f',
  linkedin: '#0a66c2',
  youtube: '#ff0000',
};

const Inbox = () => {
  const { token, activeOrgId } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  /* ── fetch conversations ── */
  useEffect(() => {
    if (!token || !activeOrgId) return;
    (async () => {
      try {
        setLoadingList(true);
        const res = await axios.get(`${API_URL}/inbox/conversations/${activeOrgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
        setConversations([]);
      } finally {
        setLoadingList(false);
      }
    })();
  }, [token, activeOrgId]);

  /* ── fetch messages ── */
  useEffect(() => {
    if (!token || !activeConversation) return;
    (async () => {
      try {
        setLoadingMessages(true);
        const res = await axios.get(`${API_URL}/inbox/${activeConversation._id}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(Array.isArray(res.data) ? res.data : []);
        setConversations(prev =>
          prev.map(c => c._id === activeConversation._id ? { ...c, isRead: true } : c)
        );
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    })();
  }, [token, activeConversation]);

  /* ── scroll to bottom ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── send reply ── */
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversation) return;
    try {
      setSending(true);
      const res = await axios.post(
        `${API_URL}/inbox/${activeConversation._id}/reply`,
        { content: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, res.data]);
      setReplyText('');
      setConversations(prev =>
        prev.map(c => c._id === activeConversation._id
          ? { ...c, lastMessagePreview: res.data.content, lastMessageAt: res.data.timestamp }
          : c
        ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSending(false);
    }
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment === 'positive') return <Smile size={13} style={{ color: '#4a8c3a' }} />;
    if (sentiment === 'negative') return <Frown size={13} style={{ color: '#c85040' }} />;
    return null;
  };

  const filteredConvs = conversations.filter(c =>
    !search || c.participantName?.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessagePreview?.toLowerCase().includes(search.toLowerCase())
  );

  if (loadingList) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <Loader2 size={28} style={{ color: '#6d3cb4', animation: 'ib-spin 0.8s linear infinite' }} />
      <style>{`@keyframes ib-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .ib-root * { font-family: 'Poppins', system-ui, sans-serif; box-sizing: border-box; }
        @keyframes ib-spin { to { transform: rotate(360deg); } }
        .ib-spin { animation: ib-spin 0.8s linear infinite; }

        .ib-root {
          max-width: 1100px;
          margin: 0 auto;
          padding: 28px 8px;
        }

        /* ── shell ── */
        .ib-shell {
          display: flex;
          height: calc(100vh - 148px);
          min-height: 520px;
          background: #f3ede3;
          border: 1px solid rgba(120,90,50,0.14);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 4px 28px rgba(42,31,15,0.07);
        }

        /* ══════════════════════
           SIDEBAR
        ══════════════════════ */
        .ib-sidebar {
          width: 300px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(120,90,50,0.12);
          background: #f3ede3;
        }
        .ib-sidebar-head {
          padding: 18px 16px 14px;
          border-bottom: 1px solid rgba(120,90,50,0.1);
          background: #ede6d9;
        }
        .ib-sidebar-title { font-size: 15px; font-weight: 800; color: #2a1f0f; letter-spacing: -0.02em; }
        .ib-unread-badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 800;
          color: '#fff';
          background: #6d3cb4;
          padding: 2px 8px;
          border-radius: 999px;
          margin-left: 8px;
          vertical-align: middle;
          color: #fff;
        }

        /* search */
        .ib-search-wrap { position: relative; margin-top: 10px; }
        .ib-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #c4b49a; pointer-events: none; display: flex; align-items: center; transition: color 0.15s; }
        .ib-search-wrap:focus-within .ib-search-icon { color: #6d3cb4; }
        .ib-search-input {
          width: 100%;
          background: #faf7f2;
          border: 1px solid rgba(120,90,50,0.16);
          border-radius: 9px;
          padding: 7px 10px 7px 32px;
          font-size: 12.5px;
          font-family: 'Poppins', system-ui, sans-serif;
          color: #2a1f0f;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ib-search-input::placeholder { color: #c4b49a; }
        .ib-search-input:focus {
          border-color: rgba(109,60,180,0.4);
          box-shadow: 0 0 0 3px rgba(109,60,180,0.08);
        }

        .ib-conv-list { flex: 1; overflow-y: auto; }
        .ib-conv-list::-webkit-scrollbar { width: 4px; }
        .ib-conv-list::-webkit-scrollbar-thumb { background: #c4b49a; border-radius: 2px; }

        .ib-conv-empty { padding: 32px 16px; text-align: center; font-size: 12.5px; color: #c4b49a; }

        /* conv item */
        .ib-conv-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          cursor: pointer;
          border-bottom: 1px solid rgba(120,90,50,0.08);
          border-left: 3px solid transparent;
          transition: background 0.15s, border-color 0.15s;
        }
        .ib-conv-item:hover { background: rgba(109,60,180,0.04); }
        .ib-conv-item.active { background: rgba(109,60,180,0.07); border-left-color: #6d3cb4; }
        .ib-conv-item.unread { background: rgba(109,60,180,0.04); }

        .ib-conv-avatar-wrap { position: relative; flex-shrink: 0; }
        .ib-conv-avatar { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(120,90,50,0.12); }
        .ib-conv-plat-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #faf7f2;
          border: 1px solid rgba(120,90,50,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ib-conv-body { flex: 1; min-width: 0; }
        .ib-conv-row  { display: flex; justify-content: space-between; align-items: baseline; }
        .ib-conv-name { font-size: 12.5px; font-weight: 600; color: #2a1f0f; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ib-conv-name.unread { font-weight: 700; }
        .ib-conv-time { font-size: 10px; color: #c4b49a; white-space: nowrap; margin-left: 6px; }
        .ib-conv-preview { font-size: 11.5px; color: #7a6a55; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }
        .ib-conv-preview.unread { color: #6d3cb4; font-weight: 600; }
        .ib-conv-platform { font-size: 10px; color: #c4b49a; margin-top: 3px; text-transform: capitalize; }
        .ib-unread-dot { width: 7px; height: 7px; border-radius: 50%; background: #6d3cb4; flex-shrink: 0; margin-top: 5px; }

        /* ══════════════════════
           MAIN THREAD
        ══════════════════════ */
        .ib-main { flex: 1; display: flex; flex-direction: column; background: #faf7f2; min-width: 0; }

        /* thread header */
        .ib-thread-head {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(120,90,50,0.1);
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f3ede3;
          flex-shrink: 0;
        }
        .ib-thread-avatar { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(120,90,50,0.14); }
        .ib-thread-name   { font-size: 14px; font-weight: 700; color: #2a1f0f; }
        .ib-thread-sub    { font-size: 11px; color: #7a6a55; margin-top: 1px; text-transform: capitalize; }
        .ib-thread-plat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 5px;
          vertical-align: middle;
        }

        /* messages */
        .ib-messages {
          flex: 1;
          overflow-y: auto;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ib-messages::-webkit-scrollbar { width: 4px; }
        .ib-messages::-webkit-scrollbar-thumb { background: #c4b49a; border-radius: 2px; }

        .ib-msg-row { display: flex; }
        .ib-msg-row.out { justify-content: flex-end; }
        .ib-msg-row.in  { justify-content: flex-start; }

        .ib-bubble {
          max-width: 68%;
          padding: 10px 14px;
          border-radius: 14px;
          position: relative;
          line-height: 1.6;
        }
        .ib-bubble.out {
          background: linear-gradient(135deg, #6d3cb4, #5a58d6);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .ib-bubble.in {
          background: #f3ede3;
          border: 1px solid rgba(120,90,50,0.14);
          color: #2a1f0f;
          border-bottom-left-radius: 4px;
        }
        .ib-bubble-text { font-size: 13px; white-space: pre-wrap; }
        .ib-bubble-time { font-size: 10px; margin-top: 4px; text-align: right; }
        .ib-bubble.out .ib-bubble-time { color: rgba(255,255,255,0.6); }
        .ib-bubble.in  .ib-bubble-time { color: #c4b49a; }

        .ib-sentiment {
          position: absolute;
          top: -8px;
          left: -8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #faf7f2;
          border: 1px solid rgba(120,90,50,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 4px rgba(42,31,15,0.1);
        }

        /* empty thread */
        .ib-empty-thread {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #c4b49a;
          padding: 40px 24px;
          text-align: center;
        }
        .ib-empty-thread p:first-of-type { font-size: 15px; font-weight: 600; color: #7a6a55; }
        .ib-empty-thread p:last-of-type  { font-size: 12.5px; }

        /* reply bar */
        .ib-reply-bar {
          padding: 12px 16px;
          border-top: 1px solid rgba(120,90,50,0.1);
          background: #f3ede3;
          flex-shrink: 0;
        }
        .ib-reply-form { display: flex; gap: 10px; align-items: center; }
        .ib-reply-input {
          flex: 1;
          background: #faf7f2;
          border: 1px solid rgba(120,90,50,0.16);
          border-radius: 999px;
          padding: 9px 16px;
          font-size: 13px;
          font-family: 'Poppins', system-ui, sans-serif;
          color: #2a1f0f;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ib-reply-input::placeholder { color: #c4b49a; }
        .ib-reply-input:focus {
          border-color: rgba(109,60,180,0.4);
          box-shadow: 0 0 0 3px rgba(109,60,180,0.08);
        }
        .ib-reply-input:disabled { opacity: 0.6; }
        .ib-send-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6d3cb4, #5a58d6);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(109,60,180,0.28);
          transition: all 0.2s;
          color: #fff;
        }
        .ib-send-btn:hover:not(:disabled) { box-shadow: 0 4px 18px rgba(109,60,180,0.4); transform: scale(1.06); }
        .ib-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @media(max-width:700px) {
          .ib-sidebar { width: 100%; }
          .ib-main    { display: none; }
          .ib-shell.thread-open .ib-sidebar { display: none; }
          .ib-shell.thread-open .ib-main    { display: flex; }
        }
      `}</style>

      <div className="ib-root">
        <div className={`ib-shell${activeConversation ? ' thread-open' : ''}`}>

          {/* ══ SIDEBAR ══ */}
          <div className="ib-sidebar">
            <div className="ib-sidebar-head">
              <div>
                <span className="ib-sidebar-title">Inbox</span>
                {conversations.filter(c => !c.isRead).length > 0 && (
                  <span className="ib-unread-badge">
                    {conversations.filter(c => !c.isRead).length}
                  </span>
                )}
              </div>
              <div className="ib-search-wrap">
                <div className="ib-search-icon"><Search size={13} /></div>
                <input
                  type="text"
                  className="ib-search-input"
                  placeholder="Search conversations…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="ib-conv-list">
              {filteredConvs.length === 0 ? (
                <div className="ib-conv-empty">
                  {search ? 'No conversations match your search.' : 'No messages yet. Connect an account to start receiving them.'}
                </div>
              ) : (
                filteredConvs.map(conv => {
                  const isActive = activeConversation?._id === conv._id;
                  const isUnread = !conv.isRead;
                  const platColor = PLATFORM_COLORS[conv.platform] || '#6d3cb4';
                  return (
                    <div
                      key={conv._id}
                      className={`ib-conv-item${isActive ? ' active' : ''}${isUnread ? ' unread' : ''}`}
                      onClick={() => setActiveConversation(conv)}
                    >
                      <div className="ib-conv-avatar-wrap">
                        <img
                          src={conv.participantAvatar || `https://ui-avatars.com/api/?name=${conv.participantName || 'U'}&background=ede6d9&color=6d3cb4`}
                          alt=""
                          className="ib-conv-avatar"
                          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${conv.participantName || 'U'}&background=ede6d9&color=6d3cb4`; }}
                        />
                        <div className="ib-conv-plat-badge">
                          {conv.type === 'dm'
                            ? <MessageSquare size={8} style={{ color: platColor }} />
                            : <AtSign size={8} style={{ color: platColor }} />}
                        </div>
                      </div>

                      <div className="ib-conv-body">
                        <div className="ib-conv-row">
                          <span className={`ib-conv-name${isUnread ? ' unread' : ''}`}>{conv.participantName}</span>
                          <span className="ib-conv-time">
                            {new Date(conv.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className={`ib-conv-preview${isUnread ? ' unread' : ''}`}>{conv.lastMessagePreview}</div>
                        <div className="ib-conv-platform">{conv.platform} · {conv.type === 'dm' ? 'DM' : 'Comment'}</div>
                      </div>

                      {isUnread && <div className="ib-unread-dot" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ══ MAIN THREAD ══ */}
          <div className="ib-main">
            {activeConversation ? (
              <>
                {/* header */}
                <div className="ib-thread-head">
                  <img
                    src={activeConversation.participantAvatar || `https://ui-avatars.com/api/?name=${activeConversation.participantName || 'U'}&background=ede6d9&color=6d3cb4`}
                    alt=""
                    className="ib-thread-avatar"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${activeConversation.participantName || 'U'}&background=ede6d9&color=6d3cb4`; }}
                  />
                  <div>
                    <div className="ib-thread-name">{activeConversation.participantName}</div>
                    <div className="ib-thread-sub">
                      <span className="ib-thread-plat-dot"
                        style={{ background: PLATFORM_COLORS[activeConversation.platform] || '#6d3cb4' }} />
                      {activeConversation.platform} · {activeConversation.type === 'dm' ? 'Direct Message' : 'Comment'}
                    </div>
                  </div>
                </div>

                {/* messages */}
                <div className="ib-messages">
                  {loadingMessages ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                      <Loader2 size={22} style={{ color: '#6d3cb4' }} className="ib-spin" />
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isOut = msg.senderType === 'user';
                      const senti = getSentimentIcon(msg.sentiment);
                      return (
                        <div key={idx} className={`ib-msg-row${isOut ? ' out' : ' in'}`}>
                          <div className={`ib-bubble${isOut ? ' out' : ' in'}`}>
                            {!isOut && senti && (
                              <div className="ib-sentiment" title={`Sentiment: ${msg.sentiment}`}>
                                {senti}
                              </div>
                            )}
                            <div className="ib-bubble-text">{msg.content}</div>
                            <div className="ib-bubble-time">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* reply bar */}
                <div className="ib-reply-bar">
                  <form className="ib-reply-form" onSubmit={handleSendReply}>
                    <input
                      type="text"
                      className="ib-reply-input"
                      placeholder={activeConversation.type === 'dm' ? 'Type a message…' : 'Write a reply to comment…'}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      disabled={sending}
                    />
                    <button type="submit" className="ib-send-btn" disabled={!replyText.trim() || sending}>
                      {sending ? <Loader2 size={15} className="ib-spin" /> : <Send size={15} />}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="ib-empty-thread">
                <MessageSquare size={40} style={{ color: '#ede6d9' }} />
                <p>Your Unified Inbox</p>
                <p>Select a conversation from the sidebar to start replying.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Inbox;