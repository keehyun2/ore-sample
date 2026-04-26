import PropTypes from 'prop-types'
import { MESSAGE_STYLES } from '../../constants/ui'

function Message({ message, _onDismiss }) {
  if (!message) return null

  return (
    <div
      className={`mb-3 rounded p-3 text-sm ${
        message.type === 'success' ? MESSAGE_STYLES.success : MESSAGE_STYLES.error
      }`}
    >
      {message.text}
    </div>
  )
}

Message.propTypes = {
  message: PropTypes.shape({
    type: PropTypes.oneOf(['success', 'error']).isRequired,
    text: PropTypes.string.isRequired,
  }),
  _onDismiss: PropTypes.func,
}

export default Message
