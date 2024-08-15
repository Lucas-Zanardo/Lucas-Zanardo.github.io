import * as THREE from 'three';
import Component from './Component';

const VECTOR_UP = new THREE.Vector3(0, 1, 0);

export default class CameraFollow extends Component {
    constructor(gameObject, camera) {
        super(gameObject);
        this.camera = camera;
        this.target = null;
        this.smoothing = 10;

        this._targetPos = new THREE.Vector3(0);
    }

    setTarget(targetGameObject) {
        this.target = targetGameObject;
        this._targetPos = targetGameObject.transform.position.clone();
    }
    
    update(time) {
        if(this.target) {
            // FIX: add some smoothing
            this._targetPos = this._targetPos.lerp(this.target.transform.position, time.delta * this.smoothing);
            this.camera.lookAt(this._targetPos);
        }
    }
}