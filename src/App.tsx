import { useState } from "react";
import SetupScreen from "./components/Setup.tsx";
import TestCreationScreen from "./components/TestCreationScreen.tsx";
import ResultsScreen from "./components/Results.tsx";
import { TestStep, TestResult } from "./types/index.ts";

function App() {
  const [currentScreen, setCurrentScreen] = useState<
    "setup" | "creation" | "results"
  >("setup");
  const [config, setConfig] = useState({
    apiKey: "",
    targetUrl: "",
  });
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [testResults, setTestResults] = useState<TestResult | null>(null);

  const handleConfigSubmit = (apiKey: string, targetUrl: string) => {
    setConfig({ apiKey, targetUrl });
    setCurrentScreen("creation");
  };

  const handleTestCreationComplete = (
    steps: TestStep[],
    results: TestResult
  ) => {
    console.log({ steps, results });
    setTestSteps(steps);
    setTestResults(results);
    setCurrentScreen("results");
  };

  const handleBackToCreation = () => {
    setCurrentScreen("creation");
  };

  const handleReset = () => {
    setCurrentScreen("setup");
    setTestSteps([]);
    setTestResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 bg-[url('/background.jpg')] bg-cover bg-center font-[Inter]">
      {currentScreen === "setup" && (
        <SetupScreen onSubmit={handleConfigSubmit} />
      )}

      {currentScreen === "creation" && (
        <TestCreationScreen
          config={config}
          onComplete={handleTestCreationComplete}
        />
      )}

      {currentScreen === "results" && (
        <ResultsScreen
          results={testResults}
          steps={testSteps}
          onBackToCreation={handleBackToCreation}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;
