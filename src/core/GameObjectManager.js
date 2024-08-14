import SafeArray from './SafeArray.js';
import GameObject from './GameObject.js';

export default class GameObjectManager {
    constructor() {
        this.gameObjects = new SafeArray();
    }
    createGameObject(parent, name) {
        const gameObject = new GameObject(parent, name);
        this.gameObjects.add(gameObject);
        return gameObject;
    }
    removeGameObject(gameObject) {
        this.gameObjects.remove(gameObject);
    }

    update(time) {
        this.gameObjects.forEach(gameObject => gameObject.update(time));
    }
}