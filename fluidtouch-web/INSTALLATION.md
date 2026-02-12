# FluidTouch Web - Installation Guide

This guide will walk you through installing FluidTouch Web as a Home Assistant Add-on.

## Prerequisites

- Home Assistant installed and running (version 2023.1 or later recommended)
- Access to Home Assistant Supervisor
- FluidNC-based CNC machine connected to your network
- FluidNC WebSocket enabled

## Installation Steps

### Option 1: Install from Add-on Store (Recommended)

1. **Add Custom Repository**
   - Open Home Assistant web interface
   - Navigate to **Settings** → **Add-ons** → **Add-on Store**
   - Click the **three dots** (⋮) in the top right corner
   - Select **Repositories**
   - Click **Add** and enter: `https://github.com/yourusername/fluidtouch-ha-addon`
   - Click **Add** to confirm

2. **Install the Add-on**
   - Refresh the add-on store page
   - Find **FluidTouch Web** in the list
   - Click on it and select **Install**
   - Wait for installation to complete (this may take several minutes)

3. **Configure the Add-on**
   - After installation, go to the **Configuration** tab
   - Optionally set default FluidNC host and port:
     ```yaml
     fluidnc_host: "192.168.1.100"
     fluidnc_port: 81
     ```
   - Click **Save**

4. **Start the Add-on**
   - Go to the **Info** tab
   - Click **Start**
   - Enable **Start on boot** if you want it to start automatically
   - Enable **Show in sidebar** for quick access

5. **Access the Web UI**
   - Click **Open Web UI** or access via the sidebar
   - You should see the FluidTouch Web interface

### Option 2: Manual Installation

If you prefer to install manually or want to customize the add-on:

1. **SSH into Home Assistant**
   - Enable SSH in Home Assistant (via SSH & Web Terminal add-on)
   - Connect to your Home Assistant instance

2. **Download the Add-on**
   ```bash
   cd /addons
   git clone https://github.com/yourusername/fluidtouch-ha-addon.git fluidtouch-web
   ```

3. **Restart Home Assistant**
   - Settings → System → Restart

4. **Install from Local Add-ons**
   - Navigate to **Settings** → **Add-ons** → **Add-on Store**
   - Look for **FluidTouch Web** under "Local add-ons"
   - Click **Install**
   - Follow steps 3-5 from Option 1 above

## First-Time Setup

### Configure Your First Machine

1. **Open FluidTouch Web**
   - Access via Home Assistant sidebar or **Settings** → **Add-ons** → **FluidTouch Web** → **Open Web UI**

2. **Add a Machine**
   - Click **+ Add Machine**
   - Fill in the form:
     - **Machine Name**: Give your CNC a friendly name (e.g., "Workshop Router")
     - **FluidNC Host**: Enter the IP address or hostname
       - Find this in FluidNC web interface or your router's DHCP list
       - Examples: `192.168.1.100` or `fluidnc.local`
     - **WebSocket Port**: Select based on your FluidNC version:
       - `80` for FluidNC v4.0+
       - `81` for FluidNC v3.x with WebUI v2
       - `82` for FluidNC v3.x with WebUI v3
   - Click **Save**

3. **Connect to Your Machine**
   - Click on your newly added machine
   - Wait for connection status to show "Connected"
   - You should see real-time position and status updates

### Verify FluidNC WebSocket

Before connecting, ensure FluidNC WebSocket is accessible:

1. **Check FluidNC Web Interface**
   - Open FluidNC web interface in browser: `http://<fluidnc-ip>`
   - Verify you can control the machine

2. **Test WebSocket Connection**
   - Open browser console (F12)
   - Test connection:
     ```javascript
     const ws = new WebSocket('ws://192.168.1.100:81/ws');
     ws.onopen = () => console.log('Connected!');
     ws.onmessage = (e) => console.log('Message:', e.data);
     ```
   - You should see "Connected!" and status messages

## Network Configuration

### Same Network Setup

If Home Assistant and FluidNC are on the same network:
- Use FluidNC's local IP address (e.g., `192.168.1.100`)
- No additional configuration needed

### Different Networks Setup

If they're on different networks, you may need to:

1. **Configure Port Forwarding**
   - Forward FluidNC WebSocket port on your router
   - Use public IP or DynDNS hostname

2. **Use VPN**
   - Set up VPN between networks
   - Use FluidNC's VPN IP address

3. **Use Reverse Proxy** (Advanced)
   - Set up nginx or similar to proxy WebSocket connections
   - Configure SSL if accessing over internet

## Troubleshooting Installation

### Add-on Won't Install

**Check System Requirements:**
```bash
# SSH into Home Assistant
ha addons info local_fluidtouch-web
```

**View Installation Logs:**
- Settings → System → Logs
- Select "FluidTouch Web" from dropdown

**Common Issues:**
- Insufficient disk space: Clear old backups and snapshots
- Architecture mismatch: Verify your platform is supported
- Network issues: Check internet connectivity

### Add-on Won't Start

**Check Logs:**
```bash
ha addons logs local_fluidtouch-web
```

**Common Issues:**
- Port conflict: Ensure port 8099 is not in use
- Configuration error: Verify YAML syntax in configuration
- Missing dependencies: Reinstall the add-on

### Cannot Access Web UI

1. **Check Add-on Status**
   - Ensure add-on is running
   - Look for errors in logs

2. **Try Direct Access**
   - `http://<home-assistant-ip>:8099`
   - If this works but ingress doesn't, restart Home Assistant

3. **Check Ingress Configuration**
   - Settings → Add-ons → FluidTouch Web
   - Verify ingress is enabled in config.yaml

### Cannot Connect to FluidNC

**Verify Network Connectivity:**
```bash
# From Home Assistant SSH
ping <fluidnc-ip>
```

**Check FluidNC Status:**
- Access FluidNC web interface directly
- Verify WebSocket is enabled
- Check FluidNC firmware version

**Test WebSocket Connection:**
- Use browser developer tools
- Try different ports (80, 81, 82)

## Advanced Configuration

### Using HTTPS

To access FluidTouch Web over HTTPS:

1. Configure Home Assistant SSL
2. Access via: `https://<your-domain>/hassio/ingress/xxx`
3. Ingress handles SSL termination automatically

### Multiple FluidNC Machines

Add multiple machines in the web interface:
- Each machine can have different connection settings
- Switch between machines from the machine selection screen
- Configurations are stored persistently

### Custom Network Settings

Edit add-on configuration for advanced networking:

```yaml
fluidnc_host: ""  # Leave empty to configure in UI
fluidnc_port: 81
machines:
  - name: "Router"
    host: "192.168.1.100"
    port: 81
  - name: "Laser"
    host: "192.168.1.101"
    port: 80
```

## Backup and Restore

### Backup Configuration

Your machine configurations are automatically backed up with Home Assistant:
- Settings → System → Backups → Create backup
- Select "FluidTouch Web" to include in backup

### Restore Configuration

1. Restore Home Assistant backup
2. Reinstall FluidTouch Web add-on if needed
3. Configurations will be automatically restored

### Manual Backup

Configuration file location:
```
/data/config/fluidtouch.json
```

Copy this file to back up manually via SSH or File Editor add-on.

## Updating

### Automatic Updates

Enable automatic updates:
- Settings → Add-ons → FluidTouch Web
- Enable "Auto update"

### Manual Update

1. Settings → Add-ons → Add-on Store
2. Find FluidTouch Web
3. If update available, click **Update**
4. Wait for update to complete
5. Restart add-on

## Uninstalling

To remove FluidTouch Web:

1. **Stop the Add-on**
   - Settings → Add-ons → FluidTouch Web
   - Click **Stop**

2. **Uninstall**
   - Click **Uninstall**
   - Confirm deletion

3. **Remove Repository** (Optional)
   - Settings → Add-ons → Add-on Store
   - Three dots → Repositories
   - Remove FluidTouch Web repository

Note: Configuration data will be preserved in backups.

## Getting Help

If you encounter issues:

1. Check the logs in Home Assistant
2. Review this guide's troubleshooting section
3. Search existing GitHub issues
4. Create a new issue with:
   - Home Assistant version
   - Add-on version
   - FluidNC version
   - Error logs
   - Steps to reproduce

## Next Steps

Now that FluidTouch Web is installed:

- Read the [User Guide](USER_GUIDE.md) to learn all features
- Configure macros for repetitive tasks
- Set up probing for precise work coordinates
- Explore file management features

Happy CNCing! 🔧
