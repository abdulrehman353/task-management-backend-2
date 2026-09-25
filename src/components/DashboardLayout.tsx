import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FolderGit2,
  Kanban,
  Paperclip,
  Users,
  ShieldAlert,
  Key,
  LogOut,
  Layers,
  Menu,
  X
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const rawUser = localStorage.getItem('user');
  let parsedUser: any = {};
  try {
    parsedUser = rawUser ? JSON.parse(rawUser) : {};
  } catch {
    parsedUser = {};
  }

  const username = parsedUser.Username || parsedUser.username || parsedUser.Name || parsedUser.name || 'Ahmad';
  const email = parsedUser.Email || parsedUser.email || 'ahmad@gmail.com';
  const role = parsedUser.Role || parsedUser.role || 'ADMIN';

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Organizations', path: '/dashboard/organizations', icon: Building2 },
    { label: 'Projects', path: '/dashboard/projects', icon: FolderGit2 },
    { label: 'Board', path: '/dashboard/tickets', icon: Kanban },
    { label: 'Attachments', path: '/dashboard/attachments', icon: Paperclip },
  ];

  const adminItems = [
    { label: 'Users', path: '/dashboard/users', icon: Users },
    { label: 'Roles', path: '/dashboard/roles', icon: ShieldAlert },
    { label: 'Permissions', path: '/dashboard/permissions', icon: Key },
  ];

  return (
    <div className="layout-main-container" style={styles.layoutWrapper}>
      <style>{`
        /* ================= DESKTOP VIEW (> 900px) ================= */
        @media (min-width: 901px) {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100vh !important;
            overflow: hidden !important;
          }
          .layout-main-container {
            display: flex !important;
            flex-direction: row !important;
            height: 100vh !important;
            width: 100vw !important;
            overflow: hidden !important;
          }
          .mobile-top-bar {
            display: none !important;
          }
          .mobile-overlay {
            display: none !important;
          }
          .drawer-close-btn {
            display: none !important;
          }
          .desktop-sidebar {
            position: sticky !important;
            top: 0 !important;
            height: 100vh !important;
            width: 290px !important;
            min-width: 290px !important;
            flex-shrink: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            padding: 30px 22px !important;
            box-sizing: border-box !important;
            overflow-y: auto !important;
            z-index: 50 !important;
          }
          .main-content-area {
            flex: 1 1 0% !important;
            height: 100vh !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            padding: 32px 36px 40px 32px !important;
            box-sizing: border-box !important;
            scroll-behavior: smooth;
          }
          .main-content-area h1, 
          .main-content-area h2 {
            font-size: 34px !important;
            font-weight: 800 !important;
            letter-spacing: -0.025em !important;
            margin-top: 4px !important;
            margin-bottom: 8px !important;
          }
          .main-content-area p {
            font-size: 15px !important;
          }
        }

        /* ================= MOBILE & TABLETS (<= 900px) ================= */
        @media (max-width: 900px) {
          .layout-main-container {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            min-height: 100vh !important;
          }
          .mobile-top-bar {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            padding: 14px 18px !important;
            gap: 10px !important;
          }
          .drawer-close-btn {
            display: flex !important;
          }
          .desktop-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            width: 290px !important;
            max-width: 85vw !important;
            min-width: 0 !important;
            height: 100vh !important;
            z-index: 1000 !important;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.85);
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            padding: 26px 20px !important;
            box-sizing: border-box !important;
          }
          .desktop-sidebar.open {
            transform: translateX(0) !important;
          }
          .main-content-area {
            width: 100% !important;
            max-width: 100% !important;
            flex: 1 1 auto !important;
            padding: 20px 16px !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      <div style={styles.glowTop}></div>
      <div style={styles.glowBottom}></div>

      {/* Mobile Top Header */}
      <header className="mobile-top-bar" style={styles.mobileTopBar}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            style={styles.hamburgerBtn}
            aria-label="Open Navigation Menu"
          >
            <Menu size={24} color="#ffffff" />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
          <div style={styles.mobileLogoBadge}>
            <Layers size={20} color="#ffffff" />
          </div>
          <div>
            <span style={styles.mobileBrandTitle}>TaskFlow</span>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#34d399', letterSpacing: '0.06em' }}>
              WORKSPACE LIVE
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setMobileMenuOpen(false)}
          style={styles.backdropOverlay}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`desktop-sidebar ${mobileMenuOpen ? 'open' : ''}`}
        style={styles.sidebar}
      >
        <div>
          <div style={styles.brandBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={styles.logoBadge}>
                <Layers size={24} color="#ffffff" />
              </div>
              <div>
                <h2 style={styles.brandTitle}>TaskFlow</h2>
                <span style={styles.workspaceTag}>WORKSPACE LIVE</span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="drawer-close-btn"
              style={styles.drawerCloseBtn}
              aria-label="Close Menu"
            >
              <X size={22} color="#ffffff" />
            </button>
          </div>

          <div style={styles.navGroup}>
            <span style={styles.sectionHeader}>WORKSPACE</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {})
                  })}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div style={{ ...styles.navGroup, marginTop: '26px' }}>
            <span style={styles.sectionHeader}>SYSTEM ADMIN</span>
            {adminItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {})
                  })}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        <div style={styles.userSection}>
          <div style={styles.userCard}>
            <div style={styles.avatar}>
              {(username || 'A')[0].toUpperCase()}
            </div>
            <div style={styles.userInfo}>
              <div style={styles.userNameRow}>
                <span style={styles.userName}>{username}</span>
                <span style={styles.roleBadge}>{role}</span>
              </div>
              <span style={styles.userEmail} title={email}>{email}</span>
            </div>
          </div>

          <button onClick={handleSignOut} style={styles.signOutBtn}>
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="main-content-area" style={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  layoutWrapper: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#070b12',
    backgroundImage: `
      radial-gradient(at 10% 20%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
      radial-gradient(at 90% 80%, rgba(5, 150, 105, 0.06) 0px, transparent 50%),
      linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
    `,
    backgroundSize: '100% 100%, 100% 100%, 48px 48px, 48px 48px',
    color: '#f8fafc',
    position: 'relative',
    overflowX: 'hidden',
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, sans-serif'
  },
  glowTop: {
    position: 'absolute',
    top: '-10%',
    left: '10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
    filter: 'blur(90px)',
    pointerEvents: 'none'
  },
  glowBottom: {
    position: 'absolute',
    bottom: '-10%',
    right: '5%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(52, 211, 153, 0.08) 0%, transparent 70%)',
    filter: 'blur(90px)',
    pointerEvents: 'none'
  },
  mobileTopBar: {
    display: 'none',
    backgroundColor: 'rgba(12, 17, 29, 0.98)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 90,
    boxSizing: 'border-box'
  },
  mobileLogoBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
  },
  mobileBrandTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.02em',
    lineHeight: 1.1
  },
  hamburgerBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    padding: '8px 10px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff'
  },
  backdropOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    zIndex: 999
  },
  sidebar: {
    backgroundColor: 'rgba(12, 17, 29, 0.98)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)'
  },
  brandBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
    paddingLeft: '4px'
  },
  drawerCloseBtn: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    padding: '6px',
    cursor: 'pointer'
  },
  logoBadge: {
    width: '46px',
    height: '46px',
    borderRadius: '13px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  brandTitle: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.02em',
    margin: 0
  },
  workspaceTag: {
    fontSize: '10.5px',
    fontWeight: 700,
    color: '#34d399',
    letterSpacing: '0.07em'
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  sectionHeader: {
    fontSize: '11.5px',
    fontWeight: 800,
    color: '#64748b',
    letterSpacing: '0.08em',
    paddingLeft: '14px',
    marginBottom: '8px'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    padding: '11px 16px',
    borderRadius: '12px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    border: '1px solid transparent'
  },
  navLinkActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    color: '#34d399',
    fontWeight: 700,
    border: '1px solid rgba(16, 185, 129, 0.32)',
    boxShadow: '0 4px 18px rgba(16, 185, 129, 0.12)'
  },
  userSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingTop: '18px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    marginTop: '22px'
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.07)'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    color: '#ffffff',
    fontSize: '15px',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  userNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  userName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#ffffff',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  roleBadge: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: '6px',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },
  userEmail: {
    fontSize: '12px',
    color: '#94a3b8',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    marginTop: '2px'
  },
  signOutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '11px',
    borderRadius: '12px',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    color: '#f87171',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease'
  },
  mainContent: {
    position: 'relative',
    zIndex: 10,
    minWidth: 0,
    boxSizing: 'border-box'
  }
};

export default DashboardLayout;