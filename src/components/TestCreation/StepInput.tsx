import React from "react";

interface StepInputProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
  addStep: () => void;
  isRunning: boolean;
}

const StepInput: React.FC<StepInputProps> = ({
  currentStep,
  setCurrentStep,
  addStep,
  isRunning,
}) => {
  return (
    <div className="flex items-center mb-4 w-full gap-2">
      <input
        type="text"
        placeholder="verify that a email type input exists..."
        className="w-5/6 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
        value={currentStep}
        onChange={(e) => setCurrentStep(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addStep()}
        disabled={isRunning}
      />
      <button
        onClick={addStep}
        disabled={isRunning || !currentStep.trim()}
        className="hover:cursor-pointer w-1/6 px-4 py-2 text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
      >
        Add
      </button>
    </div>
  );
};

export default StepInput;
