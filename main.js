function generateMarkerSvg(width, height, bits, fixPdfArtifacts = true) {
    var svg = document.createElement('svg');
    svg.setAttribute('viewBox', '0 0 ' + (width + 2) + ' ' + (height + 2));
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('shape-rendering', 'crispEdges');

    // Background rect
    var rect = document.createElement('rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', width + 2);
    rect.setAttribute('height', height + 2);
    rect.setAttribute('fill', 'black');
    svg.appendChild(rect);

    // "Pixels"
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var white = bits[i * height + j];
            if (!white) continue;

            var pixel = document.createElement('rect');;
            pixel.setAttribute('width', 1);
            pixel.setAttribute('height', 1);
            pixel.setAttribute('x', j + 1);
            pixel.setAttribute('y', i + 1);
            pixel.setAttribute('fill', 'white');
            svg.appendChild(pixel);

            if (!fixPdfArtifacts) continue;

            if ((j < width - 1) && (bits[i * height + j + 1])) {
                pixel.setAttribute('width', 1.5);
            }

            if ((i < height - 1) && (bits[(i + 1) * height + j])) {
                var pixel2 = document.createElement('rect');;
                pixel2.setAttribute('width', 1);
                pixel2.setAttribute('height', 1.5);
                pixel2.setAttribute('x', j + 1);
                pixel2.setAttribute('y', i + 1);
                pixel2.setAttribute('fill', 'white');
                svg.appendChild(pixel2);
            }
        }
    }

    return svg;
}

var dict;

function generateArucoMarker(width, height, dictName, id) {
    console.log('Generate ArUco marker ' + dictName + ' ' + id);

    var bytes = dict[dictName][id];
    var bits = [];
    var bitsCount = width * height;

    // Parse marker's bytes
    for (var byte of bytes) {
        var start = bitsCount - bits.length;
        for (var i = Math.min(7, start - 1); i >= 0; i--) {
            bits.push((byte >> i) & 1);
        }
    }

    return generateMarkerSvg(width, height, bits);
}

function generateChessboardSvg(rows, columns, squareSize) {
    width = columns * squareSize;
    height = rows * squareSize;
    var svg = document.createElement('svg');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('shape-rendering', 'crispEdges');

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            var rect = document.createElement('rect');
            rect.setAttribute('x', j * squareSize);
            rect.setAttribute('y', i * squareSize);
            rect.setAttribute('width', squareSize);
            rect.setAttribute('height', squareSize);
            rect.setAttribute('fill', (i + j + 1) % 2 == 0 ? 'white' : 'black');
            svg.appendChild(rect);
        }
    }
    return svg;
}

function generateCharucoBoard(rows, columns, squareSize, markerSize, dictName, startId = 0) {

}

// Fetch markers dict
var loadDict = fetch('markers.json').then(function (res) {
    return res.json();
}).then(function (json) {
    dict = json;
});

function init() {
    var patternSelect = document.querySelector('.setup select[name=pattern]');
    var dictSelect = document.querySelector('.setup select[name=dict]');
    var markerIdStartInput = document.querySelector('.setup input[name=id]');
    var sizeInput = document.querySelector('.setup input[name=size]');
    var saveButton = document.querySelector('.save-button');
    var rowsInput = document.querySelector('.setup input[name=rows]');
    var columnsInput = document.querySelector('.setup input[name=columns]');

    var pattern_to_function = {
        'aruco': generateArucoMarker,
        'chessboard': generateChessboardSvg,
        'charuco': generateCharucoBoard
    };

    function updateMarker() {
        var markerId = Number(markerIdStartInput.value);
        var size = Number(sizeInput.value);
        var option = dictSelect.options[dictSelect.selectedIndex];
        var dictName = option.value;
        var maxId = (Number(option.getAttribute('data-number')) || 1000) - 1;
        var rows = Number(rowsInput.value);
        var columns = Number(columnsInput.value);
        var width = columns * size;
        var height = rows * size;
        var pattern = patternSelect.options[patternSelect.selectedIndex].value;

        markerIdStartInput.setAttribute('max', maxId);

        if (markerId > maxId) {
            markerIdStartInput.value = maxId;
            markerId = maxId;
        }

        // Wait until dict data is loaded
        loadDict.then(function () {
            var svg = generateChessboardSvg(rows, columns, size);
            svg.setAttribute('width', width + 'mm');
            svg.setAttribute('height', height + 'mm');
            document.querySelector('.marker').innerHTML = svg.outerHTML;
            saveButton.setAttribute('href', 'data:image/svg;base64,' + btoa(svg.outerHTML.replace('viewbox', 'viewBox')));
            saveButton.setAttribute('download', dictName + '-' + markerId + '.svg');
        })
    }

    updateMarker();

    dictSelect.addEventListener('change', updateMarker);
    dictSelect.addEventListener('input', updateMarker);
    markerIdStartInput.addEventListener('input', updateMarker);
    sizeInput.addEventListener('input', updateMarker);
    rowsInput.addEventListener('input', updateMarker);
    columnsInput.addEventListener('input', updateMarker);
}

init();