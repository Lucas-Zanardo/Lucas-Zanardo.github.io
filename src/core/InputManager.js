export default class InputManager {
    constructor() {
        this.keys = {};
        
        // Input events
        window.addEventListener("keydown", (ev) => {
            if(!(ev.code in this.keys)) {
                this.keys[ev.code] = {
                    state: 'down',
                    firstFrame: true
                }
            }
            // if was not down before
            if(this.keys[ev.code].state === 'up')
                this.keys[ev.code].firstFrame = true;

            this.keys[ev.code].state = 'down';
        });

        window.addEventListener("keyup", (ev) => {
            if(!(ev.code in this.keys)) {
                this.keys[ev.code] = {
                    state: 'up',
                    firstFrame: true
                }
            }
            // if was not up before
            if(this.keys[ev.code].state === 'down')
                this.keys[ev.code].firstFrame = true;
            
            this.keys[ev.code].state = 'up';
        });
    }

    update() {
        for(const keyCode in this.keys) {
            if(this.keys[keyCode].firstFrame)
                this.keys[keyCode].firstFrame = false;
        }
    }

    isKeyJustPressed(keyCode) {
        return (keyCode in this.keys) ? this.keys[keyCode].firstFrame && this.keys[keyCode].state === 'down' : false;
    }

    isKeyJustReleased(keyCode) {
        return (keyCode in this.keys) ? this.keys[keyCode].firstFrame && this.keys[keyCode].state === 'up' : false;
    }

    isKeyUp(keyCode) {
        return (keyCode in this.keys) ? this.keys[keyCode].state === 'up' : true;
    }

    isKeyDown(keyCode) {
        return (keyCode in this.keys) ? this.keys[keyCode].state === 'down' : false;
    }

    ////////////////////////////:

    getAxis(negativeKeyCode, positiveKeyCode) {
        return this.isKeyDown(positiveKeyCode) - this.isKeyDown(negativeKeyCode);
    }

    ////////////////////////////:

    static Get() {
        if(!InputManager.instance)
            InputManager.instance = new InputManager();
        return InputManager.instance;
    }
}