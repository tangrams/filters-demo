/*jslint browser: true*/
/*global Tangram, gui */

(function () {

    // Get location from URL
    var locations = {
        'London': [51.508, -0.105, 15],
        'New York': [40.70531887544228, -74.00976419448853, 16],
        'Seattle': [47.609722, -122.333056, 15]
    };

    var map_start_location = locations['New York'];

    /*** URL parsing ***/

    // leaflet-style URL hash pattern:
    // #[zoom],[lat],[lng]
    var url_hash = window.location.hash.slice(1, window.location.hash.length).split('/');

    if (url_hash.length == 3) {
        map_start_location = [url_hash[1],url_hash[2], url_hash[0]];
        // convert from strings
        map_start_location = map_start_location.map(Number);
    }

    /*** Map ***/

    var map = L.map('map', {
        maxZoom: 20,
        inertia: false,
        keyboard: true
    });
    var layer = Tangram.leafletLayer({
        scene: 'scene.yaml',
        attribution: 'Map data &copy; OpenStreetMap contributors | <a href="https://github.com/tangrams/tangram" target="_blank">Source Code</a>'
    });

    window.layer = layer;
    var scene = layer.scene;
    window.scene = scene;

    map.setView(map_start_location.slice(0, 2), map_start_location[2]);

    var hash = new L.Hash(map);
    
    // Resize map to window
    function resizeMap() {
        document.getElementById('map').style.width = window.innerWidth + 'px';
        document.getElementById('map').style.height = window.innerHeight + 'px';
        map.invalidateSize(false);
    }

    window.addEventListener('resize', resizeMap);
    resizeMap();

    // Create dat GUI
    var gui = new dat.GUI({ autoPlace: true });
    function addGUI () {

        gui.domElement.parentNode.style.zIndex = 5; // make sure GUI is on top of map
        window.gui = gui;

        // add color controls for each layer
        var layer_gui = gui.addFolder('Layers');
        var layer_colors = {};
        var layer_controls = {};
        Object.keys(layer.scene.config.layers).forEach(function(l) {
            if (!layer.scene.config.layers[l]) {
                return;
            }

            layer_controls[l] = !(layer.scene.config.layers[l].visible == false);
            layer_gui.
                add(layer_controls, l).
                onChange(function(value) {
                    layer.scene.config.layers[l].visible = value;
                    layer.scene.rebuildGeometry();
                });
            try {
                var c = layer.scene.config.layers[l].draw.polygons.color;
            }
            catch(e) {
                var c = layer.scene.config.layers[l].draw.lines.color;
            }
        });
 
        gui["building height"] = 0;
        var bheight = gui.add(gui, "building height", 0, 150);
        bheight.onChange(function(value) {
            scene.styles["buildings"].shaders.uniforms.u_height = value;
            scene.requestRedraw();

        });
        gui["geo filter"] = 0;
        var geoheight = gui.add(gui, "geo filter", 0, 150);
        geoheight.onChange(function(value) {
            scene.config.layers["buildings"].properties.min_height = value;
            scene.rebuildGeometry();
        });
        gui["shader filter"] = 0;
        var height = gui.add(gui, "shader filter", 0, 150);
        height.onChange(function(value) {
            scene.styles["buildings"].shaders.uniforms.u_color_height = value;
            scene.requestRedraw();
        });

        gui.roadwidth = 5;
        var roadwidth = gui.add(gui, "roadwidth", 0, 100);
        roadwidth.onChange(function(value) {
            scene.config.layers["roads"].properties.width = value;
            // console.log(scene.config.layers["roads"].properties.width);
            // scene.config.layers["roads"].style.width
            // scene.config.layers["roads"].bridges.properties.width = value;
            scene.rebuildGeometry();
            scene.requestRedraw();
        });

    }

    // Add map
    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
            addGUI();
        });
        layer.addTo(map);
    });

}());
