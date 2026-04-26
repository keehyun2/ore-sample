import React from 'react';

function OREForm({ data, onChange }) {
  const handleChange = (section, field, value) => {
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [field]: value,
      },
    });
  };

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
    });
  };

  return (
    <div className="bg-white rounded p-3">
      <h3 className="m-0 mb-3 text-base font-semibold">ORE Configuration</h3>

      {/* Setup Section */}
      <div className="mb-4 pb-4 border-b last:border-0 last:mb-0 last:pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Setup</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">As Of Date</label>
            <input
              type="date"
              value={data.setup.asofDate}
              onChange={(e) => handleChange('setup', 'asofDate', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Input Path</label>
            <input
              type="text"
              value={data.setup.inputPath}
              onChange={(e) => handleChange('setup', 'inputPath', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Output Path</label>
            <input
              type="text"
              value={data.setup.outputPath}
              onChange={(e) => handleChange('setup', 'outputPath', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Input Files Section */}
      <div className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Input Files</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Market Data File</label>
            <input
              type="text"
              value={data.setup.marketDataFile}
              onChange={(e) => handleChange('setup', 'marketDataFile', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Fixing Data File</label>
            <input
              type="text"
              value={data.setup.fixingDataFile}
              onChange={(e) => handleChange('setup', 'fixingDataFile', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Curve Config File</label>
            <input
              type="text"
              value={data.setup.curveConfigFile}
              onChange={(e) => handleChange('setup', 'curveConfigFile', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Conventions File</label>
            <input
              type="text"
              value={data.setup.conventionsFile}
              onChange={(e) => handleChange('setup', 'conventionsFile', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Market Config File</label>
            <input
              type="text"
              value={data.setup.marketConfigFile}
              onChange={(e) => handleChange('setup', 'marketConfigFile', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Pricing Engines File</label>
            <input
              type="text"
              value={data.setup.pricingEnginesFile}
              onChange={(e) => handleChange('setup', 'pricingEnginesFile', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Portfolio File</label>
            <input
              type="text"
              value={data.setup.portfolioFile}
              onChange={(e) => handleChange('setup', 'portfolioFile', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Log Settings Section */}
      <div className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Log Settings</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Log File</label>
            <input
              type="text"
              value={data.setup.logFile}
              onChange={(e) => handleChange('setup', 'logFile', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Log Mask</label>
            <input
              type="text"
              value={data.setup.logMask}
              onChange={(e) => handleChange('setup', 'logMask', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Imply Today's Fixings</label>
            <select
              value={data.setup.implyTodaysFixings}
              onChange={(e) => handleChange('setup', 'implyTodaysFixings', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Markets Section */}
      <div className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Markets Configuration</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">LGM Calibration</label>
            <input
              type="text"
              value={data.markets.lgmcalibration}
              onChange={(e) => handleChange('markets', 'lgmcalibration', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">FX Calibration</label>
            <input
              type="text"
              value={data.markets.fxcalibration}
              onChange={(e) => handleChange('markets', 'fxcalibration', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">EQ Calibration</label>
            <input
              type="text"
              value={data.markets.eqcalibration}
              onChange={(e) => handleChange('markets', 'eqcalibration', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Pricing</label>
            <input
              type="text"
              value={data.markets.pricing}
              onChange={(e) => handleChange('markets', 'pricing', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Simulation</label>
            <input
              type="text"
              value={data.markets.simulation}
              onChange={(e) => handleChange('markets', 'simulation', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-0 pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Analytics</h4>

        <h5 className="mt-2 mb-2 text-xs text-gray-600">NPV Analysis</h5>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 mb-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Active</label>
            <select
              value={data.analytics.npv.active}
              onChange={(e) => handleAnalyticsChange('npv', 'active', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Base Currency</label>
            <input
              type="text"
              value={data.analytics.npv.baseCurrency}
              onChange={(e) => handleAnalyticsChange('npv', 'baseCurrency', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Output File</label>
            <input
              type="text"
              value={data.analytics.npv.outputFileName}
              onChange={(e) => handleAnalyticsChange('npv', 'outputFileName', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <h5 className="mt-2 mb-2 text-xs text-gray-600">Cashflow Analysis</h5>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 mb-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Active</label>
            <select
              value={data.analytics.cashflow.active}
              onChange={(e) => handleAnalyticsChange('cashflow', 'active', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Output File</label>
            <input
              type="text"
              value={data.analytics.cashflow.outputFileName}
              onChange={(e) => handleAnalyticsChange('cashflow', 'outputFileName', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <h5 className="mt-2 mb-2 text-xs text-gray-600">Curves Analysis</h5>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Active</label>
            <select
              value={data.analytics.curves.active}
              onChange={(e) => handleAnalyticsChange('curves', 'active', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Configuration</label>
            <input
              type="text"
              value={data.analytics.curves.configuration}
              onChange={(e) => handleAnalyticsChange('curves', 'configuration', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Grid</label>
            <input
              type="text"
              value={data.analytics.curves.grid}
              onChange={(e) => handleAnalyticsChange('curves', 'grid', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Output File</label>
            <input
              type="text"
              value={data.analytics.curves.outputFileName}
              onChange={(e) => handleAnalyticsChange('curves', 'outputFileName', e.target.value)}
              className="px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OREForm;
