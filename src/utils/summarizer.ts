export interface SummarizerOptions {
  type?: "key-points" | "tldr" | "teaser" | "headline";
  format?: "markdown" | "plain-text";
  length?: "short" | "medium" | "long";
  sharedContext?: string;
  expectedInputLanguages?: string[];
  outputLanguage?: string;
  expectedContextLanguages?: string[];
}

export const getSummarizer = async () => {
  const isBrowserSupported = "Summarizer" in self;
  if (!isBrowserSupported) {
    throw new Error("Summarizer API is not supported in this browser");
  }

  const availability = await Summarizer.availability();

  if (availability === "unavailable") {
    throw new Error("Summarizer model is not available");
  }

  const createOptions: SummarizerCreateOptions = {
    type: "key-points",
    format: "markdown",
    length: "short",
    expectedInputLanguages: ["en"],
    outputLanguage: "en",
  };

  if (availability === "available") {
    return Summarizer.create(createOptions);
  }

  return Summarizer.create({
    ...createOptions,
    monitor(monitor) {
      monitor.addEventListener("downloadprogress", (e) => {
        console.log(
          `Summarizer Download Progress : ${Math.floor(e.loaded * 100)}%`,
        );
      });
    },
  });
};
