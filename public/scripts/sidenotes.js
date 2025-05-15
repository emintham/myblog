const SidenoteManager = {
  elements: {
    references: null,
    mainWrapper: null,
    originalFootnotesContainer: null,
  },
  sidenotesData: [], // Stores { element, idealTop } for each sidenote
  config: {
    accumulatedOffsetY: 0,
    VERTICAL_MARGIN: 15, // px - Desired vertical gap between sidenotes
    HORIZONTAL_GAP: 20, // px - Horizontal gap from main content
    SIDENOTE_WIDTH: 180, // px - Default/expected width of a sidenote
  },

  /**
   * Finds and stores essential DOM elements.
   * @returns {boolean} True if essential elements are found, false otherwise.
   */
  initializeDOMReferences: function () {
    this.elements.references = document.querySelectorAll(
      'a[id^="user-content-fnref-"][data-footnote-ref]'
    );
    this.elements.mainWrapper = document.querySelector(".content-wrapper");
    this.elements.originalFootnotesContainer = document.querySelector(
      "section.footnotes[data-footnotes]"
    );

    if (!this.elements.references.length || !this.elements.mainWrapper) {
      if (!this.elements.references.length)
        console.warn("Sidenotes: No footnote reference anchors found.");
      if (!this.elements.mainWrapper)
        console.warn("Sidenotes: '.content-wrapper' not found.");
      return false;
    }
    console.log(
      `Sidenotes: Found ${this.elements.references.length} footnote references.`
    );
    return true;
  },

  /**
   * Hides the original footnotes section if found.
   */
  hideOriginalFootnotes: function () {
    if (this.elements.originalFootnotesContainer) {
      this.elements.originalFootnotesContainer.classList.add(
        "sidenotes-transformed"
      );
      console.log(
        "Sidenotes: Added .sidenotes-transformed to original footnotes container."
      );
    } else {
      console.warn(
        "Sidenotes: Original footnotes container not found to apply .sidenotes-transformed."
      );
    }
  },

  /**
   * Creates sidenote elements from Markdown footnotes, but doesn't position them yet.
   * Populates this.sidenotesData.
   */
  prepareSidenoteElements: function () {
    this.sidenotesData = []; // Clear any previous data

    this.elements.references.forEach((refAnchor) => {
      const noteId = refAnchor.getAttribute("href").substring(1);
      const noteItem = document.getElementById(noteId);
      const refNumber = refAnchor.textContent || "";

      if (noteItem) {
        const sidenoteElement = document.createElement("aside");
        sidenoteElement.classList.add("sidenote");
        sidenoteElement.classList.add("sidenote-right"); // Defaulting to right margin

        const noteContentClone = noteItem.cloneNode(true);
        const backref = noteContentClone.querySelector(
          "a[data-footnote-backref]"
        );
        if (backref) backref.remove();

        let noteTextHTML = "";
        const paragraph = noteContentClone.querySelector("p");
        if (paragraph) {
          noteTextHTML = paragraph.innerHTML;
        } else {
          noteTextHTML = noteContentClone.textContent.replace("↩", "").trim();
        }

        sidenoteElement.innerHTML = `<span class="sidenote-number">${refNumber}.</span> ${noteTextHTML}`;

        sidenoteElement.style.position = "absolute";
        sidenoteElement.style.visibility = "hidden"; // Keep hidden until fully positioned
        document.body.appendChild(sidenoteElement);

        const refAnchorRect = refAnchor.getBoundingClientRect();
        const documentScrollY =
          window.scrollY || document.documentElement.scrollTop;

        this.sidenotesData.push({
          element: sidenoteElement,
          idealTop: documentScrollY + refAnchorRect.top,
        });
      } else {
        console.warn(
          `Sidenotes: Footnote content for ID "${noteId}" not found (li element).`
        );
      }
    });
  },

  /**
   * Positions the prepared sidenote elements in the margin.
   */
  positionSidenoteElements: function () {
    if (!this.elements.mainWrapper || !this.sidenotesData.length) return;

    this.config.accumulatedOffsetY = 0; // Reset for the current column of sidenotes
    const contentWrapperRect =
      this.elements.mainWrapper.getBoundingClientRect(); // Get once

    this.sidenotesData.forEach((item) => {
      const { element, idealTop } = item;

      // Set horizontal position first as it might affect element's height due to word wrapping
      const sidenoteComputedStyle = getComputedStyle(element);
      const sidenoteWidth =
        parseFloat(sidenoteComputedStyle.width) || this.config.SIDENOTE_WIDTH;

      // Assuming all are 'sidenote-right' for now
      element.style.left = `${contentWrapperRect.right + window.scrollX + this.config.HORIZONTAL_GAP}px`;
      // element.style.width = `${sidenoteWidth}px`; // Ensure width is applied if CSS doesn't fix it. Typically CSS handles this.

      let currentTop = Math.max(idealTop, this.config.accumulatedOffsetY);
      element.style.top = `${currentTop}px`;

      // Make it visible now that it's positioned
      element.style.visibility = "visible";

      // Update the accumulated offset for the *next* sidenote on this side
      // Reading offsetHeight after visibility is set and it's in the DOM.
      const noteHeight = element.offsetHeight;
      this.config.accumulatedOffsetY =
        currentTop + noteHeight + this.config.VERTICAL_MARGIN;
    });
  },

  /**
   * Orchestrates the creation and positioning of all sidenotes.
   */
  processAllSidenotes: function () {
    console.log("Sidenotes: Processing all sidenotes...");
    // Remove any existing sidenotes from a previous run (e.g., on resize)
    document.querySelectorAll(".sidenote").forEach((sn) => sn.remove());

    if (!this.initializeDOMReferences()) {
      return; // Stop if essential elements aren't found
    }

    this.hideOriginalFootnotes();
    this.prepareSidenoteElements();
    this.positionSidenoteElements();
  },

  /**
   * Sets up initial event listeners.
   */
  init: function () {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.processAllSidenotes()
      );
    } else {
      this.processAllSidenotes(); // DOM is already loaded
    }

    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.processAllSidenotes(), 250);
    });
  },
};

// Initialize the SidenoteManager
SidenoteManager.init();
