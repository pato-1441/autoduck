export interface TestStep {
  id: string;
  description: string;
  status: "pending" | "success" | "error";
  error: string | null;
  screenshotUrl?: string;
  screenshot?: string;
  code?: string;
  duration?: number;
}

export interface StepResult {
  passed: boolean;
  duration: number;
  error?: string;
  screenshot?: string;
  code?: string;
}

export interface BrowserUpdate {
  screenshot?: string;
  status: string;
}

export interface TestResult {
  duration: number;
  passed: boolean;
  stepResults: StepResult[];
  timestamp: string;
  success: boolean;
  message?: string;
  details?: Record<string, unknown>;
}

export interface StepUpdateData {
  index: number;
  status: "pending" | "success" | "error";
  error?: string;
}

export interface TestConfig {
  apiKey: string;
  targetUrl: string;
}
