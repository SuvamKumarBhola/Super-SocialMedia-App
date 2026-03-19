import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Mail, Lock, Loader2, Eye, EyeOff, LayoutDashboard, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const [localError, setLocalError] = useState(null);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!validateForm()) return;
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // handled by store
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .lg-root * { font-family: 'Poppins', system-ui, sans-serif; box-sizing: border-box; }

        .lg-root {
          min-height: 100vh;
          background: #faf7f2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
        }

        /* Brand */
        .lg-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .lg-brand-icon {
          width: 48px;
          height: 48px;
          border-radius: 13px;
          background: linear-gradient(135deg, #6d3cb4, #5a58d6);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 18px rgba(109, 60, 180, 0.3);
        }
        .lg-brand-name {
          font-size: 26px;
          font-weight: 800;
          color: #2a1f0f;
          letter-spacing: -0.03em;
        }
        .lg-brand-sub {
          font-size: 13px;
          color: #7a6a55;
          margin-top: -6px;
        }

        /* Card */
        .lg-card {
          width: 100%;
          max-width: 420px;
          background: #f3ede3;
          border: 1px solid rgba(120, 90, 50, 0.14);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(42, 31, 15, 0.09);
        }
        .lg-card-body {
          padding: 28px 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* Error */
        .lg-error {
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

        /* Field */
        .lg-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .lg-label {
          font-size: 12px;
          font-weight: 600;
          color: #2a1f0f;
        }
        .lg-input-wrap {
          position: relative;
        }
        .lg-input-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: #c4b49a;
          pointer-events: none;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .lg-input-wrap:focus-within .lg-input-icon {
          color: #6d3cb4;
        }
        .lg-input {
          width: 100%;
          padding: 9px 36px 9px 36px;
          background: #faf7f2;
          border: 1px solid rgba(120, 90, 50, 0.16);
          border-radius: 10px;
          font-size: 13px;
          font-family: 'Poppins', system-ui, sans-serif;
          color: #2a1f0f;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .lg-input::placeholder { color: #c4b49a; }
        .lg-input:focus {
          border-color: rgba(109, 60, 180, 0.4);
          box-shadow: 0 0 0 3px rgba(109, 60, 180, 0.08);
        }
        .lg-input-right {
          position: absolute;
          right: 11px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #c4b49a;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.15s;
        }
        .lg-input-right:hover { color: #7a6a55; }

        /* Remember / forgot row */
        .lg-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .lg-remember {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: #7a6a55;
          cursor: pointer;
        }
        .lg-remember input[type="checkbox"] {
          width: 14px;
          height: 14px;
          accent-color: #6d3cb4;
          cursor: pointer;
        }
        .lg-forgot {
          font-size: 12px;
          font-weight: 600;
          color: #6d3cb4;
          text-decoration: none;
          transition: color 0.15s;
        }
        .lg-forgot:hover { color: #5a58d6; }

        /* Submit */
        .lg-btn {
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          box-shadow: 0 2px 14px rgba(109, 60, 180, 0.28);
          transition: box-shadow 0.2s, transform 0.2s, opacity 0.2s;
          margin-top: 4px;
        }
        .lg-btn:hover:not(:disabled) {
          box-shadow: 0 4px 22px rgba(109, 60, 180, 0.4);
          transform: translateY(-1px);
        }
        .lg-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        @keyframes lg-spin { to { transform: rotate(360deg); } }
        .lg-spin { animation: lg-spin 0.8s linear infinite; }

        /* Footer */
        .lg-card-footer {
          padding: 14px 28px;
          background: #ede6d9;
          border-top: 1px solid rgba(120, 90, 50, 0.12);
          text-align: center;
        }
        .lg-card-footer a {
          font-size: 12px;
          color: #7a6a55;
          text-decoration: none;
        }
        .lg-card-footer a span {
          color: #6d3cb4;
          font-weight: 600;
          text-decoration: underline;
        }
        .lg-card-footer a:hover span { color: #5a58d6; }
      `}</style>

      <div className="lg-root">
        {/* Brand */}
        <div className="lg-brand">
          <div className="lg-brand-icon">
            <LayoutDashboard size={22} color="#fff" />
          </div>
          <div className="lg-brand-name">Creator OS</div>
          <div className="lg-brand-sub">Sign in to manage your digital presence</div>
        </div>

        {/* Card */}
        <div className="lg-card">
          <form onSubmit={handleSubmit} className="lg-card-body">

            {(error || localError) && (
              <div className="lg-error">
                <AlertCircle size={14} />
                <span>{localError || error}</span>
              </div>
            )}

            {/* Email */}
            <div className="lg-field">
              <label className="lg-label">Email address</label>
              <div className="lg-input-wrap">
                <div className="lg-input-icon"><Mail size={15} /></div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="lg-input"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="lg-field">
              <label className="lg-label">Password</label>
              <div className="lg-input-wrap">
                <div className="lg-input-icon"><Lock size={15} /></div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="lg-input"
                  placeholder="••••••••"
                />
                <button type="button" className="lg-input-right" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="lg-row">
              <label className="lg-remember">
                <input id="remember-me" type="checkbox" />
                Remember me
              </label>
              <a href="#" className="lg-forgot">Forgot password?</a>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="lg-btn">
              {isLoading ? <Loader2 size={15} className="lg-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="lg-card-footer">
            <Link to="/register">
              New to Creator OS? <span>Create an account</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;