import SafeArray from './SafeArray.js';
import GameObject from './GameObject.js';
import { addVector3 } from '../utils/debugGui';


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

    buildSceneGui(sceneFolder) {
        const addGameObjectGui = (gameObject) => {
            const folder = sceneFolder.addFolder(gameObject.name).close();
            
            const transformFolder = folder.addFolder('transform').close();
            addVector3(transformFolder, gameObject.transform, 'position').close();
            addVector3(transformFolder, gameObject.transform, 'rotation').close();
            addVector3(transformFolder, gameObject.transform, 'scale').close();

            const componentsFolder = folder.addFolder('Components').close();
            gameObject.components.forEach((comp) => {
                const componentFolder = componentsFolder.addFolder(comp.constructor.name).close();
                comp.editorGui(componentFolder);
            });
            return folder;
        }

        this.gameObjects.forEach(gameObject => addGameObjectGui(gameObject));
    }
}