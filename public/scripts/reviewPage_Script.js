
const summarizeButton = document.getElementById('summarizeButton');
const reviewSummarizerContainer = document.querySelector('.review-summarizer-section');
const writeReviewButton = document.getElementById('writeReviewButton');
const cancelButton = document.getElementById('cancelButton');
const reviewContainer = document.querySelector('.review-publish-section');

cancelButton.addEventListener('click', () => {
    reviewContainer.style.display = 'none';
});


writeReviewButton.addEventListener('click', async()=>{
    
    if(reviewContainer.style.display === 'flex'){
        reviewContainer.style.display = 'none';
        return;
    }
    reviewContainer.style.display = 'flex';
});


summarizeButton.addEventListener('click', async () => {
    reviewSummarizerContainer.style.display = 'flex'; 
    const reviewTextElements = document.querySelectorAll(".review-text");
    const reviews = Array.from(reviewTextElements).map(element => element.textContent.trim());
    console.log(reviews)
    if (reviews.length === 0) {
        
        return;
    }

    const response = await fetch('/book-summarizer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reviews })
    });

    const { data } = await response.json();
    animateSummary(data);
});

function animateSummary(summary) {
    const textContainer = document.getElementById('textContainer');
    textContainer.textContent = ''; // Clear existing text
    let i = 0;
    const intervalId = setInterval(() => {
        textContainer.textContent += summary[i];
        i++;
        if (i >= summary.length) {
            clearInterval(intervalId);
        }
    }, 5); // Delay between characters
}

window.addEventListener('scroll', function() {
    const floatingHeader = document.querySelector('.floating-header');
    const bookSummary = document.querySelector('.book-summary');

    if (window.pageYOffset > bookSummary.offsetTop) {
        floatingHeader.style.display = "block";
        document.getElementById("floating-header-text").innerText = document.getElementById('book-title').innerText + " - " + document.getElementById('book-author').innerText;
    } else {
        floatingHeader.style.display = "none";
    }
});

// JS for handling like/unlikes
document.addEventListener("DOMContentLoaded", () => {
    const likesToolbarContainers = document.querySelectorAll(".likes-toolbar-container");
    likesToolbarContainers.forEach(container => {
        container.addEventListener("click", async () => {
            const reviewId = container.querySelector(".heart-icon").getAttribute("data-review-id");
            const response = await fetch(`/reviews/like/${reviewId}`, { method: "POST" });
            if (response.ok) {
                const { liked, likeCount } = await response.json();
                const heartIcon = container.querySelector(".heart-icon");
                if (liked) {
                    heartIcon.src = "/icons/heart_red.png"; 
                } else {
                    heartIcon.src = "/icons/heart_empty.png"; 
                }
                // Update the like count displayed on the page
                const likeCountElement = container.querySelector(`.like-count`);
                if (likeCountElement) {
                    likeCountElement.textContent = likeCount.toString();
                }
            }
        });
    });
});



// Add to favourites
document.querySelector('.addToFavourites').addEventListener('click', async () => {
    const bookId = document.querySelector('.addToFavourites').dataset.bookId;
    try {
        const response = await fetch(`/reviews/add-to-favourites/${bookId}`, {
            method: 'POST',
            credentials: 'include',
        });
        if (response.ok) {
            // Handle success
            alert('Book added to favourites');
        } else {
            // Handle error
            alert('Failed to add book to favourites');
        }
    } catch (error) {
        console.error('Error adding book to favourites:', error);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const editBookButton = document.querySelector('.editBookButton');
    const editBookForm = document.querySelector('#editBookForm');
    const bookInfo = document.querySelector('.book-info');

    editBookButton.addEventListener('click', function() {
        document.querySelector('#editBookName').value = document.querySelector('#book-title').textContent.trim();
        document.querySelector('#editAuthors').value = document.querySelector('#book-author').textContent.trim();
        document.querySelector('#editPublishedYear').value = document.querySelector('#book-published-year-value').textContent.trim();
        document.querySelector('#editBookTagline').value = document.querySelector('#book-tagline').textContent.trim();
        const bookGenres = document.querySelector('#book-genres').textContent.trim().split(', ');
        const genresEdit = document.querySelector('#editGenres');
        Array.from(genresEdit.options).forEach(option => {
            option.selected = option.value === bookGenres;
        });

        editBookForm.style.display = 'flex';
        bookInfo.style.display = 'none';
    });

    document.querySelector('#cancelEdit').addEventListener('click', function() {
        editBookForm.style.display = 'none';
        bookInfo.style.display = 'flex';
    });

    editBookForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(document.querySelector('#editBookFormData'));
        fetch('http://localhost:3000/edit-book', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                alert('Changes saved successfully');
                window.location.reload();
            } else {
                alert('Failed to save changes');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred');
        });
    });
});
