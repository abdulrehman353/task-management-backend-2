import React, { useEffect, useState, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { 
  Paperclip, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  X
} from 'lucide-react';

interface AttachmentItem {
  id?: number;
  AttachmentID?: number;
  FileName?: string;
  fileName?: string;
  FileUrl?: string;
  fileUrl?: string;
  TicketID?: number;
  ticketId?: number;
  createdAt?: string;
}

export default function Attachments() {
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ticketId, setTicketId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/attachments');
      setAttachments(Array.isArray(res.data) ? res.data : res.data.attachments || []);
    } catch (err: any) {
      console.warn('Attachments fetch note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, []);

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file or image first.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (ticketId) {
        formData.append('TicketID', ticketId);
        formData.append('ticketId', ticketId);
      }

      await axiosClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('File uploaded successfully to storage!');
      handleClearSelectedFile();
      setTicketId('');
      fetchAttachments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setUploading(false);
    }
  };

  const isImageFile = (url?: string, name?: string) => {
    const target = (url || name || '').toLowerCase();
    return target.endsWith('.png') || target.endsWith('.jpg') || target.endsWith('.jpeg') || target.endsWith('.webp') || target.endsWith('.gif');
  };

  return (
    <div style={styles.pageContainer}>
      <style>{`
        .att-upload-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 16px 20px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
          margin-bottom: 26px;
        }
        .att-item-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 14px;
          transition: all 0.22s ease;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
        }
        .att-item-card:hover {
          transform: translateY(-3px);
          border-color: rgba(16, 185, 129, 0.45);
          box-shadow: 0 18px 32px -6px rgba(16, 185, 129, 0.2), 0 8px 16px rgba(0, 0, 0, 0.4);
        }
        .att-input-glow:focus {
          background: rgba(2, 6, 23, 0.85) !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
        }
        .emerald-upload-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px -4px rgba(16, 185, 129, 0.5) !important;
        }
        .att-view-link:hover {
          color: #34d399 !important;
          text-decoration: underline;
        }
        .remove-file-badge-btn:hover {
          background-color: rgba(239, 68, 68, 0.2) !important;
          border-color: rgba(239, 68, 68, 0.4) !important;
          color: #f87171 !important;
          transform: scale(1.05);
        }
      `}</style>

      {/* Header Banner */}
      <div style={styles.headerSection}>
        <div style={styles.pillBadge}>
          <Sparkles size={11} color="#34d399" />
          <span>OBJECT STORAGE REPOSITORY</span>
        </div>
        <h2 style={styles.pageTitle}>Attachments & Files</h2>
        <p style={styles.pageSubtitle}>
          Upload technical assets, screenshots, and documentation linked to active tickets in MinIO.
        </p>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleUpload} className="att-upload-card" style={styles.uploadCard}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          <div style={styles.fileInputWrapper}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={styles.nativeFileInput}
            />
            {selectedFile && (
              <button
                type="button"
                onClick={handleClearSelectedFile}
                className="remove-file-badge-btn"
                style={styles.clearSelectedBtn}
                title="Remove selected file"
              >
                <X size={14} color="#f87171" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <input
            type="number"
            placeholder="Related Ticket ID (Optional)..."
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            className="att-input-glow"
            style={styles.input}
          />
        </div>

        <button 
          type="submit" 
          disabled={uploading || !selectedFile} 
          className="emerald-upload-btn"
          style={{
            ...styles.primaryBtn,
            opacity: uploading || !selectedFile ? 0.65 : 1,
            cursor: uploading || !selectedFile ? 'not-allowed' : 'pointer'
          }}
        >
          <Upload size={16} strokeWidth={2.4} />
          <span>{uploading ? 'Uploading to Storage...' : 'Upload File'}</span>
        </button>
      </form>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Attachments List / Grid */}
      {loading ? (
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Syncing storage objects...</p>
        </div>
      ) : attachments.length === 0 ? (
        <div style={styles.emptyBox}>
          <Paperclip size={36} style={{ marginBottom: '10px', color: '#64748b' }} />
          <h4 style={{ margin: '0 0 6px 0', color: '#f1f5f9' }}>No storage objects found</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Choose an image or document above to push your first asset to the bucket.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {attachments.map((att, idx) => {
            const aId = att.AttachmentID ?? att.id ?? (idx + 1);
            const aName = att.FileName ?? att.fileName ?? `Attachment #${aId}`;
            const aUrl = att.FileUrl ?? att.fileUrl ?? '#';
            const aTicket = att.TicketID ?? att.ticketId;
            const isImg = isImageFile(aUrl, aName);

            return (
              <div key={aId} className="att-item-card">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={styles.iconBox}>
                      {isImg ? (
                        <ImageIcon size={18} color="#10b981" strokeWidth={2.2} />
                      ) : (
                        <FileText size={18} color="#10b981" strokeWidth={2.2} />
                      )}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <h4 style={styles.fileNameText} title={aName}>{aName}</h4>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        ID #{aId} {aTicket ? `• Ticket #${aTicket}` : ''}
                      </div>
                    </div>
                  </div>

                  {isImg && aUrl !== '#' && (
                    <div style={styles.previewContainer}>
                      <img src={aUrl} alt={aName} style={styles.previewImg} />
                    </div>
                  )}
                </div>

                <div style={styles.cardFooter}>
                  {aUrl !== '#' ? (
                    <a 
                      href={aUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="att-view-link"
                      style={styles.viewLink}
                    >
                      <span>Direct View</span>
                      <ExternalLink size={13} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Stored in MinIO</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  headerSection: {
    marginBottom: '22px',
  },
  pillBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.07em',
    color: '#34d399',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    padding: '4px 12px',
    borderRadius: '20px',
    marginBottom: '8px',
  },
  pageTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.025em',
  },
  pageSubtitle: {
    margin: '6px 0 0 0',
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  uploadCard: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
    boxSizing: 'border-box',
  },
  fileInputWrapper: {
    flex: 1,
    minWidth: '240px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  nativeFileInput: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '13px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    color: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  },
  clearSelectedBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 10px',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.28)',
    borderRadius: '8px',
    color: '#f87171',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flexShrink: 0,
  },
  input: {
    width: '230px',
    padding: '9px 14px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    color: '#ffffff',
    boxSizing: 'border-box',
    transition: 'all 0.15s ease',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13.5px',
    flexShrink: 0,
    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
    transition: 'all 0.2s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  iconBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fileNameText: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 700,
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '200px',
  },
  previewContainer: {
    marginTop: '12px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    height: '140px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '10px',
  },
  viewLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    color: '#10b981',
    fontSize: '12.5px',
    textDecoration: 'none',
    fontWeight: 700,
    transition: 'all 0.15s ease',
  },
  emptyBox: {
    padding: '50px 20px',
    textAlign: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '16px',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '60px 0',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(16, 185, 129, 0.15)',
    borderTop: '3px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: '#f87171',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    marginBottom: '20px',
    fontSize: '13.5px',
  },
};