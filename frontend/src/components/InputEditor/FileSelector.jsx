import React from 'react';

function FileSelector({ files, selected, onSelect }) {
  return (
    <div className="file-selector">
      <label>Select Input File:</label>
      <select value={selected} onChange={(e) => onSelect(e.target.value)}>
        {files.map((file) => (
          <option key={file} value={file}>
            {file}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FileSelector;
