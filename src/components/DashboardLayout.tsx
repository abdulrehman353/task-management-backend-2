import React, { useState } from 'react';
import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  FolderKanban, 
  CheckSquare, 
  Paperclip,
  Users, 
  ShieldCheck, 
  Key,
  LogOut,
  Menu,
  X,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // User ka role check karein
  const currentRole = 
    user?.RoleName || 
    user?.roleName || 
    user?.Role || 
    user?.role || 
    user?.Role?.RoleName ||
    localStorage.getItem('userRole') || 
    null;

  const normalizedRole = typeof currentRole === 'string' ? currentRole.trim().toLowerCase() : '';
  
  // Super Admin / Owner check
  const isAdminOrOwner = 
    normalizedRole === 'admin' || 
    normalizedRole === 'owner' || 
    user?.id === 1 || 
    user?.UserID === 1;

  // Check karein kya user pending hai (Admin / Owner kabhi pending nahi ho sakta)
  const isPendingUser = !isAdminOrOwner && (!currentRole || normalizedRole === 'pending');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const closeSidebar = () => setMobileMenuOpen(false);

  return (
    <div style={styles.container}>
      <style>{`
        .layout-sidebar {
          width: 250px;
          background-color: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          padding: 20px 16px;
          flex-shrink: 0;
          transition: transform 0.25s ease-in-out;
          z-index: 50;
        }

        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: #334151;
        }

        .sidebar-backdrop {
          display: none;
        }

        @media (max-width: 768px) {
          .layout-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            transform: translateX(-100%);
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
          }

          .layout-sidebar.sidebar-open {
            transform: translateX(0);
          }

          .hamburger-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .sidebar-backdrop.active {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.45);
            z-index: 40;
          }

          .mobile-close-btn {
            display: block !important;
          }

          .header-title-text {
            font-size: 14px !important;
          }
        }
      `}</style>

      {/* Backdrop for Mobile */}
      <div 
        className={`sidebar-backdrop ${mobileMenuOpen ? 'active' : ''}`} 
        onClick={closeSidebar} 
      />

      {/* Sidebar */}
      <aside className={`layout-sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div style={styles.brand}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckSquare size={24} color="#2563eb" />
            <h2 style={styles.brandText}>Task Manager</h2>
          </div>
          <button 
            onClick={closeSidebar}
            style={styles.mobileClose}
            className="mobile-close-btn"
          >
            <X size={20} color="#64748b" />
          </button>
        </div>

        <nav style={styles.nav}>
          {/* Admin / Owner Links */}
          {isAdminOrOwner && (
            <NavLink 
              to="/dashboard/organizations" 
              onClick={closeSidebar}
              style={({ isActive }) => (isActive ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem)}
            >
              <Building2 size={18} />
              <span>Organizations</span>
            </NavLink>
          )}

          {/* Regular Work items: SIRF TAB DIKHEIN JAB USER PENDING NA HO */}
          {!isPendingUser && (
            <>
              <NavLink 
                to="/dashboard/projects" 
                onClick={closeSidebar}
                style={({ isActive }) => (isActive ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem)}
              >
                <FolderKanban size={18} />
                <span>Projects</span>
              </NavLink>

              <NavLink 
                to="/dashboard/tickets" 
                onClick={closeSidebar}
                style={({ isActive }) => (isActive ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem)}
              >
                <CheckSquare size={18} />
                <span>Tickets</span>
              </NavLink>

              {/* Attachments Section */}
              <NavLink 
                to="/dashboard/attachments" 
                onClick={closeSidebar}
                style={({ isActive }) => (isActive ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem)}
              >
                <Paperclip size={18} />
                <span>Attachments</span>
              </NavLink>
            </>
          )}

          {/* Admin Only Controls */}
          {isAdminOrOwner && (
            <>
              <div style={styles.navDivider}>ADMIN CONTROLS</div>
              <NavLink 
                to="/dashboard/users" 
                onClick={closeSidebar}
                style={({ isActive }) => (isActive ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem)}
              >
                <Users size={18} />
                <span>Users</span>
              </NavLink>

              <NavLink 
                to="/dashboard/roles" 
                onClick={closeSidebar}
                style={({ isActive }) => (isActive ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem)}
              >
                <ShieldCheck size={18} />
                <span>Roles</span>
              </NavLink>

              <NavLink 
                to="/dashboard/permissions" 
                onClick={closeSidebar}
                style={({ isActive }) => (isActive ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem)}
              >
                <Key size={18} />
                <span>Permissions</span>
              </NavLink>
            </>
          )}

          {/* Agar user pending hai to sidebar me guide text */}
          {isPendingUser && (
            <div style={styles.pendingSidebarNote}>
              <Clock size={16} color="#d97706" />
              <span>Awaiting role assignment from admin.</span>
            </div>
          )}
        </nav>

        {/* User Info & Logout */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
              <p style={styles.userName}>{user?.Name || user?.name || 'User'}</p>
              <span style={isAdminOrOwner ? styles.adminBadge : styles.memberBadge}>
                {isAdminOrOwner ? (currentRole || 'ADMIN') : (currentRole || 'PENDING')}
              </span>
            </div>
            <p style={styles.userEmail}>{user?.Email || user?.email || ''}</p>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton} title="Logout">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={styles.main}>
        <header style={styles.topHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="hamburger-btn" 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation"
            >
              <Menu size={22} />
            </button>
            <h3 style={styles.headerTitle} className="header-title-text">Task Management Portal</h3>
          </div>
          <span style={styles.activeTag}>Online</span>
        </header>

        {/* Top Warning Banner: Sirf Pending Users ke liye */}
        {isPendingUser && (
          <div style={styles.pendingBanner}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>
              <strong>Role Assignment Pending:</strong> Your account has limited view access. Please contact your organization administrator to allocate your role.
            </span>
          </div>
        )}

        <main style={styles.content}>
          {/* Agar user Pending hai aur Admin nahi hai to Pending Screen aaye, warna Outlet load ho */}
          {isPendingUser ? (
            <div style={styles.pendingScreen}>
              <div style={styles.pendingCard}>
                <div style={styles.clockIconCircle}>
                  <Clock size={36} color="#d97706" />
                </div>
                <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '20px' }}>
                  Account Awaiting Allocation
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
                  Welcome, <strong>{user?.Name || user?.name || 'Member'}</strong>! Your account has been created successfully, but you have not been assigned to a workspace role yet.
                </p>

                <div style={styles.infoBox}>
                  <div style={styles.infoRow}>
                    <span style={{ color: '#64748b' }}>Your User ID:</span>
                    <strong style={{ color: '#0f172a' }}>#{user?.id || user?.UserID || 'N/A'}</strong>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={{ color: '#64748b' }}>Registered Email:</span>
                    <strong style={{ color: '#0f172a' }}>{user?.Email || user?.email}</strong>
                  </div>
                </div>

                <p style={{ margin: '14px 0 0 0', fontSize: '13px', color: '#475569' }}>
                  Please notify your <strong>Organization Admin</strong> with your User ID or Email to allocate your role. Once assigned, refresh this page to access your workspaces.
                </p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f8fafc',
    fontFamily: 'sans-serif',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
    marginBottom: '16px',
  },
  brandText: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  mobileClose: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    overflowY: 'auto',
  },
  navDivider: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.05em',
    padding: '12px 10px 4px 10px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontWeight: 600,
  },
  pendingSidebarNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 10px',
    backgroundColor: '#fffbeb',
    border: '1px dashed #fcd34d',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#92400e',
    marginTop: '10px',
  },
  sidebarFooter: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  userInfo: {
    padding: '0 4px',
  },
  userName: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 600,
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    margin: '2px 0 0 0',
    fontSize: '11px',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  adminBadge: {
    fontSize: '10px',
    fontWeight: 600,
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  memberBadge: {
    fontSize: '10px',
    fontWeight: 600,
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '9px 12px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  topHeader: {
    height: '56px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    flexShrink: 0,
  },
  headerTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#334151',
  },
  activeTag: {
    fontSize: '11px',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    padding: '3px 8px',
    borderRadius: '10px',
    fontWeight: 600,
  },
  pendingBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fffbeb',
    color: '#b45309',
    borderBottom: '1px solid #fde68a',
    padding: '10px 16px',
    fontSize: '13px',
  },
  content: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  pendingScreen: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  pendingCard: {
    maxWidth: '480px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '32px 24px',
    textAlign: 'center',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
  },
  clockIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#fef3c7',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 16px',
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'left',
    fontSize: '13px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};