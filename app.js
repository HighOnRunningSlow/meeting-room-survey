 let currentRating = 0;

    const starContainer = document.querySelector('#starRating');
    const smileyContainer = document.querySelector('#smileyRating');

    if (starContainer) {
      starContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('star')) {
          const selectedValue = event.target.getAttribute('value');
          nextPage('page3');
        }
      });
    }
    if(smileyContainer){
     smileyContainer.addEventListener('click', (event) =>{
       if(event.target.value){
        const selectedValue = event.target.value;
         if(selectedValue != undefined){
           nextPage('page3');
         } 

       }
     })
   }

    // Generate a unique submission ID on load
    function generateSubmissionId() {
      return 'sub-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
    }
    function toggleRating() {
  const ratingType = document.getElementById("ratingType").value;
  document.getElementById("smileyRating").style.display = ratingType === "smiley" ? "flex" : "none";
  document.getElementById("starRating").style.display = ratingType === "stars" ? "flex" : "none";
}

// Star Rating Logic
function setRating(value) {
  currentRating = value;
  updateStars();
}
    // Star Hover Effect
document.querySelectorAll(".star").forEach((star, index) => {
  star.addEventListener("mouseover", () => {
    document.querySelectorAll(".star").forEach((s, i) => {
      s.style.fill = i <= index ? "gold" : "gray";
    });
  });

  star.addEventListener("mouseout", () => {
    updateStars(); // Reset to selected state
  });

  star.addEventListener("click", () => {
    setRating(index + 1);
  });
});
function updateStars() {
  document.querySelectorAll(".star").forEach((star) => {
    let value = parseInt(star.dataset.value); // Use dataset.value instead of getAttribute
    star.style.fill = value <= currentRating ? "gold" : "gray"; // Change color
  });
}

    // Navigate between pages
    function nextPage(pageId) {
      const pages = document.querySelectorAll('.page');
      pages.forEach(page => page.classList.remove('active'));
      document.getElementById(pageId).classList.add('active');      
    }
    // Save data offline in localStorage if offline
    function saveDataOffline(data) {
      let offlineSubmissions = JSON.parse(localStorage.getItem('offlineSubmissions')) || [];
      offlineSubmissions.push(data);
      localStorage.setItem('offlineSubmissions', JSON.stringify(offlineSubmissions));
    }    
    // Send data to the Apps Script web app
    function sendData(data) {
      fetch("https://script.google.com/macros/s/AKfycbw0xBHZNvp4CeQ7YpCqmICnd9idAPJK4PoDHKu5x0QirMBl6UD4RZ3N9RCj0dN8IdKd/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      .then(() => {
        console.log("Data sent for submissionId:", data.submissionId);
        removeOfflineSubmission(data.submissionId);
      })
      .catch(err => {
        console.error("Submission error:", err);
      });
    }

    // Remove a specific offline submission by its unique ID
    function removeOfflineSubmission(submissionId) {
      let offlineSubmissions = JSON.parse(localStorage.getItem('offlineSubmissions')) || [];
      offlineSubmissions = offlineSubmissions.filter(item => item.submissionId !== submissionId);
      localStorage.setItem('offlineSubmissions', JSON.stringify(offlineSubmissions));
    }

    // When device goes online, resend any offline submissions
    window.addEventListener('online', () => {
      let offlineSubmissions = JSON.parse(localStorage.getItem('offlineSubmissions')) || [];
      offlineSubmissions.forEach(sub => {
        sendData(sub);
      });
    });

    // Submit the survey
    function submitSurvey() {
      // Disable the submit button to prevent duplicate submissions
      document.getElementById('submitButton').disabled = true;

      const data = {
        submissionId: document.getElementById('submissionId').value,
        roomId: document.getElementById('roomId').value,
        overall: currentRating != 0 ? currentRating : document.querySelector('input[name="overall"]:checked')?.value,
        video: document.querySelector('input[name="video"]:checked')?.value || "",
        audio: document.querySelector('input[name="audio"]:checked')?.value || "",
        wireless: document.querySelector('input[name="wireless"]:checked')?.value || "",
        whiteboard: document.querySelector('input[name="whiteboard"]:checked')?.value || "",
        booking: document.querySelector('input[name="booking"]:checked')?.value || "",
        comments: document.getElementById('comments').value || ""
      };

      if (navigator.onLine) {
        sendData(data);
      } else {
        saveDataOffline(data);
      }

      nextPage('page4');
      // After 10 seconds, reload the page to reset for the next user
      setTimeout(() => { location.reload(); }, 5000);
    }

    // Idle timeout: reload page after 1 minute of inactivity on any page
    let idleTimeout = null;
    const IDLE_TIME_MS = 60000;
    function resetIdleTimer() {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => { location.reload(); }, IDLE_TIME_MS);
    }
    ['click','touchstart','keypress','mousemove'].forEach(evt => {
      document.addEventListener(evt, resetIdleTimer, { passive: true });
    });
    resetIdleTimer();

    // Parse the "room" query parameter and generate a unique submission ID on load
    function getQueryParam(param) {
      const params = new URLSearchParams(window.location.search);
      return params.get(param);
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
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('ServiceWorker registration successful with scope:', reg.scope))
          .catch(err => console.log('ServiceWorker registration failed:', err));
      });
    }
