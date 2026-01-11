"use client";

declare global {
  interface Window {
    Blackbox?: {
      openFeedback: () => void;
    };
  }
}

export default function FeedbackButton() {
  const handleFeedback = () => {
    if (typeof window !== "undefined" && window.Blackbox) {
      window.Blackbox.openFeedback();
    }
  };

  return (
    <button
      onClick={handleFeedback}
      className="fixed bottom-4 right-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium border border-zinc-700"
    >
      Send Feedback
    </button>
  );
}
