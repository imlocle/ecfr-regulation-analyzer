import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import InfoTooltip from "./InfoTooltip";

describe("InfoTooltip", () => {
  it("renders info icon", () => {
    const { container } = render(<InfoTooltip text="Test tooltip" />);
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("renders tooltip text", () => {
    render(<InfoTooltip text="Test tooltip content" />);
    expect(screen.getByText("Test tooltip content")).toBeInTheDocument();
  });

  it("tooltip has correct role", () => {
    render(<InfoTooltip text="Test" />);
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Test");
  });
});
