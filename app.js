const express = require("express");
const fs = require("fs");
const path = require("path");
const pino = require("pino");
const multer = require("multer");
const {
    makeInMemoryStore,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    fetchLatestBaileysVersion,
    makeWASocket,
    isJidBroadcast
} = require("@whiskeysockets/baileys");

const app = express();
const PORT = 5000;

// Create necessary directories
if (!fs.existsSync("temp")) {
    fs.mkdirSync("temp");
}
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store active client instances and tasks
const activeClients = new Map();
const activeTasks = new Map();

app.get("/", (req, res) => {
    res.send(`
    <html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NK KINK - WhatsApp Server</title>
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
    
    :root {
        --primary: #ff0080;
        --secondary: #00d9ff;
        --accent: #7b00ff;
        --dark: #0a0014;
        --darker: #05000a;
        --light: #e6f7ff;
        --neon-glow: 0 0 10px var(--primary), 0 0 20px var(--primary), 0 0 30px var(--accent);
        --cyber-blue: 0 0 10px var(--secondary), 0 0 20px var(--secondary);
    }
    
    body {
        background: var(--darker);
        background-image: 
            radial-gradient(circle at 10% 20%, rgba(123, 0, 255, 0.1) 0%, transparent 20%),
            radial-gradient(circle at 90% 30%, rgba(255, 0, 128, 0.1) 0%, transparent 20%),
            radial-gradient(circle at 50% 80%, rgba(0, 217, 255, 0.05) 0%, transparent 20%),
            linear-gradient(45deg, var(--darker) 0%, var(--dark) 50%, var(--darker) 100%);
        color: var(--light);
        text-align: center;
        font-size: 18px;
        font-family: 'Rajdhani', sans-serif;
        min-height: 100vh;
        padding: 20px 10px;
        margin: 0;
        overflow-x: hidden;
    }
    
    .container {
        max-width: 900px;
        margin: 0 auto;
        position: relative;
    }
    
    .header-glow {
        position: absolute;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
        opacity: 0.1;
        z-index: -1;
        animation: pulse 4s infinite alternate;
    }
    
    @keyframes pulse {
        0% { opacity: 0.05; transform: translateX(-50%) scale(1); }
        100% { opacity: 0.15; transform: translateX(-50%) scale(1.2); }
    }
    
    .cyber-border {
        position: relative;
        background: rgba(10, 0, 20, 0.85);
        padding: 30px;
        border-radius: 5px;
        margin: 25px auto;
        border: 1px solid var(--primary);
        box-shadow: var(--neon-glow);
        backdrop-filter: blur(10px);
        overflow: hidden;
    }
    
    .cyber-border::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--secondary), transparent);
        animation: scan 3s linear infinite;
    }
    
    @keyframes scan {
        0% { left: -100%; }
        100% { left: 100%; }
    }
    
    h1, h2, h3 {
        color: var(--light);
        text-shadow: var(--cyber-blue);
        margin-top: 0;
        letter-spacing: 2px;
        font-family: 'Orbitron', monospace;
        text-transform: uppercase;
    }
    
    h1 {
        font-size: 42px;
        margin-bottom: 20px;
        background: linear-gradient(45deg, var(--primary), var(--secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 900;
        position: relative;
    }
    
    h1::after {
        content: '';
        position: absolute;
        right: -40px;
        top: 0;
        font-size: 36px;
        animation: flash 1.5s infinite;
    }
    
    @keyframes flash {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
    
    h2 {
        font-size: 32px;
        margin-bottom: 25px;
    }
    
    h3 {
        font-size: 24px;
        margin-bottom: 20px;
    }
    
    input, button, select, textarea {
        display: block;
        margin: 18px auto;
        padding: 16px 20px;
        font-size: 18px;
        width: 90%;
        max-width: 500px;
        border-radius: 3px;
        border: 1px solid var(--secondary);
        background: rgba(5, 0, 10, 0.8);
        color: var(--light);
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 0 5px rgba(0, 217, 255, 0.3);
        position: relative;
        overflow: hidden;
    }
    
    input::placeholder, textarea::placeholder {
        color: #88aaff;
        font-style: italic;
    }
    
    input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: var(--neon-glow);
        background: rgba(10, 0, 20, 0.9);
    }
    
    button {
        background: linear-gradient(45deg, var(--primary), var(--accent));
        color: var(--light);
        border: none;
        cursor: pointer;
        font-weight: 700;
        transition: all 0.3s ease;
        font-size: 20px;
        letter-spacing: 1px;
        margin-top: 30px;
        text-transform: uppercase;
        font-family: 'Orbitron', monospace;
        position: relative;
        overflow: hidden;
    }
    
    button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: 0.5s;
    }
    
    button:hover::before {
        left: 100%;
    }
    
    button:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 25px rgba(255, 0, 128, 0.5), 0 0 30px rgba(123, 0, 255, 0.4);
    }
    
    .active-sessions {
        background: rgba(15, 0, 30, 0.9);
        padding: 25px;
        border-radius: 3px;
        margin-top: 35px;
        font-size: 22px;
        border: 1px solid var(--accent);
        box-shadow: 0 0 15px rgba(123, 0, 255, 0.4);
        position: relative;
    }
    
    .session-counter {
        font-size: 28px;
        font-weight: 700;
        color: var(--primary);
        text-shadow: var(--neon-glow);
        margin: 10px 0;
    }
    
    .task-id-display {
        display: none;
        background: rgba(20, 0, 40, 0.9);
        padding: 20px;
        border-radius: 3px;
        margin-top: 25px;
        border: 1px solid var(--primary);
        animation: cyber-glow 2s infinite alternate;
        font-family: 'Orbitron', monospace;
    }
    
    @keyframes cyber-glow {
        from { box-shadow: 0 0 5px rgba(255, 0, 128, 0.6); }
        to { box-shadow: 0 0 20px rgba(255, 0, 128, 0.9), 0 0 30px rgba(0, 217, 255, 0.6); }
    }
    
    .show-task-btn {
        background: linear-gradient(45deg, var(--accent), var(--secondary));
        width: auto;
        padding: 15px 30px;
        font-size: 18px;
        margin-top: 15px;
    }
    
    a {
        color: var(--secondary);
        text-decoration: none;
        font-weight: bold;
        font-size: 18px;
        display: inline-block;
        margin-top: 25px;
        padding: 12px 25px;
        border-radius: 3px;
        background: rgba(15, 0, 30, 0.7);
        border: 1px solid var(--secondary);
        transition: all 0.3s ease;
        font-family: 'Rajdhani', sans-serif;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    a:hover {
        background: rgba(255, 0, 128, 0.2);
        text-decoration: none;
        box-shadow: var(--cyber-blue);
        transform: translateY(-2px);
    }
    
    .grid-lines {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: 
            linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px);
        background-size: 50px 50px;
        z-index: -1;
        pointer-events: none;
    }
    
    .floating-shapes {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: -2;
        pointer-events: none;
    }
    
    .shape {
        position: absolute;
        opacity: 0.1;
    }
    
    .shape-1 {
        width: 200px;
        height: 200px;
        border: 2px solid var(--primary);
        top: 10%;
        left: 5%;
        animation: float 15s infinite ease-in-out;
    }
    
    .shape-2 {
        width: 150px;
        height: 150px;
        border: 2px solid var(--secondary);
        bottom: 20%;
        right: 10%;
        animation: float 12s infinite ease-in-out reverse;
    }
    
    .shape-3 {
        width: 100px;
        height: 100px;
        border: 2px solid var(--accent);
        top: 50%;
        left: 80%;
        animation: float 18s infinite ease-in-out;
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
    }
    
    /* Mobile-specific adjustments */
    @media (max-width: 600px) {
        h1 { font-size: 32px; }
        h1::after { right: -30px; font-size: 28px; }
        .cyber-border { padding: 20px 15px; }
        input, button, select, textarea { max-width: 100%; padding: 14px; }
        .active-sessions { font-size: 18px; padding: 20px; }
    }
    </style>
    </head>
    <body>
    <div class="grid-lines"></div>
    <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
    </div>
    
    <div class="container">
        <div class="header-glow"></div>
        <h1>NK KING</h1>
        <h2>WHATSAPP SERVER</h2>
        
        <div class="cyber-border">
            <form id="pairingForm">
                <input type="text" id="numberInput" name="number" placeholder="ENTER YOUR WHATSAPP NUMBER (WITH COUNTRY CODE)" required>
                <button type="button" onclick="generatePairingCode()">GENERATE PAIRING CODE</button>
            </form>
            <div id="pairingResult"></div>
        </div>

        <div class="cyber-border">  
            <form action="/send-message" method="POST" enctype="multipart/form-data">  
                <select name="targetType" required>  
                    <option value="">-- SELECT TARGET TYPE --</option>  
                    <option value="number">TARGET NUMBER</option>  
                    <option value="group">GROUP UID</option>  
                </select>  
                <input type="text" name="target" placeholder="ENTER TARGET NUMBER / GROUP UID" required>  
                <input type="file" name="messageFile" accept=".txt" required>  
                <input type="text" name="prefix" placeholder="ENTER MESSAGE PREFIX (OPTIONAL)">  
                <input type="number" name="delaySec" placeholder="DELAY IN SECONDS (BETWEEN MESSAGES)" min="1" required>  
                <button type="submit">START SENDING MESSAGES</button>  
            </form>  
        </div>  

        <div class="cyber-border">  
            <form id="showTaskForm">
                <button type="button" class="show-task-btn" onclick="showMyTaskId()">SHOW MY TASK ID</button>
                <div id="taskIdDisplay" class="task-id-display"></div>
            </form>
        </div>

        <div class="cyber-border">  
            <form action="/stop-task" method="POST">  
                <input type="text" name="taskId" placeholder="ENTER YOUR TASK ID TO STOP" required>  
                <button type="submit">STOP MY TASK</button>  
            </form>  
        </div>  

        <div class="active-sessions">  
            <h3>SYSTEM STATUS</h3>  
            <div class="session-counter">ACTIVE SESSIONS: ${activeClients.size}</div>  
            <div class="session-counter">ACTIVE TASKS: ${activeTasks.size}</div>  
        </div>  
    </div>

    <script>
        async function generatePairingCode() {
            const number = document.getElementById('numberInput').value;
            if (!number) {
                const resultDiv = document.getElementById('pairingResult');
                resultDiv.innerHTML = '<div style="color: #ff0080; padding: 15px; background: rgba(80,0,40,0.5); border-radius: 3px; margin-top: 15px; border: 1px solid #ff0080;">PLEASE ENTER A VALID WHATSAPP NUMBER</div>';
                return;
            }
            
            const response = await fetch('/code?number=' + encodeURIComponent(number));
            const result = await response.text();
            document.getElementById('pairingResult').innerHTML = result;
        }
        
        function showMyTaskId() {
            const taskId = localStorage.getItem('wa_task_id');
            const displayDiv = document.getElementById('taskIdDisplay');
            
            if (taskId) {
                displayDiv.innerHTML = '<h3>YOUR TASK ID:</h3><h2 style="color:#00d9ff; text-shadow:0 0 10px rgba(0,217,255,0.7);">' + taskId + '</h2>';
                displayDiv.style.display = 'block';
            } else {
                displayDiv.innerHTML = '<p>NO ACTIVE TASK FOUND. PLEASE START A MESSAGE SENDING TASK FIRST.</p>';
                displayDiv.style.display = 'block';
            }
        }
    </script>
    </body>  
    </html>
    `);
});

// ... rest of your backend code remains exactly the same ...

app.get("/code", async (req, res) => {
    const num = req.query.number.replace(/[^0-9]/g, "");
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const sessionPath = path.join("temp", sessionId);

    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();
        
        const waClient = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" }))
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }).child({ level: "fatal" }),
            browser: Browsers.ubuntu('Chrome'),
            syncFullHistory: false,
            generateHighQualityLinkPreview: true,
            shouldIgnoreJid: jid => isJidBroadcast(jid),
            getMessage: async key => {
                return {}
            }
        });

        if (!waClient.authState.creds.registered) {
            await delay(1500);
            
            const phoneNumber = num.replace(/[^0-9]/g, "");
            const code = await waClient.requestPairingCode(phoneNumber);
            
            activeClients.set(sessionId, {  
                client: waClient,  
                number: num,  
                authPath: sessionPath  
            });  

            res.send(`  
                <div style="margin-top: 20px; padding: 30px; background: rgba(10, 0, 20, 0.9); border-radius: 5px; border: 1px solid #ff0080; max-width: 600px; margin: 40px auto; color: #e6f7ff; box-shadow: 0 0 20px rgba(255, 0, 128, 0.4);">
                    <h1 style="color: #00d9ff; text-shadow: 0 0 10px rgba(0, 217, 255, 0.7); font-family: 'Orbitron', monospace;">WALEED XD</h1>
                    <h2 style="color: #ff0080; text-shadow: 0 0 10px rgba(255, 0, 128, 0.7); font-family: 'Orbitron', monospace;">PAIRING CODE: ${code}</h2>  
                    <p style="font-size: 18px; margin-bottom: 20px;">SAVE THIS CODE TO PAIR YOUR DEVICE</p>
                    <div style="text-align: left; padding: 20px; background: rgba(15, 0, 30, 0.7); border-radius: 3px; border-left: 3px solid #ff0080; margin: 20px 0;">
                        <p style="font-size: 16px;"><strong>TO PAIR YOUR DEVICE:</strong></p>
                        <ol style="padding-left: 20px;">
                            <li style="margin-bottom: 5px;">OPEN WHATSAPP ON YOUR PHONE</li>
                            <li style="margin-bottom: 5px;">GO TO SETTINGS  LINKED DEVICES  LINK A DEVICE</li>
                            <li style="margin-bottom: 5px;">ENTER THIS PAIRING CODE WHEN PROMPTED</li>
                            <li style="margin-bottom: 5px;">AFTER PAIRING, START SENDING MESSAGES USING THE FORM BELOW</li>
                        </ol>
                    </div>
                    <a href="/" style="display: inline-block; margin-top: 20px; padding: 12px 25px; border-radius: 3px; background: linear-gradient(45deg, #ff0080, #7b00ff); color: #e6f7ff; text-decoration: none; font-weight: bold; transition: all 0.3s; font-family: 'Orbitron', monospace;">GO BACK TO HOME</a>  
                </div>  
            `);  
        }  

        waClient.ev.on("creds.update", saveCreds);  
        waClient.ev.on("connection.update", async (s) => {  
            const { connection, lastDisconnect } = s;  
            if (connection === "open") {  
                console.log(`WhatsApp Connected for ${num}! Session ID: ${sessionId}`);  
            } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {  
                console.log(`Reconnecting for Session ID: ${sessionId}...`);  
                await delay(10000);  
                initializeClient(sessionId, num, sessionPath);  
            }  
        });

    } catch (err) {
        console.error("Error in pairing:", err);
        res.send(`<div style="padding: 20px; background: rgba(80,0,40,0.8); border-radius: 3px; border: 1px solid #ff0080; max-width: 400px; margin: 40px auto;">
                    <h2 style="color: #ff0080; font-family: 'Orbitron', monospace;">ERROR: ${err.message}</h2><br><a href="/" style="color: #e6f7ff;">GO BACK</a>
                  </div>`);
    }
});

// ... (keep all the other backend functions exactly the same as in your original code)

// For Vercel deployment - keep the server running
const keepAlive = () => {
    setInterval(() => {
        console.log('NK KING Server - Keeping alive...');
    }, 60000); // Log every minute to keep alive
};

app.listen(PORT, () => {
    console.log(`NK KING Server running on http://localhost:${PORT}`);
    keepAlive();
});
