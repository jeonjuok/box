import * as THREE from "three";

//장면 설정
const scene = new THREE.Scene();

//카메라 설정
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

//랜더 설정
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//큐브 설정
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const cube = new THREE.Mesh(geometry, material);

//신에 큐브를 추가
scene.add(cube);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);

  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  cube.rotation.z += 0.01;

  renderer.render(scene, camera);
}
animate();
