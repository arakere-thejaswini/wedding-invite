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
    let rsvpBookPosition = { x: 5, y: 5 }; // Center-ish, on the path
    let gameStarted = false; // Start as false until images are loaded

    // Load images
    const images = {
        player: new Image(),
        grass: new Image(),
        path: new Image(),
        flower1: new Image(),
        flower2: new Image(),
        flower3: new Image(),
        tree: new Image(),
        tree1: new Image(),
        bench: new Image(),
        rsvpBook: new Image(),
        fence: new Image(),
        butterfly: new Image(),
        magic: new Image(),
        cloud: new Image(),
        heart: new Image()
    };

    // Load audio
    const audio = {
        move: new Audio('audio/move.mp3'),
        click: new Audio('audio/click.mp3'),
        success: new Audio('audio/success.mp3')
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
        let filename = key;
        switch (key) {
            case 'path': filename = 'garden'; break;
            case 'flower1': filename = 'flower_1'; break;
            case 'flower2': filename = 'flower_2'; break;
            case 'flower3': filename = 'flower_3'; break;
            case 'tree1': filename = 'tree_1'; break;
            case 'rsvpBook': filename = 'rsvp_book'; break;
        }
        img.src = `images/${filename}.png`;
    });

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
        { img: images.butterfly, x: 3, y: 2 },
        { img: images.butterfly, x: 8, y: 7 },
        { img: images.magic, x: 5, y: 5 },
        { img: images.cloud, x: 2, y: 1 },
        { img: images.cloud, x: 9, y: 3 },
        { img: images.heart, x: 6, y: 4 }
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

            // Check if reached RSVP book
            if (playerPosition.x === rsvpBookPosition.x && playerPosition.y === rsvpBookPosition.y) {
                showRSVPPopup();
            }
        }
    }

    function isValidPath(x, y) {
        const tile = gardenLayout[y][x];
        // Block fences, trees, and flowers
        return tile !== 8 && tile !== 5 && tile !== 6 && tile !== 2 && tile !== 3 && tile !== 4;
    }

    function drawGame() {
        if (!gameStarted) return; // Don't draw if images aren't loaded

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw garden
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const tile = gardenLayout[y][x];
                let img;
                switch(tile) {
                    case 0: img = images.grass; break;
                    case 1: img = images.path; break;
                    case 2: img = images.flower1; break;
                    case 3: img = images.flower2; break;
                    case 4: img = images.flower3; break;
                    case 5: img = images.tree; break;
                    case 6: img = images.tree1; break;
                    case 7: img = images.bench; break;
                    case 8: img = images.fence; break;
                }
                if (img && img.complete && img.naturalWidth !== 0) {
                    ctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                } else {
                    // Fallback: draw a colored rectangle and log missing image
                    ctx.fillStyle = '#ccc';
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    if (img) {
                        console.warn('Image not loaded for tile', tile, 'at', x, y);
                    } else {
                        console.warn('No image assigned for tile', tile, 'at', x, y);
                    }
                }
            }
        }

        // Draw decorative elements
        decorations.forEach(dec => {
            if (dec.img && dec.img.complete && dec.img.naturalWidth !== 0) {
                ctx.drawImage(dec.img, dec.x * TILE_SIZE, dec.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else {
                ctx.fillStyle = '#ffb';
                ctx.fillRect(dec.x * TILE_SIZE, dec.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                console.warn('Decoration image not loaded at', dec.x, dec.y);
            }
        });

        // Draw RSVP book
        if (images.rsvpBook && images.rsvpBook.complete && images.rsvpBook.naturalWidth !== 0) {
            ctx.drawImage(images.rsvpBook, rsvpBookPosition.x * TILE_SIZE, rsvpBookPosition.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        } else {
            ctx.fillStyle = '#fbb';
            ctx.fillRect(rsvpBookPosition.x * TILE_SIZE, rsvpBookPosition.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            console.warn('RSVP book image not loaded');
        }

        // Draw player
        if (images.player && images.player.complete && images.player.naturalWidth !== 0) {
            ctx.drawImage(images.player, playerPosition.x * TILE_SIZE, playerPosition.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        } else {
            ctx.fillStyle = '#bbf';
            ctx.fillRect(playerPosition.x * TILE_SIZE, playerPosition.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            console.warn('Player image not loaded');
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

    // Start the game
    drawGame();
}); 