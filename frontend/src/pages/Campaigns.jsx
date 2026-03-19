import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { 
  Loader2, Plus, Megaphone, Target, Activity, Sparkles, 
  ChevronRight, Calendar, ArrowUpRight, BarChart3, HelpCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Campaigns = () => {
  const { token, activeOrgId } = useAuthStore();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDesc, setNewCampaignDesc] = useState('');

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(res.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && activeOrgId) {
      fetchCampaigns();
    }
  }, [token, activeOrgId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCampaignName) return;
    try {
      await axios.post(`${API_URL}/campaigns`, {
        name: newCampaignName,
        description: newCampaignDesc
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setNewCampaignName('');
      setNewCampaignDesc('');
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600 w-12 h-12 mb-4" />
        <p className="text-gray-500 font-medium italic">Synchronizing campaigns...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .cm-root * { font-family: 'Poppins', system-ui, sans-serif; box-sizing: border-box; }
        .cm-root { max-width: 1200px; margin: 0 auto; padding: 20px 0; }
        
        .cm-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
        .cm-title { font-size: 32px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; }
        .cm-sub { color: #666; font-size: 15px; margin-top: 4px; }
        
        .cm-add-btn {
          display: flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white; padding: 12px 24px; border-radius: 14px;
          font-weight: 700; font-size: 14px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
        }
        .cm-add-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(79, 70, 229, 0.5); }
        
        .cm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; }
        
        .cm-card {
          background: rgba(255, 255, 255, 0.8); backdrop-blur: 12px;
          border: 1px solid rgba(229, 231, 235, 0.5); border-radius: 24px;
          padding: 32px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative; overflow: hidden;
        }
        .cm-card:hover { transform: translateY(-6px); border-color: #6366f1; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05); }
        .cm-card::before {
          content: ''; position: absolute; top: -50px; right: -50px; width: 100px; height: 100px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%); border-radius: 50%;
        }

        .cm-card-title { font-size: 20px; font-weight: 800; color: #1a1a1a; margin-bottom: 8px; }
        .cm-card-desc { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 24px; min-height: 44px; }
        
        .cm-stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .cm-stat-box { 
          background: #f9fafb; padding: 16px 12px; border-radius: 20px; text-align: center;
          border: 1px solid transparent; transition: all 0.3s;
        }
        .cm-stat-box:hover { background: white; border-color: #e5e7eb; }
        .cm-stat-val { font-size: 18px; font-weight: 800; color: #1a1a1a; display: block; }
        .cm-stat-lab { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

        .cm-ai-panel {
          background: linear-gradient(135deg, #f5f3ff, #ede9fe);
          border: 1px dashed rgba(124, 58, 237, 0.3); border-radius: 20px;
          padding: 16px; margin-top: 20px;
        }
        .cm-ai-label { 
          display: flex; align-items: center; gap: 6px; 
          font-size: 11px; font-weight: 800; color: #7c3aed; 
          text-transform: uppercase; margin-bottom: 10px;
        }
        .cm-ai-tip { font-size: 12.5px; color: #4c1d95; font-weight: 500; line-height: 1.5; }

        .cm-modal-overlay { 
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); 
          backdrop-blur: 4px; display: flex; items-center; justify-center; z-index: 100;
          animation: fadeIn 0.3s ease;
        }
        .cm-modal {
          background: white; width: 100%; max-width: 500px; border-radius: 32px;
          padding: 40px; box-shadow: 0 30px 60px -12px rgba(0,0,0,0.25);
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } }

        .cm-input {
          width: 100%; padding: 16px; border: 2px solid #f3f4f6; border-radius: 16px;
          font-size: 15px; transition: all 0.3s; outline: none;
        }
        .cm-input:focus { border-color: #6366f1; background: #fdfdff; }
      `}</style>

      <div className="cm-root animate-in fade-in duration-700">
        <div className="cm-header">
          <div>
            <h1 className="cm-title">Campaign Matrix</h1>
            <p className="cm-sub">Strategic grouping and performance orchestration.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="cm-add-btn">
            <Plus size={18} /> New Campaign
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-[32px] p-24 text-center">
            <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900">No Active Campaigns</h3>
            <p className="text-gray-500 mt-2">Start grouping your content to unlock strategic insights.</p>
          </div>
        ) : (
          <div className="cm-grid">
            {campaigns.map(camp => (
              <CampaignCard key={camp._id} campaign={camp} token={token} />
            ))}
          </div>
        )}

        {showModal && (
          <div className="cm-modal-overlay">
            <div className="cm-modal">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Initialize Campaign</h2>
              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Identity</label>
                  <input 
                    type="text" 
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    className="cm-input"
                    placeholder="e.g. Hypergrowth Q2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Intent</label>
                  <textarea 
                    value={newCampaignDesc}
                    onChange={(e) => setNewCampaignDesc(e.target.value)}
                    className="cm-input"
                    placeholder="Define the primary objectives..."
                    rows="3"
                  ></textarea>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600">Dismiss</button>
                  <button type="submit" className="cm-add-btn flex-1 justify-center">Launch</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const CampaignCard = ({ campaign, token }) => {
  const [analytics, setAnalytics] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [idea, setIdea] = useState(null);
  const [showIdea, setShowIdea] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/campaigns/${campaign._id}/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(res.data.analytics);
        
        // Fetch AI advice for this campaign
        const adviceRes = await axios.post(`${API_URL}/ai/advice`, {
          data: res.data.analytics,
          type: 'campaign'
        }, { headers: { Authorization: `Bearer ${token}` } });
        setAdvice(adviceRes.data.advice);
        
      } catch (err) {
        console.error('Failed to fetch data for campaign', campaign._id);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [campaign._id, token]);

  const fetchSuggestion = async () => {
    setSuggesting(true);
    try {
      const res = await axios.post(`${API_URL}/ai/suggest-post`, {
        campaignData: { name: campaign.name, analytics }
      }, { headers: { Authorization: `Bearer ${token}` } });
      setIdea(res.data.suggestion);
      setShowIdea(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <div className="cm-card group">
      <div className="flex items-start justify-between mb-2">
        <div className="p-3 bg-indigo-50 rounded-2xl">
          <Target className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">
          {new Date(campaign.createdAt).toLocaleDateString()}
        </div>
      </div>
      
      <h3 className="cm-card-title">{campaign.name}</h3>
      <p className="cm-card-desc italic">{campaign.description || 'No strategic intent defined.'}</p>
      
      {loading ? (
        <div className="flex flex-col items-center py-8 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-200" />
          <span className="text-xs font-bold text-gray-300 uppercase">Analyzing Node...</span>
        </div>
      ) : (
        <>
          <div className="cm-stat-row">
            <div className="cm-stat-box">
              <span className="cm-stat-val text-indigo-600">{analytics.postsCount}</span>
              <span className="cm-stat-lab">Posts</span>
            </div>
            <div className="cm-stat-box">
              <span className="cm-stat-val text-rose-500">{analytics.totalEngagement.toLocaleString()}</span>
              <span className="cm-stat-lab">Engage</span>
            </div>
            <div className="cm-stat-box">
              <span className="cm-stat-val text-blue-500">{analytics.totalImpressions.toLocaleString()}</span>
              <span className="cm-stat-lab">Reach</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {advice && advice.length > 0 && (
              <div className="cm-ai-panel">
                <div className="cm-ai-label">
                  <Sparkles size={12} /> AI Strategy Tip
                </div>
                <p className="cm-ai-tip text-indigo-900 font-bold">"{advice[0]}"</p>
              </div>
            )}

            {showIdea && idea && (
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl animate-in zoom-in duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-indigo-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">AI Suggested Move</span>
                </div>
                <h4 className="font-bold text-sm mb-2">{idea.title}</h4>
                <p className="text-[11px] leading-relaxed mb-4 opacity-90">"{idea.caption}"</p>
                <div className="flex items-center justify-between mt-auto">
                   <span className="text-[9px] font-black bg-white/20 px-2 py-1 rounded uppercase">{idea.mediaType}</span>
                   <button onClick={() => setShowIdea(false)} className="text-[10px] font-black uppercase opacity-60 hover:opacity-100 italic transition-opacity">Dismiss</button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mt-6">
            <button onClick={fetchSuggestion} disabled={suggesting} className="flex-1 py-4 flex items-center justify-center gap-2 font-bold text-xs text-indigo-600 uppercase tracking-widest border border-indigo-100 rounded-2xl hover:bg-indigo-50 transition-all">
              {suggesting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Smart Idea
            </button>
            <button className="flex-1 py-4 flex items-center justify-center gap-2 font-bold text-xs text-indigo-600 uppercase tracking-widest border border-indigo-100 rounded-2xl hover:bg-indigo-50 transition-all">
              Details <ChevronRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Campaigns;
