export default class InputManager {
    constructor() {
        this.keys = {};
        
        // Input events
        window.addEventListener("keydown", (ev) => {
            if(!(ev.key in this.keys)) {
                this.keys[ev.key] = {
                    state: 'down',
                    firstFrame: true
                }
            }
            // if was not down before
            if(this.keys[ev.key].state === 'up')
                this.keys[ev.key].firstFrame = true;

            this.keys[ev.key].state = 'down';
        });

        window.addEventListener("keyup", (ev) => {
            if(!(ev.key in this.keys)) {
                this.keys[ev.key] = {
                    state: 'up',
                    firstFrame: true
                }
            }
            // if was not up before
            if(this.keys[ev.key].state === 'down')
                this.keys[ev.key].firstFrame = true;
            
            this.keys[ev.key].state = 'up';
        });
    }

    update() {
        for(const key in this.keys) {
            if(this.keys[key].firstFrame)
                this.keys[key].firstFrame = false;
        }
    }

    isKeyJustPressed(key) {
        return (key in this.keys) ? this.keys[key].firstFrame && this.keys[key].state === 'down' : false;
    }

    isKeyJustReleased(key) {
        return (key in this.keys) ? this.keys[key].firstFrame && this.keys[key].state === 'up' : false;
    }

    isKeyUp(key) {
        return (key in this.keys) ? this.keys[key].state === 'up' : true;
    }

    isKeyDown(key) {
        return (key in this.keys) ? this.keys[key].state === 'down' : false;
    }

    ////////////////////////////:

    getAxis(negativeKey, positiveKey) {
        return this.isKeyDown(positiveKey) - this.isKeyDown(negativeKey);
    }

    ////////////////////////////:

    static Get() {
        if(!InputManager.instance)
            InputManager.instance = new InputManager();
        return InputManager.instance;
    }
}