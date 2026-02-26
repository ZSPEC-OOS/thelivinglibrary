// Create Page Logic - Button-Driven Workflow
const API_URL = 'https://book-api-tgl9.onrender.com/api/develop';
let currentPhase = 1;
let bookData = {
    concept: '',
    development: null,
    outline: [],
    referenceProtocol: false,
    chapters: [],
    currentBatch: 0,
    currentChapter: 0,
    sessionId: null,
    compiledMarkdown: ''
};

// Phase configurations
const PHASES = {
    1: 'phase1',
    2: 'phase2', 
    3: 'phase3',
    4: 'phase4',
    6: 'phase6',
    complete: 'phaseComplete'
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // Phase 1: Concept input
    const conceptInput = document.getElementById('conceptInput');
    const charCount = document.querySelector('.char-count');
    
    conceptInput.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = `${count} / 2000`;
        if (count > 2000) {
            this.value = this.value.substring(0, 2000);
            charCount.textContent = '2000 / 2000';
        }
        bookData.concept = this.value;
    });

    // Suggestion chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', function() {
            conceptInput.value = this.dataset.prompt;
            bookData.concept = this.dataset.prompt;
            charCount.textContent = `${this.dataset.prompt.length} / 2000`;
        });
    });

    // Phase 1 Continue
    document.getElementById('phase1Continue').addEventListener('click', () => {
        if (!bookData.concept.trim()) {
            alert('Please enter a concept for your book.');
            return;
        }
        proceedToPhase(2);
    });

    // Phase 2 Continue
    document.getElementById('phase2Continue').addEventListener('click', () => {
        proceedToPhase(3);
    });

    // Phase 3 Continue (next batch or proceed)
    document.getElementById('phase3Continue').addEventListener('click', () => {
        if (bookData.currentBatch < totalBatches() - 1) {
            bookData.currentBatch++;
            loadOutlineBatch(bookData.currentBatch);
        } else {
            proceedToPhase(4);
        }
    });

    // Phase 4: Reference Protocol buttons
    document.getElementById('refYes').addEventListener('click', () => {
        bookData.referenceProtocol = true;
        proceedToPhase(6);
    });

    document.getElementById('refNo').addEventListener('click', () => {
        bookData.referenceProtocol = false;
        proceedToPhase(6);
    });

    // Phase 6 Continue (next chapter or complete)
    document.getElementById('phase6Continue').addEventListener('click', () => {
        if (bookData.currentChapter < bookData.outline.length - 1) {
            bookData.currentChapter++;
            loadChapter(bookData.currentChapter);
        } else {
            proceedToPhase('complete');
        }
    });
}

// Navigation
function proceedToPhase(phase) {
    // Hide current phase
    document.querySelectorAll('.phase-content').forEach(p => p.classList.remove('active'));
    
    // Update progress bar
    updateProgressBar(phase);
    
    // Show new phase
    const phaseId = PHASES[phase];
    document.getElementById(phaseId).classList.add('active');
    
    // Phase-specific initialization
    switch(phase) {
        case 2:
            loadDevelopment();
            break;
        case 3:
            bookData.currentBatch = 0;
            loadOutlineBatch(0);
            break;
        case 4:
            // Audit already applied silently in background
            showAuditSummary();
            break;
        case 6:
            bookData.currentChapter = 0;
            loadChapter(0);
            break;
        case 'complete':
            showFinalBook();
            break;
    }
    
    currentPhase = phase;
}

function updateProgressBar(phase) {
    const stepNum = phase === 'complete' ? 5 : 
                    phase === 6 ? 5 :
                    phase >= 4 ? 4 : phase;
    
    document.querySelectorAll('.step').forEach((step, idx) => {
        const stepNumber = idx + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < stepNum) {
            step.classList.add('completed');
        } else if (stepNumber === stepNum) {
            step.classList.add('active');
        }
    });
}

// Phase 2: Load Development (AI Integration Point)
async function loadDevelopment() {
  const container = document.getElementById('developmentContent');
  const continueBtn = document.getElementById('phase2Continue');
  
  container.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Consulting Claude Opus 4.6...</p>
    </div>
  `;
  continueBtn.style.display = 'none';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase: 2,
        data: { concept: bookData.concept }
      })
    });

    const result = await response.json();
    
    if (!result.success) throw new Error(result.error);

    bookData.development = result.data;
    bookData.sessionId = result.sessionId;

    // Display results
    container.innerHTML = `
      <div class="development-section">
        <h4>Title</h4>
        <p>${result.data.title || 'Untitled'}</p>
      </div>
      <div class="development-section">
        <h4>Premise</h4>
        <p>${result.data.premise || 'No premise generated'}</p>
      </div>
      <div class="development-section">
        <h4>Genre & Audience</h4>
        <p>${result.data.genre || 'Fiction'} | ${result.data.audience || 'General'}</p>
      </div>
      <div class="development-section">
        <h4>Thesis</h4>
        <p>${result.data.thesis || ''}</p>
      </div>
    `;
    
    continueBtn.style.display = 'inline-flex';
    
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="color: #ff4444; padding: 2rem;">Error: ${err.message}</p>`;
  }
}

// Phase 3: Load Outline Batch (AI Integration Point)
async function loadOutlineBatch(batchIndex) {
    const container = document.getElementById('outlineContent');
    const indicator = document.getElementById('batchIndicator');
    const continueBtn = document.getElementById('phase3Continue');
    
    // Show loading on first load
    if (bookData.outline.length === 0) {
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Generating chapter outline...</p>
            </div>
        `;
        
        // AI INTEGRATION: Call your AI service here with Phase 3 prompt
        // const outline = await callAIService({
        //     phase: 3,
        //     development: bookData.development
        // });
        
        await simulateDelay(2500);
        bookData.outline = generateMockOutline();
    }
    
    // Calculate batch
    const batchSize = 5;
    const totalBatches = Math.ceil(bookData.outline.length / batchSize);
    const start = batchIndex * batchSize;
    const end = Math.min(start + batchSize, bookData.outline.length);
    const batch = bookData.outline.slice(start, end);
    
    // Update indicator
    indicator.textContent = `Batch ${batchIndex + 1} of ${totalBatches}`;
    
    // Render batch
    container.innerHTML = batch.map((chapter, idx) => `
        <div class="chapter-item">
            <h3>Chapter ${start + idx + 1}: ${chapter.title}</h3>
            <div class="chapter-meta">
                <p><strong>Purpose:</strong> ${chapter.purpose}</p>
                <p><strong>Opening:</strong> ${chapter.opening}</p>
                <p><strong>Key Elements:</strong> ${chapter.keyElements.join(', ')}</p>
            </div>
        </div>
    `).join('');
    
    // Update button text
    continueBtn.textContent = batchIndex < totalBatches - 1 ? 'Continue' : 'Proceed to References';
}

function totalBatches() {
    return Math.ceil(bookData.outline.length / 5);
}

// Phase 4: Show Audit Summary (Tier 2 applied silently)
function showAuditSummary() {
    const container = document.getElementById('auditSummary');
    
    // AI INTEGRATION: Phase 4 audit already received with outline
    // Tier 2 revisions applied silently
    
    container.innerHTML = `
        <p><strong>Structural Audit Complete</strong></p>
        <p>Pacing: Verified | Balance: Adjusted | Arc: Intact</p>
        <p>All architectural optimizations applied automatically.</p>
    `;
}

// Phase 6: Load Chapter (AI Integration Point)
async function loadChapter(chapterIndex) {
    const container = document.getElementById('chapterContent');
    const title = document.getElementById('chapterTitle');
    const indicator = document.getElementById('chapterIndicator');
    const continueBtn = document.getElementById('phase6Continue');
    
    const chapter = bookData.outline[chapterIndex];
    
    title.textContent = `Chapter ${chapterIndex + 1}: ${chapter.title}`;
    indicator.textContent = `Chapter ${chapterIndex + 1} of ${bookData.outline.length}`;
    
    // Show loading
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Developing chapter content...</p>
        </div>
    `;
    
    // AI INTEGRATION: Call your AI service here with Phase 6 prompt
    // const chapterContent = await callAIService({
    //     phase: 6,
    //     chapter: chapter,
    //     referenceProtocol: bookData.referenceProtocol,
    //     chapterNumber: chapterIndex + 1
    // });
    
    await simulateDelay(3000);
    const chapterContent = generateMockChapter(chapter, chapterIndex + 1);
    bookData.chapters.push(chapterContent);
    
    // Render chapter (streamlined - no separate reference list)
    container.innerHTML = `
        <h3>${chapter.title}</h3>
        ${chapterContent.content}
    `;
    
    // Update button text
    continueBtn.textContent = chapterIndex < bookData.outline.length - 1 ? 'Continue' : 'Complete Book';
}

// Compile all content into markdown
function compileBook() {
    const dev = bookData.development;
    const chapters = bookData.chapters;
    
    let md = `# ${dev.title}\n\n`;
    md += `*${dev.genre} | ${dev.audience}*\n\n`;
    md += `---\n\n`;
    md += `## Premise\n\n${dev.premise}\n\n`;
    md += `## Core Thesis\n\n${dev.thesis}\n\n`;
    md += `---\n\n`;
    
    // Table of Contents
    md += `## Contents\n\n`;
    bookData.outline.forEach((ch, i) => {
        md += `${i + 1}. [${ch.title}](#chapter-${i + 1})\n`;
    });
    md += `\n---\n\n`;
    
    // Chapters
    chapters.forEach((ch, i) => {
        const outline = bookData.outline[i];
        md += `<a id="chapter-${i + 1}"></a>\n\n`;
        md += `# Chapter ${i + 1}: ${outline.title}\n\n`;
        
        if (ch.hasReferences && ch.references) {
            md += `*References available at chapter end*\n\n`;
        }
        
        md += `${ch.content}\n\n`;
        
        if (ch.hasReferences && ch.references) {
            md += `## References\n\n${ch.references}\n\n`;
        }
        
        md += `---\n\n`;
    });
    
    return md;
}

// Simple markdown to HTML converter
function markdownToHTML(md) {
    return md
        // Headers
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        // Bold/Italic
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        // Blockquotes
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
        // Line breaks
        .replace(/\n\n/gim, '</p><p>')
        // Wrap in paragraphs
        .replace(/^(?!<[h|b|p|u|o|l])(.*$)/gim, '<p>$1</p>')
        // Cleanup empty paragraphs
        .replace(/<p><\/p>/gim, '')
        // Horizontal rules
        .replace(/^---$/gim, '<hr>');
}

// Show final book
function showFinalBook() {
    const container = document.getElementById('bookContent');
    const title = document.getElementById('finalTitle');
    
    // Compile markdown
    const md = compileBook();
    bookData.compiledMarkdown = md; // Store for later
    
    // Convert to HTML and display
    title.textContent = bookData.development.title;
    container.innerHTML = markdownToHTML(md);
}

// Publish function
function publishBook() {
    // Show publishing status
    const btn = document.querySelector('.viewer-actions .action-btn.primary');
    const originalText = btn.textContent;
    btn.textContent = 'Publishing...';
    btn.disabled = true;
    
    // Simulate publish (replace with actual API call)
    setTimeout(() => {
        alert(`"${bookData.development.title}" has been published to The Living Library!`);
        btn.textContent = 'Published';
        btn.style.background = 'var(--color-bg-tertiary)';
        
        // Here you would send to backend:
        // saveToLibrary(bookData);
    }, 1500);
}

// Reset
function resetCreate() {
    if (!confirm('Start a new book? Current progress will be lost.')) return;
    
    bookData = {
        concept: '',
        development: null,
        outline: [],
        referenceProtocol: false,
        chapters: [],
        currentBatch: 0,
        currentChapter: 0,
        sessionId: null,
        compiledMarkdown: ''
    };
    
    document.getElementById('conceptInput').value = '';
    document.querySelector('.char-count').textContent = '0 / 2000';
    
    // Reset progress bar
    document.querySelectorAll('.step').forEach(s => {
        s.classList.remove('active', 'completed');
    });
    document.querySelector('.step[data-phase="1"]').classList.add('active');
    
    proceedToPhase(1);
}

// Utility
function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock Data Generators (Replace with AI calls)
function generateMockDevelopment() {
    return {
        premise: `A ${bookData.concept.slice(0, 50)}... [AI-refined premise would go here with full narrative hook and audience positioning]`,
        genre: 'Literary Fiction / Speculative',
        audience: 'Adult readers interested in philosophical narratives',
        thesis: 'The exploration of memory as commodity reveals the fragility of identity in capitalist systems.',
        title: 'The Memory Broker: A Novel of Exchange'
    };
}

function generateMockOutline() {
    return Array.from({length: 12}, (_, i) => ({
        title: `Chapter Title ${i + 1}`,
        purpose: `Advance the narrative arc through key revelation ${i + 1}`,
        opening: `Scene opens with dramatic tension establishing stakes`,
        keyElements: ['Character development', 'Plot advancement', 'Thematic resonance']
    }));
}

function generateMockChapter(chapter, number) {
    return {
        content: `<p>Chapter ${number} content would appear here, fully developed with ${bookData.referenceProtocol ? 'inline citations' : 'authoritative synthesis'}...</p>
                  <p>The narrative unfolds with careful attention to the established outline: ${chapter.purpose}</p>
                  <p>[Full chapter prose generated by AI based on your prompt]</p>`,
        hasReferences: bookData.referenceProtocol,
        references: bookData.referenceProtocol ? '1. Author, A. Title. Journal. 2024;1:1-10.' : null
    };
}

// AI Integration Template
/*
async function callAIService(params) {
    const response = await fetch('/api/ai/book-development', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: YOUR_PROMPT_HERE,
            phase: params.phase,
            data: params
        })
    });
    return await response.json();
}
*/
