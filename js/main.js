// Main JavaScript for The Living Library

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const menuBtn = document.getElementById('menuBtn');
    const navMenu = document.getElementById('navMenu');
    const closeMenu = document.getElementById('closeMenu');
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch = document.getElementById('closeSearch');
    const visitBtn = document.getElementById('visitBtn');

    // Menu Toggle
    menuBtn.addEventListener('click', function() {
        navMenu.classList.add('active');
        menuBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    closeMenu.addEventListener('click', function() {
        navMenu.classList.remove('active');
        menuBtn.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            menuBtn.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Search Toggle
    searchBtn.addEventListener('click', function() {
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Focus on input after animation
        setTimeout(() => {
            document.querySelector('.search-input').focus();
        }, 100);
    });

    closeSearch.addEventListener('click', function() {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close search on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Visit Button - Currently placeholder
    visitBtn.addEventListener('click', function() {
        const subjects = document.getElementById('subjects');
        const literatureType = document.getElementById('literature-type');
        
        // Visual feedback
        visitBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            visitBtn.style.transform = '';
        }, 150);

        // Placeholder functionality
        console.log('Visit clicked - Subjects:', subjects.value, 'Type:', literatureType.value);
        
        // You can add navigation logic here later
        // window.location.href = '/collection';
    });

    // Populate dropdowns with sample data (can be replaced with actual data later)
    const subjectsData = [
        'Fiction',
        'Non-Fiction',
        'Poetry',
        'Drama',
        'Science',
        'Philosophy',
        'History',
        'Art'
    ];

    const literatureTypesData = [
        'Novel',
        'Short Story',
        'Essay',
        'Biography',
        'Journal',
        'Manuscript',
        'Rare Book',
        'Digital Archive'
    ];

    const subjectsSelect = document.getElementById('subjects');
    const typeSelect = document.getElementById('literature-type');

    subjectsData.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.toLowerCase().replace(/\s+/g, '-');
        option.textContent = subject;
        subjectsSelect.appendChild(option);
    });

    literatureTypesData.forEach(type => {
        const option = document.createElement('option');
        option.value = type.toLowerCase().replace(/\s+/g, '-');
        option.textContent = type;
        typeSelect.appendChild(option);
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    const searchSubmit = document.querySelector('.search-submit');

    searchSubmit.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            console.log('Searching for:', query);
            // Add search logic here
            // window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchSubmit.click();
        }
    });

    // Touch device detection for enhanced mobile experience
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
    }

    // Smooth scroll behavior for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
