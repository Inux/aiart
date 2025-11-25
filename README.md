# Pixel Canvas

A real-time pixel art canvas powered by Vue 3, ThreeJS, WebSockets, and Bun. Each pixel on the canvas fetches its color from a backend server via WebSocket connection, creating a dynamic, randomly colored pixel grid.

## Features

- **Full-screen pixel canvas** using ThreeJS for efficient rendering
- **Real-time WebSocket communication** between frontend and backend
- **Configurable pixel size** via the PIXEL_FACTOR constant
- **Automatic reconnection** when WebSocket connection is lost
- **Responsive design** that adapts to window resize
- **Random color generation** for each pixel from the backend

## Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **ThreeJS** - 3D graphics library for WebGL rendering
- **Vite** - Fast build tool and dev server
- **WebSocket API** - Real-time bidirectional communication

### Backend
- **Bun** - Fast JavaScript runtime and toolkit
- **WebSocket Server** - Built-in Bun WebSocket support

## Project Structure

```
aiart/
├── frontend/                 # Vue 3 frontend application
│   ├── src/
│   │   ├── components/
│   │   │   └── PixelCanvas.vue  # Main pixel canvas component
│   │   ├── App.vue           # Root Vue component
│   │   ├── main.js           # Vue app entry point
│   │   └── style.css         # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Bun backend server
│   ├── index.ts              # WebSocket server implementation
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                 # This file
```

## Configuration

### Pixel Factor

The pixel size can be configured in `/frontend/src/components/PixelCanvas.vue`:

```javascript
const PIXEL_FACTOR = 10; // Pixels per virtual pixel (higher = bigger pixels)
```

- **Lower values** (e.g., 5): More pixels, smaller individual pixels, more detailed grid
- **Higher values** (e.g., 20): Fewer pixels, larger individual pixels, blockier appearance

### WebSocket URL

The WebSocket server URL can be configured in the same file:

```javascript
const WS_URL = 'ws://localhost:3001/ws';
```

## Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **Bun** (v1.0 or higher)

Install Bun if you haven't already:
```bash
curl -fsSL https://bun.sh/install | bash
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd aiart
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd ../backend
bun install
```

## Running the Project

You'll need to run both the frontend and backend servers.

### Start the Backend (Terminal 1)

```bash
cd backend
bun run index.ts
```

The WebSocket server will start on `ws://localhost:3001/ws`

### Start the Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

The Vite dev server will start, typically on `http://localhost:5173`

### Access the Application

Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal).

You should see a full-screen canvas filled with randomly colored pixels!

## How It Works

### Frontend (PixelCanvas.vue)

1. **Initialization**
   - Calculates grid dimensions based on window size and PIXEL_FACTOR
   - Creates a ThreeJS orthographic camera and renderer
   - Generates a grid of plane geometries (pixels)

2. **WebSocket Connection**
   - Establishes WebSocket connection to backend
   - Sends `getPixelColor` requests for each pixel with x,y coordinates
   - Receives `pixelColor` responses and updates pixel colors

3. **Rendering**
   - Uses ThreeJS to render all pixels in a single draw call
   - Animation loop continuously renders the scene
   - Handles window resize events dynamically

### Backend (index.ts)

1. **WebSocket Server**
   - Listens for connections on port 3001
   - Handles `/ws` endpoint for WebSocket upgrades

2. **Message Processing**
   - Receives `getPixelColor` messages with x,y coordinates
   - Generates random RGB color values (0-255)
   - Sends back `pixelColor` response with color data

3. **Color Generation**
   - Currently generates completely random colors
   - Can be extended to implement patterns, algorithms, or user input

## Customization Ideas

### Backend Color Logic

Modify `/backend/index.ts` to implement different color patterns:

```javascript
// Gradient based on position
const r = Math.floor((x / cols) * 255);
const g = Math.floor((y / rows) * 255);
const b = 128;

// Checkerboard pattern
const isEven = (x + y) % 2 === 0;
const color = isEven ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };

// Time-based animation
const time = Date.now() / 1000;
const r = Math.floor(Math.sin(time + x * 0.1) * 127 + 128);
```

### Frontend Enhancements

- Add mouse interaction to change pixel colors on click
- Implement drawing tools
- Add color palette selection
- Create animation effects
- Add zoom and pan controls

## Performance Notes

- **Grid size**: Determined by `window size / PIXEL_FACTOR`
- **WebSocket messages**: One message per pixel on initial load
- **ThreeJS rendering**: Efficient GPU-accelerated rendering
- **Reconnection**: Automatic with 3-second delay

For a 1920x1080 window with PIXEL_FACTOR=10:
- Grid: 192x108 pixels = 20,736 pixels
- Initial WebSocket messages: 20,736
- Memory: Approximately 10-20MB

## License

MIT

## Contributing

Feel free to submit issues and pull requests!
