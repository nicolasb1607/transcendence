import type { coords } from '../types/utils';
import { AmbientLight, DirectionalLight } from 'three';

const getAmbientLight = () => {
	const ambientLight = new AmbientLight(0xffffff, 0.2);
	return (ambientLight);
}

const setShadowMap = (light:DirectionalLight) => {
	light.castShadow = true;
	
	light.shadow.mapSize.width = 1024; // Width of the shadow map
	light.shadow.mapSize.height = 1024; // Height of the shadow map
	light.shadow.camera.near = 0.01; // Near plane of the shadow camera
	light.shadow.camera.far = 500; // Far plane of the shadow camera
	light.shadow.camera.left = -200; // Left boundary of the shadow frustum
	light.shadow.camera.right = 200; // Right boundary of the shadow frustum
	light.shadow.camera.top = 200; // Top boundary of the shadow frustum
	light.shadow.camera.bottom = -200; // Bottom boundary of the shadow frustum
}

const getSunLight = (sunLightPos: coords) => {
	const sunLight = new DirectionalLight(0xffffff, 0.7);
	sunLight.position.set(sunLightPos.x, sunLightPos.y, sunLightPos.z);
	setShadowMap(sunLight);
	sunLight.target.position.set(-20, 50, -20);
	return (sunLight);
}

export { getAmbientLight, getSunLight };