import { useState } from "react";
import { Check, X, Clock, Eye } from "lucide-react";
import { cn } from "../utils/classnames";
import { TestStep, TestResult } from "../types";

interface ResultsScreenProps {
  results: TestResult | null;
  steps: TestStep[];
  onBackToCreation: () => void;
  onReset: () => void;
}

function ResultsScreen({
  results,
  steps,
  onBackToCreation,
  onReset,
}: ResultsScreenProps) {
  const [selectedStep, setSelectedStep] = useState(0);

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-800">
            No test results available
          </h2>
          <button
            onClick={onBackToCreation}
            className="px-4 py-2 mt-4 text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 text-base"
          >
            Back to Test Creation
          </button>
        </div>
      </div>
    );
  }

  const { duration, stepResults, passed } = results;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 py-4 bg-white shadow sm:px-6">
        <div className="flex items-center justify-between">
          <img className="max-w-8 max-h-8" src="/favicon.png" />
          <h1 className="text-xl font-bold text-gray-800">
            Autoduck - Results
          </h1>
          <div className="flex items-center space-x-4">
            <span
              className={`px-2 py-1 text-sm font-medium rounded-full ${
                passed
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {passed ? "All Tests Passed" : "Tests Failed"}
            </span>
            <span className="text-sm text-gray-500">
              Duration: {(duration / 1000).toFixed(2)}s
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 p-4 overflow-hidden sm:p-6">
        {/* Left panel - Test steps */}
        <div className="flex flex-col w-1/2 pr-4 overflow-hidden">
          <h2 className="mb-4 text-lg font-medium text-gray-800">Test Steps</h2>
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "rounded-lg border p-3 cursor-pointer transition-all duration-200",
                    {
                      "border-green-200 bg-green-50/50":
                        step.status === "success",
                      "border-red-200 bg-red-50/50": step.status === "error",
                      "border-amber-200 bg-amber-50/50":
                        step.status === "pending",
                      "border-cyan-500 bg-cyan-500/50": selectedStep === index,
                    }
                  )}
                  onClick={() => setSelectedStep(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {step.status === "success" && (
                        <Check className="h-5 w-5 text-green-600" />
                      )}
                      {step.status === "error" && (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                      {step.status === "pending" && (
                        <Clock className="h-5 w-5 text-amber-600" />
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {index + 1}. {step.description}
                        </p>
                        <Eye className="h-4 w-4" />
                      </div>

                      {step.error && (
                        <div className="mt-2 p-2 rounded bg-gray-100 text-sm overflow-x-auto">
                          <pre className="whitespace-pre-wrap">
                            {typeof step.error === "object"
                              ? JSON.stringify(step.error, null, 2)
                              : step.error}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel - Step details */}
        <div className="flex flex-col w-1/2 pl-4 overflow-hidden">
          <h2 className="mb-4 text-lg font-medium text-gray-800">
            Step Details
          </h2>
          <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            {stepResults[selectedStep] ? (
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="text-md font-medium text-gray-800">
                    {steps[selectedStep].description}
                  </h3>
                  <div
                    className={`mt-1 text-sm ${
                      stepResults[selectedStep].passed
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stepResults[selectedStep].passed
                      ? "Passed"
                      : `Failed: ${
                          stepResults[selectedStep].error || "Unknown error"
                        }`}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Duration:{" "}
                    {(stepResults[selectedStep].duration / 1000).toFixed(2)}s
                  </div>
                </div>

                {stepResults[selectedStep].screenshot && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-medium text-gray-700">
                      Screenshot
                    </h4>
                    <img
                      src={`data:image/png;base64,${stepResults[selectedStep].screenshot}`}
                      alt={`Screenshot of step ${selectedStep + 1}`}
                      className="object-contain w-full border border-gray-200 rounded"
                    />
                  </div>
                )}

                {stepResults[selectedStep].code && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-medium text-gray-700">
                      Generated Code
                    </h4>
                    <pre className="p-3 overflow-x-auto text-xs bg-gray-50 rounded">
                      {stepResults[selectedStep].code}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Select a step to view details
              </div>
            )}
          </div>

          <div className="flex justify-between mt-4 space-x-4">
            <button
              onClick={onBackToCreation}
              className="px-3 py-1.5 text-cyan-600 bg-white border border-cyan-600 rounded-lg hover:bg-cyan-50 text-sm hover:cursor-pointer"
            >
              Back to test creation
            </button>
            <button
              onClick={onReset}
              className="px-3 py-1.5 text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 text-sm hover:cursor-pointer"
            >
              Start new test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultsScreen;
