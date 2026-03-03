// ═════════════════════════════════════════════════════════════
// Admin Dashboard Script
// ═════════════════════════════════════════════════════════════

// API Configuration
const BASE_URL = 'https://openlibrary.org/search.json?q=';
const API_OPTIONS = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
};

// Demo data - will be replaced with Firebase data
// Load books from localStorage if available, otherwise use default data
let books = JSON.parse(localStorage.getItem('adminBooks')) || [
    { id: 1, title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Fantasy", pages: 662, status: "published", image: "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80" },
    { id: 2, title: "The Wise Man's Fear", author: "Patrick Rothfuss", genre: "Fantasy", pages: 994, status: "published", image: "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80" },
    { id: 3, title: "The Slow Regard of Silent Things", author: "Patrick Rothfuss", genre: "Fantasy", pages: 176, status: "draft", image: "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80" },
    { id: 4, title: "A Court of Thorns and Roses", author: "Sarah J. Maas", genre: "Fantasy", pages: 419, status: "published", image: "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80" },
    { id: 5, title: "Atomic Habits", author: "James Clear", genre: "Self-Help", pages: 320, status: "draft", image: "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80" }
];

// Function to save books to localStorage
function saveBooksToStorage() {
    localStorage.setItem('adminBooks', JSON.stringify(books));
}

// Function to add a new chapter input row
function addChapterRow() {
    const container = document.getElementById('chapters-container');
    const row = document.createElement('div');
    row.className = 'chapter-input-row';
    row.innerHTML = `
        <input type="text" class="chapter-title" placeholder="Chapter Title" required>
        <button type="button" class="btn-remove-chapter" onclick="removeChapterRow(this)">
            <i class='bx bx-trash'></i>
        </button>
    `;
    container.appendChild(row);
}

// Function to remove a chapter input row
function removeChapterRow(button) {
    const container = document.getElementById('chapters-container');
    const rows = container.querySelectorAll('.chapter-input-row');
    if (rows.length > 1) {
        button.parentElement.remove();
    } else {
        showNotification('At least one chapter is required!', 'error');
    }
}

// Function to collect chapters from input fields
function collectChapters() {
    const chapterInputs = document.querySelectorAll('.chapter-title');
    const chapters = [];
    chapterInputs.forEach((input, index) => {
        if (input.value.trim()) {
            chapters.push({
                number: index + 1,
                title: input.value.trim()
            });
        }
    });
    return chapters;
}

// Clear chapters form when modal closes
function clearChaptersForm() {
    const container = document.getElementById('chapters-container');
    container.innerHTML = `
        <div class="chapter-input-row">
            <input type="text" class="chapter-title" placeholder="Chapter Title" required>
            <button type="button" class="btn-remove-chapter" onclick="removeChapterRow(this)">
                <i class='bx bx-trash'></i>
            </button>
        </div>
    `;
}

// Function to shorten email for display
function shortenEmail(email) {
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    
    const username = parts[0];
    const domain = parts[1];
    
    if (username.length <= 3) {
        return username.substring(0, 1) + '...' + '@' + domain;
    }
    return username.substring(0, 3) + '...' + '@' + domain;
}

let currentRole = 'admin';
let currentUser = null;

// ═════════════════════════════════════════════════════════════
// INITIALIZATION
// ═════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadData();
    // show overview by default
    navigateTo('overview');
});

// ═════════════════════════════════════════════════════════════
// AUTHENTICATION - Hardcoded Credentials
// ═════════════════════════════════════════════════════════════

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin@bookworm.com',
    password: 'Admin123'
};

// Function to authenticate user
function authenticateUser(username, password) {
    // Check admin credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        return { user: ADMIN_CREDENTIALS.username, role: 'admin' };
    }
    // Check users from localStorage
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
        return { user: user.email, role: user.role };
    }
    // Invalid credentials
    return null;
}

// Function to show login prompt
function showLoginPrompt() {
    const username = prompt('Enter your username/email:');
    if (!username) {
        alert('Username is required!');
        window.location.href = '../log&register/index.html';
        return null;
    }
    
    const password = prompt('Enter your password:');
    if (!password) {
        alert('Password is required!');
        window.location.href = '../log&register/index.html';
        return null;
    }
    
    const authResult = authenticateUser(username, password);
    
    if (authResult) {
        // Save to localStorage
        localStorage.setItem('user', authResult.user);
        localStorage.setItem('userRole', authResult.role);
        // Mark as first login to ensure dashboard is shown
        localStorage.setItem('firstLogin', 'true');
        showNotification('Login successful! Welcome ' + username.split('@')[0], 'success');
        return authResult;
    } else {
        alert('Invalid username or password!');
        window.location.href = '../log&register/index.html';
        return null;
    }
}

// Check authentication
function checkAuth() {
    let user = localStorage.getItem('user');
    let role = localStorage.getItem('userRole');
    
    // If no user in localStorage, show login prompt
    if (!user) {
        const authResult = showLoginPrompt();
        if (!authResult) {
            return; // Redirect happened in showLoginPrompt
        }
        user = authResult.user;
        role = authResult.role;
    }
    
    currentUser = user;
    currentRole = role || 'admin';
    
    document.getElementById('user-name').textContent = user.split('@')[0];
    document.getElementById('user-role').textContent = currentRole === 'admin' ? 'Administrator' : 'Editor';
    
    updateRoleToggle();
}

// Load initial data
function loadData() {
    renderBooks();
    renderEditors();
    renderStats();
    renderUsers();
    updateStatsCards();
}

// ═════════════════════════════════════════════════════════════
// ROLE SWITCHING
// ═════════════════════════════════════════════════════════════

function switchRole(role) {
    currentRole = role;
    updateRoleToggle();
    loadData();
}

// responsive sidebar toggle for mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    sidebar.classList.toggle('open');
}

// close sidebar when clicking outside on small screens
document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.admin-sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    if (sidebar && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    }
});

function updateRoleToggle() {
    const adminBtn = document.getElementById('btn-admin');
    if (adminBtn) {
        adminBtn.classList.add('active');
    }
}

// ═════════════════════════════════════════════════════════════
// BOOKS MANAGEMENT
// ═════════════════════════════════════════════════════════════

function renderBooks() {
    const container = document.getElementById('books-list');
    if (!container) return;
    
    if (books.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-book'></i>
                <p>No books yet. Add your first book!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = books.map(book => `
        <div class="book-item">
            <img src="${book.image || 'https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80'}" alt="${book.title}">
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
            </div>
            <span class="book-status ${book.status}">${book.status === 'published' ? 'Published' : 'Draft'}</span>
            <div class="book-actions">
                ${currentRole === 'admin' ? `
                    <button class="btn-publish" onclick="toggleBookStatus(${book.id})" title="${book.status === 'published' ? 'Unpublish' : 'Publish'}">
                        <i class='bx ${book.status === 'published' ? 'bx-bookmark-minus' : 'bx-bookmark-plus'}'></i>
                    </button>
                    <button class="btn-remove" onclick="removeBook(${book.id})" title="Remove">
                        <i class='bx bx-trash'></i>
                    </button>
                ` : `
                    <button class="btn-publish" onclick="toggleBookStatus(${book.id})" title="Publish">
                        <i class='bx bx-bookmark-plus'></i>
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

function openModal(type) {
    if (type === 'book') {
        document.getElementById('book-modal').classList.add('active');
    }
}

function closeModal(type) {
    if (type === 'book') {
        document.getElementById('book-modal').classList.remove('active');
        clearChaptersForm(); // Clear chapters when modal closes
    }
}

function addBook(event) {
    event.preventDefault();
    
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const imageUrl = document.getElementById('book-image').value;
    const genre = document.getElementById('book-genre').value;
    const pages = document.getElementById('book-pages').value;
    const status = document.getElementById('book-status').value;
    
    // Collect chapters
    const chapters = collectChapters();
    
    // Default cover image if none provided
    const defaultImage = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";
    
    // ensure a usable image string; if the user entered something but it's not a valid URL we still fall back
    const finalImage = (imageUrl && /^https?:\/\//i.test(imageUrl.trim())) ? imageUrl.trim() : defaultImage;
    if (imageUrl && finalImage === defaultImage) {
        console.warn('Provided book image URL was invalid, using default instead:', imageUrl);
    }

    const newBook = {
        id: Date.now(),
        title,
        author,
        image: finalImage,
        genre,
        pages: parseInt(pages),
        status,
        chapters: chapters // Add chapters to the book object
    };
    
    books.push(newBook);
    saveBooksToStorage();
    renderBooks();
    updateStatsCards();
    closeModal('book');
    event.target.reset();
    showNotification('Book added successfully with ' + chapters.length + ' chapter(s)!', 'success');
}

function toggleBookStatus(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book) {
        book.status = book.status === 'published' ? 'draft' : 'published';
        saveBooksToStorage();
        renderBooks();
        updateStatsCards();
        showNotification(`Book ${book.status === 'published' ? 'published' : 'unpublished'}!`, 'success');
    }
}

function removeBook(bookId) {
    if (confirm('Are you sure you want to remove this book?')) {
        books = books.filter(b => b.id !== bookId);
        saveBooksToStorage();
        renderBooks();
        updateStatsCards();
        showNotification('Book removed successfully!', 'success');
    }
}

// Fetch books from API
async function fetchBooksFromAPI() {
    showNotification('Fetching books from API...', 'info');
    
    try {
        const response = await fetch(BASE_URL + 'Harry Potter', API_OPTIONS);
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        const bookList = data.docs || [];
        
        let addedCount = 0;
        bookList.slice(0, 10).forEach(apiBook => {
            const exists = books.some(b => b.title.toLowerCase() === apiBook.title?.toLowerCase());
            if (!exists) {
                // compute cover from API if available
        const defaultImageUrl = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";
        const coverUrl = apiBook.cover_i
            ? `https://covers.openlibrary.org/b/id/${apiBook.cover_i}-M.jpg`
            : defaultImageUrl;

        books.push({
                    id: Date.now() + Math.random(),
                    title: apiBook.title || 'Unknown Title',
                    author: apiBook.author_name ? apiBook.author_name.join(', ') : 'Unknown Author',
                    genre: apiBook.subject ? apiBook.subject[0] : 'Fantasy',
                    pages: apiBook.number_of_pages_median || 0,
                    status: 'draft',
                    image: coverUrl
                });
                addedCount++;
            }
        });
        
        saveBooksToStorage();
        renderBooks();
        updateStatsCards();
        showNotification('Added ' + addedCount + ' books from API!', 'success');
    } catch (error) {
        console.error('API Error:', error);
        showNotification('Failed to fetch books from API', 'error');
    }
}

// ═════════════════════════════════════════════════════════════
// EDITORS MANAGEMENT
// ═════════════════════════════════════════════════════════════

function renderEditors() {
    // Editors functionality removed - now only admin and users
    const container = document.getElementById('editors-list');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class='bx bx-user'></i>
            <p>Editors have been removed. Only admins manage the system.</p>
        </div>
    `;
}

// ═════════════════════════════════════════════════════════════
// USERS MANAGEMENT (Admin Only)
// ═════════════════════════════════════════════════════════════

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}


function renderUsers() {
    const container = document.getElementById('users-list');
    if (!container) return;
    
    const users = getUsers();
    
    if (users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-user'></i>
                <p>No users registered yet.</p>
            </div>
        `;
        return;
    }

    // filter out admins - only show regular users
    const filtered = users.filter(u => u.role !== 'admin' && u.role === 'user');

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-user'></i>
                <p>No users registered yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="user-group" data-role="user">
            <h4>Users (${filtered.length})</h4>
            ${filtered.map(user => `
                <div class="user-item">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="${user.email}">
                    <div class="user-info">
                        <div class="user-name">${user.email.split('@')[0]}</div>
                        <div class="user-email">${shortenEmail(user.email)}</div>
                    </div>
                    <span class="user-role-badge user">User</span>
                    <span class="user-password-hidden">••••••••</span>
                    ${currentRole === 'admin' ? `
                        <div class="user-actions">
                            <button class="btn-remove" onclick="removeUser('${user.email}')" title="Remove User">
                                <i class='bx bx-trash'></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}



function removeUser(email) {
    if (confirm(`Are you sure you want to remove user: ${email}?`)) {
        let users = getUsers();
        users = users.filter(u => u.email !== email);
        localStorage.setItem('users', JSON.stringify(users));
        renderUsers();
        showNotification('User removed successfully!', 'success');
    }
}

// ═════════════════════════════════════════════════════════════
// STATS
// ═════════════════════════════════════════════════════════════

function updateStatsCards() {
    const totalBooks = books.length;
    const published = books.filter(b => b.status === 'published').length;
    const drafts = books.filter(b => b.status === 'draft').length;
    const totalUsers = getUsers().length;
    
    document.getElementById('stat-total-books').textContent = totalBooks;
    document.getElementById('stat-published').textContent = published;
    document.getElementById('stat-drafts').textContent = drafts;
    document.getElementById('stat-users').textContent = totalUsers;
}

function renderStats() {
    const container = document.getElementById('stats-content');
    if (!container) return;
    
    const stats = [
        { icon: 'bx-book', title: 'Total Books', value: books.length, desc: 'All books in library' },
        { icon: 'bx-check-circle', title: 'Published', value: books.filter(b => b.status === 'published').length, desc: 'Available to read' },
        { icon: 'bx-edit', title: 'Drafts', value: books.filter(b => b.status === 'draft').length, desc: 'Work in progress' },
        { icon: 'bx-group', title: 'Total Users', value: getUsers().length, desc: 'Registered users' },
        { icon: 'bx-star', title: 'Top Genre', value: getTopGenre(), desc: 'Most popular category' }
    ];
    
    container.innerHTML = stats.map(stat => `
        <div class="stats-item">
            <div class="stats-info">
                <h4><i class='bx ${stat.icon}'></i> ${stat.title}</h4>
                <p>${stat.desc}</p>
            </div>
            <div class="stats-value">${stat.value}</div>
        </div>
    `).join('');
}

function getTopGenre() {
    const genreCount = {};
    books.forEach(book => {
        genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
    });
    
    const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0];
    return topGenre ? topGenre[0] : 'N/A';
}

// ═════════════════════════════════════════════════════════════
// NAVIGATION
// ═════════════════════════════════════════════════════════════

function navigateTo(section) {
    // Remove active class from all nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to the clicked nav item (if event is available)
    if (event && event.target) {
        const clickedItem = event.target.closest('.admin-nav-item');
        if (clickedItem) {
            clickedItem.classList.add('active');
        }
    } else if (section) {
        // If called programmatically, find the nav item that matches the section
        const navItem = document.querySelector(`.admin-nav-item[onclick*="${section}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
    }
    
    const booksCol = document.getElementById('books-column');
    const usersCol = document.getElementById('users-column');
    const statsCol = document.getElementById('stats-column');
    const dashboardGrid = document.querySelector('.dashboard-grid');
    
    // helper to set visibility
    function showOnly(...cols) {
        [booksCol, usersCol, statsCol].forEach(c => {
            if (c) c.style.display = cols.includes(c) ? 'block' : 'none';
        });
    }

    if (section === 'books') {
        showOnly(booksCol);
    } else if (section === 'users') {
        showOnly(usersCol);
    } else if (section === 'stats') {
        showOnly(statsCol);
    } else {
        // overview / default: show books and stats
        showOnly(booksCol, statsCol);
    }

    // adjust layout width when single card visible
    const visibleCount = [booksCol, usersCol, statsCol].filter(c => c && c.style.display === 'block').length;
    if (dashboardGrid) {
        if (visibleCount === 1) dashboardGrid.classList.add('single');
        else dashboardGrid.classList.remove('single');
    }
}

// ═════════════════════════════════════════════════════════════
// LOGOUT & NAVIGATION
// ═════════════════════════════════════════════════════════════

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        // Clear first login flag so next login is treated as first time
        localStorage.removeItem('firstLogin');
        window.location.href = '../log&register/index.html';
    }
}

// Function to go back to main/home page
function goToHome() {
    window.location.href = '../main/index(acc).html';
}

// ═════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═════════════════════════════════════════════════════════════

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `<i class='bx ${type === 'success' ? 'bx-check-circle' : type === 'error' ? 'bx-x-circle' : 'bx-info-circle'}'></i> ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Close modals when clicking outside
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});
