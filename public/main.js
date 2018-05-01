class Ironworks {
    constructor() {
        this.processing = 0;
        this.resources = {};

        this.graph = false;
        this.paper = false;
        this.editorInitialized = false;

        this.elements = [];
        this.queueElements = [];

        this.focus = false;
        
        this.states = Object.freeze({
            idle_stat:1,
            link_source:2,
            link_dest:3
        });
        this.state = this.states.idle_stat;
        this.sourceID = false;

        this.loadRes("boundary.svg");
        this.loadRes("control.svg");
        this.loadRes("entity.svg");
        this.loadRes("actor.svg");
    }

    initializeEditor(nome_target, name_editor) {
        if (!this.editorInitialized) {
            let target = $("#"+nome_target);

            this.graph = new joint.dia.Graph;
            this.paper = new joint.dia.Paper({
                el: target,
                width: target.width(),
                height: target.height(),
                gridSize: 5,
                model: this.graph
            });

            this.paper.on('cell:pointerdown',
                function(cellView, evt, x, y) {
                    iw.focus = cellView;
                    console.log(cellView);
                    //console.log(iw.focus.model.attributes.id.toString());

                    switch (iw.state) {
                        case iw.states.idle_stat:
                            if (cellView.model.attributes.type === "devs.Link")
                                break;
                            let text = cellView.model.attributes.attrs.text.text;
                            iw.focus = cellView;
                            $("#nome").val(text);
                            break;

                        case iw.states.link_source:
                            if (cellView.model.attributes.type === "devs.Link")
                                break;
                            // boh
                            iw.sourceID = iw.focus.model.attributes.id.toString() + '';
                            iw.state = iw.states.link_dest;

                            $("#nome").val("Selezione oggetto di destinazione");
                            break;

                        case iw.states.link_dest:
                            if (cellView.model.attributes.type === "devs.Link")
                                break;
                            if (iw.sourceID === iw.focus.model.attributes.id.toString()) {
                                $("#nome").val("Impossibile creare un link con sorgente e destinazione uguale");
                            }else {
                                let link = new joint.shapes.devs.Link({
                                    source: {
                                        id: iw.sourceID,
                                        port: 'out'
                                    },
                                    target: {
                                        id: iw.focus.model.attributes.id.toString(),
                                        port: 'in'
                                    },
                                    connector: {name: 'rounded'},
                                    router: {name: 'metro'}
                                });
                                iw.graph.addCell(link);
                                $("#nome").val("Perfettto! Link creato");
                            }
                            iw.state = iw.states.idle_stat;
                            break;

                        default:
                            alert("L'editor è in uno stato di errore");
                    }
                }
            );

            $("#"+name_editor).on("input", function(e) {
                if (this.focus !== undefined) {
                    iw.focus.model.attr('text/text', e.currentTarget.value.toString());
                }
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
            iw.setResource("boundary", ret)
        }, 'text');

        this.processing++;
        $.get('./elements/actor.svg', function(ret){
            iw.setResource("actor", ret)
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

        this.resources[name].set('inPorts', ['in']);
        this.resources[name].set('outPorts', ['out']);

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

    newLink() {
        if (this.state === this.states.idle_stat) {
            this.state = this.states.link_source;
            $("#nome").val("Selezione oggetto di partenza");
        }
    }
}

iw = new Ironworks();

let testExport = "";
let testImport = "";

$(function() {
    iw.initializeEditor('my_editor', 'nome');

    $("#add_boundary").click(function() {
        iw.newElem("boundary", 10, 10, "LoginPage");
    });
    $("#add_control").click(function() {
        iw.newElem("control", 10, 10, "LoginPage");
    });
    $("#add_entity").click(function() {
        iw.newElem("entity", 10, 10, "LoginPage");
    });
    $("#add_actor").click(function() {
        iw.newElem("actor", 10, 10, "LoginPage");
    });
    $("#add_link").click(function() {
        iw.newLink();
    });

    $('#generate').click(function () {
        console.log("----");

        let toSend = iw.graph.toJSON();
            toSend = JSON.stringify(iw.graph);
        testExport = toSend;
        console.log(toSend);

        console.log("----");
        // Call to server
        $.ajax({
            url: '/test',
            type: 'post',
            data: toSend,
            contentType: 'application/json',
            dataType: 'json',
            success: function(data) {
                console.log("Reiceving...");
                console.log(data);
                testImport = data;
            },
            error: function () {
                console.log("Error");
            }
        })
    });

    $('#load').click(function() {
        let imported = testImport;
        console.log('Importing...string:');
        console.log(testImport);
        console.log('Importing...json:');
        console.log(imported);
        //let fukingTest = JSON.stringify(testExport);
        iw.graph.fromJSON(testImport);
        //iw.graph.fromJSON(imported);
        /*console.log(fukingTest);
        console.log('------');
        console.log(testImport);
        console.log('------');
        console.log(testImport === fukingTest);*/
    });
});