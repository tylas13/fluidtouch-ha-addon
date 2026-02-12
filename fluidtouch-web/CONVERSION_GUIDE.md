# FluidTouch to Home Assistant Add-on Conversion

## Overview

This project converts the FluidTouch ESP32-based CNC pendant controller into a web-based Home Assistant Add-on. The conversion maintains all core functionality while making it accessible from any device with a web browser.

## Architecture Comparison

### Original FluidTouch (ESP32)
```
┌─────────────────────────────────────┐
│  Elecrow 7" ESP32-S3 Display        │
│  ┌─────────────────────────────┐    │
│  │  LVGL UI (C++)              │    │
│  │  - Touch Input              │    │
│  │  - 800×480 Display          │    │
│  └─────────────────────────────┘    │
│            ↕                         │
│  ┌─────────────────────────────┐    │
│  │  Arduino/ESP-IDF Code       │    │
│  │  - WiFi Client              │    │
│  │  - WebSocket Client         │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
            ↕ WebSocket
┌─────────────────────────────────────┐
│  FluidNC Controller                 │
│  - WebSocket Server                 │
│  - G-code Interpreter               │
│  - Motor Control                    │
└─────────────────────────────────────┘
```

### FluidTouch Web (Home Assistant Add-on)
```
┌─────────────────────────────────────┐
│  Browser (Any Device)               │
│  ┌─────────────────────────────┐    │
│  │  HTML/CSS/JS UI             │    │
│  │  - Touch/Mouse Input        │    │
│  │  - Responsive Design        │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
            ↕ WebSocket
┌─────────────────────────────────────┐
│  Home Assistant Add-on (Docker)     │
│  ┌─────────────────────────────┐    │
│  │  Node.js + Express          │    │
│  │  - WebSocket Proxy          │    │
│  │  - REST API                 │    │
│  │  - Static File Server       │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
            ↕ WebSocket
┌─────────────────────────────────────┐
│  FluidNC Controller                 │
│  - WebSocket Server                 │
│  - G-code Interpreter               │
│  - Motor Control                    │
└─────────────────────────────────────┘
```

## Project Structure

```
fluidtouch-web/
├── config.yaml              # Home Assistant add-on configuration
├── build.yaml              # Docker build configuration
├── Dockerfile              # Container image definition
├── run.sh                  # Startup script
├── package.json            # Node.js dependencies
├── README.md               # Main documentation
├── INSTALLATION.md         # Installation guide
├── CHANGELOG.md            # Version history
├── LICENSE                 # MIT License
├── .gitignore             # Git ignore rules
│
├── server/                 # Backend server
│   └── index.js           # Express + WebSocket server
│
└── public/                 # Frontend web application
    ├── index.html         # Main HTML page
    ├── css/
    │   └── styles.css     # UI styling
    └── js/
        └── app.js         # Client-side application logic
```

## Technology Stack

### Backend
- **Runtime**: Node.js 16+
- **Web Server**: Express.js
- **WebSocket**: ws library
- **Container**: Docker (Alpine Linux)
- **Platform**: Home Assistant Supervisor

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern responsive design
- **JavaScript**: ES6+ vanilla JS
- **WebSocket API**: Real-time communication
- **Fetch API**: RESTful configuration management

## Feature Mapping

| Feature | Original FluidTouch | FluidTouch Web | Notes |
|---------|-------------------|----------------|-------|
| Machine Control | ✅ LVGL UI | ✅ Web UI | Full feature parity |
| Position Display | ✅ Real-time | ✅ Real-time | 1s update interval |
| Jogging | ✅ Touch + Analog | ✅ Touch/Click | Virtual joystick |
| Probing | ✅ Touch Probe | ✅ Touch Probe | Same functionality |
| File Browser | ✅ SD/Flash | ✅ SD/Flash | Via FluidNC commands |
| Macros | ✅ 9 per machine | ✅ 9 per machine | Stored in config |
| Console | ✅ Terminal | ✅ Terminal | Direct G-code entry |
| Multi-Machine | ✅ 4 machines | ✅ Unlimited | JSON configuration |
| Settings | ✅ Local storage | ✅ Persistent | Docker volume |
| Display | ✅ 800×480 TFT | ✅ Responsive | Any screen size |
| Touch Input | ✅ Capacitive | ✅ Touch/Mouse | Universal input |
| Power Mgmt | ✅ Sleep/Dim | ❌ N/A | Browser handles |
| Hardware | ⚠️ Specific ESP32 | ✅ Any platform | Container-based |

## Key Differences

### Advantages of Web Version
1. **Universal Access**: Works on any device with a browser
2. **No Hardware Required**: No need for dedicated ESP32 display
3. **Multi-User**: Multiple browsers can connect simultaneously
4. **Easy Updates**: Update via Home Assistant
5. **Scalable**: Add unlimited machines
6. **Integration**: Native Home Assistant add-on
7. **Responsive**: Adapts to any screen size
8. **Development**: Easier to modify (HTML/CSS/JS vs C++)

### Advantages of Original ESP32 Version
1. **Dedicated Hardware**: Always-on pendant controller
2. **Low Latency**: Direct WebSocket connection
3. **Offline**: Works without Home Assistant
4. **Battery Powered**: Portable with LiPo battery
5. **Physical Buttons**: Tactile feedback
6. **Analog Joystick**: Smooth continuous jogging

## Implementation Details

### WebSocket Proxy Pattern

The add-on acts as a WebSocket proxy between browsers and FluidNC:

```javascript
Browser ←→ Add-on ←→ FluidNC

// Browser sends command
browser.send({ type: 'command', command: '$H' })

// Add-on forwards to FluidNC
fluidnc.send('$H')

// FluidNC responds
fluidnc.onmessage → add-on processes → browser.send(response)
```

This allows:
- Multiple browsers to share one FluidNC connection
- Centralized connection management
- Message filtering/processing
- Persistent connection handling

### Configuration Management

Configuration is stored in `/data/config/fluidtouch.json`:

```json
{
  "machines": [
    {
      "name": "CNC Router",
      "host": "192.168.1.100",
      "port": 81
    }
  ],
  "settings": {
    "jogSteps": [0.1, 1, 10, 100],
    "defaultFeedRate": 1000
  }
}
```

### Status Update Loop

Real-time status updates are handled via periodic polling:

```javascript
setInterval(() => {
  if (connected) {
    sendCommand('?');  // Request status
  }
}, 1000);  // Every 1 second
```

FluidNC responds with status reports like:
```
<Idle|MPos:0.000,0.000,0.000|FS:0,0>
```

These are parsed and displayed in real-time.

## Development Workflow

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/yourusername/fluidtouch-ha-addon.git
cd fluidtouch-ha-addon

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Access at http://localhost:8099
```

### Testing with FluidNC

```bash
# Set environment variables
export FLUIDNC_HOST=192.168.1.100
export FLUIDNC_PORT=81

# Run server
node server/index.js
```

### Building Docker Image

```bash
# Build for local architecture
docker build -t fluidtouch-web .

# Test container
docker run -p 8099:8099 \
  -e FLUIDNC_HOST=192.168.1.100 \
  -e FLUIDNC_PORT=81 \
  fluidtouch-web

# Multi-architecture build (for Home Assistant)
docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 \
  -t yourusername/fluidtouch-web:latest .
```

### Deploying to Home Assistant

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Update FluidTouch Web"
   git push origin main
   ```

2. **Update Add-on Store**
   - Users refresh add-on store
   - Click update on FluidTouch Web
   - Add-on automatically pulls latest version

## Customization Guide

### Adding New Features

#### Backend (server/index.js)

```javascript
// Add new API endpoint
app.post('/api/custom-action', (req, res) => {
  const { action, params } = req.body;
  // Implement your logic
  res.json({ success: true });
});

// Add new WebSocket message handler
function handleClientMessage(clientWs, data) {
  switch (data.type) {
    case 'custom-action':
      // Handle new action
      break;
  }
}
```

#### Frontend (public/js/app.js)

```javascript
// Add new UI function
function customAction(params) {
  // Send to backend
  ws.send(JSON.stringify({
    type: 'custom-action',
    params: params
  }));
}

// Add event listener
document.getElementById('custom-btn').addEventListener('click', () => {
  customAction({ value: 123 });
});
```

### Styling Customization

Edit `public/css/styles.css`:

```css
/* Change primary color */
:root {
  --primary-color: #FF6B6B;  /* Red theme */
}

/* Customize buttons */
.btn-primary {
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

### Adding New Tabs

1. **HTML** (public/index.html):
```html
<button class="tab-btn" data-tab="custom">Custom</button>
<div id="custom-tab" class="tab-content">
  <!-- Your content here -->
</div>
```

2. **JavaScript** (public/js/app.js):
```javascript
// Tab switching is automatic, just add content
```

## Migration from Original FluidTouch

### For End Users

1. **Export Settings** (if supported in original)
2. **Install FluidTouch Web** in Home Assistant
3. **Configure Machines** using same IP/port settings
4. **Test Connection** to verify functionality
5. **Set Up Macros** (manual entry, copy from original config)

### For Developers

Converting code from ESP32 to web:

#### LVGL → HTML/CSS
```cpp
// Original LVGL code
lv_obj_t * btn = lv_btn_create(parent);
lv_obj_add_event_cb(btn, event_handler, LV_EVENT_CLICKED, NULL);
```

```html
<!-- Web equivalent -->
<button class="btn" onclick="handleClick()">Button</button>
```

#### WebSocket Client → Server Proxy
```cpp
// Original ESP32
WebSocketsClient webSocket;
webSocket.begin(host, port, "/ws");
webSocket.onEvent(webSocketEvent);
```

```javascript
// Web server
const fluidWs = new WebSocket(`ws://${host}:${port}/ws`);
fluidWs.on('message', (data) => {
  broadcastToClients({ type: 'fluidnc', data });
});
```

## Troubleshooting Development

### WebSocket Connection Issues

```javascript
// Debug WebSocket messages
ws.addEventListener('message', (event) => {
  console.log('Received:', event.data);
});

ws.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
});
```

### CORS Issues

If developing locally with different ports:

```javascript
// server/index.js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',  // Your dev server
  credentials: true
}));
```

### Container Debugging

```bash
# View container logs
docker logs <container-id>

# Access container shell
docker exec -it <container-id> /bin/sh

# Check network connectivity
docker exec <container-id> ping 192.168.1.100
```

## Performance Optimization

### Backend
- Enable compression for responses
- Implement connection pooling for multiple FluidNC machines
- Add caching for static assets
- Rate limit status updates

### Frontend
- Minimize DOM updates
- Use request animation frame for animations
- Lazy load tab content
- Implement virtual scrolling for large file lists

## Security Considerations

### Network Security
- Add-on runs in isolated Docker container
- WebSocket connections are local by default
- Use Home Assistant SSL for external access
- Implement authentication (future feature)

### Input Validation
- Sanitize all user inputs
- Validate G-code commands
- Limit command rate
- Implement emergency stop

## Future Enhancements

Potential features for future versions:

1. **Camera Integration**: View webcam feed
2. **Job Progress**: Real-time progress tracking
3. **Graphical Preview**: G-code visualization
4. **Tool Library**: Store tool information
5. **Authentication**: User login system
6. **Mobile App**: Native mobile wrapper
7. **Offline Mode**: Service worker caching
8. **Voice Control**: Integration with voice assistants
9. **Macro Templates**: Predefined macro library
10. **Multi-Language**: Internationalization support

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- JavaScript: Follow StandardJS
- HTML: Semantic markup
- CSS: BEM naming convention
- Comments: JSDoc for functions

## License

This project is licensed under the MIT License, same as the original FluidTouch.

## Acknowledgments

- **Original FluidTouch**: Created by jeyeager65
- **FluidNC**: CNC firmware by bdring
- **Home Assistant**: Open source home automation
- **LVGL**: Embedded graphics library (original UI)
- **Express.js**: Web framework
- **ws**: WebSocket library

## Support

For support:
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and community help
- Home Assistant Community: Integration discussions

---

**Happy CNCing!** 🔧✨
