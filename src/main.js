import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

import Game from './Game.js';
import InputManager from './core/InputManager.js';

////////////////////////////////////////////////////////////////////

function init(loadedModels, loadedTextures, loadedFiles) {
    console.log("INIT");

    // setup renderer
    const canvas = document.querySelector("#gameCanvas");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // setup camera
    const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 10;
    camera.rotation.z = 0;
    camera.rotation.x = 0;
    document.body.appendChild(renderer.domElement);

    InputManager.Get(); // create Input Manager

    const game = new Game(renderer, camera);
    game.setModels(loadedModels);
    game.setTextures(loadedTextures);
    game.setFiles(loadedFiles);
    game.run();
}

////////////////////////////////////////////////////////////////////

function loadGroup (loader, group, outputProp = 'data', onLoadApply = (obj, data) => {}) {
    for (const obj of Object.values(group)) {
        console.log('--------------> ', obj.url);
        loader.load(obj.url, (data) => {
            obj[outputProp] = data;
            onLoadApply(obj, data);
        }, undefined, console.error);
    }
}

////////////////////////////////////////////////////////////////////////////////////////

function loadObjects() {
    const models = {
        plane: { url: 'models/hydravion.gltf' },
        world: { url: 'models/world.gltf' },
        water: { url: 'models/water.gltf' },
    };

    const textures = {
        three_tone_texture: { url: 'images/threeTone.jpg', filter: THREE.NearestFilter },
        water_texture: { url: 'images/water_texture.png', filter: THREE.LinearFilter },
        water_texture_disp: { url: 'images/Water_002_DISP.png', filter: THREE.LinearFilter },
        water_texture_norm: { url: 'images/Water_002_NORM.jpg', filter: THREE.LinearFilter },
    }

    const files = {
        water_shader_vertex  : { url: 'shaders/water.vert' },
        water_shader_fragment: { url: 'shaders/water.frag' },
    }

    ////////////////////////////////////////////////////////////////////////////////////////

    const manager = new THREE.LoadingManager();
    const progressBar = document.querySelector(".progress-bar");
    const progressbarElem = document.querySelector('.progress-bar-filler');
    const progressbarInfo = document.querySelector('.progress-bar-loading-info');
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        progressbarInfo.textContent = url.toString();
        progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`;
        if(itemsLoaded >= itemsTotal) {
            progressBar.style.opacity = "0";
            setTimeout(() => progressBar.style.display = 'none', 500);
        }
    };
    manager.onLoad = () => init(models, textures, files);

    ////////////////////////////////////////////////////////////////////////////////////////

    console.log("LOADING");
    // Load textures
    loadGroup(new THREE.TextureLoader(manager), textures, 'data', (obj, data) => { 
        data.minFilter = obj.filter; 
        data.magFilter = obj.filter;
    });

    // Load Models
    loadGroup(new GLTFLoader(manager), models, 'gltf', (model, gltf) => { 
        gltf.scene.traverse( function( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.receiveShadow = true;
                child.castShadow = true;
                console.log(child.material.map);
                child.material = new THREE.MeshToonMaterial({ 
                    color: child.material.color,
                    side: THREE.FrontSide,
                    shadowSide: THREE.BackSide,
                    gradientMap: textures.three_tone_texture.data,
                    depthWrite: true,
                });
            }
        } );
    });
    
    // Load files
    loadGroup(new THREE.FileLoader(manager), files);
    console.log("LOADED");

    ////////////////////////////////////////////////////////////////////////////////////////
    
    if(Object.keys(models).length === 0
    && Object.keys(textures).length === 0
    && Object.keys(files).length === 0) {
        console.log("No data to load");
        progressBar.style.opacity = "0";
        setTimeout(() => progressBar.style.display = 'none', 500);
        init(models, textures, files);
    }
}


if (WebGL.isWebGLAvailable()) {
    loadObjects();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}