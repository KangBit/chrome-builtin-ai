export const getTranslator = async (
  sourceLanguage: string,
  targetLanguage: string,
  signal: AbortSignal
) => {
  const isBrowserSupported = "Translator" in self;
  if (!isBrowserSupported) {
    throw new Error("Language Detector is not supported in this browser");
  }

  const availability = await Translator.availability({
    sourceLanguage,
    targetLanguage,
  });

  console.error("availability", availability, sourceLanguage, targetLanguage);

  if (availability === "unavailable") {
    throw new Error("Model is not available for the given languages");
  }

  if (availability === "available") {
    return Translator.create({
      sourceLanguage,
      targetLanguage,
      signal,
    });
  }

  return Translator.create({
    sourceLanguage,
    targetLanguage,
    monitor(monitor) {
      monitor.addEventListener("downloadprogress", (e) => {
        console.log(`Downloaded ${Math.floor(e.loaded * 100)}%`);
      });
    },
    signal,
  });
};
