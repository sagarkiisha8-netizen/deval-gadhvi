import React, { useState, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, X, Check, Loader2, 
  AlertCircle, Link as LinkIcon, Sparkles, RefreshCw
} from 'lucide-react';
import MediaPickerModal from './MediaPickerModal';

interface FeaturedImageUploaderProps {
  imageUrl: string;
  altText: string;
  caption?: string;
  credit?: string;
  onChange: (data: {
    imageUrl: string;
    altText: string;
    caption?: string;
    credit?: string;
  }) => void;
}

export default function FeaturedImageUploader({
  imageUrl,
  altText,
  caption = '',
  credit = '',
  onChange
}: FeaturedImageUploaderProps) {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInputOpen, setUrlInputOpen] = useState(false);
  const [directUrl, setDirectUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Please select a valid JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(50);
      const res = await fetch('/.netlify/functions/upload-provider-image?providerId=blog', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(85);
      const json = await res.json();
      if (!res.ok || !json.imageUrl) {
        throw new Error(json.error || `Upload failed (HTTP ${res.status})`);
      }

      onChange({
        imageUrl: json.imageUrl,
        altText: altText || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        caption,
        credit
      });
      setUploadProgress(100);
      setIsUploading(false);
      setUploadProgress(null);
    } catch (err: any) {
      console.error('FeaturedImage upload error:', err);
      setUploadError(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApplyDirectUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl) return;
    onChange({
      imageUrl: directUrl.trim(),
      altText: altText || 'Clinical article illustration',
      caption,
      credit
    });
    setDirectUrl('');
    setUrlInputOpen(false);
  };

  const handleRemove = () => {
    onChange({
      imageUrl: '',
      altText: '',
      caption: '',
      credit: ''
    });
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />

      {imageUrl ? (
        <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 group">
          <div className="aspect-video w-full max-h-64 overflow-hidden relative bg-slate-900/5">
            <img
              src={imageUrl}
              alt={altText || 'Featured preview'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).setAttribute(
                  'src',
                  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200'
                );
              }}
            />
            {/* Overlay buttons */}
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ImageIcon size={13} />
                <span>Library</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <X size={13} />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Image Metadata Inputs */}
          <div className="p-4 bg-white border-t border-slate-200 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <span>Image ALT Text</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[10px] ${altText.length > 0 ? 'text-emerald-600 font-semibold' : 'text-amber-600'}`}>
                  {altText.length > 0 ? '✓ SEO Alt text added' : 'Required for Google News & SEO'}
                </span>
              </div>
              <input
                type="text"
                value={altText}
                onChange={(e) => onChange({ imageUrl, altText: e.target.value, caption, credit })}
                placeholder="e.g., Doctor measuring patient blood pressure with sphygmomanometer"
                className={`w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 ${
                  altText.trim() ? 'border-slate-200 focus:ring-primary-500' : 'border-amber-300 bg-amber-50/30 focus:ring-amber-500'
                }`}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Accurate alt text is essential for screen readers, Google Image search, and Google News qualification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => onChange({ imageUrl, altText, caption: e.target.value, credit })}
                  placeholder="Displayed beneath article banner"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Photo Credit / Source (Optional)
                </label>
                <input
                  type="text"
                  value={credit}
                  onChange={(e) => onChange({ imageUrl, altText, caption, credit: e.target.value })}
                  placeholder="e.g., Newark Medical Clinical Archives / Unsplash"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 hover:border-primary-400 bg-slate-50/70 hover:bg-primary-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="py-6 flex flex-col items-center">
              <Loader2 size={32} className="text-primary-600 animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-700">
                Uploading to Cloudflare R2... {uploadProgress !== null ? `${uploadProgress}%` : ''}
              </p>
              <div className="w-48 bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-primary-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress || 20}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center mx-auto text-primary-600">
                <Upload size={22} />
              </div>
              <div className="text-xs font-semibold text-slate-800">
                <span>Click to upload</span> or drag and drop featured image
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                High-resolution JPEG, PNG, or WEBP (1200x675 recommended for Google News & Open Graph).
              </p>
              <div className="pt-2 flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon size={14} className="text-primary-600" />
                  <span>Choose from Library</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUrlInputOpen(!urlInputOpen)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <LinkIcon size={14} className="text-slate-600" />
                  <span>Enter Image URL</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
        }}
        disabled={isUploading}
        className="hidden"
      />

      {/* URL Input Bar */}
      {urlInputOpen && !imageUrl && (
        <form onSubmit={handleApplyDirectUrl} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-xs shadow-xs">
          <input
            type="url"
            placeholder="https://images.unsplash.com/... or https://..."
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            required
            className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Apply URL
          </button>
          <button
            type="button"
            onClick={() => setUrlInputOpen(false)}
            className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {uploadError && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        title="Select Featured Cover Image"
        onSelectImage={(url, selectedAlt) => {
          onChange({
            imageUrl: url,
            altText: selectedAlt || altText || 'Clinical health guide cover',
            caption,
            credit
          });
          setIsMediaPickerOpen(false);
        }}
      />
    </div>
  );
}
