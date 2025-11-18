import React, { useState } from "react";
import type {
  SynthesisData,
  FleetingThought,
  OrphanedContent,
  UnreferencedQuote,
} from "../../hooks/useSynthesisData";

interface SynthesisOpportunitiesProps {
  data: SynthesisData | null;
  isLoading: boolean;
}

export default function SynthesisOpportunities({
  data,
  isLoading,
}: SynthesisOpportunitiesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="synthesis-section">
        <h2>Synthesis Opportunities</h2>
        <p className="loading">Loading synthesis data...</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const totalOpportunities =
    data.counts.fleetingThoughts +
    data.counts.orphanedContent +
    data.counts.unreferencedQuotes;

  return (
    <div className="synthesis-section collapsible-section">
      <button
        className="section-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <h2>
          Synthesis Opportunities
          <span className="opportunity-count">({totalOpportunities})</span>
        </h2>
        <span className="toggle-icon">{isExpanded ? "−" : "+"}</span>
      </button>

      {isExpanded && (
        <div className="section-content">
          {/* Fleeting Thoughts to Expand */}
          {data.fleetingThoughts.length > 0 && (
            <div className="opportunity-category">
              <h3>
                Fleeting Thoughts to Expand ({data.counts.fleetingThoughts})
              </h3>
              <p className="category-description">
                These fleeting thoughts have 3+ related posts and could be
                expanded into full articles.
              </p>
              <div className="opportunity-list">
                {data.fleetingThoughts.map((thought) => (
                  <FleetingThoughtCard key={thought.slug} thought={thought} />
                ))}
              </div>
            </div>
          )}

          {/* Orphaned Content */}
          {data.orphanedContent.length > 0 && (
            <div className="opportunity-category">
              <h3>Orphaned Content ({data.counts.orphanedContent})</h3>
              <p className="category-description">
                Posts with few semantic connections that could benefit from more
                context or linking.
              </p>
              <div className="opportunity-list">
                {data.orphanedContent.map((content) => (
                  <OrphanedContentCard key={content.slug} content={content} />
                ))}
              </div>
            </div>
          )}

          {/* Unreferenced Quotes */}
          {data.unreferencedQuotes.length > 0 && (
            <div className="opportunity-category">
              <h3>Unreferenced Quotes ({data.counts.unreferencedQuotes})</h3>
              <p className="category-description">
                Book quotes that haven't been referenced in any posts yet.
              </p>
              <div className="opportunity-list">
                {data.unreferencedQuotes.map((quote, index) => (
                  <UnreferencedQuoteCard
                    key={`${quote.quotesRef}-${index}`}
                    quote={quote}
                  />
                ))}
              </div>
            </div>
          )}

          {totalOpportunities === 0 && (
            <p className="no-opportunities">
              No synthesis opportunities found. Great job keeping your content
              connected!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FleetingThoughtCard({ thought }: { thought: FleetingThought }) {
  const handleOpen = () => {
    window.open(`/admin/edit/${thought.slug}`, "_blank");
  };

  return (
    <div className="opportunity-card fleeting-thought-card">
      <div className="card-header">
        <h4>{thought.title}</h4>
        <span className="related-count">
          {thought.relatedCount} related posts
        </span>
      </div>
      <div className="related-posts">
        <p className="label">Related to:</p>
        <ul>
          {thought.relatedPosts.slice(0, 3).map((post) => (
            <li key={post.slug}>
              {post.title}{" "}
              <span className="score">({(post.score * 100).toFixed(0)}%)</span>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={handleOpen} className="action-button">
        Open in Editor
      </button>
    </div>
  );
}

function OrphanedContentCard({ content }: { content: OrphanedContent }) {
  const handleOpen = () => {
    window.open(`/admin/edit/${content.slug}`, "_blank");
  };

  return (
    <div className="opportunity-card orphaned-content-card">
      <div className="card-header">
        <h4>{content.title}</h4>
        <span className="post-type">{content.postType}</span>
      </div>
      <p className="connection-info">
        {content.connectionCount === 0
          ? "No semantic connections found"
          : `Only ${content.connectionCount} connection${content.connectionCount === 1 ? "" : "s"}`}
      </p>
      <button onClick={handleOpen} className="action-button">
        Open in Editor
      </button>
    </div>
  );
}

function UnreferencedQuoteCard({ quote }: { quote: UnreferencedQuote }) {
  const handleCopy = () => {
    const quoteMarkdown = `> ${quote.quoteText}\n> \n> — ${quote.bookAuthor}`;
    navigator.clipboard.writeText(quoteMarkdown);
  };

  return (
    <div className="opportunity-card unreferenced-quote-card">
      <div className="card-header">
        <h4>From "{quote.bookTitle}"</h4>
        <span className="book-author">by {quote.bookAuthor}</span>
      </div>
      <blockquote className="quote-preview">
        {quote.quoteText.length > 150
          ? `${quote.quoteText.substring(0, 150)}...`
          : quote.quoteText}
      </blockquote>
      <button onClick={handleCopy} className="action-button">
        Copy Quote
      </button>
    </div>
  );
}
