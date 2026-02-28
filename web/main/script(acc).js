// Category Filter Functionality
document.addEventListener('DOMContentLoaded', function() {
    const categoryFilter = document.getElementById('category-filter');
    const itemsGrid = document.getElementById('items-grid');
    
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
