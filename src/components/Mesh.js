import Component from "./Component";

export default class Mesh extends Component {
    constructor(gameObject, model) {
        super(gameObject, model);
        this.model = model;
        if('gltf' in model) {
            const modelRoot = model.gltf.scene.clone();
            gameObject.transform.add(modelRoot);
        } else {
            gameObject.transform.add(model.clone());
        }
    }

    update(time) {}
}