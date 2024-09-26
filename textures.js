import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.119/build/three.module.js';

export function applyPlainMaterial(object) {
    if (!object) return;
    object.traverse(function (child) {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                metalness: 0,
                roughness: 1,
                emissive: 0x000000,
                side: THREE.DoubleSide
            });
        }
    });
}

export function applyWireframeMaterial(object) {
    object.traverse(function (child) {
        if (child.isMesh) {
            child.material.wireframe = true;
            child.material.needsUpdate = true;
        }
    });
}

export function applySkyBlueMaterial(object) {
    object.traverse(function (child) {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                color: 0x87CEEB,
                metalness: 0.9,
                roughness: 0.2,
                emissive: 0x000000,
                side: THREE.DoubleSide
            });
        }
    });
}
