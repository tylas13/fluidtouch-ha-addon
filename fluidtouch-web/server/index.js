const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

// WebSocket server with path handling
const wss = new WebSocket.Server({ 
  noServer: true // We'll handle upgrades manually
});

// Handle WebSocket upgrade requests
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url;
  
  // Accept WebSocket connections on /ws path
  if (pathname === '/ws' || pathname.endsWith('/ws')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Configuration
const PORT = process.env.PORT || 8099;
const CONFIG_DIR = process.env.CONFIG_DIR || '/data/config';
const CONFIG_FILE = path.join(CONFIG_DIR, 'fluidtouch.json');

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Middleware
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Store active FluidNC connections
const fluidncConnections = new Map();

// Store client connections
const clients = new Set();

// WebSocket handler for browser clients
wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleClientMessage(ws, data);
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Handle messages from browser clients
function handleClientMessage(clientWs, data) {
  const { type, machineId, command, host, port } = data;

  switch (type) {
    case 'connect':
      connectToFluidNC(machineId, host, port, clientWs);
      break;
    case 'disconnect':
      disconnectFromFluidNC(machineId);
      break;
    case 'command':
      sendCommandToFluidNC(machineId, command);
      break;
    case 'getStatus':
      sendStatusToClient(clientWs, machineId);
      break;
    default:
      console.log('Unknown message type:', type);
  }
}

// Connect to FluidNC WebSocket
function connectToFluidNC(machineId, host, port, clientWs) {
  if (fluidncConnections.has(machineId)) {
    console.log(`Already connected to machine ${machineId}`);
    return;
  }

  const wsUrl = `ws://${host}:${port}/ws`;
  console.log(`Connecting to FluidNC at ${wsUrl}`);

  const fluidWs = new WebSocket(wsUrl);

  fluidWs.on('open', () => {
    console.log(`Connected to FluidNC ${machineId}`);
    fluidncConnections.set(machineId, fluidWs);
    
    // Notify client of successful connection
    broadcastToClients({
      type: 'connected',
      machineId: machineId,
      status: 'connected'
    });

    // Request initial status
    fluidWs.send('?');
  });

  fluidWs.on('message', (data) => {
    // Forward FluidNC messages to all connected clients
    try {
      const message = data.toString();
      broadcastToClients({
        type: 'fluidnc',
        machineId: machineId,
        data: message
      });
    } catch (error) {
      console.error('Error processing FluidNC message:', error);
    }
  });

  fluidWs.on('close', () => {
    console.log(`Disconnected from FluidNC ${machineId}`);
    fluidncConnections.delete(machineId);
    
    broadcastToClients({
      type: 'disconnected',
      machineId: machineId,
      status: 'disconnected'
    });
  });

  fluidWs.on('error', (error) => {
    console.error(`FluidNC connection error for ${machineId}:`, error);
    broadcastToClients({
      type: 'error',
      machineId: machineId,
      error: error.message
    });
  });
}

// Disconnect from FluidNC
function disconnectFromFluidNC(machineId) {
  const fluidWs = fluidncConnections.get(machineId);
  if (fluidWs) {
    fluidWs.close();
    fluidncConnections.delete(machineId);
  }
}

// Send command to FluidNC
function sendCommandToFluidNC(machineId, command) {
  const fluidWs = fluidncConnections.get(machineId);
  if (fluidWs && fluidWs.readyState === WebSocket.OPEN) {
    fluidWs.send(command);
  } else {
    console.error(`Not connected to machine ${machineId}`);
  }
}

// Send status to specific client
function sendStatusToClient(clientWs, machineId) {
  const fluidWs = fluidncConnections.get(machineId);
  const status = {
    type: 'status',
    machineId: machineId,
    connected: fluidWs && fluidWs.readyState === WebSocket.OPEN
  };
  
  if (clientWs.readyState === WebSocket.OPEN) {
    clientWs.send(JSON.stringify(status));
  }
}

// Broadcast to all connected clients
function broadcastToClients(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// REST API endpoints

// Get configuration
app.get('/api/config', (req, res) => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      res.json(config);
    } else {
      res.json({ machines: [] });
    }
  } catch (error) {
    console.error('Error reading config:', error);
    res.status(500).json({ error: 'Failed to read configuration' });
  }
});

// Save configuration
app.post('/api/config', (req, res) => {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving config:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// Get machines list
app.get('/api/machines', (req, res) => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      res.json(config.machines || []);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error reading machines:', error);
    res.status(500).json({ error: 'Failed to read machines' });
  }
});

// Save machines
app.post('/api/machines', (req, res) => {
  try {
    const config = fs.existsSync(CONFIG_FILE) 
      ? JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
      : {};
    
    config.machines = req.body;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving machines:', error);
    res.status(500).json({ error: 'Failed to save machines' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    uptime: process.uptime(),
    connections: fluidncConnections.size,
    clients: clients.size
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`FluidTouch Web server listening on port ${PORT}`);
  console.log(`Config directory: ${CONFIG_DIR}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  
  // Close all FluidNC connections
  fluidncConnections.forEach((ws, machineId) => {
    ws.close();
  });
  
  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
