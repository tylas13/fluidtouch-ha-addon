// FluidTouch Web Application
let ws = null;
let currentMachine = null;
let machines = [];
let consoleLines = [];

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadMachines();
});

function initializeApp() {
    // Setup WebSocket connection to backend
    connectToBackend();
}

function connectToBackend() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('Connected to backend');
    };
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleBackendMessage(data);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };
    
    ws.onclose = () => {
        console.log('Disconnected from backend');
        updateConnectionStatus(false);
        // Attempt to reconnect after 3 seconds
        setTimeout(connectToBackend, 3000);
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

function handleBackendMessage(data) {
    switch (data.type) {
        case 'connected':
            updateConnectionStatus(true);
            break;
        case 'disconnected':
            updateConnectionStatus(false);
            break;
        case 'fluidnc':
            handleFluidNCMessage(data.data);
            break;
        case 'error':
            console.error('FluidNC error:', data.error);
            addConsoleMessage(`Error: ${data.error}`, 'error');
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
}

function handleFluidNCMessage(message) {
    addConsoleMessage(message);
    
    // Parse status reports
    if (message.startsWith('<') && message.endsWith('>')) {
        parseStatusReport(message);
    }
}

function parseStatusReport(report) {
    // Parse FluidNC status report format: <Idle|MPos:0.000,0.000,0.000|...>
    const parts = report.slice(1, -1).split('|');
    
    if (parts.length > 0) {
        // Update machine state
        const state = parts[0];
        document.getElementById('machine-state').textContent = state;
        
        // Parse positions
        parts.forEach(part => {
            if (part.startsWith('MPos:') || part.startsWith('WPos:')) {
                const coords = part.split(':')[1].split(',');
                if (coords.length >= 3) {
                    document.getElementById('pos-x').textContent = parseFloat(coords[0]).toFixed(3);
                    document.getElementById('pos-y').textContent = parseFloat(coords[1]).toFixed(3);
                    document.getElementById('pos-z').textContent = parseFloat(coords[2]).toFixed(3);
                }
            } else if (part.startsWith('F:')) {
                document.getElementById('feed-rate').textContent = part.split(':')[1];
            } else if (part.startsWith('S:')) {
                document.getElementById('spindle-speed').textContent = part.split(':')[1];
            }
        });
    }
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Settings button
    document.getElementById('settings-btn').addEventListener('click', openSettings);
    
    // Add machine button
    document.getElementById('add-machine-btn').addEventListener('click', openMachineModal);
    
    // Machine form
    document.getElementById('machine-form').addEventListener('submit', saveMachine);
    
    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // Console input
    document.getElementById('console-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendConsoleCommand();
        }
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

async function loadMachines() {
    try {
        const response = await fetch('/api/machines');
        machines = await response.json();
        renderMachinesList();
    } catch (error) {
        console.error('Error loading machines:', error);
    }
}

function renderMachinesList() {
    const list = document.getElementById('machines-list');
    list.innerHTML = '';
    
    machines.forEach((machine, index) => {
        const card = document.createElement('div');
        card.className = 'machine-card';
        card.innerHTML = `
            <h3>${machine.name}</h3>
            <p>${machine.host}:${machine.port}</p>
        `;
        card.addEventListener('click', () => selectMachine(index));
        list.appendChild(card);
    });
}

function selectMachine(index) {
    currentMachine = machines[index];
    
    // Connect to FluidNC
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'connect',
            machineId: currentMachine.name,
            host: currentMachine.host,
            port: currentMachine.port
        }));
    }
    
    // Switch to control view
    document.getElementById('machine-select-view').classList.remove('active');
    document.getElementById('control-view').classList.add('active');
}

function openMachineModal() {
    document.getElementById('settings-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('settings-modal').classList.remove('active');
    document.getElementById('machine-form').reset();
}

async function saveMachine(e) {
    e.preventDefault();
    
    const machine = {
        name: document.getElementById('machine-name').value,
        host: document.getElementById('machine-host').value,
        port: parseInt(document.getElementById('machine-port').value)
    };
    
    machines.push(machine);
    
    try {
        const response = await fetch('/api/machines', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(machines)
        });
        
        if (response.ok) {
            closeModal();
            renderMachinesList();
        }
    } catch (error) {
        console.error('Error saving machine:', error);
    }
}

function openSettings() {
    // Show settings modal with current machine config
    openMachineModal();
}

function updateConnectionStatus(connected) {
    const badge = document.getElementById('connection-status');
    if (connected) {
        badge.textContent = 'Connected';
        badge.classList.remove('disconnected');
        badge.classList.add('connected');
    } else {
        badge.textContent = 'Disconnected';
        badge.classList.remove('connected');
        badge.classList.add('disconnected');
    }
}

function sendCommand(command) {
    if (ws && ws.readyState === WebSocket.OPEN && currentMachine) {
        ws.send(JSON.stringify({
            type: 'command',
            machineId: currentMachine.name,
            command: command
        }));
    } else {
        console.error('Not connected to machine');
    }
}

function sendConsoleCommand() {
    const input = document.getElementById('console-input');
    const command = input.value.trim();
    
    if (command) {
        sendCommand(command);
        input.value = '';
    }
}

function addConsoleMessage(message, type = 'info') {
    const output = document.getElementById('console-output');
    const line = document.createElement('div');
    line.className = `console-line console-${type}`;
    line.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
    
    // Keep only last 100 messages
    while (output.children.length > 100) {
        output.removeChild(output.firstChild);
    }
}

function jog(axis, direction) {
    const step = parseFloat(document.getElementById('jog-step').value);
    const feed = parseInt(document.getElementById('jog-feed').value);
    const distance = step * direction;
    
    const command = `$J=G91 ${axis}${distance} F${feed}`;
    sendCommand(command);
}

function zeroAxis(axis) {
    const command = `G10 L20 P0 ${axis}0`;
    sendCommand(command);
}

function probeZ() {
    const distance = document.getElementById('probe-distance').value;
    const feed = document.getElementById('probe-feed').value;
    const thickness = document.getElementById('plate-thickness').value;
    
    // Probe command
    const probeCmd = `G38.2 Z-${distance} F${feed}`;
    sendCommand(probeCmd);
    
    // Set Z0 accounting for plate thickness
    setTimeout(() => {
        sendCommand(`G10 L20 P0 Z${thickness}`);
    }, 1000);
}

function probeCorner() {
    addConsoleMessage('Corner probing not yet implemented', 'warning');
}

async function browseFiles(location) {
    addConsoleMessage(`Browsing ${location} files...`);
    
    // Send command to list files
    if (location === 'sd') {
        sendCommand('$SD/List');
    } else if (location === 'flash') {
        sendCommand('$LocalFS/List');
    }
}

// Request status updates every second
setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN && currentMachine) {
        sendCommand('?');
    }
}, 1000);
