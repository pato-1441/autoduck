import React from "react";

interface BrowserPreviewProps {
  browserImage: string | null;
  targetUrl: string;
  status: string;
  isRunning: boolean;
}

const BrowserPreview: React.FC<BrowserPreviewProps> = ({
  browserImage,
  targetUrl,
  status,
  isRunning,
}) => {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1 overflow-hidden bg-white border border-gray-300 rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-2 border-b border-gray-300 bg-gray-50">
          <div className="flex items-center space-x-2 ml-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded">
            {targetUrl}
          </div>
          <div className="w-8"></div>
        </div>
        <div
          className="relative flex items-center justify-center w-full h-full bg-gray-100"
          style={{ aspectRatio: "16/9" }}
        >
          {browserImage ? (
            <img
              src={browserImage || "/placeholder.svg"}
              alt="Browser preview"
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="text-gray-400 flex flex-col gap-4">
              {isRunning ? "Loading..." : "Run tests to see browser preview"}
            </div>
          )}
          {isRunning && status !== "complete" && (
            <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat bg-[url('https://gifdb.com/images/high/dancing-white-duck-hip-hop-dance-491s86yb1ef6ra20.webp')]">
              <div className="w-8 h-8 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowserPreview;
