// src/components/admin/CloseReadingAnalyzer.tsx
// (Adjust path according to your project structure)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Paragraph from './Paragraph';
import ReconstructedPassage from './ReconstructedPassage';
import { MAX_WAIT_ATTEMPTS, WAIT_INTERVAL_MS, delay } from '../constants';
import type { AnalysisData, SentenceData, ParagraphData, UuidV4Function } from '../../types/admin';
import { Plus, Type, Download, Upload } from 'lucide-react';

declare global {
  interface Window {
    uuid?: {
      v4?: UuidV4Function;
    };
  }
}

const CloseReadingAnalyzer: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisData>([]);
  const [uuidv4Func, setUuidv4Func] = useState<UuidV4Function | null>(null);
  const [isUuidLoading, setIsUuidLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUuid = async () => {
      let attempts = 0;
      while (
        (typeof window.uuid === "undefined" || typeof window.uuid.v4 === "undefined") &&
        attempts < MAX_WAIT_ATTEMPTS
      ) {
        await delay(WAIT_INTERVAL_MS);
        attempts++;
      }

      if (typeof window.uuid !== "undefined" && typeof window.uuid.v4 === "function") {
        setUuidv4Func(() => window.uuid!.v4!);
        console.log("UUID library successfully accessed via React.");
      } else {
        console.error("UUID library (window.uuid) failed to load after waiting.");
        setError("A critical library (uuid) could not be loaded. Functionality will be limited.");
      }
      setIsUuidLoading(false);
    };

    loadUuid();
  }, []);

  useEffect(() => {
    if (uuidv4Func && analysisData.length === 0) {
      const newParagraphId = uuidv4Func();
      const newSentence = { id: uuidv4Func(), text: "", summary: "", purposeKey: "NONE", ties: "" };
      setAnalysisData([{ id: newParagraphId, sentences: [newSentence] }]);
    }
  }, [uuidv4Func, analysisData.length]);

  const handleAddParagraph = useCallback(() => {
    if (!uuidv4Func) return;
    const newParagraphId = uuidv4Func();
    const newSentence = { id: uuidv4Func(), text: "", summary: "", purposeKey: "NONE", ties: "" };
    setAnalysisData(prevData => [
      ...prevData,
      { id: newParagraphId, sentences: [newSentence] }
    ]);
  }, [uuidv4Func]);

  const handleAddSentenceToLastParagraph = useCallback(() => {
    if (!uuidv4Func || analysisData.length === 0) return;
    const lastParagraphId = analysisData[analysisData.length - 1].id;
    const newSentence = { id: uuidv4Func(), text: "", summary: "", purposeKey: "NONE", ties: "" };

    setAnalysisData(prevData =>
      prevData.map(p =>
        p.id === lastParagraphId
          ? { ...p, sentences: [...p.sentences, newSentence] }
          : p
      )
    );
  }, [uuidv4Func, analysisData]);

  const handleUpdateSentence = useCallback((paragraphId: string, sentenceId: string, updatedSentenceData: SentenceData) => {
    setAnalysisData(prevData =>
      prevData.map(p =>
        p.id === paragraphId
          ? {
              ...p,
              sentences: p.sentences.map(s =>
                s.id === sentenceId ? updatedSentenceData : s
              ),
            }
          : p
      )
    );
  }, []);

  const handleRemoveSentence = useCallback((paragraphId: string, sentenceId: string) => {
    setAnalysisData(prevData => {
      if (!uuidv4Func) return prevData;

      let newData = prevData.map(p => {
        if (p.id === paragraphId) {
          return { ...p, sentences: p.sentences.filter(s => s.id !== sentenceId) };
        }
        return p;
      });

      newData = newData.filter(p => {
        if (p.sentences.length === 0) {
          return newData.length === 1; // Keep if it's the only one (it will be empty)
        }
        return true;
      });

      if (newData.length === 0 || (newData.length === 1 && newData[0].sentences.length === 0)) {
         const newPid = uuidv4Func();
         const newSid = uuidv4Func();
         return [{ id: newPid, sentences: [{ id: newSid, text: "", summary: "", purposeKey: "NONE", ties: "" }] }];
      }
      return newData;
    });
  }, [uuidv4Func]);

  const handleExportJson = () => {
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
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImportJsonFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!uuidv4Func) return;
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedResult = e.target?.result;
          if (typeof importedResult !== 'string') {
            alert("Error reading file content.");
            return;
          }
          const imported = JSON.parse(importedResult) as any[]; // Use 'any' for initial parse, then validate

          if (Array.isArray(imported)) {
            const validatedData: AnalysisData = imported.map((p: any) => ({
              id: p.id || uuidv4Func(),
              sentences: Array.isArray(p.sentences) ? p.sentences.map((s: any) => ({
                id: s.id || uuidv4Func(),
                text: typeof s.text === 'string' ? s.text : "",
                summary: typeof s.summary === 'string' ? s.summary : "",
                purposeKey: typeof s.purposeKey === 'string' ? s.purposeKey : "NONE",
                ties: typeof s.ties === 'string' ? s.ties : "",
              })) : [{ id: uuidv4Func(), text: "", summary: "", purposeKey: "NONE", ties: "" }]
            }));
            setAnalysisData(validatedData);
          } else {
            alert("Invalid JSON file format: Data should be an array of paragraphs.");
          }
        } catch (error) {
          alert("Error parsing JSON file: " + (error as Error).message);
        }
      };
      reader.readAsText(file);
      if(event.target) { // Reset file input to allow re-uploading the same file
        event.target.value = "";
      }
    }
  };

  if (isUuidLoading) {
    return <div>Loading libraries...</div>;
  }
  if (error) {
    return <div style={{ color: 'red', padding: '20px', border: '1px solid red' }}>Error: {error}</div>;
  }

  return (
    <div className="analyze-container">
      <aside id="left-column" className="left-column">
        <div className="reconstruction-area">
          <h2>Reconstructed Passage</h2>
          <ReconstructedPassage analysisData={analysisData} />
        </div>
        <div className="left-column-controls">
          <button
            type="button"
            id="add-paragraph-btn"
            className="control-button"
            onClick={handleAddParagraph}
            disabled={!uuidv4Func}
          >
            <Plus size={16} />
            New Paragraph
          </button>
          <button
            type="button"
            id="add-sentence-btn"
            className="control-button"
            onClick={handleAddSentenceToLastParagraph}
            disabled={!uuidv4Func || analysisData.length === 0}
          >
            <Type size={16} />
            New Sentence
          </button>
          <button
            type="button"
            id="export-json-btn"
            className="control-button"
            onClick={handleExportJson}
          >
            <Download size={16} />
            Export JSON
          </button>
          <button
            type="button"
            id="import-json-btn"
            className="control-button"
            onClick={triggerFileInput}
            disabled={!uuidv4Func}
          >
            <Upload size={16} />
            Import JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            id="import-json-file-handler"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportJsonFileSelected}
          />
        </div>
      </aside>
      <main id="right-column" className="right-column">
        <div id="analysis-forms-container">
          {analysisData.map((p, index) => (
            <Paragraph
              key={p.id}
              paragraph={p}
              index={index}
              onUpdateSentence={handleUpdateSentence}
              onRemoveSentence={handleRemoveSentence}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default CloseReadingAnalyzer;
