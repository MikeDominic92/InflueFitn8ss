import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 max-w-2xl mx-auto">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-400">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="ml-auto pl-3 text-red-400 hover:text-red-300"
        >
          ×
        </button>
      </div>
    </div>
  );
}