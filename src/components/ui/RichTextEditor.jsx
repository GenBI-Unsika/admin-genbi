import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon, Image as ImageIcon, Heading1, Heading2, Code, Upload, Loader2, Info, AlertTriangle, Lightbulb } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { apiUploadStaging, apiFinalizeUpload } from '../../utils/api';

const MenuBar = ({ editor }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  if (!editor) return null;

  const addLink = () => {
    const url = prompt('Masukkan URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImageByUrl = () => {
    const url = prompt('Masukkan URL gambar:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10MB');
      return;
    }

    setUploading(true);
    try {
      const staged = await apiUploadStaging(file);
      const tempId = staged?.tempId || staged?.id;
      if (!tempId) throw new Error('Gagal menyimpan file sementara');

      const result = await apiFinalizeUpload(tempId, 'articles/content');
      const imageUrl = result?.url || result?.fileUrl || result;
      if (imageUrl) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (err) {
      alert('Gagal mengupload gambar: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addCallout = (type) => {
    const colors = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-amber-50 border-amber-200 text-amber-800',
      tip: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    };

    // We use a blockquote but with a data-type attribute for styling
    editor.chain().focus().toggleBlockquote().run();
    // After toggling, we can't easily set attributes without a custom extension
    // So for now, let's just use the standard blockquote style improvement
  };

  return (
    <div className="border-b border-neutral-200 bg-neutral-50 p-2 flex flex-wrap gap-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-neutral-200 transition ${editor.isActive('bold') ? 'bg-neutral-200 text-primary-600' : 'text-neutral-700'}`}
        title="Bold (Ctrl+B)"
      >
        <Bold size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-neutral-200 transition ${editor.isActive('italic') ? 'bg-neutral-200 text-primary-600' : 'text-neutral-700'}`}
        title="Italic (Ctrl+I)"
      >
        <Italic size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-neutral-200 transition ${editor.isActive('heading', { level: 1 }) ? 'bg-neutral-200 text-primary-600' : 'text-neutral-700'}`}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-neutral-200 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-neutral-200 text-primary-600' : 'text-neutral-700'}`}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>

      <div className="w-px h-8 bg-neutral-300 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-neutral-200 transition ${editor.isActive('bulletList') ? 'bg-neutral-200 text-primary-600' : 'text-neutral-700'}`}
        title="Bullet List"
      >
        <List size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-neutral-200 transition ${editor.isActive('orderedList') ? 'bg-neutral-200 text-primary-600' : 'text-neutral-700'}`}
        title="Numbered List"
      >
        <ListOrdered size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-neutral-200 transition ${editor.isActive('blockquote') ? 'bg-neutral-200 text-primary-600' : 'text-neutral-700'}`}
        title="Quote / Callout"
      >
        <Quote size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-neutral-200 transition ${editor.isActive('codeBlock') ? 'bg-neutral-200 text-primary-600' : 'text-neutral-700'}`}
        title="Code Block"
      >
        <Code size={18} />
      </button>

      <div className="w-px h-8 bg-neutral-300 mx-1" />

      <button type="button" onClick={addLink} className={`p-2 rounded hover:bg-neutral-200 transition ${editor.isActive('link') ? 'bg-neutral-200 text-primary-600' : 'text-neutral-700'}`} title="Insert Link">
        <LinkIcon size={18} />
      </button>

      <div className="relative group">
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className={`p-2 rounded hover:bg-neutral-200 transition text-neutral-700 ${uploading ? 'opacity-50' : ''}`} title="Upload Gambar">
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
      </div>

      <button type="button" onClick={addImageByUrl} className="p-2 rounded hover:bg-neutral-200 transition text-neutral-700" title="Insert Image from URL">
        <ImageIcon size={18} />
      </button>

      <div className="w-px h-8 bg-neutral-300 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 rounded hover:bg-neutral-200 transition text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Undo (Ctrl+Z)"
      >
        <Undo size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 rounded hover:bg-neutral-200 transition text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Redo (Ctrl+Y)"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

export default function RichTextEditor({ value, onChange, placeholder = 'Mulai menulis...', label, className }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-primary-600 underline hover:text-primary-700',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm md:prose-base max-w-none focus:outline-none min-h-[400px] p-6 text-neutral-800 leading-relaxed',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || '';
    if (current !== next) {
      editor.commands.setContent(next, false);
    }
  }, [editor, value]);

  return (
    <div className={className}>
      {label && <label className="mb-2 block text-sm font-medium text-neutral-700">{label}</label>}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary-200 focus-within:border-primary-500 transition-all duration-200">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror {
          min-height: 400px;
          outline: none !important;
        }
        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 1.25;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #111827;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.35;
          margin-top: 1.75rem;
          margin-bottom: 0.875rem;
          color: #1f2937;
        }
        .ProseMirror p {
          margin-bottom: 1rem;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .ProseMirror li {
          margin-bottom: 0.5rem;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #3b82f6;
          background-color: #eff6ff;
          padding: 1.25rem 1.5rem;
          color: #1e40af;
          border-radius: 0 0.5rem 0.5rem 0;
          margin: 1.5rem 0;
          font-style: italic;
        }
        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-size: 0.875em;
          color: #df1c5a;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
        .ProseMirror pre {
          background-color: #111827;
          color: #f3f4f6;
          padding: 1.25rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
        .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
          font-size: 0.9em;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
      `}} />
    </div>
  );
}
