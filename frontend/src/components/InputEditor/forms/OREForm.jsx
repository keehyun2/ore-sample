import PropTypes from 'prop-types'
import { FormField, FormInput, FormSelect } from '../../ui/form/FormField'

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
          <FormField label="As Of Date">
            <FormInput
              type="date"
              value={data.setup.asofDate}
              onChange={(e) => handleChange('setup', 'asofDate', e.target.value)}
            />
          </FormField>
          <FormField label="Input Path">
            <FormInput
              type="text"
              value={data.setup.inputPath}
              onChange={(e) => handleChange('setup', 'inputPath', e.target.value)}
            />
          </FormField>
          <FormField label="Output Path">
            <FormInput
              type="text"
              value={data.setup.outputPath}
              onChange={(e) => handleChange('setup', 'outputPath', e.target.value)}
            />
          </FormField>
        </div>
      </div>

      {/* Input Files Section */}
      <div className="mb-4 border-b border-gray-200 pb-4 last:mb-0 last:border-0 last:pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Input Files</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <FormField label="Market Data File">
            <FormInput
              type="text"
              value={data.setup.marketDataFile}
              onChange={(e) => handleChange('setup', 'marketDataFile', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="Fixing Data File">
            <FormInput
              type="text"
              value={data.setup.fixingDataFile}
              onChange={(e) => handleChange('setup', 'fixingDataFile', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="Curve Config File">
            <FormInput
              type="text"
              value={data.setup.curveConfigFile}
              onChange={(e) => handleChange('setup', 'curveConfigFile', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="Conventions File">
            <FormInput
              type="text"
              value={data.setup.conventionsFile}
              onChange={(e) => handleChange('setup', 'conventionsFile', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="Market Config File">
            <FormInput
              type="text"
              value={data.setup.marketConfigFile}
              onChange={(e) => handleChange('setup', 'marketConfigFile', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="Pricing Engines File">
            <FormInput
              type="text"
              value={data.setup.pricingEnginesFile}
              onChange={(e) => handleChange('setup', 'pricingEnginesFile', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="Portfolio File">
            <FormInput
              type="text"
              value={data.setup.portfolioFile}
              onChange={(e) => handleChange('setup', 'portfolioFile', e.target.value)}
              disabled
            />
          </FormField>
        </div>
      </div>

      {/* Log Settings Section */}
      <div className="mb-4 border-b border-gray-200 pb-4 last:mb-0 last:border-0 last:pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Log Settings</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <FormField label="Log File">
            <FormInput
              type="text"
              value={data.setup.logFile}
              onChange={(e) => handleChange('setup', 'logFile', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="Log Mask">
            <FormInput
              type="text"
              value={data.setup.logMask}
              onChange={(e) => handleChange('setup', 'logMask', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="Imply Today's Fixings">
            <FormSelect
              value={data.setup.implyTodaysFixings}
              onChange={(e) => handleChange('setup', 'implyTodaysFixings', e.target.value)}
              disabled
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </FormSelect>
          </FormField>
        </div>
      </div>

      {/* Markets Section */}
      <div className="mb-4 border-b border-gray-200 pb-4 last:mb-0 last:border-0 last:pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Markets Configuration</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <FormField label="LGM Calibration">
            <FormInput
              type="text"
              value={data.markets.lgmcalibration}
              onChange={(e) => handleChange('markets', 'lgmcalibration', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="FX Calibration">
            <FormInput
              type="text"
              value={data.markets.fxcalibration}
              onChange={(e) => handleChange('markets', 'fxcalibration', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="EQ Calibration">
            <FormInput
              type="text"
              value={data.markets.eqcalibration}
              onChange={(e) => handleChange('markets', 'eqcalibration', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="Pricing">
            <FormInput
              type="text"
              value={data.markets.pricing}
              onChange={(e) => handleChange('markets', 'pricing', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="Simulation">
            <FormInput
              type="text"
              value={data.markets.simulation}
              onChange={(e) => handleChange('markets', 'simulation', e.target.value)}
              disabled
            />
          </FormField>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-0 pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Analytics</h4>

        <h5 className="my-2 text-xs text-gray-600">NPV Analysis</h5>
        <div className="mb-3 grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <FormField label="Active">
            <FormSelect
              value={data.analytics.npv.active}
              onChange={(e) => handleAnalyticsChange('npv', 'active', e.target.value)}
              disabled
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </FormSelect>
          </FormField>
          <FormField label="Base Currency">
            <FormInput
              type="text"
              value={data.analytics.npv.baseCurrency}
              onChange={(e) => handleAnalyticsChange('npv', 'baseCurrency', e.target.value)}
            />
          </FormField>
          <FormField label="Output File">
            <FormInput
              type="text"
              value={data.analytics.npv.outputFileName}
              onChange={(e) => handleAnalyticsChange('npv', 'outputFileName', e.target.value)}
              disabled
            />
          </FormField>
        </div>

        <h5 className="my-2 text-xs text-gray-600">Cashflow Analysis</h5>
        <div className="mb-3 grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <FormField label="Active">
            <FormSelect
              value={data.analytics.cashflow.active}
              onChange={(e) => handleAnalyticsChange('cashflow', 'active', e.target.value)}
              disabled
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </FormSelect>
          </FormField>
          <FormField label="Output File">
            <FormInput
              type="text"
              value={data.analytics.cashflow.outputFileName}
              onChange={(e) => handleAnalyticsChange('cashflow', 'outputFileName', e.target.value)}
              disabled
            />
          </FormField>
        </div>

        <h5 className="my-2 text-xs text-gray-600">Curves Analysis</h5>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <FormField label="Active">
            <FormSelect
              value={data.analytics.curves.active}
              onChange={(e) => handleAnalyticsChange('curves', 'active', e.target.value)}
              disabled
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </FormSelect>
          </FormField>
          <FormField label="Configuration">
            <FormInput
              type="text"
              value={data.analytics.curves.configuration}
              onChange={(e) => handleAnalyticsChange('curves', 'configuration', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="Grid">
            <FormInput
              type="text"
              value={data.analytics.curves.grid}
              onChange={(e) => handleAnalyticsChange('curves', 'grid', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="Output File">
            <FormInput
              type="text"
              value={data.analytics.curves.outputFileName}
              onChange={(e) => handleAnalyticsChange('curves', 'outputFileName', e.target.value)}
              disabled
            />
          </FormField>
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
