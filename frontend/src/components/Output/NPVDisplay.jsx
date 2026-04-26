import PropTypes from 'prop-types'

function NPVDisplay({ data }) {
  if (!data) return null

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  return (
    <div className="mb-8">
      <h2 className="m-0 mb-4 text-2xl text-text-primary">Net Present Value</h2>
      <div className="overflow-hidden rounded-xl bg-card-bg shadow-md">
        <div className="border-b border-border-color bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] py-8 text-center">
          <span className="mb-2 block text-base text-text-secondary">NPV</span>
          <span
            className={`text-4xl font-bold ${data.npv >= 0 ? 'text-success-color' : 'text-error-color'}`}
          >
            {data.currency} {formatNumber(data.npv)}
          </span>
        </div>
        <div className="px-8 py-6">
          <div className="flex justify-between border-b border-border-color py-3 last:border-0">
            <span className="font-medium text-text-secondary">Trade ID:</span>
            <span className="font-semibold text-text-primary">{data.tradeId}</span>
          </div>
          <div className="flex justify-between border-b border-border-color py-3 last:border-0">
            <span className="font-medium text-text-secondary">Trade Type:</span>
            <span className="font-semibold text-text-primary">{data.tradeType}</span>
          </div>
          <div className="flex justify-between border-b border-border-color py-3 last:border-0">
            <span className="font-medium text-text-secondary">Maturity:</span>
            <span className="font-semibold text-text-primary">{data.maturity}</span>
          </div>
          <div className="flex justify-between border-b border-border-color py-3 last:border-0">
            <span className="font-medium text-text-secondary">Notional:</span>
            <span className="font-semibold text-text-primary">
              {data.currency} {formatNumber(data.notional)}
            </span>
          </div>
          <div className="flex justify-between border-b-0 py-3">
            <span className="font-medium text-text-secondary">Counterparty:</span>
            <span className="font-semibold text-text-primary">{data.counterParty}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

NPVDisplay.propTypes = {
  data: PropTypes.shape({
    npv: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    tradeId: PropTypes.string.isRequired,
    tradeType: PropTypes.string.isRequired,
    maturity: PropTypes.string.isRequired,
    notional: PropTypes.number.isRequired,
    counterParty: PropTypes.string.isRequired,
  }),
}

export default NPVDisplay
