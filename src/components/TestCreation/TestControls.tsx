import React from "react";

interface TestControlsProps {
  runTests: () => void;
  isRunning: boolean;
  hasSteps: boolean;
  error: string;
}

const TestControls: React.FC<TestControlsProps> = ({
  runTests,
  isRunning,
  hasSteps,
  error,
}) => {
  return (
    <div className="pt-4 mt-4 border-t border-gray-200">
      <button
        onClick={runTests}
        disabled={isRunning || !hasSteps}
        className="w-full px-4 py-2 hover:cursor-pointer text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
      >
        {isRunning ? "Running Tests..." : "Run Tests"}
      </button>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default TestControls;
