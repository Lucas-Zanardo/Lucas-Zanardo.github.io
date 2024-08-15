import Entity from "./Entity";
import * as THREE from 'three';
import InputManager from '../core/InputManager'

export default class Player extends Entity {
    constructor(gameObject, model) {
        super(gameObject, model);
        this.speed = 10;
    }

    update(time) {
        const x = InputManager.Get().getAxis('q', 'd');
        const y = InputManager.Get().getAxis('s', 'z');
        const dir = new THREE.Vector3(x, y, 0).normalize();
        this.gameObject.transform.translateOnAxis(dir, this.speed * time.delta);
    }
}