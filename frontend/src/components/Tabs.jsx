import React from 'react';

function Tabs({ activeTab, onChange, children }) {
  return (
    <div className="tabs">
      <div className="tab-headers">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          return (
            <button
              key={child.props.label}
              className={`tab-header ${activeTab === child.props.label ? 'active' : ''}`}
              onClick={() => onChange(child.props.label)}
            >
              {child.props.label}
            </button>
          );
        })}
      </div>
      <div className="tab-content">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          if (child.props.label === activeTab) {
            return <div className="tab-panel">{child.props.children}</div>;
          }
          return null;
        })}
      </div>
    </div>
  );
}

function Tab({ children }) {
  return <>{children}</>;
}

export { Tabs, Tab };
