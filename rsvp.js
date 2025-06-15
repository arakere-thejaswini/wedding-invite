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
    let templePosition = { x: 5, y: 5 }; // Center position for the temple
    let gameStarted = false;

    // Load images
    const images = {
        player: new Image(),
        grass: new Image(),
        path: new Image(),
        bush: new Image(),
        arch: new Image(),
        cross: new Image(),
        gate: new Image(),
        obstruction_ud: new Image(),
        temple: new Image()
    };

    // Load audio
    const audio = {
        move: new Audio('audio/move.mp3'),
        click: new Audio('audio/click.mp3'),
        success: new Audio('audio/success.mp3'),
        bump: new Audio('audio/bump.mp3')
    };

    // Image loading error handling
    let loadedImages = 0;
    const totalImages = Object.keys(images).length;

    function handleImageLoad() {
        loadedImages++;
        if (loadedImages === totalImages) {
            console.log('All images loaded successfully');
            gameStarted = true;
            drawGame();
        }
    }

    function handleImageError(error) {
        console.error('Error loading image:', error);
    }

    // Set up image loading
    Object.entries(images).forEach(([key, img]) => {
        img.onload = handleImageLoad;
        img.onerror = (e) => handleImageError(`Failed to load ${key} image`);
        if (key === 'player') {
            img.src = `images/player3.png`;
        } else if (key === 'grass' || key === 'path') {
            img.src = `images/grass2.png`;
        } else if (key === 'obstruction') {
            img.src = `images/obstruction_ud.png`;
        } else {
            img.src = `images/${key}.png`;
        }
    });

    // Maze layout (0: grass, 1: path, 2: bush, 3: arch, 4: cross, 5: gate, 6: obstruction, 7: temple)
    const mazeLayout = [
        [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
        [6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6],
        [6, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 6],
        [6, 0, 2, 1, 1, 1, 1, 1, 1, 2, 0, 6],
        [6, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 6],
        [6, 0, 0, 1, 0, 7, 0, 0, 1, 0, 0, 6],
        [6, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 6],
        [6, 0, 2, 1, 1, 1, 1, 1, 1, 2, 0, 6],
        [6, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 6],
        [6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6],
        [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]
    ];

    // Game controls
    ['up', 'down', 'left', 'right'].forEach(dir => {
        document.getElementById(dir).addEventListener('click', () => {
            switch(dir) {
                case 'up': movePlayer(0, -1, 'up'); break;
                case 'down': movePlayer(0, 1, 'down'); break;
                case 'left': movePlayer(-1, 0, 'left'); break;
                case 'right': movePlayer(1, 0, 'right'); break;
            }
            playSound('move');
        });
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameStarted) return;
        let moved = false;
        switch(e.key) {
            case 'ArrowUp': movePlayer(0, -1, 'up'); moved = true; break;
            case 'ArrowDown': movePlayer(0, 1, 'down'); moved = true; break;
            case 'ArrowLeft': movePlayer(-1, 0, 'left'); moved = true; break;
            case 'ArrowRight': movePlayer(1, 0, 'right'); moved = true; break;
        }
        if (moved) playSound('move');
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

            // Check if reached temple
            if (playerPosition.x === templePosition.x && playerPosition.y === templePosition.y) {
                showRSVPPopup();
            }
        } else {
            playSound('bump');
        }
    }

    function isValidPath(x, y) {
        const tile = mazeLayout[y][x];
        // Block obstructions (6) and bushes (2)
        return tile !== 6 && tile !== 2;
    }

    function drawGame() {
        if (!gameStarted) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Ensure image smoothing is disabled for pixel art
        ctx.imageSmoothingEnabled = false;

        // Draw maze
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const tile = mazeLayout[y][x];
                let img;
                switch(tile) {
                    case 0: img = images.grass; break;
                    case 1: img = images.path; break;
                    case 2: img = images.bush; break;
                    case 3: img = images.arch; break;
                    case 4: img = images.cross; break;
                    case 5: img = images.gate; break;
                    case 6: img = images.obstruction_ud; break;
                    case 7: img = images.temple; break;
                }
                if (img && img.complete && img.naturalWidth !== 0) {
                    ctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE + 1, TILE_SIZE + 1);
                } else {
                    // Fallback: draw a colored rectangle
                    ctx.fillStyle = '#ccc';
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    console.warn(`Image for tile ${tile} at (${x}, ${y}) not loaded. Source: ${img ? img.src : 'N/A'}`);
                }
            }
        }

        // Draw temple
        if (images.temple && images.temple.complete && images.temple.naturalWidth !== 0) {
            ctx.drawImage(images.temple, templePosition.x * TILE_SIZE, templePosition.y * TILE_SIZE, TILE_SIZE + 1, TILE_SIZE + 1);
        }

        // Draw player
        if (images.player && images.player.complete && images.player.naturalWidth !== 0) {
            const playerImg = images.player;
            ctx.drawImage(
                playerImg,
                playerPosition.x * TILE_SIZE,
                playerPosition.y * TILE_SIZE,
                TILE_SIZE + 1,
                TILE_SIZE + 1
            );
        }
    }

    function showRSVPPopup() {
        playSound('success');
        rsvpPopup.style.display = 'flex';
        gameStarted = false;
    }

    // RSVP functionality
    attendingBtn.addEventListener('click', () => {
        playSound('click');
        rsvpStatus = 'attending';
        saveRSVPStatus(rsvpStatus);
        updateRSVPButtons();
        if (guestCount > 0) {
            hideRSVPPopup();
            showMessage();
        }
    });

    notAttendingBtn.addEventListener('click', () => {
        playSound('click');
        rsvpStatus = 'not-attending';
        saveRSVPStatus(rsvpStatus);
        updateRSVPButtons();
        hideRSVPPopup();
        showMessage();
    });

    // Guest counter functionality
    decrementBtn.addEventListener('click', () => {
        playSound('click');
        if (guestCount > 0) {
            guestCount--;
            countDisplay.textContent = guestCount;
            saveGuestCount(guestCount);
        }
    });

    incrementBtn.addEventListener('click', () => {
        playSound('click');
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

    // Add close button functionality for RSVP popup
    const closePopupBtn = document.getElementById('close-popup');
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            playSound('click');
            hideRSVPPopup();
            gameStarted = true;
            drawGame();
        });
    }

    function playSound(sound) {
        if (audio[sound]) {
            const clone = audio[sound].cloneNode();
            clone.play();
        }
    }

    // Add click sound to RSVP and Back to Invitation buttons
    const rsvpLink = document.getElementById('rsvp-link');
    if (rsvpLink) {
        rsvpLink.addEventListener('click', function(e) {
            e.preventDefault();
            playSound('click');
            setTimeout(() => { window.location = this.href; }, 180);
        });
    }
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            playSound('click');
            setTimeout(() => { window.location = this.href; }, 180);
        });
    }

    // Start the game
    drawGame();
}); 