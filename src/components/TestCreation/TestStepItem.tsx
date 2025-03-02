import React from "react";
import { Check, X, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../../utils/classnames";
import { TestStep } from "../../types";

interface TestStepItemProps {
  step: TestStep;
  index: number;
  isExpanded: boolean;
  isActive: boolean;
  isRunning: boolean;
  toggleExpand: (id: string) => void;
  removeStep: (id: string) => void;
}

const TestStepItem: React.FC<TestStepItemProps> = ({
  step,
  index,
  isExpanded,
  isActive,
  isRunning,
  toggleExpand,
  removeStep,
}) => {
  return (
    <div
      className={cn(
        "test-step rounded-lg border p-3 animate-fade-in transition-all duration-200",
        {
          "border-green-200 bg-green-50/50": step.status === "success",
          "border-red-200 bg-red-50/50": step.status === "error",
          "border-amber-200 bg-amber-50/50": step.status === "pending",
          "border-cyan-500 bg-cyan-500/50": isActive,
        }
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {step.status === "success" && (
            <Check className="h-5 w-5 text-green-600" />
          )}
          {step.status === "error" && <X className="h-5 w-5 text-red-600" />}
          {step.status === "pending" && (
            <Clock className="h-5 w-5 text-amber-600" />
          )}
        </div>

        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {index + 1}. {step.description}
            </p>

            <div className="flex items-center gap-2">
              {!isRunning && (
                <button
                  onClick={() => removeStep(step.id)}
                  className="text-gray-400 hover:text-red-500 hover:cursor-pointer transition-colors"
                >
                  ×
                </button>
              )}

              {step.error && (
                <button
                  onClick={() => toggleExpand(step.id)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {isExpanded && step.error && (
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
  );
};

export default TestStepItem;
