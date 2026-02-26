// Visit Page - Browse Collection from Firebase

let currentBooks = [];
let currentBook = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadBooksFromFirebase();
    setupEventListeners();
});

function loadBooksFromFirebase() {
    const grid = document.getElementById('bookGrid');
    const emptyState = document.getElementById('emptyState');
    const countDisplay = document.getElementById('resultsCount');
    
    // Show loading
    grid.style.display = 'none';
    emptyState.style.display = 'none';
    countDisplay.textContent = 'Loading collection...';
    
    // Real-time listener - updates automatically when books are added!
    db.collection('books')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            currentBooks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (currentBooks.length === 0) {
                grid.style.display = 'none';
                emptyState.style.display = 'block';
                countDisplay.textContent = 'No volumes yet - be the first to publish!';
            } else {
                renderBooks(currentBooks);
            }
        }, (error) => {
            console.error('Firebase error:', error);
            countDisplay.textContent = 'Error loading collection';
            grid.style.display = 'none';
            emptyState.style.display = 'block';
        });
}

function renderBooks(books) {
    const grid = document.getElementById('bookGrid');
    const emptyState = document.getElementById('emptyState');
    const countDisplay = document.getElementById('resultsCount');
    
    countDisplay.textContent = `Showing ${books.length} volume${books.length !== 1 ? 's' : ''}`;
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    // CENTERED layout, NO time shown
    grid.innerHTML = books.map(book => `
        <article class="book-card genre-${book.genre}" onclick="openBook('${book.id}')">
            <div class="card-content">
                <span class="genre-tag">${formatGenre(book.genre)}</span>
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <div class="book-chapters">${book.chapters} Chapters</div>
                <p class="book-description">${escapeHtml(book.summary || book.description)}</p>
            </div>
            <div class="read-overlay">
                <button class="read-btn" onclick="event.stopPropagation(); openBook('${book.id}')">Read Book</button>
                <span class="read-hint">Click to open</span>
            </div>
        </article>
    `).join('');
}

function openBook(id) {
    const book = currentBooks.find(b => b.id === id);
    if (!book) return;
    
    currentBook = book;
    
    document.getElementById('modalGenre').textContent = formatGenre(book.genre);
    document.getElementById('modalTitle').textContent = book.title;
    document.getElementById('modalSubtitle').textContent = 
        `${formatGenre(book.genre)} | ${book.chapters} Chapters`;
    document.getElementById('modalBody').innerHTML = book.fullContent || book.content;
    
    document.getElementById('bookModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('bookModal').classList.remove('active');
    document.body.style.overflow = '';
    currentBook = null;
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    const genreFilter = document.getElementById('genreFilter');
    genreFilter.addEventListener('change', handleFilters);
    
    const sortFilter = document.getElementById('sortFilter');
    sortFilter.addEventListener('change', handleFilters);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const genre = document.getElementById('genreFilter').value;
    filterBooks(query, genre);
}

function handleFilters() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const genre = document.getElementById('genreFilter').value;
    filterBooks(query, genre);
}

function filterBooks(query, genre) {
    let filtered = currentBooks.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(query) || 
                            (book.summary && book.summary.toLowerCase().includes(query)) ||
                            book.description.toLowerCase().includes(query);
        const matchesGenre = genre === 'all' || book.genre === genre;
        return matchesSearch && matchesGenre;
    });
    
    renderBooks(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('genreFilter').value = 'all';
    renderBooks(currentBooks);
}

function formatGenre(genre) {
    const map = {
        'sci-fi': 'Science Fiction',
        'fantasy': 'Fantasy',
        'mystery': 'Mystery',
        'romance': 'Romance',
        'horror': 'Horror',
        'non-fiction': 'Non-Fiction',
        'thriller': 'Thriller',
        'literary': 'Literary Fiction'
    };
    return map[genre] || genre;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function downloadBook() {
    if (!currentBook) return;
    const blob = new Blob([currentBook.fullContent || currentBook.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBook.title.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
}

function shareBook() {
    if (!currentBook) return;
    
    if (navigator.share) {
        navigator.share({
            title: currentBook.title,
            text: currentBook.summary || currentBook.description,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
