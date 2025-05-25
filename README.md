# Three.js Exploration Project

This project contains various scenes and examples built with Three.js.
The main application is managed by Vite, and there are also several standalone demo files.

## Getting Started

### Prerequisites

*   Node.js and npm (or yarn) must be installed.

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```

## Main Vite Application

The primary application in this project is `index.html` which uses `src/index.js`. It demonstrates a scene with boxes controlled by a slider.

### Running the Vite App

To run the main Vite application:

```bash
npm run dev
# or
# yarn dev
```
This will typically start a development server, and you can open the displayed URL (e.g., `http://localhost:5173`) in your browser.

## Other Demos

This project also includes other standalone HTML files demonstrating various Three.js features, such as:
*   An unfolding cube animation (`main.js` - currently not linked directly from an HTML, but code is present)
*   Polyhedron viewers (`polyhedron.html`, `polyhedrons.html`)
*   A 2D shape display (`polyhedron-2d.html`)
*   A basic spinning cube test (`test.html`)

These files can be opened directly in a browser, but for a more consistent experience and proper dependency management, they are being reviewed for potential integration into the Vite build process or a structured demo suite. Functionality and accuracy of these demos vary (see code review suggestions for details).

## Suggestions Implemented So Far
As part of an ongoing review and improvement process, the following initial changes have been made:
- Fixed a JavaScript error in `polyhedron.html`.
- Corrected misleading HTML titles in `test.html` and `polyhedron-2d.html`.
- Improved UI text and added a slider label in `index.html`.
- Removed a `console.log` statement from `src/index.js`.
- Deleted potential experimental/unused files (`main-1.js`, `main-2.js`).
- Cleaned up extensive commented-out code in `main.js`.
