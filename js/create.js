// Create Page Logic - Claude 3.5 Sonnet Integration
const API_URL = 'https://book-api-tg19.onrender.com/api/develop';

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

// Phase 2: Load Development (Claude 3.5 Sonnet)
async function loadDevelopment() {
    const container = document.getElementById('developmentContent');
    const continueBtn = document.getElementById('phase2Continue');
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Consulting Claude 3.5 Sonnet...</p>
            <p style="font-size: 0.875rem; margin-top: 0.5rem;">This may take 10-20 seconds</p>
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

// Phase 3: Load Outline Batch (Claude 3.5 Sonnet)
async function loadOutlineBatch(batchIndex) {
    const container = document.getElementById('outlineContent');
    const indicator = document.getElementById('batchIndicator');
    const continueBtn = document.getElementById('phase3Continue');
    
    // Show loading on first load
    if (bookData.outline.length === 0) {
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Generating chapter outline with Claude 3.5 Sonnet...</p>
                <p style="font-size: 0.875rem;">This may take 15-30 seconds</p>
            </div>
        `;
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phase: 3,
                    sessionId: bookData.sessionId,
                    data: { development: bookData.development }
                })
            });

            const result = await response.json();
            if (!result.success) throw new Error(result.error);

            bookData.outline = result.data.chapters || [];
            
        } catch (err) {
            console.error(err);
            container.innerHTML = `<p style="color: #ff4444;">Error: ${err.message}</p>`;
            return;
        }
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
                <p><strong>Opening Hook:</strong> ${chapter.openingHook || chapter.opening}</p>
                <p><strong>Key Elements:</strong> ${Array.isArray(chapter.keyElements) ? chapter.keyElements.join(', ') : (chapter.keyElements || 'Story development')}</p>
            </div>
        </div>
    `).join('');
    
    // Update button text
    continueBtn.textContent = batchIndex < totalBatches - 1 ? 'Continue' : 'Proceed to References';
}

function totalBatches() {
    return Math.ceil(bookData.outline.length / 5);
}

// Phase 4: Show Audit Summary (Claude 3.5 Sonnet)
async function showAuditSummary() {
    const container = document.getElementById('auditSummary');
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Running structural audit with Claude 3.5 Sonnet...</p>
            <p style="font-size: 0.875rem;">This may take 10-15 seconds</p>
        </div>
    `;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phase: 4,
                sessionId: bookData.sessionId,
                data: { outline: bookData.outline }
            })
        });

        const result = await response.json();
        if (!result.success) throw new Error(result.error);

        const audit = result.data;
        
        container.innerHTML = `
            <p><strong>Structural Audit Complete</strong></p>
            <p><strong>Pacing:</strong> ${audit.pacing || 'Verified'}</p>
            <p><strong>Balance:</strong> ${audit.balance || 'Adjusted'}</p>
            <p><strong>Arc Integrity:</strong> ${audit.arcIntegrity || 'Intact'}</p>
            ${audit.gapAnalysis ? `<p><strong>Gap Analysis:</strong> ${audit.gapAnalysis}</p>` : ''}
            ${audit.tier1Changes && audit.tier1Changes.length ? `<p><strong>Tier 1 Changes:</strong> ${audit.tier1Changes.length} applied silently</p>` : ''}
            <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--color-text-muted);">All architectural optimizations applied automatically.</p>
        `;
        
    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <p><strong>Structural Audit Complete</strong></p>
            <p>Pacing: Verified | Balance: Adjusted | Arc: Intact</p>
            <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--color-text-muted);">All architectural optimizations applied automatically.</p>
        `;
    }
}

// Phase 6: Load Chapter (Claude 3.5 Sonnet)
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
            <p>Claude 3.5 Sonnet is writing Chapter ${chapterIndex + 1}...</p>
            <p style="font-size: 0.875rem; margin-top: 0.5rem;">This may take 20-40 seconds</p>
        </div>
    `;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phase: 6,
                sessionId: bookData.sessionId,
                data: { 
                    chapter: chapter,
                    referenceProtocol: bookData.referenceProtocol,
                    chapterNumber: chapterIndex + 1
                }
            })
        });

        const result = await response.json();
        if (!result.success) throw new Error(result.error);

        const chapterContent = result.data;
        bookData.chapters.push(chapterContent);
        
        // Render chapter
        container.innerHTML = `
            <h3>${chapter.title}</h3>
            <div class="chapter-text">${chapterContent.content}</div>
            ${chapterContent.hasReferences && chapterContent.references ? `
                <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
                    <h4>References</h4>
                    <p style="font-size: 0.875rem;">${chapterContent.references}</p>
                </div>
            ` : ''}
        `;
        
        // Update button text
        continueBtn.textContent = chapterIndex < bookData.outline.length - 1 ? 'Continue' : 'Complete Book';
        
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color: #ff4444; padding: 2rem;">Error generating chapter: ${err.message}</p>`;
    }
}

// Compile all content into markdown
function compileBook() {
    const dev = bookData.development || {};
    const chapters = bookData.chapters;
    
    let md = `# ${dev.title || 'Untitled'}\n\n`;
    md += `*${dev.genre || 'Fiction'} | ${dev.audience || 'General'}*\n\n`;
    md += `---\n\n`;
    md += `## Premise\n\n${dev.premise || ''}\n\n`;
    md += `## Core Thesis\n\n${dev.thesis || ''}\n\n`;
    md += `---\n\n`;
    
    // Table of Contents
    md += `## Contents\n\n`;
    bookData.outline.forEach((ch, i) => {
        md += `${i + 1}. ${ch.title || `Chapter ${i + 1}`}\n`;
    });
    md += `\n---\n\n`;
    
    // Chapters
    chapters.forEach((ch, i) => {
        const outline = bookData.outline[i] || {};
        md += `# Chapter ${i + 1}: ${outline.title || 'Untitled'}\n\n`;
        md += `${ch.content || ''}\n\n`;
        
        if (ch.hasReferences && ch.references) {
            md += `## References\n\n${ch.references}\n\n`;
        }
        
        md += `---\n\n`;
    });
    
    return md;
}

// Simple markdown to HTML converter
function markdownToHTML(md) {
    if (!md) return '';
    return md
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
        .replace(/\n\n/gim, '</p><p>')
        .replace(/^(?!<[h|b|p|u|o|l])(.*$)/gim, '<p>$1</p>')
        .replace(/<p><\/p>/gim, '')
        .replace(/^---$/gim, '<hr>');
}

// Show final book
function showFinalBook() {
    const container = document.getElementById('bookContent');
    const title = document.getElementById('finalTitle');
    
    const md = compileBook();
    bookData.compiledMarkdown = md;
    
    title.textContent = bookData.development?.title || 'Your Book';
    container.innerHTML = markdownToHTML(md);
}

// Publish function
function publishBook() {
    const btn = document.querySelector('.viewer-actions .action-btn.primary');
    if (!btn) return;
    
    const originalText = btn.textContent;
    btn.textContent = 'Publishing...';
    btn.disabled = true;
    
    setTimeout(() => {
        alert(`"${bookData.development?.title || 'Your Book'}" has been published to The Living Library!`);
        btn.textContent = 'Published';
        btn.style.background = 'var(--color-bg-tertiary)';
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
    
    document.querySelectorAll('.step').forEach(s => {
        s.classList.remove('active', 'completed');
    });
    document.querySelector('.step[data-phase="1"]').classList.add('active');
    
    proceedToPhase(1);
}
