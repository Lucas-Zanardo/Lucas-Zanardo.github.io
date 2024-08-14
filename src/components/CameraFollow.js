import * as THREE from 'three';
import Component from './Component';

const VECTOR_UP = new THREE.Vector3(0, 1, 0);

export default class CameraFollow extends Component {
    constructor(gameObject, camera) {
        super(gameObject);
        this.camera = camera;
        this.target = null;
    }

    setTarget(targetGameObject) {
        this.target = targetGameObject;
    }
    
    update(time) {
        if(this.target) {
            // FIX: add some smoothing
            this.camera.lookAt(this.gameObject.transform.position, this.target.transform.position, VECTOR_UP);
        }
    }
}