import * as THREE from "three/build/three.module";
import {
    OrbitControls
} from "three/examples/jsm/controls/OrbitControls";
import {
    GLTFLoader
} from "three/examples/jsm/loaders/GLTFLoader";
import {
    RGBELoader
} from "three/examples/jsm/loaders/RGBELoader";
import {
    RoughnessMipmapper
} from "three/examples/jsm/utils/RoughnessMipmapper";

var container,
    controls,
    light,
    theta = 0,
    model1,
    distance = 0,
    flag = 1;
var camera, scene, renderer;

init();
animate();

function init() {
    container = document.createElement("div");
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(
        100,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    // camera.position.set(1.8, 5, 9); //To move the camera

    scene = new THREE.Scene();

    new RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .setPath("./resources/textures/")
        .load("adams_place_bridge_1k.hdr", function (texture) {
            var envMap = pmremGenerator.fromEquirectangular(texture).texture;

            scene.background = envMap;
            scene.environment = envMap;

            texture.dispose();
            pmremGenerator.dispose();

            var light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(1, 1, 1).normalize();
            scene.add(light);

            var roughnessMipmapper = new RoughnessMipmapper(renderer);

            var loader = new GLTFLoader().setPath(
                "./resources/model/coronavirus/"
            );
            loader.load("scene.gltf", function (gltf) {
                model1 = gltf.scene;
                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {
                        roughnessMipmapper.generateMipmaps(child.material);
                    }
                });
                scene.add(gltf.scene);
                roughnessMipmapper.dispose();
            });
        });

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    var pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // to move camera using mouse
    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", render);
    controls.minDistance = 2; //maximum how much I can zoom in
    controls.maxDistance = 10; //maximum how much I can zoom out also the initial position
    controls.target.set(5, 1, 0); //To set the initial position of the model
    controls.update();

    window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    theta += 0.005;
    if (theta < 5.9) {
        camera.position.x = Math.sin(theta) * 70;
        // camera.position.y = Math.sin(theta) * 70;
        camera.position.z = Math.cos(theta) * 70;
        camera.lookAt(scene.position);
    }
    if (theta > 5.9 && distance < 1.5) {
        distance += 0.01;
        model1.translateX(distance + 0.5);
        model1.translateZ(-distance);
    }
    if (distance >= 1.5 && flag == 1) {
        flag = 0;
        secondModel();
    }
    renderer.render(scene, camera);
}

function secondModel() {
    var loader = new GLTFLoader().setPath("resources/model/elven_head/");
    loader.load("scene.gltf", function (gltf) {
        scene.add(gltf.scene);
    });

    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 4; //maximum how much I can zoom in
    controls.maxDistance = 10; //maximum how much I can zoom out
    controls.target.set(6, 5, 2);
    controls.update();
}