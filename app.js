let currentRating = 0;

// Switch between Smiley and Star rating based on the dropdown selection
function toggleRating() {
  const selectedRatingType = document.getElementById('ratingType').value;
  if (selectedRatingType === 'smiley') {
    document.getElementById('smileyRating').style.display = 'block';
    document.getElementById('starRating').style.display = 'none';
  } else {
    document.getElementById('starRating').style.display = 'flex';
    document.getElementById('smileyRating').style.display = 'none';
  }
}

// Capture and store rating selection (smiley)
if (document.getElementById('smileyRating')) {
  document.getElementById('smileyRating').addEventListener('click', function (event) {
    if (event.target.tagName === 'IMG') {
      const ratingValue = event.target.getAttribute('value');
      nextPage('page3');
    }
  });
}

// Capture and store rating selection (star)
if (document.getElementById('starRating')) {
  document.getElementById('starRating').addEventListener('click', function (event) {
    if (event.target.classList.contains('star')) {
      const ratingValue = event.target.getAttribute('value');
      nextPage('page3');
    }
  });
}

// Function to change pages
function nextPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach((page) => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// Submit the survey and show thank you page
function submitSurvey() {
  nextPage('page4');
}
