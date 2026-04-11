import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { normalizeRichTextHtml } from '../../lib/richTextHtml';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder, rtl = false, className = '', readOnly = false }) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      placeholder: placeholder,
      readOnly: readOnly,
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['link'],
          ['clean'],
        ],
      },
    });

    quillRef.current = quill;

    // Set initial value (empty → Quill’s default blank doc, not literal <p></p>)
    const initial = normalizeRichTextHtml(value);
    quill.root.innerHTML = initial === '' ? '<p><br></p>' : value;

    // Handle changes — persist empty as '' (no <p></p> / <p><br></p>)
    quill.on('text-change', () => {
      const html = quill.root.innerHTML;
      if (onChange) onChange(normalizeRichTextHtml(html));
    });

    return () => {
      // Cleanup if necessary (Quill doesn't have a formal destroy but we can clear the ref)
      quillRef.current = null;
    };
  }, [mounted, placeholder, readOnly]); // Only init once on mount

  // Sync value from props if it changes externally (compare normalized, avoid Quill empty flicker)
  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const incomingNorm = normalizeRichTextHtml(value);
      const displayHtml = incomingNorm === '' ? '<p><br></p>' : String(value);
      const curNorm = normalizeRichTextHtml(quillRef.current.root.innerHTML);
      if (incomingNorm !== curNorm) {
        quillRef.current.root.innerHTML = displayHtml;
      }
    }
  }, [value]);

  const wrapClass = `rich-text-editor-wrap ${rtl ? 'rtl' : 'ltr'} ${className}`.trim();

  return (
    <div className={wrapClass}>
      {!mounted && <div className="rich-text-editor-skeleton" aria-hidden />}
      <div 
        ref={containerRef} 
        className="rich-text-quill" 
        style={{ display: mounted ? 'block' : 'none' }}
      />
    </div>
  );
};

export default RichTextEditor;
