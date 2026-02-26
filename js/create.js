// Create Page Logic - Full Claude API + Firebase Integration
const API_URL = 'https://book-api-tg19.onrender.com/api/develop';

let currentPhase = 1;
let bookData = {
    concept: '',
    development: null,
    outline: null,
    audit: null,
    referenceProtocol: false,
    chapters: [],
    currentChapter: 0,
    sessionId: null,
    compiledMarkdown: ''
};

const PHASES = {
    1: 'phase1',
    2: 'phase2', 
    3: 'phase3',
    4: 'phase4',
    5: 'phase5',
    6: 'phase6',
    complete: 'phaseComplete'
};

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
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

    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', function() {
            conceptInput.value = this.dataset.prompt;
            bookData.concept = this.dataset.prompt;
            charCount.textContent = `${this.dataset.prompt.length} / 2000`;
        });
    });

    document.getElementById('phase1Continue').addEventListener('click', () => {
        if (!bookData.concept.trim()) {
            alert('Please enter a concept for your book.');
            return;
        }
        proceedToPhase(2);
    });

    document.getElementById('phase2Continue').addEventListener('click', () => {
        proceedToPhase(3);
    });

    document.getElementById('phase3Continue').addEventListener('click', () => {
        proceedToPhase(4);
    });

    document.getElementById('phase4Continue').addEventListener('click', () => {
        proceedToPhase(5);
    });

    document.getElementById('refYes').addEventListener('click', () => {
        bookData.referenceProtocol = true;
        showSelectionAndProceed('References enabled. Preparing chapter development...');
    });

    document.getElementById('refNo').addEventListener('click', () => {
        bookData.referenceProtocol = false;
        showSelectionAndProceed('Authoritative synthesis selected. Preparing chapter development...');
    });

    document.getElementById('phase6Continue').addEventListener('click', () => {
        if (bookData.currentChapter < bookData.outline.chapters.length - 1) {
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
            loadOutline();
            break;
        case 4:
            loadAudit();
            break;
        case 5:
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
    const stepNum = phase === 'complete' ? 6 : Math.min(phase, 6);
    
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

// Phase 2: Concept Development - Single clean output
async function loadDevelopment() {
    const container = document.getElementById('developmentContent');
    const continueBtn = document.getElementById('phase2Continue');
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Consulting Claude Sonnet 4.6...</p>
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

        // Display raw markdown from AI - no forced categorization
        container.innerHTML = `<div class="ai-output">${markdownToHTML(result.data.content || result.data)}</div>`;
        continueBtn.style.display = 'inline-flex';
        
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="error-message">Error: ${err.message}</div>`;
    }
}

// Phase 3: Outline - Single document view
async function loadOutline() {
    const container = document.getElementById('outlineContent');
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Generating chapter outline...</p>
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

        bookData.outline = result.data;

        // Single scrollable document instead of broken-up sections
        container.innerHTML = `<div class="ai-output outline-view">${markdownToHTML(result.data.content || result.data)}</div>`;
        
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="error-message">Error: ${err.message}</div>`;
    }
}

// Phase 4: Audit - Clean single view
async function loadAudit() {
    const container = document.getElementById('auditContent');
    const continueBtn = document.getElementById('phase4Continue');
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Auditing structure...</p>
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

        bookData.audit = result.data;

        // Clean single output - no tier boxes unless AI includes them
        container.innerHTML = `<div class="ai-output">${markdownToHTML(result.data.content || result.data)}</div>`;
        continueBtn.style.display = 'inline-flex';
        
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="error-message">Error loading audit: ${err.message}</div>`;
        continueBtn.style.display = 'inline-flex';
    }
}

// Phase 6: Chapter Writing
async function loadChapter(chapterIndex) {
    const container = document.getElementById('chapterContent');
    const title = document.getElementById('chapterTitle');
    const indicator = document.getElementById('chapterIndicator');
    const continueBtn = document.getElementById('phase6Continue');
    
    const totalChapters = bookData.outline.chapters?.length || bookData.outline.length || 1;
    const chapter = bookData.outline.chapters?.[chapterIndex] || bookData.outline[chapterIndex];
    
    title.textContent = `Chapter ${chapterIndex + 1}${chapter?.title ? ': ' + chapter.title : ''}`;
    indicator.textContent = `Chapter ${chapterIndex + 1} of ${totalChapters}`;
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Writing Chapter ${chapterIndex + 1}...</p>
            <p style="font-size: 0.75rem; color: var(--color-text-muted);">This may take 30-60 seconds</p>
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
        bookData.chapters[chapterIndex] = chapterContent;
        
        // Single clean output
        container.innerHTML = `<div class="ai-output chapter-text">${markdownToHTML(chapterContent.content || chapterContent)}</div>`;
        
        continueBtn.textContent = chapterIndex < totalChapters - 1 ? 'Continue to Next Chapter' : 'Complete Book';
        
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="error-message">Error generating chapter: ${err.message}</div>`;
    }
}

// Improved markdown parser - handles AI output cleanly
function markdownToHTML(md) {
    if (!md) return '';
    if (typeof md !== 'string') {
        // If AI returns JSON, try to extract content or stringify nicely
        try {
            return `<pre class="ai-output">${JSON.stringify(md, null, 2)}</pre>`;
        } catch(e) {
            return String(md);
        }
    }
    
    return md
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold/Italic
        .replace(/\*\*\*(.*)\*\*\*/gim, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        // Blockquotes
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        // Lists (basic support)
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/gim, '<ul>$&</ul>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
        // Horizontal rules
        .replace(/^---$/gim, '<hr>')
        // Line breaks to paragraphs
        .replace(/\n\n/gim, '</p><p>')
        .replace(/^(?!<[h|b|l|u|o|p|a|h|r])(.*$)/gim, '<p>$1</p>')
        // Clean up empty paragraphs
        .replace(/<p><\/p>/gim, '')
        // Fix nested paragraphs in headers
        .replace(/<p><(h[1-6])>/gim, '<$1>')
        .replace(/<\/(h[1-6])><\/p>/gim, '</$1>');
}

function compileBook() {
    const chapters = bookData.chapters;
    
    let md = '';
    
    // Use development content as frontmatter if available
    if (bookData.development?.content) {
        md += bookData.development.content + '\n\n---\n\n';
    }
    
    // Add outline
    if (bookData.outline?.content) {
        md += '## Table of Contents\n\n' + bookData.outline.content + '\n\n---\n\n';
    }
    
    // Add audit if exists
    if (bookData.audit?.content) {
        md += '## Structural Notes\n\n' + bookData.audit.content + '\n\n---\n\n';
    }
    
    // Chapters
    chapters.forEach((ch, i) => {
        const content = typeof ch === 'string' ? ch : (ch.content || '');
        md += content + '\n\n---\n\n';
    });
    
    return md;
}

function showFinalBook() {
    const container = document.getElementById('bookContent');
    const title = document.getElementById('finalTitle');
    
    const md = compileBook();
    bookData.compiledMarkdown = md;
    
    // Extract title from first h1 or use default
    const titleMatch = md.match(/^# (.*$)/m);
    title.textContent = titleMatch ? titleMatch[1] : 'Your Book';
    
    container.innerHTML = `<div class="final-book">${markdownToHTML(md)}</div>`;
}

function publishBook() {
    const btn = document.querySelector('.viewer-actions .action-btn.primary');
    if (!btn) return;
    
    btn.textContent = 'Publishing...';
    btn.disabled = true;
    
    // Extract metadata from compiled content
    const content = bookData.compiledMarkdown || '';
    const titleMatch = content.match(/^# (.*$)/m);
    const title = titleMatch ? titleMatch[1] : 'Untitled';
    
    // Extract first paragraph as description
    const descMatch = content.match(/<p>(.*?)<\/p>/);
    const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').substring(0, 200) : 'No description';
    
    const newBook = {
        title: title,
        genre: detectGenre(content),
        chapters: bookData.chapters.length,
        description: description,
        summary: description.substring(0, 150) + (description.length > 150 ? '...' : ''),
        content: bookData.compiledMarkdown,
        fullContent: document.getElementById('bookContent').innerHTML,
        referenceProtocol: bookData.referenceProtocol,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('books').add(newBook)
        .then((docRef) => {
            alert(`"${newBook.title}" has been published!`);
            btn.textContent = 'Published';
            setTimeout(() => {
                if (confirm('Go to Browse Collection?')) {
                    window.location.href = 'visit.html';
                }
            }, 500);
        })
        .catch((error) => {
            alert('Error publishing: ' + error.message);
            btn.textContent = 'Publish Book';
            btn.disabled = false;
        });
}

function detectGenre(content) {
    const text = content.toLowerCase();
    if (text.includes('sci-fi') || text.includes('science fiction')) return 'sci-fi';
    if (text.includes('fantasy')) return 'fantasy';
    if (text.includes('mystery')) return 'mystery';
    if (text.includes('romance')) return 'romance';
    if (text.includes('horror')) return 'horror';
    if (text.includes('thriller')) return 'thriller';
    if (text.includes('non-fiction') || text.includes('nonfiction')) return 'non-fiction';
    return 'literary';
}

function resetCreate() {
    if (!confirm('Start a new book? Current progress will be lost.')) return;
    
    bookData = {
        concept: '',
        development: null,
        outline: null,
        audit: null,
        referenceProtocol: false,
        chapters: [],
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
