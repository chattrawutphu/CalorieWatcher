"use client";

import React from "react";

export default function Test2Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Tailwind Test Page 2</h1>
      
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-6 rounded-lg bg-blue-500">
          <p className="text-white">Blue Color Block</p>
        </div>
        <div className="p-6 rounded-lg bg-green-500">
          <p className="text-white">Green Color Block</p>
        </div>
        <div className="p-6 rounded-lg bg-red-500">
          <p className="text-white">Red Color Block</p>
        </div>
        <div className="p-6 rounded-lg bg-yellow-500">
          <p className="text-white">Yellow Color Block</p>
        </div>
      </div>
      
      <div className="mt-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This page uses direct Tailwind classes without HSL variables.
        </p>
      </div>
      
      <div className="mt-4 flex space-x-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Blue Button
        </button>
        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
          Green Button
        </button>
      </div>
    </div>
  );
} 