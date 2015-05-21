/*jslint browser: true*/
/*global Tangram, gui */

(function () {

    // Get location from URL
    var locations = {
        'London': [51.508, -0.105, 15],
        'New York': [40.75, -74., 15],
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
        minZoom: 14,
        inertia: false,
        keyboard: true
    });
    var layer = Tangram.leafletLayer({
        scene: 'scene.yaml',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>',
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
    var gui = new dat.GUI({ autoPlace: true, width: 350 });
    function addGUI () {

        gui.domElement.parentNode.style.zIndex = 5; // make sure GUI is on top of map
        window.gui = gui;
 
        gui["building height"] = scene.styles["buildings"].shaders.uniforms.u_height;
        var bheight = gui.add(gui, "building height", 0, 3);
        bheight.onChange(function(value) {
            scene.styles["buildings"].shaders.uniforms.u_height = value;
            scene.requestRedraw();

        });
        gui["geo filter"] = 0;
        var geoheight = gui.add(gui, "geo filter", 0, 200);
        geoheight.onChange(function(value) {
            // scene.config.layers["buildings"].properties.filter_text = "";
            scene.config.layers["buildings"].properties.min_height = value;
            scene.rebuildGeometry();
        });
        gui["shader filter"] = 0;
        var height = gui.add(gui, "shader filter", 0, 200);
        height.onChange(function(value) {
            scene.styles["buildings"].shaders.uniforms.u_color_height = value;
            scene.styles["building-labels"].shaders.uniforms.u_color_height = value;
            scene.config.layers["buildings"].properties.min_height = value;
            scene.requestRedraw();
        });
   


        gui.input = scene.config.layers["buildings"].properties.filter_text;
        var input = gui.add(gui, 'input').name("filter text");
        input.onChange(function(value) {
            // scene.config.layers["buildings"].properties.min_height = 0;
            scene.config.layers["buildings"].properties.filter_text = value;
            scene.rebuildGeometry();
            scene.requestRedraw();
        });
        // select input text when you click on it
        input.domElement.id = "filterbox";
        input.domElement.onclick = function() { this.getElementsByTagName('input')[0].select(); };


    }

    // Add map
    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
            addGUI();
            var filterbox = document.getElementById('filterbox').getElementsByTagName('input')[0];
            filterbox.focus();
        });
        layer.addTo(map);
    });

}());
