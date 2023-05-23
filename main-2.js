import * as THREE from "three";

// 왼쪽 씬
const leftScene = new THREE.Scene();
const leftCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / 2 / window.innerHeight,
  0.1,
  1000
);

// 오른쪽 씬
const rightScene = new THREE.Scene();
const rightCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / 2 / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// 왼쪽 씬의 큐브
const leftCube = new THREE.Mesh(geometry, material);
leftScene.add(leftCube);

// 오른쪽 씬의 큐브
const rightCube = new THREE.Mesh(geometry, material);
rightScene.add(rightCube);

// 카메라 위치 설정
leftCamera.position.z = 5;
rightCamera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);

  // 왼쪽 씬의 큐브는 정면으로 고정된 상태로 유지됩니다.
  leftCube.rotation.x += 0.01;
  leftCube.rotation.y += 0.01;

  // 오른쪽 씬의 큐브는 회전합니다.
  rightCube.rotation.x += 0.01;
  rightCube.rotation.y += 0.01;

  // 렌더링
  renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
  renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight);
  renderer.setScissorTest(true);
  renderer.setClearColor(0xffffff);
  renderer.render(leftScene, leftCamera);

  renderer.setViewport(
    window.innerWidth / 2,
    0,
    window.innerWidth / 2,
    window.innerHeight
  );
  renderer.setScissor(
    window.innerWidth / 2,
    0,
    window.innerWidth / 2,
    window.innerHeight
  );
  renderer.setScissorTest(true);
  renderer.setClearColor(0x000000);
  renderer.render(rightScene, rightCamera);
}

animate();
