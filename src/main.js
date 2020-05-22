import THREE from 'three.js';

import { RandomMaterial, DullMaterial } from './RandomMaterial';

const scene = new THREE.Scene();

const frustumSize = 6;
let aspect = window.innerWidth / window.innerHeight;
//const camera = new THREE.PerspectiveCamera(72, window.innerHeight/window.innerWidth, 1, 1000);
const camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0, 1000);
camera.position.x = 0;
camera.position.y = 5;
camera.position.z = 5;
camera.rotation.x = -Math.PI / 4;
//camera.lookAt(0, 0, 0);

const dirlight = new THREE.DirectionalLight(0xffffff, 0.95);
dirlight.position.y = 1;
dirlight.position.x = 0.5;
dirlight.position.z = 0.75;
scene.add(dirlight);

const ambilight = new THREE.AmbientLight(0x606060);
scene.add(ambilight);

const planeGeom = new THREE.PlaneBufferGeometry(1, 1, 1, 1);

const getDist = function (ax, ay, bx, by, max = 0) {
	/*if (max > 0) {
		if (Math.abs(ax - bx) > max || Math.abs(ay - by) > max) {
			return false;
		}
	}*/
	const a = ax - bx;
	const b = ay - by;
	return Math.sqrt(a * a + b * b);
}

const cubes_x = 10;
const cubes_y = 6;
const dullDistance = 3;
const cubesArray = new Array();
const facesArray = new Array();
for (let y = 0; y < cubes_y; y++) {
	for (let x = 0; x < cubes_x; x++) {
		const group = new THREE.Group();
		group.position.x = ((x - cubes_x / 2) + (y % 2 !== 0 ? 0.5 : 0)) * 1.41;
		group.position.y = (y - cubes_y / 2);
		group.position.z = -(y - cubes_y / 2) / 1.42;
		group.neighbors = new Array();
		group.rotation.y = Math.PI;

		let leftPlane = null;
		let rightPlane = null;
		let topPlane = null;
		const distFromCenter = getDist(0,0,group.position.x,group.position.y)

		if (distFromCenter < dullDistance) {
			const chance = distFromCenter/dullDistance;
			leftPlane = new THREE.Mesh(planeGeom, RandomMaterial(chance*chance*chance));
			rightPlane = new THREE.Mesh(planeGeom, RandomMaterial(chance*chance*chance));
			topPlane = new THREE.Mesh(planeGeom, RandomMaterial(chance*chance*chance));
	
		} else {
			leftPlane = new THREE.Mesh(planeGeom, DullMaterial());
			rightPlane = new THREE.Mesh(planeGeom, DullMaterial());
			topPlane = new THREE.Mesh(planeGeom, DullMaterial());
		}

		leftPlane.neighbors = new Array();
		leftPlane.position.x = -0.3525;
		leftPlane.position.z = -0.3525;
		leftPlane.rotation.y = Math.PI / 4;
		leftPlane.rotation.y += Math.PI;
		group.add(leftPlane);

		rightPlane.neighbors = new Array();
		rightPlane.position.x = 0.3525;
		rightPlane.position.z = -0.3525;
		rightPlane.rotation.y = -Math.PI / 4;
		rightPlane.rotation.y += Math.PI;
		group.add(rightPlane);

		topPlane.neighbors = new Array();
		topPlane.position.x = 0;
		topPlane.position.y = +0.5;
		topPlane.rotation.x = Math.PI / 2;
		topPlane.rotation.z = Math.PI / 4;
		topPlane.rotation.y = Math.PI;
		group.add(topPlane);

		scene.add(group);
		/*for (let index = 0; index < cubesArray.length; index++) {
			const cube = cubesArray[index];
			if (getDist(cube.position.x, cube.position.y, group.position.x, group.position.y) < 2) {
				cube.neighbors.push(group);
				group.neighbors.push(cube);
			}
		}*/
		facesArray.push(leftPlane, rightPlane, topPlane);
		cubesArray.push(group);
	}
}

scene.updateMatrixWorld();

for (let i = 0; i < facesArray.length; i++) {
	const baseFace = facesArray[i];
	const vect = new THREE.Vector3();
	vect.setFromMatrixPosition(baseFace.matrixWorld);

	const maxDistance = 3;

	for (let o = 0; o < facesArray.length; o++) {
		if (o !== i) {
			const targetFace = facesArray[o];
			const t_vect = new THREE.Vector3();
			t_vect.setFromMatrixPosition(baseFace.matrixWorld);

			const dist = getDist(vect.x, vect.y, t_vect.x, t_vect.y, maxDistance);
			if (dist && dist < maxDistance) {
				baseFace.neighbors.push({
					mesh: targetFace,
					distance: 1 - dist / maxDistance,
				});
			}
		}
	}
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const onMouseMove = function (event) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('click', () => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(facesArray);
	for (let i = 0; i < intersects.length; i++) {
		intersects[i].object.material = RandomMaterial(false);
	}
})

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
scene.background = new THREE.Color(0xc4c4c4);
renderer.setClearColor(0xffffff, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
	//camera.aspect = window.innerWidth / window.innerHeight;

	aspect = window.innerWidth / window.innerHeight;

	camera.left = - frustumSize * aspect / 2;
	camera.right = frustumSize * aspect / 2;
	camera.top = frustumSize / 2;
	camera.bottom = - frustumSize / 2;

	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
})
document.body.appendChild(renderer.domElement);

const draw = () => {
	requestAnimationFrame(draw);

	for (let index = 0; index < facesArray.length; index++) {
		const element = facesArray[index];
		element.material.color.set(0xffffff);
	}

	/*raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(facesArray);
	for (let i = 0; i < intersects.length; i++) {
		intersects[i].object.material.color.set(0xff0000);
		//console.log(intersects[i].object.neighbors)
	}*/

	renderer.render(scene, camera);
}
draw();