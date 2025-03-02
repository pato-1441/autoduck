import React from "react";
import { TestStep } from "../../types";
import TestStepItem from "./TestStepItem";

interface TestStepsListProps {
  steps: TestStep[];
  expandedSteps: string[];
  currentStepIndex: number;
  isRunning: boolean;
  toggleExpand: (id: string) => void;
  removeStep: (id: string) => void;
}

const TestStepsList: React.FC<TestStepsListProps> = ({
  steps,
  expandedSteps,
  currentStepIndex,
  isRunning,
  toggleExpand,
  removeStep,
}) => {
  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <TestStepItem
          key={step.id}
          step={step}
          index={index}
          isExpanded={expandedSteps.includes(step.id)}
          isActive={currentStepIndex === index}
          isRunning={isRunning}
          toggleExpand={toggleExpand}
          removeStep={removeStep}
          viewScreenshot={(url) => {
            /* Implement screenshot viewing */
          }}
        />
      ))}
    </div>
  );
};

export default TestStepsList;
