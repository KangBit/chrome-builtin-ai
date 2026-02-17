import { useEffect, useRef, useState } from "react";
import { getSummarizer } from "@/utils/summarizer";

function Summarizer() {
  const summarizerRef = useRef<Summarizer | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");

  const USE_STREAMING = true;

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      summarizerRef.current?.destroy();
    };
  }, []);

  const handleSummarize = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSummary("");

    const formData = new FormData(e.target as HTMLFormElement);
    const text = formData.get("text") as string;
    const abortController = new AbortController();
    if (!text.trim()) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = abortController;
    setIsLoading(true);

    try {
      if (!summarizerRef.current) {
        summarizerRef.current = await getSummarizer();
      }

      if (USE_STREAMING) {
        await summarizeStreaming(text, abortController.signal);
      } else {
        await summarize(text, abortController.signal);
      }
    } catch (error) {
      abortController.abort();
      console.error("Error summarizing text", error);
    } finally {
      setIsLoading(false);
    }
  };

  const summarizeStreaming = async (text: string, signal: AbortSignal) => {
    if (!summarizerRef.current) {
      return;
    }

    const stream = summarizerRef.current.summarizeStreaming(text, { signal });
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        setSummary((prev) => prev + value);
      }
    } catch (error) {
      console.error("Error summarizing text", error);
    } finally {
      reader.releaseLock();
    }
  };

  const summarize = async (text: string, signal: AbortSignal) => {
    if (!summarizerRef.current) {
      return;
    }

    const result = await summarizerRef.current.summarize(text, { signal });

    setSummary(result);
  };

  return (
    <>
      <div className="flex gap-6 flex-col">
        <h2 className="text-2xl font-bold">Summarizer</h2>
        <div className="flex gap-3">
          <div className="w-100">
            <h3 className="text-lg font-semibold mb-2">입력</h3>
            <form
              id="summarizer-form"
              onSubmit={handleSummarize}
              className="flex flex-col gap-3"
            >
              <textarea
                name="text"
                className="w-full h-40 p-3 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     resize-none text-sm"
                placeholder="요약할 텍스트를 입력하세요..."
                disabled={isLoading}
              />
            </form>
          </div>
          <div className="w-100">
            <h3 className="text-lg font-semibold mb-2">요약 결과</h3>
            <div className="p-4 border h-40 border-gray-300 rounded-lg bg-gray-50">
              {summary ? (
                <div className="text-black text-sm whitespace-pre-wrap">
                  {summary}
                </div>
              ) : (
                <p className="text-black text-sm">
                  요약 결과가 여기에 표시됩니다.
                </p>
              )}
            </div>
          </div>
        </div>
        <button
          type="submit"
          form="summarizer-form"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                     transition-colors text-sm font-medium"
        >
          {isLoading ? "요약 중..." : "요약하기"}
        </button>
      </div>
    </>
  );
}

export default Summarizer;
