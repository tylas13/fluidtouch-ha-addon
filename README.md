# FluidTouch Web - Home Assistant Add-on Repository

[![Home Assistant Add-on](https://img.shields.io/badge/Home%20Assistant-Add--on-blue.svg)](https://www.home-assistant.io/)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

A web-based CNC controller for FluidNC machines, running as a Home Assistant Add-on.

## Installation

### Add Repository to Home Assistant

1. Click the button below or manually add the repository:

   [![Add Repository](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Ftylas13%2FFluidTouch)

2. Or manually:
   - Go to **Settings** → **Add-ons** → **Add-on Store**
   - Click the **⋮** menu (top right) → **Repositories**
   - Add: `https://github.com/tylas13/FluidTouch`

3. Find **FluidTouch Web** in the add-on store
4. Click **Install**
5. Configure and start the add-on

## Add-ons in This Repository

### FluidTouch Web

Web-based CNC controller for FluidNC machines with real-time control, jogging, probing, file management, and macros.

**Features:**
- 🌐 Web-based interface (works on any device)
- 🔌 WebSocket connection to FluidNC
- 🎮 Intuitive jog controls with virtual pad
- 📏 Automated touch probe operations
- 📁 File browser (SD card and Flash storage)
- ⚡ Quick macros (9 per machine)
- 💻 G-code console
- 🖥️ Multi-machine support
- 📱 Responsive design

## Documentation

Full documentation is available in the [fluidtouch-web folder](fluidtouch-web/README.md).

## Support

- **Issues**: [GitHub Issues](https://github.com/tylas13/FluidTouch/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tylas13/FluidTouch/discussions)

## License

MIT License - See [LICENSE](LICENSE) for details

## Credits

Based on [FluidTouch](https://github.com/jeyeager65/FluidTouch) by jeyeager65
