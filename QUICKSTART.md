# FluidTouch Web - Quick Start

## What You've Got

This is a complete Home Assistant Add-on that converts FluidTouch from an ESP32 hardware pendant to a web-based CNC controller.

## File Overview

```
fluidtouch-web/
├── config.yaml              ← Home Assistant add-on config
├── build.yaml              ← Docker build settings
├── Dockerfile              ← Container definition
├── run.sh                  ← Startup script
├── package.json            ← Node.js dependencies
├── server/
│   └── index.js           ← Backend server (WebSocket proxy)
└── public/
    ├── index.html         ← Web interface
    ├── css/styles.css     ← Styling
    └── js/app.js          ← Frontend logic
```

## Installation (3 Steps)

1. **Copy to Home Assistant**
   ```bash
   # Copy entire folder to:
   /addons/fluidtouch-web/
   ```

2. **Install Add-on**
   - Settings → Add-ons → Local add-ons
   - Click "FluidTouch Web"
   - Click Install

3. **Start & Configure**
   - Click Start
   - Open Web UI
   - Add your FluidNC machine (IP + port)

## Quick Test

Before installing in Home Assistant, test locally:

```bash
cd fluidtouch-web
npm install
node server/index.js
# Open http://localhost:8099
```

## Configuration

Edit `config.yaml` to set defaults:

```yaml
fluidnc_host: "192.168.1.100"  # Your FluidNC IP
fluidnc_port: 81                # WebSocket port
```

Or configure machines in the web UI.

## FluidNC Port Guide

- **Port 80**: FluidNC v4.0+
- **Port 81**: FluidNC v3.x + WebUI v2 (most common)
- **Port 82**: FluidNC v3.x + WebUI v3

## Features

✅ Real-time position display
✅ Jog controls (XYZ)
✅ Touch probe operations
✅ File browser (SD/Flash)
✅ Macro support (9 per machine)
✅ G-code console
✅ Multi-machine support
✅ Responsive design (works on phone/tablet/desktop)

## Documentation

- **README.md**: Main documentation
- **INSTALLATION.md**: Detailed installation guide
- **CONVERSION_GUIDE.md**: Technical details and customization
- **CHANGELOG.md**: Version history

## Troubleshooting

**Can't connect to FluidNC?**
- Verify IP address is correct
- Try different ports (80, 81, 82)
- Check FluidNC is on and accessible

**Add-on won't start?**
- Check Home Assistant logs
- Verify no port conflicts (8099)
- Try reinstalling the add-on

**Status not updating?**
- Check connection status badge
- Send manual `?` command in console
- Restart add-on

## Support

- Issues: Create GitHub issue
- Questions: GitHub Discussions
- Updates: Check changelog

---

**You're ready to go!** 🚀

Copy the `fluidtouch-web` folder to your Home Assistant add-ons directory and install it from the add-on store.
