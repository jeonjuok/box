import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'dat.gui';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
const speed = 0.01; // Adjusted speed for better observation

// --- Global Animation State Variables ---
let isPaused = false;
let isFoldingTarget = false; // false = target is unfolded, true = target is folded
let currentAnimationDirection = 'unfolding'; // 'unfolding' or 'folding'
let animationStage = 'primary_folding'; // Defines the current step in the animation sequence
let currentAnimatingChildIndex = 1;   // Index of the face currently being animated
let currentRotationAmount = 0;      // Accumulated rotation for the current step (0 to PI/2)

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

// --- dat.GUI Setup ---
const gui = new GUI();
const animationControls = {
    playPause: function() {
        isPaused = !isPaused;
    },
    foldUnfold: function() {
        isFoldingTarget = !isFoldingTarget;
        animationControls.reset();
        // isPaused is true from reset, user needs to press play to start the new direction.
    },
    reset: function() {
        isPaused = true;
        currentRotationAmount = 0;
        unfoldedCube.rotation.set(0, 0, 0); // Stop group rotation

        if (isFoldingTarget) { // Target: Folded Cube
            currentAnimationDirection = 'folding';
            // Set faces to their fully UNfolded state to animate towards folded
            faceConfigs.forEach((config, index) => {
                const pivot = unfoldedCube.children[index];
                if (index === 0) { // Base face
                    pivot.rotation.set(0, 0, 0);
                } else if (index >= 1 && index <= 4) { // Faces 1-4
                    pivot.rotation[config.rotationAxis] = Math.PI / 2;
                } else if (index === 5) { // Face 5 (tail)
                    pivot.rotation[config.rotationAxis] = Math.PI; // Fully unfolded (2 * PI/2 rotations)
                }
            });
            animationStage = 'folding_face5_step1'; // Start by folding the tail's second part
            currentAnimatingChildIndex = 5;
        } else { // Target: Unfolded Net
            currentAnimationDirection = 'unfolding';
            // Set faces to their fully FOLDED state (all rotations 0) to animate towards unfolded
            faceConfigs.forEach((config, index) => {
                unfoldedCube.children[index].rotation.set(0, 0, 0);
            });
            animationStage = 'primary_folding';
            currentAnimatingChildIndex = 1; // Start unfolding with face 1
        }
        renderer.render(scene, camera);
    }
};

gui.add(animationControls, 'playPause').name('Play/Pause');
gui.add(animationControls, 'foldUnfold').name('Fold/Unfold Target');
gui.add(animationControls, 'reset').name('Reset Current Animation');


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);

    if (isPaused) {
        controls.update(); // Allow camera control even when paused
        renderer.render(scene, camera);
        return;
    }

    controls.update();

    if (currentAnimationDirection === 'unfolding') {
        if (animationStage === 'primary_folding') {
            if (currentAnimatingChildIndex < unfoldedCube.children.length) { // children 1 to 5
                const pivot = unfoldedCube.children[currentAnimatingChildIndex];
                const config = faceConfigs[currentAnimatingChildIndex];
                if (currentRotationAmount < Math.PI / 2) {
                    pivot.rotation[config.rotationAxis] += speed;
                    currentRotationAmount += speed;
                } else {
                    pivot.rotation[config.rotationAxis] = Math.PI / 2;
                    currentRotationAmount = 0;
                    currentAnimatingChildIndex++;
                    if (currentAnimatingChildIndex === unfoldedCube.children.length) { // Reached child 6 (index 5)
                        animationStage = 'last_face_second_fold';
                    }
                }
            }
        } else if (animationStage === 'last_face_second_fold') { // Unfolding face 5's second PI/2 part
            const pivot = unfoldedCube.children[5]; // child 5
            const config = faceConfigs[5];
            if (currentRotationAmount < Math.PI / 2) { // This makes it go from PI/2 to PI
                pivot.rotation[config.rotationAxis] += speed;
                currentRotationAmount += speed;
            } else {
                pivot.rotation[config.rotationAxis] = Math.PI;
                currentRotationAmount = 0;
                animationStage = 'unfolded_complete';
            }
        } else if (animationStage === 'unfolded_complete') {
            // Continuous rotation of the fully unfolded net
            unfoldedCube.rotation.x += 0.005;
            unfoldedCube.rotation.y += 0.005;
            unfoldedCube.rotation.z += 0.005;
        }
    } else if (currentAnimationDirection === 'folding') {
        if (animationStage === 'folding_face5_step1') { // Fold face 5 from PI to PI/2
            const pivot = unfoldedCube.children[5];
            const config = faceConfigs[5];
            if (currentRotationAmount < Math.PI / 2) {
                pivot.rotation[config.rotationAxis] = Math.PI - currentRotationAmount;
                currentRotationAmount += speed;
            } else {
                pivot.rotation[config.rotationAxis] = Math.PI / 2;
                currentRotationAmount = 0;
                animationStage = 'folding_face5_step2';
            }
        } else if (animationStage === 'folding_face5_step2') { // Fold face 5 from PI/2 to 0
            const pivot = unfoldedCube.children[5];
            const config = faceConfigs[5];
            if (currentRotationAmount < Math.PI / 2) {
                pivot.rotation[config.rotationAxis] = (Math.PI / 2) - currentRotationAmount;
                currentRotationAmount += speed;
            } else {
                pivot.rotation[config.rotationAxis] = 0;
                currentRotationAmount = 0;
                animationStage = 'folding_faces_4_to_1';
                currentAnimatingChildIndex = 4; // Start folding face 4 next
            }
        } else if (animationStage === 'folding_faces_4_to_1') {
            if (currentAnimatingChildIndex >= 1) { // Fold faces 4 down to 1
                const pivot = unfoldedCube.children[currentAnimatingChildIndex];
                const config = faceConfigs[currentAnimatingChildIndex];
                if (currentRotationAmount < Math.PI / 2) {
                    pivot.rotation[config.rotationAxis] = (Math.PI / 2) - currentRotationAmount;
                    currentRotationAmount += speed;
                } else {
                    pivot.rotation[config.rotationAxis] = 0;
                    currentRotationAmount = 0;
                    currentAnimatingChildIndex--;
                    if (currentAnimatingChildIndex < 1) {
                        animationStage = 'folded_complete';
                    }
                }
            }
        }
        // No group rotation when in 'folded_complete' state or during folding.
    }
    renderer.render(scene, camera);
}

animationControls.reset(); // Set initial state based on isFoldingTarget (false by default)
isPaused = true; // Start paused
animate();
