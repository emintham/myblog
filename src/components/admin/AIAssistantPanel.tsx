/**
 * AI Writing Assistant Panel
 * Collapsible sidebar for brainstorming, critiquing, and editing assistance
 */

import React, { useState, useEffect } from "react";
import { useOllamaChat } from "../../hooks/useOllamaChat";
import { ChevronLeft, ChevronRight, MessageSquare, AlertCircle } from "lucide-react";
import type { Prompt } from "../../utils/prompts";

interface AIAssistantPanelProps {
  sessionId: string; // e.g., post slug or "new-post"
  currentPost?: {
    title: string;
    body: string;
  };
  onInsertText?: (text: string) => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  sessionId,
  currentPost: currentPostProp,
  onInsertText,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [currentPost, setCurrentPost] = useState<{ title: string; body: string } | undefined>(
    currentPostProp
  );

  // Monitor form changes to update current post context
  useEffect(() => {
    const updateCurrentPost = () => {
      const titleInput = document.getElementById("title") as HTMLInputElement;
      const bodyContent = document.querySelector('[name="bodyContent"]') as HTMLTextAreaElement;

      if (titleInput && bodyContent) {
        setCurrentPost({
          title: titleInput.value || "",
          body: bodyContent.value || "",
        });
      }
    };

    // Update on mount
    updateCurrentPost();

    // Update on form changes (debounced)
    const interval = setInterval(updateCurrentPost, 2000);

    return () => clearInterval(interval);
  }, []);

  const { messages, isLoading, error, ollamaStatus, sendMessage, clearConversation } =
    useOllamaChat(sessionId, {
      contextMode: prompts.find((p) => p.id === selectedPromptId)?.contextMode || "none",
      currentPost,
    });

  // Load prompts on mount
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const response = await fetch("/api/prompts");
        const data = await response.json();
        if (data.prompts) {
          setPrompts(data.prompts);
        }
      } catch (err) {
        console.error("Failed to load prompts:", err);
      }
    };

    loadPrompts();
  }, []);

  const handleSendMessage = async () => {
    const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);

    let messageToSend = "";

    if (selectedPrompt?.allowCustom) {
      messageToSend = customPrompt;
    } else if (selectedPrompt) {
      messageToSend = selectedPrompt.prompt;
    } else if (inputMessage) {
      messageToSend = inputMessage;
    }

    if (!messageToSend.trim()) return;

    await sendMessage(messageToSend);
    setInputMessage("");
    setCustomPrompt("");
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const promptId = e.target.value;
    setSelectedPromptId(promptId);

    const selectedPrompt = prompts.find((p) => p.id === promptId);
    if (selectedPrompt && !selectedPrompt.allowCustom) {
      setInputMessage(selectedPrompt.prompt);
    } else {
      setInputMessage("");
    }
  };

  const handleCopyResponse = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleInsertText = (content: string) => {
    // Dispatch custom event for PostForm to handle
    window.dispatchEvent(
      new CustomEvent("aiInsertText", {
        detail: { content },
      })
    );
  };

  return (
    <div className={`ai-assistant-panel ${isCollapsed ? "collapsed" : ""}`}>
      <div className="ai-assistant-header">
        <button
          type="button"
          className="collapse-button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand AI Assistant" : "Collapse AI Assistant"}
        >
          {isCollapsed ? (
            <>
              <ChevronLeft size={16} />
              <MessageSquare size={16} />
            </>
          ) : (
            <>
              <MessageSquare size={16} />
              <span>AI Assistant</span>
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="ai-assistant-content">
          {/* Ollama Status */}
          {ollamaStatus && !ollamaStatus.available && (
            <div className="ai-assistant-error">
              <AlertCircle size={16} />
              <div>
                <strong>Ollama not available</strong>
                <p>{ollamaStatus.error}</p>
                <p className="ai-assistant-help">
                  Install Ollama from{" "}
                  <a href="https://ollama.com" target="_blank" rel="noopener noreferrer">
                    ollama.com
                  </a>{" "}
                  and ensure it's running.
                </p>
              </div>
            </div>
          )}

          {/* Prompt Selector */}
          {ollamaStatus?.available && (
            <div className="ai-prompt-selector">
              <label htmlFor="prompt-select">Quick Prompts:</label>
              <select
                id="prompt-select"
                value={selectedPromptId}
                onChange={handlePromptChange}
              >
                <option value="">-- Select a prompt --</option>
                {prompts.map((prompt) => (
                  <option key={prompt.id} value={prompt.id}>
                    {prompt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Prompt Input */}
          {selectedPromptId &&
            prompts.find((p) => p.id === selectedPromptId)?.allowCustom && (
              <div className="ai-custom-prompt">
                <label htmlFor="custom-prompt">Your question:</label>
                <textarea
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Type your question..."
                  rows={3}
                />
              </div>
            )}

          {/* Conversation */}
          <div className="ai-conversation">
            {messages.map((message, index) => (
              <div key={index} className={`ai-message ai-message-${message.role}`}>
                <div className="ai-message-role">
                  {message.role === "user" ? "You" : "AI"}
                </div>
                <div className="ai-message-content">{message.content}</div>
                {message.role === "assistant" && (
                  <div className="ai-message-actions">
                    <button
                      type="button"
                      onClick={() => handleCopyResponse(message.content)}
                      className="ai-action-button"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertText(message.content)}
                      className="ai-action-button"
                    >
                      Insert
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="ai-message ai-message-assistant">
                <div className="ai-message-role">AI</div>
                <div className="ai-message-content ai-loading">Thinking...</div>
              </div>
            )}

            {error && (
              <div className="ai-message ai-message-error">
                <AlertCircle size={16} />
                <div className="ai-message-content">{error}</div>
              </div>
            )}
          </div>

          {/* Input */}
          {ollamaStatus?.available && (
            <div className="ai-input-area">
              <div className="ai-input-wrapper">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask a question or send a prompt..."
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>
              <div className="ai-input-actions">
                <button
                  type="button"
                  onClick={clearConversation}
                  className="ai-secondary-button"
                  disabled={messages.length === 0}
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="ai-primary-button"
                  disabled={isLoading || !inputMessage.trim()}
                >
                  Send
                </button>
              </div>
              <div className="ai-hint">
                Press <kbd>Ctrl+Enter</kbd> or <kbd>⌘+Enter</kbd> to send
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
