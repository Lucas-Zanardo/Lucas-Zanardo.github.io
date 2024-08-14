import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

import Game from './Game.js';

////////////////////////////////////////////////////////////////////

const MODELS_PATH = 'assets/models/';

function init(loadedModels) {
    console.log("INIT");

    // setup renderer
    const canvas = document.querySelector("#gameCanvas");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas});
    // renderer.setSize(window.innerWidth, window.innerHeight);
    
    // setup camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = -15;
    camera.rotation.z = 0;
    camera.rotation.x = 0;
    document.body.appendChild(renderer.domElement);

    const game = new Game(renderer, camera);
    game.setModels(loadedModels);
    game.run();
}

////////////////////////////////////////////////////////////////////

function loadObjects() {
    const models = {
        // desk: { url: 'desk.gltf' },
        cube: { url: 'cube.gltf' },
    };

    const manager = new THREE.LoadingManager();

    const progressBar = document.querySelector(".progress-bar");
    const progressbarElem = document.querySelector('.progress-bar-filler');
    const progressbarInfo = document.querySelector('.progress-bar-loading-info');
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        progressbarInfo.textContent = url.toString();
        progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`;
        if(itemsLoaded >= itemsTotal) {
            progressBar.style.opacity = "0";
        }
    };

    manager.onLoad = () => init(models);
    {
        console.log("LOADING");
        const gltfLoader = new GLTFLoader(manager);
        for (const model of Object.values(models)) {
            gltfLoader.load(MODELS_PATH + model.url, (gltf) => {
                model.gltf = gltf;
            });
        }
        console.log("LOADED");
    }
}


if (WebGL.isWebGLAvailable()) {
    loadObjects();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}