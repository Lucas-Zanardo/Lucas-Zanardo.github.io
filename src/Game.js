import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import Stats from 'three/examples/jsm/libs/stats.module'
// Core
import GameObjectManager from './core/GameObjectManager.js'
import InputManager from './core/InputManager.js';
// Components
import Player from './components/Player.js';
import Mesh from './components/Mesh.js';
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
    #models;
    #scene;
    #gui;
    renderer;
    camera;
    mainWorldLight;
    timeData;
    stats;
    #gameObjectManager;

    constructor(renderer, camera) {
        this.renderer = renderer;
        this.camera = camera;
        this.timeData = new Time();
        this.mainWorldLight = null;

        this.#gameObjectManager = new GameObjectManager();
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
            // cameraFolder.add(this.camera.rotation, 'x').name('angleX');
            // cameraFolder.add(this.camera.rotation, 'y').name('angleY');
            // cameraFolder.add(this.camera.rotation, 'z').name('angleZ');
        }

        const sceneFolder = this.#gui.addFolder("Scene");
        this.#gameObjectManager.buildSceneGui(sceneFolder);

        this.stats = new Stats()
        document.body.appendChild(this.stats.dom);

        return sceneFolder;
    }

    buildScene() {
        this.#scene = new THREE.Scene();
        this.#scene.background = new THREE.Color('#80dfff');

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
            const waterPlane = new THREE.PlaneGeometry(100, 100);
            // const waterMat   = new THREE.ShaderMaterial({ fragmentShader: '' });
            const waterMat = new THREE.MeshPhongMaterial({ transparent: true, color: '#00AFFF', opacity: .7, reflectivity: .2 });
            const waterMesh  = new THREE.Mesh(waterPlane, waterMat);
            const water = this.#gameObjectManager.createGameObject(this.#scene, "Water");
            water.addComponent(Mesh, waterMesh);
            water.transform.translateY(-10);
            water.transform.rotateX(-Math.PI/2);
        }

        // Lights and shadows

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.castShadow = true;
        const worldBounds = new THREE.Box3().setFromObject(world.transform);
        console.log(worldBounds);
        directionalLight.shadow.camera.left = worldBounds.min.x;
        directionalLight.shadow.camera.right = worldBounds.max.x;
        directionalLight.shadow.camera.bottom = worldBounds.min.z;
        directionalLight.shadow.camera.top = worldBounds.max.z;
        directionalLight.shadow.mapSize = new THREE.Vector2(1024 * 2, 1024 * 2);

        this.#scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0x3f00af, 1);
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

    run() {
        this.buildScene();
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
        this.renderer.render(this.#scene, this.camera);

        this.stats.update();
        requestAnimationFrame((time) => this.#animate(time));
    }
}