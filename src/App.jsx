import "./App.css";

import LanguageDetector from "@/components/LanguageDetector";

function App() {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Language Detector
      </h2>
      <LanguageDetector />
    </>
  );
}

export default App;
