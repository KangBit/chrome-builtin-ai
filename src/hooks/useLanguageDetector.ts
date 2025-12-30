import { useEffect, useEffectEvent, useRef, useState } from "react";

export default function useLanguageDetector(languages: string[]) {
  const isBrowserSupported = "LanguageDetector" in self;
  const abortControllerRef = useRef<AbortController | null>(null);
  const detectorRef = useRef<LanguageDetector | null>(null);

  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    initializeDetector(abortControllerRef.current.signal, languages);

    return () => {
      abortControllerRef.current?.abort();

      if (detectorRef.current) {
        detectorRef.current.destroy();
        detectorRef.current = null;
      }
    };
  }, []);

  const initializeDetector = useEffectEvent(
    async (signal: AbortSignal, languages: string[]) => {
      if (!isBrowserSupported) {
        return;
      }

      setIsLoading(true);

      const availability = await LanguageDetector.availability({
        expectedInputLanguages: languages,
      });

      if (availability === "unavailable") {
        setIsAvailable(false);
        setIsLoading(false);
        return;
      }

      const detector = await LanguageDetector.create({
        expectedInputLanguages: languages,
        monitor(monitor) {
          monitor.addEventListener("downloadprogress", (e) => {
            console.log(
              `Language Detector Download Progress : ${Math.floor(
                e.loaded * 100
              )}%`
            );
          });
        },
        signal,
      });

      detectorRef.current = detector;
      setIsLoading(false);
      setIsAvailable(true);
    }
  );

  const setExpectedLanguages = useEffectEvent((languages: string[]) => {
    if (abortControllerRef.current?.signal) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    initializeDetector(abortControllerRef.current.signal, languages);
  });

  const detect = async (text: string) => {
    if (!isBrowserSupported) {
      throw new Error("Language Detector is not supported in this browser");
    }

    if (isLoading) {
      throw new Error("Detector is still loading");
    }

    if (!isAvailable) {
      throw new Error("Detector is not available");
    }

    if (!detectorRef.current) {
      throw new Error("Detector not initialized");
    }

    const results = await detectorRef.current.detect(text);
    return results;
  };

  return {
    isBrowserSupported,
    isLoading,
    setExpectedLanguages,
    detect,
  };
}
