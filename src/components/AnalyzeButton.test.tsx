import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AnalyzeButton from "./AnalyzeButton";

describe("AnalyzeButton", () => {
  it("should render the button", () => {
    render(
      <AnalyzeButton
        onClick={() => {}}
        isLoading={false}
        disabled={false}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should display loading state when analyzing", () => {
    render(
      <AnalyzeButton
        onClick={() => {}}
        isLoading={true}
        disabled={false}
      />
    );

    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
  });

  it("should be disabled when disabled is true", () => {
    render(
      <AnalyzeButton
        onClick={() => {}}
        isLoading={false}
        disabled={true}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should be disabled when analyzing", () => {
    render(
      <AnalyzeButton
        onClick={() => {}}
        isLoading={true}
        disabled={false}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should call onClick when clicked", () => {
    const mockOnClick = vi.fn();
    render(
      <AnalyzeButton
        onClick={mockOnClick}
        isLoading={false}
        disabled={false}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when disabled", () => {
    const mockOnClick = vi.fn();
    render(
      <AnalyzeButton
        onClick={mockOnClick}
        isLoading={false}
        disabled={true}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });
});
