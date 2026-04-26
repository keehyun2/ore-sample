import React from 'react';

function FileSelector({ files, selected, onSelect }) {
  // 파일명 알파벳 순 정렬
  // const sortedFiles = [...files].sort();

  const fileOrder = ['ore.xml', 'irswap.xml', 'market.txt', 'conventions.xml', 'curveconfig.xml', 'todaysmarket.xml', "pricingengine.xml", 'fixings.txt']; 

  const sortedFiles = [...files].sort((a, b) =>                   
    fileOrder.indexOf(a) - fileOrder.indexOf(b)
  );

  return (
    <div className="w-[180px] min-w-[180px] bg-white border-r border-gray-200 py-3 px-2 flex flex-col overflow-y-auto">
      <label className="font-semibold text-gray-600 mb-2 text-[0.7rem] uppercase tracking-wider">Select Input File:</label>
      <div className="flex flex-col gap-2">
        {sortedFiles.map((file) => (
          <button
            key={file}
            className={`py-2 px-3 border rounded bg-white cursor-pointer text-left text-xs transition-all ${
              selected === file
                ? '!bg-blue-600 !text-white border-blue-600 font-medium'
                : '!text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-blue-600'
            }`}
            onClick={() => onSelect(file)}
          >
            {file}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FileSelector;
