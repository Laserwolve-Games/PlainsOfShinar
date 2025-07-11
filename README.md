![Plains of Shinar Logo](images/logo.webp)

A 2D Action RPG (ARPG) made with [Pixi.js](https://pixijs.com/). A port of [DaggerQuest](https://github.com/Laserwolve-Games/DaggerQuest)

## 🎮 Features

- **Isometric 2D Graphics**: Beautiful isometric perspective with dynamic camera angles
- **Character Animation System**: Comprehensive sprite-based animations for player actions
- **Entity Management**: Modular entity system with collision detection and pathfinding
- **Web-Based**: Runs directly in modern web browsers with WebGPU support
- **Modular Architecture**: Clean separation of concerns with ES6 modules

## 🚀 Getting Started

### Prerequisites

- A modern web browser with WebGPU support (Chrome, Firefox, Safari, Edge)
- A local web server (for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Laserwolve-Games/PlainsOfShinar.git
cd PlainsOfShinar
```

2. Start a local web server:
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have serve installed)
npx serve .

# Using PHP
php -S localhost:8000
```

3. Open your browser and navigate to `http://localhost:8000`

## 🎯 Gameplay

Plains of Shinar features classic ARPG gameplay elements:

- **Movement**: Navigate through the isometric world
- **Combat**: Multiple attack animations including slashes, kicks, and ground slams
- **Character States**: Idle, walking, blocking, and various combat animations
- **Dynamic Shadows**: Real-time shadow rendering for immersive gameplay

## 🏗️ Architecture

### Core Components

- **`main.js`**: Entry point and game initialization
- **`globals.js`**: Global game state, utilities, and configuration
- **`entity.js`**: Base entity class with animation and collision systems
- **`player.js`**: Player-specific logic and controls
- **`pathfindingWorker.js`**: Web Worker for pathfinding calculations

### Key Features

- **Isometric Projection**: Custom isometric transformation system
- **Grid-Based Movement**: 64x64 cell grid system for positioning
- **Collision Detection**: SAT (Separating Axis Theorem) collision detection
- **Animation System**: Sprite sheet-based animation with multiple states
- **Asset Management**: Efficient loading and caching of game assets

## 🎨 Assets

The game includes comprehensive sprite sheets for character animations:

- **Idle**: Breathing and standing animations
- **Movement**: Walking animations with directional support
- **Combat**: Multiple attack types (upward slash, downward slash, kicks, ground slam)
- **Reactions**: Hit reactions, blocking, death animations
- **Special**: War cry and other special animations

Each animation includes both the character model and corresponding shadow sprites.

## 🔧 Configuration

Key configuration values in `globals.js`:

- **Layout**: 4096x2048 isometric layout
- **Cell Size**: 64x32 pixel cells
- **Isometry Factor**: 0.5 for proper isometric projection
- **Grid Size**: Dynamic based on layout dimensions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Follow the existing code style and structure
2. Test your changes thoroughly
3. Update documentation as needed
4. Ensure compatibility with modern browsers

## 📝 License

This project is licensed under the [AGPL 3.0 License](https://www.gnu.org/licenses/agpl-3.0.html.en) - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Original Game**: [DaggerQuest](https://github.com/Laserwolve-Games/DaggerQuest)
- **Game Engine**: [Pixi.js](https://pixijs.com/)
- **Developer**: [Laserwolve Games](https://github.com/Laserwolve-Games)

## 🎖️ Acknowledgments

- Built with [Pixi.js](https://pixijs.com/)
- Inspired by classic isometric ARPGs
- Part of the [Laserwolve Games](https://www.laserwolvegames.com/) portfolio