import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { Loader2, Activity, PenSquare, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ActivityLog = () => {
  const { token, activeOrgId } = useAuthStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !activeOrgId) return;
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/activity/${activeOrgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to fetch activity logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token, activeOrgId]);

  const getLogIcon = (action) => {
    if (action.includes('approved'))
      return { icon: <CheckCircle size={15} />, bg: 'rgba(74,140,58,0.1)', color: '#4a8c3a', border: 'rgba(74,140,58,0.2)' };
    if (action.includes('rejected'))
      return { icon: <XCircle size={15} />,    bg: 'rgba(200,80,60,0.1)', color: '#c85040', border: 'rgba(200,80,60,0.2)' };
    if (action.includes('post'))
      return { icon: <PenSquare size={15} />,  bg: 'rgba(109,60,180,0.1)', color: '#6d3cb4', border: 'rgba(109,60,180,0.2)' };
    if (action.includes('message'))
      return { icon: <MessageSquare size={15} />, bg: 'rgba(90,88,214,0.1)', color: '#5a58d6', border: 'rgba(90,88,214,0.2)' };
    return { icon: <Activity size={15} />, bg: '#ede6d9', color: '#7a6a55', border: 'rgba(120,90,50,0.18)' };
  };

  const getLogMessage = (log) => {
    const name = log.userId?.name || 'A user';
    switch (log.action) {
      case 'submitted_post_for_approval': return `${name} submitted a post for approval.`;
      case 'published_post':              return `${name} published a post immediately.`;
      case 'scheduled_post':              return `${name} scheduled a post.`;
      case 'approved_post':               return `${name} approved a pending post.`;
      case 'rejected_post':               return `${name} rejected a pending post.`;
      default: return `${name} performed an action: ${log.action.replace(/_/g, ' ')}`;
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <Loader2 size={28} style={{ color: '#6d3cb4', animation: 'al-spin 0.8s linear infinite' }} />
      <style>{`@keyframes al-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .al-root * { font-family: 'Poppins', system-ui, sans-serif; box-sizing: border-box; }
        .al-root {
          max-width: 860px;
          margin: 0 auto;
          padding: 32px 8px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Page header card */
        .al-header {
          background: #f3ede3;
          border: 1px solid rgba(120, 90, 50, 0.14);
          border-radius: 16px;
          padding: 22px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .al-header-title {
          font-size: 19px;
          font-weight: 700;
          color: #2a1f0f;
          letter-spacing: -0.02em;
        }
        .al-header-sub {
          font-size: 13px;
          color: #7a6a55;
          margin-top: 3px;
        }
        .al-count-badge {
          font-size: 11px;
          font-weight: 700;
          color: #6d3cb4;
          background: rgba(109, 60, 180, 0.1);
          border: 1px solid rgba(109, 60, 180, 0.2);
          padding: 4px 12px;
          border-radius: 999px;
          white-space: nowrap;
        }

        /* Log list card */
        .al-card {
          background: #f3ede3;
          border: 1px solid rgba(120, 90, 50, 0.14);
          border-radius: 16px;
          overflow: hidden;
        }

        /* Empty state */
        .al-empty {
          padding: 52px 24px;
          text-align: center;
          color: #c4b49a;
          font-size: 14px;
        }

        /* Log item */
        .al-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(120, 90, 50, 0.1);
          transition: background 0.15s;
          cursor: default;
        }
        .al-item:last-child { border-bottom: none; }
        .al-item:hover { background: rgba(109, 60, 180, 0.03); }

        .al-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
          border: 1px solid;
        }

        .al-item-body { flex: 1; min-width: 0; }
        .al-item-msg {
          font-size: 13px;
          font-weight: 500;
          color: #2a1f0f;
          line-height: 1.5;
        }
        .al-item-preview {
          margin-top: 5px;
          font-size: 12px;
          color: #7a6a55;
          font-style: italic;
          border-left: 2px solid rgba(109, 60, 180, 0.25);
          padding-left: 9px;
        }

        .al-item-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #c4b49a;
          flex-shrink: 0;
          margin-top: 2px;
          white-space: nowrap;
        }
      `}</style>

      <div className="al-root">
        {/* Header */}
        <div className="al-header">
          <div>
            <div className="al-header-title">Audit Trail</div>
            <div className="al-header-sub">Track all team activity across your workspace.</div>
          </div>
          {logs.length > 0 && (
            <span className="al-count-badge">{logs.length} {logs.length === 1 ? 'entry' : 'entries'}</span>
          )}
        </div>

        {/* Log list */}
        <div className="al-card">
          {logs.length === 0 ? (
            <div className="al-empty">No activity recorded yet for this workspace.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {logs.map((log) => {
                const { icon, bg, color, border } = getLogIcon(log.action);
                return (
                  <li key={log._id} className="al-item">
                    <div className="al-icon-wrap" style={{ background: bg, color, borderColor: border }}>
                      {icon}
                    </div>
                    <div className="al-item-body">
                      <div className="al-item-msg">{getLogMessage(log)}</div>
                      {log.metadata?.captionPreview && (
                        <div className="al-item-preview">"{log.metadata.captionPreview}..."</div>
                      )}
                      {log.metadata?.reviewMessage && (
                        <div className="al-item-preview">Reason: "{log.metadata.reviewMessage}"</div>
                      )}
                    </div>
                    <div className="al-item-time">
                      <Clock size={11} />
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default ActivityLog;