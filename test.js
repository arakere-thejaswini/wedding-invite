console.log('Test script loaded');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    const timer = document.getElementById('countdown-timer');
    console.log('Timer element:', timer);
    if (timer) {
        timer.textContent = 'Test countdown message';
    }
}); 