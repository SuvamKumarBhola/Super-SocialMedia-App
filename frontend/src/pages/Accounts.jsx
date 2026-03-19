import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { Loader2, Link as LinkIcon, Unlink } from 'lucide-react';
import SocialLoginModal from '../components/SocialLoginModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const platforms = [
  { id: 'instagram', name: 'Instagram', accent: 'linear-gradient(135deg, #f9a825, #e1306c, #833ab4)' },
  { id: 'facebook', name: 'Facebook', accent: 'linear-gradient(135deg, #1877f2, #0a56c4)' },
  { id: 'x', name: 'X (Twitter)', accent: 'linear-gradient(135deg, #2a1f0f, #4a3828)' },
  { id: 'linkedin', name: 'LinkedIn', accent: 'linear-gradient(135deg, #0a66c2, #084d92)' },
  { id: 'youtube', name: 'YouTube', accent: 'linear-gradient(135deg, #ff0000, #cc0000)' },
];

const Accounts = () => {
  const { token, activeOrgId } = useAuthStore();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState(null);
  const [disconnectingId, setDisconnectingId] = useState(null);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API_URL}/social/accounts/${activeOrgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrgId && token) fetchAccounts();
  }, [activeOrgId, token]);

  useEffect(() => {
    const code = searchParams.get('mock_code');
    const platform = searchParams.get('platform');
    const orgId = searchParams.get('orgId');
    if (code && platform && orgId) {
      (async () => {
        try {
          await axios.post(`${API_URL}/social/callback/${platform}`, { code, orgId }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSearchParams({});
          fetchAccounts();
        } catch (err) {
          console.error('Failed to connect', err);
        }
      })();
    }
  }, [searchParams, token]);

  const handleConnect = (platform) => {
    setActivePlatform(platform);
    setIsModalOpen(true);
  };

  const handleManualConnect = async (username, password) => {
    try {
      await axios.post(`${API_URL}/social/connect-manual`, {
        platform: activePlatform.id, username, password, orgId: activeOrgId,
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchAccounts();
    } catch (err) {
      throw err;
    }
  };

  const handleDisconnect = async (accountId) => {
    setDisconnectingId(accountId);
    try {
      await axios.delete(`${API_URL}/social/disconnect/${accountId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAccounts();
    } catch (err) {
      console.error('Disconnect failed:', err);
    } finally {
      setDisconnectingId(null);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
      <Loader2 size={28} style={{ color: '#6d3cb4', animation: 'ac-spin 0.8s linear infinite' }} />
      <style>{`@keyframes ac-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .ac-root * { font-family: 'Poppins', system-ui, sans-serif; box-sizing: border-box; }

        .ac-root {
          max-width: 900px;
          margin: 0 auto;
          padding: 32px 8px;
        }

        /* Page header */
        .ac-page-title {
          font-size: 20px;
          font-weight: 700;
          color: #2a1f0f;
          letter-spacing: -0.02em;
        }
        .ac-page-sub {
          font-size: 13px;
          color: #7a6a55;
          margin-top: 4px;
        }

        /* Grid */
        .ac-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 18px;
          margin-top: 28px;
        }

        /* Card */
        .ac-card {
          background: #f3ede3;
          border: 1px solid rgba(120, 90, 50, 0.14);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .ac-card:hover {
          box-shadow: 0 6px 28px rgba(42, 31, 15, 0.1);
          transform: translateY(-2px);
        }
        .ac-card-bar {
          height: 4px;
          flex-shrink: 0;
        }
        .ac-card-body {
          padding: 18px 18px 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* Card top row */
        .ac-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .ac-platform-name {
          font-size: 14px;
          font-weight: 700;
          color: #2a1f0f;
        }
        .ac-badge-connected {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 700;
          color: #4a8c3a;
          background: rgba(74, 140, 58, 0.1);
          border: 1px solid rgba(74, 140, 58, 0.2);
          padding: 3px 9px;
          border-radius: 999px;
        }
        .ac-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4a8c3a;
          animation: ac-pulse 1.8s ease-in-out infinite;
        }
        @keyframes ac-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* Profile info */
        .ac-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-height: 56px;
        }
        .ac-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(120, 90, 50, 0.14);
          flex-shrink: 0;
        }
        .ac-profile-name {
          font-size: 13px;
          font-weight: 600;
          color: #2a1f0f;
        }
        .ac-profile-date {
          font-size: 11px;
          color: #7a6a55;
          margin-top: 2px;
        }
        .ac-not-connected {
          font-size: 13px;
          color: #c4b49a;
          flex: 1;
          min-height: 56px;
          display: flex;
          align-items: center;
        }

        /* Buttons */
        .ac-btn-disconnect {
          margin-top: 16px;
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 8px 14px;
          background: transparent;
          border: 1px solid rgba(200, 80, 60, 0.25);
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Poppins', system-ui, sans-serif;
          color: #c85040;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .ac-btn-disconnect:hover:not(:disabled) {
          background: rgba(200, 80, 60, 0.07);
          border-color: rgba(200, 80, 60, 0.4);
        }
        .ac-btn-disconnect:disabled { opacity: 0.6; cursor: not-allowed; }

        .ac-btn-connect {
          margin-top: 16px;
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 8px 14px;
          border: none;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Poppins', system-ui, sans-serif;
          color: #fff;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
        }
        .ac-btn-connect:hover { opacity: 0.88; transform: translateY(-1px); }

        @keyframes ac-spin { to { transform: rotate(360deg); } }
        .ac-spin { animation: ac-spin 0.8s linear infinite; }
      `}</style>

      <div className="ac-root">
        {/* Header */}
        <div>
          <div className="ac-page-title">Connected Accounts</div>
          <div className="ac-page-sub">Connect your social media platforms to enable posting and analytics gathering.</div>
        </div>

        {/* Grid */}
        <div className="ac-grid">
          {platforms.map(platform => {
            const connected = accounts.find(a => a.platform === platform.id);

            return (
              <div key={platform.id} className="ac-card">
                <div className="ac-card-bar" style={{ background: platform.accent }} />
                <div className="ac-card-body">

                  {/* Top row */}
                  <div className="ac-card-top">
                    <span className="ac-platform-name">{platform.name}</span>
                    {connected && (
                      <span className="ac-badge-connected">
                        <span className="ac-badge-dot" />
                        Connected
                      </span>
                    )}
                  </div>

                  {/* Profile or placeholder */}
                  {connected ? (
                    <div className="ac-profile">
                      <img
                        src={connected.profileData?.avatar || `https://ui-avatars.com/api/?name=${platform.name}&background=ede6d9&color=6d3cb4`}
                        alt="Avatar"
                        className="ac-avatar"
                      />
                      <div>
                        <div className="ac-profile-name">@{connected.profileData?.username}</div>
                        <div className="ac-profile-date">
                          Connected {new Date(connected.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="ac-not-connected">Not connected</div>
                  )}

                  {/* Action button */}
                  {connected ? (
                    <button
                      onClick={() => handleDisconnect(connected._id)}
                      disabled={disconnectingId === connected._id}
                      className="ac-btn-disconnect"
                    >
                      {disconnectingId === connected._id
                        ? <Loader2 size={14} className="ac-spin" />
                        : <Unlink size={14} />
                      }
                      {disconnectingId === connected._id ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(platform)}
                      className="ac-btn-connect"
                      style={{ background: platform.accent }}
                    >
                      <LinkIcon size={14} />
                      Connect {platform.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SocialLoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        platform={activePlatform}
        onConnect={handleManualConnect}
      />
    </>
  );
};

export default Accounts;