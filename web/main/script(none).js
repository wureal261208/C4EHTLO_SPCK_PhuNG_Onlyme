// Category Filter Functionality
document.addEventListener('DOMContentLoaded', function() {
    const categoryFilter = document.getElementById('category-filter');
    const itemsGrid = document.getElementById('items-grid');
    
    // Load published books from localStorage (admin panel data)
    const publishedBooks = loadPublishedBooks();
    
    // Render books to the grid
    renderBooks(publishedBooks);
    
    if (categoryFilter && itemsGrid) {
        categoryFilter.addEventListener('change', function() {
            const selectedCategory = this.value;
            const cards = itemsGrid.querySelectorAll('.item-card');
            
            cards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});

// Function to load published books from localStorage
function loadPublishedBooks() {
    const storedBooks = localStorage.getItem('adminBooks');
    if (storedBooks) {
        const books = JSON.parse(storedBooks);
        // Only return published books
        return books.filter(book => book.status === 'published');
    }
    return [];
}

// Function to render books to the grid
function renderBooks(books) {
    const itemsGrid = document.getElementById('items-grid');
    if (!itemsGrid) return;
    
    // Default cover image if none provided
    const defaultImage = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";
    
    if (books.length === 0) {
        itemsGrid.innerHTML = `
            <div class="no-books" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class='bx bx-book' style="font-size: 3rem; color: var(--muted);"></i>
                <p style="color: var(--muted); margin-top: 10px;">No books available yet. Check back later!</p>
            </div>
        `;
        return;
    }
    
    itemsGrid.innerHTML = books.map(book => `
        <div class="item-card" data-category="${book.genre.toLowerCase()}" data-rating="5" data-year="${new Date().getFullYear()}" onclick="viewBookDetail(${book.id})">
            <div class="card-image">
                <img src="${book.image || defaultImage}" alt="${book.title}">
            </div>
            <div class="card-content">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <p class="card-description">A wonderful book in the ${book.genre} genre.</p>
                <div class="card-meta">
                    <span><i class='bx bx-book-open'></i> ${book.pages} pages</span>
                    <span><i class='bx bx-calendar'></i> ${new Date().getFullYear()}</span>
                </div>
                <div class="card-footer">
                    <span class="category-tag">${book.genre}</span>
                    <div class="rating">
                        <span class="rating-stars">★★★★★</span>
                        <span class="rating-count">(NEW)</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to navigate to detail page with book data
function viewBookDetail(bookId) {
    const storedBooks = localStorage.getItem('adminBooks');
    if (storedBooks) {
        const books = JSON.parse(storedBooks);
        const book = books.find(b => b.id === bookId);
        if (book) {
            // Store the book data in localStorage for the detail page
            localStorage.setItem('currentBook', JSON.stringify(book));
            // Navigate to detail page
            window.location.href = '../detail/index(none).html';
        }
    }
}
