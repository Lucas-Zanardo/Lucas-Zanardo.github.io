import Component from "./Component";

export default class Mesh extends Component {
    constructor(gameObject, model) {
        super(gameObject, model);
        this.model = model;
        if('gltf' in model) {
            this.modelRoot = model.gltf.scene.clone();
        } else {
            this.modelRoot = model.clone();
        }
        gameObject.transform.add(this.modelRoot);
    }

    update(time) {}
}