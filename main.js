import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Group to hold the faces of the cube
const unfoldedCube = new THREE.Group();

const size = 1;
const thickness = 0.1; // thickness of each face
const speed = 0.01; // rotation speed
const materials = [
  new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
  new THREE.MeshBasicMaterial({ color: 0x0000ff }),
  new THREE.MeshBasicMaterial({ color: 0xffff00 }),
  new THREE.MeshBasicMaterial({ color: 0xff00ff }),
  new THREE.MeshBasicMaterial({ color: 0x00ffff }),
];

// Positions and pivot points of the faces
const positions = [
  new THREE.Vector3(0, 0, 0), // 0
  new THREE.Vector3(0, size / 2, 0), // 1
  new THREE.Vector3(size / 2, 0, 0), // 2
  new THREE.Vector3(-size / 2, 0, 0), // 3
  new THREE.Vector3(0, -size / 2, 0), // 4
  new THREE.Vector3(0, -size - size / 2, 0), // 5
];
const pivots = [
  new THREE.Vector3(0, 0, 0), // 0
  new THREE.Vector3(0, -size / 2, 0), // 1
  new THREE.Vector3(-size / 2, 0, 0), // 2
  new THREE.Vector3(size / 2, 0, 0), // 3
  new THREE.Vector3(0, size / 2, 0), // 4
  new THREE.Vector3(0, size / 2, 0), // 5
];
const rotationAxes = [
  new THREE.Vector3(1, 0, 0), // 0
  new THREE.Vector3(1, 0, 0), // 1
  new THREE.Vector3(0, 1, 0), // 2
  new THREE.Vector3(0, 1, 0), // 3
  new THREE.Vector3(1, 0, 0), // 4
  new THREE.Vector3(1, 0, 0), // 5
];

// Create and position the faces
for (let i = 0; i < 6; i++) {
  const geometry = new THREE.BoxGeometry(size, size, thickness);
  const mesh = new THREE.Mesh(geometry, materials[i]);

  // Create a pivot object and add the mesh to it
  const pivot = new THREE.Object3D();
  pivot.add(mesh);

  // Set the pivot point to the appropriate edge of the face
  mesh.position.copy(pivots[i]);

  // Set the position of the pivot object
  pivot.position.copy(positions[i]);

  // Add the pivot object to the group
  unfoldedCube.add(pivot);
}

// Add the group to the scene
scene.add(unfoldedCube);

camera.position.z = 3;

let i = 1;
let t = 0;

function animate() {
  requestAnimationFrame(animate);

  if (i < unfoldedCube.children.length) {
    const pivot = unfoldedCube.children[i];
    pivot.rotation[rotationAxes[i].x === 1 ? "x" : "y"] += speed;
    t += speed;
    if (t >= Math.PI / 2) {
      t = 0;
      i++;
    }
  } else if (i === unfoldedCube.children.length) {
    // for last face, fold one more time
    const pivot = unfoldedCube.children[i - 1];
    pivot.rotation[rotationAxes[i - 1].x === 1 ? "x" : "y"] += speed;
    if (t >= Math.PI / 2) {
      t = 0;
      i++;
    }
  }

  unfoldedCube.rotation.x += 0.01;
  unfoldedCube.rotation.y += 0.01;
  unfoldedCube.rotation.z += 0.01;

  renderer.render(scene, camera);
}

animate();

// import * as THREE from "three";

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000
// );

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // Group to hold the faces of the cube
// const unfoldedCube = new THREE.Group();

// const size = 1;
// const thickness = 0.1; // thickness of each face
// const speed = 0.01; // rotation speed
// const materials = [
//   new THREE.MeshBasicMaterial({ color: 0xff0000 }),
//   new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
//   new THREE.MeshBasicMaterial({ color: 0x0000ff }),
//   new THREE.MeshBasicMaterial({ color: 0xffff00 }),
//   new THREE.MeshBasicMaterial({ color: 0xff00ff }),
//   new THREE.MeshBasicMaterial({ color: 0x00ffff }),
// ];

// // // Positions of the faces in cross shape
// // const positions = [
// //   new THREE.Vector3(0, 0, 0), // 0
// //   new THREE.Vector3(0, size, 0), // 1
// //   new THREE.Vector3(size, 0, 0), // 2
// //   new THREE.Vector3(-size, 0, 0), // 3
// //   new THREE.Vector3(0, -size, 0), // 4
// //   new THREE.Vector3(0, -size * 2, 0), // 5
// // ];

// // Positions of the faces in cross shape
// const positions = [
//   new THREE.Vector3(0, 0, thickness / 2), // 0
//   new THREE.Vector3(0, size, thickness / 2), // 1
//   new THREE.Vector3(size, 0, thickness / 2), // 2
//   new THREE.Vector3(-size, 0, thickness / 2), // 3
//   new THREE.Vector3(0, -size, thickness / 2), // 4
//   new THREE.Vector3(0, -size * 2, thickness / 2), // 5
// ];

// // Create and position the faces
// for (let i = 0; i < 6; i++) {
//   const geometry = new THREE.BoxGeometry(size, size, thickness);
//   const mesh = new THREE.Mesh(geometry, materials[i]);
//   mesh.position.copy(positions[i]);
//   unfoldedCube.add(mesh);
// }

// // Add the group to the scene
// scene.add(unfoldedCube);

// camera.position.z = 5;

// let i = 1;
// let t = 0;

// function animate() {
//   requestAnimationFrame(animate);

//   if (i < unfoldedCube.children.length) {
//     const mesh = unfoldedCube.children[i];
//     const prevMesh = unfoldedCube.children[i - 1];
//     mesh.rotation.x += speed;

//     // Move the pivot point to the edge of the previous face
//     mesh.position.y =
//       prevMesh.position.y + size / 2 - (size / 2) * Math.cos(mesh.rotation.x);
//     mesh.position.z =
//       prevMesh.position.z + (size / 2) * Math.sin(mesh.rotation.x);

//     t += speed;
//     if (t >= Math.PI / 2) {
//       t = 0;
//       i++;
//     }
//   } else if (i === unfoldedCube.children.length) {
//     // for last face, fold one more time
//     const mesh = unfoldedCube.children[i - 1];
//     mesh.rotation.y += speed;
//     if (t >= Math.PI / 2) {
//       t = 0;
//       i++;
//     }
//   }

// //   unfoldedCube.rotation.x += 0.01;
// //   unfoldedCube.rotation.y += 0.01;
// //   unfoldedCube.rotation.z += 0.01;

//   renderer.render(scene, camera);
// }

// animate();

// import * as THREE from "three";

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000
// );

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // Group to hold the faces of the cube
// const unfoldedCube = new THREE.Group();

// const size = 1;
// const thickness = 0.1; // thickness of each face
// const speed = 0.01; // rotation speed
// const materials = [
//   new THREE.MeshBasicMaterial({ color: 0xff0000 }),
//   new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
//   new THREE.MeshBasicMaterial({ color: 0x0000ff }),
//   new THREE.MeshBasicMaterial({ color: 0xffff00 }),
//   new THREE.MeshBasicMaterial({ color: 0xff00ff }),
//   new THREE.MeshBasicMaterial({ color: 0x00ffff }),
// ];

// // Positions of the faces in cross shape
// const positions = [
//   new THREE.Vector3(0, 0, thickness / 2), // 0
//   new THREE.Vector3(0, size, thickness / 2), // 1
//   new THREE.Vector3(size, 0, thickness / 2), // 2
//   new THREE.Vector3(-size, 0, thickness / 2), // 3
//   new THREE.Vector3(0, -size, thickness / 2), // 4
//   new THREE.Vector3(0, -size * 2, thickness / 2), // 5
// ];

// // Create and position the faces
// for (let i = 0; i < 6; i++) {
//   const geometry = new THREE.BoxGeometry(size, size, thickness);
//   const mesh = new THREE.Mesh(geometry, materials[i]);
//   mesh.position.copy(positions[i]);
//   unfoldedCube.add(mesh);
// }

// // Add the group to the scene
// scene.add(unfoldedCube);

// camera.position.z = 3;

// let i = 0;
// let t = 0;

// function animate() {
//   requestAnimationFrame(animate);

//   if (i < unfoldedCube.children.length) {
//     const mesh = unfoldedCube.children[i];
//     mesh.rotation.x += speed;
//     t += speed;
//     if (t >= Math.PI / 2) {
//       t = 0;
//       i++;
//     }
//   } else if (i === unfoldedCube.children.length) {
//     // for last face, fold one more time
//     const mesh = unfoldedCube.children[i - 1];
//     mesh.rotation.y += speed;
//     if (t >= Math.PI / 2) {
//       t = 0;
//       i++;
//     }
//   }

//   renderer.render(scene, camera);
// }

// animate();

// import * as THREE from "three";

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000
// );

// //const canvas = document.createElement("canvas");
// //document.body.appendChild(canvas);
// //const renderer = new THREE.WebGLRenderer({ canvas });

// //랜더 설정
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // Group to hold the faces of the cube
// const unfoldedCube = new THREE.Group();

// const size = 1.2;
// const thickness = 0.1; // thickness of each face
// const materials = [
//   new THREE.MeshBasicMaterial({ color: 0xff0000 }),
//   new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
//   new THREE.MeshBasicMaterial({ color: 0x0000ff }),
//   new THREE.MeshBasicMaterial({ color: 0xffff00 }),
//   new THREE.MeshBasicMaterial({ color: 0xff00ff }),
//   new THREE.MeshBasicMaterial({ color: 0x00ffff }),
// ];

// // Positions of the faces in cross shape
// //  1
// //3 0 2
// //  4
// //  5

// const positions = [
//   new THREE.Vector3(0, 0, 0), // 0
//   new THREE.Vector3(0, size, 0), // 1
//   new THREE.Vector3(size, 0, 0), // 2
//   new THREE.Vector3(-size, 0, 0), // 3
//   new THREE.Vector3(0, -size, 0), // 4
//   new THREE.Vector3(0, -size * 2, 0), // 5
// ];

// // Create and position the faces
// for (let i = 0; i < 6; i++) {
//   const geometry = new THREE.BoxGeometry(size, size, thickness); //
//   const mesh = new THREE.Mesh(geometry, materials[i]);
//   mesh.position.copy(positions[i]);
//   unfoldedCube.add(mesh);
// }

// // Add the group to the scene
// scene.add(unfoldedCube);

// camera.position.z = 5;

// function animate() {
//   requestAnimationFrame(animate);

//   unfoldedCube.rotation.x += 0.01;
//   unfoldedCube.rotation.y += 0.01;
//   unfoldedCube.rotation.z += 0.01;

//   renderer.render(scene, camera);
// }

// animate();
