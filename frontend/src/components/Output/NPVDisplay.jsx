import React from 'react';

function NPVDisplay({ data }) {
  if (!data) return null;

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="mb-8">
      <h2 className="m-0 mb-4 text-2xl text-text-primary">Net Present Value</h2>
      <div className="bg-card-bg rounded-xl shadow-md overflow-hidden">
        <div className="py-8 text-center bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] border-b border-border-color">
          <span className="block text-base text-text-secondary mb-2">NPV</span>
          <span className={`text-4xl font-bold ${data.npv >= 0 ? 'text-success-color' : 'text-error-color'}`}>
            {data.currency} {formatNumber(data.npv)}
          </span>
        </div>
        <div className="py-6 px-8">
          <div className="flex justify-between py-3 border-b border-border-color last:border-0">
            <span className="font-medium text-text-secondary">Trade ID:</span>
            <span className="font-semibold text-text-primary">{data.tradeId}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-border-color last:border-0">
            <span className="font-medium text-text-secondary">Trade Type:</span>
            <span className="font-semibold text-text-primary">{data.tradeType}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-border-color last:border-0">
            <span className="font-medium text-text-secondary">Maturity:</span>
            <span className="font-semibold text-text-primary">{data.maturity}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-border-color last:border-0">
            <span className="font-medium text-text-secondary">Notional:</span>
            <span className="font-semibold text-text-primary">{data.currency} {formatNumber(data.notional)}</span>
          </div>
          <div className="flex justify-between py-3 border-b-0">
            <span className="font-medium text-text-secondary">Counterparty:</span>
            <span className="font-semibold text-text-primary">{data.counterParty}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NPVDisplay;
