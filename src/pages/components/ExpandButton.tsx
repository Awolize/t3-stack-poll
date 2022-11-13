import React from "react";

const ExpandButton = ({ state, callback }): JSX.Element => {
  return (
    <button
      onClick={() => callback()}
      type="button"
      className="inline-flex items-center justify-center rounded-md bg-slate-800 p-2 text-gray-400 hover:bg-slate-700 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={"h-6 w-6 duration-300 ease-in-out" + (state ? " rotate-90" : " rotate-0")}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  );
};

export default ExpandButton;
