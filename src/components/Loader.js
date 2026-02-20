import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-200 mb-4"></div>
        <span className="text-white text-lg font-medium">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
