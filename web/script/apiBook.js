// const BASE_URL = 'https://hapi-books.p.rapidapi.com/search/';

// const options = {
//   method: 'GET',
//   headers: {
//     'X-RapidAPI-Key': 'c36c8c8948mshab71074646da345p126326jsna299f4bf9e4e',
//     'X-RapidAPI-Host': 'hapi-books.p.rapidapi.com'
//   }
// };

// async function fetchBooks(query = 'Harry Potter') {
//   try {
//     const resp = await fetch(`${BASE_URL}${encodeURIComponent(query)}`, options);
//     if (!resp.ok) throw new Error('Network response was not ok');
//     const data = await resp.json();
//     return data;
//   } catch (err) {
//     console.error('fetchBooks error:', err);
//     return [];
//   }
// }

// function makeCard(book) {
//   const container = document.createElement('div');
//   container.className = 'item-card';
//   const title = book.title || book.name || 'Untitled';
//   const authors = (book.authors && book.authors.join ? book.authors.join(', ') : book.authors) || book.author || 'Unknown';
//   const cover = book.cover || book.image || book.thumbnail || '';
//   const category = book.genre || book.category || '';

//   container.innerHTML = `
//     <div class="card-image">
//       <img src="${cover || '/img/logo.jpg'}" alt="${title}" onerror="this.src='/img/logo.jpg'">
//     </div>
//     <div class="card-content">
//       <h3>${title}</h3>
//       <p class="author">${authors}</p>
//       <p class="card-description">${(book.description && book.description.substring ? book.description.substring(0,120) + '...' : book.description) || ''}</p>
//       <div class="card-meta">
//         <span><i class='bx bx-book-open'></i> ${book.pages || book.page_count || ''}</span>
//         <span><i class='bx bx-calendar'></i> ${book.year || book.published || ''}</span>
//       </div>
//       <div class="card-footer">
//         <span class="category-tag">${category || ''}</span>
//       </div>
//       <div class="card-actions">
//         <button class="btn-action btn-read"><i class='bx bx-book'></i> Read</button>
//         <button class="btn-action btn-details">Details</button>
//       </div>
//     </div>`;

//   return container;
// }

// async function renderBooks(query = 'Harry Potter', targetSelector = '#items-grid', limit = 8) {
//   const grid = document.querySelector(targetSelector);
//   if (!grid) return;
//   const books = await fetchBooks(query);
//   // The API may return an object or array; normalize
//   const list = Array.isArray(books) ? books : (books.results || books.items || []);
//   const toShow = list.slice(0, limit);
//   toShow.forEach(b => {
//     const card = makeCard(b);
//     grid.appendChild(card);
//   });
// }

// // Auto-run on pages that have an #items-grid element
// if (typeof window !== 'undefined') {
//   window.addEventListener('DOMContentLoaded', () => {
//     // Only fetch if there's an items grid and it has fewer than 4 children (so we don't duplicate static cards repeatedly)
//     const grid = document.querySelector('#items-grid');
//     if (grid && grid.children.length < 4) {
//       renderBooks('Harry Potter', '#items-grid', 8);
//     }
//     // Expose helper for other scripts
//     window.apiBook = { fetchBooks, renderBooks };
//   });
// }

// export { fetchBooks, renderBooks };