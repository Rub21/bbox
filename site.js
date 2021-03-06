window.onload = function() {
    var url = "http://www.overpass-api.de/api/xapi?map?bbox=";
    var map = new MM.Map('map',
        new MM.Layer(
            new MM.TemplatedMapProvider(
                'http://c.tiles.mapbox.com/v3/lxbarth.map-9zigz7z2/{Z}/{X}/{Y}.png'
            )
        )
    );
    map.setZoomRange(2, 18);

    // Set up box selector and update query div with result.
    var bbox = [0, 0, 0, 0];
    var box = wax.mm.boxselector(map, null, function(c) {
        bbox = [
            c[0].lon.toPrecision(8),
            c[1].lat.toPrecision(8),
            c[1].lon.toPrecision(8),
            c[0].lat.toPrecision(8)
        ];
        var query = document.getElementById('query');
        query.innerText = url + bbox.join(',');
        var query = document.getElementById('parameters');
        query.innerText = 'NW lon: ' + bbox[0] +
                          ' NW lat: ' + bbox[3] +
                          ' SE lon: ' + bbox[2] +
                          ' SE lat: ' + bbox[1] +
                          ' Center lon: ' + (parseFloat(bbox[2]) + (bbox[0] - bbox[2]) / 2) +
                          ' Center lat: ' + (parseFloat(bbox[1]) + (bbox[3] - bbox[1]) / 2);

        var center = map.getCenter();
        window.location.hash =
            bbox.concat([map.getZoom(), center.lat, center.lon]).join(',');
    });
    var param = window.location.hash.substr(1).split(',');
    if (param.length == 7) {
        map.setZoom(param[4]).setCenter({ lat: param[5], lon: param[6] });
        box.extent([{lat: param[3], lon: param[0]}, {lat: param[1], lon: param[2]}]);
    } else {
        map.setZoom(2).setCenter({ lat: 18, lon: 0 });
    }
    map.addCallback('drawn', function(m) {
        var center = map.getCenter();
        window.location.hash =
            bbox.concat([map.getZoom(), center.lat, center.lon]).join(',');
    });

    // Select query when clicked.
    var elements = document.getElementsByClassName('selectcopy');
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', function(e) {
            var range = document.createRange();
            range.selectNode(e.target);
            window.getSelection().addRange(range);
            e.target.select && e.target.select();
        });
    };

    // Make sure map navigation does not interfere with box
    // selecting - TODO: Is this necessary or am I missing sth?
    window.addEventListener('keydown', function() {
        var h;
        while (h = map.eventHandlers.pop()) { h.remove(); }
    });
    window.addEventListener('keyup', function() {
        if (map.eventHandlers.length == 2) return;
        map.eventHandlers = [
            new MM.MouseHandler(map),
            new MM.TouchHandler(map)
        ];
    });
};
