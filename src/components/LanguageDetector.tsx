import { useEffect, useRef, useState } from "react";
import { getDetector } from "@/utils/languageDetector";

function LanguageDetector() {
  const detectorRef = useRef<LanguageDetector | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<
    LanguageDetectionResult[]
  >([]);

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
      if (!detectorRef.current) {
        abortControllerRef.current = new AbortController();
        detectorRef.current = await getDetector(
          ["en"],
          abortControllerRef.current.signal
        );
      }

      const results = (await detectorRef.current?.detect(text)) ?? [];
      setDetectedLanguage(results);
    } catch (error) {
      console.error("Error detecting language", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-6 flex-col">
      <h2 className="text-2xl font-bold">LanguageDetector</h2>
      <div className="flex gap-3">
        <div className="flex flex-col gap-3 flex-1 w-100">
          <form id="language-detector-form" onSubmit={detectLanguage}>
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

        <div className="flex flex-col gap-2 w-100">
          {detectedLanguage.length > 0 && (
            <div className="flex flex-col gap-2 w-64">
              {detectedLanguage.slice(0, 3).map((result, index) => {
                const confidence = (result.confidence ?? 0) * 100;
                return (
                  <div
                    key={result.detectedLanguage || index}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {result.detectedLanguage || "Unknown"}
                      </span>
                      <span className="text-sm text-gray-600">
                        {confidence.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <button
        type="submit"
        form="language-detector-form"
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

export default LanguageDetector;
