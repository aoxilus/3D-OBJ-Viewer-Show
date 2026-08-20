/**
 * axesIndicator.js — RGB XYZ ArrowHelpers attached to the model.
 * 🥑 by aoxilus · CC BY-NC-SA 4.0
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.119/build/three.module.js';

export function createAxesIndicator(object) {
    const length = 1.5;
    const headLength = 0.3;
    const headWidth = 0.2;

    // X-axis (Red)
    const xArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), length, 0xff0000, headLength, headWidth);

    // Y-axis (Green)
    const yArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), length, 0x00ff00, headLength, headWidth);

    // Z-axis (Blue)
    const zArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), length, 0x0000ff, headLength, headWidth);

    // Add the arrows to the object so they move with it
    object.add(xArrow);
    object.add(yArrow);
    object.add(zArrow);
}
