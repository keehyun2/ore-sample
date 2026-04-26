import { useState } from 'react'
import PropTypes from 'prop-types'

const messagePropType = PropTypes.shape({
  type: PropTypes.oneOf(['success', 'error']).isRequired,
  text: PropTypes.string.isRequired,
})

export function useMessage() {
  const [message, setMessage] = useState(null)

  const showSuccess = (text) => setMessage({ type: 'success', text })
  const showError = (text) => setMessage({ type: 'error', text })
  const clearMessage = () => setMessage(null)

  return { message, showSuccess, showError, clearMessage }
}

export { messagePropType }
