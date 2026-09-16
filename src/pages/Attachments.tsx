import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Paperclip, Upload, FileText, Image as ImageIcon, AlertCircle, ExternalLink } from 'lucide-react';

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
      setSelectedFile(null);
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
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Attachments & Files</h2>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          Upload screenshots, logs, and technical documents for tickets.
        </p>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleUpload} style={styles.uploadCard}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          <div style={styles.fileInputWrapper}>
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={styles.nativeFileInput}
            />
          </div>

          <input
            type="number"
            placeholder="Related Ticket ID (Optional)..."
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={uploading || !selectedFile} style={styles.primaryBtn}>
          <Upload size={16} />
          <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
        </button>
      </form>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Attachments List / Table */}
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading attachments...</p>
      ) : attachments.length === 0 ? (
        <div style={styles.emptyBox}>
          <Paperclip size={32} style={{ marginBottom: '8px', color: '#94a3b8' }} />
          <div>No attachments found yet. Select an image or document above to upload.</div>
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
              <div key={aId} style={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={styles.iconBox}>
                    {isImg ? <ImageIcon size={20} color="#2563eb" /> : <FileText size={20} color="#2563eb" />}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <h4 style={styles.fileNameText} title={aName}>{aName}</h4>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      ID: #{aId} {aTicket ? `• Ticket #${aTicket}` : ''}
                    </span>
                  </div>
                </div>

                {isImg && aUrl !== '#' && (
                  <div style={styles.previewContainer}>
                    <img src={aUrl} alt={aName} style={styles.previewImg} />
                  </div>
                )}

                <div style={styles.cardFooter}>
                  {aUrl !== '#' ? (
                    <a href={aUrl} target="_blank" rel="noopener noreferrer" style={styles.viewLink}>
                      <ExternalLink size={13} />
                      <span>View Full</span>
                    </a>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Stored in MinIO</span>
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
  uploadCard: {
    display: 'flex',
    gap: '12px',
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '24px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  fileInputWrapper: {
    flex: 1,
    minWidth: '220px',
  },
  nativeFileInput: {
    width: '100%',
    padding: '8px',
    fontSize: '13px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  input: {
    width: '200px',
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '9px 16px',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '12px',
  },
  iconBox: {
    backgroundColor: '#eff6ff',
    padding: '8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fileNameText: {
    margin: 0,
    fontSize: '14px',
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px',
  },
  previewContainer: {
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    border: '1px solid #f1f5f9',
    maxHeight: '140px',
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
    borderTop: '1px solid #f1f5f9',
    paddingTop: '10px',
  },
  viewLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#2563eb',
    fontSize: '12px',
    textDecoration: 'none',
    fontWeight: 600,
  },
  emptyBox: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
  },
};