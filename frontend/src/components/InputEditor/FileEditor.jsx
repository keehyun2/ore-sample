import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import CodeEditor from './CodeEditor';

function FileEditor({ filename, onSave }) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadFile();
  }, [filename]);

  const loadFile = async () => {
    setLoading(true);
    try {
      const data = await api.getInputFile(filename);
      setContent(data.content);
      setOriginalContent(data.content);
      setMessage(null);
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to load file: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateInputFile(filename, content);
      setOriginalContent(content);
      setMessage({ type: 'success', text: 'File saved successfully' });
      setTimeout(() => setMessage(null), 2000);
      if (onSave) onSave();
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to save file: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setContent(originalContent);
    setMessage(null);
  };

  if (loading) {
    return <div className="file-editor loading">Loading file...</div>;
  }

  const hasChanges = content !== originalContent;

  return (
    <div className="file-editor">
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      <div className="editor-actions">
        <h3>{filename}</h3>
        <div className="buttons">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="save-btn"
          >
            {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
          </button>
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="reset-btn"
          >
            Reset
          </button>
        </div>
      </div>
      <CodeEditor
        value={content}
        onChange={setContent}
        disabled={loading}
      />
    </div>
  );
}

export default FileEditor;
