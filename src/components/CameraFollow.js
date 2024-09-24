import Component from './Component';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { addVector3 } from '../utils/debugGui';

export default class CameraFollow extends Component {
    constructor(gameObject, camera, renderer) {
        super(gameObject);
        this.cameraControls = new OrbitControls(camera, renderer.domElement);
        this.cameraControls.maxDistance = 10;
        this.cameraControls.autoRotateSpeed = 1;
        this.cameraControls.enablePan = false;

        this.cameraControls.minPolarAngle = 0; // Math.PI / 2;
        this.cameraControls.maxPolarAngle = Math.PI / 2.5;
        this.target = null;
    }

    setTarget(targetGameObject) {
        this.target = targetGameObject;
        this.cameraControls.target = this.target.transform.position;
    }
    
    update(time) {
        if(this.target) {
            this.cameraControls.update(time.delta);
        }
    }

    editorGui(guiFolder) {
        guiFolder.add(this.cameraControls, 'maxDistance');

        guiFolder.add(this.cameraControls, 'dampingFactor');
        guiFolder.add(this.cameraControls, 'enableDamping');
    }
}