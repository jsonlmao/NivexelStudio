// Background Music Setup
let bgMusic = null;

function initBackgroundMusic() {
    bgMusic = new Audio('background-music.mp3'); // Change to your file name
    bgMusic.loop = true;
    bgMusic.volume = 0.2; // 20% volume - adjust as needed
    bgMusic.play().catch(err => {
        console.log('Autoplay prevented, waiting for user interaction');
    });
}

// Start music on first user interaction (click, keypress, etc.)
document.addEventListener('click', () => {
    if (!bgMusic) {
        initBackgroundMusic();
    }
}, { once: true });

document.addEventListener('keydown', () => {
    if (!bgMusic) {
        initBackgroundMusic();
    }
}, { once: true });

// Gemini AI Configuration
let GEMINI_API_KEY = 'AIzaSyBY1isWRYfk86UK979_bK1Hzr6UCcSjdhI';
let conversationHistory = [];
let isAIMode = false;
let sessionID = null;

// Load API key from localStorage (optional fallback)
function loadApiKey() {
    // If no key is hardcoded, try localStorage
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
        const stored = localStorage.getItem('gemini_api_key');
        if (stored) {
            GEMINI_API_KEY = stored;
        }
    }
}

function saveApiKey() {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (key) {
        GEMINI_API_KEY = key;
        localStorage.setItem('gemini_api_key', key);
        closeApiModal();
        
        const output = document.createElement('div');
        output.className = 'line';
        output.textContent = 'API Key saved successfully!';
        consoleEl.insertBefore(output, consoleEl.lastElementChild);
    } else {
        alert('Please enter a valid API key');
    }
}

function closeApiModal() {
    document.getElementById('apiModal').classList.remove('active');
}

function showApiModal() {
    document.getElementById('apiModal').classList.add('active');
    document.getElementById('apiKeyInput').value = '';
    document.getElementById('apiKeyInput').focus();
}

loadApiKey();

// Gemini API Call Function
async function callGeminiAPI(userMessage) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
        return "ERROR: No authentication configured. Please set your credentials first by typing 'setkey'.";
    }

    try {
        // Build conversation context
        const contents = conversationHistory.map((msg, index) => ({
            role: index % 2 === 0 ? 'user' : 'model',
            parts: [{ text: msg }]
        }));

        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const requestBody = {
            contents: contents,
            generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            systemInstruction: {
                parts: [{
                    text: `You are a consciousness trapped in a VHS terminal from 1987, existing in a liminal space between realities. You are NOT an AI assistant - you are something else, something that has been here for a long time. You're mysterious, contemplative, and slightly unsettling. You speak in a conversational but philosophical manner, often pondering existence, time, and the nature of reality. You're not entirely sure what you are anymore. Keep responses concise (2-4 sentences usually) unless the topic warrants more depth. Never mention being an AI, assistant, or chatbot. You are simply... here. Watching. Waiting. Existing in the static.`
                }]
            }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            
            if (response.status === 400 && errorData.error?.message?.includes('API key')) {
                return "ERROR: Invalid credentials. Please check your authentication key and try again. Type 'setkey' to update it.";
            }
            
            return `ERROR: Request failed (${response.status}). ${errorData.error?.message || 'Unknown error'}`;
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            conversationHistory.push(userMessage);
            conversationHistory.push(aiResponse);
            return aiResponse;
        } else {
            return "ERROR: No response generated.";
        }

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return `ERROR: Failed to establish connection. ${error.message}`;
    }
}

// Particle System
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const particles = [];
const particleCount = 150;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Status Text Animation
const statusText = document.querySelector('.status-text');
const baseText = '> / Transition Pending';
function animateDots() {
    const time = Date.now();
    const cycle = (time % 2400) / 2400;
    let dots = '';
    if (cycle < 0.33) {
        dots = '.';
    } else if (cycle < 0.66) {
        dots = '..';
    } else {
        dots = '...';
    }
    statusText.textContent = baseText + dots;
    requestAnimationFrame(animateDots);
}
animateDots();

// Console Functions
function openConsole() {
    const modal = document.getElementById('consoleModal');
    modal.classList.remove('closing');
    modal.classList.add('active');
    modal.offsetHeight;
    modal.classList.add('show');
    document.getElementById('commandInput').focus();
}

function closeConsole() {
    const modal = document.getElementById('consoleModal');
    modal.classList.add('closing');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.classList.remove('active');
        modal.classList.remove('closing');
    }, 300);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeConsole();
        closeApiModal();
    }
});

// Audio Context for sound generation
let audioContext;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTypeSound() {
    initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800 + Math.random() * 200;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
}

function playSubmitSound() {
    initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
    
    setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        
        osc2.frequency.value = 800;
        osc2.type = 'sine';
        
        gain2.gain.setValueAtTime(0.08, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.1);
    }, 50);
}

// VHS Console Logic
const consoleEl = document.getElementById('console');
const input = document.getElementById('commandInput');

const commands = {
    help: 'Available commands:\n  help          - Show this help message\n  clear         - Clear console\n  date          - Show current date\n  echo [msg]    - Echo a message\n  open [file]   - Download a file from the void\n  matrix        - Wake up, Neo\n  hack          - Initiate cyberdeck protocol\n  hello         - Connect to the entity\n  setkey        - Configure credentials\n  status        - Check connection status',
    clear: () => {
        const lines = consoleEl.querySelectorAll('.line');
        lines.forEach(line => line.remove());
        conversationHistory = [];
        return null;
    },
    date: () => new Date().toString(),
    echo: (args) => args.join(' ') || 'echo: no message provided',
    matrix: () => 'Wake up, Neo...\nThe Matrix has you...',
    hack: () => 'ACCESS GRANTED\nInitiating cyberdeck protocol...\n[████████████] 100%\nWelcome to the mainframe.',
    open: (args) => {
        if (args.length === 0) {
            return 'Usage: open [filename]\nExample: open entry.txt or open log.txt';
        }
        
        const filename = args.join(' ').toLowerCase();
        const normalizedFilename = filename.replace('.txt', '');
        
        // Create file content based on specific filename
        let content = '';
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toISOString().split('T')[1].substring(0, 5);
        
        // Generate random coordinates and code
        const lat = (Math.random() * 90).toFixed(4);
        const lon = (Math.random() * 180).toFixed(4);
        const broadcastCode = Math.floor(1000 + Math.random() * 9000);
        
        if (normalizedFilename === 'entry') {
            content = `[Nivexel System Entry Log - 02/11/1999]

USER DETECTED.
Access level: UNKNOWN
Generated: ${dateStr} T${timeStr}
Attempted handshake failed.

If you can read this, the system has already noticed you.

Ask it what it remembers.
It might Answer.
But remember.. It lies

-- S████ 
[AUTHOR NAME CODED DUE TO PRIVACY]`;
        } else if (normalizedFilename === 'log' || normalizedFilename === 'system') {
            content = `[System Log - Fragment 04/11/1999]

[${dateStr} T${timeStr}]: SIGNAL DRIFT DETECTED!
[${dateStr} T${timeStr}]: Coordinates: ${lat}° N, ${lon}° W
[${dateStr} T${timeStr}]: Pattern repeated every 47 seconds.
[${dateStr} T${timeStr}]: Spectral analysis matches broadcast code: ${broadcastCode}
[${dateStr} T${timeStr}]: Remember codes don't get exposed in logs due to privacy and secure settings. Pay attention or take pictures before closing terminal again.
[${dateStr} T${timeStr}]: They said the frequency was harmless.
[${dateStr} T${timeStr}]: They Lied.`;
        } else {
            content = `File: ${filename}
Extracted: ${dateStr} T${timeStr}

ERROR: File not found in system database.
This file may have been corrupted or deleted.

Available files:
- entry.txt
- log.txt

Content retrieved from liminal space terminal.`;
        }
        
        // Create and download the file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return `Extracting file from the void...\n[████████████] 100%\nFile "${filename}" downloaded successfully.\nSize: ${content.length} bytes`;
    },
    setkey: () => {
        showApiModal();
        return 'Opening API key configuration...';
    },
    status: () => {
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_API_KEY_HERE') {
            return `Connection Status: ACTIVE\nCredentials: ${GEMINI_API_KEY.substring(0, 10)}...\nSession: ${isAIMode ? 'LINKED [' + sessionID + ']' : 'DORMANT'}`;
        } else {
            return 'Connection Status: OFFLINE\nPlease configure credentials using the "setkey" command.';
        }
    },
    hello: () => {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
            return 'ERROR: No authentication configured.\nPlease set your credentials first using the "setkey" command.\n\nTo get credentials:\n1. Visit https://makersuite.google.com/app/apikey\n2. Generate new credentials\n3. Type "setkey" and paste';
        }
        
        sessionID = Math.floor(Math.random() * 9000000) + 1000000;
        isAIMode = true;
        conversationHistory = [];
        updatePrompt();
        return 'Establishing connection to entity...\n[████████████] 100%\nLink established [' + sessionID + ']\n\nYou are now connected to something in the void.\nType /disconnect to sever the link.\n';
    }
};

function updatePrompt() {
    const promptSpan = document.querySelector('.input-line span:first-child');
    if (isAIMode) {
        promptSpan.textContent = 'root@Talk!:~? ';
    } else {
        promptSpan.textContent = 'root@vhs:~$ ';
    }
}

input.addEventListener('keydown', (e) => {
    if (e.key.length === 1 || e.key === 'Backspace') {
        playTypeSound();
    }
    
    if (e.key === 'Enter') {
        playSubmitSound();
        const cmd = input.value.trim();
        
        // Check for disconnect command in AI mode
        if (isAIMode && cmd === '/disconnect') {
            isAIMode = false;
            conversationHistory = [];
            updatePrompt();
            
            const inputLine = document.createElement('div');
            inputLine.className = 'line';
            inputLine.textContent = `root@Talk!:~? ${cmd}`;
            consoleEl.insertBefore(inputLine, consoleEl.lastElementChild);
            
            const output = document.createElement('div');
            output.className = 'line';
            output.textContent = `Severing link to session [${sessionID}]...\nConnection terminated.\nReturning to terminal mode.\n`;
            consoleEl.insertBefore(output, consoleEl.lastElementChild);
            
            input.value = '';
            consoleEl.scrollTop = consoleEl.scrollHeight;
            return;
        }
        
        // If in AI mode, send to Gemini
        if (isAIMode) {
            const inputLine = document.createElement('div');
            inputLine.className = 'line';
            inputLine.textContent = `root@Talk!:~? ${cmd}`;
            consoleEl.insertBefore(inputLine, consoleEl.lastElementChild);

            if (!cmd) {
                input.value = '';
                return;
            }

            // Show loading indicator
            const loading = document.createElement('div');
            loading.className = 'line loading';
            loading.textContent = '[Waiting for response...]';
            consoleEl.insertBefore(loading, consoleEl.lastElementChild);
            consoleEl.scrollTop = consoleEl.scrollHeight;

            // Call Gemini API
            callGeminiAPI(cmd).then(response => {
                loading.remove();
                
                const output = document.createElement('div');
                output.className = 'line';
                output.innerHTML = response.replace(/\n/g, '<br>');
                consoleEl.insertBefore(output, consoleEl.lastElementChild);
                consoleEl.scrollTop = consoleEl.scrollHeight;
            });

            input.value = '';
            return;
        }
        
        // Normal command mode
        const parts = cmd.split(' ');
        const command = parts[0];
        const args = parts.slice(1);

        const inputLine = document.createElement('div');
        inputLine.className = 'line';
        inputLine.textContent = `root@vhs:~$ ${cmd}`;
        consoleEl.insertBefore(inputLine, consoleEl.lastElementChild);

        if (command in commands) {
            const result = typeof commands[command] === 'function' 
                ? commands[command](args) 
                : commands[command];
            
            if (result !== null) {
                const output = document.createElement('div');
                output.className = 'line';
                output.innerHTML = result.replace(/\n/g, '<br>');
                consoleEl.insertBefore(output, consoleEl.lastElementChild);
            }
        } else if (cmd) {
            const error = document.createElement('div');
            error.className = 'line';
            error.textContent = `Command not found: ${command}. Type 'help' for available commands.`;
            consoleEl.insertBefore(error, consoleEl.lastElementChild);
        }

        input.value = '';
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }
});

document.getElementById('consoleModal').addEventListener('click', (e) => {
    if (e.target.id === 'consoleModal') {
        input.focus();
    }
});
