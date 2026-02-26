// Create Page Logic - Full Claude API + Firebase Integration
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

// Phase configurations - 6 phases
const PHASES = {
    1: 'phase1',
    2: 'phase2', 
    3: 'phase3',
    4: 'phase4',
    5: 'phase5',
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

    // Phase 3 Continue
    document.getElementById('phase3Continue').addEventListener('click', () => {
        proceedToPhase(4);
    });

    // Phase 4 Continue
    document.getElementById('phase4Continue').addEventListener('click', () => {
        proceedToPhase(5);
    });

    // Phase 5: Reference Protocol - Auto-proceed on selection
    document.getElementById('refYes').addEventListener('click', () => {
        bookData.referenceProtocol = true;
        showSelectionAndProceed('References enabled. Preparing chapter development with ACS citations...');
    });

    document.getElementById('refNo').addEventListener('click', () => {
        bookData.referenceProtocol = false;
        showSelectionAndProceed('Authoritative synthesis selected. Preparing chapter development...');
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

function showSelectionAndProceed(message) {
    document.getElementById('referenceQuestion').style.display = 'none';
    const confirmDiv = document.getElementById('selectionConfirmation');
    confirmDiv.style.display = 'block';
    document.getElementById('selectionText').textContent = message;
    
    setTimeout(() => {
        proceedToPhase(6);
    }, 1500);
}

// Navigation
function proceedToPhase(phase) {
    document.querySelectorAll('.phase-content').forEach(p => p.classList.remove('active'));
    
    updateProgressBar(phase);
    
    const phaseId = PHASES[phase];
    document.getElementById(phaseId).classList.add('active');
    
    switch(phase) {
        case 2:
            loadDevelopment();
            break;
        case 3:
            bookData.currentBatch = 0;
            loadOutline();
            break;
        case 4:
            loadAudit();
            break;
        case 5:
            // Reset Phase 5 view
            document.getElementById('referenceQuestion').style.display = 'block';
            document.getElementById('selectionConfirmation').style.display = 'none';
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
    const stepNum = phase === 'complete' ? 6 : 
                    phase >= 6 ? 6 :
                    phase >= 5 ? 5 :
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

// Phase 2: Concept Development
async function loadDevelopment() {
    const container = document.getElementById('developmentContent');
    const continueBtn = document.getElementById('phase2Continue');
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Consulting Claude Sonnet 4.6...</p>
            <p style="font-size: 0.875rem; margin-top: 0.5rem;">Using cached prompts (90% cost savings)</p>
            <p style="font-size: 0.75rem; color: var(--color-text-muted);">This may take 15-30 seconds</p>
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

        container.innerHTML = `
            <div class="development-field">
                <h4>Working Title</h4>
                <p class="field-content">${result.data.title || 'Untitled'}</p>
            </div>
            
            <div class="development-field">
                <h4>Genre & Subgenre</h4>
                <p>${result.data.genre || 'Fiction'}</p>
            </div>
            
            <div class="development-field">
                <h4>Target Audience</h4>
                <p>${result.data.audience || 'General readers'}</p>
            </div>
            
            <div class="development-field">
                <h4>Refined Premise</h4>
                <p class="field-content">${result.data.premise || 'No premise generated'}</p>
            </div>
            
            <div class="development-field">
                <h4>Core Thesis / Central Arc</h4>
                <p class="field-content">${result.data.thesis || ''}</p>
            </div>
            
            <div class="development-field">
                <h4>Audience Promise</h4>
                <p>${result.data.promise || 'An engaging reading experience'}</p>
            </div>
            
            <div class="development-field">
                <h4>Structural Logic</h4>
                <p>${result.data.structuralLogic || 'Standard narrative progression'}</p>
            </div>
            
            <div class="development-field">
                <h4>Tonal Register</h4>
                <p>${result.data.tonalRegister || 'Accessible and engaging'}</p>
            </div>
        `;
        
        continueBtn.style.display = 'inline-flex';
        
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color: #ff4444; padding: 2rem;">Error: ${err.message}</p>`;
    }
}

// Phase 3: Outline
async function loadOutline() {
    const container = document.getElementById('outlineContent');
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Generating chapter outline with Claude Sonnet 4.6...</p>
            <p style="font-size: 0.875rem;">Cached prompts active (90% savings)</p>
            <p style="font-size: 0.75rem; color: var(--color-text-muted);">This may take 20-40 seconds</p>
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
        
        container.innerHTML = bookData.outline.map((chapter, idx) => `
            <div class="chapter-detailed">
                <h3>Chapter ${idx + 1}: ${chapter.title}</h3>
                
                <div class="chapter-section">
                    <h5>Purpose</h5>
                    <p>${chapter.purpose}</p>
                </div>
                
                <div class="chapter-section">
                    <h5>Opening Hook</h5>
                    <p>${chapter.openingHook || chapter.opening}</p>
                </div>
                
                <div class="chapter-section">
                    <h5>Core Content</h5>
                    <p>${chapter.coreContent || 'Detailed content development'}</p>
                </div>
                
                <div class="chapter-section">
                    <h5>Key Arguments / Scenes</h5>
                    <p>${Array.isArray(chapter.keyElements) ? chapter.keyElements.join(', ') : (chapter.keyElements || 'Story development')}</p>
                </div>
                
                <div class="chapter-section">
                    <h5>Thematic Thread</h5>
                    <p>${chapter.thematicThread || 'Advances central theme'}</p>
                </div>
                
                <div class="chapter-section">
                    <h5>Transition Logic</h5>
                    <p>${chapter.transitionLogic || 'Flows to next chapter'}</p>
                </div>
                
                <div class="chapter-section">
                    <h5>Estimated Word Count</h5>
                    <p>${chapter.wordCount || chapter.tokenCount || '2500-3500 words'}</p>
                </div>
            </div>
        `).join('');
        
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color: #ff4444;">Error: ${err.message}</p>`;
    }
}

// Phase 4: Audit
async function loadAudit() {
    const container = document.getElementById('auditContent');
    const continueBtn = document.getElementById('phase4Continue');
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Auditing structure with Claude Sonnet 4.6...</p>
        </div>
    `;
    continueBtn.style.display = 'none';
    
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
            <div class="audit-section">
                <h4>Pacing</h4>
                <p>${audit.pacing || 'Chapter sequence builds appropriate momentum for the narrative arc.'}</p>
            </div>
            
            <div class="audit-section">
                <h4>Balance</h4>
                <p>${audit.balance || 'Chapters are proportionate in scope and depth relative to their narrative weight.'}</p>
            </div>
            
            <div class="audit-section">
                <h4>Arc Integrity</h4>
                <p>${audit.arcIntegrity || 'The book opens a central question and resolves it satisfyingly.'}</p>
            </div>
            
            <div class="audit-section">
                <h4>Gap Analysis</h4>
                <p>${audit.gapAnalysis || 'No significant gaps detected in the current structure.'}</p>
            </div>
            
            <div class="audit-section">
                <h4>Revision Flags</h4>
                <div class="tier-box">
                    <strong>Tier 1 — Silent Application (Auto-approved)</strong>
                    <p>${audit.tier1Changes && audit.tier1Changes.length ? audit.tier1Changes.join('; ') : 'Content consolidation, subsection additions, and prose-level corrections will be applied automatically during chapter development.'}</p>
                </div>
                ${audit.tier2Changes && audit.tier2Changes.length ? `
                <div class="tier-box tier-2">
                    <strong>Tier 2 — Declared Changes (Presumed Approved)</strong>
                    <p>${audit.tier2Changes.join('; ')}</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem; color: var(--color-text-muted);">These structural changes will be executed during Phase 6 unless objected to now.</p>
                </div>
                ` : ''}
            </div>
        `;
        
        continueBtn.style.display = 'inline-flex';
        
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color: #ff4444;">Error loading audit: ${err.message}</p>`;
        continueBtn.style.display = 'inline-flex';
    }
}

// Phase 6: Chapter Writing
async function loadChapter(chapterIndex) {
    const container = document.getElementById('chapterContent');
    const title = document.getElementById('chapterTitle');
    const indicator = document.getElementById('chapterIndicator');
    const continueBtn = document.getElementById('phase6Continue');
    
    const chapter = bookData.outline[chapterIndex];
    
    title.textContent = `Chapter ${chapterIndex + 1}: ${chapter.title}`;
    indicator.textContent = `Chapter ${chapterIndex + 1} of ${bookData.outline.length}`;
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Claude Sonnet 4.6 is writing Chapter ${chapterIndex + 1}...</p>
            <p style="font-size: 0.875rem; margin-top: 0.5rem;">Cached prompts active (90% cost savings)</p>
            <p style="font-size: 0.75rem; color: var(--color-text-muted);">This may take 30-60 seconds per chapter</p>
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
        
        continueBtn.textContent = chapterIndex < bookData.outline.length - 1 ? 'Continue to Next Chapter' : 'Complete Book';
        
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
    
    md += `## Contents\n\n`;
    bookData.outline.forEach((ch, i) => {
        md += `${i + 1}. ${ch.title || `Chapter ${i + 1}`}\n`;
    });
    md += `\n---\n\n`;
    
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

// Publish to Firebase
function publishBook() {
    const btn = document.querySelector('.viewer-actions .action-btn.primary');
    if (!btn) return;
    
    btn.textContent = 'Publishing...';
    btn.disabled = true;
    
    const fullPremise = bookData.development?.premise || '';
    const summary = fullPremise.length > 150 
        ? fullPremise.substring(0, 150) + '...' 
        : fullPremise;
    
    const newBook = {
        title: bookData.development?.title || 'Untitled',
        genre: mapGenre(bookData.development?.genre || 'Fiction'),
        chapters: bookData.outline?.length || 0,
        description: bookData.development?.premise || 'No description',
        summary: summary,
        content: compileBook(),
        fullContent: document.getElementById('bookContent').innerHTML,
        referenceProtocol: bookData.referenceProtocol,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('books').add(newBook)
        .then((docRef) => {
            console.log('Book published with ID:', docRef.id);
            alert(`"${newBook.title}" has been published to The Living Library!`);
            btn.textContent = 'Published';
            
            setTimeout(() => {
                if (confirm('Go to Browse Collection to see your book?')) {
                    window.location.href = 'visit.html';
                }
            }, 500);
        })
        .catch((error) => {
            console.error('Error publishing:', error);
            alert('Error publishing book: ' + error.message);
            btn.textContent = 'Publish Book';
            btn.disabled = false;
        });
}

function mapGenre(genreString) {
    const genre = (genreString || '').toLowerCase();
    if (genre.includes('sci-fi') || genre.includes('science')) return 'sci-fi';
    if (genre.includes('fantasy')) return 'fantasy';
    if (genre.includes('mystery')) return 'mystery';
    if (genre.includes('romance')) return 'romance';
    if (genre.includes('horror')) return 'horror';
    if (genre.includes('non-fiction') || genre.includes('nonfiction')) return 'non-fiction';
    if (genre.includes('thriller')) return 'thriller';
    return 'literary';
}

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
