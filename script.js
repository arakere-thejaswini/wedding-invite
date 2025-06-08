// DOM Elements
const countEl = document.getElementById('count');
const decBtn = document.getElementById('dec');
const incBtn = document.getElementById('inc');
const countdownTimer = document.getElementById('countdown-timer');
const attendingBtn = document.querySelector('.attending');
const notAttendingBtn = document.querySelector('.not-attending');

// Guest counter functionality
let count = 0;

decBtn.addEventListener('click', () => {
    count = Math.max(0, count - 1);
    countEl.textContent = count;
    saveToLocalStorage();
});

incBtn.addEventListener('click', () => {
    count++;
    countEl.textContent = count;
    saveToLocalStorage();
});

// RSVP functionality
attendingBtn.addEventListener('click', () => {
    handleRSVP('attending');
});

notAttendingBtn.addEventListener('click', () => {
    handleRSVP('not-attending');
});

function handleRSVP(status) {
    const buttons = document.querySelectorAll('.rsvp-btn');
    buttons.forEach(btn => btn.style.opacity = '0.5');
    
    if (status === 'attending') {
        attendingBtn.style.opacity = '1';
        notAttendingBtn.style.opacity = '0.5';
    } else {
        attendingBtn.style.opacity = '0.5';
        notAttendingBtn.style.opacity = '1';
    }
    
    saveToLocalStorage();
}

// Countdown timer functionality
function updateCountdown() {
    // Set your wedding date here
    const weddingDate = new Date('2025-11-07T00:00:00'); // Replace with your wedding date
    const now = new Date();
    const difference = weddingDate - now;

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (difference < 0) {
        countdownTimer.textContent = "Today's the day! 🎉";
    } else {
        countdownTimer.textContent = `${days} days until our wedding!`;
    }
}

// Local storage functionality
function saveToLocalStorage() {
    const data = {
        guestCount: count,
        rsvpStatus: attendingBtn.style.opacity === '1' ? 'attending' : 
                   notAttendingBtn.style.opacity === '1' ? 'not-attending' : null
    };
    localStorage.setItem('weddingInviteData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem('weddingInviteData'));
    if (data) {
        count = data.guestCount;
        countEl.textContent = count;
        
        if (data.rsvpStatus) {
            handleRSVP(data.rsvpStatus);
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updateCountdown();
    setInterval(updateCountdown, 1000);
});
