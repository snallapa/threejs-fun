import * as THREE from 'three';
import {TweenLite} from "gsap";

const FULL_CIRCLE = Math.PI * 2;

const scene = new THREE.Scene();
scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
scene.fog = new THREE.Fog( scene.background, 1, 1000 );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );


//I WILL ATTEMPT TO MAKE A TORUS
//success!
/*
const geometry = new THREE.Geometry();

const circles = 360;
const pointsOnCircles = 360;

const tubeSize = 0.5;
const radius = 3;

const vertices = [];

//create vertices

for (let i = 0; i < circles; i++) {
  for (let j = 0; j < pointsOnCircles; j++) {
    const tubeAngle = (i / circles) * FULL_CIRCLE;
    const circleAngle = (j / pointsOnCircles) * FULL_CIRCLE;
    const x = (radius + tubeSize * Math.cos(circleAngle)) * Math.cos(tubeAngle);
    const y = (radius + tubeSize * Math.cos(circleAngle)) * Math.sin(tubeAngle);
    const z = tubeSize * Math.sin(circleAngle);
    geometry.vertices.push(new THREE.Vector3(x, y, z));
  }
}

//create faces
for (let i = 0; i < circles; i++) {
  for (let j = 0; j < pointsOnCircles; j++) {
    const currentCircle = pointsOnCircles * i;
    const nextCircle = ((i + 1) % circles) * pointsOnCircles;
    const nextPointIndex = ((j + 1) % pointsOnCircles);

    //create a square with two triangle faces from one circle to the next

    geometry.faces.push(new THREE.Face3(j + currentCircle,
      nextCircle + j,
      nextCircle + nextPointIndex));
    geometry.faces.push(new THREE.Face3(currentCircle + nextPointIndex,
      j + currentCircle,
      nextCircle + nextPointIndex));

  }
}

geometry.computeBoundingSphere();
geometry.computeFaceNormals();
geometry.mergeVertices();
*/
//const geometry = new THREE.SphereGeometry(2,180, 180);
const circles = 128;
const pointsOnCircle = 12;
const geometry = new THREE.TorusGeometry(30, 0.5, pointsOnCircle, circles);
geometry.computeFaceNormals();
// color: 0x00ff00
const material = new THREE.MeshStandardMaterial( {color: 0x00ff00} );
const sphere = new THREE.Mesh( geometry, material );
sphere.position.set(0,1,0);
sphere.rotation.x = Math.PI / 2;
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add( sphere );

var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
hemiLight.position.set(0, 6, 0);
scene.add( hemiLight );

const hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 1 );
scene.add( hemiLightHelper );


const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );

directionalLight.color.setHSL( 0.1, 1, 0.95 );
directionalLight.position.set( -24, 24, 0 );
scene.add( directionalLight );
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
const d = 30;
directionalLight.shadow.camera.left = -d;
directionalLight.shadow.camera.right = d;
directionalLight.shadow.camera.top = d;
directionalLight.shadow.camera.bottom = -d
directionalLight.shadow.camera.far = 3500;
directionalLight.shadow.bias = -0.0001;
const directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight, 10 )
scene.add( directionalLightHelper );

const cameraHelper = new THREE.CameraHelper( directionalLight.shadow.camera );
scene.add( cameraHelper );

const groundGeo = new THREE.PlaneBufferGeometry( 1000, 1000 );
const groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
groundMat.color.setHSL( 0.095, 1, 0.75 );

const ground = new THREE.Mesh( groundGeo, groundMat );
ground.rotation.x = -Math.PI/2;
ground.position.y = -6;
ground.receiveShadow = true;
scene.add( ground );

camera.position.set(0,10,40);
camera.lookAt(new THREE.Vector3(0,0,0));

let isPlaying = false;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = circles * 2;
let frequencyArray = new Uint8Array(analyser.frequencyBinCount)
function playAudio(ab) {
  audioCtx.decodeAudioData(ab).then((buf) => {
    const source = audioCtx.createBufferSource();
    source.buffer = buf
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    source.start();
    animate()
  });
}

const reader = new FileReader();
reader.onload = () => playAudio(reader.result);

function handleFiles() {
  const audio = reader.readAsArrayBuffer(this.files[0]);
}

document.getElementById("music").addEventListener("change", handleFiles, false);

const vectors = sphere.geometry.vertices.length;
let random = Math.floor(Math.random() * vectors);
const original = sphere.geometry.vertices.map((item) => ({x: item.x, y: item.y, z: item.z}));

const update = () => { sphere.geometry.verticesNeedUpdate = true; };

function animateCircle(circleNumber, scalar) {
  const startVertex = circleNumber;
  for (let i = 0; i < pointsOnCircle; i++) {
    const currentVertexIndex = startVertex + i * circles;
    const currentVertex = sphere.geometry.vertices[currentVertexIndex];
    sphere.geometry.colors[startVertex + i * circleNumber] = new THREE.Color( 0xff0000 );
    const normal = sphere.geometry.faces.filter((face) => face.a === currentVertexIndex || face.b === currentVertexIndex)[0].normal;
    const origVector = new THREE.Vector3(original[currentVertexIndex].x, original[currentVertexIndex].y, original[currentVertexIndex].z)
    const next = origVector.add(normal.clone().multiplyScalar(scalar));
    //const next = currentVertex.clone().multiplyScalar(1.5);
    //console.log(circleNumber);
    currentVertex.x = next.x;
    currentVertex.y = next.y;
    currentVertex.z = next.z;

  }
}

function animate() {
	requestAnimationFrame( animate );
  const dataArray = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(dataArray)
  for (let i = 0; i < dataArray.length; i = i + 1) {
    animateCircle(i, dataArray[i] / 100)
  }
  update();
  renderer.render( scene, camera );
}

renderer.render( scene, camera );
