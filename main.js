import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'dat.gui'; // Import dat.GUI

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const unfoldedCube = new THREE.Group();
const size = 1;
const thickness = 0.05;
const speed = 0.01;

let isPaused = false; // Animation state variable

const faceConfigs = [
  { id: 'face_0_base', color: 0x888888, initialPosition: new THREE.Vector3(0, 0, 0), pivotOffset: new THREE.Vector3(0, 0, 0), rotationAxis: 'x' },
  { id: 'face_1_top', color: 0xff0000, initialPosition: new THREE.Vector3(0, size / 2, 0), pivotOffset: new THREE.Vector3(0, -size / 2, 0), rotationAxis: 'x' },
  { id: 'face_2_right', color: 0x00ff00, initialPosition: new THREE.Vector3(size / 2, 0, 0), pivotOffset: new THREE.Vector3(-size / 2, 0, 0), rotationAxis: 'y' },
  { id: 'face_3_left', color: 0x0000ff, initialPosition: new THREE.Vector3(-size / 2, 0, 0), pivotOffset: new THREE.Vector3(size / 2, 0, 0), rotationAxis: 'y' },
  { id: 'face_4_bottom', color: 0xffff00, initialPosition: new THREE.Vector3(0, -size / 2, 0), pivotOffset: new THREE.Vector3(0, size / 2, 0), rotationAxis: 'x' },
  { id: 'face_5_tail', color: 0xff00ff, initialPosition: new THREE.Vector3(0, -size - size / 2, 0), pivotOffset: new THREE.Vector3(0, size / 2, 0), rotationAxis: 'x' }
];

faceConfigs.forEach(config => {
  const material = new THREE.MeshStandardMaterial({ color: config.color, metalness: 0.2, roughness: 0.7, side: THREE.DoubleSide });
  const geometry = new THREE.BoxGeometry(size, size, thickness);
  const mesh = new THREE.Mesh(geometry, material);
  const pivot = new THREE.Object3D();
  pivot.add(mesh);
  mesh.position.copy(config.pivotOffset);
  pivot.position.copy(config.initialPosition);
  unfoldedCube.add(pivot);
});
scene.add(unfoldedCube);

let currentAnimatingChildIndex = 1;
let currentRotationAmount = 0;
let animationStage = 'primary_folding';

// dat.GUI Setup
const gui = new GUI();
const animationControls = {
    playPause: function() {
        isPaused = !isPaused;
    },
    reset: function() {
        animationStage = 'primary_folding';
        currentAnimatingChildIndex = 1;
        currentRotationAmount = 0;
        isPaused = true; // Start paused on reset for manual play

        if (unfoldedCube && unfoldedCube.children.length === faceConfigs.length) {
            for (let i = 0; i < faceConfigs.length; i++) {
                const pivot = unfoldedCube.children[i];
                const config = faceConfigs[i];
                // Reset individual face rotations
                pivot.rotation.set(0,0,0); // Simpler to reset all axes
            }
        }
        unfoldedCube.rotation.set(0, 0, 0);
        // Explicitly call render to show the reset state immediately if paused
        renderer.render(scene, camera); 
    }
};

gui.add(animationControls, 'playPause').name('Play/Pause');
gui.add(animationControls, 'reset').name('Reset Animation');

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);

  if (isPaused) { // Check if animation is paused
    renderer.render(scene, camera); // Still render the scene for orbit controls
    return;
  }

  if (controls.enableDamping) {
    controls.update();
  }

  if (animationStage === 'primary_folding') {
    if (currentAnimatingChildIndex < unfoldedCube.children.length) {
      const pivot = unfoldedCube.children[currentAnimatingChildIndex];
      const config = faceConfigs[currentAnimatingChildIndex];
      if (currentRotationAmount < Math.PI / 2) {
        pivot.rotation[config.rotationAxis] += speed;
        currentRotationAmount += speed;
      } else {
        pivot.rotation[config.rotationAxis] = Math.PI / 2;
        currentRotationAmount = 0;
        currentAnimatingChildIndex++;
        if (currentAnimatingChildIndex === unfoldedCube.children.length) {
          animationStage = 'last_face_second_fold';
        }
      }
    }
  } else if (animationStage === 'last_face_second_fold') {
    const lastChildIndex = unfoldedCube.children.length - 1;
    const pivot = unfoldedCube.children[lastChildIndex];
    const config = faceConfigs[lastChildIndex];
    if (currentRotationAmount < Math.PI / 2) {
      pivot.rotation[config.rotationAxis] += speed;
      currentRotationAmount += speed;
    } else {
      pivot.rotation[config.rotationAxis] = Math.PI;
      currentRotationAmount = 0;
      animationStage = 'done';
    }
  }

  if (animationStage !== 'done') {
    unfoldedCube.rotation.x += 0.005;
    unfoldedCube.rotation.y += 0.005;
    unfoldedCube.rotation.z += 0.005;
  }

  renderer.render(scene, camera);
}

// Initialize the cube to its reset state
animationControls.reset(); 
isPaused = true; // Ensure it starts paused as per reset logic
animate();
