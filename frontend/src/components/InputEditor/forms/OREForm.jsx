import PropTypes from 'prop-types'

function OREForm({ data, onChange }) {
  const handleChange = (section, field, value) => {
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [field]: value,
      },
    })
  }

  const handleAnalyticsChange = (analytic, field, value) => {
    onChange({
      ...data,
      analytics: {
        ...data.analytics,
        [analytic]: {
          ...data.analytics[analytic],
          [field]: value,
        },
      },
    })
  }

  return (
    <div className="rounded bg-white p-3">
      <h3 className="m-0 mb-3 text-base font-semibold">ORE Configuration</h3>

      {/* Setup Section */}
      <div className="mb-4 border-b pb-4 last:mb-0 last:border-0 last:pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Setup</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">As Of Date</label>
            <input
              type="date"
              value={data.setup.asofDate}
              onChange={(e) => handleChange('setup', 'asofDate', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Input Path</label>
            <input
              type="text"
              value={data.setup.inputPath}
              onChange={(e) => handleChange('setup', 'inputPath', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Output Path</label>
            <input
              type="text"
              value={data.setup.outputPath}
              onChange={(e) => handleChange('setup', 'outputPath', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Input Files Section */}
      <div className="mb-4 border-b border-gray-200 pb-4 last:mb-0 last:border-0 last:pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Input Files</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Market Data File</label>
            <input
              type="text"
              value={data.setup.marketDataFile}
              onChange={(e) => handleChange('setup', 'marketDataFile', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Fixing Data File</label>
            <input
              type="text"
              value={data.setup.fixingDataFile}
              onChange={(e) => handleChange('setup', 'fixingDataFile', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Curve Config File</label>
            <input
              type="text"
              value={data.setup.curveConfigFile}
              onChange={(e) => handleChange('setup', 'curveConfigFile', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Conventions File</label>
            <input
              type="text"
              value={data.setup.conventionsFile}
              onChange={(e) => handleChange('setup', 'conventionsFile', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Market Config File</label>
            <input
              type="text"
              value={data.setup.marketConfigFile}
              onChange={(e) => handleChange('setup', 'marketConfigFile', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Pricing Engines File</label>
            <input
              type="text"
              value={data.setup.pricingEnginesFile}
              onChange={(e) => handleChange('setup', 'pricingEnginesFile', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Portfolio File</label>
            <input
              type="text"
              value={data.setup.portfolioFile}
              onChange={(e) => handleChange('setup', 'portfolioFile', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Log Settings Section */}
      <div className="mb-4 border-b border-gray-200 pb-4 last:mb-0 last:border-0 last:pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Log Settings</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Log File</label>
            <input
              type="text"
              value={data.setup.logFile}
              onChange={(e) => handleChange('setup', 'logFile', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Log Mask</label>
            <input
              type="text"
              value={data.setup.logMask}
              onChange={(e) => handleChange('setup', 'logMask', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Imply Today&apos;s Fixings</label>
            <select
              value={data.setup.implyTodaysFixings}
              onChange={(e) => handleChange('setup', 'implyTodaysFixings', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Markets Section */}
      <div className="mb-4 border-b border-gray-200 pb-4 last:mb-0 last:border-0 last:pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Markets Configuration</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">LGM Calibration</label>
            <input
              type="text"
              value={data.markets.lgmcalibration}
              onChange={(e) => handleChange('markets', 'lgmcalibration', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">FX Calibration</label>
            <input
              type="text"
              value={data.markets.fxcalibration}
              onChange={(e) => handleChange('markets', 'fxcalibration', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">EQ Calibration</label>
            <input
              type="text"
              value={data.markets.eqcalibration}
              onChange={(e) => handleChange('markets', 'eqcalibration', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Pricing</label>
            <input
              type="text"
              value={data.markets.pricing}
              onChange={(e) => handleChange('markets', 'pricing', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Simulation</label>
            <input
              type="text"
              value={data.markets.simulation}
              onChange={(e) => handleChange('markets', 'simulation', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-0 pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Analytics</h4>

        <h5 className="my-2 text-xs text-gray-600">NPV Analysis</h5>
        <div className="mb-3 grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Active</label>
            <select
              value={data.analytics.npv.active}
              onChange={(e) => handleAnalyticsChange('npv', 'active', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Base Currency</label>
            <input
              type="text"
              value={data.analytics.npv.baseCurrency}
              onChange={(e) => handleAnalyticsChange('npv', 'baseCurrency', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Output File</label>
            <input
              type="text"
              value={data.analytics.npv.outputFileName}
              onChange={(e) => handleAnalyticsChange('npv', 'outputFileName', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <h5 className="my-2 text-xs text-gray-600">Cashflow Analysis</h5>
        <div className="mb-3 grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Active</label>
            <select
              value={data.analytics.cashflow.active}
              onChange={(e) => handleAnalyticsChange('cashflow', 'active', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Output File</label>
            <input
              type="text"
              value={data.analytics.cashflow.outputFileName}
              onChange={(e) => handleAnalyticsChange('cashflow', 'outputFileName', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <h5 className="my-2 text-xs text-gray-600">Curves Analysis</h5>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Active</label>
            <select
              value={data.analytics.curves.active}
              onChange={(e) => handleAnalyticsChange('curves', 'active', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Configuration</label>
            <input
              type="text"
              value={data.analytics.curves.configuration}
              onChange={(e) => handleAnalyticsChange('curves', 'configuration', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Grid</label>
            <input
              type="text"
              value={data.analytics.curves.grid}
              onChange={(e) => handleAnalyticsChange('curves', 'grid', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Output File</label>
            <input
              type="text"
              value={data.analytics.curves.outputFileName}
              onChange={(e) => handleAnalyticsChange('curves', 'outputFileName', e.target.value)}
              className="rounded border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

OREForm.propTypes = {
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default OREForm
