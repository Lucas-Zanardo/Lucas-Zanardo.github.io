/// Base Component
export default class Component {
    constructor(gameObject) {
        this.gameObject = gameObject;
    }

    update(time) { }

    editorGui(guiFolder) { }
}