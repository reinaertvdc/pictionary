class RoomController {
    constructor() {
        const canvasElement = document.getElementById('canvas');
        const cameraViewElement = document.getElementById('cameraview');

        this._canvasController = new CanvasController(this, canvasElement);
        this._cameraViewController = new CameraViewController(this, cameraViewElement);
        this._socketController = new SocketController(this);
    }

    get canvasController() { return this._canvasController; }

    get cameraViewController() { return this._cameraViewController; }

    get socketController() { return this._socketController; }
    set socketController(v) { this._socketController = v; }
}