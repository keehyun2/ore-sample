/**
 * UI-related constants used across components
 */

export const FORM_EDITABLE_FILES = ['ore.xml', 'irswap.xml', 'conventions.xml']

export const MESSAGE_STYLES = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
}

export const BUTTON_STYLES = {
  primary:
    'rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:bg-gray-400',
  secondary: 'rounded border bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200 disabled:opacity-50',
  success:
    'rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:bg-gray-400',
  warning:
    'rounded bg-yellow-600 px-3 py-1 text-xs text-white hover:bg-yellow-700 disabled:bg-gray-400',
}

export const BUTTON_LABELS = {
  save: 'Save',
  saved: 'Saved',
  saving: 'Saving...',
  reset: 'Reset',
  resetAll: 'Reset All',
  resetting: 'Resetting...',
  runValuation: 'Run Valuation',
  running: 'Running...',
}

export const FORM_INPUT_CLASSES =
  'px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'

export const FORM_LABEL_CLASS = 'text-xs text-gray-600 mb-1'

export const FORM_FIELD_CLASS = 'flex flex-col'
