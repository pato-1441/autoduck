export interface TestStep {
  id: string;
  description: string;
  status: "pending" | "success" | "error";
  error?: string;
  screenshotUrl?: string;
}

export interface TestResult {
  success: boolean;
  message?: string;
  details?: any;
  timestamp: string;
}
