//DOM and Variables
//Adding new Book - Elements
const formOverlay = document.querySelector('.form-overlay');
const form = document.getElementById('form');
const newBookName = document.getElementById('new-book-name');
const newBookAuthor = document.getElementById('new-author');
const newBookPages = document.getElementById('new-pages');
const newBookCheckbox = document.getElementById('checkbox');
const submitBtn = document.querySelector('.submit');
const closeFormBtn = document.querySelector('.close');
const addNewBookBtn = document.querySelector('.add');
const labels = document.querySelectorAll('.form-control label');
//Books Section
const booksEl = document.getElementById('books');
//Library Log Elements
const totalBooksLog = document.querySelector('.total');
const finishedBooksLog = document.querySelector('.finished');
const unfinishedBooksLog = document.querySelector('.unfinished');
//Filter Buttons
const filterBtnsEl = document.querySelector('.filter-btns');
const allFilterBtns = filterBtnsEl.querySelectorAll('button');
const defaultFilterBtn = document.querySelector('.filter-all-books');
//Dark Mode Button
const themeToggle = document.querySelector('.theme-toggle');

const saveToStorageBtn = document.querySelector('.save-to-storage');

const myLibrary = [];
let editFlag = false;
let editElement = undefined;
let darkMode = false;
let saveBooks = true;

//Functions
function Book(name, author, pages, hasRead) {
    this.name = name;
    this.author = author;
    this.pages = pages;
    this.hasRead = hasRead;
}

Book.prototype.changeValues = function(newName, newAuthor, newPages, readStatus) {
    this.name = newName;
    this.author = newAuthor;
    this.pages = newPages;
    this.hasRead = readStatus;
}

Book.prototype.changeReadingStatus = function() {
    this.hasRead = !this.hasRead;
} 

function setNewBook(e) {
    e.preventDefault();
    const bookName = newBookName.value;
    const bookAuthor = newBookAuthor.value;
    const bookPages = newBookPages.value;
    const hasRead = newBookCheckbox.checked;

    if(bookName !== '' && bookAuthor !== '' && bookPages !== '' && !editFlag) {
        const BOOK = new Book(bookName, bookAuthor, bookPages, hasRead);
        myLibrary.push(BOOK);
        updateBooks(myLibrary);
        resetInputs();
        resetFilterButtons();
        
    } else if(bookName !== '' && bookAuthor !== '' && bookPages !== '' && editFlag) {
        editElement.changeValues(bookName, bookAuthor, bookPages, hasRead)
        updateBooks(myLibrary);
        resetInputs();
        resetFilterButtons();
    }
}

function updateBooks(booksLib) {
    const addBtnParent = addNewBookBtn.parentNode;
    booksEl.innerHTML = '';
    booksEl.innerHTML = booksLib.map((book, index) => {
        return `
            <div class="book" data-id="${index}">
                <h4 class="book-title">${book.name}</h4>
                <p>by: ${book.author}</p>
                <p>Total Pages: ${book.pages}</p>
                <p>Status: ${book.hasRead === true ? 'Completed' : 'Not Completed'}</p>
                <div class="utility-btns">
                    <button class="edit">Edit <i class="fas fa-edit"></i></button>
                    <button class="remove">Remove <i class="fas fa-trash"></i></button>
                </div>
                <button class="checker ${book.hasRead === false ? 'bookIsNotRead' : ''}">
                    <i class="fas fa-${book.hasRead === false ? 'times' : 'check'}"></i>
                </button>
            </div>
        `;
    }).join('');
    booksEl.appendChild(addBtnParent);
    updateLibraryLog();
    updateLocalStorage();
}

function manageBooks(e) {
    if(e.target.classList.contains('edit')) {
        editBook(e.target.parentElement.parentElement.dataset.id);
    } 
    else if(e.target.classList.contains('remove')){
        removeBook(e.target.parentElement.parentElement.dataset.id);
    } 
    else if(e.target.classList.contains('checker')) {
        changeBookStatus(e.target.parentElement.dataset.id);
    } else {
        return;
    }
}

function editBook(id) {
    editFlag = true;
    editElement = myLibrary[id];
    formOverlay.classList.add('enter-new-book');
    newBookName.value = editElement.name;
    newBookAuthor.value = editElement.author;
    newBookPages.value = editElement.pages;
    newBookCheckbox.checked = editElement.hasRead;
    submitBtn.textContent = 'Edit';
}

function removeBook(id) {
    myLibrary.splice(id, 1);
    updateBooks(myLibrary);
    resetFilterButtons();
}

function changeBookStatus(id) {
    myLibrary[id].changeReadingStatus();
    updateBooks(myLibrary);
    resetFilterButtons();
}

function updateLibraryLog(){
    totalBooksLog.innerHTML = `Total of Books: ${myLibrary.length}`;
    const finishedNum = myLibrary.filter(book => book.hasRead).length;
    const unfinishedNum = myLibrary.filter(book => !book.hasRead).length;
    finishedBooksLog.innerHTML = `Finished: ${finishedNum}`;
    unfinishedBooksLog.innerHTML = `Unfinished: ${unfinishedNum}`;
}

function resetInputs() {
    const allInputs = form.querySelectorAll('input:not([type="checkbox"])')
    allInputs.forEach(input => input.value = '');
    newBookCheckbox.checked = false;
    formOverlay.classList.remove('enter-new-book');
    submitBtn.textContent = 'Submit';
    editFlag = false;
    editElement = undefined;
}

function resetFilterButtons() {
    allFilterBtns.forEach(button => button.classList.remove('filter-active'));
    defaultFilterBtn.classList.add('filter-active');  
}

function filterButtonsAnimation(e) {
    allFilterBtns.forEach(button => button.classList.remove('filter-active'));
    const currentButton = e.target;
    currentButton.classList.add('filter-active');

    if(currentButton.classList.contains('filter-all-books')) {
        updateBooks(myLibrary);
    } else if(currentButton.classList.contains('filter-read')) {
        const filterFinished = myLibrary.filter(book => book.hasRead)
        updateBooks(filterFinished);
    } else {
        const filterUnfinished = myLibrary.filter(book => !book.hasRead)
        updateBooks(filterUnfinished);
    }
}

function updateLocalStorage() {
    if(saveBooks === true) {
        localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
    }
}

function init() {
    const localStorageLib = JSON.parse(localStorage.getItem('myLibrary'));
    const savingStatus = JSON.parse(localStorage.getItem('areWeSaving')) !== null ? JSON.parse(localStorage.getItem('areWeSaving')) : true;
    const currentTheme = JSON.parse(localStorage.getItem('dark-theme')) !== null ? JSON.parse(localStorage.getItem('dark-theme')) : false;
    saveBooks = savingStatus;
    if(saveBooks === true) {
        saveToStorageBtn.classList.add('active');
    } else {
        saveToStorageBtn.classList.remove('active')
    }

    darkMode = currentTheme;
    if(darkMode === true) {
        document.documentElement.setAttribute('data-theme', 'Dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'Light');
    }

    if(saveBooks === true) {
        if(localStorageLib !== null && localStorageLib.length > 0) {
            localStorageLib.forEach(book => {
                const returnedBook = new Book(book.name, book.author, book.pages, book.hasRead);
                myLibrary.push(returnedBook);
                updateBooks(myLibrary);
            })
        } else {
            myLibrary.push(...tempLibrary);
            updateBooks(myLibrary);
        }
    }
}

//EventListeners
addNewBookBtn.addEventListener('click', () => formOverlay.classList.add('enter-new-book'));
closeFormBtn.addEventListener('click', () => {
    formOverlay.classList.remove('enter-new-book')
    resetInputs();
});
form.addEventListener('submit', setNewBook);
booksEl.addEventListener('click', manageBooks);
filterBtnsEl.addEventListener('click', filterButtonsAnimation);
window.addEventListener('DOMContentLoaded', init);
saveToStorageBtn.addEventListener('click', () => {
    saveToStorageBtn.classList.toggle('active');
    saveBooks = !saveBooks;
    localStorage.setItem('areWeSaving', JSON.stringify(saveBooks));
});

themeToggle.addEventListener('click', () => {
    document.documentElement.classList.add('color-theme-in-transition');
    setTimeout(() => document.documentElement.classList.add('color-theme-in-transition'), 750);
    if(darkMode === false) {
        document.documentElement.setAttribute('data-theme', 'Dark');
        darkMode = true;
    } else {
        document.documentElement.setAttribute('data-theme', 'Light');
        darkMode = false;
    }
    localStorage.setItem('dark-theme', JSON.stringify(darkMode));
})

//Input Animation
labels.forEach(label => {
    label.innerHTML = label.innerText
        .split('')
        .map((letter, index) => `<span style="transition-delay:${index * 50}ms">${letter}</span>` )
        .join('')
})

// Temp elements
const tempLibrary = [];
const Book5 = new Book('Prince of Thorns', 'Mark Lawrence', 336, true);
const Book6 = new Book('King of Thorns', 'Mark Lawrence', 597, true);
const Book7 = new Book('Emperor of Thorns', 'Mark Lawrence', 574, false);
tempLibrary.push(Book5)
tempLibrary.push(Book6)
tempLibrary.push(Book7)
//Temp elements