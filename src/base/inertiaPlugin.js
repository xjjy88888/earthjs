// https://armsglobe.chromeexperiments.com/
export default ({zoomScale}={zoomScale:[0,50000]}) => {
    /*eslint no-console: 0 */
    const _ = {
        onDrag: {},
        onDragVals: [],
        onDragStart: {},
        onDragStartVals: [],
        onDragEnd: {},
        onDragEndVals: [],
    };

    let rotateX = 0,
        rotateY = 0,
        rotateZ = [],
        rotateVX = 0,
        rotateVY = 0,
        previousX = 0,
        previousY = 0;

    let dragging = false,
        rendering = false,
        draggMove = undefined;

    function inertiaDrag() {
        _.onDragVals.forEach(v => v.call(this, _.mouse));
        if (!rendering) {
            _.removeEventQueue(_.me.name, 'onTween');
            _.onDragEndVals.forEach(v => v.call(this, _.mouse));
            _.this._.refresh();
            return;
        }

        rotateVX *= 0.95;
        rotateVY *= 0.90;

        if (dragging) {
            rotateVX *= 0.6;
            rotateVY *= 0.65;
        }

        if (rotateY < -100) {
            rotateY = -100;
            rotateVY *= -0.95;
        }

        if (rotateY > 100) {
            rotateY = 100;
            rotateVY *= -0.95;
        }

        rotateX += rotateVX;
        rotateY += rotateVY;

        _.rotate([rotateX, rotateY, rotateZ[2]]);

        if (!dragging &&
            previousX.toPrecision(5) === rotateX.toPrecision(5) &&
            previousY.toPrecision(5) === rotateY.toPrecision(5)) {
            rendering = false;
        }
        previousX = rotateX;
        previousY = rotateY;
    }

    function mouseMovement() {
        const dx =  d3.event.sourceEvent.movementX;
        const dy = -d3.event.sourceEvent.movementY;
        _.mouse = d3.mouse(this);
        return [dx, dy];
    }

    let cmouse;
    function onStartDrag() {
        dragging = true;
        rendering = true;
        draggMove = null;
        cmouse = mouseMovement.call(this);
        rotateVX = cmouse[0];
        rotateVY = cmouse[1];
        _.onDragStartVals.forEach(v => v.call(this, _.mouse));
        _.onDragVals.forEach(     v => v.call(this, _.mouse));
        _.removeEventQueue(_.me.name, 'onTween');
    }

    function onDragging() {
        if(dragging){
            draggMove = true;
            cmouse  = mouseMovement.call(this);
            rotateZ = _.proj.rotate();
            rotateX = rotateZ[0];
            rotateY = rotateZ[1];
            rotateVX += cmouse[0];
            rotateVY += cmouse[1];
            inertiaDrag.call(_.this);
        }
    }

    function onEndDrag(){
        dragging = false;
        if (draggMove) {
            draggMove = false;
            _.addEventQueue(_.me.name, 'onTween');
        }
    }

    function init() {
        const __ = this._;
        const s0 = this._.proj.scale();
        const {width, height} = __.options;
        function zoom() {
            const z = zoomScale;
            const r1 = s0 * d3.event.transform.k;
            if (r1>=z[0] && r1<=z[1]) {
                __.scale(r1);
            }
        }

        this._.svg.call(d3.drag()
            .on("start", onStartDrag)
            .on("drag", onDragging)
            .on("end", onEndDrag));
        // .on('mousedown touchstart', onStartDrag)
        // .on('mousemove touchmove', onDragging)
        // .on('mouseup touchend', onEndDrag);

        this._.svg.call(
            d3.zoom()
            .on('zoom', zoom)
            .scaleExtent([0.1,160])
            .translateExtent([[0,0], [width, height]])
            .filter(function() {
                const {touches, type} = d3.event;
                return (type==='wheel' || touches);
            })
        );

    }

    function create() {
        _.proj = this._.proj;
        _.rotate = this._.rotate;
        _.addEventQueue = this.__addEventQueue;
        _.removeEventQueue = this.__removeEventQueue;
    }

    return {
        name: 'inertiaPlugin',
        onInit(me) {
            _.me = me;
            _.this = this;
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        onTween() { // requestAnimationFrame()
            inertiaDrag.call(this);
        },
        onDrag(obj) {
            Object.assign(_.onDrag, obj);
            _.onDragVals = Object.keys(_.onDrag).map(k => _.onDrag[k]);
        },
        onDragStart(obj) {
            Object.assign(_.onDragStart, obj);
            _.onDragStartVals = Object.keys(_.onDragStart).map(k => _.onDragStart[k]);
        },
        onDragEnd(obj) {
            Object.assign(_.onDragEnd, obj);
            _.onDragEndVals = Object.keys(_.onDragEnd).map(k => _.onDragEnd[k]);
        },
    }
}