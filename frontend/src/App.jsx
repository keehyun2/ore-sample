import { useState, useEffect } from 'react';
import { Tabs, Tab } from './components/Tabs';
import FileSelector from './components/InputEditor/FileSelector';
import FileEditor from './components/InputEditor/FileEditor';
import FREDRates from './components/InputEditor/FREDRates';
import NPVDisplay from './components/Output/NPVDisplay';
import CashflowsTable from './components/Output/CashflowsTable';
import CurvesChart from './components/Output/CurvesChart';
import LogViewer from './components/Output/LogViewer';
import { api } from './services/api';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('irswap.xml');
  const [activeTab, setActiveTab] = useState('Input Files');
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const fileList = await api.getInputFiles();
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setActiveTab('Output Results');
    try {
      const result = await api.runORE();
      setResults(result);
    } catch (error) {
      setResults({
        success: false,
        error: error.message,
        logs: 'Failed to execute ORE',
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSave = () => {
    setEditorKey((prev) => prev + 1);
  };

  const handleResetAll = async () => {
    if (!confirm('Reset all input files to original? This will discard all your changes.')) {
      return;
    }
    setResetting(true);
    try {
      await api.resetInputFiles();
      setEditorKey((prev) => prev + 1);
      setResults(null);
    } catch (error) {
      alert('Failed to reset files: ' + error.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ORE IR Swap Valuation</h1>
        <p className="subtitle">Interest Rate Swap Pricing Engine</p>
      </header>

      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <Tab label="Input Files">
          <div className="input-tab">
            <FileSelector
              files={files}
              selected={selectedFile}
              onSelect={setSelectedFile}
            />
            <FileEditor
              key={`${selectedFile}-${editorKey}`}
              filename={selectedFile}
              onSave={handleSave}
            />
            <div className="run-section">
              <div className="action-buttons">
                <button
                  onClick={handleResetAll}
                  disabled={resetting}
                  className="reset-all-button"
                >
                  {resetting ? 'Resetting...' : 'Reset to Original Files'}
                </button>
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="run-button"
                >
                  {running ? 'Running ORE...' : 'Run Valuation'}
                </button>
              </div>
              {running && <p className="running-text">Executing ORE... this may take a moment.</p>}
            </div>
          </div>
        </Tab>

        <Tab label="FRED Rates">
          <FREDRates />
        </Tab>

        <Tab label="Output Results">
          <div className="output-tab">
            {running && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Running ORE valuation...</p>
              </div>
            )}

            {!running && !results && (
              <div className="no-results">
                <p>No results available.</p>
                <p>Run the valuation from the Input Files tab first.</p>
              </div>
            )}

            {!running && results && (
              <>
                {!results.success && (
                  <div className="error-banner">
                    <h3>Execution Failed</h3>
                    <LogViewer logs={results.logs} error={results.error} />
                  </div>
                )}

                {results.success && results.results && (
                  <div className="results-container">
                    <NPVDisplay data={results.results.npv} />
                    <CashflowsTable flows={results.results.flows} />
                    <CurvesChart curves={results.results.curves} />
                    <LogViewer logs={results.logs} />
                  </div>
                )}
              </>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

export default App;
