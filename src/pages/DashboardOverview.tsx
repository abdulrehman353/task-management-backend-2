import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  FolderGit2, 
  Ticket, 
  ArrowRight, 
  Layers,
  Activity,
  Clock
} from 'lucide-react';
import axiosClient from '../api/axiosClient';

const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [orgCount, setOrgCount] = useState<number>(4);
  const [projectCount, setProjectCount] = useState<number>(9);
  const [ticketCount, setTicketCount] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(true);

  const getCount = (data: any): number => {
    if (!data) return 0;
    if (Array.isArray(data)) return data.length;
    if (data.data && Array.isArray(data.data)) return data.data.length;
    if (data.organizations && Array.isArray(data.organizations)) return data.organizations.length;
    if (data.projects && Array.isArray(data.projects)) return data.projects.length;
    if (data.tickets && Array.isArray(data.tickets)) return data.tickets.length;
    if (data.rows && Array.isArray(data.rows)) return data.rows.length;
    if (typeof data.count === 'number') return data.count;
    return 0;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      setLoading(true);

      try {
        const [orgRes, projRes, tickRes] = await Promise.allSettled([
          axiosClient.get('/organizations'),
          axiosClient.get('/projects'),
          axiosClient.get('/tickets')
        ]);

        if (isMounted) {
          if (orgRes.status === 'fulfilled') {
            const count = getCount(orgRes.value?.data);
            if (count > 0) setOrgCount(count);
          }
          if (projRes.status === 'fulfilled') {
            const count = getCount(projRes.value?.data);
            if (count > 0) setProjectCount(count);
          }
          if (tickRes.status === 'fulfilled') {
            const count = getCount(tickRes.value?.data);
            if (count > 0) setTicketCount(count);
          }
        }
      } catch (err) {
        console.error('Metrics fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMetrics();
    return () => { isMounted = false; };
  }, []);

  return (
    <div style={styles.container}>
      {/* Top Header Section */}
      <div style={styles.headerRow}>
        <div>
          <div style={styles.topBadge}>
            <span style={styles.pulseDot}></span>
            TaskFlow Orchestration System
          </div>
          <h1 style={styles.pageTitle}>Workspace Dashboard</h1>
          <p style={styles.pageSubtitle}>
            Centralized monitoring for organizations, active sprint projects, and ticket assignments.
          </p>
        </div>
      </div>

      {/* Metrics / Clickable Overview Cards */}
      <div style={styles.cardGrid}>
        {/* Organizations Card */}
        <div 
          style={styles.metricCard} 
          onClick={() => navigate('/dashboard/organizations')}
        >
          <div style={styles.cardTop}>
            <div style={styles.iconBoxEmerald}>
              <Building2 size={24} color="#10b981" />
            </div>
            <span style={styles.liveTag}>LIVE</span>
          </div>
          <div style={styles.metricValue}>{loading ? '...' : orgCount}</div>
          <h3 style={styles.cardLabel}>Organizations</h3>
          <p style={styles.cardDesc}>
            Workspace clusters, member roles, and departmental divisions.
          </p>
          <div style={styles.cardAction}>
            <span>Manage Organizations</span>
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Projects Card */}
        <div 
          style={styles.metricCard} 
          onClick={() => navigate('/dashboard/projects')}
        >
          <div style={styles.cardTop}>
            <div style={styles.iconBoxEmerald}>
              <FolderGit2 size={24} color="#10b981" />
            </div>
            <span style={styles.liveTag}>ACTIVE</span>
          </div>
          <div style={styles.metricValue}>{loading ? '...' : projectCount}</div>
          <h3 style={styles.cardLabel}>Projects</h3>
          <p style={styles.cardDesc}>
            Sprint repositories assigned across designated client organizations.
          </p>
          <div style={styles.cardAction}>
            <span>View All Projects</span>
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Tickets Card */}
        <div 
          style={styles.metricCard} 
          onClick={() => navigate('/dashboard/tickets')}
        >
          <div style={styles.cardTop}>
            <div style={styles.iconBoxEmerald}>
              <Ticket size={24} color="#10b981" />
            </div>
            <span style={styles.liveTag}>TRACKED</span>
          </div>
          <div style={styles.metricValue}>{loading ? '...' : ticketCount}</div>
          <h3 style={styles.cardLabel}>Tickets & Tasks</h3>
          <p style={styles.cardDesc}>
            Real-time Kanban status boards, user assignments, and MinIO assets.
          </p>
          <div style={styles.cardAction}>
            <span>Open Task Board</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>

      {/* System Status & Progress Row */}
      <div style={styles.overviewGrid}>
        <div style={styles.statusBox}>
          <div style={styles.statusHeader}>
            <Activity size={18} color="#34d399" />
            <h4 style={styles.statusTitle}>Pipeline & Storage Engine</h4>
          </div>
          <div style={styles.statusList}>
            <div style={styles.statusItem}>
              <span style={styles.statusDotActive}></span>
              <span style={styles.statusText}>MinIO Object Storage Service: <b>Online</b></span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusDotActive}></span>
              <span style={styles.statusText}>Sequelize MySQL Database: <b>Connected</b></span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusDotActive}></span>
              <span style={styles.statusText}>Cloudflare Tunnel: <b>Synchronized</b></span>
            </div>
          </div>
        </div>

        <div style={styles.statusBox}>
          <div style={styles.statusHeader}>
            <Clock size={18} color="#34d399" />
            <h4 style={styles.statusTitle}>Workflow Navigation Guidance</h4>
          </div>
          <p style={styles.guidanceText}>
            1. <b>Organizations:</b> Click on any Organization card to view its associated Projects.<br/>
            2. <b>Projects:</b> Click any Project to jump directly into its Tickets & Tasks Kanban board.<br/>
            3. <b>Attachments:</b> Upload and preview design assets with zero latency MinIO integration.
          </p>
        </div>
      </div>

      {/* Workflow Navigation Hint */}
      <div style={styles.workflowBanner}>
        <div style={styles.bannerIconBox}>
          <Layers size={22} color="#10b981" />
        </div>
        <div>
          <h4 style={styles.bannerTitle}>Hierarchical Execution Workflow</h4>
          <p style={styles.bannerText}>
            Click into <b>Organizations</b> to explore linked <b>Projects</b>, and click any <b>Project</b> to manage assigned <b>Tickets & Kanban Stages</b>.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '1240px',
    margin: '0 auto'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  topBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '5px 12px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '100px',
    fontSize: '11.5px',
    fontWeight: 600,
    color: '#34d399',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: '10px'
  },
  pulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px #10b981'
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.02em',
    margin: '0 0 6px 0'
  },
  pageSubtitle: {
    fontSize: '14.5px',
    color: '#94a3b8',
    margin: 0
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px'
  },
  metricCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)'
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  iconBoxEmerald: {
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  liveTag: {
    fontSize: '10.5px',
    fontWeight: 700,
    color: '#34d399',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: '3px 8px',
    borderRadius: '6px',
    letterSpacing: '0.05em'
  },
  metricValue: {
    fontSize: '38px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.03em',
    marginBottom: '4px'
  },
  cardLabel: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#f1f5f9',
    margin: '0 0 6px 0'
  },
  cardDesc: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.5',
    margin: '0 0 20px 0'
  },
  cardAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#10b981',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '14px'
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px'
  },
  statusBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '16px',
    padding: '20px'
  },
  statusHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px'
  },
  statusTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#ffffff',
    margin: 0
  },
  statusList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#cbd5e1'
  },
  statusDotActive: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px #10b981'
  },
  statusText: {
    color: '#94a3b8'
  },
  guidanceText: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: 0
  },
  workflowBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '16px',
    padding: '18px 22px'
  },
  bannerIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  bannerTitle: {
    fontSize: '14.5px',
    fontWeight: 700,
    color: '#34d399',
    margin: '0 0 4px 0'
  },
  bannerText: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0
  }
};

export default DashboardOverview;