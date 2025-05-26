import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'dat.gui';

// --- Global Variables ---
let scene, camera, renderer, controls, cubeMesh;
let gui;
const textureLoader = new THREE.TextureLoader();

const predefinedColors = {
    'Default Blue': '#0077ff', 'Red': '#ff0000', 'Green': '#00ff00',
    'Yellow': '#ffff00', 'Purple': '#800080', 'White': '#ffffff', 'Black': '#000000'
};
const predefinedTextureURLs = {
    'None': '', 'Wood Crate': 'https://threejs.org/examples/textures/crate.gif',
    'Brick Wall': 'https://threejs.org/examples/textures/brick_diffuse.jpg',
    'Checkerboard': 'https://threejs.org/examples/textures/checker.png'
};

const boxDimensions = { length: 1, width: 1, depth: 1 };
const materialProps = {
    selectedColorPreset: 'Default Blue', color: predefinedColors['Default Blue'],
    roughness: 0.5, metalness: 0.3,
    selectedTexturePreset: 'None', textureURL: predefinedTextureURLs['None'],
    textureRepeatX: 1, textureRepeatY: 1, textureOffsetX: 0, textureOffsetY: 0
};
const shapeProps = { currentShape: 'Box' };

// --- Placeholder Function for Save State ---
function saveEditorState() {
    // 1. Collect all relevant state into a single object
    const editorState = {
        shape: shapeProps.currentShape, // From shapeProps
        dimensions: { // From boxDimensions
            length: boxDimensions.length,
            width: boxDimensions.width,
            depth: boxDimensions.depth
        },
        material: { // From materialProps
            selectedColorPreset: materialProps.selectedColorPreset,
            color: materialProps.color,
            roughness: materialProps.roughness,
            metalness: materialProps.metalness,
            selectedTexturePreset: materialProps.selectedTexturePreset,
            textureURL: materialProps.textureURL,
            textureRepeatX: materialProps.textureRepeatX,
            textureRepeatY: materialProps.textureRepeatY,
            textureOffsetX: materialProps.textureOffsetX,
            textureOffsetY: materialProps.textureOffsetY
        }
        // Add any other relevant state here in the future
    };

    // 2. Convert this state object to a JSON string
    const jsonString = JSON.stringify(editorState, null, 2); // null, 2 for pretty printing

    // 3. Trigger a download of this JSON string as a file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'box_editor_config.json'; // Filename for the download
    document.body.appendChild(a); // Required for Firefox
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Editor state saved:', editorState);
}

// --- Shape, Geometry, Material, Texture Update Functions ---
function changeShape() {
    console.log('Shape changed to:', shapeProps.currentShape);
    updateBoxGeometry(); 
    render();
}

function updateBoxGeometry() {
    if (!cubeMesh) { 
        console.error("cubeMesh not initialized before updateBoxGeometry call");
        return;
    }
    if (cubeMesh.geometry) {
        cubeMesh.geometry.dispose();
    }
    let newGeometry;
    if (shapeProps.currentShape === 'Box') {
        newGeometry = new THREE.BoxGeometry(
            Math.max(0.01, boxDimensions.length), Math.max(0.01, boxDimensions.width), Math.max(0.01, boxDimensions.depth)
        );
    } else if (shapeProps.currentShape === 'Sphere') {
        const radius = boxDimensions.width / 2;
        const widthSegments = Math.max(3, Math.floor(boxDimensions.length * 5));
        const heightSegments = Math.max(2, Math.floor(boxDimensions.depth * 5));
        newGeometry = new THREE.SphereGeometry(Math.max(0.01, radius), widthSegments, heightSegments);
    } else if (shapeProps.currentShape === 'Cylinder') {
        const radiusTop = boxDimensions.width / 2;
        const radiusBottom = boxDimensions.width / 2;
        const height = boxDimensions.length;
        const radialSegments = Math.max(3, Math.floor(boxDimensions.depth * 5));
        newGeometry = new THREE.CylinderGeometry(
            Math.max(0.01, radiusTop), Math.max(0.01, radiusBottom), Math.max(0.01, height), radialSegments
        );
    } else {
        console.error("Unknown shape:", shapeProps.currentShape);
        newGeometry = new THREE.BoxGeometry(1,1,1);
    }
    cubeMesh.geometry = newGeometry;
    render();
}

function updateBoxMaterial() {
    if (!cubeMesh || !cubeMesh.material) return;
    cubeMesh.material.color.set(materialProps.color);
    cubeMesh.material.roughness = materialProps.roughness;
    cubeMesh.material.metalness = materialProps.metalness;
    render();
}

function updateTextureProperties() {
    if (cubeMesh && cubeMesh.material && cubeMesh.material.map) {
        const map = cubeMesh.material.map;
        map.wrapS = THREE.RepeatWrapping; map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(materialProps.textureRepeatX, materialProps.textureRepeatY);
        map.offset.set(materialProps.textureOffsetX, materialProps.textureOffsetY);
        render();
    }
}

function applyTexture() {
    if (!cubeMesh || !cubeMesh.material) { console.error("Cube mesh or material not ready."); return; }
    const url = materialProps.textureURL.trim();
    if (!url) {
        if (cubeMesh.material.map) { cubeMesh.material.map.dispose(); }
        cubeMesh.material.map = null; cubeMesh.material.needsUpdate = true; render(); return;
    }
    textureLoader.load(url,
        function (texture) {
            if (cubeMesh.material.map) { cubeMesh.material.map.dispose(); }
            cubeMesh.material.map = texture;
            cubeMesh.material.color.set(0xffffff);
            updateTextureProperties();
            cubeMesh.material.needsUpdate = true; render();
        },
        undefined,
        function (err) {
            console.error('An error occurred loading the texture:', err);
            if (cubeMesh.material.map) { cubeMesh.material.map.dispose(); }
            cubeMesh.material.map = null; cubeMesh.material.needsUpdate = true; render();
        }
    );
}

function removeTexture() {
    if (cubeMesh && cubeMesh.material && cubeMesh.material.map) {
        cubeMesh.material.map.dispose(); cubeMesh.material.map = null;
        cubeMesh.material.needsUpdate = true; materialProps.textureURL = '';
        cubeMesh.material.color.set(materialProps.color); render();
    }
}

// --- Initialization Function ---
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdedede);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 3);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5); scene.add(directionalLight);

    const material = new THREE.MeshStandardMaterial({
        color: materialProps.color, roughness: materialProps.roughness, metalness: materialProps.metalness
    });
    cubeMesh = new THREE.Mesh(undefined, material); scene.add(cubeMesh);
    updateBoxGeometry();

    gui = new GUI();

    const shapeFolder = gui.addFolder('Shape');
    shapeFolder.add(shapeProps, 'currentShape', ['Box', 'Sphere', 'Cylinder']).name('Select Shape').onChange(changeShape);
    shapeFolder.open();

    const dimFolder = gui.addFolder('Dimensions');
    dimFolder.add(boxDimensions, 'length', 0.1, 10, 0.1).name('Length/Radius').onChange(updateBoxGeometry);
    dimFolder.add(boxDimensions, 'width', 0.1, 10, 0.1).name('Height/Segments').onChange(updateBoxGeometry);
    dimFolder.add(boxDimensions, 'depth', 0.1, 10, 0.1).name('Depth/Segments').onChange(updateBoxGeometry);
    dimFolder.open();

    const matFolder = gui.addFolder('Material');
    matFolder.add(materialProps, 'selectedColorPreset', Object.keys(predefinedColors)).name('Color Preset')
        .onChange(function(value) {
            materialProps.color = predefinedColors[value]; updateBoxMaterial();
        });
    matFolder.addColor(materialProps, 'color').name('Box Color (Custom)').onChange(updateBoxMaterial);
    matFolder.add(materialProps, 'roughness', 0, 1, 0.01).name('Roughness').onChange(updateBoxMaterial);
    matFolder.add(materialProps, 'metalness', 0, 1, 0.01).name('Metalness').onChange(updateBoxMaterial);
    matFolder.add(materialProps, 'selectedTexturePreset', Object.keys(predefinedTextureURLs)).name('Texture Preset')
        .onChange(function(value) {
            materialProps.textureURL = predefinedTextureURLs[value]; applyTexture();
        });
    matFolder.add(materialProps, 'textureURL').name('Texture URL (Custom)');
    matFolder.add({ applyTexture: function() { applyTexture(); } }, 'applyTexture').name('Apply Custom Texture');
    matFolder.add({ removeTexture: function() { removeTexture(); } }, 'removeTexture').name('Remove Texture');
    matFolder.add(materialProps, 'textureRepeatX', 0.1, 10, 0.1).name('Repeat X').onChange(updateTextureProperties);
    matFolder.add(materialProps, 'textureRepeatY', 0.1, 10, 0.1).name('Repeat Y').onChange(updateTextureProperties);
    matFolder.add(materialProps, 'textureOffsetX', 0, 1, 0.01).name('Offset X').onChange(updateTextureProperties);
    matFolder.add(materialProps, 'textureOffsetY', 0, 1, 0.01).name('Offset Y').onChange(updateTextureProperties);
    matFolder.open();

    // Add Save State button to the main GUI object
    gui.add({ saveState: function() { saveEditorState(); } }, 'saveState').name('Save State');

    window.addEventListener('resize', onWindowResize);
    onWindowResize();
}

// --- Window Resize Handler & Render Function ---
function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    }
}
function render() {
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    if (controls) { controls.update(); }
    render();
}

// --- Execute ---
init();
animate();
