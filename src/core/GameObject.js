import * as THREE from 'three';
/// Base GameObject
export default class GameObject {
    constructor(parent, name) {
        this.name = name;
        this.components = [];
        this.transform = new THREE.Object3D();
        parent.add(this.transform);
    }
    addComponent(ComponentType, ...args) {
        const component = new ComponentType(this, ...args);
        this.components.push(component);
        return component;
    }
    removeComponent(component) {
        removeArrayElement(this.components, component);
    }
    getComponent(ComponentType) {
        return this.components.find(c => c instanceof ComponentType);
    }
    update(time) {
        for (const component of this.components) {
            component.update(time);
        }
    }
}