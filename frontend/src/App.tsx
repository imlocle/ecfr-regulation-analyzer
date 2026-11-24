import { useEffect, useState } from "react";
import {
  getAgencies,
  getHistory,
  getSummary,
  triggerIngest,
} from "@/services/api";
import type { AgencyMetric, ChangeRecord, Summary } from "@/models/types";
import SummaryBar from "@/components/SummaryBar";
import AgencyTable from "@/components/AgencyTable";
import HistoryChart from "@/components/HistoryChart";
import IngestDataButton from "@/components/IngestDataButton";

const App = () => {
  const [agencies, setAgencies] = useState<AgencyMetric[]>([]);
  const [history, setHistory] = useState<ChangeRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoIngesting, setAutoIngesting] = useState(false);
  const [ingestMessage, setIngestMessage] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [agenciesData, historyData, summaryData] = await Promise.all([
        getAgencies(),
        getHistory(),
        getSummary(),
      ]);
      setAgencies(agenciesData);
      setHistory(historyData);
      setSummary(summaryData);

      // Check if data is empty and auto-trigger ingestion
      if (agenciesData.length === 0 && !autoIngesting) {
        setAutoIngesting(true);
        setIngestMessage("No data found. Starting initial data ingestion...");

        try {
          await triggerIngest();
          setIngestMessage(
            "Data ingestion started! This may take 5-10 minutes. The page will auto-refresh when complete."
          );

          // Poll for data every 30 seconds
          const pollInterval = setInterval(async () => {
            try {
              const [newAgencies, newHistory, newSummary] = await Promise.all([
                getAgencies(),
                getHistory(),
                getSummary(),
              ]);

              setAgencies(newAgencies);
              setHistory(newHistory);
              setSummary(newSummary);

              if (newAgencies.length > 0) {
                clearInterval(pollInterval);
                setAutoIngesting(false);
                setIngestMessage("");
              }
            } catch (e) {
              // Continue polling on error
            }
          }, 30000);

          // Stop polling after 15 minutes
          setTimeout(() => {
            clearInterval(pollInterval);
            if (autoIngesting) {
              setAutoIngesting(false);
              setIngestMessage("");
              setError(
                "Data ingestion is taking longer than expected. Please refresh the page manually."
              );
            }
          }, 900000);
        } catch (e: any) {
          setAutoIngesting(false);
          setError(`Failed to start data ingestion: ${e.message}`);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main>
      <header>
        <div className="header-content">
          <div>
            <h1>eCFR Regulation Analyzer</h1>
            <p>Federal regulation analytics for deregulation decision-making</p>
          </div>
          <IngestDataButton onError={setError} />
        </div>
      </header>

      {error && (
        <div className="error" role="alert">
          Error: {error}
        </div>
      )}

      {autoIngesting && (
        <div className="auto-ingest-notice" role="status">
          <div className="spinner-large" aria-hidden="true"></div>
          <div>
            <h2>Ingesting Data</h2>
            <p>{ingestMessage}</p>
            <p className="subtext">
              This process downloads and analyzes federal regulations from the
              eCFR API. You can leave this page and come back later.
            </p>
          </div>
        </div>
      )}

      <SummaryBar summary={summary} loading={loading} />
      <HistoryChart history={history} loading={loading} />
      <AgencyTable agencies={agencies} loading={loading} />
    </main>
  );
};

export default App;
