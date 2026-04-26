package main

import (
	"bufio"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

var (
	orePath       string
	inputDir      string
	outputDir     string
	workDir       string
	serverPort    string
	fredApiKey    string
	currentExample string
	exampleDirs   map[string]string
)

var lastRunResult *RunResult

func init() {
	loadEnvFile()

	orePath = getEnv("ORE_PATH", "/home/keehyun/dev/Engine/build/App/ore")
	inputDir = "Input"
	outputDir = "Output"
	workDirRaw := getEnv("WORK_DIR", "./working")
	// Convert to absolute path
	if absPath, err := filepath.Abs(workDirRaw); err == nil {
		workDir = absPath
	} else {
		workDir = workDirRaw
	}
	serverPort = getEnv("PORT", "8080")
	fredApiKey = getEnv("FRED_API_KEY", "")

	// Define example directories
	exampleDirs = map[string]string{
		"IRSwap":        "/home/keehyun/dev/Engine/Examples/Academy/TA002_IR_Swap",
		"OIS-consistency": "/home/keehyun/dev/Engine/Examples/CurveBuilding",
	}

	// Set current example (default to IRSwap)
	currentExample = "IRSwap"
}

func loadEnvFile() {
	file, err := os.Open(".env")
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])
			os.Setenv(key, value)
		}
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

type RunResult struct {
	Success bool     `json:"success"`
	Results *Results `json:"results,omitempty"`
	Logs    string   `json:"logs"`
	Error   string   `json:"error,omitempty"`
}

type Results struct {
	NPV    NPVResult    `json:"npv"`
	Flows  []Cashflow   `json:"flows"`
	Curves []CurvePoint `json:"curves"`
}

type NPVResult struct {
	TradeId      string  `json:"tradeId"`
	TradeType    string  `json:"tradeType"`
	Maturity     string  `json:"maturity"`
	NPV          float64 `json:"npv"`
	Currency     string  `json:"currency"`
	Notional     float64 `json:"notional"`
	NettingSet   string  `json:"nettingSet"`
	CounterParty string  `json:"counterParty"`
}

type Cashflow struct {
	Date     string  `json:"date"`
	Amount   float64 `json:"amount"`
	Leg      string  `json:"leg"`
	Currency string  `json:"currency"`
	TradeId  string  `json:"tradeId"`
}

type CurvePoint struct {
	Date  string  `json:"date"`
	EUR1D float64 `json:"eur1d"`
	EUR6M float64 `json:"eur6m"`
}

type FileContent struct {
	Filename string `json:"filename"`
	Content  string `json:"content"`
}

// FileReference holds information about a file referenced in ore.xml
type FileReference struct {
	ParamName string // e.g., "marketDataFile", "portfolioFile"
	FilePath  string // e.g., "../../Input/market_20160205.txt"
}

func main() {
	// Initialize all example working directories on startup
	for exampleName := range exampleDirs {
		if err := initWorkingDirForExample(exampleName); err != nil {
			log.Fatalf("Failed to initialize working directory for example '%s': %v", exampleName, err)
		}
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/api/input/files", handleListInputFiles)
	mux.HandleFunc("/api/input/", handleInputFile)
	mux.HandleFunc("/api/input/reset", handleResetInputFiles)
	mux.HandleFunc("/api/run", handleRun)
	mux.HandleFunc("/api/results", handleGetResults)
	mux.HandleFunc("/api/config", handleGetConfig)
	mux.HandleFunc("/api/example/switch", handleSwitchExample)
	mux.HandleFunc("/api/fred/rates", handleGetFREDRates)
	mux.HandleFunc("/api/fred/update", handleUpdateMarketFromFRED)

	handler := corsMiddleware(mux)

	addr := ":" + serverPort
	fmt.Printf("Server starting on %s\n", addr)
	fmt.Printf("ORE Path: %s\n", orePath)
	fmt.Printf("Current Example: %s (%s)\n", currentExample, getCurrentExampleDir())
	fmt.Printf("Work Dir: %s\n", workDir)
	log.Fatal(http.ListenAndServe(addr, handler))
}

func handleGetConfig(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	config := map[string]interface{}{
		"orePath":        orePath,
		"currentExample": currentExample,
		"workDir":        workDir,
		"availableExamples": getAvailableExamples(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(config)
}

func getAvailableExamples() []string {
	examples := make([]string, 0, len(exampleDirs))
	for name := range exampleDirs {
		examples = append(examples, name)
	}
	return examples
}

func getCurrentExampleDir() string {
	if dir, ok := exampleDirs[currentExample]; ok {
		return dir
	}
	return exampleDirs["IRSwap"]
}

func getExampleWorkDir() string {
	return filepath.Join(workDir, currentExample)
}

func initWorkingDir() error {
	return initWorkingDirForExample(currentExample)
}

func initWorkingDirForExample(exampleName string) error {
	exampleDir, ok := exampleDirs[exampleName]
	if !ok {
		return fmt.Errorf("unknown example: %s", exampleName)
	}

	// Use example-specific working directory
	exampleWorkDir := filepath.Join(workDir, exampleName)
	workInputDir := filepath.Join(exampleWorkDir, inputDir)

	if err := os.RemoveAll(exampleWorkDir); err != nil {
		return fmt.Errorf("failed to remove existing working directory: %w", err)
	}

	if err := os.MkdirAll(workInputDir, 0755); err != nil {
		return fmt.Errorf("failed to create working directory: %w", err)
	}

	// Parse ore*.xml to get required files and the ore.xml filename
	refs, oreFileName, err := getRequiredFilesFromXML(exampleDir, exampleName)
	if err != nil {
		return fmt.Errorf("failed to parse required files: %w", err)
	}

	fmt.Printf("Found %d file references in %s\n", len(refs), oreFileName)

	// Copy the main ore*.xml file as "ore.xml" for ORE to find it
	oreSrcPath := filepath.Join(exampleDir, "Input", oreFileName)
	oreDstPath := filepath.Join(workInputDir, "ore.xml")
	if err := copyAndCleanOreXml(oreSrcPath, oreDstPath); err != nil {
		return fmt.Errorf("failed to copy ore.xml: %w", err)
	}
	fmt.Printf("Copied: %s -> ore.xml (cleaned paths)\n", oreFileName)

	// Copy only referenced files
	if err := copyReferencedFiles(exampleDir, workInputDir, refs); err != nil {
		return fmt.Errorf("failed to copy input files: %w", err)
	}

	fmt.Printf("Working directory initialized for example '%s' at: %s\n", exampleName, exampleWorkDir)
	return nil
}

// getRequiredFilesFromXML parses the ore*.xml file and returns file references
// Also returns the name of the ore.xml file that should be used
func getRequiredFilesFromXML(exampleDir, exampleName string) ([]FileReference, string, error) {
	// Find the ore*.xml file based on example name
	var oreFileName string
	switch exampleName {
	case "IRSwap":
		oreFileName = "ore.xml"
	case "OIS-consistency":
		oreFileName = "ore_consistency_ois.xml"
	default:
		return nil, "", fmt.Errorf("unknown example: %s", exampleName)
	}

	oreXmlPath := filepath.Join(exampleDir, "Input", oreFileName)
	content, err := os.ReadFile(oreXmlPath)
	if err != nil {
		return nil, "", fmt.Errorf("failed to read ore.xml: %w", err)
	}

	// Parse XML to extract file references from Parameter tags
	// Pattern: <Parameter name="*File">path</Parameter>
	// Exclude logFile as it's an output file, not an input file
	var refs []FileReference
	re := regexp.MustCompile(`<Parameter name="([^"]*File)">(.*?)</Parameter>`)
	matches := re.FindAllStringSubmatch(string(content), -1)

	for _, match := range matches {
		if len(match) >= 3 {
			paramName := match[1]
			// Skip logFile as it's an output file, not input
			if paramName == "logFile" {
				continue
			}
			refs = append(refs, FileReference{
				ParamName: paramName,
				FilePath:  strings.TrimSpace(match[2]),
			})
		}
	}

	return refs, oreFileName, nil
}

// copyReferencedFiles copies only the files referenced in the ore.xml
func copyReferencedFiles(exampleDir, workInputDir string, refs []FileReference) error {
	for _, ref := range refs {
		var srcPath string
		var dstName string

		if strings.HasPrefix(ref.FilePath, "../../") {
			// File is in parent directory - resolve from exampleDir parent
			// exampleDir = /home/keehyun/dev/Engine/Examples/CurveBuilding
			// ../../Input/ means go up from CurveBuilding to Examples, then into Input
			baseDir := filepath.Dir(exampleDir) // Go up one level (CurveBuilding -> Examples)
			relativePath := strings.TrimPrefix(strings.TrimPrefix(ref.FilePath, "../"), "../")
			srcPath = filepath.Join(baseDir, relativePath)
			dstName = filepath.Base(ref.FilePath) // Use just filename for destination
		} else {
			// File is in the same Input directory
			srcPath = filepath.Join(exampleDir, "Input", ref.FilePath)
			dstName = ref.FilePath
		}

		dstPath := filepath.Join(workInputDir, dstName)

		// Check if source file exists before copying
		if _, err := os.Stat(srcPath); err != nil {
			fmt.Printf("Warning: Source file not found, skipping: %s (error: %v)\n", srcPath, err)
			continue
		}

		// Copy the file
		if err := copyFile(srcPath, dstPath); err != nil {
			fmt.Printf("Error copying file: %s -> %s (error: %v)\n", srcPath, dstPath, err)
			return fmt.Errorf("failed to copy %s: %w", ref.FilePath, err)
		}

		fmt.Printf("Copied: %s -> %s\n", ref.FilePath, dstName)
	}

	return nil
}

// copyFile copies a single file from src to dst
func copyFile(src, dst string) error {
	srcFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	dstFile, err := os.OpenFile(dst, os.O_WRONLY|os.O_CREATE, 0644)
	if err != nil {
		return err
	}
	defer dstFile.Close()

	_, err = io.Copy(dstFile, srcFile)
	return err
}

// copyAndCleanOreXml copies ore.xml and removes ../../Input/ paths
func copyAndCleanOreXml(src, dst string) error {
	content, err := os.ReadFile(src)
	if err != nil {
		return err
	}

	// Remove ../../Input/ paths and replace with just the filename
	cleaned := strings.ReplaceAll(string(content), "../../Input/", "")

	return os.WriteFile(dst, []byte(cleaned), 0644)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func handleListInputFiles(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	workInputDir := filepath.Join(getExampleWorkDir(), inputDir)

	files, err := listFiles(workInputDir)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)
}

func listFiles(dir string) ([]string, error) {
	var files []string

	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			files = append(files, entry.Name())
		}
	}

	return files, nil
}

func handleSwitchExample(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Example string `json:"example"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding switch request: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("Switching example from '%s' to '%s'", currentExample, req.Example)

	if _, ok := exampleDirs[req.Example]; !ok {
		log.Printf("Unknown example requested: %s", req.Example)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": fmt.Sprintf("Unknown example: %s", req.Example),
			"available": fmt.Sprintf("%v", getAvailableExamples()),
		})
		return
	}

	// Just change the current example - files are already copied during startup
	currentExample = req.Example

	// Clear previous results
	lastRunResult = nil

	log.Printf("Successfully switched to example '%s'", currentExample)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":           "ok",
		"currentExample":   currentExample,
		"message":          fmt.Sprintf("Switched to %s example", currentExample),
	})
}

func handleInputFile(w http.ResponseWriter, r *http.Request) {
	filename := strings.TrimPrefix(r.URL.Path, "/api/input/")
	if filename == "" || filename == "reset" {
		http.Error(w, "Filename required", http.StatusBadRequest)
		return
	}

	filePath := filepath.Join(getExampleWorkDir(), inputDir, filename)

	switch r.Method {
	case http.MethodGet:
		content, err := os.ReadFile(filePath)
		if err != nil {
			log.Printf("Error reading file '%s': %v (filePath: %s)", filename, err, filePath)
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}

		log.Printf("Serving file: %s", filename)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(FileContent{
			Filename: filename,
			Content:  string(content),
		})

	case http.MethodPost:
		var fc FileContent
		if err := json.NewDecoder(r.Body).Decode(&fc); err != nil {
			log.Printf("Error decoding request for '%s': %v", filename, err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if err := os.WriteFile(filePath, []byte(fc.Content), 0644); err != nil {
			log.Printf("Error writing file '%s': %v", filename, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		log.Printf("Updated file: %s", filename)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleResetInputFiles(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	log.Printf("Resetting input files for example '%s'", currentExample)
	if err := initWorkingDirForExample(currentExample); err != nil {
		log.Printf("Error resetting input files: %v", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	log.Printf("Input files reset successfully for example '%s'", currentExample)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "message": "Input files reset to original"})
}

func handleRun(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	result := runORE()
	lastRunResult = result

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func handleGetResults(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if lastRunResult == nil {
		http.Error(w, "No results available", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(lastRunResult)
}

func runORE() *RunResult {
	// Use working directory for the current example instead of temp
	exampleWorkDir := getExampleWorkDir()
	workInputDir := filepath.Join(exampleWorkDir, inputDir)
	workOutputDir := filepath.Join(exampleWorkDir, outputDir)

	// Clean and create output directory
	if err := os.RemoveAll(workOutputDir); err != nil {
		return &RunResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to clean output dir: %v", err),
		}
	}
	if err := os.MkdirAll(workOutputDir, 0755); err != nil {
		return &RunResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to create output dir: %v", err),
		}
	}

	oreXmlPath := filepath.Join(workInputDir, "ore.xml")
	cmd := exec.Command(orePath, oreXmlPath)
	cmd.Dir = exampleWorkDir

	var stdout, stderr strings.Builder
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	start := time.Now()
	runErr := cmd.Run()
	duration := time.Since(start)

	// Try to read ORE log.txt if it exists
	var oreLogs string
	logPath := filepath.Join(workOutputDir, "log.txt")
	if logContent, readErr := os.ReadFile(logPath); readErr == nil {
		oreLogs = string(logContent)
	} else {
		oreLogs = fmt.Sprintf("Execution time: %v\n\nSTDOUT:\n%s\n\nSTDERR:\n%s",
			duration, stdout.String(), stderr.String())
	}

	// Check if ORE executed successfully (look for "ORE done" in output)
	oreOutput := stdout.String()
	if !strings.Contains(oreOutput, "ORE done") && runErr != nil {
		return &RunResult{
			Success: false,
			Logs:    oreLogs,
			Error:   fmt.Sprintf("ORE execution failed: %v", runErr),
		}
	}

	// Check if output files exist
	npvPath := filepath.Join(workOutputDir, "npv.csv")
	if _, statErr := os.Stat(npvPath); os.IsNotExist(statErr) {
		// ORE ran successfully but no NPV output (some examples may not produce NPV)
		return &RunResult{
			Success: true,
			Logs:    oreLogs,
			Results: nil, // No results available
		}
	}

	results, err := parseResults(workOutputDir)
	if err != nil {
		return &RunResult{
			Success: false,
			Logs:    oreLogs,
			Error:   fmt.Sprintf("Failed to parse results: %v", err),
		}
	}

	return &RunResult{
		Success: true,
		Results: results,
		Logs:    oreLogs,
	}
}

func parseResults(outputDir string) (*Results, error) {
	npv, err := parseNPV(filepath.Join(outputDir, "npv.csv"))
	if err != nil {
		return nil, fmt.Errorf("failed to parse NPV: %w", err)
	}

	flows, err := parseCashflows(filepath.Join(outputDir, "flows.csv"))
	if err != nil {
		return nil, fmt.Errorf("failed to parse cashflows: %w", err)
	}

	curves, err := parseCurves(filepath.Join(outputDir, "curves.csv"))
	if err != nil {
		return nil, fmt.Errorf("failed to parse curves: %w", err)
	}

	return &Results{
		NPV:    npv,
		Flows:  flows,
		Curves: curves,
	}, nil
}

func parseNPV(path string) (NPVResult, error) {
	file, err := os.Open(path)
	if err != nil {
		return NPVResult{}, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return NPVResult{}, err
	}

	if len(records) < 2 {
		return NPVResult{}, fmt.Errorf("not enough records in NPV file")
	}

	row := records[1]
	return NPVResult{
		TradeId:      row[0],
		TradeType:    row[1],
		Maturity:     row[2],
		NPV:          parseFloat(row[4]),
		Currency:     row[5],
		Notional:     parseFloat(row[8]),
		NettingSet:   row[11],
		CounterParty: row[12],
	}, nil
}

func parseCashflows(path string) ([]Cashflow, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	var flows []Cashflow
	for i, row := range records {
		if i == 0 {
			continue
		}
		if len(row) < 18 {
			continue
		}
		// CSV columns: TradeId, Type, CashflowNo, LegNo, PayDate, FlowType, Amount, Currency, ...
		legNo := row[3]
		legType := "Fixed"
		if legNo == "1" {
			legType = "Floating"
		}
		flows = append(flows, Cashflow{
			Date:     row[4],
			Amount:   parseFloat(row[6]),
			Leg:      legType,
			Currency: row[7],
			TradeId:  row[0],
		})
	}

	return flows, nil
}

func parseCurves(path string) ([]CurvePoint, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	var curves []CurvePoint
	for i, row := range records {
		if i == 0 {
			continue
		}
		if len(row) < 5 {
			continue
		}
		curves = append(curves, CurvePoint{
			Date:  row[0],
			EUR1D: parseFloat(row[1]),
			EUR6M: parseFloat(row[4]),
		})
	}

	return curves, nil
}

func copyDir(src, dst string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}

		dstPath := filepath.Join(dst, relPath)

		if info.IsDir() {
			return os.MkdirAll(dstPath, info.Mode())
		}

		srcFile, err := os.Open(path)
		if err != nil {
			return err
		}
		defer srcFile.Close()

		dstFile, err := os.OpenFile(dstPath, os.O_WRONLY|os.O_CREATE, info.Mode())
		if err != nil {
			return err
		}
		defer dstFile.Close()

		_, err = io.Copy(dstFile, srcFile)
		return err
	})
}

func parseFloat(s string) float64 {
	var f float64
	fmt.Sscanf(s, "%f", &f)
	return f
}

// FRED API Types

type FREDObservation struct {
	Date     string `json:"date"`
	Value    string `json:"value"`
	Realtime string `json:"realtime_start,omitempty"`
}

type FREDSeriesResponse struct {
	SeriesID     string            `json:"series_id"`
	SeriesName   string            `json:"series_name,omitempty"`
	Observations []FREDObservation `json:"observations"`
}

type FREDRate struct {
	SeriesID   string  `json:"seriesId"`
	SeriesName string  `json:"seriesName"`
	Value      float64 `json:"value"`
	Date       string  `json:"date"`
}

type FREDUpdateRequest struct {
	SeriesIDs []string `json:"seriesIds"`
}

// FRED API Handlers

func handleGetFREDRates(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if fredApiKey == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]string{
			"error":        "FRED_API_KEY not configured. Please add FRED_API_KEY to your .env file.",
			"instructions": "Get your API key from https://fred.stlouisfed.org/docs/api/api_key.html",
		})
		return
	}

	seriesIDs := r.URL.Query()["series"]
	if len(seriesIDs) == 0 {
		seriesIDs = []string{"DGS10", "DGS2", "DGS3MO", "FEDFUNDS"}
	}

	rates, err := fetchFREDRates(seriesIDs)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rates)
}

func handleUpdateMarketFromFRED(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if fredApiKey == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]string{
			"error":        "FRED_API_KEY not configured",
			"instructions": "Add FRED_API_KEY to your .env file",
		})
		return
	}

	var req FREDUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if len(req.SeriesIDs) == 0 {
		req.SeriesIDs = []string{"DGS10", "DGS2", "DGS3MO", "FEDFUNDS"}
	}

	// Get as-of date from ore.xml
	asofDate, err := getAsofDateFromORE()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("Failed to read ore.xml: %v", err)})
		return
	}

	rates, err := fetchFREDRates(req.SeriesIDs)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	marketContent, err := generateMarketFileFromRates(rates, asofDate)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	marketPath := filepath.Join(workDir, inputDir, "market.txt")
	if err := os.WriteFile(marketPath, []byte(marketContent), 0644); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Update curveconfig.xml with available quotes
	curveConfigContent, err := updateCurveConfig(rates)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("Failed to update curveconfig.xml: %v", err)})
		return
	}

	curveConfigPath := filepath.Join(workDir, inputDir, "curveconfig.xml")
	if err := os.WriteFile(curveConfigPath, []byte(curveConfigContent), 0644); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":             "ok",
		"message":            "market.txt and curveconfig.xml updated with FRED data",
		"rates":              rates,
		"asofDate":           asofDate,
		"marketContent":      marketContent,
		"curveConfigContent": curveConfigContent,
	})
}

func fetchFREDRates(seriesIDs []string) ([]FREDRate, error) {
	var rates []FREDRate
	client := &http.Client{Timeout: 30 * time.Second}

	for _, seriesID := range seriesIDs {
		url := fmt.Sprintf("https://api.stlouisfed.org/fred/series/observations?series_id=%s&api_key=%s&file_type=json&limit=1&sort_order=desc",
			seriesID, fredApiKey)

		resp, err := client.Get(url)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch %s: %w", seriesID, err)
		}
		defer resp.Body.Close()

		var data FREDSeriesResponse
		if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
			return nil, fmt.Errorf("failed to decode %s response: %w", seriesID, err)
		}

		if len(data.Observations) == 0 {
			continue
		}

		obs := data.Observations[0]
		if obs.Value == "." {
			continue
		}

		var value float64
		fmt.Sscanf(obs.Value, "%f", &value)

		rates = append(rates, FREDRate{
			SeriesID:   seriesID,
			SeriesName: getSeriesName(seriesID),
			Value:      value,
			Date:       obs.Date,
		})
	}

	return rates, nil
}

func getSeriesName(seriesID string) string {
	names := map[string]string{
		"DGS10":       "10-Year Treasury Constant Maturity Rate",
		"DGS2":        "2-Year Treasury Constant Maturity Rate",
		"DGS3MO":      "3-Month Treasury Constant Maturity Rate",
		"DGS1MO":      "1-Month Treasury Constant Maturity Rate",
		"DGS5":        "5-Year Treasury Constant Maturity Rate",
		"DGS7":        "7-Year Treasury Constant Maturity Rate",
		"DGS20":       "20-Year Treasury Constant Maturity Rate",
		"DGS30":       "30-Year Treasury Constant Maturity Rate",
		"FEDFUNDS":    "Federal Funds Effective Rate",
		"EURIBOR6M":   "6-Month EURIBOR Rate",
		"USD6MTD156N": "6-Month USD LIBOR",
		"SOFR":        "Secured Overnight Financing Rate",
	}
	if name, ok := names[seriesID]; ok {
		return name
	}
	return seriesID
}

func getAsofDateFromORE() (string, error) {
	oreXmlPath := filepath.Join(workDir, inputDir, "ore.xml")
	content, err := os.ReadFile(oreXmlPath)
	if err != nil {
		return "", err
	}

	// Parse XML to find asofDate parameter
	re := regexp.MustCompile(`<Parameter name="asofDate">([^<]+)</Parameter>`)
	matches := re.FindStringSubmatch(string(content))
	if len(matches) < 2 {
		return "", fmt.Errorf("asofDate not found in ore.xml")
	}

	dateStr := matches[1]
	// Parse date and convert to ORE format (YYYYMMDD)
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return "", fmt.Errorf("invalid asofDate format: %w", err)
	}

	return t.Format("20060102"), nil
}

func generateMarketFileFromRates(rates []FREDRate, asofDate string) (string, error) {
	var builder strings.Builder
	builder.WriteString("# Market data generated from FRED\n")
	builder.WriteString(fmt.Sprintf("# Generated: %s\n\n", time.Now().Format("2006-01-02 15:04:05")))

	today := asofDate

	// Build rate maps for OIS and Swap
	oisMap := make(map[string]float64)  // For EUR1D
	swapMap := make(map[string]float64) // For EUR6M

	for _, rate := range rates {
		mapping := getORETermMapping(rate.SeriesID)
		if mapping.Code == "" {
			continue
		}
		rateValue := rate.Value / 100.0

		// OIS (EUR1D)
		if mapping.OISCode != "" {
			oisMap[mapping.OISCode] = rateValue
		}

		// Swap (EUR6M)
		if mapping.SwapCode != "" {
			swapMap[mapping.SwapCode] = rateValue
		}
	}

	// Write EUR1D / OIS section (only available data)
	builder.WriteString("#EUR1D\n")
	builder.WriteString("#DEPOSIT\n")
	if onRate, ok := oisMap["1D"]; ok {
		builder.WriteString(fmt.Sprintf("%s MM/RATE/EUR/0D/1D %.4f\n", today, onRate))
	}
	builder.WriteString("#OIS\n")

	// Sort OIS tenors
	oisTenors := []string{"1M", "3M", "2Y", "5Y", "7Y", "10Y", "20Y", "30Y"}
	for _, tenor := range oisTenors {
		if rate, ok := oisMap[tenor]; ok {
			builder.WriteString(fmt.Sprintf("%s IR_SWAP/RATE/EUR/2D/1D/%s %.4f\n", today, tenor, rate))
		}
	}
	builder.WriteString("\n")

	// Write EUR6M / Swap section (only available data)
	builder.WriteString("#EUR6M\n")
	builder.WriteString("#DEPOSIT\n")
	// Use shortest swap rate for 6M deposit
	for _, tenor := range []string{"2Y", "5Y", "7Y", "10Y", "20Y", "30Y"} {
		if rate, ok := swapMap[tenor]; ok {
			builder.WriteString(fmt.Sprintf("%s MM/RATE/EUR/2D/6M %.4f\n", today, rate))
			break
		}
	}
	builder.WriteString("#SWAP\n")

	// Sort Swap tenors
	swapTenors := []string{"2Y", "5Y", "7Y", "10Y", "20Y", "30Y"}
	for _, tenor := range swapTenors {
		if rate, ok := swapMap[tenor]; ok {
			builder.WriteString(fmt.Sprintf("%s IR_SWAP/RATE/EUR/2D/6M/%s %.4f\n", today, tenor, rate))
		}
	}

	return builder.String(), nil
}

func getTermFromSeriesID(seriesID string) string {
	terms := map[string]string{
		"DGS1MO":   "1M",
		"DGS3MO":   "3M",
		"DGS2":     "2Y",
		"DGS5":     "5Y",
		"DGS7":     "7Y",
		"DGS10":    "10Y",
		"DGS20":    "20Y",
		"DGS30":    "30Y",
		"FEDFUNDS": "ON",
	}
	if term, ok := terms[seriesID]; ok {
		return term
	}
	return ""
}

type ORETerm struct {
	Code     string
	OISCode  string
	SwapCode string
}

func getORETermMapping(seriesID string) ORETerm {
	mappings := map[string]ORETerm{
		"DGS1MO":   {Code: "1M", OISCode: "1M", SwapCode: ""},
		"DGS3MO":   {Code: "3M", OISCode: "3M", SwapCode: ""},
		"FEDFUNDS": {Code: "ON", OISCode: "1D", SwapCode: ""},
		"DGS2":     {Code: "2Y", OISCode: "2Y", SwapCode: "2Y"},
		"DGS5":     {Code: "5Y", OISCode: "5Y", SwapCode: "5Y"},
		"DGS7":     {Code: "7Y", OISCode: "7Y", SwapCode: "7Y"},
		"DGS10":    {Code: "10Y", OISCode: "10Y", SwapCode: "10Y"},
		"DGS20":    {Code: "20Y", OISCode: "20Y", SwapCode: "20Y"},
		"DGS30":    {Code: "30Y", OISCode: "30Y", SwapCode: "30Y"},
	}
	if mapping, ok := mappings[seriesID]; ok {
		return mapping
	}
	return ORETerm{Code: "", OISCode: "", SwapCode: ""}
}

func updateCurveConfig(rates []FREDRate) (string, error) {
	var builder strings.Builder
	builder.WriteString(`<?xml version="1.0" encoding="utf-8"?>
<!-- CurveConfiguration generated from FRED data -->
`)
	builder.WriteString(fmt.Sprintf("<!-- Generated: %s -->\n", time.Now().Format("2006-01-02 15:04:05")))
	builder.WriteString(`
<CurveConfiguration>
  <YieldCurves>
`)

	// Collect available OIS and Swap codes
	var oisCodes []string
	var swapCodes []string

	for _, rate := range rates {
		mapping := getORETermMapping(rate.SeriesID)
		if mapping.OISCode != "" {
			oisCodes = append(oisCodes, mapping.OISCode)
		}
		if mapping.SwapCode != "" {
			swapCodes = append(swapCodes, mapping.SwapCode)
		}
	}

	// Write EUR1D curve
	builder.WriteString(`    <!-- EUR1D: EUR discount curve -->
    <YieldCurve>
      <CurveId>EUR1D</CurveId>
      <CurveDescription>EUR discount curve from FRED data</CurveDescription>
      <Currency>EUR</Currency>
      <DiscountCurve>EUR1D</DiscountCurve>

      <Segments>
        <Simple>
          <Type>Deposit</Type>
          <Quotes>
`)
	// Add deposit if ON is available
	for _, code := range oisCodes {
		if code == "1D" {
			builder.WriteString("            <Quote>MM/RATE/EUR/0D/1D</Quote>\n")
			break
		}
	}
	builder.WriteString(`          </Quotes>
          <Conventions>EUR-EONIA-CONVENTIONS</Conventions>
        </Simple>

        <Simple>
          <Type>OIS</Type>
          <Quotes>
`)
	// Sort OIS codes: 1M, 3M, 2Y, 5Y, 7Y, 10Y, 20Y, 30Y
	oisOrder := []string{"1M", "3M", "2Y", "5Y", "7Y", "10Y", "20Y", "30Y"}
	for _, code := range oisOrder {
		for _, c := range oisCodes {
			if c == code {
				builder.WriteString(fmt.Sprintf("            <Quote>IR_SWAP/RATE/EUR/2D/1D/%s</Quote>\n", code))
				break
			}
		}
	}
	builder.WriteString(`          </Quotes>
          <Conventions>EUR-OIS-CONVENTIONS</Conventions>
        </Simple>
      </Segments>

      <InterpolationVariable>Discount</InterpolationVariable>
      <InterpolationMethod>LogLinear</InterpolationMethod>
      <YieldCurveDayCounter>A365</YieldCurveDayCounter>
      <Tolerance>0.000000000001</Tolerance>
    </YieldCurve>

`)

	// Write EUR6M curve
	builder.WriteString(`    <!-- EUR6M: EUR 6M LIBOR forwarding curve -->
    <YieldCurve>
      <CurveId>EUR6M</CurveId>
      <CurveDescription>EUR 6M forwarding curve from FRED data</CurveDescription>
      <Currency>EUR</Currency>
      <DiscountCurve>EUR1D</DiscountCurve>

      <Segments>
        <Simple>
          <Type>Deposit</Type>
          <Quotes>
            <Quote>MM/RATE/EUR/2D/6M</Quote>
          </Quotes>
          <Conventions>EUR-EURIBOR-CONVENTIONS</Conventions>
          <ProjectionCurve>EUR6M</ProjectionCurve>
        </Simple>

        <Simple>
          <Type>Swap</Type>
          <Quotes>
`)
	swapOrder := []string{"2Y", "5Y", "7Y", "10Y", "20Y", "30Y"}
	for _, code := range swapOrder {
		for _, c := range swapCodes {
			if c == code {
				builder.WriteString(fmt.Sprintf("            <Quote>IR_SWAP/RATE/EUR/2D/6M/%s</Quote>\n", code))
				break
			}
		}
	}
	builder.WriteString(`          </Quotes>
          <Conventions>EUR-6M-SWAP-CONVENTIONS</Conventions>
          <ProjectionCurve>EUR6M</ProjectionCurve>
        </Simple>
      </Segments>
    </YieldCurve>

  </YieldCurves>
</CurveConfiguration>
`)

	return builder.String(), nil
}
