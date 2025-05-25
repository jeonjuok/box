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
  boxMaterial; // Declare boxMaterial globally

// GUI
const gui = new GUI();

// 슬라이더 엘리먼트를 가져옵니다.
const slider = document.getElementById("slider");
const rotationValueDisplay = document.getElementById('rotationValue'); // Get reference to the new span
slider.addEventListener("input", handleSliderChange);

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

  // Initialize boxMaterial before createBoxes
  boxMaterial = new THREE.MeshBasicMaterial({
    color: 0x3c9aa0,
    wireframe: true,
  });

  // Add GUI control for wireframe
  gui.add(boxMaterial, 'wireframe').name('Wireframe').onChange(render);


  addAxesAndOrbitControls();

  createBoxes();

  render();
}

function createBoxes() {
  const boxSize = [15, 10, 1];
  // boxMaterial is now global
  const boxGeometry = new THREE.BoxGeometry(boxSize[0], boxSize[1], boxSize[2]);
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

  const numberOfBoxes = 4;
  for (let i = 0; i < numberOfBoxes; i++) {
    boxes[i] = boxMesh.clone();
    boxes[i].position.x = (i - 0.5 * numberOfBoxes) * (boxSize[0] + 2);
    scene.add(boxes[i]);
  }
  // Adjust position of the second box upwards
  boxes[1].position.y = 0.5 * boxSize[1];
  // Rotate the third box on its Y-axis
  boxes[2].rotation.y = 0.5 * Math.PI;
  // Adjust position of the fourth box downwards
  boxes[3].position.y = -boxSize[1];
}

function addAxesAndOrbitControls() {
  const loader = new FontLoader();
  const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  loader.load(
    "/fonts/helvetiker_regular.typeface.json",
    (font) => {
      const textParams = {
        font: font,
        size: 1.1,
        height: 0.1,
        curveSegments: 2,
      };
      {
        const textGeometry = new TextGeometry("axis x", textParams);
        textGeometry.center();
        const axisTitle = new THREE.Mesh(textGeometry, textMaterial);
        axisTitle.position.set(30, 1, 0);
        scene.add(axisTitle);
      }
      render();
    },
    undefined, // onProgress callback
    (error) => {
      console.error('An error occurred loading the font:', error);
    }
  );

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1000, 0, 0),
      new THREE.Vector3(1000, 0, 0),
    ]);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
  }

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
  renderer.render(scene, camera);
}

function handleSliderChange() {
  const value = parseFloat(slider.value) / 100;

  const targetRotation = value * 0.5 * Math.PI; // This is in radians
  boxes.forEach((box) => {
    box.rotation.x = targetRotation;
  });

  // Convert radians to degrees for display
  const degrees = THREE.MathUtils.radToDeg(targetRotation);
  // Update the text content of the span
  if (rotationValueDisplay) { // Ensure the element exists
    rotationValueDisplay.textContent = degrees.toFixed(1);
  }

  renderer.render(scene, camera);
}

initScene();
