import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  TestStep,
  TestResult,
  BrowserUpdate,
  StepUpdateData,
  TestConfig,
} from "../types";

interface UseTestSocketProps {
  steps: TestStep[];
  onComplete: (steps: TestStep[], results: TestResult) => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

export function useTestSocket({ steps, onComplete }: UseTestSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [browserImage, setBrowserImage] = useState<string | null>(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [results, setResults] = useState<TestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [testSteps, setTestSteps] = useState<TestStep[]>(steps);

  const stepsRef = useRef(testSteps);
  useEffect(() => {
    stepsRef.current = testSteps;
  }, [testSteps]);

  useEffect(() => {
    socketRef.current = io(BACKEND_URL || "http://localhost:3001");

    const handleBrowserUpdate = (data: BrowserUpdate) => {
      if (data.screenshot) {
        setBrowserImage(`data:image/png;base64,${data.screenshot}`);
      }
      setStatus(data.status);
    };

    const handleTestComplete = (data: TestResult) => {
      setIsRunning(false);
      setResults(data);
      setCurrentStepIndex(-1);

      console.log(data);

      const updatedSteps = stepsRef.current.map((step, index) => ({
        ...step,
        status: data.stepResults[index]?.passed
          ? ("success" as const)
          : ("error" as const),
        error: data.stepResults[index]?.error
          ? String(data.stepResults[index]?.error)
          : null,
        screenshot: data.stepResults[index]?.screenshot || undefined,
        code: data.stepResults[index]?.code || undefined,
        duration: data.stepResults[index]?.duration || undefined,
      }));

      setTestSteps(updatedSteps as TestStep[]);
      onComplete(updatedSteps, data);
    };

    const handleTestError = (data: { message: string }) => {
      setError(data.message);
      setIsRunning(false);
    };

    const handleStepUpdate = (data: StepUpdateData) => {
      setCurrentStepIndex(data.index);
      setTestSteps((prev) =>
        prev.map((step, i) =>
          i === data.index
            ? {
                ...step,
                status: data.status,
                error: data.error ? String(data.error) : null,
              }
            : step
        )
      );
    };

    socketRef.current.on("connect", () =>
      console.log("Connected to WS server")
    );
    socketRef.current.on("browser-update", handleBrowserUpdate);
    socketRef.current.on("test-complete", handleTestComplete);
    socketRef.current.on("test-error", handleTestError);
    socketRef.current.on("step-update", handleStepUpdate);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [onComplete]);

  const runTests = (config: TestConfig) => {
    if (testSteps.length === 0) {
      setError("Please add at least one test step");
      return;
    }

    setIsRunning(true);
    setError("");
    setStatus("starting");
    setCurrentStepIndex(0);

    // steps with pending status
    const initialSteps = testSteps.map((step) => ({
      ...step,
      status: "pending" as const,
      error: null,
    }));
    setTestSteps(initialSteps);

    // run tests
    socketRef.current?.emit("run-tests", {
      apiKey: config.apiKey,
      targetUrl: config.targetUrl,
      steps: initialSteps.map((s) => s.description),
    });
  };

  const stopTest = () => {
    setIsRunning(false);
    socketRef.current?.emit("stop-test");
  };

  return {
    isRunning,
    browserImage,
    status,
    error,
    results,
    steps: testSteps,
    currentStepIndex,
    runTests,
    stopTest,
    setTestSteps,
  };
}
