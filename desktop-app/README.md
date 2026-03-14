# iTop Easy Desktop Clone

A desktop organizer application for Windows that helps you organize your desktop with customizable boxes, wallpapers, widgets, and AI assistant features.

![App Screenshot](screenshot.png)

## Features

### 📦 Boxes
- Create customizable boxes to organize your desktop icons
- Drag and drop files into boxes
- Customize box appearance (colors, transparency, fonts)
- Auto-arrange and align to grid
- Snapshot system for backup and restore

### 🖼️ Wallpapers
- Browse live and static wallpapers
- Multiple categories: Nature, City, Gaming, Abstract, etc.
- Create custom wallpapers
- Favorites and playlists

### 🎨 Personalization
- Multiple themes: Default, Dark, Light, Nature, Gaming, Professional
- Taskbar customization
- Start menu styles
- Desktop icon styles (Apple, Samsung, Circular, Square)
- Custom cursor styles

### 📱 Widgets
- Schedule - Event reminders
- iNotes - Quick notes
- Clock - Analog and digital styles
- Weather - Real-time weather updates
- Quick Tools - Instant feature access
- iPomodoro - Focus timer
- Chat AI - AI-powered chat assistant

### 🤖 AI Assistant
- ChatAI - Natural language conversations
- Smart Search - Search across desktop and files
- Screenshot - Capture and edit with AI
- Customizable hotkeys

## Installation

### Method 1: Using the Installer (Recommended)

1. Download the latest release from the [Releases](https://github.com/yourusername/itop-easy-desktop-clone/releases) page
2. Run `iTop-Easy-Desktop-Clone-Setup.exe`
3. Follow the installation wizard
4. The app will start automatically

### Method 2: Portable Version

1. Download `iTop-Easy-Desktop-Clone-Portable.exe`
2. Extract to any folder
3. Run `iTop Easy Desktop Clone.exe`

### Method 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/itop-easy-desktop-clone.git
cd itop-easy-desktop-clone

# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run build:win
```

## Usage

### Desktop Mode

To replace your Windows desktop with iTop Easy Desktop Clone:

1. Open the app
2. Click the **Desktop Mode** button in the sidebar (or right-click tray icon)
3. The app will stay on top of your desktop
4. Hide Windows desktop icons:
   - Right-click on desktop
   - Select **View** → **Show desktop icons** (uncheck)

### Creating Boxes

1. Go to the **Boxes** tab
2. Click **"Add a Box"**
3. Name your box and choose a color
4. Drag files from your desktop into the box

### Customizing Appearance

1. Go to **Personalization** tab
2. Select **Themes** to change the overall look
3. Customize taskbar, start menu, icons, and cursor

### Using Widgets

1. Go to **Widgets** tab
2. Toggle widgets on/off
3. Widgets appear on your desktop when enabled

### AI Assistant

1. Go to **AI Assistant** tab
2. Enable desired AI tools
3. Set custom hotkeys
4. Use hotkeys to quickly access AI features

## System Requirements

- Windows 10 or Windows 11
- 4GB RAM minimum (8GB recommended)
- 100MB free disk space
- Internet connection (for wallpapers and AI features)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Shift + C` | Open ChatAI |
| `Ctrl + Shift + S` | Open Smart Search |
| `Ctrl + Shift + A` | Take Screenshot |

## Auto-Start

The app can start automatically with Windows:

1. Go to **Settings** tab
2. Enable **"Auto-start with Windows"**

## System Tray

The app runs in the system tray:

- **Left-click**: Show/Hide app
- **Right-click**: Open menu with options

## Uninstallation

### If installed with installer:
1. Go to **Windows Settings** → **Apps**
2. Find "iTop Easy Desktop Clone"
3. Click **Uninstall**

### If using portable version:
1. Close the app (right-click tray icon → Quit)
2. Delete the app folder

## Development

### Project Structure

```
itop-easy-desktop-clone/
├── main.js              # Main Electron process
├── preload.js           # Preload script for IPC
├── package.json         # Project configuration
├── renderer/            # UI files
│   ├── index.html       # Main window
│   ├── box.html         # Desktop box window
│   ├── styles.css       # Styles
│   └── app.js           # UI logic
└── assets/              # Icons and images
```

### Technologies

- [Electron](https://www.electronjs.org/) - Desktop app framework
- HTML/CSS/JavaScript - Frontend
- Node.js - Backend

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Inspired by [iTop Easy Desktop](https://www.itopsoftware.com/user-manual/ied/)

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/yourusername/itop-easy-desktop-clone/issues) page.

---

**Note**: This is a clone/recreation of iTop Easy Desktop for educational purposes. Original software and trademarks belong to their respective owners.
