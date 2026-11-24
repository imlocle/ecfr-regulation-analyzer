import { useState, useMemo } from "react";
import type { AgencyMetric } from "@/models/types";
import InfoTooltip from "@/components/InfoTooltip";
import "@/styles/AgencyTable.css";

type SortKey =
  | "agencyName"
  | "wordCount"
  | "numTitles"
  | "avgWordsPerTitle"
  | "regulatoryBurdenScore";

interface Props {
  agencies: AgencyMetric[];
  loading: boolean;
}

const AgencyTable = ({ agencies, loading }: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("regulatoryBurdenScore");
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return agencies.filter(
      agency =>
        agency.agencyName.toLowerCase().includes(query) ||
        (agency.shortName?.toLowerCase().includes(query) ?? false)
    );
  }, [agencies, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((agencyA, agencyB) => {
      const valueA = agencyA[sortKey];
      const valueB = agencyB[sortKey];

      // Handle undefined/null values (treat as 0 for numeric sorts)
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return sortAsc ? -1 : 1;
      if (valueB == null) return sortAsc ? 1 : -1;

      if (typeof valueA === "string" && typeof valueB === "string")
        return sortAsc
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      return sortAsc
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });
  }, [filtered, sortKey, sortAsc]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  // Reset to page 1 when search or sort changes
  useMemo(() => {
    setCurrentPage(1);
  }, [search, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  if (loading) return <p className="loading">Loading agencies…</p>;

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortAsc ? " ▲" : " ▼") : "";

  return (
    <section aria-label="Agency metrics">
      <div className="table-controls">
        <label htmlFor="agency-search" className="sr-only">
          Search agencies
        </label>
        <input
          id="agency-search"
          type="text"
          placeholder="Search agencies…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="result-count">{sorted.length} agencies</span>
        <label htmlFor="items-per-page" className="items-per-page">
          Show:
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={e => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th
                onClick={() => handleSort("agencyName")}
                style={{ cursor: "pointer" }}
              >
                Agency{arrow("agencyName")}
                <InfoTooltip text="Federal agency or department responsible for these regulations" />
              </th>
              <th
                onClick={() => handleSort("regulatoryBurdenScore")}
                style={{ cursor: "pointer" }}
              >
                Burden Score{arrow("regulatoryBurdenScore")}
                <InfoTooltip text="Composite metric combining complexity (word count), instability (amendments), and scope (titles). Higher scores indicate greater regulatory burden." />
              </th>
              <th
                onClick={() => handleSort("wordCount")}
                style={{ cursor: "pointer" }}
              >
                Word Count{arrow("wordCount")}
                <InfoTooltip text="Total number of words across all regulations for this agency. Indicates regulatory complexity." />
              </th>
              <th
                onClick={() => handleSort("numTitles")}
                style={{ cursor: "pointer" }}
              >
                CFR Titles{arrow("numTitles")}
                <InfoTooltip text="Number of Code of Federal Regulations titles this agency manages. Shows breadth of regulatory authority." />
              </th>
              <th
                onClick={() => handleSort("avgWordsPerTitle")}
                style={{ cursor: "pointer" }}
              >
                Avg Words/Title{arrow("avgWordsPerTitle")}
                <InfoTooltip text="Average word count per CFR title. Indicates typical regulation density for this agency." />
              </th>
              <th>
                Checksum (SHA-256)
                <InfoTooltip text="Cryptographic hash of regulation content. Changes when regulations are modified, enabling change detection." />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(agency => (
              <tr key={agency.agencySlug}>
                <td>
                  <strong>{agency.shortName || "—"}</strong>
                  <br />
                  <small>{agency.agencyName}</small>
                </td>
                <td className="num burden-score">
                  {agency.regulatoryBurdenScore != null
                    ? agency.regulatoryBurdenScore.toLocaleString()
                    : "—"}
                </td>
                <td className="num">{agency.wordCount.toLocaleString()}</td>
                <td className="num">{agency.numTitles}</td>
                <td className="num">
                  {agency.avgWordsPerTitle.toLocaleString()}
                </td>
                <td className="hash">
                  {agency.checksum ? agency.checksum.slice(0, 12) + "…" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            ««
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            «
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            »
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            »»
          </button>
        </div>
      )}
    </section>
  );
};

export default AgencyTable;
