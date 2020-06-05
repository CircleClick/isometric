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

class Cube {
	constructor (x = 0, y = 0, z = 0) {
		this.group = new THREE.Group();
		this.group.position.x = x;
		this.group.position.y = y;
		this.group.position.z = z;
		this.group.rotation.y = Math.PI;

		const distFromCenter = getDist(0,0,x,y)
		this.distFromCenter = distFromCenter;

		if (distFromCenter < dullDistance) {
			const chance = distFromCenter/dullDistance;
			this.leftPlane = new THREE.Mesh(planeGeom, RandomMaterial(chance*chance*chance));
			this.rightPlane = new THREE.Mesh(planeGeom, RandomMaterial(chance*chance*chance));
			this.topPlane = new THREE.Mesh(planeGeom, RandomMaterial(chance*chance*chance));
		} else {
			this.leftPlane = new THREE.Mesh(planeGeom, DullMaterial());
			this.rightPlane = new THREE.Mesh(planeGeom, DullMaterial());
			this.topPlane = new THREE.Mesh(planeGeom, DullMaterial());
		}

		this.leftPlane.neighbors = new Array();
		this.leftPlane.position.x = -0.3523;
		this.leftPlane.position.z = -0.3523;
		this.leftPlane.rotation.y = Math.PI / 4;
		this.leftPlane.rotation.y += Math.PI;
		this.group.add(this.leftPlane);

		this.rightPlane.neighbors = new Array();
		this.rightPlane.position.x = 0.3523;
		this.rightPlane.position.z = -0.3523;
		this.rightPlane.rotation.y = -Math.PI / 4;
		this.rightPlane.rotation.y += Math.PI;
		this.group.add(this.rightPlane);

		this.topPlane.neighbors = new Array();
		this.topPlane.position.x = 0;
		this.topPlane.position.y = +0.5;
		this.topPlane.rotation.x = Math.PI / 2;
		this.topPlane.rotation.z = Math.PI / 4;
		this.topPlane.rotation.y = Math.PI;
		this.group.add(this.topPlane);


		this.leftPlane.restingPosition = this.leftPlane.position;
		this.leftPlane.restingRotation = this.leftPlane.rotation;

		this.rightPlane.restingPosition = this.rightPlane.position;
		this.rightPlane.restingRotation = this.rightPlane.rotation;

		this.topPlane.restingPosition = this.topPlane.position;
		this.topPlane.restingRotation = this.topPlane.rotation;


		this.timeUntilAnimationStart = distFromCenter*0.25;
		this.animationProgress = -distFromCenter*0.2;
	}

	tick (delta) {
		this.animationProgress += delta;

		let animationBounded = this.animationProgress;
		while(animationBounded > 3) {
			animationBounded -= 3;
		}
		if (animationBounded >= 2) {
			const anim = animationBounded - 2;

			this.topPlane.position.y = this.topPlane.restingPosition.y + (0.01 * Math.sin(Math.PI*(anim)*2));
			this.rightPlane.position.x = this.rightPlane.restingPosition.x + (0.01 * Math.sin(Math.PI*(anim)*2));
			this.leftPlane.position.x = this.leftPlane.restingPosition.x + (0.01 * Math.sin(Math.PI*-(anim)*2));
		}
	}
}

const cubes_x = 10;
const cubes_y = 7;
const dullDistance = 3;
const cubesArray = new Array();
let facesArray = new Array();
for (let y = 0; y < cubes_y; y++) {
	for (let x = 0; x < cubes_x; x++) {
		
		const xx = ((x - cubes_x / 2) + (y % 2 !== 0 ? 0.5 : 0)) * 1.41;
		const yy = (y - cubes_y / 2);
		const zz = -(y - cubes_y / 2) / 1.42;

		const cube = new Cube(xx,yy,zz);
		scene.add(cube.group);

		facesArray.push(cube.leftPlane, cube.rightPlane, cube.topPlane);
		cubesArray.push(cube);
	}
}

facesArray = facesArray.sort((a,b) => {
	return getDist(a.position.x, a.position.y, 0, 0) - getDist(b.position.x, b.position.y, 0, 0)
})

scene.updateMatrixWorld();

/*for (let i = 0; i < facesArray.length; i++) {
	const face = facesArray[i];
	setTimeout(()=>{
		face.ztarget = face.position.z;
		face.position.z += 100;
	}, i*250)
}*/

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

let lastFrame = Date.now();
const draw = () => {
	requestAnimationFrame(draw);

	const delta = Math.min(1, (Date.now() - lastFrame)/1000);
	lastFrame = Date.now();

	for (let index = 0; index < facesArray.length; index++) {
		const element = facesArray[index];
		element.material.color.set(0xffffff);
	}
	for (let index = 0; index < cubesArray.length; index++) {
		const cube = cubesArray[index];
		cube.tick(delta);
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