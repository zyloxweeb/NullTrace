import type { AnalysisResult, AnalysisSummary } from "../types/analysis";

// 🔥 AUTO SWITCH DEV / PROD
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ------------------------

export async function analyzeFile(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Errore durante l'analisi del file");
  }

  return response.json();
}

export async function fetchAnalyses(): Promise<AnalysisSummary[]> {
  const response = await fetch(`${API_BASE_URL}/analyses`);

  if (!response.ok) {
    throw new Error("Errore durante il recupero delle analisi");
  }

  return response.json();
}

export async function fetchAnalysisById(
  analysisId: string
): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/analyses/${analysisId}`);

  if (!response.ok) {
    throw new Error("Errore durante il recupero del dettaglio");
  }

  return response.json();
}