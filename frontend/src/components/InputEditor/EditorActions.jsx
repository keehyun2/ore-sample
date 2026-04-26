import PropTypes from 'prop-types'
import { BUTTON_LABELS } from '../../constants/ui'
import Button from '../ui/Button'

function EditorActions({ hasChanges, saving, onSave, onReset, labels = {} }) {
  const saveLabel = saving
    ? labels.saving || BUTTON_LABELS.saving
    : hasChanges
      ? labels.save || BUTTON_LABELS.save
      : labels.saved || BUTTON_LABELS.saved
  const resetLabel = labels.reset || BUTTON_LABELS.reset

  return (
    <div className="mb-3 flex gap-2">
      <Button onClick={onSave} disabled={!hasChanges || saving} variant="primary">
        {saveLabel}
      </Button>
      <Button onClick={onReset} disabled={!hasChanges} variant="secondary">
        {resetLabel}
      </Button>
    </div>
  )
}

EditorActions.propTypes = {
  hasChanges: PropTypes.bool.isRequired,
  saving: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  labels: PropTypes.shape({
    save: PropTypes.string,
    saved: PropTypes.string,
    saving: PropTypes.string,
    reset: PropTypes.string,
  }),
}

export default EditorActions
