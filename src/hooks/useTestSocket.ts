import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { TestStep } from "../types";

interface UseTestSocketProps {
  steps: TestStep[];
  onComplete: (steps: TestStep[], results: any) => void;
}

export function useTestSocket({ steps, onComplete }: UseTestSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [browserImage, setBrowserImage] = useState<string | null>(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [testSteps, setTestSteps] = useState<TestStep[]>(steps);

  // Reference to maintain latest steps without re-renders
  const stepsRef = useRef(testSteps);
  useEffect(() => {
    stepsRef.current = testSteps;
  }, [testSteps]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:3001");

    const handleBrowserUpdate = (data: any) => {
      if (data.screenshot) {
        setBrowserImage(`data:image/png;base64,${data.screenshot}`);
      }
      setStatus(data.status);
    };

    const handleTestComplete = (data: any) => {
      setIsRunning(false);
      setResults(data);
      setCurrentStepIndex(-1);

      console.log(data);

      const updatedSteps = stepsRef.current.map((step, index) => ({
        ...step,
        status: data.stepResults[index]?.passed ? "success" : "error",
        error: data.stepResults[index]?.error
          ? String(data.stepResults[index]?.error)
          : null,
        screenshot: data.stepResults[index]?.screenshot || null,
        code: data.stepResults[index]?.code || null,
        duration: data.stepResults[index]?.duration || null,
      }));

      setTestSteps(updatedSteps);
      onComplete(updatedSteps, data);
    };

    const handleTestError = (data: { message: string }) => {
      setError(data.message);
      setIsRunning(false);
    };

    const handleStepUpdate = (data: {
      index: number;
      status: string;
      error?: any;
    }) => {
      setCurrentStepIndex(data.index);
      setTestSteps((prev) =>
        prev.map((step, i) =>
          i === data.index
            ? {
                ...step,
                status: data.status,
                error: data.error ? String(data.error) : undefined,
              }
            : step
        )
      );
    };

    // Setup event listeners
    socketRef.current.on("connect", () =>
      console.log("Connected to WS server")
    );
    socketRef.current.on("browser-update", handleBrowserUpdate);
    socketRef.current.on("test-complete", handleTestComplete);
    socketRef.current.on("test-error", handleTestError);
    socketRef.current.on("step-update", handleStepUpdate);

    // Cleanup on unmount
    return () => {
      socketRef.current?.disconnect();
    };
  }, [onComplete]);

  const runTests = (config: { apiKey: string; targetUrl: string }) => {
    if (testSteps.length === 0) {
      setError("Please add at least one test step");
      return;
    }

    setIsRunning(true);
    setError("");
    setStatus("starting");
    setCurrentStepIndex(0);

    // Initialize steps with pending status
    const initialSteps = testSteps.map((step) => ({
      ...step,
      status: "pending" as const,
      error: undefined,
    }));
    setTestSteps(initialSteps);

    // Emit test run event
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
