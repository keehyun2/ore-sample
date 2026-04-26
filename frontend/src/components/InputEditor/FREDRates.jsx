import { useState, useEffect } from 'react';
import { api } from '../../services/api';

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
];

function FREDRates() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(['DGS10', 'DGS2', 'DGS3MO', 'FEDFUNDS']);
  const [error, setError] = useState(null);
  const [apiCall, setApiCall] = useState(null);
  const [showApiDetails, setShowApiDetails] = useState(false);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    if (selectedSeries.length === 0) {
      setError('Please select at least one series');
      return;
    }
    setLoading(true);
    setError(null);
    setApiCall(null);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    const url = `${API_BASE}/fred/rates?${selectedSeries.map(s => `series=${s}`).join('&')}`;

    setApiCall({
      type: 'FETCH_RATES',
      url: url,
      fullUrl: window.location.origin + url,
      method: 'GET',
      request: {
        headers: {
          'Accept': 'application/json',
        },
        query: selectedSeries,
      },
      response: null,
      timestamp: new Date().toISOString(),
    });

    try {
      const data = await api.getFREDRates(selectedSeries);
      setRates(data);
      setApiCall(prev => ({
        ...prev,
        response: {
          success: true,
          data: data,
          count: data.length,
        },
      }));
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      setApiCall(prev => ({
        ...prev,
        response: {
          success: false,
          error: errorMsg,
          details: err.response?.data,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSeries = (seriesId) => {
    setSelectedSeries((prev) =>
      prev.includes(seriesId)
        ? prev.filter((s) => s !== seriesId)
        : [...prev, seriesId]
    );
  };

  const handleUpdateMarket = async () => {
    setUpdating(true);
    setError(null);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    const url = `${API_BASE}/fred/update`;
    const requestBody = { seriesIds: selectedSeries };

    setApiCall({
      type: 'UPDATE_MARKET',
      url: url,
      fullUrl: window.location.origin + url,
      method: 'POST',
      request: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: requestBody,
      },
      response: null,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await api.updateMarketFromFRED(selectedSeries);
      alert('Market file updated successfully!');
      setRates(result.rates);
      setApiCall(prev => ({
        ...prev,
        response: {
          success: true,
          data: result,
          message: 'market.txt updated successfully',
        },
      }));
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      setApiCall(prev => ({
        ...prev,
        response: {
          success: false,
          error: errorMsg,
          details: err.response?.data,
        },
      }));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-6 text-center">
        <h3 className="m-0 mb-2 text-2xl text-text-primary">FRED Interest Rate Data</h3>
        <p className="m-0 text-text-secondary text-sm">
          Fetch live interest rate data from Federal Reserve Economic Data
        </p>
      </div>

      {error && (
        <div className="bg-[#fee2e2] border border-[#fecaca] rounded-xl p-6 mb-6">
          <strong>Error:</strong> {error}
          {error.includes('FRED_API_KEY') && (
            <div className="mt-2 pt-2 border-t border-[#fecaca] text-sm">
              Add <code className="bg-black/10 py-1 px-2 rounded font-mono">FRED_API_KEY=your_key</code> to backend/.env file.
              Get your key from{' '}
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

      <div className="bg-card-bg rounded-xl shadow-md p-6 mb-6">
        <div className="series-selector">
          <label className="block mb-3 font-medium text-text-secondary">Select Series:</label>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2 mb-6">
            {AVAILABLE_SERIES.map((series) => (
              <label key={series.id} className="flex items-center py-2 px-2 rounded cursor-pointer transition-bg duration-200 hover:bg-bg-color">
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

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={loadRates}
            disabled={loading || selectedSeries.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Fetching...' : 'Fetch Rates'}
          </button>
          <button
            onClick={handleUpdateMarket}
            disabled={updating || rates.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {updating ? 'Updating...' : 'Update market.txt'}
          </button>
          <button
            onClick={() => setShowApiDetails(!showApiDetails)}
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded text-sm font-medium hover:bg-gray-200"
          >
            {showApiDetails ? 'Hide' : 'Show'} API Details
          </button>
        </div>
      </div>

      {showApiDetails && apiCall && (
        <div className="bg-card-bg rounded-xl shadow-md p-6 mb-6 border border-border-color">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-color">
            <h4 className="m-0 text-xl text-text-primary">API Call Details</h4>
            <span className="text-xs text-text-secondary">{new Date(apiCall.timestamp).toLocaleString()}</span>
          </div>

          <div className="mb-6">
            <h5 className="m-0 mb-3 text-sm text-text-secondary font-semibold uppercase tracking-wider">Request</h5>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="font-medium text-text-secondary min-w-[120px] text-sm">Type:</span>
              <span className="text-sm text-text-primary bg-bg-color py-1 px-2 rounded font-medium">
                {apiCall.type === 'FETCH_RATES' ? 'Fetch Rates' : 'Update Market'}
              </span>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="font-medium text-text-secondary min-w-[120px] text-sm">Method:</span>
              <span className="text-sm bg-primary-color text-white py-1 px-2 rounded font-medium">{apiCall.method}</span>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="font-medium text-text-secondary min-w-[120px] text-sm">URL:</span>
              <span className="text-sm font-mono bg-bg-color py-1 px-2 rounded break-all">{apiCall.fullUrl}</span>
            </div>
            {apiCall.request.query && (
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="font-medium text-text-secondary min-w-[120px] text-sm">Query Params:</span>
                <span className="text-sm text-text-primary">
                  {apiCall.request.query.map(q => `<code class="bg-bg-color py-1 px-1.5 rounded font-mono text-xs">series=${q}</code>`).join(' ')}
                </span>
              </div>
            )}
            {apiCall.request.body && (
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="font-medium text-text-secondary min-w-[120px] text-sm">Request Body:</span>
                <pre className="bg-[#1e293b] text-[#e2e8f0] py-3 px-3 rounded text-xs overflow-x-auto my-1 font-mono leading-6 m-0">{JSON.stringify(apiCall.request.body, null, 2)}</pre>
              </div>
            )}
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="font-medium text-text-secondary min-w-[120px] text-sm">Headers:</span>
              <pre className="bg-[#1e293b] text-[#e2e8f0] py-3 px-3 rounded text-xs overflow-x-auto my-1 font-mono leading-6 m-0">{JSON.stringify(apiCall.request.headers, null, 2)}</pre>
            </div>
          </div>

          {apiCall.response && (
            <div className="mb-6 last:mb-0">
              <h5 className="m-0 mb-3 text-sm text-text-secondary font-semibold uppercase tracking-wider">Response</h5>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="font-medium text-text-secondary min-w-[120px] text-sm">Status:</span>
                <span className={`text-sm font-medium ${apiCall.response.success ? 'text-success-color' : 'text-error-color'}`}>
                  {apiCall.response.success ? '✓ Success' : '✗ Error'}
                </span>
              </div>
              {apiCall.response.count !== undefined && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="font-medium text-text-secondary min-w-[120px] text-sm">Records:</span>
                  <span className="text-sm text-text-primary">{apiCall.response.count} series returned</span>
                </div>
              )}
              {apiCall.response.message && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="font-medium text-text-secondary min-w-[120px] text-sm">Message:</span>
                  <span className="text-sm text-text-primary">{apiCall.response.message}</span>
                </div>
              )}
              {apiCall.response.error && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="font-medium text-text-secondary min-w-[120px] text-sm">Error:</span>
                  <span className="text-sm text-error-color bg-[#fee2e2] py-2 px-2 rounded">{apiCall.response.error}</span>
                </div>
              )}
              {apiCall.response.data && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="font-medium text-text-secondary min-w-[120px] text-sm">Data:</span>
                  <pre className="bg-[#1e293b] text-[#e2e8f0] py-3 px-3 rounded text-xs overflow-x-auto my-1 font-mono leading-6 m-0">{JSON.stringify(apiCall.response.data, null, 2)}</pre>
                </div>
              )}
              {apiCall.response.details && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="font-medium text-text-secondary min-w-[120px] text-sm">Details:</span>
                  <pre className="bg-[#1e293b] text-[#e2e8f0] py-3 px-3 rounded text-xs overflow-x-auto my-1 font-mono leading-6 m-0">{JSON.stringify(apiCall.response.details, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          <div className="last:mb-0">
            <h5 className="m-0 mb-3 text-sm text-text-secondary font-semibold uppercase tracking-wider">FRED API Endpoint (Backend)</h5>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="font-medium text-text-secondary min-w-[120px] text-sm">Endpoint:</span>
              <span className="text-sm text-text-primary">
                https://api.stlouisfed.org/fred/series/observations
              </span>
            </div>
            <div className="mb-0 flex flex-wrap gap-2">
              <span className="font-medium text-text-secondary min-w-[120px] text-sm">Parameters:</span>
              <pre className="bg-[#1e293b] text-[#e2e8f0] py-3 px-3 rounded text-xs overflow-x-auto my-1 font-mono leading-6 m-0">{`{
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
        <div className="bg-card-bg rounded-xl shadow-md overflow-hidden mb-6">
          <table className="w-full border-collapse">
            <thead className="bg-bg-color">
              <tr>
                <th className="py-4 px-4 text-left font-semibold text-text-secondary text-sm">Series</th>
                <th className="py-4 px-4 text-left font-semibold text-text-secondary text-sm">Name</th>
                <th className="py-4 px-4 text-left font-semibold text-text-secondary text-sm">Value (%)</th>
                <th className="py-4 px-4 text-left font-semibold text-text-secondary text-sm">Date</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.seriesId} className="border-t border-border-color">
                  <td className="py-[0.875rem] px-4 text-sm"><code className="bg-bg-color py-1 px-1.5 rounded font-mono text-xs text-text-primary">{rate.seriesId}</code></td>
                  <td className="py-[0.875rem] px-4 text-sm text-text-primary">{rate.seriesName}</td>
                  <td className="py-[0.875rem] px-4 text-sm font-semibold text-primary-color">{rate.value.toFixed(3)}%</td>
                  <td className="py-[0.875rem] px-4 text-sm text-text-primary">{rate.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="py-8">
          <div className="w-10 h-10 mx-auto mb-4 border-3 border-border-color border-t-primary-color rounded-full animate-spin"></div>
          <p className="text-center text-text-primary">Fetching rates from FRED...</p>
        </div>
      )}

      {!loading && rates.length === 0 && !error && (
        <div className="text-center py-12 px-8 text-text-secondary">
          <p className="mb-2">No rate data available.</p>
          <p className="m-0">Select series and click "Fetch Rates" to get started.</p>
        </div>
      )}

      <div className="text-center py-4">
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
  );
}

export default FREDRates;
