import type { Summary } from "@/models/types";
import InfoTooltip from "@/components/InfoTooltip";
import "@/styles/SummaryBar.css";

interface Props {
  summary: Summary | null;
  loading: boolean;
}

const SummaryBar = ({ summary, loading }: Props) => {
  if (loading) return <p className="loading">Loading summary…</p>;
  if (!summary) return null;

  return (
    <section className="summary-bar" aria-label="Data summary">
      <div className="stat">
        <span className="stat-value">{summary.titlesDownloaded}</span>
        <span className="stat-label">
          Titles Downloaded
          <InfoTooltip text="Number of CFR titles successfully downloaded and processed from the eCFR API" />
        </span>
      </div>
      <div className="stat">
        <span className="stat-value">{summary.agenciesProcessed}</span>
        <span className="stat-label">
          Agencies Processed
          <InfoTooltip text="Number of federal agencies analyzed with computed metrics" />
        </span>
      </div>
      <div className="stat">
        <span className="stat-value">{summary.historyPeriods}</span>
        <span className="stat-label">
          History Periods
          <InfoTooltip text="Number of time periods (months) with recorded amendment activity" />
        </span>
      </div>
      <div className="stat">
        <span className="stat-value">{summary.lastUpdated}</span>
        <span className="stat-label">
          Last Updated
          <InfoTooltip text="Date when the data was last ingested from the eCFR API" />
        </span>
      </div>
    </section>
  );
};

export default SummaryBar;
