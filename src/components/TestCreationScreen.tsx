import { useState } from "react";
import { TestStep } from "../types";
import { useTestSocket } from "../hooks/useTestSocket";

import Header from "./TestCreation/Header";
import StepInput from "./TestCreation/StepInput";
import TestStepsList from "./TestCreation/TestStepsList";
import BrowserPreview from "./TestCreation/BrowserPreview";
import TestControls from "./TestCreation/TestControls";

interface TestCreationScreenProps {
  config: {
    apiKey: string;
    targetUrl: string;
  };
  onComplete: (steps: TestStep[], results: any) => void;
}

function TestCreationScreen({ config, onComplete }: TestCreationScreenProps) {
  const [currentStep, setCurrentStep] = useState("");
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

  const {
    isRunning,
    browserImage,
    status,
    error,
    runTests: initiateTests,
    stopTest,
    steps: updatedSteps,
    expandedSteps: updatedExpandedSteps,
    currentStepIndex: updatedCurrentStepIndex,
    setUpdatedSteps,
    setUpdatedExpandedSteps,
    setUpdatedCurrentStepIndex,
  } = useTestSocket({
    steps,
    expandedSteps,
    currentStepIndex,
    onComplete,
  });

  if (steps !== updatedSteps) {
    setSteps(updatedSteps);
  }
  if (expandedSteps !== updatedExpandedSteps) {
    setExpandedSteps(updatedExpandedSteps);
  }
  if (currentStepIndex !== updatedCurrentStepIndex) {
    setCurrentStepIndex(updatedCurrentStepIndex);
  }

  const addStep = () => {
    if (currentStep.trim()) {
      const newStep: TestStep = {
        id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        description: currentStep.trim(),
        status: "pending",
      };
      const newSteps = [...steps, newStep];
      setSteps(newSteps);
      setCurrentStep("");
      setUpdatedSteps(newSteps);
    }
  };

  const removeStep = (id: string) => {
    const newSteps = steps.filter((step) => step.id !== id);
    setSteps(newSteps);
    setUpdatedSteps(newSteps);

    const newExpandedSteps = expandedSteps.filter((stepId) => stepId !== id);
    setExpandedSteps(newExpandedSteps);
    setUpdatedExpandedSteps(newExpandedSteps);
  };

  const toggleExpand = (id: string) => {
    let newExpandedSteps;
    if (expandedSteps.includes(id)) {
      newExpandedSteps = expandedSteps.filter((stepId) => stepId !== id);
    } else {
      newExpandedSteps = [...expandedSteps, id];
    }
    setExpandedSteps(newExpandedSteps);
    setUpdatedExpandedSteps(newExpandedSteps);
  };

  const viewScreenshot = (screenshotUrl: string) => {};

  const runTests = () => {
    initiateTests(config);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        targetUrl={config.targetUrl}
        isRunning={isRunning}
        onStopTest={stopTest}
      />

      <div className="flex flex-1 p-4 overflow-hidden sm:p-6 gap-4">
        <div className="flex flex-col w-1/3 overflow-hidden">
          <StepInput
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            addStep={addStep}
            isRunning={isRunning}
          />

          <div className="flex-1 overflow-y-auto">
            <TestStepsList
              steps={steps}
              expandedSteps={expandedSteps}
              currentStepIndex={currentStepIndex}
              isRunning={isRunning}
              toggleExpand={toggleExpand}
              removeStep={removeStep}
              viewScreenshot={viewScreenshot}
            />
          </div>

          <TestControls
            runTests={runTests}
            isRunning={isRunning}
            hasSteps={steps.length > 0}
            error={error}
          />
        </div>

        <div className="flex flex-col w-2/3 overflow-hidden">
          <BrowserPreview
            browserImage={browserImage}
            targetUrl={config.targetUrl}
            status={status}
            isRunning={isRunning}
          />
        </div>
      </div>
    </div>
  );
}

export default TestCreationScreen;
