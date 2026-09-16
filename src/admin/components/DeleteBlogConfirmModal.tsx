import React from 'react';
import { AlertTriangle, Archive, Trash2, X, ShieldCheck } from 'lucide-react';
import { BlogPost } from '../../types';

interface DeleteBlogConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: BlogPost | Partial<BlogPost>;
  onArchiveInstead: () => void | Promise<void>;
  onDeletePermanently: () => void | Promise<void>;
  isProcessing?: boolean;
}

export default function DeleteBlogConfirmModal({
  isOpen,
  onClose,
  blog,
  onArchiveInstead,
  onDeletePermanently,
  isProcessing = false
}: DeleteBlogConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-start justify-between">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
            <AlertTriangle size={24} />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900">
            Are you sure you want to delete this blog?
          </h3>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
            <div className="font-semibold text-slate-800 line-clamp-1">{blog.title || 'Untitled Article'}</div>
            <div className="text-slate-500 flex items-center gap-2">
              <span>Status: <strong>{blog.status || 'draft'}</strong></span>
              <span>•</span>
              <span className="font-mono">/blog/{blog.slug}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Permanent deletion removes the content and SEO records from Firestore entirely. If you want to take this post offline while preserving historical drafts, stats, and search logs, choose <strong>Archive Instead</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onArchiveInstead}
            disabled={isProcessing}
            className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Archive size={15} />
            <span>Archive Instead (Recommended)</span>
          </button>

          <button
            type="button"
            onClick={onDeletePermanently}
            disabled={isProcessing}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={15} />
            <span>Delete Permanently</span>
          </button>
        </div>

      </div>
    </div>
  );
}
