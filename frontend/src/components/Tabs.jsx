import React from 'react';

function Tabs({ activeTab, onChange, children }) {
  return (
    <div className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full overflow-hidden">
      <div className="flex bg-card-bg border-b border-border-color flex-shrink-0">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          return (
            <button
              key={child.props.label}
              className={`py-2 px-4 bg-none border-none border-b-2 border-transparent cursor-pointer text-sm font-medium transition-all duration-200 ${
                activeTab === child.props.label
                  ? 'text-primary border-primary'
                  : 'text-text-secondary hover:text-primary hover:bg-bg-color'
              }`}
              onClick={() => onChange(child.props.label)}
            >
              {child.props.label}
            </button>
          );
        })}
      </div>
      <div className="flex-1 min-h-0">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          if (child.props.label === activeTab) {
            return <div className="animate-fade-in h-full">{child.props.children}</div>;
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
