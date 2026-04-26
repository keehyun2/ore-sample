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
    <div className="h-full overflow-auto">
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlight}
        disabled={disabled}
        padding={12}
        style={{
          fontFamily: 'monospace',
          fontSize: 13,
          lineHeight: 1.5,
          minHeight: '100%',
        }}
        textareaClassName="w-full h-full border-none outline-none resize-none font-mono bg-transparent"
      />
    </div>
  );
}

export default CodeEditor;
