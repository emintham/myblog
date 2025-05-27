document.addEventListener('DOMContentLoaded', async () => { // <-- Added async
  const MAX_WAIT_ATTEMPTS = 50; // Try for up to 5 seconds (50 * 100ms)
  const WAIT_INTERVAL_MS = 100;
  let attempts = 0;

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  while (
    (typeof window.uuid === 'undefined' || typeof window.uuid.v4 === 'undefined') &&
    attempts < MAX_WAIT_ATTEMPTS
  ) {
    await delay(WAIT_INTERVAL_MS);
    attempts++;
  }

  if (typeof window.uuid === 'undefined' || typeof window.uuid.v4 === 'undefined') {
    console.error('UUID library (window.uuid) failed to load after waiting.');
    alert('A critical library (uuid) could not be loaded. Please check your internet connection and try refreshing the page. The page functionality will be limited.');
    return; // Stop execution if uuid is not available
  }

  // uuidv4 will be globally available from the CDN script
  const { v4: uuidv4 } = window.uuid; // Use window.uuid explicitly

  console.log('UUID library successfully accessed.'); // For confirmation

  const RHETORICAL_PURPOSES = {
    NONE: { name: "Select Purpose...", color: "transparent", isPlaceholder: true },
    NARRATION: { name: "Narration / Exposition", color: "var(--purpose-narration)" },
    DESCRIPTION: { name: "Description / Imagery", color: "var(--purpose-description)" },
    ARGUMENTATION: { name: "Argumentation / Persuasion", color: "var(--purpose-argumentation)" },
    LOGICAL_APPEAL: { name: "Logical Appeal (Logos)", color: "var(--purpose-logical-appeal)" },
    EMOTIONAL_APPEAL: { name: "Emotional Appeal (Pathos)", color: "var(--purpose-emotional-appeal)" },
    ETHICAL_APPEAL: { name: "Ethical Appeal (Ethos)", color: "var(--purpose-ethical-appeal)" },
    FORESHADOWING: { name: "Foreshadowing / Suspense", color: "var(--purpose-foreshadowing)" },
    CHARACTER_DEV: { name: "Character Development", color: "var(--purpose-character-dev)" },
    WORLD_BUILDING: { name: "World-Building", color: "var(--purpose-world-building)" },
    METAPHOR_SIMILE: { name: "Metaphor / Simile", color: "var(--purpose-metaphor-simile)" },
    IRONY_SATIRE: { name: "Irony / Satire", color: "var(--purpose-irony-satire)" },
    JUXTAPOSITION: { name: "Juxtaposition / Contrast", color: "var(--purpose-juxtaposition)" },
    CALL_TO_ACTION: { name: "Call to Action", color: "var(--purpose-call-to-action)" },
    HUMOR: { name: "Humor", color: "var(--purpose-humor)" },
    SOCIAL_COMMENTARY: { name: "Social Commentary", color: "var(--purpose-social-commentary)" },
    TONE_SETTING: { name: "Tone Setting / Mood", color: "var(--purpose-tone-setting)" },
    PACING_CONTROL: { name: "Pacing Control", color: "var(--purpose-pacing-control)" },
    SEXUAL_TITILLATION: { name: "Sexual Titillation", color: "var(--purpose-sexual-titillation)" },
    SYMBOLISM: { name: "Symbolism", color: "var(--purpose-symbolism)" },
    ALLUSION: { name: "Allusion", color: "var(--purpose-allusion)" },
  };

  const formsContainer = document.getElementById('analysis-forms-container');
  const reconstructedPassageContent = document.getElementById('reconstructed-passage-content');
  const addSentenceBtn = document.getElementById('add-sentence-btn');
  const addParagraphBtn = document.getElementById('add-paragraph-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const importJsonFile = document.getElementById('import-json-file');

  let analysisData = []; // Array of paragraphs, each paragraph has sentences

  function createSentenceAnalysisForm(paragraphId, sentence = { id: uuidv4(), text: '', summary: '', purposeKey: 'NONE', ties: '' }) {
    const section = document.createElement('div');
    section.className = 'analysis-form-section';
    section.dataset.sentenceId = sentence.id;
    section.dataset.paragraphId = paragraphId;

    section.innerHTML = `
      <button class="remove-section-btn" title="Remove this sentence analysis">&times;</button>
      <div class="form-field">
        <textarea id="sentence-text-${sentence.id}" placeholder="Sentence(s) from passage">${sentence.text}</textarea>
      </div>
      <div class="form-field">
        <textarea id="sentence-summary-${sentence.id}" placeholder="Summary of meaning/idea conveyed">${sentence.summary}</textarea>
      </div>
      <div class="form-field">
        <select id="sentence-purpose-${sentence.id}">
          ${Object.entries(RHETORICAL_PURPOSES).map(([key, purp]) => 
            `<option value="${key}" ${key === sentence.purposeKey ? 'selected' : ''} ${purp.isPlaceholder ? 'disabled' : ''}>${purp.name}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-field">
        <textarea id="sentence-ties-${sentence.id}" placeholder="How it ties to the paragraph as a whole">${sentence.ties}</textarea>
      </div>
    `;

    // Add event listeners for inputs to update data and reconstruction
    section.querySelectorAll('textarea, select').forEach(input => {
      input.addEventListener('input', () => {
        updateSentenceDataFromForm(paragraphId, sentence.id);
        renderReconstructedPassage();
      });
    });
    section.querySelector('.remove-section-btn').addEventListener('click', () => {
        removeSentence(paragraphId, sentence.id);
    });

    return section;
  }
  
  function createParagraphElement(paragraphData, index) {
    const paragraphWrapper = document.createElement('div');
    paragraphWrapper.dataset.paragraphId = paragraphData.id;
    paragraphWrapper.className = 'paragraph-form-group';

    if (index > 0) { // Don't add divider before the first paragraph
        const divider = document.createElement('hr');
        divider.className = 'paragraph-divider';
        paragraphWrapper.appendChild(divider);
        const heading = document.createElement('p');
        heading.className = 'paragraph-divider-heading';
        heading.textContent = `Paragraph ${index + 1}`;
        paragraphWrapper.appendChild(heading);
    } else {
        const heading = document.createElement('p');
        heading.className = 'paragraph-divider-heading';
        heading.textContent = `Paragraph ${index + 1}`; // Still label the first one
        paragraphWrapper.appendChild(heading);
    }


    paragraphData.sentences.forEach(sentence => {
      paragraphWrapper.appendChild(createSentenceAnalysisForm(paragraphData.id, sentence));
    });
    return paragraphWrapper;
  }


  function renderAnalysisForms() {
    formsContainer.innerHTML = ''; // Clear existing forms
    analysisData.forEach((para, index) => {
      formsContainer.appendChild(createParagraphElement(para, index));
    });
  }

  function renderReconstructedPassage() {
    reconstructedPassageContent.innerHTML = ''; // Clear existing
    analysisData.forEach(paragraph => {
      const pElem = document.createElement('p');
      pElem.className = 'reconstructed-paragraph';
      paragraph.sentences.forEach(sentence => {
        const span = document.createElement('span');
        span.className = 'sentence-highlight';
        span.textContent = sentence.text || "[Empty Sentence]"; // Show placeholder if empty
        const purpose = RHETORICAL_PURPOSES[sentence.purposeKey] || RHETORICAL_PURPOSES.NONE;
        span.style.backgroundColor = sentence.text ? purpose.color : 'transparent'; // Only color if text exists
        span.style.marginRight = '0.3em'; // Add space between sentences
        pElem.appendChild(span);
      });
      reconstructedPassageContent.appendChild(pElem);
    });
  }

  function updateSentenceDataFromForm(paragraphId, sentenceId) {
    const paragraph = analysisData.find(p => p.id === paragraphId);
    if (!paragraph) return;
    const sentence = paragraph.sentences.find(s => s.id === sentenceId);
    if (!sentence) return;

    sentence.text = document.getElementById(`sentence-text-${sentenceId}`).value;
    sentence.summary = document.getElementById(`sentence-summary-${sentenceId}`).value;
    sentence.purposeKey = document.getElementById(`sentence-purpose-${sentenceId}`).value;
    sentence.ties = document.getElementById(`sentence-ties-${sentenceId}`).value;
  }
  
  function addParagraph() {
    const newParagraphId = uuidv4(); // Use uuidv4 from global scope
    analysisData.push({ id: newParagraphId, sentences: [] });
    renderAnalysisForms();
    renderReconstructedPassage();
  }

  function addSentenceToParagraph(paragraphId) {
    const paragraph = analysisData.find(p => p.id === paragraphId);
    if (paragraph) {
      const newSentence = { id: uuidv4(), text: '', summary: '', purposeKey: 'NONE', ties: '' }; // Use uuidv4
      paragraph.sentences.push(newSentence);
      renderAnalysisForms(); 
      setTimeout(() => {
        const newTextArea = document.getElementById(`sentence-text-${newSentence.id}`);
        if (newTextArea) newTextArea.focus();
      }, 0);
      renderReconstructedPassage();
    }
  }
  
  function handleAddSentence() {
    if (analysisData.length === 0) {
      addParagraph(); 
    }
    const lastParagraphId = analysisData[analysisData.length - 1].id;
    addSentenceToParagraph(lastParagraphId);
  }

  function removeSentence(paragraphId, sentenceId) {
    const paragraphIndex = analysisData.findIndex(p => p.id === paragraphId);
    if (paragraphIndex === -1) return;

    analysisData[paragraphIndex].sentences = analysisData[paragraphIndex].sentences.filter(s => s.id !== sentenceId);
    
    if (analysisData[paragraphIndex].sentences.length === 0 && analysisData.length > 1) {
        analysisData.splice(paragraphIndex, 1);
    } else if (analysisData[paragraphIndex].sentences.length === 0 && analysisData.length === 1 && analysisData[0].sentences.length === 0) {
        // No change needed here
    }

    renderAnalysisForms();
    renderReconstructedPassage();
  }

  function exportToJson() {
    const filename = `close-reading-analysis-${new Date().toISOString().slice(0,10)}.json`;
    const jsonStr = JSON.stringify(analysisData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
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
            renderAnalysisForms();
            renderReconstructedPassage();
          } else {
            alert('Invalid JSON file format.');
          }
        } catch (error) {
          alert('Error parsing JSON file: ' + error.message);
        }
      };
      reader.readAsText(file);
      event.target.value = null; 
    }
  }

  addParagraphBtn.addEventListener('click', addParagraph);
  addSentenceBtn.addEventListener('click', handleAddSentence);
  exportJsonBtn.addEventListener('click', exportToJson);
  importJsonFile.addEventListener('change', importFromJson);

  if (analysisData.length === 0) {
    addParagraph(); 
    handleAddSentence(); 
  } else { 
    renderAnalysisForms();
    renderReconstructedPassage();
  }
});