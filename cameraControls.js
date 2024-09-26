import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.119/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.119/examples/jsm/controls/OrbitControls.js';

export function setupCameraAndControls(camera, renderer, scene) {
    // Camera setup
    camera.position.set(0, -15, 10);
    camera.up.set(0, 0, 1);  // Z-axis is up
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Orbit Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enablePan = true;
    controls.maxPolarAngle = Math.PI;

    return controls;
}
