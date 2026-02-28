// detail/script.js
// DOMContentLoaded to ensure elements exist

document.addEventListener('DOMContentLoaded', () => {
    // mobile menu toggle + accessibility
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
            mobileBtn.setAttribute('aria-expanded', String(!expanded));
            mobileMenu.classList.toggle('hidden');
        });
        // close when a link is chosen
        mobileMenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                mobileBtn.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // comment system using form
    const commentForm = document.getElementById('comment-form');
    const commentInput = document.getElementById('comment-input');
    const commentsList = document.getElementById('comments-list');

    function addComment(text) {
        if (!text) return;
        if (commentsList.children.length === 1 && commentsList.children[0].classList.contains('text-gray-500')) {
            commentsList.innerHTML = '';
        }
        const div = document.createElement('div');
        div.className = 'p-2 mb-2 border rounded bg-gray-50';
        div.textContent = text;
        commentsList.appendChild(div);
        commentsList.scrollTop = commentsList.scrollHeight;
    }

    if (commentForm && commentInput && commentsList) {
        commentForm.addEventListener('submit', e => {
            e.preventDefault();
            const txt = commentInput.value.trim();
            if (txt) {
                addComment(txt);
                commentInput.value = '';
                commentInput.focus();
            }
        });
    }

    // simple data loader (would normally be async fetch)
    function loadBook() {
        const params = new URLSearchParams(window.location.search);
        const title = params.get('title') || 'Book Title';
        const author = params.get('author') || 'Author Name';
        const status = params.get('status') || 'Completed';
        const views = params.get('views') || '12.3k';
        const rating = params.get('rating') || '★★★★★';
        const ratingCount = params.get('ratingCount') || '(1234 reviews)';
        const description = params.get('desc') || '';
        const cover = params.get('cover');
        const chapters = parseInt(params.get('chapters')) || 200;

        document.getElementById('book-title').textContent = title;
        document.getElementById('book-author').textContent = `by ${author}`;
        document.getElementById('book-status').innerHTML = `Status: <strong>${status}</strong>`;
        document.getElementById('book-views').textContent = `Views: ${views}`;
        document.getElementById('book-rating').textContent = rating;
        document.getElementById('book-rating-count').textContent = ratingCount;
        document.getElementById('book-description').textContent = description ||
            'No summary provided.';
        if (cover) {
            document.getElementById('book-cover').src = cover;
        }
        return chapters;
    }

    // chapters pagination
    const totalChapters = loadBook();   // uses the returned number
    const pageSize = 10;
    let currentPage = 0;
    const chapList = document.getElementById('chapter-list');
    const btnPrev = document.getElementById('chap-prev');
    const btnNext = document.getElementById('chap-next');

    function renderChapters() {
        if (!chapList) return [];
        chapList.innerHTML = '';
        const start = currentPage * pageSize + 1;
        const end = Math.min(totalChapters, start + pageSize - 1);
        const links = [];
        for (let i = start; i <= end; i++) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#chapter${i}`;
            a.textContent = `Chapter ${i}`;
            a.className = 'text-blue-600 hover:underline focus:outline-none focus:ring';
            a.setAttribute('tabindex', '0');
            li.appendChild(a);
            chapList.appendChild(li);
            links.push(a);
        }
        if (btnPrev) btnPrev.disabled = currentPage === 0;
        if (btnNext) btnNext.disabled = end === totalChapters;
        return links;
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                focusFirstChapter();
            }
        });
    }
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            const maxPage = Math.floor((totalChapters - 1) / pageSize);
            if (currentPage < maxPage) {
                currentPage++;
                focusFirstChapter();
            }
        });
    }

    function focusFirstChapter() {
        const links = renderChapters();
        if (links.length) links[0].focus();
    }

    // keyboard shortcuts for chapters
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowRight' && btnNext && !btnNext.disabled) {
            btnNext.click();
            e.preventDefault();
        } else if (e.key === 'ArrowLeft' && btnPrev && !btnPrev.disabled) {
            btnPrev.click();
            e.preventDefault();
        }
    });

    renderChapters();
    // set initial focus for accessibility
    focusFirstChapter();
});