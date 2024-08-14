import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

import GameObjectManager from './core/GameObjectManager.js'
import Player from './components/Player.js';
import CameraFollow from './components/CameraFollow.js';

class Time {
    delta;
    time;
    constructor() {
        this.delta = 0;
        this.time = 0;
    }
}

class Game {
    #models
    #scene
    #gui
    renderer
    camera
    timeData;

    #gameObjectManager;

    constructor(renderer, camera) {
        this.renderer = renderer;
        this.camera = camera;
        this.timeData = new Time();

        this.#gameObjectManager = new GameObjectManager();
    }

    #buildDebugGui() {
        this.#gui = new GUI();

        {
            const cameraFolder = this.#gui.addFolder('Camera');
            cameraFolder.add(this.camera.position, 'x', 'x');
            cameraFolder.add(this.camera.position, 'y', 'y');
            cameraFolder.add(this.camera.position, 'z', 'z');
            cameraFolder.add(this.camera.rotation, 'x').name('angleX');
            cameraFolder.add(this.camera.rotation, 'y').name('angleY');
            cameraFolder.add(this.camera.rotation, 'z').name('angleZ');
        }

        const sceneFolder = this.#gui.addFolder("Scene");
        return sceneFolder;
    }

    buildScene() {
        const sceneFolder = this.#buildDebugGui();
        const addGameObjectGui = (gameObject) => {
            const folder = sceneFolder.addFolder(gameObject.name);
            folder.add(gameObject.transform.position, 'x');
            folder.add(gameObject.transform.position, 'y');
            folder.add(gameObject.transform.position, 'z');
            const compFolder = folder.addFolder('Components');
            gameObject.components.forEach((comp) => {
                compFolder.addFolder(comp.constructor.name).close();
            });
            return folder;
        }

        this.#scene = new THREE.Scene();

        // Camera GameObject
        const cameraObject = this.#gameObjectManager.createGameObject(this.#scene, 'camera');
        const cameraFollowComponent = cameraObject.addComponent(CameraFollow, this.camera);
        addGameObjectGui(cameraObject);

        // Player
        const material = new THREE.MeshToonMaterial({ color: 0xffffff });
        {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const cube = new THREE.Mesh(geometry, material);

            const player = this.#gameObjectManager.createGameObject(this.#scene, "Player");
            player.addComponent(Player, cube);
            cameraFollowComponent.setTarget(player);
            addGameObjectGui(player);
        }

        const light = new THREE.PointLight(0xffffff, 10, 100);
        light.position.set(-1, 2, 4);
        this.#scene.add(light);

        // NOTE(debug): push models to scene
        // for(const model of Object.values(this.#models)) {
        //    this.#scene.add(model.gltf.scene);
        // }

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
        this.#gameObjectManager.update(time);

        // render
        this.renderer.render(this.#scene, this.camera);
        requestAnimationFrame((time) => this.#animate(time));
    }
}

export default Game;