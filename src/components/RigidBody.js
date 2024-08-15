import Component from "./Component";

import { addVector3 } from '../utils/debugGui';
import * as THREE from 'three';

export default class RigidBody extends Component {
    constructor(gameObject) {
        super(gameObject);
        
        this.acceleration = new THREE.Vector3(0);
        this.velocity = new THREE.Vector3(0);
    }

    update(time) {
        this.velocity.add(this.acceleration.clone().multiplyScalar(time.delta));
        this.gameObject.transform.translateOnAxis(this.velocity.clone().normalize(), this.velocity.length() * time.delta);
    }

    editorGui(guiFolder) {
        addVector3(guiFolder, this, 'acceleration');
        addVector3(guiFolder, this, 'velocity');
    }

    //////////////////////////////

    addForce(forceVector, impulse = false) {
        if(impulse) {
            this.velocity.add(forceVector);
        } else {
            this.acceleration.add(forceVector);
        }
    }
}