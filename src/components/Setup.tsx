import { useState } from "react";

interface SetupScreenProps {
  onSubmit: (apiKey: string, targetUrl: string) => void;
}

function SetupScreen({ onSubmit }: SetupScreenProps) {
  const [apiKey, setApiKey] = useState(
    "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"
  );
  const [targetUrl, setTargetUrl] = useState(
    "https://www.scrapethissite.com/pages/"
  );
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      setError("OpenAI API Key is required");
      return;
    }

    if (!targetUrl.trim()) {
      setError("Target URL is required");
      return;
    }

    // Simple URL validation
    try {
      new URL(targetUrl);
      onSubmit(apiKey, targetUrl);
    } catch (e) {
      console.log(e);
      setError("Please enter a valid URL");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Autoduck</h1>
          <p className="mt-2 text-gray-600">Configure before starting</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700"
            >
              OpenAI API Key
            </label>
            <input
              id="apiKey"
              name="apiKey"
              type="password"
              required
              className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="targetUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Target Website URL
            </label>
            <input
              id="targetUrl"
              name="targetUrl"
              type="text"
              required
              className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              placeholder="https://example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div>
            <button
              type="submit"
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-lg shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SetupScreen;
