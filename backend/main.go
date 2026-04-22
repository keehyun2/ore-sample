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
	"strings"
	"time"
)

var (
	orePath    string
	exampleDir string
	inputDir   string
	outputDir  string
	workDir    string
	serverPort string
)

var lastRunResult *RunResult

func init() {
	loadEnvFile()

	orePath = getEnv("ORE_PATH", "/home/keehyun/dev/Engine/build/App/ore")
	exampleDir = getEnv("EXAMPLE_DIR", "/home/keehyun/dev/Engine/Examples/Academy/TA002_IR_Swap")
	inputDir = "Input"
	outputDir = "Output"
	workDir = getEnv("WORK_DIR", "./working")
	serverPort = getEnv("PORT", "8080")
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
	Success bool        `json:"success"`
	Results *Results    `json:"results,omitempty"`
	Logs    string      `json:"logs"`
	Error   string      `json:"error,omitempty"`
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

func main() {
	if err := initWorkingDir(); err != nil {
		log.Fatalf("Failed to initialize working directory: %v", err)
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/api/input/files", handleListInputFiles)
	mux.HandleFunc("/api/input/", handleInputFile)
	mux.HandleFunc("/api/input/reset", handleResetInputFiles)
	mux.HandleFunc("/api/run", handleRun)
	mux.HandleFunc("/api/results", handleGetResults)
	mux.HandleFunc("/api/config", handleGetConfig)

	handler := corsMiddleware(mux)

	addr := ":" + serverPort
	fmt.Printf("Server starting on %s\n", addr)
	fmt.Printf("ORE Path: %s\n", orePath)
	fmt.Printf("Example Dir: %s\n", exampleDir)
	fmt.Printf("Work Dir: %s\n", workDir)
	log.Fatal(http.ListenAndServe(addr, handler))
}

func handleGetConfig(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	config := map[string]string{
		"orePath":     orePath,
		"exampleDir":  exampleDir,
		"workDir":     workDir,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(config)
}

func initWorkingDir() error {
	workInputDir := filepath.Join(workDir, inputDir)

	if err := os.RemoveAll(workDir); err != nil {
		return fmt.Errorf("failed to remove existing working directory: %w", err)
	}

	if err := os.MkdirAll(workInputDir, 0755); err != nil {
		return fmt.Errorf("failed to create working directory: %w", err)
	}

	originalInputDir := filepath.Join(exampleDir, inputDir)
	if err := copyDir(originalInputDir, workInputDir); err != nil {
		return fmt.Errorf("failed to copy input files: %w", err)
	}

	fmt.Printf("Working directory initialized at: %s\n", workDir)
	return nil
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

	files := []string{
		"ore.xml",
		"irswap.xml",
		"market.txt",
		"fixings.txt",
		"curveconfig.xml",
		"todaysmarket.xml",
		"pricingengine.xml",
		"conventions.xml",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)
}

func handleInputFile(w http.ResponseWriter, r *http.Request) {
	filename := strings.TrimPrefix(r.URL.Path, "/api/input/")
	if filename == "" || filename == "reset" {
		http.Error(w, "Filename required", http.StatusBadRequest)
		return
	}

	filePath := filepath.Join(workDir, inputDir, filename)

	switch r.Method {
	case http.MethodGet:
		content, err := os.ReadFile(filePath)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(FileContent{
			Filename: filename,
			Content:  string(content),
		})

	case http.MethodPost:
		var fc FileContent
		if err := json.NewDecoder(r.Body).Decode(&fc); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if err := os.WriteFile(filePath, []byte(fc.Content), 0644); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

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

	if err := initWorkingDir(); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

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
	tempDir, err := os.MkdirTemp("", "ore-run-*")
	if err != nil {
		return &RunResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to create temp dir: %v", err),
		}
	}
	defer os.RemoveAll(tempDir)

	tempInputDir := filepath.Join(tempDir, inputDir)
	tempOutputDir := filepath.Join(tempDir, outputDir)

	if err := os.MkdirAll(tempInputDir, 0755); err != nil {
		return &RunResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to create temp input dir: %v", err),
		}
	}

	workInputDir := filepath.Join(workDir, inputDir)
	if err := copyDir(workInputDir, tempInputDir); err != nil {
		return &RunResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to copy input files: %v", err),
		}
	}

	oreXmlPath := filepath.Join(tempInputDir, "ore.xml")
	cmd := exec.Command(orePath, oreXmlPath)
	cmd.Dir = tempDir

	var stdout, stderr strings.Builder
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	start := time.Now()
	err = cmd.Run()
	duration := time.Since(start)

	logs := fmt.Sprintf("Execution time: %v\n\nSTDOUT:\n%s\n\nSTDERR:\n%s",
		duration, stdout.String(), stderr.String())

	if err != nil {
		return &RunResult{
			Success: false,
			Logs:    logs,
			Error:   fmt.Sprintf("ORE execution failed: %v", err),
		}
	}

	results, err := parseResults(tempOutputDir)
	if err != nil {
		return &RunResult{
			Success: false,
			Logs:    logs,
			Error:   fmt.Sprintf("Failed to parse results: %v", err),
		}
	}

	return &RunResult{
		Success: true,
		Results: results,
		Logs:    logs,
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
