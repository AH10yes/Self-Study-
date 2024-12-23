// script.js

// Initialize books array from LocalStorage or empty array
let books = JSON.parse(localStorage.getItem('books')) || [];

// Elements
const booksTableBody = document.querySelector('#books-table tbody');
const addBookBtn = document.getElementById('add-book-btn');
const removeBookBtn = document.getElementById('remove-book-btn');
const addBookModal = document.getElementById('add-book-modal');
const closeModalSpan = document.querySelector('.close');
const addBookForm = document.getElementById('add-book-form');
const removeColumnHeader = document.querySelector('.remove-column');
const calendarDiv = document.getElementById('calendar');

let removeMode = false;

// Function to render books table
function renderBooks() {
    booksTableBody.innerHTML = '';
    books.sort((a, b) => a.name.localeCompare(b.name)); // Sort by book name

    books.forEach((book, index) => {
        const tr = document.createElement('tr');

        // Book Details
        tr.innerHTML = `
            <td>${book.name}</td>
            <td>${book.author}</td>
            <td>${book.subject}</td>
            <td>${book.datePublished}</td>
            <td>${book.dateStarted}</td>
            <td>${book.totalPages}</td>
            <td><input type="number" min="0" max="${book.totalPages}" value="${book.currentPage}" data-index="${index}" class="current-page-input"></td>
            <td>${((book.currentPage / book.totalPages) * 100).toFixed(2)}%</td>
            <td class="remove-action" style="display:${removeMode ? 'block' : 'none'};"><span class="remove-btn" data-index="${index}">X</span></td>
        `;
        booksTableBody.appendChild(tr);
    });

    // Show or hide the remove column
    removeColumnHeader.style.display = removeMode ? 'block' : 'none';
}

// Function to update LocalStorage
function updateLocalStorage() {
    localStorage.setItem('books', JSON.stringify(books));
    renderBooks();
    generateCalendar();
}

// Event Listener for Add Book Button
addBookBtn.addEventListener('click', () => {
    addBookModal.style.display = 'block';
});

// Event Listener for Close Modal
closeModalSpan.addEventListener('click', () => {
    addBookModal.style.display = 'none';
});

// Event Listener for Click Outside Modal to Close
window.addEventListener('click', (event) => {
    if (event.target == addBookModal) {
        addBookModal.style.display = 'none';
    }
});

// Handle Add Book Form Submission
addBookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newBook = {
        name: document.getElementById('book-name').value,
        author: document.getElementById('book-author').value,
        subject: document.getElementById('book-subject').value,
        datePublished: document.getElementById('date-published').value,
        dateStarted: document.getElementById('date-started').value,
        totalPages: parseInt(document.getElementById('total-pages').value),
        currentPage: 0
    };

    books.push(newBook);
    updateLocalStorage();

    addBookForm.reset();
    addBookModal.style.display = 'none';
});

// Event Listener for Remove Book Button
removeBookBtn.addEventListener('click', () => {
    removeMode = !removeMode;
    renderBooks();
});

// Event Delegation for Remove Buttons
booksTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
        const index = e.target.getAttribute('data-index');
        const confirmDelete = confirm('Do you want to delete this book?');

        if (confirmDelete) {
            books.splice(index, 1);
            updateLocalStorage();
        }
    }
});

// Event Delegation for Current Page Input
booksTableBody.addEventListener('change', (e) => {
    if (e.target.classList.contains('current-page-input')) {
        const index = e.target.getAttribute('data-index');
        let currentPage = parseInt(e.target.value);

        if (currentPage > books[index].totalPages) {
            alert(`Current page cannot exceed total pages (${books[index].totalPages}).`);
            e.target.value = books[index].currentPage;
            return;
        }

        books[index].currentPage = currentPage;
        updateLocalStorage();
    }
});

// Function to generate Schedule Calendar
function generateCalendar() {
    calendarDiv.innerHTML = '';

    if (books.length === 0) {
        calendarDiv.innerHTML = '<p>No books to start schedule.</p>';
        return;
    }

    // Find the earliest start date
    const startDate = books.reduce((earliest, book) => {
        const bookDate = new Date(book.dateStarted);
        return bookDate < earliest ? bookDate : earliest;
    }, new Date(books[0].dateStarted));

    // Generate next 30 days from startDate
    for (let i = 0; i < 30; i++) {
        const current = new Date(startDate);
        current.setDate(startDate.getDate() + i);

        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');

        const dayName = current.toLocaleDateString('default', { weekday: 'short' });
        const date = current.toLocaleDateString();

        dayDiv.innerHTML = `<h4>${dayName}</h4><p>${date}</p><ul></ul>`;

        // Assign books to dates (simple round-robin for demonstration)
        const book = books[i % books.length];
        if (book) {
            const ul = dayDiv.querySelector('ul');
            ul.innerHTML = `<li>${book.name}</li>`;
        }

        calendarDiv.appendChild(dayDiv);
    }
}

// Initial Render
renderBooks();
generateCalendar();
