import React from 'react'
import PropTypes from 'prop-types'

function Tabs({ activeTab, onChange, children }) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col overflow-hidden">
      <div className="flex flex-shrink-0 border-b border-border-color bg-card-bg">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null
          return (
            <button
              key={child.props.label}
              className={`cursor-pointer border-b-2 border-none border-transparent bg-none px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === child.props.label
                  ? 'border-primary text-primary'
                  : 'hover:bg-bg-color text-text-secondary hover:text-primary'
              }`}
              onClick={() => onChange(child.props.label)}
            >
              {child.props.label}
            </button>
          )
        })}
      </div>
      <div className="min-h-0 flex-1">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null
          if (child.props.label === activeTab) {
            return <div className="h-full animate-fade-in">{child.props.children}</div>
          }
          return null
        })}
      </div>
    </div>
  )
}

function Tab({ children }) {
  return <>{children}</>
}

Tabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}

Tab.propTypes = {
  children: PropTypes.node.isRequired,
}

export { Tabs, Tab }
