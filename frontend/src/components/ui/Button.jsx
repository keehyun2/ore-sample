import PropTypes from 'prop-types'
import { BUTTON_STYLES } from '../../constants/ui'

function Button({
  variant = 'primary',
  children,
  disabled,
  onClick,
  type = 'button',
  className = '',
}) {
  const baseClassName = BUTTON_STYLES[variant] || BUTTON_STYLES.primary

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClassName} ${className}`}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning']),
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
}

export default Button
