import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AgencyTable from "./AgencyTable";
import type { AgencyMetric } from "@/models/types";

describe("AgencyTable", () => {
  const mockAgencies: AgencyMetric[] = [
    {
      agencyName: "Department of Justice",
      agencySlug: "doj",
      shortName: "DOJ",
      cfrTitles: [8, 28, 32],
      wordCount: 31586172,
      checksum: "32624c8c0d07",
      numTitles: 11,
      avgWordsPerTitle: 2871470.2,
      totalAmendments: 1847,
      regulatoryBurdenScore: 641426000,
    },
    {
      agencyName: "Small Agency",
      agencySlug: "small",
      shortName: "SA",
      cfrTitles: [1],
      wordCount: 500000,
      checksum: "abc123",
      numTitles: 1,
      avgWordsPerTitle: 500000,
      totalAmendments: 25,
      regulatoryBurdenScore: 12500,
    },
  ];

  it("renders loading state", () => {
    render(<AgencyTable agencies={[]} loading={true} />);
    expect(screen.getByText(/loading agencies/i)).toBeInTheDocument();
  });

  it("displays agency data", () => {
    render(<AgencyTable agencies={mockAgencies} loading={false} />);

    expect(screen.getByText("DOJ")).toBeInTheDocument();
    expect(screen.getByText("Department of Justice")).toBeInTheDocument();
    expect(screen.getByText("SA")).toBeInTheDocument();
  });

  it("displays burden scores", () => {
    render(<AgencyTable agencies={mockAgencies} loading={false} />);

    expect(screen.getByText("641,426,000")).toBeInTheDocument();
    expect(screen.getByText("12,500")).toBeInTheDocument();
  });

  it("handles missing burden scores", () => {
    const agencyWithoutScore: AgencyMetric = {
      ...mockAgencies[0],
      regulatoryBurdenScore: undefined,
    };

    render(<AgencyTable agencies={[agencyWithoutScore]} loading={false} />);

    // Should show dash for missing score
    const cells = screen.getAllByText("—");
    expect(cells.length).toBeGreaterThan(0);
  });

  it("allows searching agencies", () => {
    render(<AgencyTable agencies={mockAgencies} loading={false} />);

    const searchInput = screen.getByPlaceholderText(/search agencies/i);
    fireEvent.change(searchInput, { target: { value: "DOJ" } });

    expect(screen.getByText("DOJ")).toBeInTheDocument();
    expect(screen.queryByText("SA")).not.toBeInTheDocument();
  });

  it("displays result count", () => {
    render(<AgencyTable agencies={mockAgencies} loading={false} />);
    expect(screen.getByText("2 agencies")).toBeInTheDocument();
  });

  it("allows sorting by clicking headers", () => {
    render(<AgencyTable agencies={mockAgencies} loading={false} />);

    const agencyHeader = screen.getByText(/^Agency/);
    fireEvent.click(agencyHeader);

    // Should show sort indicator
    expect(agencyHeader.textContent).toMatch(/[▲▼]/);
  });

  it("has accessible search input", () => {
    render(<AgencyTable agencies={mockAgencies} loading={false} />);

    const searchInput = screen.getByLabelText(/search agencies/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("displays pagination when needed", () => {
    const manyAgencies = Array.from({ length: 30 }, (_, i) => ({
      ...mockAgencies[0],
      agencySlug: `agency-${i}`,
      agencyName: `Agency ${i}`,
    }));

    render(<AgencyTable agencies={manyAgencies} loading={false} />);

    expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
  });
});
