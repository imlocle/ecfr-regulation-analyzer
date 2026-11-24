import type { AgencyMetric, ChangeRecord, Summary } from "@/models/types";

// Use environment variable, fallback to hardcoded for local dev
const BASE =
  import.meta.env.VITE_API_URL ||
  "https://aea0hf1q11.execute-api.us-west-1.amazonaws.com/dev";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function postJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const getAgencies = () => fetchJson<AgencyMetric[]>("/agencies");
export const getHistory = () => fetchJson<ChangeRecord[]>("/history");
export const getSummary = () => fetchJson<Summary>("/summary");
export const triggerIngest = () => postJson<{ message: string }>("/ingest");
