import AppTabs from '@/components/app-tabs';
import { useAppAlert } from '@/context/AlertContext';
import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axiosClient';
import { triggerLocalNotification } from '../services/notificationService';

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

export default function AttachmentsScreen() {
  const { colors } = useAppTheme();
  const { showAlert } = useAppAlert();
  const router = useRouter();

  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  // Form states
  const [selectedAsset, setSelectedAsset] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [ticketIdInput, setTicketIdInput] = useState<string>('');
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  // Derive public backend host for MinIO image proxy
  const getBackendBaseHost = () => {
    const baseURL = api.defaults.baseURL || '';
    try {
      const parsed = new URL(baseURL);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return '';
    }
  };

  const formatAttachmentUrl = (rawUrl?: string) => {
  if (!rawUrl) return '';
  let cleaned = String(rawUrl).trim().replace(/^['"]|['"]$/g, '');
  if (cleaned === '[object Object]' || cleaned.includes('[object')) return '';

  // Localhost aur Docker container ko laptop ki IP se replace karein
  cleaned = cleaned.replace('//localhost:9000', '//192.168.0.70:9000');
  cleaned = cleaned.replace('//minio:9000', '//192.168.0.70:9000');
  cleaned = cleaned.replace('//127.0.0.1:9000', '//192.168.0.70:9000');

  // Path fix
  cleaned = cleaned.replace('/task-attachments/tickets/', '/task-attachments/');

  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `http://${cleaned}`;
  }
  return cleaned;
};

  const fetchAttachments = async () => {
    try {
      // 1. Attempt to fetch standalone attachments endpoint
      try {
        const res = await api.get('/attachments');
        const data = Array.isArray(res.data) ? res.data : res.data?.attachments || [];
        if (data.length > 0) {
          setAttachments(
            data.sort((a: any, b: any) => Number(a.TicketID ?? a.ticketId ?? 0) - Number(b.TicketID ?? b.ticketId ?? 0))
          );
          return;
        }
      } catch {
        // Fallback to tickets if attachments endpoint is not provided
      }

      // 2. Fallback: Aggregate attachments from tickets list
      const ticketsRes = await api.get('/tickets');
      const ticketList = Array.isArray(ticketsRes.data) ? ticketsRes.data : ticketsRes.data?.tickets || [];

      const extracted: AttachmentItem[] = [];
      ticketList.forEach((t: any) => {
        const rawUrl = t.Attachment || t.AttachmentURL || t.attachment_url || t.image_url;
        if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim() !== '') {
          const tId = Number(t.id ?? t.TicketID ?? t.ticket_id ?? 0);
          const cleanName = rawUrl.split('/').pop() || `Ticket_${tId}_attachment.jpg`;
          extracted.push({
            id: tId,
            AttachmentID: tId,
            FileName: cleanName,
            FileUrl: rawUrl,
            TicketID: tId,
            createdAt: t.createdAt || new Date().toISOString(),
          });
        }
      });

      // Sort ascending by Ticket ID so Ticket #1 appears before Ticket #2
      extracted.sort((a, b) => Number(a.TicketID ?? 0) - Number(b.TicketID ?? 0));
      setAttachments(extracted);
    } catch (err: any) {
      console.log('Attachments sync error:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAttachments();
  }, []);

  // Pick image file from device library
  const handlePickAsset = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert({
        title: 'Permission Denied',
        message: 'Please grant media library access to upload assets.',
        type: 'warning',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const filename = asset.fileName || asset.uri.split('/').pop() || 'mobile_upload.jpg';
      const fileType = asset.mimeType || 'image/jpeg';
      setSelectedAsset({
        uri: asset.uri,
        name: filename,
        type: fileType,
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedAsset) {
      showAlert({
        title: 'Validation Error',
        message: 'Please choose a file or image first.',
        type: 'error',
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();

      formData.append('file', {
        uri: selectedAsset.uri,
        name: selectedAsset.name,
        type: selectedAsset.type,
      } as any);

      if (ticketIdInput.trim()) {
        formData.append('TicketID', ticketIdInput.trim());
        formData.append('ticketId', ticketIdInput.trim());
      }

      await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await triggerLocalNotification(
        'Asset Uploaded',
        `File "${selectedAsset.name}" successfully stored in MinIO storage.`,
        { screen: '/attachments' }
      );

      showAlert({
        title: 'Success',
        message: 'Asset uploaded successfully to MinIO storage.',
        type: 'success',
      });
      setSelectedAsset(null);
      setTicketIdInput('');
      fetchAttachments();
    } catch (err: any) {
      showAlert({
        title: 'Upload Error',
        message: err.response?.data?.message || 'Failed to upload asset.',
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const isImageFile = (url?: string, name?: string) => {
    const target = (url || name || '').toLowerCase();
    return (
      target.endsWith('.png') ||
      target.endsWith('.jpg') ||
      target.endsWith('.jpeg') ||
      target.endsWith('.webp') ||
      target.endsWith('.gif') ||
      target.includes('image')
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#34d399" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View style={styles.pillBadge}>
              <Ionicons name="sparkles" size={11} color="#34d399" />
              <Text style={styles.pillBadgeText}>OBJECT STORAGE REPOSITORY</Text>
            </View>
            <Text style={[styles.pageTitle, { color: colors.text }]} numberOfLines={1}>
              Attachments & Files
            </Text>
          </View>
        </View>

        {/* Upload Panel */}
        <View style={[styles.uploadBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.uploadControls}>
            <TouchableOpacity
              style={styles.chooseFileBtn}
              onPress={handlePickAsset}
              activeOpacity={0.8}
            >
              <Ionicons name="cloud-upload-outline" size={18} color="#10b981" />
              <Text style={styles.chooseFileText} numberOfLines={1}>
                {selectedAsset ? selectedAsset.name : 'Choose Image / File'}
              </Text>
            </TouchableOpacity>

            {selectedAsset ? (
              <TouchableOpacity
                style={styles.removeSelectedBtn}
                onPress={() => setSelectedAsset(null)}
              >
                <Ionicons name="close-circle" size={20} color="#f87171" />
              </TouchableOpacity>
            ) : null}

            <TextInput
              style={[styles.ticketInput, { color: colors.text }]}
              placeholder="Ticket ID (Optional)..."
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={ticketIdInput}
              onChangeText={setTicketIdInput}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.uploadSubmitBtn,
              (!selectedAsset || uploading) && { opacity: 0.5 },
            ]}
            disabled={!selectedAsset || uploading}
            onPress={handleUpload}
            activeOpacity={0.8}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#022c22" />
            ) : (
              <>
                <Ionicons name="arrow-up" size={16} color="#022c22" />
                <Text style={styles.uploadSubmitText}>Upload Asset</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Attachments List */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Syncing MinIO objects...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
          >
            {attachments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="attach-outline" size={44} color="#64748b" />
                <Text style={styles.emptyTitle}>No storage objects found</Text>
                <Text style={styles.emptySub}>
                  Upload technical assets or screenshots using the panel above.
                </Text>
              </View>
            ) : (
              attachments.map((att, idx) => {
                const displaySequence = idx + 1; // Sequential order: #1, #2, #3...
                const aName = att.FileName ?? att.fileName ?? `Attachment #${displaySequence}`;
                const aUrl = att.FileUrl ?? att.fileUrl ?? '';
                const aTicket = att.TicketID ?? att.ticketId;
                const isImg = isImageFile(aUrl, aName);
                const formattedUrl = formatAttachmentUrl(aUrl);

                return (
                  <View
                    key={displaySequence}
                    style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    <View style={styles.itemHeader}>
                      <View style={styles.itemIconBox}>
                        <Ionicons
                          name={isImg ? 'image-outline' : 'document-text-outline'}
                          size={18}
                          color="#10b981"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
                          {aName}
                        </Text>
                        <Text style={styles.fileMeta}>
                          ID #{displaySequence} {aTicket ? `• Ticket #${aTicket}` : '• General Asset'}
                        </Text>
                      </View>
                    </View>

                    {/* Image Preview Thumbnail */}
                    {isImg && formattedUrl ? (
                      <TouchableOpacity
                        style={styles.previewWrap}
                        activeOpacity={0.9}
                        onPress={() => setPreviewModalUrl(formattedUrl)}
                      >
                        <Image
                          source={{ uri: formattedUrl }}
                          style={styles.previewImage}
                          resizeMode="cover"
                        />
                        <View style={styles.tapToViewPill}>
                          <Ionicons name="eye-outline" size={11} color="#ffffff" />
                          <Text style={styles.tapToViewText}>Tap to preview</Text>
                        </View>
                      </TouchableOpacity>
                    ) : null}

                    {/* Card Footer */}
                    <View style={styles.cardFooter}>
                      <View style={styles.storageBadge}>
                        <Ionicons name="cloud-done-outline" size={12} color="#10b981" />
                        <Text style={styles.storageBadgeText}>MinIO S3</Text>
                      </View>

                      {formattedUrl ? (
                        <TouchableOpacity
                          style={styles.viewLinkBtn}
                          onPress={() => setPreviewModalUrl(formattedUrl)}
                        >
                          <Text style={styles.viewLinkText}>Inspect</Text>
                          <Ionicons name="open-outline" size={13} color="#38bdf8" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        {/* Full Image Preview Modal */}
        <Modal visible={!!previewModalUrl} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.previewModalBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.modalTopBar}>
                <Text style={[styles.modalTitleText, { color: colors.text }]}>Asset Preview</Text>
                <TouchableOpacity onPress={() => setPreviewModalUrl(null)}>
                  <Ionicons name="close-circle-outline" size={26} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {previewModalUrl && (
                <View style={styles.modalImageWrap}>
                  <Image
                    source={{ uri: previewModalUrl }}
                    style={styles.modalFullImage}
                    resizeMode="contain"
                  />
                </View>
              )}

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setPreviewModalUrl(null)}
              >
                <Text style={styles.modalCloseBtnText}>Close Preview</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>

      <AppTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  pillBadgeText: {
    color: '#34d399',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  uploadBox: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  uploadControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chooseFileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  chooseFileText: {
    color: '#cbd5e1',
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  removeSelectedBtn: {
    padding: 2,
  },
  ticketInput: {
    width: 140,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 12,
  },
  uploadSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 10,
  },
  uploadSubmitText: {
    color: '#022c22',
    fontSize: 13,
    fontWeight: '800',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 12.5,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    gap: 12,
  },
  emptyCard: {
    padding: 50,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },
  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
  },
  fileMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  previewWrap: {
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#020617',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  tapToViewPill: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tapToViewText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  storageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storageBadgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  viewLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewLinkText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewModalBox: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalImageWrap: {
    height: 320,
    backgroundColor: '#020617',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalFullImage: {
    width: '100%',
    height: '100%',
  },
  modalCloseBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});