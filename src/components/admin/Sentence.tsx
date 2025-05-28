// src/components/admin/Sentence.tsx
// (Adjust path as needed in your Astro project)
import React from 'react';
import { X } from 'lucide-react';
import { RHETORICAL_PURPOSES } from '../constants';
import type { SentenceData } from '../../types/admin.d.ts';

interface SentenceProps {
  sentence: SentenceData;
  paragraphId: string;
  onUpdateSentence: (paragraphId: string, sentenceId: string, updatedSentence: SentenceData) => void;
  onRemoveSentence: (paragraphId: string, sentenceId: string) => void;
}

const Sentence: React.FC<SentenceProps> = ({
  sentence,
  paragraphId,
  onUpdateSentence,
  onRemoveSentence,
}) => {
  const handleInputChange = (field: keyof SentenceData, value: string) => {
    onUpdateSentence(paragraphId, sentence.id, { ...sentence, [field]: value });
  };

  return (
    <div className="analysis-form-section" data-sentence-id={sentence.id} data-paragraph-id={paragraphId}>
      <button
        className="remove-section-btn remove-sentence-btn"
        title="Remove this sentence"
        onClick={() => onRemoveSentence(paragraphId, sentence.id)}
      >
        <X className="remove-icon" />
      </button>
      <div className="form-field">
        <textarea
          id={`sentence-text-${sentence.id}`}
          placeholder="Sentence(s) from passage"
          value={sentence.text}
          onChange={(e) => handleInputChange('text', e.target.value)}
        />
      </div>
      <div className="form-field">
        <textarea
          id={`sentence-summary-${sentence.id}`}
          placeholder="Summary of meaning/idea conveyed"
          value={sentence.summary}
          onChange={(e) => handleInputChange('summary', e.target.value)}
        />
      </div>
      <div className="form-field">
        <select
          id={`sentence-purpose-${sentence.id}`}
          value={sentence.purposeKey}
          onChange={(e) => handleInputChange('purposeKey', e.target.value)}
        >
          {Object.entries(RHETORICAL_PURPOSES).map(([key, purp]) => (
            <option key={key} value={key} disabled={purp.isPlaceholder}>
              {purp.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <textarea
          id={`sentence-ties-${sentence.id}`}
          placeholder="How it ties to the paragraph as a whole"
          value={sentence.ties}
          onChange={(e) => handleInputChange('ties', e.target.value)}
        />
      </div>
    </div>
  );
};

export default Sentence;

