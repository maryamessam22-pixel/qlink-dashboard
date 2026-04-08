import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './RichTextEditor.css';

/**
 * Dark-themed rich text editor using Quill.js directly.
 * This avoids the 'findDOMNode is not a function' error caused by 
 * react-quill compatibility issues with React 18/19.
 */
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

    // Set initial value
    if (value) {
      quill.root.innerHTML = value;
    }

    // Handle changes
    quill.on('text-change', () => {
      const html = quill.root.innerHTML;
      if (onChange) {
        // Only trigger onChange if the content actually changed to avoid loops
        onChange(html === '<p><br></p>' ? '' : html);
      }
    });

    return () => {
      // Cleanup if necessary (Quill doesn't have a formal destroy but we can clear the ref)
      quillRef.current = null;
    };
  }, [mounted, placeholder, readOnly]); // Only init once on mount

  // Sync value from props if it changes externally
  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const currentHtml = quillRef.current.root.innerHTML;
      if (value !== currentHtml && !(value === '' && currentHtml === '<p><br></p>')) {
        quillRef.current.root.innerHTML = value || '';
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
