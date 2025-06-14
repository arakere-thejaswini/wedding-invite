document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const countDisplay = document.getElementById('count');
    const decrementBtn = document.getElementById('decrement');
    const incrementBtn = document.getElementById('increment');
    const attendingBtn = document.getElementById('attending');
    const notAttendingBtn = document.getElementById('not-attending');
    const gameSection = document.getElementById('game-section');
    const message = document.querySelector('.message');
    const currentPlayerSpan = document.getElementById('current-player');
    const totalPlayersSpan = document.getElementById('total-players');

    // Game canvas setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const TILE_SIZE = 32;
    const GRID_WIDTH = canvas.width / TILE_SIZE;
    const GRID_HEIGHT = canvas.height / TILE_SIZE;

    // Game state
    let guestCount = loadGuestCount();
    let rsvpStatus = loadRSVPStatus();
    let currentPlayer = 1;
    let completedPlayers = 0;
    let playerPosition = { x: 1, y: 1 };
    let templePosition = { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2 };
    let gameStarted = false;

    // Load images
    const playerImg = new Image();
    const templeImg = new Image();
    const brickImg = new Image();
    playerImg.src = 'images/guest.png';
    templeImg.src = 'images/temple.png';
    brickImg.src = 'images/brick.png';

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
        if (guestCount > 0) {
            startGame();
        }
    });

    notAttendingBtn.addEventListener('click', () => {
        rsvpStatus = 'not-attending';
        saveRSVPStatus(rsvpStatus);
        updateRSVPButtons();
        showMessage();
    });

    // Game controls
    document.getElementById('up').addEventListener('click', () => movePlayer(0, -1));
    document.getElementById('down').addEventListener('click', () => movePlayer(0, 1));
    document.getElementById('left').addEventListener('click', () => movePlayer(-1, 0));
    document.getElementById('right').addEventListener('click', () => movePlayer(1, 0));

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameStarted) return;
        switch(e.key) {
            case 'ArrowUp': movePlayer(0, -1); break;
            case 'ArrowDown': movePlayer(0, 1); break;
            case 'ArrowLeft': movePlayer(-1, 0); break;
            case 'ArrowRight': movePlayer(1, 0); break;
        }
    });

    function startGame() {
        gameStarted = true;
        gameSection.style.display = 'block';
        totalPlayersSpan.textContent = guestCount;
        currentPlayerSpan.textContent = currentPlayer;
        resetPlayerPosition();
        drawGame();
    }

    function resetPlayerPosition() {
        playerPosition = { x: 1, y: 1 };
    }

    function movePlayer(dx, dy) {
        if (!gameStarted) return;
        
        const newX = playerPosition.x + dx;
        const newY = playerPosition.y + dy;

        // Check boundaries
        if (newX < 0 || newX >= GRID_WIDTH || newY < 0 || newY >= GRID_HEIGHT) return;

        // Check if path is valid (you can add more complex path validation here)
        if (isValidPath(newX, newY)) {
            playerPosition.x = newX;
            playerPosition.y = newY;
            drawGame();

            // Check if reached temple
            if (playerPosition.x === templePosition.x && playerPosition.y === templePosition.y) {
                completedPlayers++;
                if (completedPlayers < guestCount) {
                    currentPlayer++;
                    currentPlayerSpan.textContent = currentPlayer;
                    resetPlayerPosition();
                } else {
                    gameStarted = false;
                    showMessage();
                }
            }
        }
    }

    function isValidPath(x, y) {
        // Simple path validation - you can make this more complex
        return true;
    }

    function drawGame() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw brick path
        for (let x = 0; x < GRID_WIDTH; x++) {
            for (let y = 0; y < GRID_HEIGHT; y++) {
                if (isValidPath(x, y)) {
                    ctx.drawImage(brickImg, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }

        // Draw temple
        ctx.drawImage(templeImg, templePosition.x * TILE_SIZE, templePosition.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Draw player
        ctx.drawImage(playerImg, playerPosition.x * TILE_SIZE, playerPosition.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    function showMessage() {
        gameSection.style.display = 'none';
        message.style.display = 'block';
    }

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