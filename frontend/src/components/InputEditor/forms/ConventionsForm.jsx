import PropTypes from 'prop-types'

const formInputClass =
  'px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
const formLabelClass = 'text-xs text-gray-600 mb-1'
const formFieldClass = 'flex flex-col'

function ConventionsForm({ data, onChange }) {
  const handleDepositChange = (index, field, value) => {
    const newDeposits = [...data.deposits]
    newDeposits[index] = {
      ...newDeposits[index],
      [field]: field === 'indexBased' ? value === 'true' : value,
    }
    onChange({
      ...data,
      deposits: newDeposits,
    })
  }

  const handleOISChange = (index, field, value) => {
    const newOIS = [...data.ois]
    newOIS[index] = {
      ...newOIS[index],
      [field]: field === 'eom' ? value === 'true' : value,
    }
    onChange({
      ...data,
      ois: newOIS,
    })
  }

  const handleSwapChange = (index, field, value) => {
    const newSwaps = [...data.swaps]
    newSwaps[index] = {
      ...newSwaps[index],
      [field]: value,
    }
    onChange({
      ...data,
      swaps: newSwaps,
    })
  }

  // eslint-disable-next-line react/prop-types
  const FormField = ({ label, children }) => (
    <div className={formFieldClass}>
      <label className={formLabelClass}>{label}</label>
      {children}
    </div>
  )

  // eslint-disable-next-line react/prop-types
  const FormSelect = ({ value, onChange, children }) => (
    <select value={value} onChange={onChange} className={formInputClass}>
      {children}
    </select>
  )

  // eslint-disable-next-line react/prop-types
  const FormInput = ({ type, value, onChange, step }) => (
    <input type={type} step={step} value={value} onChange={onChange} className={formInputClass} />
  )

  return (
    <div className="rounded bg-white p-3">
      <h3 className="m-0 mb-3 text-base font-semibold">Market Conventions</h3>

      {/* Deposit Conventions */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <h4 className="m-0 mb-2 text-sm font-semibold">Deposit Conventions</h4>
        {data.deposits.map((deposit, index) => (
          <div key={deposit.id || index} className="mb-2 rounded bg-gray-50 p-2 last:mb-0">
            <h5 className="mb-2 mt-0.5 text-xs text-gray-600">{deposit.id}</h5>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
              <FormField label="ID">
                <FormInput
                  type="text"
                  value={deposit.id}
                  onChange={(e) => handleDepositChange(index, 'id', e.target.value)}
                />
              </FormField>
              <FormField label="Index Based">
                <FormSelect
                  value={deposit.indexBased.toString()}
                  onChange={(e) => handleDepositChange(index, 'indexBased', e.target.value)}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </FormSelect>
              </FormField>
              <FormField label="Index">
                <FormInput
                  type="text"
                  value={deposit.index}
                  onChange={(e) => handleDepositChange(index, 'index', e.target.value)}
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>

      {/* OIS Conventions */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <h4 className="m-0 mb-2 text-sm font-semibold">OIS Conventions</h4>
        {data.ois.map((ois, index) => (
          <div key={ois.id || index} className="mb-2 rounded bg-gray-50 p-2 last:mb-0">
            <h5 className="mb-2 mt-0.5 text-xs text-gray-600">{ois.id}</h5>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
              <FormField label="ID">
                <FormInput
                  type="text"
                  value={ois.id}
                  onChange={(e) => handleOISChange(index, 'id', e.target.value)}
                />
              </FormField>
              <FormField label="Spot Lag">
                <FormInput
                  type="number"
                  value={ois.spotLag}
                  onChange={(e) => handleOISChange(index, 'spotLag', e.target.value)}
                />
              </FormField>
              <FormField label="Index">
                <FormInput
                  type="text"
                  value={ois.index}
                  onChange={(e) => handleOISChange(index, 'index', e.target.value)}
                />
              </FormField>
              <FormField label="Fixed Day Counter">
                <FormSelect
                  value={ois.fixedDayCounter}
                  onChange={(e) => handleOISChange(index, 'fixedDayCounter', e.target.value)}
                >
                  <option value="A360">A360</option>
                  <option value="A365">A365</option>
                  <option value="30/360">30/360</option>
                  <option value="Act/360">Act/360</option>
                  <option value="Act/365">Act/365</option>
                </FormSelect>
              </FormField>
              <FormField label="Payment Lag">
                <FormInput
                  type="number"
                  value={ois.paymentLag}
                  onChange={(e) => handleOISChange(index, 'paymentLag', e.target.value)}
                />
              </FormField>
              <FormField label="End of Month">
                <FormSelect
                  value={ois.eom.toString()}
                  onChange={(e) => handleOISChange(index, 'eom', e.target.value)}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </FormSelect>
              </FormField>
              <FormField label="Fixed Frequency">
                <FormSelect
                  value={ois.fixedFrequency}
                  onChange={(e) => handleOISChange(index, 'fixedFrequency', e.target.value)}
                >
                  <option value="Annual">Annual</option>
                  <option value="Semiannual">Semiannual</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Monthly">Monthly</option>
                </FormSelect>
              </FormField>
              <FormField label="Fixed Convention">
                <FormSelect
                  value={ois.fixedConvention}
                  onChange={(e) => handleOISChange(index, 'fixedConvention', e.target.value)}
                >
                  <option value="Following">Following</option>
                  <option value="MF">Modified Following</option>
                  <option value="Preceding">Preceding</option>
                  <option value="MP">Modified Preceding</option>
                </FormSelect>
              </FormField>
              <FormField label="Fixed Payment Convention">
                <FormSelect
                  value={ois.fixedPaymentConvention}
                  onChange={(e) => handleOISChange(index, 'fixedPaymentConvention', e.target.value)}
                >
                  <option value="Following">Following</option>
                  <option value="MF">Modified Following</option>
                  <option value="Preceding">Preceding</option>
                  <option value="MP">Modified Preceding</option>
                </FormSelect>
              </FormField>
              <FormField label="Rule">
                <FormSelect
                  value={ois.rule}
                  onChange={(e) => handleOISChange(index, 'rule', e.target.value)}
                >
                  <option value="Backward">Backward</option>
                  <option value="Forward">Forward</option>
                </FormSelect>
              </FormField>
            </div>
          </div>
        ))}
      </div>

      {/* Swap Conventions */}
      <div className="mb-0 pb-0">
        <h4 className="m-0 mb-2 text-sm font-semibold">Swap Conventions</h4>
        {data.swaps.map((swap, index) => (
          <div key={swap.id || index} className="mb-2 rounded bg-gray-50 p-2 last:mb-0">
            <h5 className="mb-2 mt-0.5 text-xs text-gray-600">{swap.id}</h5>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
              <FormField label="ID">
                <FormInput
                  type="text"
                  value={swap.id}
                  onChange={(e) => handleSwapChange(index, 'id', e.target.value)}
                />
              </FormField>
              <FormField label="Fixed Calendar">
                <FormInput
                  type="text"
                  value={swap.fixedCalendar}
                  onChange={(e) => handleSwapChange(index, 'fixedCalendar', e.target.value)}
                />
              </FormField>
              <FormField label="Fixed Frequency">
                <FormSelect
                  value={swap.fixedFrequency}
                  onChange={(e) => handleSwapChange(index, 'fixedFrequency', e.target.value)}
                >
                  <option value="Annual">Annual</option>
                  <option value="Semiannual">Semiannual</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Monthly">Monthly</option>
                </FormSelect>
              </FormField>
              <FormField label="Fixed Convention">
                <FormSelect
                  value={swap.fixedConvention}
                  onChange={(e) => handleSwapChange(index, 'fixedConvention', e.target.value)}
                >
                  <option value="MF">MF</option>
                  <option value="F">Following</option>
                  <option value="P">Preceding</option>
                  <option value="MP">Modified Preceding</option>
                </FormSelect>
              </FormField>
              <FormField label="Fixed Day Counter">
                <FormSelect
                  value={swap.fixedDayCounter}
                  onChange={(e) => handleSwapChange(index, 'fixedDayCounter', e.target.value)}
                >
                  <option value="30/360">30/360</option>
                  <option value="A360">A360</option>
                  <option value="A365">A365</option>
                  <option value="Act/360">Act/360</option>
                  <option value="Act/365">Act/365</option>
                </FormSelect>
              </FormField>
              <FormField label="Index">
                <FormInput
                  type="text"
                  value={swap.index}
                  onChange={(e) => handleSwapChange(index, 'index', e.target.value)}
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

ConventionsForm.propTypes = {
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default ConventionsForm
