import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AnalyzeButton from "./AnalyzeButton";

describe("AnalyzeButton", () => {
  it("should render the button", () => {
    render(
      <AnalyzeButton
        onAnalyze={() => {}}
        isAnalyzing={false}
        canAnalyze={true}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should display loading state when analyzing", () => {
    render(
      <AnalyzeButton
        onAnalyze={() => {}}
        isAnalyzing={true}
        canAnalyze={true}
      />
    );

    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
  });

  it("should be disabled when canAnalyze is false", () => {
    render(
      <AnalyzeButton
        onAnalyze={() => {}}
        isAnalyzing={false}
        canAnalyze={false}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should be disabled when analyzing", () => {
    render(
      <AnalyzeButton
        onAnalyze={() => {}}
        isAnalyzing={true}
        canAnalyze={true}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should call onAnalyze when clicked", () => {
    const mockOnAnalyze = vi.fn();
    render(
      <AnalyzeButton
        onAnalyze={mockOnAnalyze}
        isAnalyzing={false}
        canAnalyze={true}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnAnalyze).toHaveBeenCalledTimes(1);
  });

  it("should not call onAnalyze when disabled", () => {
    const mockOnAnalyze = vi.fn();
    render(
      <AnalyzeButton
        onAnalyze={mockOnAnalyze}
        isAnalyzing={false}
        canAnalyze={false}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnAnalyze).not.toHaveBeenCalled();
  });
});
