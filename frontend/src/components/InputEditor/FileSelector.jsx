import PropTypes from 'prop-types'

function FileSelector({ files, selected, onSelect }) {
  // 파일명 알파벳 순 정렬
  // const sortedFiles = [...files].sort();

  const fileOrder = [
    'ore.xml',
    'irswap.xml',
    'market.txt',
    'conventions.xml',
    'curveconfig.xml',
    'todaysmarket.xml',
    'pricingengine.xml',
    'fixings.txt',
  ]

  const sortedFiles = [...files].sort((a, b) => fileOrder.indexOf(a) - fileOrder.indexOf(b))

  return (
    <div className="flex w-[180px] min-w-[180px] flex-col overflow-y-auto border-r border-gray-200 bg-white px-2 py-3">
      <label className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wider text-gray-600">
        Select Input File:
      </label>
      <div className="flex flex-col gap-2">
        {sortedFiles.map((file) => (
          <button
            key={file}
            className={`cursor-pointer rounded border bg-white px-3 py-2 text-left text-xs transition-all ${
              selected === file
                ? 'border-blue-600 !bg-blue-600 font-medium !text-white'
                : 'border-gray-200 !text-gray-700 hover:border-blue-600 hover:bg-gray-50'
            }`}
            onClick={() => onSelect(file)}
          >
            {file}
          </button>
        ))}
      </div>
    </div>
  )
}

FileSelector.propTypes = {
  files: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
}

export default FileSelector
