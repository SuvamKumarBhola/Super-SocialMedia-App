import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import {
  Loader2, Clock, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon,
  Calendar as CalendarIcon, Info
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  isToday, parseISO
} from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ─── helpers ─── */
const safeParseISO = (str) => {
  try { return str ? parseISO(str) : null; } catch { return null; }
};

const Calendar = () => {
  const { token, activeOrgId } = useAuthStore();
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'approvals'
  const [viewMode, setViewMode] = useState('grid');       // 'grid' | 'list'
  const [currentMonth, setCurrentMonth] = useState(new Date());

  /* ── fetch ── */
  const fetchCalendar = async () => {
    if (!token || !activeOrgId) return;
    try {
      setLoading(true);
      const start = startOfWeek(startOfMonth(currentMonth));
      const end = endOfWeek(endOfMonth(currentMonth));
      const res = await axios.get(
        `${API_URL}/posts/calendar/${activeOrgId}?start=${start.toISOString()}&end=${end.toISOString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScheduledPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setScheduledPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && activeOrgId) fetchCalendar();
  }, [token, activeOrgId, currentMonth]);

  /* ── review ── */
  const handleReview = async (postId, approved, reviewMessage = '') => {
    if (!postId) return;
    try {
      await axios.post(
        `${API_URL}/posts/${postId}/review`,
        { approved, reviewMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCalendar();
    } catch (err) {
      console.error('Failed to review post', err);
    }
  };

  /* ── calendar grid ── */
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getPostsForDay = (day) =>
    scheduledPosts.filter(sp => {
      const d = safeParseISO(sp.scheduledTime);
      return d && isSameDay(d, day) && sp.status !== 'paused';
    });

  /* ── status ── */
  const STATUS = {
    completed: { icon: <CheckCircle2 size={12} />, color: '#4a8c3a', bg: 'rgba(74,140,58,0.1)' },
    failed: { icon: <XCircle size={12} />, color: '#c85040', bg: 'rgba(200,80,60,0.1)' },
    pending: { icon: <Clock size={12} />, color: '#c8920a', bg: 'rgba(200,146,10,0.1)' },
    processing: { icon: <Clock size={12} />, color: '#c8920a', bg: 'rgba(200,146,10,0.1)' },
  };
  const getStatus = (s) => STATUS[s] || STATUS.pending;

  /* ── approval count ── */
  const pendingApprovals = scheduledPosts.filter(
    sp => sp.status === 'paused' || sp.postVariantId?.status === 'pending'
  );

  /* ── list posts ── */
  const displayListPosts = scheduledPosts.filter(sp =>
    activeTab === 'approvals'
      ? sp.status === 'paused' || sp.postVariantId?.status === 'pending'
      : sp.status !== 'paused'
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .cal-root * { font-family: 'Poppins', system-ui, sans-serif; box-sizing: border-box; }

        .cal-root {
          max-width: 1100px;
          margin: 0 auto;
          padding: 28px 8px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ── page header ── */
        .cal-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .cal-page-title { font-size: 19px; font-weight: 700; color: #2a1f0f; letter-spacing: -0.02em; }
        .cal-page-sub   { font-size: 13px; color: #7a6a55; margin-top: 3px; }

        /* view toggle */
        .cal-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #ede6d9;
          border: 1px solid rgba(120,90,50,0.14);
          border-radius: 10px;
          padding: 4px;
        }
        .cal-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 7px;
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Poppins', system-ui, sans-serif;
          color: #7a6a55;
          cursor: pointer;
          transition: all 0.15s;
        }
        .cal-toggle-btn.active {
          background: #f3ede3;
          color: #6d3cb4;
          box-shadow: 0 1px 6px rgba(42,31,15,0.08);
        }

        /* ── tabs + month nav bar ── */
        .cal-bar {
          background: #f3ede3;
          border: 1px solid rgba(120,90,50,0.14);
          border-radius: 14px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        .cal-tabs { display: flex; gap: 0; }
        .cal-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 14px 4px;
          margin-right: 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Poppins', system-ui, sans-serif;
          color: #7a6a55;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
          white-space: nowrap;
        }
        .cal-tab.active { color: #6d3cb4; border-bottom-color: #6d3cb4; }
        .cal-tab:hover:not(.active) { color: #2a1f0f; }

        .cal-badge {
          font-size: 9px;
          font-weight: 800;
          color: #fff;
          background: #c85040;
          padding: 2px 7px;
          border-radius: 999px;
        }

        /* month nav */
        .cal-month-nav {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
        }
        .cal-nav-btn {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: 1px solid rgba(120,90,50,0.16);
          background: #faf7f2;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #7a6a55;
          transition: all 0.15s;
        }
        .cal-nav-btn:hover { border-color: rgba(109,60,180,0.3); color: #6d3cb4; }
        .cal-month-label {
          font-size: 13px;
          font-weight: 700;
          color: #2a1f0f;
          min-width: 130px;
          text-align: center;
        }

        /* ── grid view ── */
        .cal-grid-wrap {
          background: #f3ede3;
          border: 1px solid rgba(120,90,50,0.14);
          border-radius: 14px;
          overflow: hidden;
        }
        .cal-day-labels {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-bottom: 1px solid rgba(120,90,50,0.1);
          background: #ede6d9;
        }
        .cal-day-label {
          padding: 10px 0;
          text-align: center;
          font-size: 10px;
          font-weight: 800;
          color: #c4b49a;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          min-height: 580px;
        }
        .cal-cell {
          min-height: 110px;
          padding: 8px;
          border-right: 1px solid rgba(120,90,50,0.08);
          border-bottom: 1px solid rgba(120,90,50,0.08);
          position: relative;
          transition: background 0.15s;
        }
        .cal-cell:nth-child(7n) { border-right: none; }
        .cal-cell.other-month { background: rgba(237,230,217,0.4); }
        .cal-cell.today-cell  { background: rgba(109,60,180,0.03); }
        .cal-cell:not(.other-month):hover { background: rgba(109,60,180,0.04); }

        .cal-date-num {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .cal-date-num.today {
          background: linear-gradient(135deg, #6d3cb4, #5a58d6);
          color: #fff;
          box-shadow: 0 2px 8px rgba(109,60,180,0.35);
        }
        .cal-date-num.current-month { color: #2a1f0f; }
        .cal-date-num.other         { color: #c4b49a; }

        .cal-post-count {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 9px;
          font-weight: 700;
          color: #c4b49a;
          letter-spacing: 0.04em;
        }

        .cal-cell-posts { display: flex; flex-direction: column; gap: 3px; overflow-y: auto; max-height: 70px; }
        .cal-cell-posts::-webkit-scrollbar { width: 2px; }
        .cal-cell-posts::-webkit-scrollbar-thumb { background: #c4b49a; border-radius: 2px; }

        /* post chip in grid */
        .cal-chip {
          position: relative;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 6px;
          background: #faf7f2;
          border: 1px solid rgba(120,90,50,0.12);
          border-radius: 6px;
          cursor: pointer;
          transition: box-shadow 0.15s;
        }
        .cal-chip:hover { box-shadow: 0 2px 10px rgba(42,31,15,0.1); }
        .cal-chip-avatar { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
        .cal-chip-label { font-size: 10px; font-weight: 500; color: #2a1f0f; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70px; }
        .cal-chip-status { margin-left: auto; flex-shrink: 0; }

        /* tooltip */
        .cal-tooltip {
          display: none;
          position: absolute;
          z-index: 30;
          bottom: calc(100% + 6px);
          left: 0;
          width: 190px;
          background: #2a1f0f;
          color: #faf7f2;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 11px;
          pointer-events: none;
          box-shadow: 0 8px 24px rgba(42,31,15,0.25);
        }
        .cal-chip:hover .cal-tooltip { display: block; }
        .cal-tooltip-platform { font-weight: 800; font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px; margin-bottom: 5px; color: #c4b49a; }
        .cal-tooltip-caption { font-style: italic; line-height: 1.5; color: #f3ede3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
        .cal-tooltip-time { margin-top: 5px; color: #8b5cf6; font-weight: 700; font-size: 10px; }

        /* ── list / approvals view ── */
        .cal-list-wrap {
          background: #f3ede3;
          border: 1px solid rgba(120,90,50,0.14);
          border-radius: 14px;
          overflow: hidden;
        }
        .cal-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          gap: 10px;
          color: #c4b49a;
          text-align: center;
        }
        .cal-empty p:first-of-type { font-size: 14px; font-weight: 600; color: #7a6a55; }
        .cal-empty p:last-of-type  { font-size: 12px; }

        .cal-list-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(120,90,50,0.1);
          transition: background 0.15s;
        }
        .cal-list-item:last-child { border-bottom: none; }
        .cal-list-item:hover { background: rgba(109,60,180,0.03); }

        .cal-list-avatar-wrap { position: relative; flex-shrink: 0; }
        .cal-list-avatar { width: 44px; height: 44px; border-radius: 50%; border: 2px solid rgba(120,90,50,0.14); object-fit: cover; }
        .cal-list-dot {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #f3ede3;
        }

        .cal-list-body { flex: 1; min-width: 0; }
        .cal-list-platform { font-size: 13px; font-weight: 700; color: #2a1f0f; display: flex; align-items: center; gap: 8px; }
        .cal-list-username { font-size: 12px; font-weight: 400; color: #7a6a55; }
        .cal-list-caption { font-size: 12px; color: #7a6a55; font-style: italic; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 360px; }
        .cal-list-tags { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
        .cal-list-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 5px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .cal-list-tag.date { background: #ede6d9; color: #7a6a55; }
        .cal-list-tag.time { background: rgba(109,60,180,0.1); color: #6d3cb4; }

        .cal-list-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .cal-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .cal-btn-reject {
          padding: 7px 14px;
          border: 1px solid rgba(200,80,60,0.25);
          border-radius: 8px;
          background: transparent;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Poppins', system-ui, sans-serif;
          color: #c85040;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.05em;
        }
        .cal-btn-reject:hover { background: rgba(200,80,60,0.07); border-color: rgba(200,80,60,0.4); }

        .cal-btn-approve {
          padding: 7px 14px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #4a8c3a, #3a7a2a);
          font-size: 11px;
          font-weight: 700;
          font-family: 'Poppins', system-ui, sans-serif;
          color: #fff;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 8px rgba(74,140,58,0.25);
        }
        .cal-btn-approve:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── legend ── */
        .cal-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          padding: 0 4px;
        }
        .cal-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          color: #c4b49a;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }
        .cal-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        @keyframes cal-spin { to { transform: rotate(360deg); } }
        .cal-spin { animation: cal-spin 0.8s linear infinite; }
      `}</style>

      <div className="cal-root">

        {/* ── page header ── */}
        <div className="cal-page-header">
          <div>
            <div className="cal-page-title">Content Calendar</div>
            <div className="cal-page-sub">Coordinate and review your cross-platform content strategy.</div>
          </div>
          {activeTab === 'calendar' && (
            <div className="cal-toggle">
              <button className={`cal-toggle-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')}>
                <LayoutGrid size={13} /> Grid
              </button>
              <button className={`cal-toggle-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')}>
                <ListIcon size={13} /> List
              </button>
            </div>
          )}
        </div>

        {/* ── tabs + month nav ── */}
        <div className="cal-bar">
          <div className="cal-tabs">
            <button className={`cal-tab${activeTab === 'calendar' ? ' active' : ''}`} onClick={() => setActiveTab('calendar')}>
              <CalendarIcon size={13} /> Calendar
            </button>
            <button className={`cal-tab${activeTab === 'approvals' ? ' active' : ''}`} onClick={() => setActiveTab('approvals')}>
              Approvals
              {pendingApprovals.length > 0 && (
                <span className="cal-badge">{pendingApprovals.length}</span>
              )}
            </button>
          </div>

          {activeTab === 'calendar' && viewMode === 'grid' && (
            <div className="cal-month-nav">
              <button className="cal-nav-btn" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft size={14} />
              </button>
              <div className="cal-month-label">{format(currentMonth, 'MMMM yyyy')}</div>
              <button className="cal-nav-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── main content ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 size={28} style={{ color: '#6d3cb4' }} className="cal-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'calendar' && viewMode === 'grid' ? (

              /* ── grid view ── */
              <div className="cal-grid-wrap">
                <div className="cal-day-labels">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="cal-day-label">{d}</div>
                  ))}
                </div>
                <div className="cal-grid">
                  {calendarDays.map((day) => {
                    const dayPosts = getPostsForDay(day);
                    const inMonth = isSameMonth(day, currentMonth);
                    const todayCell = isToday(day);
                    return (
                      <div key={day.toISOString()}
                        className={`cal-cell${!inMonth ? ' other-month' : ''}${todayCell ? ' today-cell' : ''}`}>
                        <span className={`cal-date-num${todayCell ? ' today' : inMonth ? ' current-month' : ' other'}`}>
                          {format(day, 'd')}
                        </span>
                        {dayPosts.length > 0 && (
                          <span className="cal-post-count">{dayPosts.length}p</span>
                        )}
                        <div className="cal-cell-posts">
                          {dayPosts.map(post => {
                            const variant = post.postVariantId;
                            const avatar = variant?.socialAccountId?.profileData?.avatar
                              || `https://ui-avatars.com/api/?name=${variant?.platform || 'P'}&background=ede6d9&color=6d3cb4&size=32`;
                            const s = getStatus(post.status);
                            const dateObj = safeParseISO(post.scheduledTime);
                            return (
                              <div key={post._id} className="cal-chip">
                                <img src={avatar} alt="" className="cal-chip-avatar" />
                                <span className="cal-chip-label">
                                  {variant?.platform}: {(variant?.caption || '').substring(0, 10)}
                                </span>
                                <span className="cal-chip-status" style={{ color: s.color }}>{s.icon}</span>
                                {/* tooltip */}
                                <div className="cal-tooltip">
                                  <div className="cal-tooltip-platform">{variant?.platform} account</div>
                                  <div className="cal-tooltip-caption">"{variant?.caption}"</div>
                                  {dateObj && (
                                    <div className="cal-tooltip-time">⏰ {format(dateObj, 'hh:mm a')}</div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            ) : (

              /* ── list / approvals view ── */
              <div className="cal-list-wrap">
                {displayListPosts.length === 0 ? (
                  <div className="cal-empty">
                    <CalendarIcon size={36} style={{ color: '#ede6d9' }} />
                    <p>No posts found</p>
                    <p>
                      {activeTab === 'calendar'
                        ? 'Try scheduling new content to see it here.'
                        : 'No posts are awaiting approval right now.'}
                    </p>
                  </div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {displayListPosts.map((sp) => {
                      const variant = sp.postVariantId;
                      const post = variant?.postId;
                      const account = variant?.socialAccountId;

                      // guard against missing relations
                      if (!variant || !post || !account) return null;

                      const dateObj = safeParseISO(sp.scheduledTime);
                      const s = getStatus(sp.status);
                      const avatar = account.profileData?.avatar
                        || `https://ui-avatars.com/api/?name=${account.platform || 'P'}&background=ede6d9&color=6d3cb4`;

                      return (
                        <li key={sp._id} className="cal-list-item">
                          {/* avatar */}
                          <div className="cal-list-avatar-wrap">
                            <img src={avatar} alt="" className="cal-list-avatar" />
                            <div className="cal-list-dot" style={{ background: s.color }} />
                          </div>

                          {/* body */}
                          <div className="cal-list-body">
                            <div className="cal-list-platform">
                              <span style={{ textTransform: 'capitalize' }}>{account.platform}</span>
                              <span className="cal-list-username">@{account.profileData?.username}</span>
                            </div>
                            <div className="cal-list-caption">"{variant.caption}"</div>
                            {dateObj && (
                              <div className="cal-list-tags">
                                <span className="cal-list-tag date">{format(dateObj, 'MMM d, yyyy')}</span>
                                <span className="cal-list-tag time">{format(dateObj, 'hh:mm a')}</span>
                              </div>
                            )}
                          </div>

                          {/* actions */}
                          <div className="cal-list-actions">
                            {activeTab === 'calendar' ? (
                              <span className="cal-status-pill"
                                style={{ background: s.bg, color: s.color }}>
                                {s.icon}&nbsp;{sp.status}
                              </span>
                            ) : (
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="cal-btn-reject"
                                  onClick={() => handleReview(post._id, false)}>
                                  Reject
                                </button>
                                <button className="cal-btn-approve"
                                  onClick={() => handleReview(post._id, true)}>
                                  Approve
                                </button>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </>
        )}

        {/* ── legend ── */}
        <div className="cal-legend">
          <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background: '#4a8c3a' }} /> Completed</div>
          <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background: '#c8920a' }} /> Pending / Processing</div>
          <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background: '#c85040' }} /> Failed / Rejected</div>
          <div className="cal-legend-item" style={{ opacity: 0.5 }}><Info size={11} /> Hover grid items to preview caption</div>
        </div>

      </div>
    </>
  );
};

export default Calendar;