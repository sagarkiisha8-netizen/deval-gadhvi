import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { 
  Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3, 
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, 
  Undo, Redo, Code, Eye, Sparkles, RemoveFormatting, 
  Table as TableIcon, Video as VideoIcon, Minus, Type
} from 'lucide-react';
import MediaPickerModal from './MediaPickerModal';

interface RichTextEditorProps {
  value: string;
  onChange: (sanitizedHtml: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your clinical article content here...',
  minHeight = '380px'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'code' | 'preview'>('visual');
  const [rawHtml, setRawHtml] = useState<string>(value || '');
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(2);

  // Keep internal raw state in sync if value changes externally
  useEffect(() => {
    if (value !== rawHtml) {
      setRawHtml(value || '');
      if (editorRef.current && viewMode === 'visual') {
        if (editorRef.current.innerHTML !== value) {
          editorRef.current.innerHTML = value || '';
        }
      }
    }
  }, [value]);

  // Initial content mount
  useEffect(() => {
    if (editorRef.current && viewMode === 'visual') {
      if (!editorRef.current.innerHTML && rawHtml) {
        editorRef.current.innerHTML = rawHtml;
      }
    }
  }, [viewMode]);

  const sanitizeAndNotify = (html: string) => {
    // Enforce Rule: The blog title is the primary H1. Convert any accidental H1 in body to H2.
    let cleanedHtml = html.replace(/<h1(\s+[^>]*)?>/gi, '<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">')
                          .replace(/<\/h1>/gi, '</h2>');

    // Sanitize with DOMPurify allowing semantic article formatting (H1 strictly excluded)
    const clean = DOMPurify.sanitize(cleanedHtml, {
      ALLOWED_TAGS: [
        'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'u', 's',
        'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'br', 'hr', 'table', 'thead',
        'tbody', 'tr', 'th', 'td', 'code', 'pre', 'div', 'figure', 'figcaption', 'iframe'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'width', 'height', 
        'loading', 'allowfullscreen', 'frameborder', 'referrerpolicy'
      ]
    });
    setRawHtml(clean);
    onChange(clean);
  };

  const handleInput = () => {
    if (editorRef.current) {
      sanitizeAndNotify(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, arg?: string) => {
    if (viewMode !== 'visual') return;
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const formatBlock = (tag: string) => {
    // Never allow formatBlock H1
    if (tag.toLowerCase() === 'h1') tag = 'h2';
    execCommand('formatBlock', `<${tag}>`);
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;
    const cleanUrl = linkUrl.startsWith('http') || linkUrl.startsWith('/') || linkUrl.startsWith('mailto:') 
      ? linkUrl 
      : `https://${linkUrl}`;

    if (viewMode === 'visual') {
      if (linkText) {
        const linkHtml = `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-primary-600 underline font-medium hover:text-primary-700">${linkText}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
      } else {
        execCommand('createLink', cleanUrl);
      }
      handleInput();
    } else {
      const linkTag = `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${linkText || linkUrl}</a>`;
      const updated = rawHtml + linkTag;
      setRawHtml(updated);
      sanitizeAndNotify(updated);
    }
    setLinkUrl('');
    setLinkText('');
    setLinkInputOpen(false);
  };

  const handleInsertImage = (url: string, altText?: string, caption?: string, credit?: string) => {
    const figcaptionContent = [caption, credit ? `(Photo: ${credit})` : ''].filter(Boolean).join(' ');
    const imgHtml = `<figure class="my-6"><img src="${url}" alt="${altText || 'Clinical healthcare illustration'}" class="rounded-2xl w-full max-h-[480px] object-cover shadow-sm border border-slate-200" loading="lazy" />${
      figcaptionContent ? `<figcaption class="text-xs text-slate-500 mt-2 text-center italic">${figcaptionContent}</figcaption>` : ''
    }</figure><p></p>`;
    
    if (viewMode === 'visual') {
      if (editorRef.current) {
        editorRef.current.focus();
      }
      document.execCommand('insertHTML', false, imgHtml);
      handleInput();
    } else {
      const updated = rawHtml + '\n' + imgHtml;
      setRawHtml(updated);
      sanitizeAndNotify(updated);
    }
    setIsMediaModalOpen(false);
  };

  const handleInsertTable = (e: React.FormEvent) => {
    e.preventDefault();
    let tableHtml = '<div class="my-6 overflow-x-auto"><table class="w-full border-collapse border border-slate-300 text-sm text-slate-800">';
    tableHtml += '<thead><tr class="bg-slate-100">';
    for (let c = 1; c <= tableCols; c++) {
      tableHtml += `<th class="border border-slate-300 p-2.5 font-semibold text-left">Header ${c}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';
    for (let r = 1; r <= tableRows; r++) {
      tableHtml += `<tr class="${r % 2 === 0 ? 'bg-slate-50' : 'bg-white'}">`;
      for (let c = 1; c <= tableCols; c++) {
        tableHtml += `<td class="border border-slate-300 p-2.5">Row ${r} Col ${c}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table></div><p></p>';

    if (viewMode === 'visual') {
      if (editorRef.current) editorRef.current.focus();
      document.execCommand('insertHTML', false, tableHtml);
      handleInput();
    } else {
      const updated = rawHtml + '\n' + tableHtml;
      setRawHtml(updated);
      sanitizeAndNotify(updated);
    }
    setTableModalOpen(false);
  };

  const handleInsertVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;
    let embedUrl = videoUrl;
    if (videoUrl.includes('youtube.com/watch?v=')) {
      embedUrl = videoUrl.replace('watch?v=', 'embed/');
    } else if (videoUrl.includes('youtu.be/')) {
      embedUrl = videoUrl.replace('youtu.be/', 'youtube.com/embed/');
    } else if (videoUrl.includes('vimeo.com/')) {
      embedUrl = videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/');
    }

    const videoHtml = `<div class="my-6 aspect-video w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200"><iframe src="${embedUrl}" class="w-full h-full" allowfullscreen frameborder="0" loading="lazy" title="Medical video explanation"></iframe></div><p></p>`;

    if (viewMode === 'visual') {
      if (editorRef.current) editorRef.current.focus();
      document.execCommand('insertHTML', false, videoHtml);
      handleInput();
    } else {
      const updated = rawHtml + '\n' + videoHtml;
      setRawHtml(updated);
      sanitizeAndNotify(updated);
    }
    setVideoUrl('');
    setVideoModalOpen(false);
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center justify-between gap-1.5 text-xs select-none">
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => execCommand('undo')}
            disabled={viewMode !== 'visual'}
            title="Undo (Ctrl+Z)"
            className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors disabled:opacity-40"
          >
            <Undo size={15} />
          </button>
          <button
            type="button"
            onClick={() => execCommand('redo')}
            disabled={viewMode !== 'visual'}
            title="Redo (Ctrl+Y)"
            className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors disabled:opacity-40"
          >
            <Redo size={15} />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Headings (Strictly H2, H3, H4 - H1 is title only) */}
          <button
            type="button"
            onClick={() => formatBlock('h2')}
            disabled={viewMode !== 'visual'}
            title="Section Heading (H2)"
            className="px-2 py-1 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1 font-bold text-xs"
          >
            <Heading2 size={15} />
            <span>H2</span>
          </button>
          <button
            type="button"
            onClick={() => formatBlock('h3')}
            disabled={viewMode !== 'visual'}
            title="Sub-heading (H3)"
            className="px-2 py-1 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1 font-bold text-xs"
          >
            <Heading3 size={15} />
            <span>H3</span>
          </button>
          <button
            type="button"
            onClick={() => formatBlock('h4')}
            disabled={viewMode !== 'visual'}
            title="Minor Subheading (H4)"
            className="px-2 py-1 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors disabled:opacity-40 font-semibold text-[11px]"
          >
            H4
          </button>
          <button
            type="button"
            onClick={() => formatBlock('p')}
            disabled={viewMode !== 'visual'}
            title="Paragraph"
            className="px-2 py-1 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40 text-xs font-medium flex items-center gap-1"
          >
            <Type size={14} />
            <span>P</span>
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Inline Styles */}
          <button
            type="button"
            onClick={() => execCommand('bold')}
            disabled={viewMode !== 'visual'}
            title="Bold (Ctrl+B)"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            disabled={viewMode !== 'visual'}
            title="Italic (Ctrl+I)"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            disabled={viewMode !== 'visual'}
            title="Underline (Ctrl+U)"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <UnderlineIcon size={15} />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Lists & Quote */}
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            disabled={viewMode !== 'visual'}
            title="Bullet List"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <List size={15} />
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            disabled={viewMode !== 'visual'}
            title="Numbered List"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <ListOrdered size={15} />
          </button>
          <button
            type="button"
            onClick={() => formatBlock('blockquote')}
            disabled={viewMode !== 'visual'}
            title="Medical Callout / Quote"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <Quote size={15} />
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertHorizontalRule')}
            disabled={viewMode !== 'visual'}
            title="Horizontal Divider"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <Minus size={15} />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Link & Media */}
          <button
            type="button"
            onClick={() => setLinkInputOpen(!linkInputOpen)}
            title="Insert Link"
            className={`p-1.5 rounded-lg transition-colors ${
              linkInputOpen ? 'bg-primary-100 text-primary-700' : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <LinkIcon size={15} />
          </button>
          <button
            type="button"
            onClick={() => setIsMediaModalOpen(true)}
            title="Embed Image"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <ImageIcon size={15} />
            <span className="hidden sm:inline">Image</span>
          </button>
          <button
            type="button"
            onClick={() => setTableModalOpen(true)}
            title="Insert Comparison Table"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <TableIcon size={15} />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            type="button"
            onClick={() => setVideoModalOpen(true)}
            title="Embed Video (YouTube / Vimeo)"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <VideoIcon size={15} />
            <span className="hidden sm:inline">Video</span>
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => execCommand('removeFormat')}
            disabled={viewMode !== 'visual'}
            title="Clear Formatting"
            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors disabled:opacity-40"
          >
            <RemoveFormatting size={15} />
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('visual')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'visual' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              viewMode === 'code' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code size={13} />
            <span>HTML</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              viewMode === 'preview' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Link Popover Bar */}
      {linkInputOpen && (
        <form onSubmit={handleInsertLink} className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="Link text (e.g. Clinical Study on Hypertension)"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs flex-1 min-w-[140px]"
          />
          <input
            type="url"
            placeholder="URL (e.g. https://pubmed.ncbi.nlm.nih.gov/... or /services/ekg)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            required
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs flex-2 min-w-[200px]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
          >
            Insert Link
          </button>
          <button
            type="button"
            onClick={() => setLinkInputOpen(false)}
            className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Table Insertion Modal */}
      {tableModalOpen && (
        <form onSubmit={handleInsertTable} className="p-3 bg-primary-50 border-b border-primary-200 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-primary-900">Insert Table:</span>
          <label className="flex items-center gap-1">
            <span>Columns:</span>
            <input
              type="number"
              min="1"
              max="6"
              value={tableCols}
              onChange={(e) => setTableCols(parseInt(e.target.value) || 2)}
              className="w-14 px-2 py-1 bg-white border border-primary-300 rounded-md text-center"
            />
          </label>
          <label className="flex items-center gap-1">
            <span>Rows:</span>
            <input
              type="number"
              min="1"
              max="15"
              value={tableRows}
              onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
              className="w-14 px-2 py-1 bg-white border border-primary-300 rounded-md text-center"
            />
          </label>
          <button
            type="submit"
            className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-xs cursor-pointer"
          >
            Insert Table
          </button>
          <button
            type="button"
            onClick={() => setTableModalOpen(false)}
            className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Video Insertion Modal */}
      {videoModalOpen && (
        <form onSubmit={handleInsertVideo} className="p-3 bg-amber-50 border-b border-amber-200 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-amber-900">Embed Video:</span>
          <input
            type="url"
            placeholder="YouTube or Vimeo URL (e.g. https://www.youtube.com/watch?v=...)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs flex-1 min-w-[240px]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold text-xs cursor-pointer"
          >
            Embed Video
          </button>
          <button
            type="button"
            onClick={() => setVideoModalOpen(false)}
            className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Editor Body */}
      {viewMode === 'visual' && (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          style={{ minHeight }}
          className="p-6 focus:outline-none focus:ring-0 prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-h4:text-base prose-h4:mt-3 prose-h4:mb-1 prose-p:leading-relaxed prose-p:mb-4 prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600 prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:mb-1 text-slate-800 text-sm leading-relaxed"
          data-placeholder={placeholder}
        />
      )}

      {viewMode === 'code' && (
        <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs">
          <textarea
            value={rawHtml}
            onChange={(e) => {
              setRawHtml(e.target.value);
              sanitizeAndNotify(e.target.value);
            }}
            style={{ minHeight }}
            className="w-full h-full bg-transparent text-emerald-400 focus:outline-none resize-y font-mono leading-relaxed"
            placeholder="<p>Write raw HTML here...</p>"
          />
        </div>
      )}

      {viewMode === 'preview' && (
        <div 
          style={{ minHeight }}
          className="p-6 bg-slate-50 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-50 text-primary-700 mb-4">
              Article Body Preview
            </div>
            <div 
              className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rawHtml) }}
            />
          </div>
        </div>
      )}

      {/* Footer Info & Character / Word counts */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-slate-600">
          <Sparkles size={13} className="text-primary-600" />
          <span>Sanitized with DOMPurify. Main article title serves as H1; body is strictly H2/H3/H4.</span>
        </span>
        <div className="flex items-center gap-3 font-mono text-slate-600">
          <span>Words: {rawHtml.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length}</span>
          <span>Chars: {rawHtml.replace(/<[^>]*>/g, '').length}</span>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        title="Select Image to Embed in Article"
        onSelectImage={(url, altText, caption, credit) => handleInsertImage(url, altText, caption, credit)}
      />
    </div>
  );
}
