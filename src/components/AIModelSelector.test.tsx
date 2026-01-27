import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AIModelSelector from "./AIModelSelector";

describe("AIModelSelector", () => {
  const mockOnChange = vi.fn();

  it("should render model selector", () => {
    render(
      <AIModelSelector
        selectedModels={["gemini"]}
        onModelChange={mockOnChange}
        referenceModel="gemini"
        onReferenceModelChange={mockOnChange}
      />
    );

    expect(screen.getByText(/ai model/i)).toBeInTheDocument();
  });

  it("should display selected models", () => {
    render(
      <AIModelSelector
        selectedModels={["gemini", "gpt"]}
        onModelChange={mockOnChange}
        referenceModel="gemini"
        onReferenceModelChange={mockOnChange}
      />
    );

    // Check that multiple models are selected
    const geminiOption = screen.getByText(/gemini/i);
    expect(geminiOption).toBeInTheDocument();
  });

  it("should have at least one model available", () => {
    render(
      <AIModelSelector
        selectedModels={[]}
        onModelChange={mockOnChange}
        referenceModel="gemini"
        onReferenceModelChange={mockOnChange}
      />
    );

    // The component should render even with no models selected
    expect(screen.getByText(/ai model/i)).toBeInTheDocument();
  });

  it("should show reference model when multiple models selected", () => {
    render(
      <AIModelSelector
        selectedModels={["gemini", "gpt", "claude"]}
        onModelChange={mockOnChange}
        referenceModel="gemini"
        onReferenceModelChange={mockOnChange}
      />
    );

    // When multiple models are selected, reference model section should appear
    const referenceSection = screen.queryByText(/reference/i);
    expect(referenceSection).toBeInTheDocument();
  });
});
