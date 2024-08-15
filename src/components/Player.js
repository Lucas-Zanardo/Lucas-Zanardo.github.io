import Entity from "./Entity";
import * as THREE from 'three';
import InputManager from '../core/InputManager'
import RigidBody from "./RigidBody";
import { addVector3 } from "../utils/debugGui";
import { GAME_WORLD_SIZE } from "../Game";

const FORWARD = new THREE.Vector3(0, 0, -1);
const MAX_TURNING_ANGLE = Math.PI / 4;
const MAX_VERTICAL_ANGLE = Math.PI / 3;

const MIN_SPEED = 0.2;

export default class Player extends Entity {
    constructor(gameObject) {
        super(gameObject);

        this.maxSpeed = 10;
        this.accelerationFactor = 0.1;
        this.currentSpeedPercentage = 0;
        
        this.turnSpeed = 1;
        this._planeAngle = 0;
    
        this.altitudeFactor = .5;
        this.altitudeDampening = 1;
        this._targetAltitudeAngle = 0;
        this.loseAltitudeWhenSlowFactor = 0.1;

        this._angles = new THREE.Euler(0, 0, 0, 'XYZ');
    }

    update(time) {
        const {transform} = this.gameObject;

        // Forward controls
        const speed = InputManager.Get().getAxis('KeyS', 'KeyW');
        this.currentSpeedPercentage += speed * this.accelerationFactor;
        this.currentSpeedPercentage = Math.min(Math.max(MIN_SPEED, this.currentSpeedPercentage), 1);
        const speedForce = this.currentSpeedPercentage * this.maxSpeed;

        // Altitude controls
        const altitude = InputManager.Get().getAxis('Space', 'ShiftLeft');
        if(altitude === 0) {
            if(this.currentSpeedPercentage === MIN_SPEED) {
                this._angles.x += this.loseAltitudeWhenSlowFactor * time.delta;
            } else {
                this._angles.x += -this._angles.x * this.altitudeDampening * time.delta;
            }
        } else {
            const altitudeForce = altitude * this.altitudeFactor * this.currentSpeedPercentage * time.delta;
            this._angles.x += altitudeForce, MAX_VERTICAL_ANGLE;
            this._angles.x = Math.min(Math.max(this._angles.x, -MAX_VERTICAL_ANGLE), MAX_VERTICAL_ANGLE);
        }


        // Rotation
        const turn = InputManager.Get().getAxis('KeyD', 'KeyA');
        const turnForce = turn * this.turnSpeed * this.currentSpeedPercentage;
        this._angles.y += turnForce * time.delta;

        // rotate plane for the turn angle
        this._planeAngle = -turnForce * MAX_TURNING_ANGLE;
        this._angles.z = (1 - time.delta) * this._angles.z + time.delta * this._planeAngle;

        /////////////////////////
        // Apply angles
        const up      = transform.up;
        const forward = FORWARD.clone(); // .applyAxisAngle(up, this._angles.y);
        const right   = new THREE.Vector3().crossVectors(up, forward);
        transform.setRotationFromAxisAngle(up, this._angles.y);
        transform.rotateOnAxis(forward, this._angles.z);
        transform.rotateOnAxis(right, this._angles.x);

        // Apply forces
        this.gameObject.getComponent(RigidBody).velocity = FORWARD.clone().multiplyScalar(speedForce);

        // loop
        if(transform.position.x > GAME_WORLD_SIZE)  transform.position.x = -GAME_WORLD_SIZE;
        if(transform.position.x < -GAME_WORLD_SIZE) transform.position.x =  GAME_WORLD_SIZE;
        if(transform.position.z > GAME_WORLD_SIZE)  transform.position.z = -GAME_WORLD_SIZE;
        if(transform.position.z < -GAME_WORLD_SIZE) transform.position.z =  GAME_WORLD_SIZE;
    }

    editorGui(guiFolder) {
        addVector3(guiFolder, this, '_angles');

        guiFolder.add(this, 'maxSpeed');
        guiFolder.add(this, 'accelerationFactor');
        guiFolder.add(this, 'currentSpeedPercentage').listen();

        guiFolder.add(this, 'turnSpeed');
        guiFolder.add(this, '_planeAngle').listen();

        guiFolder.add(this, 'altitudeFactor').listen();
        guiFolder.add(this, 'altitudeDampening');
        guiFolder.add(this, '_targetAltitudeAngle').listen();
    }
}