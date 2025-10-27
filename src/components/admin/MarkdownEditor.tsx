import React, { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import "./MarkdownEditor.css";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  minHeight?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = "Start writing your Markdown content here...",
  minHeight = "400px",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;

    // Create the editor state with markdown support
    const startState = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        markdown(),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isInternalChange.current) {
            const newValue = update.state.doc.toString();
            onChange(newValue);
          }
        }),
        EditorView.domEventHandlers({
          blur: () => {
            onBlur?.();
          },
        }),
        EditorView.theme({
          "&": {
            minHeight: minHeight,
          },
          ".cm-scroller": {
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "14px",
            lineHeight: "1.6",
          },
          ".cm-content": {
            padding: "16px 0",
          },
          "&.cm-focused": {
            outline: "none",
          },
        }),
      ],
    });

    // Create the editor view
    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // Cleanup on unmount
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // Only run once on mount

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      isInternalChange.current = true;
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      });
      isInternalChange.current = false;
    }
  }, [value]);

  return <div ref={editorRef} className="markdown-editor" />;
};

export default MarkdownEditor;
