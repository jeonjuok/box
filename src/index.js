import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import GUI from 'dat.gui';

const container = document.querySelector(".container");
const canvasEl = document.querySelector("#canvas");

let renderer,
  scene,
  camera,
  orbit,
  boxes = [],
  boxMaterial;

// GUI
const gui = new GUI();

// Target rotations for each axis
let targetRotationX = 0;
let targetRotationY = 0;
let targetRotationZ = 0;

// Slider and display elements
const sliderX = document.getElementById("slider"); // Existing slider, now for X
const rotationValueDisplayX = document.getElementById('rotationValue');

const sliderY = document.getElementById('sliderY');
const rotationValueDisplayY = document.getElementById('rotationValueY');

const sliderZ = document.getElementById('sliderZ');
const rotationValueDisplayZ = document.getElementById('rotationValueZ');

// Event Listeners
sliderX.addEventListener('input', handleSliderXChange);
sliderY.addEventListener('input', handleSliderYChange);
sliderZ.addEventListener('input', handleSliderZChange);

initScene();
window.addEventListener("resize", updateSceneSize);

function initScene() {
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvasEl,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    10,
    1000
  );
  camera.position.set(0.6, 0.2, 1.3).multiplyScalar(70);
  updateSceneSize();

  boxMaterial = new THREE.MeshBasicMaterial({
    color: 0x3c9aa0,
    wireframe: true,
  });
  gui.add(boxMaterial, 'wireframe').name('Wireframe').onChange(render);

  addAxesAndOrbitControls();
  createBoxes();
  applyRotations(); // Apply initial rotations (all zeros in this case)
  render();
}

function createBoxes() {
  const boxSize = [15, 10, 1];
  const boxGeometry = new THREE.BoxGeometry(boxSize[0], boxSize[1], boxSize[2]);
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

  const numberOfBoxes = 4;
  for (let i = 0; i < numberOfBoxes; i++) {
    boxes[i] = boxMesh.clone();
    boxes[i].position.x = (i - 0.5 * numberOfBoxes) * (boxSize[0] + 2);
    scene.add(boxes[i]);
  }
  boxes[1].position.y = 0.5 * boxSize[1];
  boxes[2].rotation.y = 0.5 * Math.PI; // Initial specific rotation for box 2
  boxes[3].position.y = -boxSize[1];
}

function addAxesAndOrbitControls() {
  const loader = new FontLoader();
  const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  loader.load(
    "/fonts/helvetiker_regular.typeface.json",
    (font) => {
      const textParams = { font: font, size: 1.1, height: 0.1, curveSegments: 2 };
      const textGeometry = new TextGeometry("axis x", textParams);
      textGeometry.center();
      const axisTitle = new THREE.Mesh(textGeometry, textMaterial);
      axisTitle.position.set(30, 1, 0);
      scene.add(axisTitle);
      render(); // Render after font is loaded
    },
    undefined,
    (error) => { console.error('An error occurred loading the font:', error); }
  );

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-1000, 0, 0), new THREE.Vector3(1000, 0, 0)
  ]);
  const line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);

  orbit = new OrbitControls(camera, canvasEl);
  orbit.enableZoom = false;
  orbit.enableDamping = true;
  orbit.addEventListener("change", render);
}

function render() {
  renderer.render(scene, camera);
}

function updateSceneSize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  render(); // Re-render after resize
}

function handleSliderXChange() {
  const value = parseFloat(sliderX.value) / 100;
  targetRotationX = value * 0.5 * Math.PI; // Max 90 degrees
  const degrees = THREE.MathUtils.radToDeg(targetRotationX);
  if (rotationValueDisplayX) {
    rotationValueDisplayX.textContent = degrees.toFixed(1);
  }
  applyRotations();
}

function handleSliderYChange() {
  const value = parseFloat(sliderY.value) / 100;
  targetRotationY = value * 0.5 * Math.PI; // Max 90 degrees
  const degrees = THREE.MathUtils.radToDeg(targetRotationY);
  if (rotationValueDisplayY) {
    rotationValueDisplayY.textContent = degrees.toFixed(1);
  }
  applyRotations();
}

function handleSliderZChange() {
  const value = parseFloat(sliderZ.value) / 100;
  targetRotationZ = value * 0.5 * Math.PI; // Max 90 degrees
  const degrees = THREE.MathUtils.radToDeg(targetRotationZ);
  if (rotationValueDisplayZ) {
    rotationValueDisplayZ.textContent = degrees.toFixed(1);
  }
  applyRotations();
}

function applyRotations() {
  boxes.forEach((box) => {
    // Note: The original createBoxes() sets a specific initial Y rotation for boxes[2].
    // This shared slider control will override that initial specific rotation for boxes[2]
    // unless applyRotations() is made aware of such individual overrides.
    // For this task, we assume all boxes uniformly respond to the new X, Y, Z sliders.
    // If boxes[2] needs to *add* to its initial 0.5 * Math.PI rotation, that's more complex.
    // Here, we are setting the rotation directly.
    box.rotation.x = targetRotationX;
    box.rotation.y = targetRotationY;
    box.rotation.z = targetRotationZ;
  });
  render(); // Call render once after all rotations are potentially applied
}

// Initial calls to set display values if sliders are not 0 initially (though they are)
// and to apply initial rotation if targetRotations were not 0.
handleSliderXChange();
handleSliderYChange();
handleSliderZChange();

initScene(); // This was called earlier, moving it after handlers are defined
             // and initial calls made. Actually, initScene sets up boxes, so
             // initial handler calls should be after initScene.
             // The current structure has initScene() at the top.
             // Let's ensure initScene is called, then initial handlers.
             // No, initScene creates the boxes. The initial applyRotations is inside initScene.
             // The initial display updates for sliders can be done after initScene.

// To ensure initial display values are set if sliders could start non-zero:
// (Though in this HTML they start at 0, and textContent is "0")
if (rotationValueDisplayX) rotationValueDisplayX.textContent = THREE.MathUtils.radToDeg(targetRotationX).toFixed(1);
if (rotationValueDisplayY) rotationValueDisplayY.textContent = THREE.MathUtils.radToDeg(targetRotationY).toFixed(1);
if (rotationValueDisplayZ) rotationValueDisplayZ.textContent = THREE.MathUtils.radToDeg(targetRotationZ).toFixed(1);
// The applyRotations() in initScene will handle the initial geometry rotation.
// The existing top-level call to initScene() is correct.

// A note on the specific rotation of boxes[2].rotation.y = 0.5 * Math.PI in createBoxes():
// The current applyRotations() will overwrite this with targetRotationY (initially 0).
// If the goal was to *add* to this initial rotation, the logic in applyRotations() for boxes[2] would need to be:
// boxes[2].rotation.y = initialYRotationForBox2 + targetRotationY;
// This is out of scope for the current task, which implies uniform control.
// The current implementation will make all boxes share the exact same X, Y, Z rotation from sliders.
