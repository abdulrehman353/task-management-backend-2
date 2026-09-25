import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ArrowLeft,
  Layers, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from 'lucide-react';
import axiosClient from '../api/axiosClient';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: username.trim(),
        Username: username.trim(),
        name: username.trim(),
        Name: username.trim(),
        email: email.trim(),
        Email: email.trim(),
        password: password,
        Password: password
      };

      let response;
      try {
        response = await axiosClient.post('/auth/register', payload);
      } catch (regErr: any) {
        if (regErr.response?.status === 404) {
          response = await axiosClient.post('/users/register', payload);
        } else {
          throw regErr;
        }
      }
      
      const data = response?.data;
      const token = data?.token || data?.access_token || data?.data?.token;
      const user = data?.user || data?.data?.user;

      if (token) {
        localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      const serverMsg = 
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message || 
        'Registration failed. Please check your credentials.';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        .signup-grid-container {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 64px;
          align-items: center;
          width: 100%;
          max-width: 1120px;
          position: relative;
          z-index: 10;
        }

        .signup-branding {
          display: flex;
          flex-direction: column;
          gap: 20px;
          color: #f8fafc;
        }

        .signup-auth-card {
          width: 100%;
          max-width: 440px;
          background-color: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.08);
          border-radius: 24px;
          padding: 32px 28px;
          box-sizing: border-box;
          position: relative;
        }

        @media (max-width: 1024px) {
          .signup-grid-container {
            grid-template-columns: 1fr;
            gap: 40px;
            max-width: 580px;
          }
          .signup-branding {
            text-align: center;
            align-items: center;
          }
          .signup-branding .brand-subtitle {
            text-align: center;
          }
          .signup-branding .feature-list {
            display: none;
          }
          .signup-auth-card {
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .signup-grid-container {
            grid-template-columns: 1fr;
            gap: 0px;
            max-width: 100%;
          }
          .signup-branding {
            display: none !important;
          }
          .signup-auth-card {
            width: 100% !important;
            max-width: 100% !important;
            padding: 24px 18px !important;
            border-radius: 20px !important;
          }
        }
      `}</style>

      <div style={styles.glowTopLeft}></div>
      <div style={styles.glowBottomRight}></div>

      <div className="signup-grid-container">
        {/* Left Side: Enterprise Feature Highlights */}
        <div className="signup-branding">
          <div style={styles.brandBadge}>
            <span style={styles.badgePulse}></span>
            Instant Enterprise Setup
          </div>

          <h1 style={styles.brandTitle}>
            Scale Operations with <br />
            <span style={styles.brandGradientText}>Complete Authority</span>
          </h1>

          <p style={styles.brandSubtitle} className="brand-subtitle">
            Join thousands of engineering and ops teams orchestrating workflows, RBAC privileges, and project milestones securely.
          </p>

          <div style={styles.featureList} className="feature-list">
            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <ShieldCheck size={18} color="#10b981" />
              </div>
              <div>
                <h4 style={styles.featureTitle}>Instant Organization Creation</h4>
                <p style={styles.featureDesc}>Establish your team workspace in seconds with automated RBAC.</p>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <Zap size={18} color="#10b981" />
              </div>
              <div>
                <h4 style={styles.featureTitle}>Full Ticket Lifecycle Control</h4>
                <p style={styles.featureDesc}>Track progress, assign teammates, and synchronize tasks instantly.</p>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <CheckCircle2 size={18} color="#10b981" />
              </div>
              <div>
                <h4 style={styles.featureTitle}>Secure Cloud Attachments</h4>
                <p style={styles.featureDesc}>MinIO storage engine with fast preview capabilities.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sign Up Card */}
        <div style={styles.cardContainer}>
          <div className="signup-auth-card">
            
            {/* Top-Left Back Arrow to Login */}
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={styles.backBtn}
              aria-label="Back to login"
            >
              <ArrowLeft size={18} color="#cbd5e1" />
            </button>

            <div style={styles.cardHeader}>
              <div style={styles.logoBadge}>
                <Layers size={26} color="#ffffff" />
              </div>
              <h2 style={styles.cardTitle}>Create Workspace Account</h2>
              <p style={styles.cardSubtitle}>Get started with your enterprise access</p>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name / Username</label>
                <div style={styles.inputWrapper}>
                  <User size={18} style={styles.inputIcon} />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Alex Morgan"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Corporate Email</label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@company.com"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Master Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat master password"
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeBtn}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creating Account...' : (
                  <>
                    <span>Create Enterprise Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div style={styles.cardFooter}>
              <span style={styles.footerText}>Already registered? </span>
              <Link to="/login" style={styles.signUpLink}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#090d16',
    backgroundImage: `
      radial-gradient(at 10% 20%, rgba(16, 185, 129, 0.12) 0px, transparent 50%),
      radial-gradient(at 90% 80%, rgba(5, 150, 105, 0.10) 0px, transparent 50%),
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
    `,
    backgroundSize: '100% 100%, 100% 100%, 48px 48px, 48px 48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflowX: 'hidden',
    padding: '24px 16px',
    boxSizing: 'border-box',
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif'
  },
  glowTopLeft: {
    position: 'absolute',
    top: '-15%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
    filter: 'blur(80px)',
    pointerEvents: 'none'
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: '-15%',
    right: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(52, 211, 153, 0.12) 0%, transparent 70%)',
    filter: 'blur(80px)',
    pointerEvents: 'none'
  },
  backBtn: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    zIndex: 20
  },
  brandBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    alignSelf: 'flex-start',
    padding: '6px 14px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#34d399',
    letterSpacing: '0.04em',
    textTransform: 'uppercase'
  },
  badgePulse: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 10px #10b981'
  },
  brandTitle: {
    fontSize: 'clamp(28px, 4vw, 44px)',
    lineHeight: '1.15',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: '#ffffff',
    margin: 0
  },
  brandGradientText: {
    background: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  brandSubtitle: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#94a3b8',
    margin: 0,
    maxWidth: '480px'
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    marginTop: '12px'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px'
  },
  featureIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  featureTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#f1f5f9',
    margin: '0 0 3px 0'
  },
  featureDesc: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '22px'
  },
  logoBadge: {
    width: '50px',
    height: '50px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px auto',
    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '-0.02em',
    margin: '0 0 6px 0'
  },
  cardSubtitle: {
    fontSize: '13.5px',
    color: '#94a3b8',
    margin: 0
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#f87171',
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '13px',
    marginBottom: '18px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#cbd5e1'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#64748b',
    pointerEvents: 'none'
  },
  input: {
    width: '100%',
    padding: '11px 14px 11px 42px',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px'
  },
  submitBtn: {
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14.5px',
    fontWeight: 600,
    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
    transition: 'all 0.2s ease'
  },
  cardFooter: {
    marginTop: '18px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#64748b',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '16px'
  },
  footerText: {
    color: '#94a3b8'
  },
  signUpLink: {
    color: '#34d399',
    textDecoration: 'none',
    fontWeight: 600
  }
};

export default Signup;