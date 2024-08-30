import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import Stats from 'three/examples/jsm/libs/stats.module'
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {BloomPass} from 'three/addons/postprocessing/BloomPass.js';
import {FilmPass} from 'three/addons/postprocessing/FilmPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

// Core
import GameObjectManager from './core/GameObjectManager.js'
import InputManager from './core/InputManager.js';
// Components
import Player from './components/Player.js';
import Mesh from './components/Mesh.js';
import Water from './components/Water.js';
import RigidBody from './components/RigidBody.js';
import CameraFollow from './components/CameraFollow.js';



class Time {
    delta;
    time;
    constructor() {
        this.delta = 0;
        this.time = 0;
    }
}

export const GAME_WORLD_SIZE = 100;

export default class Game {
    renderer;
    camera;
    timeData;
    #scene;
    #gameObjectManager;

    renderTarget;

    #gui;
    stats;

    #models;
    #textures;
    #files;

    constructor(renderer, camera) {
        this.renderer = renderer;
        this.camera = camera;
        this.timeData = new Time();

        this.#gameObjectManager = new GameObjectManager();
    
        this.#models = {};
        this.#textures = {};
        this.#files = {};
    }

    #buildDebugGui() {
        this.#gui = new GUI();

        {
            const globalsFolder = this.#gui.addFolder("Globals");
            globalsFolder.add(this.timeData, 'delta').listen().disable().name("Delta (s/frame)");
            globalsFolder.add(this.timeData, 'time').listen().disable().name("Time (s)");
        }

        {
            const cameraFolder = this.#gui.addFolder('Camera').close();
            cameraFolder.add(this.camera.position, 'x', 'x').listen();
            cameraFolder.add(this.camera.position, 'y', 'y').listen();
            cameraFolder.add(this.camera.position, 'z', 'z').listen();
        }

        const sceneFolder = this.#gui.addFolder("Scene");
        this.#gameObjectManager.buildSceneGui(sceneFolder);

        this.stats = new Stats()
        document.body.appendChild(this.stats.dom);

        return sceneFolder;
    }

    buildScene() {
        this.#scene = new THREE.Scene();
        this._mainPassBackground = new THREE.Color('#80dfff');
        this._depthPassBackground = new THREE.Color('#fff');

        // Camera GameObject
        const cameraObject = this.#gameObjectManager.createGameObject(this.#scene, 'camera');
        const cameraFollowComponent = cameraObject.addComponent(CameraFollow, this.camera, this.renderer);

        // Player
        {
            const player = this.#gameObjectManager.createGameObject(this.#scene, "Player");
            player.addComponent(Mesh, this.#models.plane)
            player.addComponent(Player);
            player.addComponent(RigidBody);
            cameraFollowComponent.setTarget(player);
        }


        // World
        const world = this.#gameObjectManager.createGameObject(this.#scene, "World");
        world.addComponent(Mesh, this.#models.world);
        world.transform.translateY(-10);

        // Water
        {
            const water = this.#gameObjectManager.createGameObject(this.#scene, "Water");
            this._water = water.addComponent(Water, {
                size: 100, 
                loadedTextures: this.#textures, 
                loadedModels: this.#models,
                depthTexture: !!this.renderer.extensions.get("WEBGL_depth_texture") ? this.renderTarget.depthTexture : this.renderTarget.texture,
                vertex: this.#files.water_shader_vertex,
                fragment: this.#files.water_shader_fragment,
                renderer: this.renderer,
                camera: this.camera
            });
            water.transform.translateY(-10);
        }

        // Lights and shadows

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.castShadow = true;
        const worldBounds = new THREE.Box3().setFromObject(world.transform);
        directionalLight.shadow.camera.left = worldBounds.min.x;
        directionalLight.shadow.camera.right = worldBounds.max.x;
        directionalLight.shadow.camera.bottom = worldBounds.min.z;
        directionalLight.shadow.camera.top = worldBounds.max.z;
        directionalLight.shadow.mapSize = new THREE.Vector2(1024 * 2, 1024 * 2);
        this.#scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0x3f00af, .5);
        this.#scene.add(ambientLight);

        // setup GUI
        this.#buildDebugGui();

        // return scene
        return this.#scene;
    }

    setModels(models) {
        console.log(models);
        this.#models = models;
    }

    setTextures(textures) {
        console.log(textures);
        this.#textures = textures;
    }

    setFiles(files) {
        console.log(files);
        this.#files = files;
    }

    run() {
        var pixelRatio = this.renderer.getPixelRatio();
        this.renderTarget = new THREE.WebGLRenderTarget(this.renderer.domElement.width * pixelRatio, this.renderer.domElement.height * pixelRatio);
        this.renderTarget.texture.minFilter = THREE.NearestFilter;
        this.renderTarget.texture.magFilter = THREE.NearestFilter;
        this.renderTarget.texture.generateMipmaps = false;
        this.renderTarget.stencilBuffer = false;
        if(!!this.renderer.extensions.get("WEBGL_depth_texture")) {
            console.log("using depth texture");
            this.renderTarget.depthTexture = new THREE.DepthTexture(4096, 4096);
            this.renderTarget.depthTexture.type = THREE.UnsignedShortType;
            this.renderTarget.depthTexture.minFilter = THREE.NearestFilter;
            this.renderTarget.depthTexture.magFilter = THREE.NearestFilter;
        }
        this.depthMaterial = new THREE.MeshDepthMaterial({});
        this.depthMaterial.depthPacking = THREE.RGBADepthPacking;
        this.depthMaterial.blending = THREE.NoBlending;

        this.buildScene();
        this._resizeRendererToDisplaySize();
        requestAnimationFrame((t) => this.#animate(t));
    }

    _resizeRendererToDisplaySize() {
        const canvas = this.renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = Math.floor(canvas.clientWidth * pixelRatio);
        const height = Math.floor(canvas.clientHeight * pixelRatio);
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            this.renderer.setSize(width, height, false);
            this.renderTarget.setSize(width, height);
            this._water.setSize(width, height);
        }
        return needResize;
    }

    #animate(time) {
        const timeSeconds = time * .001;
        this.timeData.delta = timeSeconds - this.timeData.time;
        this.timeData.time = timeSeconds;

        if (this._resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }

        // update all
        this.#gameObjectManager.update(this.timeData);
        InputManager.Get().update();

        // render
        // depth pass
        this._water.plane.visible = false; // we don't want the depth of the water
        this.#scene.overrideMaterial = this.depthMaterial;
        this.#scene.background = this._depthPassBackground;
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.#scene, this.camera);
        
        // beauty pass
        this._water.plane.visible = true;        
        this.#scene.overrideMaterial = null;
        this.#scene.background = this._mainPassBackground;
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.#scene, this.camera);

        this.stats.update();
        requestAnimationFrame((time) => this.#animate(time));
    }
}