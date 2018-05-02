class Ironworks {
    constructor() {
        // Some indispensable variables
        // Counter of how many process are loading before editor can start
        this.processing = 0;
        // Collection of base resources
        this.resources = {};

        // JoinJs variables
        this.graph = false;
        this.paper = false;
        this.editorInitialized = false;
        this.nameEditor = false;

        // List of elements in the graph -- to remove? usless for now...
        this.elements = [];
        // List of elements that must be inserted after the resources are loaded
        this.queueElements = [];

        // Store for element currently focused
        this.focus = false;

        // States of graph
        this.states = Object.freeze({
            idleStat:1,    // Nothing in particular, just draw
            linkSource:2,  // First step of linking, select starting element
            linkDest:3     // Second and last step of linking, select target element
        });
        // Current state of the graph
        this.state = this.states.idleStat;
        // ID of the starting element to be linked
        this.sourceID = false;

        // Now we have to load all resources:
        this.loadResource("boundary.svg");
        this.loadResource("control.svg");
        this.loadResource("entity.svg");
        this.loadResource("actor.svg");
    }

    /**
     * This method initialize the editor, creating JointJs graph and paper
     * @param nomeTarget - ID of the target element, the graph placeholder
     * @param nameEditor - ID of the input for the name change of elements
     */
    initializeEditor(nomeTarget, nameEditor) {
        if (!this.editorInitialized) {
            let target = $("#"+nomeTarget);
            this.nameEditor = $("#"+nameEditor);

            // Initialize JointJs creating graph
            this.graph = new joint.dia.Graph;
            this.paper = new joint.dia.Paper({
                el: target,
                width: target.width(),      // We will pick current placeholder dimension
                height: target.height(),    // TODO: Resize of the page...
                gridSize: 5,                // Spaces between anchor point
                model: this.graph
            });

            this.paper.on('cell:pointerdown',
                /**
                 *  Here we will catch element click event, we have to check multiple situations
                 * @param cellView - focused element
                 * @param evt - --- not used ---
                 * @param x - --- not used ---
                 * @param y - --- not used ---
                 */
                function(cellView, evt, x, y) {
                    // Store current element as focused element
                    // !!! Care that we are out of IW class, we are on async call, so we can't use "this" but "iw"
                    iw.focus = cellView;

                    // Switch state of editor
                    switch (iw.state) {
                        // If idle state just prepare the "name_edit" input
                        case iw.states.idleStat:
                            // If it's a link just skip
                            if (cellView.model.attributes.type === "devs.Link")
                                break;
                            let text = cellView.model.attributes.attrs.text.text;
                            iw.focus = cellView;
                            iw.nameEditor.val(text);
                            break;

                        // We are selecting first element for a link
                        case iw.states.linkSource:
                            // If it's a link just skip
                            if (cellView.model.attributes.type === "devs.Link")
                                break;
                            // Grabbing his ID
                            iw.sourceID = iw.focus.model.attributes.id.toString() + '';
                            // Next step of linking
                            iw.state = iw.states.linkDest;
                            // Just say to user to select next element
                            iw.nameEditor.val("Selezione oggetto di destinazione");
                            break;

                        // We are selecting last element for a link
                        case iw.states.linkDest:
                            // If it's a link just skip
                            if (cellView.model.attributes.type === "devs.Link")
                                break;
                            // If same element just sai it to user and ignore this link
                            if (iw.sourceID === iw.focus.model.attributes.id.toString()) {
                                iw.nameEditor.val("Impossibile creare un link con sorgente e destinazione uguale");
                            } else {
                                // Creating link between two selected elements
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
                                // Adding link to graph
                                iw.graph.addCell(link);
                                // Notice user that it's all ok... just calm down!!
                                iw.nameEditor.val("Perfettto! Link creato");
                            }
                            // back to IDLE state
                            iw.state = iw.states.idleStat;
                            break;

                        default:
                            // Not in an acceptable state? OMG ERROR!! this is not so good! for real... not joking
                            alert("L'editor è in uno stato di errore");
                    }
                }
            );

            this.nameEditor.on("input",
                /**
                 * When user edit name bar val just change name of the focussed element
                 * @param e - Event
                 */
                function(e) {
                    // if we are on IDLE state we can change name of element, if one i focussed
                    if (iw.focus !== undefined && iw.state === iw.states.idleStat) {
                        iw.focus.model.attr('text/text', e.currentTarget.value.toString());
                    }
                });
        }
    }

    /**
     * Here we just start editor if no process are currently running
     * @returns {boolean}
     */
    startEditor() {
        if (this.processing !== 0)
            return false;

        // Nothing to do here... joke... if we have elements in queue we have to insert them into graph
        if (this.queueElements.length > 0) {
            for (let key in this.queueElements) {
                let el = this.queueElements[key];
                this.newElement(el.elem, el.x, el.y, el.name);
            }
        }
    }

    /**
     * Load resources, elements of the graph in particular
     */
    loadResource() {
        // Increase process counter, until this resource is loaded we won't start editor
        this.processing++;
        // Load svg resource, when is loaded call setResource(...)
        $.get('./elements/boundary.svg', function(ret){
            // Decrease process counting, this res is loaded
            iw.processing--;
            iw.setResource("boundary", ret)
        }, 'text');

        this.processing++;
        $.get('./elements/actor.svg', function(ret){
            // Decrease process counting, this res is loaded
            iw.processing--;
            iw.setResource("actor", ret)
        }, 'text');

        this.processing++;
        $.get('./elements/control.svg', function(ret){
            // Decrease process counting, this res is loaded
            iw.processing--;
            iw.setResource("control", ret)
        }, 'text');

        this.processing++;
        $.get('./elements/entity.svg', function(ret){
            // Decrease process counting, this res is loaded
            iw.processing--;
            iw.setResource("entity", ret)
        }, 'text');
    }

    /**
     * Add a resource to ironworks
     * @param - name Name of the resource
     * @param - res Resource to be saved
     */
    setResource(name, res) {
        // Create JointJs element and save in collector of iw's base elements
        this.resources[name] = new joint.shapes.basic.Image({
            // Size of the element
            size: {
                width: 100,
                height: 100
            },
            // Position of the element
            position: {
                x: 0,
                y: 0
            },
            attrs: {
                // This is what user see, so size, image, and aspect ratio.
                image: {
                    width: 100,
                    height: 100,
                    'xlink:href': 'data:image/svg+xml;utf8,' + encodeURIComponent(res),
                    preserveAspectRatio: 'xMinYMin slice'
                },
                // Text under element
                text: { 'font-size': 14, 'ref-x': .5, 'ref-y': -2, ref: 'image', 'y-alignment': 'middle', 'x-alignment': 'middle', 'text': name }
            }
        });

        // We have to set an input and output port for linking...
        this.resources[name].set('inPorts', ['in']);
        this.resources[name].set('outPorts', ['out']);

        // if no more process are running we can start editor
        if (this.processing === 0)
            this.startEditor();
    }

    /**
     * Add a new element to graph, only if res is loaded
     * @param element - Kind of base element to be crated
     * @param x - X pos of the element
     * @param y - Y pos of the element
     * @param name - Name of the element --- not jet implemented
     * @returns {boolean}
     */
    newElement (element, x, y, name) {
        // If resource is not jet loaded we put this element in element's queue
        if (!(element in this.resources)){
            console.log(element + " not yet loaded...");
            this.queueElements.push({
                'elem': element,
                'x': x,
                'y': y,
                'name': name});
            return false;
        }

        // TODO: generate ID ??
        // TODO: check if ID already inside graph
        // TODO: Name of the element --- if entity it must be unique!!

        // Clone base resource but change position with requested.
        let key = this.elements.push( this.resources[element].clone().position(x, y));
        // Add new element in graph
        this.graph.addCells( this.elements[key-1] );
    }

    /**
     * Create new link in graph
     */
    newLink() {
        // If we are in idle stat we can start creating new link, so set the editor status
        if (this.state === this.states.idleStat) {
            this.state = this.states.linkSource;
            this.nameEditor.val("Selezione oggetto di partenza");
        }
    }
}

// Initialize new IronWorks editor
iw = new Ironworks();

// To store received Json from server, our "checkpoint"
let receivedJSON = "";

/**
 * When dom is loaded we can start working
 */
$(function() {
    // Now we can initialize editor
    iw.initializeEditor('my_editor', 'nome');

    // When user click one input for adding element we catch event and call iw function
    $('#add_boundary').click(function() {
        iw.newElement("boundary", 10, 10, "LoginPage");
    });
    $('#add_control').click(function() {
        iw.newElement("control", 10, 10, "LoginPage");
    });
    $('#add_entity').click(function() {
        iw.newElement("entity", 10, 10, "LoginPage");
    });
    $('#add_actor').click(function() {
        iw.newElement("actor", 10, 10, "LoginPage");
    });
    $('#add_link').click(function() {
        iw.newLink();
    });

    // When user click "generate/save" button
    $('#generate').click(function () {
        // We have to stringify graph and save to variable
        let toSend = JSON.stringify(iw.graph);

        // Json call to server, sending our stringify graph
        $.ajax({
            url: '/test',
            type: 'post',
            data: toSend,
            contentType: 'application/json',
            dataType: 'json',
            success: function(data) {
                // On success we have to receive back same data
                receivedJSON = data;
            },
            error: function () {
                // If call don't go well
                console.log("Error");
            }
        })
    });

    // When user click load button we will load last save
    $('#load').click(function() {
        // JointJs load from received Json...
        iw.graph.fromJSON(receivedJSON);
    });
});