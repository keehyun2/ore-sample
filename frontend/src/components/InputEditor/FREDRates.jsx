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
    try {
      const data = await api.getFREDRates(selectedSeries);
      setRates(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
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
    try {
      const result = await api.updateMarketFromFRED(selectedSeries);
      alert('Market file updated successfully!');
      setRates(result.rates);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fred-rates-container">
      <div className="fred-header">
        <h3>FRED Interest Rate Data</h3>
        <p className="fred-subtitle">
          Fetch live interest rate data from Federal Reserve Economic Data
        </p>
      </div>

      {error && (
        <div className="error-banner fred-error">
          <strong>Error:</strong> {error}
          {error.includes('FRED_API_KEY') && (
            <div className="error-help">
              Add <code>FRED_API_KEY=your_key</code> to backend/.env file.
              Get your key from{' '}
              <a
                href="https://fred.stlouisfed.org/docs/api/api_key.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                FRED API
              </a>
            </div>
          )}
        </div>
      )}

      <div className="fred-controls">
        <div className="series-selector">
          <label>Select Series:</label>
          <div className="series-checkboxes">
            {AVAILABLE_SERIES.map((series) => (
              <label key={series.id} className="series-checkbox">
                <input
                  type="checkbox"
                  checked={selectedSeries.includes(series.id)}
                  onChange={() => handleToggleSeries(series.id)}
                />
                <span>{series.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="fred-actions">
          <button
            onClick={loadRates}
            disabled={loading || selectedSeries.length === 0}
            className="fred-button fred-fetch"
          >
            {loading ? 'Fetching...' : 'Fetch Rates'}
          </button>
          <button
            onClick={handleUpdateMarket}
            disabled={updating || rates.length === 0}
            className="fred-button fred-update"
          >
            {updating ? 'Updating...' : 'Update market.txt'}
          </button>
        </div>
      </div>

      {rates.length > 0 && (
        <div className="rates-table-container">
          <table className="rates-table">
            <thead>
              <tr>
                <th>Series</th>
                <th>Name</th>
                <th>Value (%)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.seriesId}>
                  <td><code>{rate.seriesId}</code></td>
                  <td>{rate.seriesName}</td>
                  <td className="rate-value">{rate.value.toFixed(3)}%</td>
                  <td>{rate.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="loading-state fred-loading">
          <div className="spinner"></div>
          <p>Fetching rates from FRED...</p>
        </div>
      )}

      {!loading && rates.length === 0 && !error && (
        <div className="no-data">
          <p>No rate data available.</p>
          <p>Select series and click "Fetch Rates" to get started.</p>
        </div>
      )}

      <div className="fred-footer">
        <p className="fred-info">
          Data sourced from{' '}
          <a
            href="https://fred.stlouisfed.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            FRED (Federal Reserve Economic Data)
          </a>
        </p>
      </div>
    </div>
  );
}

export default FREDRates;
