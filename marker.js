import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.119/build/three.module.js';

// Create a smaller, more transparent marker
export function createMarker() {
    console.log("Creating marker...");
    const markerGeometry = new THREE.SphereGeometry(0.25, 32, 32);  // Half the original size
    const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.35  // More transparent
    });

    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    console.log("Marker created:", marker);
    return marker;
}

// Place the marker on the object
export function placeMarker(object, marker, scene, camera, renderer) {
    console.log("Placing marker...");

    // Get the bounding box of the object to place the marker relative to it
    const boundingBox = new THREE.Box3().setFromObject(object);
    const objectSize = boundingBox.getSize(new THREE.Vector3());
    const objectCenter = boundingBox.getCenter(new THREE.Vector3());

    // Position the marker at the object's center, slightly above
    marker.position.set(objectCenter.x, objectCenter.y + objectSize.y / 2, objectCenter.z);  // Attach marker to the top of the object

    object.add(marker);  // Attach marker to the model (not the scene)

    console.log("Marker placed at:", marker.position);
    renderer.render(scene, camera);  // Render the scene with the marker attached
}
