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
    const createBtn = document.getElementById('createBtn');

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
        setTimeout(() => {
            document.querySelector('.search-input').focus();
        }, 100);
    });

    closeSearch.addEventListener('click', function() {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close on Escape key
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

    // Visit Button
    visitBtn.addEventListener('click', function() {
        console.log('Visit clicked');
        // Add navigation logic here
        // window.location.href = '/visit';
    });

    // Create Button
    createBtn.addEventListener('click', function() {
        console.log('Create clicked');
        // Add create logic here
        // window.location.href = '/create';
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    const searchSubmit = document.querySelector('.search-submit');

    searchSubmit.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            console.log('Searching for:', query);
        }
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchSubmit.click();
        }
    });
});
