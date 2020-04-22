import * as THREE from "./node_modules/three/build/three.module.js";
import {
    GLTFLoader
} from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import {
    RGBELoader
} from "./node_modules/three/examples/jsm/loaders/RGBELoader.js";
import {
    RoughnessMipmapper
} from "./node_modules/three/examples/jsm/utils/RoughnessMipmapper.js";
import {
    OrbitControls
} from "./node_modules/three/examples/jsm/controls/OrbitControls.js";

var camera, scene, renderer, controls;
var lungs, covid;
let incrementValueCovid = 0.01;
let incrementValueLungs = 0.02;
let count = 1,
    i = 0,
    j = 0,
    k = 0;

const init = () => {
    var container = document.createElement("div");
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    camera.position.z = 10;

    scene = new THREE.Scene();
    // scene.background = new THREE.Color("rgb(196, 185, 179)");
    //   var bgTexture = new THREE.TextureLoader().load(
    //     "./resources/textures/factory_wall_1k.png"
    //   );
    //   scene.background = bgTexture;

    var light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .setPath("./resources/textures/")
        .load("surgery_1k (1).hdr", function (texture) {
            var envMap = pmremGenerator.fromEquirectangular(texture).texture;

            scene.background = envMap;
            scene.environment = envMap;

            texture.dispose();
            pmremGenerator.dispose();

            var roughnessMipmapper = new RoughnessMipmapper(renderer);

            let loader = new GLTFLoader().setPath("./resources/model/lungs/");
            loader.load("scene.gltf", function (gltf) {
                lungs = gltf.scene;
                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {
                        roughnessMipmapper.generateMipmaps(child.material);
                    }
                });
                lungs.scale.set(0.6, 0.6, 0.6);
                scene.add(gltf.scene);
                roughnessMipmapper.dispose();
            });

            loader = new GLTFLoader().setPath("./resources/model/coronavirus/");
            loader.load("scene.gltf", function (gltf) {
                covid = gltf.scene;
                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {
                        roughnessMipmapper.generateMipmaps(child.material);
                    }
                });
                covid.scale.set(0.01, 0.01, 0.01);
                covid.translateZ(1.5);
                covid.translateY(5);
                covid.translateX(5);
                scene.add(gltf.scene);
                roughnessMipmapper.dispose();
            });
        });

    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", render);
    controls.minDistance = 2; //maximum how much I can zoom in
    controls.maxDistance = 10; //maximum how much I can zoom out also the initial position
    controls.update();

    window.addEventListener("resize", onWindowResize, false);
};

const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    render();
    setTimeout(() => {
        if (incrementValueCovid < 0.015) {
            incrementValueCovid += 0.0001;
            covid.scale.x = incrementValueCovid;
            covid.scale.y = incrementValueCovid;
            covid.scale.z = incrementValueCovid;

            console.log(`${count++} covid: ${incrementValueCovid}`);
        }
        if (incrementValueLungs < 1.5) {
            incrementValueLungs += 0.014653465346534653;
            lungs.scale.x = incrementValueLungs;
            lungs.scale.y = incrementValueLungs;
            lungs.scale.z = incrementValueLungs;

            console.log(`${count++} lungs: ${incrementValueLungs}`);
        }
        if (i <= 1.12 && incrementValueLungs >= 1.5) {
            if (i <= 0.0513) {
                i += 0.00025;
                covid.translateX(-i);
            }
        }
        if (i >= 0.0513) {
            if (j <= 0.05) {
                j += 0.00025;
                covid.translateY(-j);
            }
        }
        if (j >= 0.05) {
            if (k < 0.04) {
                k += 0.00025;
                covid.translateX(-k);
                covid.translateY(-k);
            }
        }
    }, 4000);
};

const render = () => {
    renderer.render(scene, camera);
};

init();
animate();