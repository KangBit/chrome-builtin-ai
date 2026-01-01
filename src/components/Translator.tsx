import { useEffect, useRef, useState } from "react";
import { getTranslator } from "@/utils/translator";

function Translator() {
  const translatorRef = useRef<Translator | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>("");

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const detectLanguage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const text = formData.get("text") as string;
    if (!text.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      if (!translatorRef.current) {
        abortControllerRef.current = new AbortController();
        translatorRef.current = await getTranslator(
          "en",
          "ko",
          abortControllerRef.current.signal
        );
      }

      const results = (await translatorRef.current?.translate(text)) ?? [];
      setTranslatedText(results);
    } catch (error) {
      console.error("Error detecting language", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-6 flex-col">
      <h2 className="text-2xl font-bold">Translator</h2>
      <div className="flex gap-6">
        <div className="flex flex-col gap-2 flex-1 w-100">
          <h3 className="text-lg font-semibold">입력</h3>
          <form id="translator-form" onSubmit={detectLanguage}>
            <textarea
              name="text"
              className="w-full h-40 p-3 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     resize-none text-sm"
              placeholder="Enter text to detect language..."
              disabled={isLoading}
            />
          </form>
        </div>

        <div className="w-100">
          <h3 className="text-lg font-semibold mb-2">번역 결과</h3>
          <div className="p-4 border h-40 border-gray-300 rounded-lg bg-gray-50">
            <p>{translatedText}</p>
          </div>
        </div>
      </div>
      <button
        type="submit"
        form="translator-form"
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                     transition-colors text-sm font-medium"
      >
        {isLoading ? "Detecting..." : "Detect Language"}
      </button>
    </div>
  );
}

export default Translator;
