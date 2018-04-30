class Ironworks {
    constructor() {
        this.processing = 0;
        this.resources = {};

        this.graph = false;
        this.paper = false;
        this.editorInitialized = false;

        this.elements = [];
        this.queueElements = [];
    }

    initializeEditor(target, x, y) {
        if (!this.editorInitialized) {
            this.graph = new joint.dia.Graph;
            this.paper = new joint.dia.Paper({
                el: $(target),
                width: x,
                height: y,
                gridSize: 5,
                model: this.graph
            });
        }
    }

    startEditor() {
        if (this.processing !== 0)
            return false;

        // Nothing to do here...
        if (this.queueElements.length > 0) {
            for (var key in this.queueElements) {
                let el = this.queueElements[key];
                this.newElem(el.elem, el.x, el.y, el.name);
            }
        }
    }

    loadRes(res) {
        if (res.length < 0)
            return false;

        this.processing++;
        $.get('./elements/boundary.svg', function(ret){
            let compressed = [
                ret
            ].join('');

            iw.setResource("boundary", compressed)
        }, 'text');

        this.processing++;
        $.get('./elements/user.svg', function(ret){
            iw.setResource("user", ret)
        }, 'text');

        this.processing++;
        $.get('./elements/control.svg', function(ret){
            iw.setResource("control", ret)
        }, 'text');

        this.processing++;
        $.get('./elements/entity.svg', function(ret){
            iw.setResource("entity", ret)
        }, 'text');
    }

    setResource(name, res) {
        this.processing--;

        this.resources[name] = new joint.shapes.basic.Image({
            size: {
                width: 100,
                height: 100
            },
            position: {
                x: 0,
                y: 0
            },
            attrs: {
                image: {
                    width: 100,
                    height: 100,
                    'xlink:href': 'data:image/svg+xml;utf8,' + encodeURIComponent(res),
                    preserveAspectRatio: 'xMinYMin slice'
                },
                text: { 'font-size': 14, 'ref-x': .5, 'ref-y': -2, ref: 'image', 'y-alignment': 'middle', 'x-alignment': 'middle', 'text': name }
            }
        });

        if (this.processing === 0)
            this.startEditor();
    }

    newElem (elem, x, y, name) {
        if (!(elem in this.resources)){
            console.log(elem + " not yet loaded...");
            this.queueElements.push({
                'elem': elem,
                'x': x,
                'y': y,
                'name': name});
            return false;
        }

        // TODO: generate ID ??
        // TODO: check if inside graph
        let key = this.elements.push( this.resources[elem].clone().position(x, y));
        this.graph.addCells( this.elements[key-1] );
    }
}

iw = new Ironworks();
iw.initializeEditor('#myholder', 800, 600);
iw.loadRes("boundary.svg");

$(function() {
    $("#add_boundary").click(function() {
        iw.newElem("boundary", 10, 10, "LoginPage");
    });
    $("#add_control").click(function() {
        iw.newElem("control", 10, 10, "LoginPage");
    });
    $("#add_entity").click(function() {
        iw.newElem("entity", 10, 10, "LoginPage");
    });
    $("#add_user").click(function() {
        iw.newElem("user", 10, 10, "LoginPage");
    });
})