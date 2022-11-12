import React from "react";

const CloseButton = ({ callback }): JSX.Element => {
  return (
    <button
      onClick={() => callback()}
      type="button"
      className="inline-flex items-center justify-center rounded-md bg-slate-800 p-2 text-gray-400 hover:bg-slate-700 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
    >
      <span className="sr-only">Close menu</span>
      {/* <!-- Heroicon name: outline/x --> */}
      <svg
        className="h-6 w-6"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
};

export default CloseButton;
