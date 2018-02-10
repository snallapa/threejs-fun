import * as THREE from 'three';

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
const geometry = new THREE.Geometry();

const circles = 30;
const pointsOnCircles = 30;

const tubeSize = 1;
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
    geometry.faces.push(new THREE.Face3(j + currentCircle,
      currentCircle + nextPointIndex,
      nextCircle + nextPointIndex));
  }
}
geometry.computeBoundingSphere();

const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
const sphere = new THREE.Mesh( geometry, material );
sphere.position.set(0,2,0);
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
directionalLight.position.set( -1.5, 3, 0 );
scene.add( directionalLight );
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
const d = 5;
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

camera.position.z = 10;

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
  sphere.rotation.x += 0.003;
  //sphere.rotation.y += 0.01;
}
animate();
