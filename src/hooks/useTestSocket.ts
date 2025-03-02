import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { TestStep } from "../types";

interface UseTestSocketProps {
  steps: TestStep[];
  expandedSteps: string[];
  currentStepIndex: number;
  onComplete: (steps: TestStep[], results: any) => void;
}

export function useTestSocket({
  steps,
  expandedSteps,
  currentStepIndex,
  onComplete,
}: UseTestSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [browserImage, setBrowserImage] = useState<string | null>(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Track state locally for hook managemnt
  const [updatedSteps, setUpdatedSteps] = useState<TestStep[]>(steps);
  const [updatedExpandedSteps, setUpdatedExpandedSteps] =
    useState<string[]>(expandedSteps);
  const [updatedCurrentStepIndex, setUpdatedCurrentStepIndex] =
    useState<number>(currentStepIndex);

  useEffect(() => {
    setUpdatedSteps(steps);
  }, [steps]);

  useEffect(() => {
    setUpdatedExpandedSteps(expandedSteps);
  }, [expandedSteps]);

  useEffect(() => {
    setUpdatedCurrentStepIndex(currentStepIndex);
  }, [currentStepIndex]);

  useEffect(() => {
    socketRef.current = io("http://localhost:3001");

    socketRef.current.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socketRef.current.on("browser-update", (data) => {
      if (data.screenshot) {
        setBrowserImage(`data:image/png;base64,${data.screenshot}`);

        if (
          updatedSteps.length > 0 &&
          updatedCurrentStepIndex >= 0 &&
          updatedCurrentStepIndex < updatedSteps.length
        ) {
          const newSteps = [...updatedSteps];
          newSteps[updatedCurrentStepIndex] = {
            ...newSteps[updatedCurrentStepIndex],
            screenshotUrl: `data:image/png;base64,${data.screenshot}`,
          };
          setUpdatedSteps(newSteps);
        }
      }
      setStatus(data.status);
    });

    socketRef.current.on("test-complete", (data) => {
      setIsRunning(false);
      setResults(data);

      const newSteps = updatedSteps.map((step) => ({
        ...step,
        status: step.status === "error" ? "error" : "success",
      }));
      setUpdatedSteps(newSteps);
      setUpdatedCurrentStepIndex(-1);

      setTimeout(() => {
        onComplete(newSteps, data);
      }, 1000);
    });

    socketRef.current.on("test-error", (data) => {
      setError(data.message);
      setIsRunning(false);

      if (
        updatedCurrentStepIndex >= 0 &&
        updatedCurrentStepIndex < updatedSteps.length
      ) {
        const newSteps = [...updatedSteps];
        newSteps[updatedCurrentStepIndex] = {
          ...newSteps[updatedCurrentStepIndex],
          status: "error",
          error: data.message,
        };
        setUpdatedSteps(newSteps);

        const newExpandedSteps = [
          ...updatedExpandedSteps,
          newSteps[updatedCurrentStepIndex].id,
        ];
        setUpdatedExpandedSteps(newExpandedSteps);
      }
    });

    socketRef.current.on("step-update", (data) => {
      if (data.index !== undefined && data.status) {
        const newSteps = [...updatedSteps];
        if (newSteps[data.index]) {
          newSteps[data.index] = {
            ...newSteps[data.index],
            status: data.status,
            error: data.error,
          };
          setUpdatedSteps(newSteps);
        }
        setUpdatedCurrentStepIndex(data.index);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [updatedSteps, onComplete, updatedExpandedSteps, updatedCurrentStepIndex]);

  const runTests = (config: { apiKey: string; targetUrl: string }) => {
    if (updatedSteps.length === 0) {
      setError("Please add at least one test step");
      return;
    }

    setIsRunning(true);
    setError("");
    setStatus("starting");
    setUpdatedCurrentStepIndex(0);

    const pendingSteps = updatedSteps.map((step) => ({
      ...step,
      status: "pending" as const,
      error: undefined,
    }));
    setUpdatedSteps(pendingSteps);

    socketRef.current?.emit("run-tests", {
      apiKey: config.apiKey,
      targetUrl: config.targetUrl,
      steps: pendingSteps.map((s) => s.description),
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
    steps: updatedSteps,
    expandedSteps: updatedExpandedSteps,
    currentStepIndex: updatedCurrentStepIndex,
    runTests,
    stopTest,
    setUpdatedSteps,
    setUpdatedExpandedSteps,
    setUpdatedCurrentStepIndex,
  };
}
