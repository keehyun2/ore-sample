import PropTypes from 'prop-types'
import { FORM_INPUT_CLASSES, FORM_LABEL_CLASS, FORM_FIELD_CLASS } from '../../../constants/ui'

export function FormField({ label, children }) {
  return (
    <div className={FORM_FIELD_CLASS}>
      <label className={FORM_LABEL_CLASS}>{label}</label>
      {children}
    </div>
  )
}

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export function FormInput({
  type = 'text',
  value,
  onChange,
  step,
  placeholder,
  disabled = false,
  className = '',
}) {
  return (
    <input
      type={type}
      step={step}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${FORM_INPUT_CLASSES} ${className}`}
    />
  )
}

FormInput.propTypes = {
  type: PropTypes.oneOf(['text', 'number', 'date', 'email', 'password', 'tel', 'url']),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  step: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
}

export function FormSelect({ value, onChange, children, disabled = false, className = '' }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${FORM_INPUT_CLASSES} ${className}`}
    >
      {children}
    </select>
  )
}

FormSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
}

export default FormField
