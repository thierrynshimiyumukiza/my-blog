import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { db, storage } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

const categories = [
  { value: '', label: 'Select Category' },
  { value: 'Tech', label: 'Tech' },
  { value: 'Lifestyle', label: 'Lifestyle' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Other', label: 'Other' },
];

const ToolbarButton = ({ onClick, icon, label, active }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors ${active ? 'bg-blue-200 dark:bg-gray-700' : ''}`}
    aria-label={label}
  >
    {icon}
  </button>
);

const EmojiPicker = ({ onSelect }) => {
  const emojis = ['😀', '😎', '🔥', '💡', '🚀', '🤖', '🎉', '🦾', '📝', '🔒', '💻', '🧠', '⚡', '🔗', '📷'];
  return (
    <div className="absolute z-50 bg-white dark:bg-gray-800 border rounded shadow p-2 flex flex-wrap gap-1">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="text-xl hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1"
          onClick={() => onSelect(emoji)}
          type="button"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

const getWordCount = (html) => {
  if (!html) return 0;
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
};

const getReadTime = (html) => {
  const words = getWordCount(html);
  return Math.max(1, Math.round(words / 200));
};

const Editor = () => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('editorTheme') || 'light');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [autosaveMsg, setAutosaveMsg] = useState('');
  const [versionHistory, setVersionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const editorRef = useRef(null);

  // Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Underline,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '<h2>New Post</h2><p>Start writing your post here...</p>',
    editorProps: {
      attributes: {
        class: 'min-h-[200px] outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      // Autosave to localStorage
      const data = {
        title,
        excerpt,
        category,
        tags,
        content: editor.getHTML(),
      };
      localStorage.setItem('draft', JSON.stringify(data));
      setAutosaveMsg('Draft autosaved');
      setTimeout(() => setAutosaveMsg(''), 1200);

      // Save version history
      setVersionHistory((prev) => [
        ...prev.slice(-9),
        { content: editor.getHTML(), timestamp: new Date().toISOString() },
      ]);
    },
  });

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('draft');
    if (draft) {
      const data = JSON.parse(draft);
      setTitle(data.title || '');
      setExcerpt(data.excerpt || '');
      setCategory(data.category || '');
      setTags(data.tags || []);
      if (editor && data.content) editor.commands.setContent(data.content);
    }
  }, [editor]);

  // Theme switch
  useEffect(() => {
    localStorage.setItem('editorTheme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Voice-to-text
  useEffect(() => {
    let recognition;
    if (voiceActive && 'webkitSpeechRecognition' in window) {
      recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (editor) {
          editor.commands.insertContent(transcript);
        }
      };
      recognition.start();
    }
    return () => {
      if (recognition) recognition.stop();
    };
    // eslint-disable-next-line
  }, [voiceActive]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const addImageToEditor = async () => {
    if (!image) return null;
    const storageRef = ref(storage, `images/${Date.now()}-${image.name}`);
    await uploadBytes(storageRef, image);
    const url = await getDownloadURL(storageRef);
    editor.chain().focus().setImage({ src: url }).run();
    return url;
  };

  const savePost = async () => {
    if (!title || !excerpt || !category || !editor) {
      alert('Please fill in all fields.');
      return;
    }
    setSaving(true);
    const content = editor.getHTML();
    let imageUrl = null;
    if (image) {
      imageUrl = await addImageToEditor();
    }
    try {
      await addDoc(collection(db, 'posts'), {
        title,
        excerpt,
        category,
        tags,
        content,
        imageUrl: imageUrl || null,
        createdAt: new Date(),
      });
      alert('Post saved!');
      setTitle('');
      setExcerpt('');
      setCategory('');
      setTags([]);
      setImage(null);
      editor.commands.setContent('<h2>New Post</h2><p>Start writing your post here...</p>');
      localStorage.removeItem('draft');
    } catch (error) {
      alert('Error saving post.');
      console.error('Error saving post:', error);
    }
    setSaving(false);
  };

  // Tagging
  const handleTagInput = (e) => {
    setTagInput(e.target.value);
    if (e.target.value.endsWith(',')) {
      const newTag = e.target.value.replace(',', '').trim();
      if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput('');
    }
  };
  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  // Export to Markdown
  const exportMarkdown = () => {
    const html = editor.getHTML();
    // Simple HTML to Markdown (for demo)
    let md = html
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<u>(.*?)<\/u>/g, '_$1_')
      .replace(/<li>(.*?)<\/li>/g, '- $1\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]+>/g, '');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'post'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to PDF
  const exportPDF = () => {
    window.print();
  };

  // Accessibility checker (simple)
  const checkAccessibility = () => {
    const html = editor.getHTML();
    const missingAlts = (html.match(/<img(?![^>]*alt=)/g) || []).length;
    if (missingAlts > 0) {
      alert(`Accessibility: ${missingAlts} image(s) missing alt text.`);
    } else {
      alert('Accessibility: All images have alt text!');
    }
  };

  // AI Writing Assistant (demo)
  const aiSuggest = () => {
    if (editor) {
      editor.commands.insertContent('🤖 [AI Suggestion: Expand on this idea with more technical details.]');
    }
  };

  // Restore version
  const restoreVersion = (content) => {
    if (editor) editor.commands.setContent(content);
    setShowHistory(false);
  };

  // Markdown Preview with Prism Highlight
  const Preview = () => {
    useEffect(() => {
      Prism.highlightAll();
    }, [editor]);
    return (
      <div className="prose dark:prose-invert max-w-none p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 min-h-[200px]">
        <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
      </div>
    );
  };

  return (
    <div className={`container mx-auto max-w-2xl p-6 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center flex-1">Write a New Post</h1>
        <div className="flex gap-2 ml-4">
          <button
            className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Editor Theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button
            className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs"
            onClick={() => setShowPreview(!showPreview)}
            title="Toggle Preview"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs"
            onClick={exportMarkdown}
            title="Export to Markdown"
          >
            MD
          </button>
          <button
            className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs"
            onClick={exportPDF}
            title="Export to PDF"
          >
            PDF
          </button>
          <button
            className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs"
            onClick={checkAccessibility}
            title="Accessibility Checker"
          >
            ♿
          </button>
          <button
            className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs"
            onClick={() => setShowHistory(!showHistory)}
            title="Version History"
          >
            🕑
          </button>
          <button
            className={`px-2 py-1 rounded text-xs ${voiceActive ? 'bg-green-300 dark:bg-green-700' : 'bg-gray-200 dark:bg-gray-700'}`}
            onClick={() => setVoiceActive(!voiceActive)}
            title="Voice to Text"
          >
            🎤
          </button>
        </div>
      </div>
      {autosaveMsg && <div className="text-green-500 text-xs mb-2">{autosaveMsg}</div>}
      <input
        type="text"
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 mb-3 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 text-lg font-semibold"
      />
      <input
        type="text"
        placeholder="Excerpt"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        className="w-full p-3 mb-3 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-3 mb-3 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
      >
        {categories.map(cat => (
          <option key={cat.value} value={cat.value}>{cat.label}</option>
        ))}
      </select>
      {/* Tags */}
      <div className="mb-3">
        <label className="block mb-1 text-gray-700 dark:text-gray-300 font-medium">Tags</label>
        <div className="flex flex-wrap gap-2 mb-1">
          {tags.map(tag => (
            <span key={tag} className="bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-blue-100 px-2 py-0.5 rounded text-xs flex items-center">
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-1 text-red-500 hover:text-red-700" title="Remove tag">&times;</button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add tag and press comma"
          value={tagInput}
          onChange={handleTagInput}
          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 text-sm"
        />
      </div>
      {/* Cover Image */}
      <div className="mb-4">
        <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Add Cover Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full" />
        {image && (
          <div className="mt-2">
            <img src={URL.createObjectURL(image)} alt="Preview" className="h-32 rounded shadow" />
          </div>
        )}
      </div>
      {/* Toolbar */}
      {editor && !showPreview && (
        <div className="flex flex-wrap gap-2 mb-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg relative">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            icon={<b>B</b>}
            label="Bold"
            active={editor.isActive('bold')}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            icon={<i>I</i>}
            label="Italic"
            active={editor.isActive('italic')}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            icon={<u>U</u>}
            label="Underline"
            active={editor.isActive('underline')}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            icon={<s>S</s>}
            label="Strike"
            active={editor.isActive('strike')}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            icon={<span className="font-bold">H1</span>}
            label="Heading 1"
            active={editor.isActive('heading', { level: 1 })}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            icon={<span className="font-bold">H2</span>}
            label="Heading 2"
            active={editor.isActive('heading', { level: 2 })}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            icon={<span>• List</span>}
            label="Bullet List"
            active={editor.isActive('bulletList')}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            icon={<span>1. List</span>}
            label="Ordered List"
            active={editor.isActive('orderedList')}
          />
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Enter image URL');
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
            icon={<span>🖼️</span>}
            label="Insert Image"
            active={editor.isActive('image')}
          />
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Enter link URL');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            icon={<span>🔗</span>}
            label="Insert Link"
            active={editor.isActive('link')}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            icon={<span>❌🔗</span>}
            label="Remove Link"
            active={editor.isActive('link')}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            icon={<span>📊</span>}
            label="Insert Table"
            active={editor.isActive('table')}
          />
          <ToolbarButton
            onClick={() => setShowEmoji(!showEmoji)}
            icon={<span>😊</span>}
            label="Emoji"
            active={showEmoji}
          />
          <ToolbarButton
            onClick={aiSuggest}
            icon={<span>🤖</span>}
            label="AI Suggest"
          />
          {showEmoji && (
            <div className="absolute top-12 left-0">
              <EmojiPicker
                onSelect={emoji => {
                  editor.chain().focus().insertContent(emoji).run();
                  setShowEmoji(false);
                }}
              />
            </div>
          )}
        </div>
      )}
      {/* Editor or Preview */}
      {editor && !showPreview && (
        <EditorContent
          editor={editor}
          className="border p-4 rounded-lg mb-4 prose dark:prose-invert max-w-none dark:bg-gray-800 dark:text-gray-100 min-h-[200px]"
          ref={editorRef}
        />
      )}
      {editor && showPreview && <Preview />}
      {/* Word Count & Read Time */}
      {editor && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>Word count: {getWordCount(editor.getHTML())}</span>
          <span>Read time: {getReadTime(editor.getHTML())} min</span>
        </div>
      )}
      {/* Version History */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-lg w-full shadow-lg">
            <h2 className="text-lg font-bold mb-2">Version History</h2>
            <div className="max-h-64 overflow-y-auto">
              {versionHistory.map((v, i) => (
                <div key={i} className="mb-2 border-b pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{new Date(v.timestamp).toLocaleString()}</span>
                    <button
                      className="text-blue-500 hover:underline text-xs"
                      onClick={() => restoreVersion(v.content)}
                    >
                      Restore
                    </button>
                  </div>
                  <div className="prose dark:prose-invert max-w-none text-xs" dangerouslySetInnerHTML={{ __html: v.content }} />
                </div>
              ))}
            </div>
            <button className="mt-2 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700" onClick={() => setShowHistory(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      <button
        onClick={savePost}
        disabled={saving}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold w-full mt-2"
      >
        {saving ? 'Saving...' : 'Save Post'}
      </button>
    </div>
  );
};

export default Editor;