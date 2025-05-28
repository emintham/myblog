document.addEventListener("DOMContentLoaded", async () => {
  const MAX_WAIT_ATTEMPTS = 50;
  const WAIT_INTERVAL_MS = 100;
  let attempts = 0;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  while (
    (typeof window.uuid === "undefined" ||
      typeof window.uuid.v4 === "undefined") &&
    attempts < MAX_WAIT_ATTEMPTS
  ) {
    await delay(WAIT_INTERVAL_MS);
    attempts++;
  }

  if (
    typeof window.uuid === "undefined" ||
    typeof window.uuid.v4 === "undefined"
  ) {
    console.error("UUID library (window.uuid) failed to load after waiting.");
    alert(
      "A critical library (uuid) could not be loaded. Please check your internet connection and try refreshing the page. The page functionality will be limited."
    );
    return;
  }

  const { v4: uuidv4 } = window.uuid;
  console.log("UUID library successfully accessed.");

  // SVG string for Lucide 'X' icon
  const xIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  const RHETORICAL_PURPOSES = {
    NONE: {
      name: "Select Purpose...",
      color: "transparent",
      isPlaceholder: true,
    },
    NARRATION: {
      name: "Narration / Exposition",
      color: "var(--purpose-narration)",
    },
    DESCRIPTION: {
      name: "Description / Imagery",
      color: "var(--purpose-description)",
    },
    ARGUMENTATION: {
      name: "Argumentation / Persuasion",
      color: "var(--purpose-argumentation)",
    },
    LOGICAL_APPEAL: {
      name: "Logical Appeal (Logos)",
      color: "var(--purpose-logical-appeal)",
    },
    EMOTIONAL_APPEAL: {
      name: "Emotional Appeal (Pathos)",
      color: "var(--purpose-emotional-appeal)",
    },
    ETHICAL_APPEAL: {
      name: "Ethical Appeal (Ethos)",
      color: "var(--purpose-ethical-appeal)",
    },
    FORESHADOWING: {
      name: "Foreshadowing / Suspense",
      color: "var(--purpose-foreshadowing)",
    },
    CHARACTER_DEV: {
      name: "Character Development",
      color: "var(--purpose-character-dev)",
    },
    WORLD_BUILDING: {
      name: "World-Building",
      color: "var(--purpose-world-building)",
    },
    METAPHOR_SIMILE: {
      name: "Metaphor / Simile",
      color: "var(--purpose-metaphor-simile)",
    },
    IRONY_SATIRE: {
      name: "Irony / Satire",
      color: "var(--purpose-irony-satire)",
    },
    JUXTAPOSITION: {
      name: "Juxtaposition / Contrast",
      color: "var(--purpose-juxtaposition)",
    },
    CALL_TO_ACTION: {
      name: "Call to Action",
      color: "var(--purpose-call-to-action)",
    },
    HUMOR: { name: "Humor", color: "var(--purpose-humor)" },
    SOCIAL_COMMENTARY: {
      name: "Social Commentary",
      color: "var(--purpose-social-commentary)",
    },
    TONE_SETTING: {
      name: "Tone Setting / Mood",
      color: "var(--purpose-tone-setting)",
    },
    PACING_CONTROL: {
      name: "Pacing Control",
      color: "var(--purpose-pacing-control)",
    },
    SEXUAL_TITILLATION: {
      name: "Sexual Titillation",
      color: "var(--purpose-sexual-titillation)",
    },
    SYMBOLISM: { name: "Symbolism", color: "var(--purpose-symbolism)" },
    ALLUSION: { name: "Allusion", color: "var(--purpose-allusion)" },
  };

  const formsContainer = document.getElementById("analysis-forms-container");
  const reconstructedPassageContent = document.getElementById(
    "reconstructed-passage-content"
  );
  const addSentenceBtn = document.getElementById("add-sentence-btn");
  const addParagraphBtn = document.getElementById("add-paragraph-btn");
  const exportJsonBtn = document.getElementById("export-json-btn");
  const importJsonFile = document.getElementById("import-json-file");

  let analysisData = [];

  function createSentenceAnalysisForm(
    paragraphId,
    sentence = {
      id: uuidv4(),
      text: "",
      summary: "",
      purposeKey: "NONE",
      ties: "",
    }
  ) {
    const section = document.createElement("div");
    section.className = "analysis-form-section";
    section.dataset.sentenceId = sentence.id;
    section.dataset.paragraphId = paragraphId;

    section.innerHTML = `
      <button class="remove-section-btn remove-sentence-btn" title="Remove this sentence">${xIconSvg}</button>
      <div class="form-field">
        <textarea id="sentence-text-${sentence.id}" placeholder="Sentence(s) from passage">${sentence.text}</textarea>
      </div>
      <div class="form-field">
        <textarea id="sentence-summary-${sentence.id}" placeholder="Summary of meaning/idea conveyed">${sentence.summary}</textarea>
      </div>
      <div class="form-field">
        <select id="sentence-purpose-${sentence.id}">
          ${Object.entries(RHETORICAL_PURPOSES)
            .map(
              ([key, purp]) =>
                `<option value="${key}" ${key === sentence.purposeKey ? "selected" : ""} ${purp.isPlaceholder ? "disabled" : ""}>${purp.name}</option>`
            )
            .join("")}
        </select>
      </div>
      <div class="form-field">
        <textarea id="sentence-ties-${sentence.id}" placeholder="How it ties to the paragraph as a whole">${sentence.ties}</textarea>
      </div>
    `;

    section.querySelectorAll("textarea, select").forEach((input) => {
      input.addEventListener("input", () => {
        updateSentenceDataFromForm(paragraphId, sentence.id);
        renderReconstructedPassage();
      });
    });
    section
      .querySelector(".remove-sentence-btn")
      .addEventListener("click", () => {
        removeSentence(paragraphId, sentence.id);
      });

    return section;
  }

  function createParagraphElement(paragraphData, index) {
    const paragraphWrapper = document.createElement("div");
    paragraphWrapper.dataset.paragraphId = paragraphData.id;
    paragraphWrapper.className = "paragraph-group";

    const paragraphHeader = document.createElement("div");
    paragraphHeader.className = "paragraph-group-header";

    const heading = document.createElement("h3");
    heading.className = "paragraph-group-title";
    heading.textContent = `Paragraph ${index + 1}`;
    paragraphHeader.appendChild(heading);

    // Removed the paragraph "X" button creation
    paragraphWrapper.appendChild(paragraphHeader);

    const sentencesContainer = document.createElement("div");
    sentencesContainer.className = "sentences-container";

    paragraphData.sentences.forEach((sentence, sIndex) => {
      if (sIndex > 0) {
        const sentenceDivider = document.createElement("hr");
        sentenceDivider.className = "sentence-divider";
        sentencesContainer.appendChild(sentenceDivider);
      }
      sentencesContainer.appendChild(
        createSentenceAnalysisForm(paragraphData.id, sentence)
      );
    });
    paragraphWrapper.appendChild(sentencesContainer);

    return paragraphWrapper;
  }

  function renderAnalysisForms() {
    formsContainer.innerHTML = "";
    analysisData.forEach((para, index) => {
      formsContainer.appendChild(createParagraphElement(para, index));
    });
  }

  function renderReconstructedPassage() {
    reconstructedPassageContent.innerHTML = ""; // Clear existing content
    analysisData.forEach((paragraph) => {
      if (paragraph.sentences.length > 0) {
        const pElem = document.createElement("p");
        pElem.className = "reconstructed-paragraph";

        // Concatenate sentence texts for the paragraph
        let paragraphText = "";
        paragraph.sentences.forEach((sentence, index) => {
          if (sentence.text && sentence.text.trim() !== "") {
            paragraphText += sentence.text;
            // Add a space if it's not the last sentence and the current sentence has text
            if (index < paragraph.sentences.length - 1) {
              // Check if next sentence also has text to avoid trailing space for last actual sentence
              const nextSentenceHasText = paragraph.sentences
                .slice(index + 1)
                .some((s) => s.text && s.text.trim() !== "");
              if (
                nextSentenceHasText ||
                (paragraph.sentences[index + 1] &&
                  paragraph.sentences[index + 1].text &&
                  paragraph.sentences[index + 1].text.trim() !== "")
              ) {
                paragraphText += " ";
              }
            }
          }
        });

        // Now, create spans for highlighting within this concatenated text
        // This part is tricky if we want to maintain individual sentence highlights
        // For simplicity, let's first ensure concatenation works.
        // A more advanced highlighting would require splitting the paragraphText by original sentence boundaries.

        // Simpler approach: create spans for each sentence and append them.
        // The browser should handle concatenation of text nodes and spans correctly.
        paragraph.sentences.forEach((sentence, index) => {
          if (sentence.text && sentence.text.trim() !== "") {
            const span = document.createElement("span");
            span.className = "sentence-highlight";
            span.textContent = sentence.text; // Just the sentence text
            const purpose =
              RHETORICAL_PURPOSES[sentence.purposeKey] ||
              RHETORICAL_PURPOSES.NONE;
            span.style.backgroundColor = purpose.color; // Apply color
            pElem.appendChild(span);

            // Add a space if not the last actual text-containing sentence in this paragraph
            const isLastTextSentence = !paragraph.sentences
              .slice(index + 1)
              .some((s) => s.text && s.text.trim() !== "");
            if (!isLastTextSentence) {
              pElem.appendChild(document.createTextNode(" "));
            }
          }
        });

        if (pElem.hasChildNodes()) {
          // Only append if there's content
          reconstructedPassageContent.appendChild(pElem);
        }
      }
    });
  }

  function updateSentenceDataFromForm(paragraphId, sentenceId) {
    const paragraph = analysisData.find((p) => p.id === paragraphId);
    if (!paragraph) return;
    const sentence = paragraph.sentences.find((s) => s.id === sentenceId);
    if (!sentence) return;

    sentence.text = document.getElementById(
      `sentence-text-${sentenceId}`
    ).value;
    sentence.summary = document.getElementById(
      `sentence-summary-${sentenceId}`
    ).value;
    sentence.purposeKey = document.getElementById(
      `sentence-purpose-${sentenceId}`
    ).value;
    sentence.ties = document.getElementById(
      `sentence-ties-${sentenceId}`
    ).value;
  }

  function addParagraph() {
    const newParagraphId = uuidv4();
    analysisData.push({ id: newParagraphId, sentences: [] });
    addSentenceToParagraph(newParagraphId); // Automatically adds one sentence
  }

  function removeParagraph(paragraphIdToRemove) {
    analysisData = analysisData.filter((p) => p.id !== paragraphIdToRemove);
    if (analysisData.length === 0) {
      addParagraph();
    } else {
      renderAnalysisForms();
      renderReconstructedPassage();
    }
  }

  function addSentenceToParagraph(paragraphId) {
    const paragraph = analysisData.find((p) => p.id === paragraphId);
    if (paragraph) {
      const newSentence = {
        id: uuidv4(),
        text: "",
        summary: "",
        purposeKey: "NONE",
        ties: "",
      };
      paragraph.sentences.push(newSentence);
      renderAnalysisForms();
      setTimeout(() => {
        const newTextArea = document.getElementById(
          `sentence-text-${newSentence.id}`
        );
        if (newTextArea) newTextArea.focus();
      }, 0);
      renderReconstructedPassage();
    }
  }

  function handleAddSentence() {
    if (analysisData.length === 0) {
      addParagraph();
    } else {
      const lastParagraphId = analysisData[analysisData.length - 1].id;
      addSentenceToParagraph(lastParagraphId);
    }
  }

  function removeSentence(paragraphId, sentenceId) {
    const paragraphIndex = analysisData.findIndex((p) => p.id === paragraphId);
    if (paragraphIndex === -1) return;

    analysisData[paragraphIndex].sentences = analysisData[
      paragraphIndex
    ].sentences.filter((s) => s.id !== sentenceId);

    if (analysisData[paragraphIndex].sentences.length === 0) {
      if (analysisData.length > 1) {
        analysisData.splice(paragraphIndex, 1);
      }
    }

    if (
      analysisData.length === 0 ||
      (analysisData.length === 1 && analysisData[0].sentences.length === 0)
    ) {
      // If all paragraphs are gone, or the last paragraph is now empty of sentences
      if (analysisData.length === 0)
        addParagraph(); // Add a new paragraph with one sentence
      else {
        // Last paragraph is empty, ensure it's rendered correctly
        renderAnalysisForms();
        renderReconstructedPassage();
      }
    } else {
      renderAnalysisForms();
      renderReconstructedPassage();
    }
  }

  function exportToJson() {
    const filename = `close-reading-analysis-${new Date().toISOString().slice(0, 10)}.json`;
    const jsonStr = JSON.stringify(analysisData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importFromJson(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (Array.isArray(importedData)) {
            analysisData = importedData;
            analysisData.forEach((p) => {
              p.id = p.id || uuidv4();
              p.sentences.forEach((s) => {
                s.id = s.id || uuidv4();
              });
            });
            renderAnalysisForms();
            renderReconstructedPassage();
          } else {
            alert("Invalid JSON file format.");
          }
        } catch (error) {
          alert("Error parsing JSON file: " + error.message);
        }
      };
      reader.readAsText(file);
      event.target.value = null;
    }
  }

  addParagraphBtn.addEventListener("click", addParagraph);
  addSentenceBtn.addEventListener("click", handleAddSentence);
  exportJsonBtn.addEventListener("click", exportToJson);
  importJsonFile.addEventListener("change", importFromJson);

  if (analysisData.length === 0) {
    addParagraph();
  } else {
    renderAnalysisForms();
    renderReconstructedPassage();
  }
});
