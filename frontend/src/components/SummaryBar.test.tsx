import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SummaryBar from "./SummaryBar";
import type { Summary } from "@/models/types";

describe("SummaryBar", () => {
  const mockSummary: Summary = {
    lastUpdated: "2024-03-15",
    titlesDownloaded: 48,
    agenciesProcessed: 153,
    historyPeriods: 120,
  };

  it("renders loading state", () => {
    render(<SummaryBar summary={null} loading={true} />);
    expect(screen.getByText(/loading summary/i)).toBeInTheDocument();
  });

  it("renders null when no summary and not loading", () => {
    const { container } = render(<SummaryBar summary={null} loading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays all summary statistics", () => {
    render(<SummaryBar summary={mockSummary} loading={false} />);

    expect(screen.getByText("48")).toBeInTheDocument();
    expect(screen.getByText("153")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("2024-03-15")).toBeInTheDocument();
  });

  it("displays correct labels", () => {
    render(<SummaryBar summary={mockSummary} loading={false} />);

    expect(screen.getByText(/titles downloaded/i)).toBeInTheDocument();
    expect(screen.getByText(/agencies processed/i)).toBeInTheDocument();
    expect(screen.getByText(/history periods/i)).toBeInTheDocument();
    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(<SummaryBar summary={mockSummary} loading={false} />);
    expect(screen.getByLabelText("Data summary")).toBeInTheDocument();
  });
});
