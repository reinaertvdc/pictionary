class CanvasController {
    /**
     * Creates a new canvas controller for the given canvas.
     * @param {HTMLCanvasElement} canvas The canvas to control.
     */
    constructor(roomController, canvas) {
        // Create fields for frequently needed values.
        this._roomController = roomController;
        this._canvas = canvas;
        this._parent = canvas.parentElement;
        this._context = canvas.getContext('2d');
        this._isMaster = false;
        this._size = 0;
        this._isDrawing = false;

        // Set default values for color and line width.
        this._color = 'black';
        this._lineWidth = 1;

        // Create a stack to keep track of all drawing actions.
        this._drawStack = [];

        // Resize the canvas when needed.
        this._resize();
        addEventListener('resize', () => { this._resize(); });

        // Listen for mouse events to enable drawing.
        const c = this._canvas
        c.addEventListener('mousedown', (e) => {
            if (!this.isMaster) { return; }
            const pos = this._mouseEventToCoords(e);
            this._beginStroke(pos);
        });
        c.addEventListener('mousemove', (e) => {
            if (!this.isMaster) { return; }
            const pos = this._mouseEventToCoords(e);
            this._continueStroke(pos);
        });
        c.addEventListener('mouseup', () => {
            if (!this.isMaster) { return; }
            this._endStroke();
        });
        c.addEventListener('mouseout', () => {
            if (!this.isMaster) { return; }
            this._endStroke();
        });
    }

    /** @return {string} Whether the user can draw. */
    get isMaster() { return this._isMaster; }
    set isMaster(val) { this._isMaster = val; }

    /** @return {string} The current drawing color. */
    get color() { return this._color; }
    set color(val) { this._color = val; }

    /** @return {number} The current drawing line width. */
    get lineWidth() { return this._lineWidth; }
    set lineWidth(val) { this._lineWidth = val; }

    runCommand(data) {
        data = new Float32Array(data);
        const pos = {x: data[0], y: data[1]};

        console.log(pos.x);
        console.log(pos.y);

        if (pos.x < 0 || pos.y < 0) { this._endStroke(pos); }
        else if (this._isDrawing) { this._continueStroke(pos); }
        else { this._beginStroke(pos); }
    }

    /**
     * Resize the canvas according to the new viewport size.
     */
    _resize() {
        const bcr = this._parent.getBoundingClientRect();
        const newSize = Math.min(bcr.width, bcr.height);

        if (newSize == this._size) { return; }

        this._canvas.style.width = newSize + 'px';
        this._canvas.style.height = newSize + 'px';
        this._canvas.width = newSize;
        this._canvas.height = newSize;
        this._size = newSize;

        for (let action of this._drawStack) {
            switch (action.key) {
                case 'begin':
                    this._beginStroke(action.value);
                    break;
                case 'continue':
                    this._continueStroke(action.value);
                    break;
                case 'end':
                    this._endStroke();
                    break;
            }
        }
    }

    /**
     * Returns the coordinates (between 0 and 1) of the given mouse event.
     * @param {MouseEvent} e The mouse event to get the coordinates from.
     * @returns {Array} The coordinates (between 0 and 1) in the form {x, y}.
     */
    _mouseEventToCoords(e) {
        return {
            x: e.offsetX / this._size,
            y: e.offsetY / this._size
        }
    }

    _sendCommand(data) {
        this._roomController.socketController.send(new Float32Array(data));
    }

    /**
     * Start a stroke at the given position on the canvas.
     * @param {Array} pos The coordinates (between 0 and 1) in the form {x, y}.
     */
    _beginStroke(pos) {
        this._context.beginPath();
        this._context.moveTo(pos.x * this._size, pos.y * this._size);
        this._drawStack.push({ key: 'begin', value: pos });
        this._isDrawing = true;

        if (this.isMaster) { this._sendCommand([pos.x, pos.y]); }
    }

    /**
     * Continue the active stroke to the given position on the canvas.
     * @param {Array} pos The coordinates (between 0 and 1) in the form {x, y}.
     */
    _continueStroke(pos) {
        if (!this._isDrawing) { return; }
        this._drawStack.push({ key: 'continue', value: pos });
        this._context.lineTo(pos.x * this._size, pos.y * this._size);
        this._context.stroke();

        if (this.isMaster) { this._sendCommand([pos.x, pos.y]); }
    }

    /**
     * End the active stroke.
     */
    _endStroke() {
        this._context.closePath();
        this._drawStack.push({ key: 'end', value: null });
        this._isDrawing = false;

        if (this.isMaster) { this._sendCommand([-1, -1]); }
    }
}