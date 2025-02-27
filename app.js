let currentRating = 0;
let isOnline = true;
let dataObject = {
  submissionId: '',
  roomId: '',
  overall: '',
  joinMeeting: '',
  sharingContent: '',
  audioVideo: '',
  comments: '',
};
let idleTimeout = null;
const IDLE_TIME_MS = 60000;
function checkOnlineStatus() {
  if (navigator.onLine) {
    isOnline = true;
    updateRatingDisplay();
  } else {
    isOnline = false;
    updateRatingDisplay();
  }
}
const ratingType = document.getElementById('ratingType');
const smileyRating = document.getElementById('smileyRating');
const starRating = document.getElementById('starRating');
const ratingLabel = document.getElementById('ratingLabel');

if (starRating) {
  starRating.addEventListener('click', function (event) {
    const star = event.target.closest('.star');
    if (star) {
      document.getElementById('firstPageButton').style.display = 'block';
      nextPage('page2');
    }
  });
}
if (smileyRating) {
  smileyRating.addEventListener('click', (event) => {
    if (event.target.value) {
      const selectedValue = event.target.value;
      if (selectedValue != undefined) {
        currentRating = selectedValue;
        nextPage('page2');
      }
    }
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const room = getQueryParam('room') || 'Unknown Room';
  document.getElementById('roomId').value = room;
  const submissionId = generateSubmissionId();
  document.getElementById('submissionId').value = submissionId;
});
// Register Service Worker for offline caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) =>
        console.log(
          'ServiceWorker registration successful with scope:',
          reg.scope
        )
      )
      .catch((err) => console.log('ServiceWorker registration failed:', err));
  });
}
['click', 'touchstart', 'keypress', 'mousemove'].forEach((evt) => {
  document.addEventListener(evt, resetIdleTimer, { passive: true });
});
// Star Hover Effect
document.querySelectorAll('.star').forEach((star, index) => {
  star.addEventListener('mouseover', () => {
    document.querySelectorAll('.star').forEach((s, i) => {
      s.style.fill = i <= index ? 'gold' : 'gray';
    });
  });

  star.addEventListener('mouseout', () => {
    updateStars();
  });

  star.addEventListener('click', () => {
    setRating(index + 1);
  });
});
document.querySelectorAll('.thumb-btn').forEach((button) => {
  button.addEventListener('click', function () {
    let feature = this.dataset.feature;
    let value = this.dataset.value;

    if (feature == 'joinMeeting') {
      dataObject.joinMeeting = value;
    } else if (feature == 'sharingContent') {
      dataObject.sharingContent = value;
    } else if (feature == 'audioVideo') {
      dataObject.audioVideo = value;
    }

    document
      .querySelectorAll(`.thumb-btn[data-feature="${feature}"]`)
      .forEach((btn) => {
        btn.classList.remove('up', 'down', 'na');
      });
    if (value === 'up') {
      this.classList.add('up');
    } else if (value === 'down') {
      this.classList.add('down');
    } else if (value === 'N/A') {
      this.classList.add('na');
    }
  });
});
// When device goes online, resend any offline submissions
window.addEventListener('online', () => {
  let offlineSubmissions =
    JSON.parse(localStorage.getItem('offlineSubmissions')) || [];
  offlineSubmissions.forEach((sub) => {
    sendData(sub);
  });
  checkOnlineStatus();
});
window.addEventListener('offline', () => {
  checkOnlineStatus();
});
// Generate a unique submission ID on load
function generateSubmissionId() {
  return 'sub-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
}
// Star Rating Logic
function setRating(value) {
  currentRating = value;
  updateStars();
}
function updateStars() {
  document.querySelectorAll('.star').forEach((star) => {
    let value = parseInt(star.dataset.value);
    star.style.fill = value <= currentRating ? 'gold' : 'gray';
  });
}
// Navigate between pages
function nextPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach((page) => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}
// Save data offline in localStorage if offline
function saveDataOffline(data) {
  let offlineSubmissions =
    JSON.parse(localStorage.getItem('offlineSubmissions')) || [];
  offlineSubmissions.push(data);
  localStorage.setItem(
    'offlineSubmissions',
    JSON.stringify(offlineSubmissions)
  );
}
// Send data to the Apps Script web app
function sendData(data) {
  const timestamp = new Date().getTime();
  const urlWithTimestamp = `https://script.google.com/macros/s/AKfycbz9KdrRhG6OxxRizJZn_yq01VTN48wYFOXsWYAo0ePmN4aYaYPxS_Zm0X1s4fmcjQYR/exec?timestamp=${timestamp}`;

  fetch(urlWithTimestamp, {
    method: 'POST',
    mode: 'no-cors', // Make sure to use no-cors mode if you don't expect a response body
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(() => {
      console.log('Data sent for submissionId:', data.submissionId);
      removeOfflineSubmission(data.submissionId); // Assuming this function removes offline submissions
    })
    .catch((err) => {
      console.error('Submission error:', err);
    });
}
// Remove a specific offline submission by its unique ID
function removeOfflineSubmission(submissionId) {
  let offlineSubmissions =
    JSON.parse(localStorage.getItem('offlineSubmissions')) || [];
  offlineSubmissions = offlineSubmissions.filter(
    (item) => item.submissionId !== submissionId
  );
  localStorage.setItem(
    'offlineSubmissions',
    JSON.stringify(offlineSubmissions)
  );
}

// Submit the survey
function submitSurvey() {
  // Disable the submit button to prevent duplicate submissions
  document.getElementById('submitButton').disabled = true;

  dataObject.submissionId = document.getElementById('submissionId').value;
  dataObject.roomId = document.getElementById('roomId').value;
  dataObject.overall =
    currentRating != 0
      ? currentRating
      : document.querySelector('input[name="overall"]:checked')?.value;
  dataObject.comments = document.getElementById('comments').value || '';

  if (navigator.onLine) {
    sendData(dataObject);
  } else {
    saveDataOffline(dataObject);
  }

  nextPage('page4');
  // After 5 seconds, reload the page to reset for the next user
  setTimeout(() => {
    window.location.reload();
  }, 5000);
}
// Idle timeout: reload page after 1 minute of inactivity on any page
function resetIdleTimer() {
  clearTimeout(idleTimeout);
  idleTimeout = setTimeout(() => {
    location.reload();
  }, IDLE_TIME_MS);
  checkOnlineStatus();
}
resetIdleTimer();
// Parse the "room" query parameter and generate a unique submission ID on load
function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}
function updateRatingDisplay() {
  const selectedRating = ratingType.value;
  if (!isOnline) {
    smileyRating.style.display = 'flex';
    starRating.style.display = 'none';
    ratingLabel.style.display = 'none';
    ratingType.style.display = 'none';
  } else {
    smileyRating.style.display = selectedRating === 'smiley' ? 'flex' : 'none';
    starRating.style.display = selectedRating === 'smiley' ? 'none' : 'flex';
    ratingLabel.style.display = 'flex';
    ratingType.style.display = 'flex';
  }
}
