import React, { useState, useEffect } from 'react';
import { 
  X, Upload, Image as ImageIcon, Search, Check, 
  Loader2, Link as LinkIcon, Plus, AlertCircle 
} from 'lucide-react';
import { 
  collection, onSnapshot, addDoc, serverTimestamp, 
  query, orderBy 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getDb, storage } from '../../lib/firebase';
import { MediaItem } from '../../types';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, altText?: string, caption?: string, credit?: string) => void;
  title?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelectImage,
  title = 'Select or Upload Image'
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'url'>('gallery');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Upload states
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Preloaded stock medical assets
  const DEFAULT_STOCK_IMAGES: MediaItem[] = [
    {
      id: 'doctor-portrait-2',
      name: 'Dr. Deval Gadhvi - Portrait 2 (Primary)',
      url: '/newark_internal_medicine_4.webp',
      size: 380000,
      type: 'image/webp',
      dimensions: '800x1000',
      altText: 'Dr. Deval Gadhvi, Internal Medicine Physician',
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor-portrait-1',
      name: 'Dr. Deval Gadhvi - Portrait 1 (Alternate)',
      url: '/newark_internal_medicine_3.webp',
      size: 370000,
      type: 'image/webp',
      dimensions: '800x1000',
      altText: 'Dr. Deval Gadhvi, Internal Medicine Physician',
      createdAt: new Date().toISOString()
    },
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
    if (!isOpen) return;
    setLoading(true);
    try {
      const db = getDb();
      const q = query(collection(db, 'media_library'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items: MediaItem[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...(doc.data() as any) });
        });
        setMediaItems(items.length > 0 ? items : DEFAULT_STOCK_IMAGES);
        setLoading(false);
      }, (err) => {
        console.warn('Media query fallback:', err);
        setMediaItems(DEFAULT_STOCK_IMAGES);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setMediaItems(DEFAULT_STOCK_IMAGES);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);

    const fallbackToCompressedBase64 = () => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const img = new Image();
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 800;
            let width = img.width;
            let height = img.height;
            
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
            }
            
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            const db = getDb();
            await addDoc(collection(db, 'media_library'), {
              name: file.name,
              url: compressedDataUrl,
              size: Math.round(compressedDataUrl.length * 0.75),
              type: 'image/jpeg',
              altText: file.name.split('.')[0],
              createdAt: serverTimestamp()
            });
            
            setSelectedUrl(compressedDataUrl);
            setIsUploading(false);
            setUploadProgress(null);
            setActiveTab('gallery');
          } catch (fallbackErr: any) {
            setUploadError('Failed to process image: ' + (fallbackErr.message || 'Unknown error'));
            setIsUploading(false);
          }
        };
        img.onerror = () => {
          setUploadError('Failed to read image file');
          setIsUploading(false);
        };
        img.src = dataUrl;
      };
      reader.onerror = () => {
        setUploadError('Failed to read file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    };

    try {
      const fileId = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, `media/${fileId}`);
      
      let uploadTask;
      try {
        uploadTask = uploadBytesResumable(storageRef, file);
      } catch (storageErr) {
        console.warn('Storage init failed, using fallback:', storageErr);
        fallbackToCompressedBase64();
        return;
      }
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.warn('Storage bucket upload fallback to local data-url:', error);
          fallbackToCompressedBase64();
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const db = getDb();
            await addDoc(collection(db, 'media_library'), {
              name: file.name,
              url: downloadUrl,
              path: `media/${fileId}`,
              size: file.size,
              type: file.type,
              altText: file.name.split('.')[0],
              createdAt: serverTimestamp()
            });
            setSelectedUrl(downloadUrl);
            setIsUploading(false);
            setUploadProgress(null);
            setActiveTab('gallery');
          } catch (dbErr) {
            console.warn('Failed to save to database or get download URL, using fallback:', dbErr);
            fallbackToCompressedBase64();
          }
        }
      );
    } catch (err: any) {
      console.error('File upload exception:', err);
      fallbackToCompressedBase64();
    }
  };

  const handleConfirmSelection = () => {
    if (activeTab === 'url' && customUrl.trim()) {
      onSelectImage(customUrl.trim());
      onClose();
    } else if (selectedUrl) {
      onSelectImage(selectedUrl);
      onClose();
    }
  };

  const filteredItems = mediaItems.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.altText?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">Choose from media library, upload from device, or paste a URL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-slate-200 flex gap-4 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'gallery'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ImageIcon size={16} />
            <span>Media Library ({mediaItems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload size={16} />
            <span>Upload New Image</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'url'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LinkIcon size={16} />
            <span>Image URL</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'gallery' && (
            <div>
              {/* Search Bar */}
              <div className="mb-5 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search images by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-2" />
                  <p className="text-xs">Loading media assets...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <ImageIcon size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium text-slate-700">No images match your search</p>
                  <p className="text-xs text-slate-400 mt-1">Try another keyword or upload a new photo</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredItems.map((item) => {
                    const isSelected = selectedUrl === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedUrl(item.url)}
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
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-white">
                          <p className="text-xs font-semibold truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-300">
                            {item.size ? `${(item.size / 1024).toFixed(0)} KB` : 'Image Asset'}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-md">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="py-8">
              <label className="border-2 border-dashed border-slate-300 hover:border-primary-500 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50 hover:bg-primary-50/20">
                <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                  <Upload size={28} />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">Click to Upload or Drag & Drop</h4>
                <p className="text-xs text-slate-500 mb-4 max-w-sm">
                  Supports JPG, PNG, WebP, SVG up to 10MB. Files are securely stored in your clinic media bucket.
                </p>
                <span className="inline-flex items-center gap-2 bg-primary-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-sm">
                  <Plus size={14} />
                  <span>Choose File from Computer</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              {isUploading && (
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>Uploading Image...</span>
                    <span>{uploadProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress || 10}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="py-6 max-w-xl mx-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Direct Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedUrl(customUrl)}
                    className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                  >
                    Preview
                  </button>
                </div>
              </div>

              {(customUrl || selectedUrl) && (
                <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50">
                  <p className="text-xs font-medium text-slate-500 mb-2">Image Preview:</p>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-200">
                    <img
                      src={customUrl || selectedUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 truncate max-w-sm">
            {selectedUrl ? (
              <span className="text-slate-800 font-medium truncate block">
                Selected: {selectedUrl.slice(0, 40)}...
              </span>
            ) : (
              'Please select an image to apply'
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedUrl && (!customUrl || activeTab !== 'url')}
              onClick={handleConfirmSelection}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Use Selected Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
