import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon, Image as ImageIcon, Heading1, Heading2, Code, Upload, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { apiUpload } from '../../utils/api';

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
        title="Quote"
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

      {/* Image Upload Button - supports both URL and file upload */}
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
        // Avoid duplicate extension name 'link' with explicit Link extension below.
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
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
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
      <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary-200 focus-within:border-primary-500 transition">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror {
          min-height: 300px;
        }
        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 1.2;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.3;
          margin-top: 1.25rem;
          margin-bottom: 0.625rem;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1rem;
          color: #6b7280;
          font-style: italic;
          margin: 1rem 0;
        }
        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        .ProseMirror pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
}
