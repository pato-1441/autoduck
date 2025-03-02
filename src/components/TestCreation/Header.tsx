import React from "react";

interface HeaderProps {
  targetUrl: string;
  isRunning: boolean;
  onStopTest: () => void;
}

const Header: React.FC<HeaderProps> = ({
  targetUrl,
  isRunning,
  onStopTest,
}) => {
  return (
    <header className="px-4 py-4 bg-white border-b border-b-gray-300/50 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img className="max-w-8 max-h-8" src="/favicon.png" />
          <h1 className="text-xl font-bold text-gray-800">Autoduck</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onStopTest}
            disabled={!isRunning}
            className="disabled:hidden border-2 border-red-400 px-2 py-1 rounded-lg font-semibold enabled:hover:cursor-pointer disabled:opacity-50"
          >
            Stop test
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Testing:{" "}
              <a
                className="rounded-full px-2 py-0.5 border border-gray-300/50 text-gray-800"
                target="_blank"
                rel="noopener noreferrer"
                href={targetUrl}
              >
                {targetUrl.split(".")[1]}
              </a>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
