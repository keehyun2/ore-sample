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
    <div className="npv-display">
      <h2>Net Present Value</h2>
      <div className="npv-card">
        <div className="npv-value">
          <span className="label">NPV</span>
          <span className={`value ${data.npv >= 0 ? 'positive' : 'negative'}`}>
            {data.currency} {formatNumber(data.npv)}
          </span>
        </div>
        <div className="npv-details">
          <div className="detail-row">
            <span className="label">Trade ID:</span>
            <span className="value">{data.tradeId}</span>
          </div>
          <div className="detail-row">
            <span className="label">Trade Type:</span>
            <span className="value">{data.tradeType}</span>
          </div>
          <div className="detail-row">
            <span className="label">Maturity:</span>
            <span className="value">{data.maturity}</span>
          </div>
          <div className="detail-row">
            <span className="label">Notional:</span>
            <span className="value">{data.currency} {formatNumber(data.notional)}</span>
          </div>
          <div className="detail-row">
            <span className="label">Counterparty:</span>
            <span className="value">{data.counterParty}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NPVDisplay;
