class CanvasController {
    /**
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.parent = canvas.parentElement;
        this.context = canvas.getContext('2d');

        this.adjustCanvasSize();
        addEventListener('resize', () => { this.adjustCanvasSize(); });
    }

    /**
     * 
     */
    adjustCanvasSize() {
        this.setCanvasSize(0);

        setTimeout(() => {
            const bcr = this.parent.getBoundingClientRect();
            const size = Math.min(bcr.width, bcr.height);

            this.setCanvasSize(size);
        });
    }

    /**
     * 
     * @param {number} value 
     */
    setCanvasSize(value) {
        this.canvas.style.width = value + 'px';
        this.canvas.style.height = value + 'px';
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    drawDot(x, y) {
        const c = this.context;

        c.beginPath();
        c.moveTo(5, 5);
        c.lineTo(80, 80);
        c.strokeStyle = 'black';
        c.lineWidth = 3;
        c.stroke();
        c.closePath();
    }
}