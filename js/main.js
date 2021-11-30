let scene;
let camera;
let renderer;

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js'

function init() {
    let container = document.querySelector('.container');

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#BED0E5");

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 3;
    //camera.lookAt(scene.position)

    // Render
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Orbit Control
    const controls = new OrbitControls(camera, renderer.domElement);
    //controls.update();
    controls.enableDamping = true;
    controls.minDistance = 10;

    // Light
    const ambient = new THREE.AmbientLight("#FFFFFF", .2);
    ambient.position.set(0, 300, 500);
    scene.add(ambient);

    let dirLight = new THREE.DirectionalLight("#ffffff", 1);
    dirLight.position.set(-30, 50, 30);
    scene.add(dirLight);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 7000;
    dirLight.shadow.mapSize.height = 7000;
    dirLight.shadow.camera.left = -5; // shadow viewing frustum
    dirLight.shadow.camera.right = 5; // shadow viewing frustum
    dirLight.shadow.camera.top = 5; // shadow viewing frustum
    dirLight.shadow.camera.bottom = -5; // shadow viewing frustum

    // Cube
    function createCube() {
        let cubeGeo = new THREE.BoxGeometry(2, 2, 2);
        let cubeMaterial = new THREE.MeshPhongMaterial({color: "#ffffff"});
        let cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
        cubeMesh.position.x = 0
        cubeMesh.position.y = 0.5
        cubeMesh.castShadow = true;
        cubeMesh.receiveShadow = true;
        scene.add(cubeMesh);

        cubeMesh.userData.draggable = true;
        cubeMesh.userData.name = "BOX";
    }

    // Sphere
    function createSphere() {
        let sphereGeo = new THREE.SphereGeometry(1, 32, 16);
        let sphereMaterial = new THREE.MeshPhongMaterial({color: "#ffffff"});
        let sphereMesh = new THREE.Mesh(sphereGeo, sphereMaterial);
        sphereMesh.position.x = 3
        sphereMesh.position.y = 0.5
        sphereMesh.castShadow = true;
        sphereMesh.receiveShadow = true;
        scene.add(sphereMesh);

        sphereMesh.userData.draggable = true;
        sphereMesh.userData.name = "SPHERE";
    }

    // Cone
    function createCone() {
        let coneGeo = new THREE.ConeGeometry(1, 2, 32);
        let coneMaterial = new THREE.MeshPhongMaterial({color: "#ffffff"});
        let coneMesh = new THREE.Mesh(coneGeo, coneMaterial);
        coneMesh.position.x = -3
        coneMesh.position.y = 0.5
        coneMesh.castShadow = true;
        coneMesh.receiveShadow = true;
        scene.add(coneMesh);

        coneMesh.userData.draggable = true;
        coneMesh.userData.name = "CONE";
    }

    window.addEventListener('resize', onResize, false)

    function createFloor() {
        let pos = {x: 0, y: -1, z: 0}
        let scale = {x: 100, y: 1, z: 100}

        // let floorMesh = new THREE.Mesh(
        //     new THREE.BoxBufferGeometry(),
        //     new THREE.MeshPhongMaterial({color: 0xf9c834})
        // );
        let floorPlane = new THREE.BoxGeometry(1, 1, 1);
        let floorMaterial = new THREE.MeshPhongMaterial({color: "#f9c834"});
        let floorMesh = new THREE.Mesh(floorPlane, floorMaterial);
        floorMesh.position.set(pos.x, pos.y, pos.z);
        //floorMesh.rotation.set(45, 0, 0);
        floorMesh.scale.set(scale.x, scale.y, scale.z);
        floorMesh.castShadow = true;
        floorMesh.receiveShadow = true;
        scene.add(floorMesh);

        floorMesh.userData.ground = true;
        floorMesh.userData.draggable = false;
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    const raycaster = new THREE.Raycaster();
    const clickMouse = new THREE.Vector2();
    const moveMouse = new THREE.Vector2();
    //var draggable: THREE.Object3D; // Typescript
    let draggable;

    window.addEventListener('click', e => {
        e.preventDefault();

        if (draggable) {
            console.log("drop object");

            draggable.material.color.setHex(0xFFFF00);
            draggable = null;
            return;
        }

        clickMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        clickMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(clickMouse, camera);
        const found = raycaster.intersectObjects(scene.children);

        if (found.length > 0 && found[0].object.userData.draggable) {
            draggable = found[0].object;
            console.log(`${draggable.userData.name}`);

            draggable.material.color.setHex("#000000");
        }
    });

    window.addEventListener('mousemove', e => {
        moveMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        moveMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function dragObject() {
        if (!draggable) return false;

        raycaster.setFromCamera(moveMouse, camera);
        const found = raycaster.intersectObjects(scene.children);

        if (found.length > 0) {
            for (let item of found) {
                if (!item.object.userData.ground)
                    continue;

                draggable.position.x = item.point.x;
                draggable.position.z = item.point.z;
            }
        }
    }

    createCube();
    createSphere();
    createCone();
    createFloor();

    function animate() {
        controls.update();
        dragObject();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();
}

init();