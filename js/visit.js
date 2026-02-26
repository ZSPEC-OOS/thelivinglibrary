// Visit Page - Browse Collection

// Mock data for now - replace with API call later
const mockBooks = [
    {
        id: '1',
        title: 'The Memory Broker',
        genre: 'sci-fi',
        author: 'AI Generated',
        chapters: 12,
        readTime: '45 min',
        description: 'In a world where memories can be traded as currency, a detective uncovers a conspiracy that threatens to collapse the entire economic system.',
        content: '<h1>The Memory Broker</h1><p>In the year 2084, memories became the only currency that mattered...</p>',
        date: '2026-02-20'
    },
    {
        id: '2',
        title: 'Dreams of Electric Sheep',
        genre: 'fantasy',
        author: 'AI Generated',
        chapters: 8,
        readTime: '32 min',
        description: 'A young witch discovers her powers in a modern city where magic and technology collide in unexpected ways.',
        content: '<h1>Dreams of Electric Sheep</h1><p>Maya Chen had always known she was different...</p>',
        date: '2026-02-18'
    },
    {
        id: '3',
        title: 'The Last Algorithm',
        genre: 'mystery',
        author: 'AI Generated',
        chapters: 15,
        readTime: '58 min',
        description: 'When the world\'s most advanced AI suddenly deletes itself, a programmer must solve the digital crime of the century.',
        content: '<h1>The Last Algorithm</h1><p>The server room went silent at 3:47 AM...</p>',
        date: '2026-02-15'
    },
    {
        id: '4',
        title: 'Love in the Time of AI',
        genre: 'romance',
        author: 'AI Generated',
        chapters: 10,
        readTime: '40 min',
        description: 'Two time travelers keep missing each other across different eras, their love story unfolding through letters left in digital archives.',
        content: '<h1>Love in the Time of AI</h1><p>Dear future me, if you\'re reading this...</p>',
        date: '2026-02-10'
    },
    {
        id: '5',
        title: 'Neon Shadows',
        genre: 'horror',
        author: 'AI Generated',
        chapters: 6,
        readTime: '25 min',
        description: 'In a cyberpunk metropolis, something is hunting through the digital realm, leaving bodies in the real world.',
        content: '<h1>Neon Shadows</h1><p>The city never slept, but tonight it dreamed of darkness...</p>',
        date: '2026-02-05'
    },
    {
        id: '6',
        title: 'Quantum Hearts',
        genre: 'sci-fi',
        author: 'AI Generated',
        chapters: 14,
        readTime: '52 min',
        description: 'Parallel universe researchers fall in love across dimensions, but touching would collapse both realities.',
        content: '<h1>Quantum Hearts</h1><p>Dr. Sarah Chen stared at the quantum entanglement readings...</p>',
        date: '2026-01-28'
    }
];

let currentBooks = [...mockBooks];
let currentBook = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderBooks(currentBooks);
    setupEventListeners();
});

function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Genre filter
    const genreFilter = document.getElementById('genreFilter');
    genreFilter.addEventListener('change', handleFilters);
    
    // Sort
    const sortFilter = document.getElementById('sortFilter');
    sortFilter.addEventListener('change', handleFilters);
    
    // Close modal on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function renderBooks(books) {
    const grid = document.getElementById('bookGrid');
    const emptyState = document.getElementById('emptyState');
    const countDisplay = document.getElementById('resultsCount');
    
    // Update count
    countDisplay.textContent = `Showing ${books.length} volume${books.length !== 1 ? 's' : ''}`;
    
    // Show empty state if no books
    if (books.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    // Render cards
    grid.innerHTML = books.map(book => `
        <article class="book-card genre-${book.genre}" onclick="openBook('${book.id}')">
            <div class="card-content">
                <span class="genre-tag">${formatGenre(book.genre)}</span>
                <h3 class="book-title">${book.title}</h3>
                <div class="book-meta">
                    <span>${book.chapters} chapters</span>
                    <span>•</span>
                    <span>${book.readTime}</span>
                </div>
                <p class="book-description">${book.description}</p>
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
    
    // Populate modal
    document.getElementById('modalGenre').textContent = formatGenre(book.genre);
    document.getElementById('modalTitle').textContent = book.title;
    document.getElementById('modalSubtitle').textContent = `${formatGenre(book.genre)} | ${book.chapters} Chapters | ${book.readTime} read`;
    document.getElementById('modalBody').innerHTML = book.content || '<p>Content loading...</p>';
    
    // Show modal
    document.getElementById('bookModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('bookModal').classList.remove('active');
    document.body.style.overflow = '';
    currentBook = null;
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    filterBooks(query, document.getElementById('genreFilter').value);
}

function handleFilters() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const genre = document.getElementById('genreFilter').value;
    const sort = document.getElementById('sortFilter').value;
    
    filterBooks(query, genre, sort);
}

function filterBooks(query, genre, sort = 'newest') {
    let filtered = mockBooks.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(query) || 
                            book.description.toLowerCase().includes(query);
        const matchesGenre = genre === 'all' || book.genre === genre;
        return matchesSearch && matchesGenre;
    });
    
    // Sort
    filtered.sort((a, b) => {
        switch(sort) {
            case 'newest':
                return new Date(b.date) - new Date(a.date);
            case 'oldest':
                return new Date(a.date) - new Date(b.date);
            case 'longest':
                return b.chapters - a.chapters;
            case 'shortest':
                return a.chapters - b.chapters;
            default:
                return 0;
        }
    });
    
    currentBooks = filtered;
    renderBooks(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('genreFilter').value = 'all';
    document.getElementById('sortFilter').value = 'newest';
    currentBooks = [...mockBooks];
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
        'thriller': 'Thriller'
    };
    return map[genre] || genre;
}

function downloadBook() {
    if (!currentBook) return;
    
    const blob = new Blob([currentBook.content], { type: 'text/html' });
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
            text: currentBook.description,
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

// Utility: Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Future: Load from API
async function loadBooksFromAPI() {
    try {
        const response = await fetch('https://book-api-tg19.onrender.com/api/books');
        const books = await response.json();
        mockBooks = books; // Replace mock data
        renderBooks(books);
    } catch (err) {
        console.log('Using mock data:', err);
        renderBooks(mockBooks);
    }
}
