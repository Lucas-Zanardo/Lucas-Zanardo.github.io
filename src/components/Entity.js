import Component from "./Component";

export default class Entity extends Component {
    constructor(gameObject, model) {
        super(gameObject, model);
        this.model = model;
        const modelRoot = model; // .gltf.scene.clone();
        gameObject.transform.add(modelRoot);
    }

    update(time) {}
}