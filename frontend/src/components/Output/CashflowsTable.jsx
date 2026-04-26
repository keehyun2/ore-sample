import React, { useState, useMemo } from 'react';

function CashflowsTable({ flows }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const filteredAndSortedFlows = useMemo(() => {
    let result = [...flows];

    if (filter !== 'all') {
      result = result.filter((flow) => flow.leg.toLowerCase() === filter.toLowerCase());
    }

    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'amount') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [flows, filter, sortBy, sortOrder]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const legCounts = flows.reduce((acc, flow) => {
    acc[flow.leg] = (acc[flow.leg] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mb-8">
      <h2 className="m-0 mb-4 text-2xl text-text-primary">Cashflows</h2>
      <div className="mb-4">
        <div className="flex gap-2 flex-wrap">
          <button
            className={`py-2 px-4 border border-border-color bg-card-bg rounded-lg cursor-pointer text-sm transition-all duration-200 ${
              filter === 'all' ? 'bg-primary-color text-white border-primary-color' : 'hover:bg-bg-color'
            }`}
            onClick={() => setFilter('all')}
          >
            All ({flows.length})
          </button>
          {Object.entries(legCounts).map(([leg, count]) => (
            <button
              key={leg}
              className={`py-2 px-4 border border-border-color bg-card-bg rounded-lg cursor-pointer text-sm transition-all duration-200 ${
                filter === leg.toLowerCase() ? 'bg-primary-color text-white border-primary-color' : 'hover:bg-bg-color'
              }`}
              onClick={() => setFilter(leg.toLowerCase())}
            >
              {leg} ({count})
            </button>
          ))}
        </div>
      </div>
      <div className="bg-card-bg rounded-xl shadow-md overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-bg-color border-b-2 border-border-color">
            <tr>
              <th onClick={() => handleSort('date')} className="py-4 px-4 text-left font-semibold text-text-secondary text-sm cursor-pointer select-none hover:bg-[#e2e8f0]">
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('leg')} className="py-4 px-4 text-left font-semibold text-text-secondary text-sm cursor-pointer select-none hover:bg-[#e2e8f0]">
                Leg {sortBy === 'leg' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('amount')} className="py-4 px-4 text-left font-semibold text-text-secondary text-sm cursor-pointer select-none hover:bg-[#e2e8f0]">
                Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-4 px-4 text-left font-semibold text-text-secondary text-sm">Currency</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedFlows.map((flow, index) => (
              <tr key={index} className="border-b border-border-color hover:bg-bg-color">
                <td className="py-[0.875rem] px-4 text-sm text-text-primary">{flow.date}</td>
                <td className="py-[0.875rem] px-4 text-sm">
                  <span className={`inline-block py-1 px-3 rounded text-xs font-semibold uppercase ${
                    flow.leg.toLowerCase() === 'fixed' || flow.leg.toLowerCase() === 'fixedreceiver'
                      ? 'bg-[#dbeafe] text-[#1e40af]'
                      : 'bg-[#fef3c7] text-[#92400e]'
                  }`}>
                    {flow.leg}
                  </span>
                </td>
                <td className={`py-[0.875rem] px-4 text-sm font-medium ${flow.amount >= 0 ? 'text-success-color' : 'text-error-color'}`}>
                  {formatNumber(flow.amount)}
                </td>
                <td className="py-[0.875rem] px-4 text-sm text-text-primary">{flow.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CashflowsTable;
