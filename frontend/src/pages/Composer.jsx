import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import {
  Loader2, Image as ImageIcon, Video, Calendar as CalendarIcon,
  Send, Sparkles, Eye, X, ChevronDown, CheckCircle2,
  AlignLeft, Hash, Smile, LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TONES = [
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'funny', label: 'Humorous' },
  { value: 'inspiring', label: 'Inspiring' },
];

const PLATFORM_COLORS = {
  instagram: '#e1306c',
  facebook: '#1877f2',
  x: '#2a1f0f',
  linkedin: '#0a66c2',
  youtube: '#ff0000',
};

/* ── tiny char count helper ── */
const CharCount = ({ val, max }) => {
  const pct = val / max;
  const c = pct > 0.9 ? '#c85040' : pct > 0.7 ? '#c8920a' : '#4a8c3a';
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: c }}>
      {val}/{max}
    </span>
  );
};

const Composer = () => {
  const { token, activeOrgId } = useAuthStore();
  const navigate = useNavigate();

  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [scheduleTime, setScheduleTime] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);

  /* AI */
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiTopic, setAITopic] = useState('');
  const [aiTone, setAITone] = useState('casual');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [generatingHashtags, setGeneratingHashtags] = useState(false);

  /* success toast */
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  useEffect(() => {
    if (!token || !activeOrgId) return;
    (async () => {
      try {
        const accRes = await axios.get(`${API_URL}/social/accounts/${activeOrgId}`, {
          headers: { Authorization: `Bearer ${token}`, 'x-active-org-id': activeOrgId },
        });
        setAccounts(Array.isArray(accRes.data) ? accRes.data : []);
      } catch (err) { console.error('Error fetching accounts:', err); }
      try {
        const campRes = await axios.get(`${API_URL}/campaigns`, {
          headers: { Authorization: `Bearer ${token}`, 'x-active-org-id': activeOrgId },
        });
        setCampaigns(Array.isArray(campRes.data) ? campRes.data : []);
      } catch (err) { console.error('Error fetching campaigns:', err); }
      finally { setFetchingAccounts(false); }
    })();
  }, [token, activeOrgId]);

  const handleAccountToggle = (id) =>
    setSelectedAccounts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) { setMediaFile(file); setMediaPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedAccounts.length === 0) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('orgId', activeOrgId);
      fd.append('baseCaption', caption);
      fd.append('platforms', JSON.stringify(
        selectedAccounts.map(id => {
          const acc = accounts.find(a => a._id === id);
          return { platform: acc.platform, socialAccountId: id };
        })
      ));
      if (scheduleTime) fd.append('scheduledTime', new Date(scheduleTime).toISOString());
      if (selectedCampaign) fd.append('campaignId', selectedCampaign);
      fd.append('requiresApproval', requiresApproval);
      if (mediaFile) fd.append('mediaFile', mediaFile);

      await axios.post(`${API_URL}/posts`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      showToast(requiresApproval ? 'Submitted for approval!' : scheduleTime ? 'Post scheduled!' : 'Published!');
      setTimeout(() => navigate('/dashboard/calendar'), 1400);
    } catch (err) {
      console.error(err);
      showToast('Something went wrong — please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setGeneratingAI(true);
    try {
      const res = await axios.post(`${API_URL}/ai/generate-caption`, {
        topic: aiTopic,
        tone: aiTone,
        platform: selectedAccounts.length > 0
          ? accounts.find(a => a._id === selectedAccounts[0])?.platform
          : 'general',
      }, { headers: { Authorization: `Bearer ${token}` } });
      setCaption(prev => prev + (prev ? '\n\n' : '') + res.data.caption);
      setShowAIPanel(false);
      setAITopic('');
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleMagicHashtags = async () => {
    if (!caption.trim() && !aiTopic.trim()) {
      showToast('Please write something or enter a topic first!');
      return;
    }
    setGeneratingHashtags(true);
    try {
      const res = await axios.post(`${API_URL}/ai/hashtags`, {
        topic: aiTopic || caption.split(' ').slice(0, 5).join(' '),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setCaption(prev => prev + (prev ? '\n\n' : '') + res.data.hashtags);
      showToast('Magic Hashtags added!');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate hashtags.');
    } finally {
      setGeneratingHashtags(false);
    }
  };

  /* ── submit label ── */
  const submitLabel = requiresApproval ? 'Submit for Approval'
    : scheduleTime ? 'Schedule Post' : 'Publish Now';

  if (fetchingAccounts) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <Loader2 size={28} style={{ color: '#6d3cb4', animation: 'cp-spin 0.8s linear infinite' }} />
      <style>{`@keyframes cp-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .cp-root * { font-family: 'Poppins', system-ui, sans-serif; box-sizing: border-box; }
        @keyframes cp-spin  { to { transform: rotate(360deg); } }
        @keyframes cp-toast { 0%{opacity:0;transform:translateY(10px)} 15%,85%{opacity:1;transform:translateY(0)} 100%{opacity:0} }
        .cp-spin  { animation: cp-spin 0.8s linear infinite; }

        .cp-root {
          max-width: 1080px;
          margin: 0 auto;
          padding: 28px 8px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        /* ── page header ── */
        .cp-page-header { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .cp-page-title  { font-size: 19px; font-weight: 700; color: #2a1f0f; letter-spacing: -0.02em; }
        .cp-page-sub    { font-size: 13px; color: #7a6a55; margin-top: 3px; }

        /* ── layout ── */
        .cp-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 18px;
          align-items: start;
        }
        @media(max-width:820px) { .cp-layout { grid-template-columns: 1fr; } }

        /* ── shared card ── */
        .cp-card {
          background: #f3ede3;
          border: 1px solid rgba(120,90,50,0.14);
          border-radius: 16px;
          overflow: visible;
        }
        .cp-card-head {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(120,90,50,0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cp-card-title { font-size: 13px; font-weight: 700; color: #2a1f0f; }
        .cp-card-body  { padding: 20px; display: flex; flex-direction: column; gap: 18px; }

        /* ── section label ── */
        .cp-label { font-size: 12px; font-weight: 600; color: #2a1f0f; margin-bottom: 6px; }
        .cp-sublabel { font-size: 11px; color: #7a6a55; }

        /* ── textarea ── */
        .cp-textarea {
          width: 100%;
          background: #faf7f2;
          border: 1px solid rgba(120,90,50,0.16);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13.5px;
          font-family: 'Poppins', system-ui, sans-serif;
          color: #2a1f0f;
          outline: none;
          resize: none;
          line-height: 1.7;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .cp-textarea::placeholder { color: #c4b49a; }
        .cp-textarea:focus {
          border-color: rgba(109,60,180,0.4);
          box-shadow: 0 0 0 3px rgba(109,60,180,0.08);
        }

        /* ── AI button ── */
        .cp-ai-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 13px;
          border-radius: 999px;
          border: 1px solid rgba(109,60,180,0.25);
          background: rgba(109,60,180,0.07);
          font-size: 12px;
          font-weight: 600;
          font-family: 'Poppins', system-ui, sans-serif;
          color: #6d3cb4;
          cursor: pointer;
          transition: all 0.15s;
        }
        .cp-ai-btn:hover { background: rgba(109,60,180,0.12); border-color: rgba(109,60,180,0.4); }

        /* ── AI panel (popover) ── */
        .cp-ai-panel {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 300px;
          background: #faf7f2;
          border: 1px solid rgba(120,90,50,0.16);
          border-radius: 14px;
          box-shadow: 0 16px 48px rgba(42,31,15,0.14);
          z-index: 20;
          overflow: hidden;
          animation: cp-drop 0.18s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes cp-drop {
          from { opacity:0; transform:translateY(-8px) scaleY(0.94); }
          to   { opacity:1; transform:translateY(0) scaleY(1); }
        }
        .cp-ai-panel-head {
          padding: 12px 14px;
          background: #f3ede3;
          border-bottom: 1px solid rgba(120,90,50,0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cp-ai-panel-title { font-size: 12px; font-weight: 700; color: #2a1f0f; }
        .cp-ai-panel-body  { padding: 14px; display: flex; flex-direction: column; gap: 12px; }

        /* ── inputs / selects ── */
        .cp-input, .cp-select {
          width: 100%;
          background: #f3ede3;
          border: 1px solid rgba(120,90,50,0.16);
          border-radius: 9px;
          padding: 8px 11px;
          font-size: 12.5px;
          font-family: 'Poppins', system-ui, sans-serif;
          color: #2a1f0f;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .cp-input::placeholder { color: #c4b49a; }
        .cp-input:focus, .cp-select:focus {
          border-color: rgba(109,60,180,0.4);
          box-shadow: 0 0 0 3px rgba(109,60,180,0.08);
        }
        .cp-select { appearance: none; cursor: pointer; }

        /* ── media upload ── */
        .cp-media-row { display: flex; gap: 10px; align-items: center; }
        .cp-media-type {
          width: 100px;
          flex-shrink: 0;
        }
        .cp-upload-label {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border: 2px dashed rgba(120,90,50,0.2);
          border-radius: 10px;
          cursor: pointer;
          font-size: 12.5px;
          font-weight: 500;
          color: #7a6a55;
          transition: all 0.15s;
          background: #faf7f2;
        }
        .cp-upload-label:hover {
          border-color: rgba(109,60,180,0.4);
          color: #6d3cb4;
          background: rgba(109,60,180,0.04);
        }

        /* ── schedule row ── */
        .cp-schedule-row { display: flex; align-items: center; gap: 10px; }
        .cp-datetime {
          flex: 1;
          background: #faf7f2;
          border: 1px solid rgba(120,90,50,0.16);
          border-radius: 9px;
          padding: 8px 11px;
          font-size: 12.5px;
          font-family: 'Poppins', system-ui, sans-serif;
          color: #2a1f0f;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .cp-datetime:focus {
          border-color: rgba(109,60,180,0.4);
          box-shadow: 0 0 0 3px rgba(109,60,180,0.08);
        }

        /* ── checkbox row ── */
        .cp-check-row { display: flex; align-items: center; gap: 8px; }
        .cp-check-row input[type="checkbox"] { width: 15px; height: 15px; accent-color: #6d3cb4; cursor: pointer; }
        .cp-check-label { font-size: 12.5px; color: #2a1f0f; cursor: pointer; font-weight: 500; }

        /* ── divider ── */
        .cp-divider { height: 1px; background: rgba(120,90,50,0.1); }

        /* ── submit bar ── */
        .cp-submit-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-top: 1px solid rgba(120,90,50,0.1);
          background: #ede6d9;
          border-radius: 0 0 16px 16px;
        }
        .cp-submit-hint { font-size: 11px; color: #c4b49a; }
        .cp-submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 22px;
          background: linear-gradient(135deg, #6d3cb4, #5a58d6);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Poppins', system-ui, sans-serif;
          cursor: pointer;
          box-shadow: 0 2px 14px rgba(109,60,180,0.28);
          transition: all 0.2s;
        }
        .cp-submit-btn:hover:not(:disabled) { box-shadow: 0 4px 22px rgba(109,60,180,0.4); transform: translateY(-1px); }
        .cp-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── sidebar: platform picker ── */
        .cp-platform-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border: 1px solid rgba(120,90,50,0.12);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
          background: #faf7f2;
        }
        .cp-platform-item.sel {
          border-color: rgba(109,60,180,0.35);
          background: rgba(109,60,180,0.05);
        }
        .cp-platform-item:hover { border-color: rgba(109,60,180,0.25); }
        .cp-platform-left { display: flex; align-items: center; gap: 10px; }
        .cp-platform-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(120,90,50,0.12); }
        .cp-platform-name { font-size: 12.5px; font-weight: 600; color: #2a1f0f; text-transform: capitalize; }
        .cp-platform-handle { font-size: 11px; color: #7a6a55; margin-top: 1px; }
        .cp-platform-check { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(120,90,50,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
        .cp-platform-check.on { background: linear-gradient(135deg,#6d3cb4,#5a58d6); border-color: transparent; }

        /* ── preview pane ── */
        .cp-preview-media {
          width: 100%;
          height: 160px;
          background: #ede6d9;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c4b49a;
          font-size: 12px;
        }
        .cp-preview-media img,
        .cp-preview-media video { width: 100%; height: 100%; object-fit: cover; }
        .cp-preview-caption {
          background: #faf7f2;
          border: 1px solid rgba(120,90,50,0.12);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 12.5px;
          color: #2a1f0f;
          line-height: 1.65;
          white-space: pre-wrap;
          min-height: 64px;
        }
        .cp-preview-placeholder { color: #c4b49a; font-style: italic; }

        /* ── platform dots row ── */
        .cp-preview-dots { display: flex; gap: 6px; flex-wrap: wrap; }
        .cp-preview-dot  {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 999px;
          background: #ede6d9;
          color: #7a6a55;
          border: 1px solid rgba(120,90,50,0.12);
        }
        .cp-preview-dot-color { width: 7px; height: 7px; border-radius: 50%; }

        /* ── toast ── */
        .cp-toast {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          background: #2a1f0f;
          color: #faf7f2;
          padding: 10px 22px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Poppins', system-ui, sans-serif;
          box-shadow: 0 8px 28px rgba(42,31,15,0.22);
          z-index: 200;
          animation: cp-toast 3.2s ease both;
          white-space: nowrap;
        }
      `}</style>

      <div className="cp-root">

        {/* ── page header ── */}
        <div className="cp-page-header">
          <div>
            <div className="cp-page-title">Compose Post</div>
            <div className="cp-page-sub">Create and publish content across all your connected platforms.</div>
          </div>
        </div>

        {/* ── main layout ── */}
        <div className="cp-layout">

          {/* ── LEFT: compose form ── */}
          <div className="cp-card">
            <div className="cp-card-head">
              <span className="cp-card-title">Post Content</span>
              {/* AI button with relative wrapper for popover */}
              <div style={{ position: 'relative' }}>
                <button className="cp-ai-btn" type="button" onClick={() => setShowAIPanel(v => !v)}>
                  <Sparkles size={13} /> AI Assistant
                </button>

                {showAIPanel && (
                  <div className="cp-ai-panel">
                    <div className="cp-ai-panel-head">
                      <span className="cp-ai-panel-title">Generate Caption</span>
                      <button onClick={() => setShowAIPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6a55', display: 'flex' }}>
                        <X size={13} />
                      </button>
                    </div>
                    <div className="cp-ai-panel-body">
                      <div>
                        <div className="cp-label" style={{ marginBottom: 5 }}>What's the post about?</div>
                        <input
                          type="text"
                          className="cp-input"
                          placeholder="e.g. New coffee product launch"
                          value={aiTopic}
                          onChange={e => setAITopic(e.target.value)}
                        />
                      </div>
                      <div>
                        <div className="cp-label" style={{ marginBottom: 5 }}>Tone</div>
                        <select className="cp-select" value={aiTone} onChange={e => setAITone(e.target.value)}>
                          {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 2 }}>
                        <button type="button" onClick={() => setShowAIPanel(false)}
                          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(120,90,50,0.16)', background: 'transparent', fontSize: 12, color: '#7a6a55', cursor: 'pointer', fontFamily: 'Poppins, system-ui, sans-serif' }}>
                          Cancel
                        </button>
                        <button type="button" onClick={handleGenerateAI} disabled={generatingAI || !aiTopic.trim()}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6d3cb4,#5a58d6)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: generatingAI ? 'not-allowed' : 'pointer', opacity: (!aiTopic.trim() || generatingAI) ? 0.6 : 1, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                          {generatingAI ? <Loader2 size={11} className="cp-spin" /> : <Sparkles size={11} />}
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="cp-card-body">

                {/* caption */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div className="cp-label" style={{ marginBottom: 0 }}>Caption</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button type="button" onClick={handleMagicHashtags} className="cp-ai-btn" style={{ background: 'rgba(58, 140, 58, 0.07)', color: '#4a8c3a', border: '1px solid rgba(58, 140, 58, 0.2)' }} disabled={generatingHashtags}>
                        {generatingHashtags ? <Loader2 size={12} className="cp-spin" /> : <Hash size={12} />} Magic Hashtags
                      </button>
                      <CharCount val={caption.length} max={2200} />
                    </div>
                  </div>
                  <textarea
                    rows={6}
                    className="cp-textarea"
                    placeholder="What do you want to share today? Write something engaging…"
                    value={caption}
                    required
                    onChange={e => setCaption(e.target.value)}
                  />
                </div>

                {/* media */}
                <div>
                  <div className="cp-label">Media Upload <span className="cp-sublabel">(optional)</span></div>
                  <div className="cp-media-row">
                    <select className="cp-select cp-media-type" value={mediaType} onChange={e => { setMediaType(e.target.value); setMediaFile(null); setMediaPreview(null); }}>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                    <input type="file" id="media-upload" style={{ display: 'none' }} accept={mediaType === 'image' ? 'image/*' : 'video/*'} onChange={handleMediaChange} />
                    <label htmlFor="media-upload" className="cp-upload-label">
                      {mediaFile ? (
                        <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{mediaFile.name}</span>
                      ) : (
                        <>
                          {mediaType === 'image' ? <ImageIcon size={15} /> : <Video size={15} />}
                          Click to select {mediaType}
                        </>
                      )}
                    </label>
                    {mediaFile && (
                      <button type="button" onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                        style={{ background: 'none', border: '1px solid rgba(200,80,60,0.25)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#c85040', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}>
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="cp-divider" />

                {/* schedule */}
                <div>
                  <div className="cp-label">Schedule <span className="cp-sublabel">(leave blank to publish immediately)</span></div>
                  <div className="cp-schedule-row">
                    <CalendarIcon size={15} style={{ color: '#7a6a55', flexShrink: 0 }} />
                    <input type="datetime-local" className="cp-datetime" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                  </div>
                </div>

                {/* approval checkbox */}
                <div className="cp-check-row">
                  <input type="checkbox" id="requireApproval" checked={requiresApproval} onChange={e => setRequiresApproval(e.target.checked)} />
                  <label htmlFor="requireApproval" className="cp-check-label">Submit for Manager Approval before publishing</label>
                </div>

                {/* campaign */}
                <div>
                  <div className="cp-label">Campaign <span className="cp-sublabel">(optional)</span></div>
                  <select className="cp-select" value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}>
                    <option value="">No Campaign</option>
                    {campaigns.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

              </div>

              {/* submit bar */}
              <div className="cp-submit-bar">
                <span className="cp-submit-hint">
                  {selectedAccounts.length === 0
                    ? 'Select at least one platform →'
                    : `${selectedAccounts.length} platform${selectedAccounts.length > 1 ? 's' : ''} selected`}
                </span>
                <button type="submit" className="cp-submit-btn"
                  disabled={loading || selectedAccounts.length === 0 || !caption.trim()}>
                  {loading ? <Loader2 size={14} className="cp-spin" /> : <Send size={14} />}
                  {submitLabel}
                </button>
              </div>
            </form>
          </div>

          {/* ── RIGHT: sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* platform picker */}
            <div className="cp-card">
              <div className="cp-card-head">
                <span className="cp-card-title">Select Platforms</span>
                {selectedAccounts.length > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#6d3cb4', background: 'rgba(109,60,180,0.1)', border: '1px solid rgba(109,60,180,0.2)', padding: '2px 8px', borderRadius: 999 }}>
                    {selectedAccounts.length} selected
                  </span>
                )}
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {accounts.length === 0 ? (
                  <div style={{ fontSize: 12, color: '#c4b49a', textAlign: 'center', padding: '16px 0' }}>
                    No platforms connected yet.
                  </div>
                ) : (
                  accounts.map(acc => {
                    const sel = selectedAccounts.includes(acc._id);
                    const color = PLATFORM_COLORS[acc.platform] || '#6d3cb4';
                    return (
                      <label key={acc._id} className={`cp-platform-item${sel ? ' sel' : ''}`}
                        onClick={() => handleAccountToggle(acc._id)}>
                        <div className="cp-platform-left">
                          <img
                            src={acc.profileData?.avatar || `https://ui-avatars.com/api/?name=${acc.platform}&background=ede6d9&color=6d3cb4`}
                            alt="" className="cp-platform-avatar"
                          />
                          <div>
                            <div className="cp-platform-name" style={{ color: sel ? '#6d3cb4' : '#2a1f0f' }}>{acc.platform}</div>
                            <div className="cp-platform-handle">@{acc.profileData?.username}</div>
                          </div>
                        </div>
                        <div className={`cp-platform-check${sel ? ' on' : ''}`}>
                          {sel && <CheckCircle2 size={11} color="#fff" />}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* live preview */}
            <div className="cp-card">
              <div className="cp-card-head">
                <span className="cp-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={13} style={{ color: '#7a6a55' }} /> Preview
                </span>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* platform dots */}
                {selectedAccounts.length > 0 && (
                  <div className="cp-preview-dots">
                    {selectedAccounts.map(id => {
                      const acc = accounts.find(a => a._id === id);
                      const color = PLATFORM_COLORS[acc?.platform] || '#6d3cb4';
                      return (
                        <span key={id} className="cp-preview-dot">
                          <span className="cp-preview-dot-color" style={{ background: color }} />
                          {acc?.platform}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* media preview */}
                <div className="cp-preview-media">
                  {mediaPreview && mediaType === 'image' && <img src={mediaPreview} alt="preview" />}
                  {mediaPreview && mediaType === 'video' && <video src={mediaPreview} controls />}
                  {!mediaPreview && <span>No media selected</span>}
                </div>

                {/* caption preview */}
                <div className={`cp-preview-caption${!caption ? ' cp-preview-placeholder' : ''}`}>
                  {caption || 'Your caption will appear here…'}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* toast */}
      {toast && <div className="cp-toast">{toast}</div>}
    </>
  );
};

export default Composer;