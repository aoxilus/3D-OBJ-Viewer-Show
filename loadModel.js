import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.119/build/three.module.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.119/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.119/examples/jsm/controls/OrbitControls.js';
import { createMarker, placeMarker, createAxesIndicator } from './marker.js';

document.addEventListener("DOMContentLoaded", function () {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1000 / 700, 0.1, 1000);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1000, 700);
    document.getElementById('object-container').appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    renderer.setClearColor(0x888888, 1);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    let loadedObject = null;
    let marker = null;
    let axesIndicator = null;

    const fileSelect = document.getElementById('file-select');
    loadFileOptions();

    fileSelect.addEventListener('change', function () {
        const selectedFile = fileSelect.value;
        if (selectedFile) {
            loadModel(selectedFile);
        }
    });

    document.getElementById('plain-view').addEventListener('click', function () {
        if (loadedObject) {
            loadedObject.traverse(function (child) {
                if (child.isMesh) {
                    child.material.wireframe = false;
                    child.material.needsUpdate = true;
                }
            });
        }
    });

    document.getElementById('wireframe-view').addEventListener('click', function () {
        if (loadedObject) {
            loadedObject.traverse(function (child) {
                if (child.isMesh) {
                    child.material.wireframe = true;
                    child.material.needsUpdate = true;
                }
            });
        }
    });

    // Add marker on right-click
    document.getElementById('object-container').addEventListener('contextmenu', function (event) {
        event.preventDefault();
        
        const mouse = new THREE.Vector2();
        mouse.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.offsetY / renderer.domElement.clientHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(loadedObject, true);
        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point;
            if (!marker) {
                marker = createMarker();  // Create the marker
            }
            placeMarker(loadedObject, marker, scene, camera, renderer);
        }
    });

    function loadFileOptions() {
        fetch('list_files.php')
            .then(response => response.json())
            .then(files => {
                const fileSelect = document.getElementById('file-select');
                fileSelect.innerHTML = '<option value="">Select a file</option>';
                files.forEach(file => {
                    const option = document.createElement('option');
                    option.value = file;
                    option.text = file;
                    fileSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching file list:', error));
    }

    function loadModel(fileName) {
        const filePath = `object_files/${fileName}`;
        fetch(filePath)
            .then(response => response.text())
            .then(objData => {
                const objLoader = new OBJLoader();
                const object = objLoader.parse(objData);
                
                if (loadedObject) {
                    scene.remove(loadedObject);
                    if (axesIndicator) {
                        scene.remove(axesIndicator);  // Remove previous XYZ axes
                    }
                }
                loadedObject = object;

                const boundingBox = new THREE.Box3().setFromObject(object);
                const center = boundingBox.getCenter(new THREE.Vector3());
                const size = boundingBox.getSize(new THREE.Vector3());

                object.position.sub(center);
                object.scale.set(2 / size.length(), 2 / size.length(), 2 / size.length());
                scene.add(object);

                axesIndicator = createAxesIndicator(5);  // Add the XYZ axes
                scene.add(axesIndicator);

                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = camera.fov * (Math.PI / 180);
                let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov / 2));
                cameraZ *= 2.5;

                camera.position.set(0, 0, cameraZ);
                camera.lookAt(object.position);
                controls.target.copy(object.position);
            })
            .catch(error => console.error('Error loading model:', error));
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
});
