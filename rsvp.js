document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const countDisplay = document.getElementById('count');
    const decrementBtn = document.getElementById('decrement');
    const incrementBtn = document.getElementById('increment');
    const attendingBtn = document.getElementById('attending');
    const notAttendingBtn = document.getElementById('not-attending');

    // Load saved data
    let guestCount = loadGuestCount();
    let rsvpStatus = loadRSVPStatus();

    // Update display
    countDisplay.textContent = guestCount;
    updateRSVPButtons();

    // Guest counter functionality
    decrementBtn.addEventListener('click', () => {
        if (guestCount > 0) {
            guestCount--;
            countDisplay.textContent = guestCount;
            saveGuestCount(guestCount);
        }
    });

    incrementBtn.addEventListener('click', () => {
        if (guestCount < 100) {
            guestCount++;
            countDisplay.textContent = guestCount;
            saveGuestCount(guestCount);
        }
    });

    // RSVP functionality
    attendingBtn.addEventListener('click', () => {
        rsvpStatus = 'attending';
        saveRSVPStatus(rsvpStatus);
        updateRSVPButtons();
    });

    notAttendingBtn.addEventListener('click', () => {
        rsvpStatus = 'not-attending';
        saveRSVPStatus(rsvpStatus);
        updateRSVPButtons();
    });

    // Helper functions
    function updateRSVPButtons() {
        if (rsvpStatus === 'attending') {
            attendingBtn.style.opacity = '1';
            notAttendingBtn.style.opacity = '0.5';
        } else if (rsvpStatus === 'not-attending') {
            attendingBtn.style.opacity = '0.5';
            notAttendingBtn.style.opacity = '1';
        } else {
            attendingBtn.style.opacity = '1';
            notAttendingBtn.style.opacity = '1';
        }
    }

    function saveGuestCount(count) {
        localStorage.setItem('guestCount', count);
    }

    function loadGuestCount() {
        return parseInt(localStorage.getItem('guestCount')) || 0;
    }

    function saveRSVPStatus(status) {
        localStorage.setItem('rsvpStatus', status);
    }

    function loadRSVPStatus() {
        return localStorage.getItem('rsvpStatus') || '';
    }
}); 