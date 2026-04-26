import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { formatNumber } from '../../utils/format'

function CashflowsTable({ flows }) {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('asc')

  const filteredAndSortedFlows = useMemo(() => {
    let result = [...flows]

    if (filter !== 'all') {
      result = result.filter((flow) => flow.leg.toLowerCase() === filter.toLowerCase())
    }

    result.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]

      if (sortBy === 'amount') {
        aVal = parseFloat(aVal)
        bVal = parseFloat(bVal)
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [flows, filter, sortBy, sortOrder])

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const legCounts = flows.reduce((acc, flow) => {
    acc[flow.leg] = (acc[flow.leg] || 0) + 1
    return acc
  }, {})

  return (
    <div className="mb-8">
      <h2 className="m-0 mb-4 text-2xl text-text-primary">Cashflows</h2>
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            className={`cursor-pointer rounded-lg border border-border-color bg-card-bg px-4 py-2 text-sm transition-all duration-200 ${
              filter === 'all'
                ? 'bg-primary-color border-primary-color text-white'
                : 'hover:bg-bg-color'
            }`}
            onClick={() => setFilter('all')}
          >
            All ({flows.length})
          </button>
          {Object.entries(legCounts).map(([leg, count]) => (
            <button
              key={leg}
              className={`cursor-pointer rounded-lg border border-border-color bg-card-bg px-4 py-2 text-sm transition-all duration-200 ${
                filter === leg.toLowerCase()
                  ? 'bg-primary-color border-primary-color text-white'
                  : 'hover:bg-bg-color'
              }`}
              onClick={() => setFilter(leg.toLowerCase())}
            >
              {leg} ({count})
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl bg-card-bg shadow-md">
        <table className="w-full border-collapse">
          <thead className="bg-bg-color border-b-2 border-border-color">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="cursor-pointer select-none p-4 text-left text-sm font-semibold text-text-secondary hover:bg-border-color"
              >
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('leg')}
                className="cursor-pointer select-none p-4 text-left text-sm font-semibold text-text-secondary hover:bg-border-color"
              >
                Leg {sortBy === 'leg' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('amount')}
                className="cursor-pointer select-none p-4 text-left text-sm font-semibold text-text-secondary hover:bg-border-color"
              >
                Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-4 text-left text-sm font-semibold text-text-secondary">Currency</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedFlows.map((flow, index) => (
              <tr key={index} className="hover:bg-bg-color border-b border-border-color">
                <td className="px-4 py-3.5 text-sm text-text-primary">{flow.date}</td>
                <td className="px-4 py-3.5 text-sm">
                  <span
                    className={`inline-block rounded px-3 py-1 text-xs font-semibold uppercase ${
                      flow.leg.toLowerCase() === 'fixed' ||
                      flow.leg.toLowerCase() === 'fixedreceiver'
                        ? 'bg-[#dbeafe] text-[#1e40af]'
                        : 'bg-[#fef3c7] text-[#92400e]'
                    }`}
                  >
                    {flow.leg}
                  </span>
                </td>
                <td
                  className={`px-4 py-3.5 text-sm font-medium ${flow.amount >= 0 ? 'text-success-color' : 'text-error-color'}`}
                >
                  {formatNumber(flow.amount)}
                </td>
                <td className="px-4 py-3.5 text-sm text-text-primary">{flow.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

CashflowsTable.propTypes = {
  flows: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      leg: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      currency: PropTypes.string.isRequired,
    })
  ).isRequired,
}

export default CashflowsTable
