export const getDetector = async (languages: string[], signal: AbortSignal) => {
  const isBrowserSupported = "LanguageDetector" in self;
  if (!isBrowserSupported) {
    throw new Error("Language Detector is not supported in this browser");
  }

  const availability = await LanguageDetector.availability({
    expectedInputLanguages: languages,
  });

  if (availability === "unavailable") {
    throw new Error("Model is not available for the given languages");
  }

  if (availability === "available") {
    return LanguageDetector.create({
      expectedInputLanguages: languages,
      signal,
    });
  }

  return LanguageDetector.create({
    expectedInputLanguages: languages,
    monitor(monitor) {
      monitor.addEventListener("downloadprogress", (e) => {
        console.log(`Downloaded ${Math.floor(e.loaded * 100)}%`);
      });
    },
    signal,
  });
};
