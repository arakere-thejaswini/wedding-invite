// DOM Elements
const countdownTimer = document.getElementById('countdown-timer');

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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    console.log('Countdown timer element:', countdownTimer);
    updateCountdown();
    setInterval(updateCountdown, 1000);
});
