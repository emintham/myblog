// src/components/admin/Paragraph.tsx
// (Adjust path as needed in your Astro project)
import React from 'react';
import Sentence from './Sentence';
import type { ParagraphData, SentenceData } from '../../types/admin.d.ts';

interface ParagraphProps {
  paragraph: ParagraphData;
  index: number;
  onUpdateSentence: (paragraphId: string, sentenceId: string, updatedSentence: SentenceData) => void;
  onRemoveSentence: (paragraphId: string, sentenceId: string) => void;
  // onRemoveParagraph?: (paragraphId: string) => void; // Optional: if you add paragraph removal
}

const Paragraph: React.FC<ParagraphProps> = ({
  paragraph,
  index,
  onUpdateSentence,
  onRemoveSentence,
}) => {
  return (
    <div className="paragraph-group" data-paragraph-id={paragraph.id}>
      <div className="paragraph-group-header">
        <h3 className="paragraph-group-title">Paragraph {index + 1}</h3>
      </div>
      <div className="sentences-container">
        {paragraph.sentences.map((s, sIndex) => (
          <React.Fragment key={s.id}>
            {sIndex > 0 && <hr className="sentence-divider" />}
            <Sentence
              sentence={s}
              paragraphId={paragraph.id}
              onUpdateSentence={onUpdateSentence}
              onRemoveSentence={onRemoveSentence}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Paragraph;

