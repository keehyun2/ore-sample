import { useState, useEffect } from 'react'
import { api } from '../../services/api'

const AVAILABLE_SERIES = [
  { id: 'DGS10', name: '10-Year Treasury' },
  { id: 'DGS2', name: '2-Year Treasury' },
  { id: 'DGS5', name: '5-Year Treasury' },
  { id: 'DGS30', name: '30-Year Treasury' },
  { id: 'DGS3MO', name: '3-Month Treasury' },
  { id: 'DGS1MO', name: '1-Month Treasury' },
  { id: 'FEDFUNDS', name: 'Fed Funds Rate' },
  { id: 'EURIBOR6M', name: '6-Month EURIBOR' },
  { id: 'SOFR', name: 'SOFR' },
]

function FREDRates() {
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [selectedSeries, setSelectedSeries] = useState(['DGS10', 'DGS2', 'DGS3MO', 'FEDFUNDS'])
  const [error, setError] = useState(null)
  const [apiCall, setApiCall] = useState(null)
  const [showApiDetails, setShowApiDetails] = useState(false)

  useEffect(() => {
    loadRates()
  }, [])

  const loadRates = async () => {
    if (selectedSeries.length === 0) {
      setError('Please select at least one series')
      return
    }
    setLoading(true)
    setError(null)
    setApiCall(null)

    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
    const url = `${API_BASE}/fred/rates?${selectedSeries.map((s) => `series=${s}`).join('&')}`

    setApiCall({
      type: 'FETCH_RATES',
      url: url,
      fullUrl: window.location.origin + url,
      method: 'GET',
      request: {
        headers: {
          Accept: 'application/json',
        },
        query: selectedSeries,
      },
      response: null,
      timestamp: new Date().toISOString(),
    })

    try {
      const data = await api.getFREDRates(selectedSeries)
      setRates(data)
      setApiCall((prev) => ({
        ...prev,
        response: {
          success: true,
          data: data,
          count: data.length,
        },
      }))
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message
      setError(errorMsg)
      setApiCall((prev) => ({
        ...prev,
        response: {
          success: false,
          error: errorMsg,
          details: err.response?.data,
        },
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSeries = (seriesId) => {
    setSelectedSeries((prev) =>
      prev.includes(seriesId) ? prev.filter((s) => s !== seriesId) : [...prev, seriesId]
    )
  }

  const handleUpdateMarket = async () => {
    setUpdating(true)
    setError(null)

    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
    const url = `${API_BASE}/fred/update`
    const requestBody = { seriesIds: selectedSeries }

    setApiCall({
      type: 'UPDATE_MARKET',
      url: url,
      fullUrl: window.location.origin + url,
      method: 'POST',
      request: {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: requestBody,
      },
      response: null,
      timestamp: new Date().toISOString(),
    })

    try {
      const result = await api.updateMarketFromFRED(selectedSeries)
      alert('Market file updated successfully!')
      setRates(result.rates)
      setApiCall((prev) => ({
        ...prev,
        response: {
          success: true,
          data: result,
          message: 'market.txt updated successfully',
        },
      }))
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message
      setError(errorMsg)
      setApiCall((prev) => ({
        ...prev,
        response: {
          success: false,
          error: errorMsg,
          details: err.response?.data,
        },
      }))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6 text-center">
        <h3 className="m-0 mb-2 text-2xl text-text-primary">FRED Interest Rate Data</h3>
        <p className="m-0 text-sm text-text-secondary">
          Fetch live interest rate data from Federal Reserve Economic Data
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-[#fecaca] bg-[#fee2e2] p-6">
          <strong>Error:</strong> {error}
          {error.includes('FRED_API_KEY') && (
            <div className="mt-2 border-t border-[#fecaca] pt-2 text-sm">
              Add{' '}
              <code className="rounded bg-black/10 px-2 py-1 font-mono">FRED_API_KEY=your_key</code>{' '}
              to backend/.env file. Get your key from{' '}
              <a
                href="https://fred.stlouisfed.org/docs/api/api_key.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#991b1b] underline"
              >
                FRED API
              </a>
            </div>
          )}
        </div>
      )}

      <div className="mb-6 rounded-xl bg-card-bg p-6 shadow-md">
        <div className="series-selector">
          <label className="mb-3 block font-medium text-text-secondary">Select Series:</label>
          <div className="mb-6 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
            {AVAILABLE_SERIES.map((series) => (
              <label
                key={series.id}
                className="transition-bg hover:bg-bg-color flex cursor-pointer items-center rounded p-2 duration-200"
              >
                <input
                  type="checkbox"
                  checked={selectedSeries.includes(series.id)}
                  onChange={() => handleToggleSeries(series.id)}
                  className="mr-2 cursor-pointer"
                />
                <span className="text-sm text-text-primary">{series.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadRates}
            disabled={loading || selectedSeries.length === 0}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? 'Fetching...' : 'Fetch Rates'}
          </button>
          <button
            onClick={handleUpdateMarket}
            disabled={updating || rates.length === 0}
            className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {updating ? 'Updating...' : 'Update market.txt'}
          </button>
          <button
            onClick={() => setShowApiDetails(!showApiDetails)}
            className="rounded border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            {showApiDetails ? 'Hide' : 'Show'} API Details
          </button>
        </div>
      </div>

      {showApiDetails && apiCall && (
        <div className="mb-6 rounded-xl border border-border-color bg-card-bg p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between border-b border-border-color pb-3">
            <h4 className="m-0 text-xl text-text-primary">API Call Details</h4>
            <span className="text-xs text-text-secondary">
              {new Date(apiCall.timestamp).toLocaleString()}
            </span>
          </div>

          <div className="mb-6">
            <h5 className="m-0 mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Request
            </h5>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="min-w-[120px] text-sm font-medium text-text-secondary">Type:</span>
              <span className="bg-bg-color rounded px-2 py-1 text-sm font-medium text-text-primary">
                {apiCall.type === 'FETCH_RATES' ? 'Fetch Rates' : 'Update Market'}
              </span>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="min-w-[120px] text-sm font-medium text-text-secondary">Method:</span>
              <span className="bg-primary-color rounded px-2 py-1 text-sm font-medium text-white">
                {apiCall.method}
              </span>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="min-w-[120px] text-sm font-medium text-text-secondary">URL:</span>
              <span className="bg-bg-color break-all rounded px-2 py-1 font-mono text-sm">
                {apiCall.fullUrl}
              </span>
            </div>
            {apiCall.request.query && (
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="min-w-[120px] text-sm font-medium text-text-secondary">
                  Query Params:
                </span>
                <span className="text-sm text-text-primary">
                  {apiCall.request.query
                    .map(
                      (q) =>
                        `<code class="bg-bg-color py-1 px-1.5 rounded font-mono text-xs">series=${q}</code>`
                    )
                    .join(' ')}
                </span>
              </div>
            )}
            {apiCall.request.body && (
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="min-w-[120px] text-sm font-medium text-text-secondary">
                  Request Body:
                </span>
                <pre className="m-0 my-1 overflow-x-auto rounded bg-text-primary p-3 font-mono text-xs leading-6 text-border-color">
                  {JSON.stringify(apiCall.request.body, null, 2)}
                </pre>
              </div>
            )}
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="min-w-[120px] text-sm font-medium text-text-secondary">
                Headers:
              </span>
              <pre className="m-0 my-1 overflow-x-auto rounded bg-text-primary p-3 font-mono text-xs leading-6 text-border-color">
                {JSON.stringify(apiCall.request.headers, null, 2)}
              </pre>
            </div>
          </div>

          {apiCall.response && (
            <div className="mb-6 last:mb-0">
              <h5 className="m-0 mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
                Response
              </h5>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="min-w-[120px] text-sm font-medium text-text-secondary">
                  Status:
                </span>
                <span
                  className={`text-sm font-medium ${apiCall.response.success ? 'text-success-color' : 'text-error-color'}`}
                >
                  {apiCall.response.success ? '✓ Success' : '✗ Error'}
                </span>
              </div>
              {apiCall.response.count !== undefined && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="min-w-[120px] text-sm font-medium text-text-secondary">
                    Records:
                  </span>
                  <span className="text-sm text-text-primary">
                    {apiCall.response.count} series returned
                  </span>
                </div>
              )}
              {apiCall.response.message && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="min-w-[120px] text-sm font-medium text-text-secondary">
                    Message:
                  </span>
                  <span className="text-sm text-text-primary">{apiCall.response.message}</span>
                </div>
              )}
              {apiCall.response.error && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="min-w-[120px] text-sm font-medium text-text-secondary">
                    Error:
                  </span>
                  <span className="text-error-color rounded bg-[#fee2e2] p-2 text-sm">
                    {apiCall.response.error}
                  </span>
                </div>
              )}
              {apiCall.response.data && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="min-w-[120px] text-sm font-medium text-text-secondary">
                    Data:
                  </span>
                  <pre className="m-0 my-1 overflow-x-auto rounded bg-text-primary p-3 font-mono text-xs leading-6 text-border-color">
                    {JSON.stringify(apiCall.response.data, null, 2)}
                  </pre>
                </div>
              )}
              {apiCall.response.details && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="min-w-[120px] text-sm font-medium text-text-secondary">
                    Details:
                  </span>
                  <pre className="m-0 my-1 overflow-x-auto rounded bg-text-primary p-3 font-mono text-xs leading-6 text-border-color">
                    {JSON.stringify(apiCall.response.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="last:mb-0">
            <h5 className="m-0 mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
              FRED API Endpoint (Backend)
            </h5>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="min-w-[120px] text-sm font-medium text-text-secondary">
                Endpoint:
              </span>
              <span className="text-sm text-text-primary">
                https://api.stlouisfed.org/fred/series/observations
              </span>
            </div>
            <div className="mb-0 flex flex-wrap gap-2">
              <span className="min-w-[120px] text-sm font-medium text-text-secondary">
                Parameters:
              </span>
              <pre className="m-0 my-1 overflow-x-auto rounded bg-text-primary p-3 font-mono text-xs leading-6 text-border-color">{`{
  "series_id": "${selectedSeries.join('" or "')}",
  "api_key": "YOUR_KEY",
  "file_type": "json",
  "limit": 1,
  "sort_order": "desc"
}`}</pre>
            </div>
          </div>
        </div>
      )}

      {rates.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-xl bg-card-bg shadow-md">
          <table className="w-full border-collapse">
            <thead className="bg-bg-color">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-text-secondary">Series</th>
                <th className="p-4 text-left text-sm font-semibold text-text-secondary">Name</th>
                <th className="p-4 text-left text-sm font-semibold text-text-secondary">
                  Value (%)
                </th>
                <th className="p-4 text-left text-sm font-semibold text-text-secondary">Date</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.seriesId} className="border-t border-border-color">
                  <td className="px-4 py-3.5 text-sm">
                    <code className="bg-bg-color rounded px-1.5 py-1 font-mono text-xs text-text-primary">
                      {rate.seriesId}
                    </code>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-text-primary">{rate.seriesName}</td>
                  <td className="text-primary-color px-4 py-3.5 text-sm font-semibold">
                    {rate.value.toFixed(3)}%
                  </td>
                  <td className="px-4 py-3.5 text-sm text-text-primary">{rate.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="py-8">
          <div className="border-3 border-t-primary-color mx-auto mb-4 size-10 animate-spin rounded-full border-border-color"></div>
          <p className="text-center text-text-primary">Fetching rates from FRED...</p>
        </div>
      )}

      {!loading && rates.length === 0 && !error && (
        <div className="px-8 py-12 text-center text-text-secondary">
          <p className="mb-2">No rate data available.</p>
          <p className="m-0">Select series and click &quot;Fetch Rates&quot; to get started.</p>
        </div>
      )}

      <div className="py-4 text-center">
        <p className="m-0 text-xs text-text-secondary">
          Data sourced from{' '}
          <a
            href="https://fred.stlouisfed.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-color no-underline hover:underline"
          >
            FRED (Federal Reserve Economic Data)
          </a>
        </p>
      </div>
    </div>
  )
}

export default FREDRates
