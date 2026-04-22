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
    <div className="cashflows-table">
      <h2>Cashflows</h2>
      <div className="table-controls">
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({flows.length})
          </button>
          {Object.entries(legCounts).map(([leg, count]) => (
            <button
              key={leg}
              className={filter === leg.toLowerCase() ? 'active' : ''}
              onClick={() => setFilter(leg.toLowerCase())}
            >
              {leg} ({count})
            </button>
          ))}
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('date')} className="sortable">
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('leg')} className="sortable">
                Leg {sortBy === 'leg' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('amount')} className="sortable">
                Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Currency</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedFlows.map((flow, index) => (
              <tr key={index}>
                <td>{flow.date}</td>
                <td>
                  <span className={`leg-badge ${flow.leg.toLowerCase()}`}>
                    {flow.leg}
                  </span>
                </td>
                <td className={flow.amount >= 0 ? 'positive' : 'negative'}>
                  {formatNumber(flow.amount)}
                </td>
                <td>{flow.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CashflowsTable;
