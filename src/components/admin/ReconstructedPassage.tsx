// src/components/admin/ReconstructedPassage.tsx
// (Adjust path as needed in your Astro project)
import React from "react";
import { RHETORICAL_PURPOSES } from "../constants";
import type { AnalysisData } from "../../types/admin.d.ts";

interface ReconstructedPassageProps {
  analysisData: AnalysisData;
}

const ReconstructedPassage: React.FC<ReconstructedPassageProps> = ({
  analysisData,
}) => {
  return (
    <div id="reconstructed-passage-content" className="passage-content">
      {analysisData.map((paragraph) => {
        const hasText = paragraph.sentences.some(
          (s) => s.text && s.text.trim() !== ""
        );
        if (!hasText) return null;

        return (
          <p key={paragraph.id} className="reconstructed-paragraph">
            {paragraph.sentences.map((sentence, index) => {
              if (sentence.text && sentence.text.trim() !== "") {
                const purpose =
                  RHETORICAL_PURPOSES[sentence.purposeKey] ||
                  RHETORICAL_PURPOSES.NONE;
                const isLastTextSentenceInParagraph = !paragraph.sentences
                  .slice(index + 1)
                  .some((s) => s.text && s.text.trim() !== "");

                return (
                  <React.Fragment key={sentence.id}>
                    <span
                      className="sentence-highlight"
                      style={{ backgroundColor: purpose.color }}
                    >
                      {sentence.text}
                    </span>
                    {!isLastTextSentenceInParagraph && " "}
                  </React.Fragment>
                );
              }
              return null;
            })}
          </p>
        );
      })}
    </div>
  );
};

export default ReconstructedPassage;
