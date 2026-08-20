/**
 * annotations.js — two-click 3D arrows on the model (ArrowHelper).
 * 🥑 by aoxilus · CC BY-NC-SA 4.0
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.119/build/three.module.js';

let scene, camera, renderer, controls;
let annotationsEnabled = false;
let points = [];
export let arrowPositions = [];  // Export arrowPositions to be used in loader.js
let arrows = [];

// Initialize the scene for annotations
export function initScene(existingScene, existingCamera, existingRenderer, existingControls) {
    scene = existingScene;
    camera = existingCamera;
    renderer = existingRenderer;
    controls = existingControls;
}

// Toggle annotations mode
export function toggleAnnotations() {
    annotationsEnabled = !annotationsEnabled;
    points = [];
    console.log(`Annotations mode is now ${annotationsEnabled ? 'enabled' : 'disabled'}`);
}

// Draw the 3D arrow between two points using THREE.ArrowHelper
export function drawArrow(start, end) {
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    const length = start.distanceTo(end);

    const arrowHeadLength = 0.2 * length;  
    const arrowHeadWidth = 0.1 * length;   

    const arrowHelper = new THREE.ArrowHelper(direction, start, length, 0xffff00, arrowHeadLength, arrowHeadWidth);
    
    scene.add(arrowHelper);
    console.log("Arrow Start:", start);
    console.log("Arrow End:", end);

    arrows.push(arrowHelper);
    arrowPositions.push({ start: start.clone(), end: end.clone() });
}

// Delete all arrows
export function deleteAllArrows() {
    arrows.forEach(arrow => scene.remove(arrow));
    arrows = [];
    arrowPositions = [];
    console.log('All arrows deleted');
}

// Handle mouse clicks when annotations mode is enabled
export function handleAnnotations(event) {
    if (!annotationsEnabled) return;

    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(scene.getObjectByName('loadedObject'), true);

    if (intersects.length > 0) {
        const intersectPoint = intersects[0].point;
        points.push(intersectPoint);

        console.log("Intersect Point:", intersectPoint);

        if (points.length === 2) {
            drawArrow(points[0], points[1]);
            points = [];
        }
    } else {
        console.log("No intersection detected with the object.");
    }
}
