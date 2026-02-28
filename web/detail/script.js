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

    // chapters pagination - five rows of six columns per page
    const totalChapters = loadBook();   // uses the returned number
    const pageSize = 30; // six columns × five rows
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

const bookId = new URLSearchParams(window.location.search).get("id") || "default-book";
const chapterList = document.getElementById("chapter-list");
const continueBtn = document.getElementById("continue-btn");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

const totalChapters = 50;

function loadProgress() {
    const progressData = JSON.parse(localStorage.getItem("readingProgress")) || {};
    const currentChapter = progressData[bookId] || 0;

    if (currentChapter > 0) {
        continueBtn.classList.remove("hidden");
        continueBtn.href = `../detail/Story.html?book=${bookId}&chapter=${currentChapter}`;
    }

    const percent = Math.floor((currentChapter / totalChapters) * 100);
    progressBar.style.width = percent + "%";
    progressText.innerText = percent + "%";
}

function saveProgress(chapterNumber) {
    const progressData = JSON.parse(localStorage.getItem("readingProgress")) || {};
    progressData[bookId] = chapterNumber;
    localStorage.setItem("readingProgress", JSON.stringify(progressData));
}

function renderChapters() {
    chapterList.innerHTML = "";
    for (let i = 1; i <= totalChapters; i++) {
        const li = document.createElement("li");
        li.innerHTML = `
            <a href="../reader/index.html?book=${bookId}&chapter=${i}"
            class="block py-1 hover:text-blue-500">
            Chapter ${i}
            </a>
        `;
        chapterList.appendChild(li);
    }
}

loadProgress();
renderChapters();

continueBtn.addEventListener("click", () => {
    continueBtn.classList.add("hidden");
    saveProgress(1);
    renderChapters();
});

chapterList.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
        const chapterNumber = parseInt(e.target.textContent.split(" ")[1]);
        saveProgress(chapterNumber);
        renderChapters();
    }
});

chapterList.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
        const chapterNumber = parseInt(e.target.textContent.split(" ")[1]);
        window.location.href = `../detail/Story.html?book=${bookId}&chapter=${chapterNumber}`;
    }
});
