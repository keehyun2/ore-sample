import PropTypes from 'prop-types'

const EXAMPLES = [
  { id: 'IRSwap', label: 'IRSwap' },
  { id: 'FRED Rate', label: 'FRED Rate' },
  { id: 'OIS-consistency', label: 'OIS-consistency' },
]

function ExampleSelector({ activeExample, onSelect }) {
  return (
    <div className="border-b border-border-color bg-card-bg">
      <div className="mx-auto flex max-w-[1400px]">
        {EXAMPLES.map((example) => (
          <button
            key={example.id}
            className={`cursor-pointer border-b-2 border-none border-transparent bg-none px-6 py-3 text-sm font-medium transition-all duration-200 ${
              activeExample === example.id
                ? 'border-b-primary text-primary'
                : 'hover:bg-bg-color text-text-secondary hover:text-primary'
            }`}
            onClick={() => onSelect(example.id)}
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  )
}

ExampleSelector.propTypes = {
  activeExample: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
}

export default ExampleSelector
