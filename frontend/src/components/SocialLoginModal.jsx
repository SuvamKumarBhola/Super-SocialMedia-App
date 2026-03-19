import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

const SocialLoginModal = ({ isOpen, onClose, platform, onConnect }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await onConnect(username, password);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to connect account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
                .slm-root * { font-family: 'Poppins', system-ui, sans-serif; box-sizing: border-box; }

                .slm-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 50;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    background: rgba(42, 31, 15, 0.45);
                    backdrop-filter: blur(6px);
                    animation: slmFadeIn 0.2s ease both;
                }
                @keyframes slmFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                .slm-card {
                    background: #faf7f2;
                    border: 1px solid rgba(120, 90, 50, 0.14);
                    border-radius: 20px;
                    width: 100%;
                    max-width: 420px;
                    overflow: hidden;
                    box-shadow: 0 32px 80px rgba(42, 31, 15, 0.18);
                    animation: slmZoomIn 0.22s cubic-bezier(.22,1,.36,1) both;
                }
                @keyframes slmZoomIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                /* Header */
                .slm-header {
                    position: relative;
                    padding: 22px 22px 18px;
                    border-bottom: 1px solid rgba(120, 90, 50, 0.12);
                    background: #f3ede3;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .slm-close {
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: 1px solid rgba(120, 90, 50, 0.14);
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #7a6a55;
                    transition: background 0.15s, color 0.15s, border-color 0.15s;
                }
                .slm-close:hover {
                    background: rgba(200, 80, 60, 0.08);
                    color: #c85040;
                    border-color: rgba(200, 80, 60, 0.25);
                }
                .slm-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #6d3cb4, #5a58d6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 14px rgba(109, 60, 180, 0.28);
                    flex-shrink: 0;
                }
                .slm-header-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #2a1f0f;
                    letter-spacing: -0.01em;
                }
                .slm-header-sub {
                    font-size: 12px;
                    color: #7a6a55;
                    margin-top: 2px;
                }

                /* Body */
                .slm-body {
                    padding: 24px 22px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }
                .slm-error {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: rgba(200, 80, 60, 0.07);
                    border: 1px solid rgba(200, 80, 60, 0.2);
                    border-radius: 10px;
                    font-size: 13px;
                    color: #c85040;
                }
                .slm-field {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                }
                .slm-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #2a1f0f;
                }
                .slm-input-wrap {
                    position: relative;
                }
                .slm-input-icon {
                    position: absolute;
                    left: 11px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #c4b49a;
                    pointer-events: none;
                    transition: color 0.15s;
                    display: flex;
                    align-items: center;
                }
                .slm-input-wrap:focus-within .slm-input-icon {
                    color: #6d3cb4;
                }
                .slm-input {
                    width: 100%;
                    padding: 9px 12px 9px 36px;
                    background: #f3ede3;
                    border: 1px solid rgba(120, 90, 50, 0.16);
                    border-radius: 10px;
                    font-size: 13px;
                    font-family: 'Poppins', system-ui, sans-serif;
                    color: #2a1f0f;
                    outline: none;
                    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
                }
                .slm-input::placeholder { color: #c4b49a; }
                .slm-input:focus {
                    background: #faf7f2;
                    border-color: rgba(109, 60, 180, 0.4);
                    box-shadow: 0 0 0 3px rgba(109, 60, 180, 0.08);
                }

                /* Buttons */
                .slm-btn-primary {
                    width: 100%;
                    padding: 10px 16px;
                    background: linear-gradient(135deg, #6d3cb4, #5a58d6);
                    color: #fff;
                    font-size: 13px;
                    font-weight: 600;
                    font-family: 'Poppins', system-ui, sans-serif;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    box-shadow: 0 2px 14px rgba(109, 60, 180, 0.28);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    transition: box-shadow 0.2s, transform 0.2s, opacity 0.2s;
                }
                .slm-btn-primary:hover:not(:disabled) {
                    box-shadow: 0 4px 22px rgba(109, 60, 180, 0.4);
                    transform: translateY(-1px);
                }
                .slm-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

                .slm-divider {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .slm-divider-line {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                }
                .slm-divider-line div {
                    width: 100%;
                    height: 1px;
                    background: rgba(120, 90, 50, 0.12);
                }
                .slm-divider span {
                    position: relative;
                    background: #faf7f2;
                    padding: 0 10px;
                    font-size: 10px;
                    font-weight: 700;
                    color: #c4b49a;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }

                .slm-btn-secondary {
                    width: 100%;
                    padding: 10px 16px;
                    background: transparent;
                    color: #7a6a55;
                    font-size: 13px;
                    font-weight: 600;
                    font-family: 'Poppins', system-ui, sans-serif;
                    border: 1px solid rgba(120, 90, 50, 0.18);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s, border-color 0.15s;
                }
                .slm-btn-secondary:hover:not(:disabled) {
                    background: rgba(109, 60, 180, 0.06);
                    color: #2a1f0f;
                    border-color: rgba(109, 60, 180, 0.22);
                }
                .slm-btn-secondary:disabled { opacity: 0.65; cursor: not-allowed; }

                /* Footer */
                .slm-footer {
                    padding: 12px 22px;
                    background: #f3ede3;
                    border-top: 1px solid rgba(120, 90, 50, 0.12);
                    text-align: center;
                }
                .slm-footer p {
                    font-size: 11px;
                    color: #c4b49a;
                }

                @keyframes spin { to { transform: rotate(360deg); } }
                .slm-spin { animation: spin 0.8s linear infinite; }
            `}</style>

            <div className="slm-root">
                <div className="slm-backdrop">
                    <div className="slm-card">

                        {/* Header */}
                        <div className="slm-header">
                            <button onClick={onClose} className="slm-close">
                                <X size={15} />
                            </button>
                            <div className="slm-icon">
                                <ShieldCheck size={20} color="#fff" />
                            </div>
                            <div>
                                <div className="slm-header-title">Connect {platform?.name}</div>
                                <div className="slm-header-sub">Sign in to sync your platform data.</div>
                            </div>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="slm-body">
                            {error && (
                                <div className="slm-error">
                                    <AlertCircle size={15} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="slm-field">
                                <label className="slm-label">Email or Username</label>
                                <div className="slm-input-wrap">
                                    <div className="slm-input-icon"><Mail size={15} /></div>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="slm-input"
                                        placeholder={`Your ${platform?.name} identifier`}
                                    />
                                </div>
                            </div>

                            <div className="slm-field">
                                <label className="slm-label">Password</label>
                                <div className="slm-input-wrap">
                                    <div className="slm-input-icon"><Lock size={15} /></div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="slm-input"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
                                <button type="submit" disabled={loading} className="slm-btn-primary">
                                    {loading && <Loader2 size={15} className="slm-spin" />}
                                    {loading ? 'Authenticating...' : `Log In to ${platform?.name}`}
                                </button>

                                <div className="slm-divider">
                                    <div className="slm-divider-line"><div /></div>
                                    <span>Or</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="slm-btn-secondary"
                                >
                                    Register New Account
                                </button>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="slm-footer">
                            <p>Secure connection via Creator OS Gateway</p>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default SocialLoginModal;