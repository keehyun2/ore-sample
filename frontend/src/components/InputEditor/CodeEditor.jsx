import React, { useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';

function CodeEditor({ value, onChange, disabled }) {
  useEffect(() => {
    Prism.highlightAll();
  }, [value]);

  const highlight = (code) => {
    return Prism.highlight(code, Prism.languages.markup, 'markup');
  };

  return (
    <Editor
      value={value}
      onValueChange={onChange}
      highlight={highlight}
      disabled={disabled}
      padding={16}
      style={{
        fontFamily: '"Fira Code", "Fira Mono", Monaco, "Menlo", "Ubuntu Mono", monospace',
        fontSize: 14,
        lineHeight: 1.6,
        minHeight: 400,
        backgroundColor: '#2d2d2d',
        color: '#ccc',
      }}
      textareaClassName="code-editor-textarea"
    />
  );
}

export default CodeEditor;
