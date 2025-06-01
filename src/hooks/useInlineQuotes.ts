import { useState, useCallback } from "react";
import type { Quote } from "../types/admin";

export interface UseInlineQuotesProps {
  initialQuotes?: Quote[];
}

export function useInlineQuotes({
  initialQuotes = [],
}: UseInlineQuotesProps = {}) {
  const [inlineQuotes, setInlineQuotes] = useState<Quote[]>(initialQuotes);

  const handleAddQuote = useCallback(() => {
    setInlineQuotes((prevQuotes) => [
      ...prevQuotes,
      {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 15), // Simple unique ID
        text: "",
        tags: [],
      },
    ]);
  }, []);

  const handleRemoveQuote = useCallback((id: string) => {
    setInlineQuotes((prevQuotes) =>
      prevQuotes.filter((quote) => quote.id !== id)
    );
  }, []);

  const handleUpdateQuoteField = useCallback(
    <K extends keyof Omit<Quote, "id">>(
      id: string,
      field: K,
      value: Quote[K]
    ) => {
      setInlineQuotes((prevQuotes) =>
        prevQuotes.map((quote) =>
          quote.id === id ? { ...quote, [field]: value } : quote
        )
      );
    },
    []
  );

  return {
    inlineQuotes,
    setInlineQuotes, // Expose setter for explicit resets if needed
    handleAddQuote,
    handleRemoveQuote,
    handleUpdateQuoteField,
  };
}
