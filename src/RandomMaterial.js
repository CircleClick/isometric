import THREE from 'three.js';

const dullImages = [
	require('./img/border.png'),
	//require('./img/border2.png'),
];

const images = [
	require('./img/0.png'),
	require('./img/1.png'),
	require('./img/2.png'),
	require('./img/3.png'),
	require('./img/4.png'),
	require('./img/5.png'),
	require('./img/6.png'),
	require('./img/7.png'),
	require('./img/8.png'),
];

for (let index = 0; index < images.length; index++) {
	images[index] = new THREE.TextureLoader().load(images[index]);
}
for (let index = 0; index < dullImages.length; index++) {
	dullImages[index] = new THREE.TextureLoader().load(dullImages[index]);
}

const DullMaterial = (index = Math.floor(Math.random() * dullImages.length)) => {
	const texture = dullImages[index];
	return new THREE.MeshBasicMaterial({
		color: 0xffffff,
		map: texture,
		opacity: 0.5,
		transparent: true,
		//side: THREE.DoubleSide,
	});
}

const RandomMaterial = (chanceOfDull = 0.25) => {
	if (chanceOfDull && Math.random() < chanceOfDull) {
		return DullMaterial();
	} else {
		const texture = images[Math.floor(Math.random() * images.length)];
		return new THREE.MeshLambertMaterial({
			color: 0xffffff,
			map: texture,
			transparent: true,
			//side: THREE.DoubleSide,
		});
	}
}

module.exports = {
	RandomMaterial,
	DullMaterial
};
