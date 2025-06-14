document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const gameSection = document.getElementById('game-section');
    const rsvpPopup = document.getElementById('rsvp-popup');
    const message = document.querySelector('.message');
    const countDisplay = document.getElementById('count');
    const decrementBtn = document.getElementById('decrement');
    const incrementBtn = document.getElementById('increment');
    const attendingBtn = document.getElementById('attending');
    const notAttendingBtn = document.getElementById('not-attending');

    // Game canvas setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const TILE_SIZE = 32;
    const GRID_WIDTH = canvas.width / TILE_SIZE;
    const GRID_HEIGHT = canvas.height / TILE_SIZE;

    // Game state
    let guestCount = loadGuestCount();
    let rsvpStatus = loadRSVPStatus();
    let playerPosition = { x: 1, y: 1 };
    let playerDirection = 'down';
    let rsvpBookPosition = { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2 };
    let gameStarted = true;

    // Load images
    const playerImg = new Image();
    const grassImg = new Image();
    const pathImg = new Image();
    const flowersImg = new Image();
    const treesImg = new Image();
    const benchImg = new Image();
    const rsvpBookImg = new Image();

    playerImg.src = 'images/player.png';
    grassImg.src = 'images/grass.png';
    pathImg.src = 'images/path.png';
    flowersImg.src = 'images/flowers.png';
    treesImg.src = 'images/trees.png';
    benchImg.src = 'images/bench.png';
    rsvpBookImg.src = 'images/rsvp_book.png';

    // Garden layout (0: grass, 1: path, 2: flowers, 3: trees, 4: bench)
    const gardenLayout = [
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
        [3, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 3],
        [3, 0, 2, 1, 1, 1, 1, 1, 1, 2, 0, 3],
        [3, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 3],
        [3, 0, 0, 1, 0, 4, 0, 0, 1, 0, 0, 3],
        [3, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 3],
        [3, 0, 2, 1, 1, 1, 1, 1, 1, 2, 0, 3],
        [3, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 3],
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
    ];

    // Game controls
    document.getElementById('up').addEventListener('click', () => movePlayer(0, -1, 'up'));
    document.getElementById('down').addEventListener('click', () => movePlayer(0, 1, 'down'));
    document.getElementById('left').addEventListener('click', () => movePlayer(-1, 0, 'left'));
    document.getElementById('right').addEventListener('click', () => movePlayer(1, 0, 'right'));

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameStarted) return;
        switch(e.key) {
            case 'ArrowUp': movePlayer(0, -1, 'up'); break;
            case 'ArrowDown': movePlayer(0, 1, 'down'); break;
            case 'ArrowLeft': movePlayer(-1, 0, 'left'); break;
            case 'ArrowRight': movePlayer(1, 0, 'right'); break;
        }
    });

    function movePlayer(dx, dy, direction) {
        if (!gameStarted) return;
        
        const newX = playerPosition.x + dx;
        const newY = playerPosition.y + dy;

        // Check boundaries
        if (newX < 0 || newX >= GRID_WIDTH || newY < 0 || newY >= GRID_HEIGHT) return;

        // Check if path is valid
        if (isValidPath(newX, newY)) {
            playerPosition.x = newX;
            playerPosition.y = newY;
            playerDirection = direction;
            drawGame();

            // Check if reached RSVP book
            if (playerPosition.x === rsvpBookPosition.x && playerPosition.y === rsvpBookPosition.y) {
                showRSVPPopup();
            }
        }
    }

    function isValidPath(x, y) {
        const tile = gardenLayout[y][x];
        return tile === 1 || tile === 4; // Can walk on path or bench
    }

    function drawGame() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw garden
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const tile = gardenLayout[y][x];
                let img;
                switch(tile) {
                    case 0: img = grassImg; break;
                    case 1: img = pathImg; break;
                    case 2: img = flowersImg; break;
                    case 3: img = treesImg; break;
                    case 4: img = benchImg; break;
                }
                ctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }

        // Draw RSVP book
        ctx.drawImage(rsvpBookImg, rsvpBookPosition.x * TILE_SIZE, rsvpBookPosition.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Draw player
        ctx.drawImage(playerImg, playerPosition.x * TILE_SIZE, playerPosition.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    function showRSVPPopup() {
        gameStarted = false;
        rsvpPopup.style.display = 'flex';
    }

    // RSVP functionality
    attendingBtn.addEventListener('click', () => {
        rsvpStatus = 'attending';
        saveRSVPStatus(rsvpStatus);
        updateRSVPButtons();
        if (guestCount > 0) {
            hideRSVPPopup();
            showMessage();
        }
    });

    notAttendingBtn.addEventListener('click', () => {
        rsvpStatus = 'not-attending';
        saveRSVPStatus(rsvpStatus);
        updateRSVPButtons();
        hideRSVPPopup();
        showMessage();
    });

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

    function hideRSVPPopup() {
        rsvpPopup.style.display = 'none';
    }

    function showMessage() {
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

    // Start the game
    drawGame();
}); 