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
  const [currentStepInput, setCurrentStepInput] = useState("");
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);

  const {
    isRunning,
    browserImage,
    status,
    error,
    results,
    steps,
    currentStepIndex,
    runTests,
    stopTest,
    setTestSteps,
  } = useTestSocket({
    steps: [], // Initial empty steps
    onComplete,
  });

  const addStep = () => {
    if (currentStepInput.trim()) {
      const newStep: TestStep = {
        id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        description: currentStepInput.trim(),
        status: "pending",
      };

      setTestSteps((prev) => [...prev, newStep]);
      setCurrentStepInput("");
    }
  };

  const removeStep = (id: string) => {
    setTestSteps((prev) => prev.filter((step) => step.id !== id));
    setExpandedSteps((prev) => prev.filter((stepId) => stepId !== id));
  };

  const toggleExpand = (id: string) => {
    setExpandedSteps((prev) =>
      prev.includes(id) ? prev.filter((stepId) => stepId !== id) : [...prev, id]
    );
  };

  const handleRunTests = () => {
    if (steps.length === 0) return;
    runTests(config);
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
            currentStep={currentStepInput}
            setCurrentStep={setCurrentStepInput}
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
            />
          </div>

          <TestControls
            runTests={handleRunTests}
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
