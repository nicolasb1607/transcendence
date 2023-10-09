import { type ColorRepresentation, Color, DataTexture, FloatType, RGBAFormat } from "three";

/**
 * Create Three.js Texture, with linear
 * gradient from colorStart to colorEnd
 */
export function createGradientTexture(startColor:ColorRepresentation, endColor:ColorRepresentation):DataTexture {
	const width = 256;
	const height = 1;
	const gradientData = new Float32Array(width * height * 4);
	const colorStart = new Color(startColor);
	const colorEnd = new Color(endColor);

	for (let i = 0; i < width; i++) {
		const t = i / width;
		const gradientColor = new Color();
		gradientColor.lerpColors(colorStart, colorEnd, t);
		gradientData[i * 4] = gradientColor.r;
		gradientData[i * 4 + 1] = gradientColor.g;
		gradientData[i * 4 + 2] = gradientColor.b;
		gradientData[i * 4 + 3] = 1;
	}
	const gradientTexture = new DataTexture(gradientData, width, height, RGBAFormat, FloatType);
	gradientTexture.rotation = Math.PI / 12;
	gradientTexture.needsUpdate = true;
	return (gradientTexture);
}