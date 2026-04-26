import PropTypes from 'prop-types'
import { FormField, FormInput, FormSelect } from '../../ui/form/FormField'

function IRSwapForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  const handleFixedLegChange = (field, value) => {
    onChange({
      ...data,
      fixedLeg: {
        ...data.fixedLeg,
        [field]: value,
      },
    })
  }

  const handleFloatingLegChange = (field, value) => {
    onChange({
      ...data,
      floatingLeg: {
        ...data.floatingLeg,
        [field]: value,
      },
    })
  }

  return (
    <div className="rounded bg-white p-3">
      <h3 className="m-0 mb-3 text-base font-semibold">IR Swap Configuration</h3>

      {/* Trade Info Section */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <h4 className="m-0 mb-2 text-sm font-semibold">Trade Information</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <FormField label="Trade ID">
            <FormInput
              type="text"
              value={data.tradeId}
              onChange={(e) => handleChange('tradeId', e.target.value)}
            />
          </FormField>
          <FormField label="Trade Type">
            <FormInput
              type="text"
              value={data.tradeType}
              onChange={(e) => handleChange('tradeType', e.target.value)}
              disabled
            />
          </FormField>
          <FormField label="Counter Party">
            <FormInput
              type="text"
              value={data.counterParty}
              onChange={(e) => handleChange('counterParty', e.target.value)}
            />
          </FormField>
          <FormField label="Netting Set ID">
            <FormInput
              type="text"
              value={data.nettingSetId}
              onChange={(e) => handleChange('nettingSetId', e.target.value)}
            />
          </FormField>
        </div>
      </div>

      {/* Fixed Leg Section */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <h4 className="m-0 mb-2 text-sm font-semibold">Fixed Leg (Receiver)</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <FormField label="Currency">
            <FormInput
              type="text"
              value={data.fixedLeg.currency}
              onChange={(e) => handleFixedLegChange('currency', e.target.value)}
            />
          </FormField>
          <FormField label="Notional Amount">
            <FormInput
              type="number"
              step="0.01"
              value={data.fixedLeg.notional}
              onChange={(e) => handleFixedLegChange('notional', e.target.value)}
            />
          </FormField>
          <FormField label="Fixed Rate">
            <FormInput
              type="number"
              step="0.0001"
              value={data.fixedLeg.rate}
              onChange={(e) => handleFixedLegChange('rate', e.target.value)}
            />
          </FormField>
          <FormField label="Day Counter">
            <FormSelect
              value={data.fixedLeg.dayCounter}
              onChange={(e) => handleFixedLegChange('dayCounter', e.target.value)}
            >
              <option value="30/360">30/360</option>
              <option value="A360">A360</option>
              <option value="A365">A365</option>
              <option value="Act/360">Act/360</option>
              <option value="Act/365">Act/365</option>
            </FormSelect>
          </FormField>
          <FormField label="Payment Convention">
            <FormSelect
              value={data.fixedLeg.paymentConvention}
              onChange={(e) => handleFixedLegChange('paymentConvention', e.target.value)}
            >
              <option value="F">Following (F)</option>
              <option value="MF">Modified Following (MF)</option>
              <option value="P">Preceding (P)</option>
              <option value="MP">Modified Preceding (MP)</option>
            </FormSelect>
          </FormField>
          <FormField label="Start Date">
            <FormInput
              type="text"
              placeholder="YYYYMMDD"
              value={data.fixedLeg.startDate}
              onChange={(e) => handleFixedLegChange('startDate', e.target.value)}
            />
          </FormField>
          <FormField label="End Date">
            <FormInput
              type="text"
              placeholder="YYYYMMDD"
              value={data.fixedLeg.endDate}
              onChange={(e) => handleFixedLegChange('endDate', e.target.value)}
            />
          </FormField>
          <FormField label="Tenor (Frequency)">
            <FormSelect
              value={data.fixedLeg.tenor}
              onChange={(e) => handleFixedLegChange('tenor', e.target.value)}
            >
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
            </FormSelect>
          </FormField>
          <FormField label="Calendar">
            <FormInput
              type="text"
              value={data.fixedLeg.calendar}
              onChange={(e) => handleFixedLegChange('calendar', e.target.value)}
            />
          </FormField>
          <FormField label="Convention">
            <FormSelect
              value={data.fixedLeg.convention}
              onChange={(e) => handleFixedLegChange('convention', e.target.value)}
            >
              <option value="F">Following (F)</option>
              <option value="MF">Modified Following (MF)</option>
              <option value="P">Preceding (P)</option>
              <option value="MP">Modified Preceding (MP)</option>
            </FormSelect>
          </FormField>
          <FormField label="Term Convention">
            <FormSelect
              value={data.fixedLeg.termConvention}
              onChange={(e) => handleFixedLegChange('termConvention', e.target.value)}
            >
              <option value="F">Following (F)</option>
              <option value="MF">Modified Following (MF)</option>
              <option value="P">Preceding (P)</option>
              <option value="MP">Modified Preceding (MP)</option>
            </FormSelect>
          </FormField>
          <FormField label="Rule">
            <FormSelect
              value={data.fixedLeg.rule}
              onChange={(e) => handleFixedLegChange('rule', e.target.value)}
            >
              <option value="Forward">Forward</option>
              <option value="Backward">Backward</option>
            </FormSelect>
          </FormField>
        </div>
      </div>

      {/* Floating Leg Section */}
      <div className="mb-0 pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Floating Leg (Payer)</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          <FormField label="Currency">
            <FormInput
              type="text"
              value={data.floatingLeg.currency}
              onChange={(e) => handleFloatingLegChange('currency', e.target.value)}
            />
          </FormField>
          <FormField label="Notional Amount">
            <FormInput
              type="number"
              step="0.01"
              value={data.floatingLeg.notional}
              onChange={(e) => handleFloatingLegChange('notional', e.target.value)}
            />
          </FormField>
          <FormField label="Index">
            <FormInput
              type="text"
              value={data.floatingLeg.index}
              onChange={(e) => handleFloatingLegChange('index', e.target.value)}
            />
          </FormField>
          <FormField label="Spread">
            <FormInput
              type="number"
              step="0.000001"
              value={data.floatingLeg.spread}
              onChange={(e) => handleFloatingLegChange('spread', e.target.value)}
            />
          </FormField>
          <FormField label="Day Counter">
            <FormSelect
              value={data.floatingLeg.dayCounter}
              onChange={(e) => handleFloatingLegChange('dayCounter', e.target.value)}
            >
              <option value="30/360">30/360</option>
              <option value="A360">A360</option>
              <option value="A365">A365</option>
              <option value="Act/360">Act/360</option>
              <option value="Act/365">Act/365</option>
            </FormSelect>
          </FormField>
          <FormField label="Payment Convention">
            <FormSelect
              value={data.floatingLeg.paymentConvention}
              onChange={(e) => handleFloatingLegChange('paymentConvention', e.target.value)}
            >
              <option value="F">Following (F)</option>
              <option value="MF">Modified Following (MF)</option>
              <option value="P">Preceding (P)</option>
              <option value="MP">Modified Preceding (MP)</option>
            </FormSelect>
          </FormField>
          <FormField label="In Arrears">
            <FormSelect
              value={data.floatingLeg.isInArrears.toString()}
              onChange={(e) => handleFloatingLegChange('isInArrears', e.target.value === 'true')}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </FormSelect>
          </FormField>
          <FormField label="Fixing Days">
            <FormInput
              type="number"
              value={data.floatingLeg.fixingDays}
              onChange={(e) => handleFloatingLegChange('fixingDays', e.target.value)}
            />
          </FormField>
          <FormField label="Start Date">
            <FormInput
              type="text"
              placeholder="YYYYMMDD"
              value={data.floatingLeg.startDate}
              onChange={(e) => handleFloatingLegChange('startDate', e.target.value)}
            />
          </FormField>
          <FormField label="End Date">
            <FormInput
              type="text"
              placeholder="YYYYMMDD"
              value={data.floatingLeg.endDate}
              onChange={(e) => handleFloatingLegChange('endDate', e.target.value)}
            />
          </FormField>
          <FormField label="Tenor (Frequency)">
            <FormSelect
              value={data.floatingLeg.tenor}
              onChange={(e) => handleFloatingLegChange('tenor', e.target.value)}
            >
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
            </FormSelect>
          </FormField>
          <FormField label="Calendar">
            <FormInput
              type="text"
              value={data.floatingLeg.calendar}
              onChange={(e) => handleFloatingLegChange('calendar', e.target.value)}
            />
          </FormField>
          <FormField label="Convention">
            <FormSelect
              value={data.floatingLeg.convention}
              onChange={(e) => handleFloatingLegChange('convention', e.target.value)}
            >
              <option value="F">Following (F)</option>
              <option value="MF">Modified Following (MF)</option>
              <option value="P">Preceding (P)</option>
              <option value="MP">Modified Preceding (MP)</option>
            </FormSelect>
          </FormField>
          <FormField label="Term Convention">
            <FormSelect
              value={data.floatingLeg.termConvention}
              onChange={(e) => handleFloatingLegChange('termConvention', e.target.value)}
            >
              <option value="F">Following (F)</option>
              <option value="MF">Modified Following (MF)</option>
              <option value="P">Preceding (P)</option>
              <option value="MP">Modified Preceding (MP)</option>
            </FormSelect>
          </FormField>
          <FormField label="Rule">
            <FormSelect
              value={data.floatingLeg.rule}
              onChange={(e) => handleFloatingLegChange('rule', e.target.value)}
            >
              <option value="Forward">Forward</option>
              <option value="Backward">Backward</option>
            </FormSelect>
          </FormField>
        </div>
      </div>
    </div>
  )
}

IRSwapForm.propTypes = {
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default IRSwapForm
