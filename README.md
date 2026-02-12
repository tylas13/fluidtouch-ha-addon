# FluidTouch Web - Home Assistant Add-on

A web-based CNC controller for FluidNC machines, converted from the original FluidTouch ESP32 application to run as a Home Assistant Add-on.

## Features

- 🌐 **Web-Based Interface** - Control your CNC from any browser
- 🔌 **WebSocket Connection** - Real-time communication with FluidNC
- 🎮 **Full Control** - Jogging, probing, file management, and macros
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🏠 **Home Assistant Integration** - Native add-on with ingress support
- 💾 **Persistent Storage** - Machine configurations saved across restarts

## Installation

### Method 1: Add Repository to Home Assistant

1. In Home Assistant, navigate to **Supervisor** → **Add-on Store**
2. Click the three dots in the top right corner
3. Select **Repositories**
4. Add this repository URL: `https://github.com/yourusername/fluidtouch-ha-addon`
5. Find "FluidTouch Web" in the add-on store
6. Click **Install**

### Method 2: Manual Installation

1. Clone this repository
2. Copy the entire folder to `/addons/fluidtouch-web/` in your Home Assistant configuration directory
3. Restart Home Assistant
4. Navigate to **Supervisor** → **Add-on Store**
5. Find "FluidTouch Web" under "Local add-ons"
6. Click **Install**

## Configuration

### Basic Setup

1. Start the add-on
2. Open the Web UI
3. Click "Add Machine" to configure your first CNC
4. Enter:
   - **Machine Name**: A friendly name for your CNC
   - **FluidNC Host**: IP address or hostname of your FluidNC controller
   - **WebSocket Port**: Usually 81 (for WebUI v2) or 80 (for FluidNC v4.0+)

### Advanced Configuration

Edit the add-on configuration in Home Assistant:

```yaml
fluidnc_host: "192.168.1.100"
fluidnc_port: 81
machines:
  - name: "My CNC Router"
    host: "192.168.1.100"
    port: 81
  - name: "Laser Engraver"
    host: "192.168.1.101"
    port: 81
```

## Usage

### Main Features

#### Status Tab
- Real-time machine state monitoring
- Position display (X, Y, Z axes)
- Feed rate and spindle speed
- Quick actions (Home, Feed Hold, Resume, Reset)
- Zero individual axes

#### Jog Tab
- Visual jog pad for XY movement
- Separate Z-axis controls
- Adjustable step sizes (0.1mm to 100mm)
- Configurable feed rate
- Home button for quick homing

#### Files Tab
- Browse SD card files
- Browse Flash storage files
- Run G-code files directly

#### Macros Tab
- Store up to 9 custom macros per machine
- Quick execution of repetitive tasks
- File-based macro support

#### Probe Tab
- Automated Z-axis probing
- Touch plate thickness compensation
- Corner probing (coming soon)
- Adjustable probe distance and feed rate

#### Console Tab
- Direct G-code command entry
- Real-time message display
- Command history
- FluidNC response monitoring

### Keyboard Shortcuts

- **Enter** in console: Send command
- **Arrow keys**: Quick jog (when jog tab is active)

### FluidNC Port Configuration

Different FluidNC versions use different WebSocket ports:

- **Port 80**: FluidNC v4.0+ (recommended for new installations)
- **Port 81**: WebUI v2 with FluidNC v3.x
- **Port 82**: WebUI v3 with FluidNC v3.x (allows clean connection switching)

## Architecture

### Components

```
fluidtouch-web/
├── config.yaml          # Home Assistant add-on config
├── Dockerfile           # Container build instructions
├── run.sh              # Startup script
├── package.json        # Node.js dependencies
├── server/
│   └── index.js        # Express + WebSocket server
└── public/
    ├── index.html      # Main web interface
    ├── css/
    │   └── styles.css  # UI styling
    └── js/
        └── app.js      # Client-side application logic
```

### Communication Flow

```
Browser ←→ WebSocket ←→ Node.js Server ←→ WebSocket ←→ FluidNC
```

1. Browser connects to Node.js server via WebSocket
2. Server maintains persistent connections to FluidNC machines
3. Commands from browser are forwarded to FluidNC
4. FluidNC responses are broadcast to all connected browsers
5. Real-time status updates every second

## Differences from Original FluidTouch

### What Changed
- **Platform**: ESP32 hardware → Web-based (Docker container)
- **UI Framework**: LVGL → HTML/CSS/JavaScript
- **Display**: 800×480 touchscreen → Responsive web design
- **Connection**: Direct serial/WiFi → WebSocket proxy
- **Storage**: ESP32 Flash/SD → Container volumes

### What Stayed
- Core functionality (jog, probe, files, macros, console)
- Multi-machine support
- FluidNC WebSocket protocol
- User interface design philosophy

### New Features
- Home Assistant integration
- Multi-user support (multiple browsers can connect)
- Persistent configuration storage
- Ingress support for secure access
- No hardware required

## Troubleshooting

### Cannot Connect to FluidNC
1. Verify FluidNC is powered on and connected to network
2. Check IP address/hostname is correct
3. Confirm WebSocket port (try 80, 81, or 82)
4. Ensure firewall allows WebSocket connections
5. Check Home Assistant can reach FluidNC network

### Add-on Won't Start
1. Check Home Assistant logs: **Supervisor** → **FluidTouch Web** → **Log**
2. Verify configuration syntax in add-on configuration
3. Ensure no port conflicts (port 8099)

### Status Not Updating
1. Verify WebSocket connection is established (check status badge)
2. Send manual `?` command in console
3. Check FluidNC is responding to WebSocket connections
4. Restart the add-on

### Commands Not Working
1. Confirm machine state (Idle, Run, etc.)
2. Check FluidNC console for error messages
3. Verify G-code syntax
4. Try simpler commands first (`?`, `$I`, etc.)

## Development

### Local Testing

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:8099
```

### Building for Home Assistant

```bash
# Build Docker image
docker build -t fluidtouch-web .

# Run container
docker run -p 8099:8099 -v $(pwd)/data:/data fluidtouch-web
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Credits

- **Original FluidTouch**: [jeyeager65/FluidTouch](https://github.com/jeyeager65/FluidTouch)
- **FluidNC**: [bdring/FluidNC](https://github.com/bdring/FluidNC)
- **Home Assistant**: [home-assistant.io](https://www.home-assistant.io/)

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/fluidtouch-ha-addon/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/fluidtouch-ha-addon/discussions)
- **Home Assistant Community**: [community.home-assistant.io](https://community.home-assistant.io/)
