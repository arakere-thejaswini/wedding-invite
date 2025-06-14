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
    const flower1Img = new Image();
    const flower2Img = new Image();
    const flower3Img = new Image();
    const treeImg = new Image();
    const tree1Img = new Image();
    const benchImg = new Image();
    const rsvpBookImg = new Image();
    const fenceImg = new Image();
    const butterflyImg = new Image();
    const magicImg = new Image();
    const cloudImg = new Image();
    const heartImg = new Image();

    playerImg.src = 'images/player.png';
    grassImg.src = 'images/grass.png';
    pathImg.src = 'images/garden.png';
    flower1Img.src = 'images/flower_1.png';
    flower2Img.src = 'images/flower_2.png';
    flower3Img.src = 'images/flower_3.png';
    treeImg.src = 'images/tree.png';
    tree1Img.src = 'images/tree_1.png';
    benchImg.src = 'images/bench.png';
    rsvpBookImg.src = 'images/rsvp_book.png';
    fenceImg.src = 'images/fence.png';
    butterflyImg.src = 'images/butterfly.png';
    magicImg.src = 'images/magic.png';
    cloudImg.src = 'images/cloud.png';
    heartImg.src = 'images/heart.png';

    // Garden layout (0: grass, 1: path, 2: flower1, 3: flower2, 4: flower3, 5: tree, 6: tree1, 7: bench, 8: fence)
    const gardenLayout = [
        [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
        [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
        [8, 0, 2, 3, 0, 0, 0, 0, 2, 4, 0, 8],
        [8, 0, 3, 1, 1, 1, 1, 1, 1, 3, 0, 8],
        [8, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 8],
        [8, 0, 0, 1, 0, 7, 0, 0, 1, 0, 0, 8],
        [8, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 8],
        [8, 0, 4, 1, 1, 1, 1, 1, 1, 2, 0, 8],
        [8, 0, 2, 3, 0, 0, 0, 0, 3, 4, 0, 8],
        [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
        [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]
    ];

    // Add decorative elements
    const decorations = [
        { img: butterflyImg, x: 3, y: 2 },
        { img: butterflyImg, x: 8, y: 7 },
        { img: magicImg, x: 5, y: 5 },
        { img: cloudImg, x: 2, y: 1 },
        { img: cloudImg, x: 9, y: 3 },
        { img: heartImg, x: 6, y: 4 }
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
                    case 2: img = flower1Img; break;
                    case 3: img = flower2Img; break;
                    case 4: img = flower3Img; break;
                    case 5: img = treeImg; break;
                    case 6: img = tree1Img; break;
                    case 7: img = benchImg; break;
                    case 8: img = fenceImg; break;
                }
                ctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }

        // Draw decorative elements
        decorations.forEach(dec => {
            ctx.drawImage(dec.img, dec.x * TILE_SIZE, dec.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        });

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