import React from "react";
import TestStepItem from "./TestStepItem";
import { TestStep } from "../../types";

interface TestStepsListProps {
  steps: TestStep[];
  expandedSteps: string[];
  currentStepIndex: number;
  isRunning: boolean;
  toggleExpand: (id: string) => void;
  removeStep: (id: string) => void;
  viewScreenshot: (url: string) => void;
}

const TestStepsList: React.FC<TestStepsListProps> = ({
  steps,
  expandedSteps,
  currentStepIndex,
  isRunning,
  toggleExpand,
  removeStep,
  viewScreenshot,
}) => {
  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Add test steps to get started
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {steps.map((step, index) => (
        <TestStepItem
          key={step.id}
          step={step}
          index={index}
          isExpanded={expandedSteps.includes(step.id)}
          isActive={index === currentStepIndex}
          isRunning={isRunning}
          toggleExpand={toggleExpand}
          removeStep={removeStep}
          viewScreenshot={viewScreenshot}
        />
      ))}
    </ul>
  );
};

export default TestStepsList;
