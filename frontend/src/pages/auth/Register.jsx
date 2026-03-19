import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { User, Mail, Lock, Loader2, Eye, EyeOff, LayoutDashboard, AlertCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error } = useAuthStore();
  const [localError, setLocalError] = useState(null);
  const navigate = useNavigate();

  const validateForm = () => {
    if (name.length < 2) {
      setLocalError('Full name must be at least 2 characters');
      return false;
    }
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
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      // handled by store
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .rg-root * { font-family: 'Poppins', system-ui, sans-serif; box-sizing: border-box; }

        .rg-root {
          min-height: 100vh;
          background: #faf7f2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
        }

        /* Brand */
        .rg-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .rg-brand-icon {
          width: 48px;
          height: 48px;
          border-radius: 13px;
          background: linear-gradient(135deg, #6d3cb4, #5a58d6);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 18px rgba(109, 60, 180, 0.3);
        }
        .rg-brand-name {
          font-size: 26px;
          font-weight: 800;
          color: #2a1f0f;
          letter-spacing: -0.03em;
        }
        .rg-brand-sub {
          font-size: 13px;
          color: #7a6a55;
          margin-top: -6px;
        }

        /* Card */
        .rg-card {
          width: 100%;
          max-width: 420px;
          background: #f3ede3;
          border: 1px solid rgba(120, 90, 50, 0.14);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(42, 31, 15, 0.09);
        }
        .rg-card-body {
          padding: 28px 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* Error */
        .rg-error {
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
        .rg-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .rg-label {
          font-size: 12px;
          font-weight: 600;
          color: #2a1f0f;
        }
        .rg-input-wrap {
          position: relative;
        }
        .rg-input-icon {
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
        .rg-input-wrap:focus-within .rg-input-icon {
          color: #6d3cb4;
        }
        .rg-input {
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
        .rg-input::placeholder { color: #c4b49a; }
        .rg-input:focus {
          border-color: rgba(109, 60, 180, 0.4);
          box-shadow: 0 0 0 3px rgba(109, 60, 180, 0.08);
        }
        .rg-input-no-right {
          padding-right: 12px;
        }
        .rg-input-right {
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
        .rg-input-right:hover { color: #7a6a55; }

        /* Submit */
        .rg-btn {
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
        .rg-btn:hover:not(:disabled) {
          box-shadow: 0 4px 22px rgba(109, 60, 180, 0.4);
          transform: translateY(-1px);
        }
        .rg-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        @keyframes rg-spin { to { transform: rotate(360deg); } }
        .rg-spin { animation: rg-spin 0.8s linear infinite; }

        /* Footer */
        .rg-card-footer {
          padding: 14px 28px;
          background: #ede6d9;
          border-top: 1px solid rgba(120, 90, 50, 0.12);
          text-align: center;
        }
        .rg-card-footer a {
          font-size: 12px;
          color: #7a6a55;
          text-decoration: none;
        }
        .rg-card-footer a span {
          color: #6d3cb4;
          font-weight: 600;
          text-decoration: underline;
        }
        .rg-card-footer a:hover span { color: #5a58d6; }
      `}</style>

      <div className="rg-root">
        {/* Brand */}
        <div className="rg-brand">
          <div className="rg-brand-icon">
            <LayoutDashboard size={22} color="#fff" />
          </div>
          <div className="rg-brand-name">Join Creator OS</div>
          <div className="rg-brand-sub">Start your journey to digital excellence</div>
        </div>

        {/* Card */}
        <div className="rg-card">
          <form onSubmit={handleSubmit} className="rg-card-body">

            {(error || localError) && (
              <div className="rg-error">
                <AlertCircle size={14} />
                <span>{localError || error}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="rg-field">
              <label className="rg-label">Full Name</label>
              <div className="rg-input-wrap">
                <div className="rg-input-icon"><User size={15} /></div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rg-input rg-input-no-right"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div className="rg-field">
              <label className="rg-label">Email address</label>
              <div className="rg-input-wrap">
                <div className="rg-input-icon"><Mail size={15} /></div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rg-input rg-input-no-right"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="rg-field">
              <label className="rg-label">Password</label>
              <div className="rg-input-wrap">
                <div className="rg-input-icon"><Lock size={15} /></div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rg-input"
                  placeholder="••••••••"
                />
                <button type="button" className="rg-input-right" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="rg-btn">
              {isLoading ? <Loader2 size={15} className="rg-spin" /> : 'Create Account'}
            </button>
          </form>

          <div className="rg-card-footer">
            <Link to="/login">
              Already have an account? <span>Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;