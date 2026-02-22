// Create Page Logic - Button-Driven Workflow

let currentPhase = 1;
let bookData = {
    concept: '',
    development: null,
    outline: [],
    referenceProtocol: false,
    chapters: [],
    currentBatch: 0,
    currentChapter: 0
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
            showFinalPreview();
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
    
    // Show loading
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Analyzing your concept...</p>
        </div>
    `;
    continueBtn.style.display = 'none';
    
    // AI INTEGRATION: Call your AI service here with Phase 2 prompt
    // const development = await callAIService({
    //     phase: 2,
    //     concept: bookData.concept
    // });
    
    // Mock response for now
    await simulateDelay(2000);
    const development = generateMockDevelopment();
    bookData.development = development;
    
    // Render development
    container.innerHTML = `
        <div class="development-section">
            <h4>Refined Premise</h4>
            <p>${development.premise}</p>
        </div>
        <div class="development-section">
            <h4>Genre & Audience</h4>
            <p>${development.genre} | ${development.audience}</p>
        </div>
        <div class="development-section">
            <h4>Core Thesis</h4>
            <p>${development.thesis}</p>
        </div>
        <div class="development-section">
            <h4>Working Title</h4>
            <p>${development.title}</p>
        </div>
    `;
    
    continueBtn.style.display = 'inline-flex';
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

// Completion
function showFinalPreview() {
    const container = document.getElementById('finalPreview');
    container.innerHTML = `
        <span class="book-title">${bookData.development?.title || 'Untitled'}</span>
        <span class="book-author">The Living Library</span>
    `;
}

function resetCreate() {
    bookData = {
        concept: '',
        development: null,
        outline: [],
        referenceProtocol: false,
        chapters: [],
        currentBatch: 0,
        currentChapter: 0
    };
    
    document.getElementById('conceptInput').value = '';
    document.querySelector('.char-count').textContent = '0 / 2000';
    
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active', 'completed'));
    document.querySelector('.step[data-phase="1"]').classList.add('active');
    
    proceedToPhase(1);
}

function saveToLibrary() {
    alert('Book saved to your library!');
    // AI INTEGRATION: Save complete bookData to your backend
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
                  <p>[Full chapter prose generated by AI based on your prompt]</p>`
    };
}

// AI Integration Template
/*
async function callAIService(params) {
    const response = await fetch('/api/ai/book-development', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: YOUR_PROMPT_HERE, // The 6-phase prompt you provided
            phase: params.phase,
            data: params
        })
    });
    return await response.json();
}
*/
