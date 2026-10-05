import React, { useState, useEffect } from 'react';
import { 
  Upload, Search, Image as ImageIcon, Trash2, Copy, 
  Check, ExternalLink, Filter, Plus, FileText, AlertCircle, 
  Loader2, RefreshCw 
} from 'lucide-react';
import { 
  collection, onSnapshot, addDoc, deleteDoc, doc, 
  serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { MediaItem } from '../../types';

export default function MediaLibrary() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const DEFAULT_STOCK_IMAGES: MediaItem[] = [
    {
      id: 'stock-1',
      name: 'Doctor Patient Consultation',
      url: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&q=80&w=1200',
      size: 450000,
      type: 'image/jpeg',
      dimensions: '1200x800',
      altText: 'Physician examining patient',
      createdAt: new Date().toISOString()
    },
    {
      id: 'stock-2',
      name: 'Dr. Prahlad Gadhvi Portrait',
      url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
      size: 320000,
      type: 'image/jpeg',
      dimensions: '800x800',
      altText: 'Dr. Prahlad Gadhvi, MD',
      createdAt: new Date().toISOString()
    },
    {
      id: 'stock-3',
      name: 'Dr. Deval Gadhvi Portrait',
      url: 'https://images.unsplash.com/photo-1594824813627-2c9ffea824f9?auto=format&fit=crop&q=80&w=800',
      size: 340000,
      type: 'image/jpeg',
      dimensions: '800x800',
      altText: 'Dr. Deval Gadhvi, MD',
      createdAt: new Date().toISOString()
    },
    {
      id: 'stock-4',
      name: 'Diagnostic Ultrasound & Heart Screen',
      url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
      size: 410000,
      type: 'image/jpeg',
      dimensions: '800x600',
      altText: 'Ultrasound screening in clinic',
      createdAt: new Date().toISOString()
    },
    {
      id: 'stock-5',
      name: 'Modern Medical Facility & Reception',
      url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200',
      size: 520000,
      type: 'image/jpeg',
      dimensions: '1200x800',
      altText: 'Clinic interior lobby',
      createdAt: new Date().toISOString()
    },
    {
      id: 'stock-6',
      name: 'On-Site Phlebotomy & Blood Testing',
      url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
      size: 380000,
      type: 'image/jpeg',
      dimensions: '800x600',
      altText: 'Laboratory diagnostics',
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    setLoading(true);
    try {
      const db = getDb();
      const q = query(collection(db, 'media_library'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items: MediaItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        setMediaItems(items.length > 0 ? items : DEFAULT_STOCK_IMAGES);
        if (items.length > 0 && !selectedItem) {
          setSelectedItem(items[0]);
        } else if (!selectedItem) {
          setSelectedItem(DEFAULT_STOCK_IMAGES[0]);
        }
        setLoading(false);
      }, (err) => {
        console.warn('Firestore media subscription error:', err);
        setMediaItems(DEFAULT_STOCK_IMAGES);
        setSelectedItem(DEFAULT_STOCK_IMAGES[0]);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setMediaItems(DEFAULT_STOCK_IMAGES);
      setSelectedItem(DEFAULT_STOCK_IMAGES[0]);
      setLoading(false);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Only JPG, PNG, and WebP images are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File exceeds 5 MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(50);
      const res = await fetch('/.netlify/functions/upload-provider-image?providerId=media', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(85);
      const json = await res.json();
      if (!res.ok || !json.imageUrl) {
        throw new Error(json.error || `Upload failed (HTTP ${res.status})`);
      }

      const db = getDb();
      const docRef = await addDoc(collection(db, 'media_library'), {
        name: file.name,
        url: json.imageUrl,
        size: file.size,
        type: file.type,
        altText: file.name.split('.')[0],
        source: 'r2',
        createdAt: serverTimestamp()
      });

      const newItem: MediaItem = {
        id: docRef.id,
        name: file.name,
        url: json.imageUrl,
        size: file.size,
        type: file.type,
        altText: file.name.split('.')[0],
        createdAt: new Date().toISOString()
      };
      setSelectedItem(newItem);
      setUploadProgress(100);
      setIsUploading(false);
      setUploadProgress(null);
    } catch (err: any) {
      console.error('File upload exception:', err);
      setUploadError(err.message || 'Failed to upload image to Cloudflare R2.');
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteItem = async (item: MediaItem) => {
    try {
      const db = getDb();
      if (!item.id.startsWith('stock-')) {
        await deleteDoc(doc(db, 'media_library', item.id));
      }
      setMediaItems(prev => prev.filter(i => i.id !== item.id));
      if (selectedItem?.id === item.id) {
        setSelectedItem(mediaItems.find(i => i.id !== item.id) || null);
      }
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredItems = mediaItems.filter(i => 
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.altText?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Media Library</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage images and graphical assets for the Newark Medical Associates website.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer">
            <Upload size={16} />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-primary-600" />
              <span>Uploading image to Cloudflare R2...</span>
            </span>
            <span>{uploadProgress || 10}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress || 10}%` }}
            />
          </div>
        </div>
      )}

      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main Grid & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search images by name or alt text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-2" />
              <p className="text-xs">Loading media assets...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <ImageIcon size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No media assets found</p>
              <p className="text-xs text-slate-400 mt-1">Upload a photo to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`group relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all bg-slate-100 ${
                      isSelected
                        ? 'border-primary-600 ring-4 ring-primary-100 shadow-md'
                        : 'border-slate-200 hover:border-primary-400'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-white">
                      <p className="text-xs font-semibold truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-300">
                        {item.size ? `${(item.size / 1024).toFixed(0)} KB` : 'Asset'}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-md">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Asset Details Inspector */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6 space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Asset Inspector
          </h2>

          {selectedItem ? (
            <div className="space-y-5">
              {/* Image Preview Box */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
                <a
                  href={selectedItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Open full size"
                >
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Metadata Details */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">File Name</span>
                  <span className="font-semibold text-slate-800 break-all">{selectedItem.name}</span>
                </div>
                {selectedItem.size && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Size</span>
                    <span className="font-semibold text-slate-800">{(selectedItem.size / 1024).toFixed(1)} KB</span>
                  </div>
                )}
                {selectedItem.dimensions && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dimensions</span>
                    <span className="font-semibold text-slate-800">{selectedItem.dimensions}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Format</span>
                  <span className="font-semibold text-slate-800 uppercase">{selectedItem.type?.split('/')[1] || 'JPEG'}</span>
                </div>
              </div>

              {/* Copy URL Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Direct Asset URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={selectedItem.url}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 truncate"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(selectedItem.url, selectedItem.id)}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copiedId === selectedItem.id ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Delete Action */}
              <div className="pt-4 border-t border-slate-100">
                {deleteConfirmId === selectedItem.id ? (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-2">
                    <p className="text-xs font-semibold text-red-800">Permanently delete this image?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(selectedItem)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Yes, Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(selectedItem.id)}
                    className="w-full py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Delete from Media Library</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select an image from the gallery to view its dimensions and direct link.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
