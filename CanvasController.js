class CanvasController {
    /**
     * Creates a new canvas controller for the given canvas.
     * @param {HTMLCanvasElement} canvas The canvas to control.
     */
    constructor(canvas) {
        // Create fields for frequently needed values.
        this._canvas = canvas;
        this._parent = canvas.parentElement;
        this._context = canvas.getContext('2d');
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
            const pos = this._mouseEventToCoords(e);
            this._drawStack.push({ key: 'begin', value: pos });
            this._beginStroke(pos);
        });
        c.addEventListener('mousemove', (e) => {
            const pos = this._mouseEventToCoords(e);
            this._drawStack.push({ key: 'continue', value: pos });
            this._continueStroke(pos);
        });
        c.addEventListener('mouseup', () => {
            this._drawStack.push({ key: 'end', value: null });
            this._endStroke();
        });
        c.addEventListener('mouseout', () => {
            this._drawStack.push({ key: 'end', value: null });
            this._endStroke();
        });
    }

    /** @return {string} The current drawing color. */
    get color() { return this._color; }
    set color(val) { this._color = val; }

    /** @return {number} The current drawing line width. */
    get lineWidth() { return this._lineWidth; }
    set lineWidth(val) { this._lineWidth = val; }

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

    /**
     * Start a stroke at the given position on the canvas.
     * @param {Array} pos The coordinates (between 0 and 1) in the form {x, y}.
     */
    _beginStroke(pos) {
        this._context.beginPath();
        this._context.moveTo(pos.x * this._size, pos.y * this._size);
        this._isDrawing = true;
    }

    /**
     * Continue the active stroke to the given position on the canvas.
     * @param {Array} pos The coordinates (between 0 and 1) in the form {x, y}.
     */
    _continueStroke(pos) {
        if (!this._isDrawing) { return; }

        this._context.lineTo(pos.x * this._size, pos.y * this._size);
        this._context.stroke();
    }

    /**
     * End the active stroke.
     */
    _endStroke() {
        this._context.closePath();
        this._isDrawing = false;
    }
}