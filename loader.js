import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.119/build/three.module.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.119/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.119/examples/jsm/controls/OrbitControls.js';
import { initScene as initAnnotations, toggleAnnotations, deleteAllArrows, handleAnnotations, arrowPositions } from './annotations.js';

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
    let markerPosition = null;
    let loadedFileName = "";
    let currentViewMode = "plain";

    const skyBlueMetallicMaterial = new THREE.MeshStandardMaterial({
        color: 0x87CEEB,
        metalness: 0.9,
        roughness: 0.2,
        emissive: 0x000000,
        side: THREE.DoubleSide
    });

    const plainGrayMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        metalness: 0,
        roughness: 1,
        emissive: 0x000000,
        side: THREE.DoubleSide
    });

    initAnnotations(scene, camera, renderer, controls);

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
                    child.material = plainGrayMaterial;
                    child.material.wireframe = false;
                    child.material.needsUpdate = true;
                }
            });
            currentViewMode = "plain";
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
            currentViewMode = "wireframe";
        }
    });

    document.getElementById('with-texture-view').addEventListener('click', function () {
        if (loadedObject) {
            loadedObject.traverse(function (child) {
                if (child.isMesh) {
                    child.material = skyBlueMetallicMaterial;
                    child.material.wireframe = false;
                    child.material.needsUpdate = true;
                }
            });
            currentViewMode = "texture";
        }
    });

    document.getElementById('toggle-annotations').addEventListener('click', function () {
        toggleAnnotations();
    });

    document.getElementById('delete-arrows').addEventListener('click', function () {
        deleteAllArrows();
        alert('All arrows deleted.');
    });

    renderer.domElement.addEventListener('mousedown', function (event) {
        if (event.button === 0) {  // Left-click only
            handleAnnotations(event);
        }
    });

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
            markerPosition = { x: intersectPoint.x, y: intersectPoint.y, z: intersectPoint.z };
            console.log('Marker Position:', markerPosition);

            if (!marker) {
                const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
                const markerMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                    transparent: true,
                    opacity: 0.35
                });
                marker = new THREE.Mesh(markerGeometry, markerMaterial);
                scene.add(marker);
            }

            marker.position.copy(intersectPoint);
        } else {
            alert("Right-click on the model to place a marker.");
        }
    });

    document.getElementById('store-slide').addEventListener('click', function () {
        const slideName = document.getElementById('slide-name').value;

        if (slideName && markerPosition) {
            const slideData = {
                fileName: loadedFileName,
                markerPosition: markerPosition,
                cameraPosition: {
                    x: camera.position.x,
                    y: camera.position.y,
                    z: camera.position.z
                },
                viewMode: currentViewMode,
                arrows: arrowPositions.map(arrow => ({
                    start: {
                        x: arrow.start.x,
                        y: arrow.start.y,
                        z: arrow.start.z
                    },
                    end: {
                        x: arrow.end.x,
                        y: arrow.end.y,
                        z: arrow.end.z
                    }
                })),
                description: slideName
            };

            const slideDataJSON = JSON.stringify(slideData, null, 2);
            console.log('Generated JSON:', slideDataJSON);

            fetch('save_slide.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: slideDataJSON
            })
            .then(response => response.text())
            .then(data => {
                alert('Slide stored successfully.');
            })
            .catch(error => {
                console.error('Error storing slide:', error);
                alert('Error storing slide.');
            });
        } else {
            alert("Please load a model, place a marker, and enter a slide name before storing.");
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
            .catch(error => {
                console.error('Error fetching file list:', error);
            });
    }

    function loadModel(fileName) {
        const filePath = `object_files/${fileName}`;
        loadedFileName = fileName;
        fetch(filePath)
            .then(response => response.text())
            .then(objData => {
                const objLoader = new OBJLoader();
                const object = objLoader.parse(objData);
                if (loadedObject) {
                    scene.remove(loadedObject);
                }
                loadedObject = object;
                loadedObject.name = 'loadedObject';

                object.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = plainGrayMaterial;
                        child.material.needsUpdate = true;
                    }
                });

                const boundingBox = new THREE.Box3().setFromObject(object);
                const center = boundingBox.getCenter(new THREE.Vector3());
                const size = boundingBox.getSize(new THREE.Vector3());

                object.position.sub(center);
                object.scale.set(2 / size.length(), 2 / size.length(), 2 / size.length());
                scene.add(object);

                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = camera.fov * (Math.PI / 180);
                let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov / 2));
                cameraZ *= 2.5;

                camera.position.set(0, 0, cameraZ);
                camera.lookAt(object.position);
                controls.target.copy(object.position);
                controls.minDistance = 1;
                controls.maxDistance = cameraZ * 3;

                alert('Model loaded successfully with plain material!');
            })
            .catch(error => {
                console.error('Error loading model:', error);
                alert('Error loading model.');
            });
    }

    function updateCameraInfo() {
        const cameraPos = document.getElementById('camera-pos');
        cameraPos.textContent = `X: ${camera.position.x.toFixed(2)}, Y: ${camera.position.y.toFixed(2)}, Z: ${camera.position.z.toFixed(2)}`;
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        updateCameraInfo();
        renderer.render(scene, camera);
    }
    animate();
});
