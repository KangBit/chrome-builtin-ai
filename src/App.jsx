import "./App.css";

import LanguageDetector from "@/components/LanguageDetector";
import Translator from "@/components/Translator";
import Summarizer from "@/components/Summarizer";

function App() {
  return (
    <>
      <LanguageDetector />
      <Translator />
      <Summarizer />
    </>
  );
}

export default App;
