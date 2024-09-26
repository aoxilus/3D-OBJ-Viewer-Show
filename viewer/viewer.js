import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.119/build/three.module.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.119/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.119/examples/jsm/controls/OrbitControls.js';

document.addEventListener("DOMContentLoaded", function () {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1000 / 700, 0.1, 1000);
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
    let currentSlideIndex = 0;
    let slides = [];
    let arrows = [];  // Store references to the arrows in the scene

    const plainGrayMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        metalness: 0,
        roughness: 1,
        emissive: 0x000000,
        side: THREE.DoubleSide
    });

    // Fetch slide data from load_slides.php
    const filePath = 'load_slides.php';
    console.log('Fetching slide data from:', filePath);

    fetch(filePath)
        .then(response => response.json())
        .then(fetchedSlides => {
            // Log the JSON data to the console for inspection
            console.log('Fetched Slides JSON:', fetchedSlides);

            slides = fetchedSlides;
            populateCarousel();
            loadSlide(slides[currentSlideIndex]); // Load the first slide initially
        })
        .catch(error => {
            console.error('Error loading slides:', error);
        });

    // Function to load a specific slide
    function loadSlide(slide) {
        const filePath = `../object_files/${slide.fileName}`;

        fetch(filePath)
            .then(response => response.text())
            .then(objData => {
                const objLoader = new OBJLoader();
                const object = objLoader.parse(objData);

                if (loadedObject) {
                    scene.remove(loadedObject); // Remove previous object
                }
                loadedObject = object;

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

                camera.position.set(slide.cameraPosition.x, slide.cameraPosition.y, slide.cameraPosition.z);
                camera.lookAt(object.position);
                controls.target.copy(object.position);

                if (marker) {
                    scene.remove(marker);
                }

                const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
                const markerMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                    transparent: true,
                    opacity: 0.35
                });

                marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.position.set(slide.markerPosition.x, slide.markerPosition.y, slide.markerPosition.z);
                scene.add(marker);

                // Remove any previous arrows
                arrows.forEach(arrow => scene.remove(arrow));
                arrows = [];  // Clear the array

                // Check if the slide contains arrows
                if (slide.arrows && slide.arrows.length > 0) {
                    slide.arrows.forEach(arrowData => {
                        const start = new THREE.Vector3(arrowData.start.x, arrowData.start.y, arrowData.start.z);
                        const end = new THREE.Vector3(arrowData.end.x, arrowData.end.y, arrowData.end.z);
                        drawArrow(start, end);
                    });
                }

                document.getElementById('description').innerText = slide.description;

            })
            .catch(error => {
                console.error('Error loading model:', error);
                alert('Error loading model.');
            });
    }

    // Function to draw the arrow between two points
    function drawArrow(start, end) {
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const length = start.distanceTo(end);
        const arrowHelper = new THREE.ArrowHelper(direction, start, length, 0xffff00, 0.2 * length, 0.1 * length);
        scene.add(arrowHelper);
        arrows.push(arrowHelper);  // Keep track of the arrows

        // Add debug points at start and end
        drawDebugPoint(start, 0x00ff00);  // Green sphere for start
        drawDebugPoint(end, 0xff0000);    // Red sphere for end

        // Debugging: Log start and end positions of the arrow
        console.log('Drawing arrow from', start, 'to', end);
    }

    // Function to draw a small sphere at a point for debugging
    function drawDebugPoint(position, color = 0x0000ff) {
        const geometry = new THREE.SphereGeometry(0.05, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(position);
        scene.add(sphere);
    }

    // Populate the carousel with slides
    function populateCarousel() {
        const carouselSlides = document.getElementById('carousel-slides');
        carouselSlides.innerHTML = ''; // Clear previous slides

        slides.forEach((slide, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.classList.add('carousel-slide');
            slideDiv.innerText = slide.description || `Slide ${index + 1}`;
            slideDiv.dataset.index = index;

            slideDiv.addEventListener('click', function () {
                currentSlideIndex = index;
                loadSlide(slides[currentSlideIndex]); // Load the clicked slide
            });

            carouselSlides.appendChild(slideDiv);
        });
    }

    // Handle Previous/Next buttons
    document.getElementById('prev-slide').addEventListener('click', () => {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            loadSlide(slides[currentSlideIndex]);  // Load previous slide
        }
    });

    document.getElementById('next-slide').addEventListener('click', () => {
        if (currentSlideIndex < slides.length - 1) {
            currentSlideIndex++;
            loadSlide(slides[currentSlideIndex]);  // Load next slide
        }
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
});
