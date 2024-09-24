import * as THREE from 'three';
import Component from "./Component";

import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export default class MeshBuffered extends Component {
    constructor(gameObject, model, positions=[]) {
        super(gameObject, model);
        this.modelMat = model.gltf.scene.children[0].material;
        this.modelGeo = model.gltf.scene.children[0].geometry;
        if(!positions) {
            positions = model.gltf.scene.children;
        }

        // merge everything
        console.log("Merging ", this.model, "at", positions);
        const matrix = new THREE.Matrix4();
        const count = positions.length;
        this._instancedMesh = new THREE.InstancedMesh(this.modelGeo, this.modelMat, count);
        for(let idx = 0; idx < count; ++idx) {
            matrix.identity();
            matrix.scale(positions[idx].scale);
            matrix.makeRotationFromQuaternion(positions[idx].quaternion);
            matrix.setPosition(positions[idx].position);
            this._instancedMesh.setMatrixAt(idx, positions[idx].matrix);
        }
        this._instancedMesh.visible = false;
        gameObject.transform.add(this._instancedMesh);
    }

    update(time) {}
}