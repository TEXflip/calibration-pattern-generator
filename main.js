let export_data = {
    width_mm: 0,
    height_mm: 0,
    filename: '',
    info: ''
};

let OPENCV_DICTS = {
    "aruco": "DICT_ARUCO_ORIGINAL",
    "4x4_1000": "DICT_4X4_1000",
    "5x5_1000": "DICT_5X5_1000",
    "6x6_1000": "DICT_6X6_1000",
    "7x7_1000": "DICT_7X7_1000",
    "mip_36h12": "DICT_APRILTAG_36h12",
    "april_16h5": "DICT_APRILTAG_16h5",
    "april_25h9": "DICT_APRILTAG_25h9",
    "april_36h10": "DICT_APRILTAG_36h10",
    "april_36h11": "DICT_APRILTAG_36h11",
}

function generateMarkerInSvg(bits, svg, size, square_size, svgSize, row, col) {
    let x = col + (square_size - svgSize) / 2;
    let y = row + (square_size - svgSize) / 2;
    let cellSize = svgSize / (size + 2)
    let rect = document.createElement('rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', svgSize);
    rect.setAttribute('height', svgSize);
    rect.setAttribute('fill', 'black');
    svg.appendChild(rect);

    // "Pixels"
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            var white = bits[i * size + j];
            if (!white) continue;

            var pixel = document.createElement('rect');
            pixel.setAttribute('width', cellSize);
            pixel.setAttribute('height', cellSize);
            pixel.setAttribute('x', cellSize + x + j * cellSize);
            pixel.setAttribute('y', cellSize + y + i * cellSize);
            pixel.setAttribute('fill', 'white');
            svg.appendChild(pixel);
        }
    }
}

var dict;

function arucoMatrix(width, height, dictName, id) {
    var bytes = dict[dictName][id];
    var bits = [];
    var bitsCount = width * height;

    if (bytes === undefined) {
        console.error(dictName + " does not have id " + id);
        bits = new Array(bitsCount).fill(0);
        return bits;
    }

    // Parse marker's bytes
    for (var byte of bytes) {
        var start = bitsCount - bits.length;
        for (var i = Math.min(7, start - 1); i >= 0; i--) {
            bits.push((byte >> i) & 1);
        }
    }
    return bits;
}

function generateArucoMarker(size, markerSize, dictName, id) {
    bits = arucoMatrix(markerSize, markerSize, dictName, id);

    width = size * markerSize;
    height = size * markerSize;
    export_data.width_mm = size;
    export_data.height_mm = size;
    export_data.filename = 'aruco_' + OPENCV_DICTS[dictName] + '_' + id;
    export_data.info = 'Dictionary: ' + OPENCV_DICTS[dictName] + ' Marker id: ' + id;

    var svg = document.createElement('svg');
    svg.setAttribute('viewBox', '0 0 ' + (markerSize + 2) + ' ' + (markerSize + 2));
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.setAttribute('width', size + 'mm');
    svg.setAttribute('height', size + 'mm');
    var rect = document.createElement('rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', (markerSize + 2));
    rect.setAttribute('height', (markerSize + 2));
    rect.setAttribute('fill', 'black');
    svg.appendChild(rect);

    for (var i = 0; i < markerSize; i++) {
        for (var j = 0; j < markerSize; j++) {
            var white = bits[i * markerSize + j];
            if (!white) continue;

            var pixel = document.createElement('rect');
            pixel.setAttribute('width', 1);
            pixel.setAttribute('height', 1);
            pixel.setAttribute('x', j + 1);
            pixel.setAttribute('y', i + 1);
            pixel.setAttribute('fill', 'white');
            svg.appendChild(pixel);
        }
    }

    return svg;
}

function generateChessboardSvg(rows, columns, squareSize) {
    width = columns * squareSize;
    height = rows * squareSize;
    export_data.width_mm = width;
    export_data.height_mm = height;
    export_data.filename = 'chessboard_' + rows + 'x' + columns + '_' + squareSize + 'mm';
    export_data.info = 'Square size: ' + squareSize + 'mm' + ' size: ' + columns + 'x' + rows;

    var svg = document.createElement('svg');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', width + 'mm');
    svg.setAttribute('height', height + 'mm');
    svg.setAttribute('shape-rendering', 'crispEdges');
    var rect = document.createElement('rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('fill', 'black');
    svg.appendChild(rect);

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            if ((i + j) % 2 == 0) {
                continue;
            }
            var rect = document.createElement('rect');
            rect.setAttribute('x', j * squareSize);
            rect.setAttribute('y', i * squareSize);
            rect.setAttribute('width', squareSize);
            rect.setAttribute('height', squareSize);
            rect.setAttribute('fill', 'white');
            svg.appendChild(rect);
        }
    }
    return svg;
}

function generateCharucoBoard(rows, columns, squareSize, dictName, markerSize, startId = 0) {
    markerSizemm = squareSize - Math.floor((squareSize - 1) / 4) - 1;
    markerSizeSvg = markerSizemm / squareSize;
    width = columns * squareSize;
    height = rows * squareSize;

    export_data.width_mm = width;
    export_data.height_mm = height;
    export_data.filename = 'charuco_' + columns + 'x' + rows + '_' + squareSize + 'mm_' + markerSizemm + 'mm_' + OPENCV_DICTS[dictName];
    export_data.info = 'Dictionary: ' + OPENCV_DICTS[dictName] + 
                    ' Square size: ' + squareSize + 'mm' +
                    ' Marker size: ' + markerSizemm + 'mm' +
                    ' size: ' + columns + 'x' + rows +
                    ' start id: ' + startId;


    var svg = document.createElement('svg');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', width + 'mm');
    svg.setAttribute('height', height + 'mm');
    svg.setAttribute('shape-rendering', 'crispEdges');
    var rect = document.createElement('rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('fill', 'white');
    svg.appendChild(rect);

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            x = j * squareSize;
            y = i * squareSize;
            if ((i + j + 1) % 2 == 0) {
                var rect = document.createElement('rect');
                rect.setAttribute('x', x);
                rect.setAttribute('y', y);
                rect.setAttribute('width', squareSize);
                rect.setAttribute('height', squareSize);
                rect.setAttribute('fill', 'black');
                svg.appendChild(rect);
            }
            else {
                bits = arucoMatrix(markerSize, markerSize, dictName, startId++);
                generateMarkerInSvg(bits, svg, markerSize, squareSize, markerSizemm, y, x);
            }
        }
    }
    return svg;
}

function generateCircleBoard(rows, columns, circle_size_mm, circle_spacing_mm) {
    width = columns * (circle_size_mm + circle_spacing_mm);
    height = rows * (circle_size_mm + circle_spacing_mm);
    export_data.width_mm = width;
    export_data.height_mm = height;
    export_data.filename = 'circles_' + rows + 'x' + columns + '_' + circle_size_mm + 'mm_' + circle_spacing_mm + 'mm';
    export_data.info = 'Circle size: ' + circle_size_mm + 'mm' + ' Circle spacing: ' + circle_spacing_mm + 'mm' + ' size: ' + columns + 'x' + rows;

    var svg = document.createElement('svg');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('width', width + "mm");
    svg.setAttribute('height', height + "mm");
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('shape-rendering', 'crispEdges');
    var rect = document.createElement('rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('fill', 'white');
    svg.appendChild(rect);

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            var circle = document.createElement('circle');
            circle.setAttribute('cx', j * (circle_spacing_mm + circle_size_mm) + circle_spacing_mm / 2 + circle_size_mm / 2);
            circle.setAttribute('cy', i * (circle_spacing_mm + circle_size_mm) + circle_spacing_mm / 2 + circle_size_mm / 2);
            circle.setAttribute('r', circle_size_mm / 2);
            circle.setAttribute('fill', 'black');
            svg.appendChild(circle);
        }
    }

    return svg
}

function generateAsymmetricCircleBoard(rows, columns, circle_size_mm, circle_spacing_mm) {
    width = columns * (circle_size_mm + circle_spacing_mm);
    height = rows * (circle_size_mm + circle_spacing_mm);
    export_data.width_mm = width;
    export_data.height_mm = height;
    export_data.filename = 'circles_' + rows + 'x' + columns + '_' + circle_size_mm + 'mm_' + circle_spacing_mm + 'mm';
    export_data.info = 'Circle size: ' + circle_size_mm + 'mm' + ' Circle spacing: ' + circle_spacing_mm + 'mm' + ' size: ' + columns + 'x' + rows;

    var svg = document.createElement('svg');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.setAttribute('width', width + "mm");
    svg.setAttribute('height', height + "mm");
    var rect = document.createElement('rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('fill', 'white');
    svg.appendChild(rect);

    for (var i = 0; i < rows; i++) {
        for (var j = 0; i % 2 == 0 ? j < columns : j < columns - 1; j++) {
            cx = j * (circle_spacing_mm + circle_size_mm) + circle_spacing_mm / 2 + circle_size_mm / 2;
            if (i % 2 == 1) {
                cx += (circle_spacing_mm + circle_size_mm) / 2;
            }
            cy = i * (circle_spacing_mm + circle_size_mm) + circle_spacing_mm / 2 + circle_size_mm / 2;
            var circle = document.createElement('circle');
            circle.setAttribute('cx', cx);
            circle.setAttribute('cy', cy);
            circle.setAttribute('r', circle_size_mm / 2);
            circle.setAttribute('fill', 'black');
            svg.appendChild(circle);
        }
    }

    return svg
}

function export_svg() {
    var svg = document.querySelector('.marker').innerHTML;
    var blob = new Blob([svg], { type: 'image/svg+xml' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = export_data.filename + '.svg';
    a.click();
    a.remove();
}

function export_pdf() {
    margin_points = 10;
    mm_to_points = 2.8346456693;
    width_points = export_data.width_mm * mm_to_points + margin_points * 2;
    height_points = export_data.height_mm * mm_to_points + margin_points * 2;

    var svg = document.querySelector('.marker').innerHTML;
    const doc = new window.PDFDocument({ size: [width_points, height_points] });
    const chunks = [];
    const stream = doc.pipe({
        // writable stream implementation
        write: (chunk) => chunks.push(chunk),
        end: () => {
            const pdfBlob = new Blob(chunks, {
                type: 'application/octet-stream'
            });
            var blobUrl = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = export_data.filename + '.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            link.remove();
        },
        // readable streaaam stub iplementation
        on: (event, action) => { },
        once: (...args) => { },
        emit: (...args) => { },
    });
    
    window.SVGtoPDF(doc, svg, margin_points, margin_points)
    doc.fontSize(6);
    doc.text(export_data.info, margin_points, margin_points/3);

    doc.end();
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
    var spacingInput = document.querySelector('.setup input[name=spacing]');
    var rowsInput = document.querySelector('.setup input[name=rows]');
    var columnsInput = document.querySelector('.setup input[name=columns]');

    var form_spacing = document.querySelector('.frm-spacing');
    var form_label_size = document.querySelector('#label-size');
    var form_rows = document.querySelector('.frm-rows');
    var form_cols = document.querySelector('.frm-cols');
    var form_id = document.querySelector('.frm-id');
    var form_dict = document.querySelector('.frm-dict');
    var form_label_id = document.querySelector('#label-id');

    get_form_data = function () {
        var option = dictSelect.options[dictSelect.selectedIndex];
        return {
            markerId: Number(markerIdStartInput.value),
            size: Number(sizeInput.value),
            spacing: Number(spacingInput.value),
            dictName: option.value,
            maxId: (Number(option.getAttribute('data-number')) || 1000) - 1,
            marker_size: Number(option.getAttribute('data-height')),
            rows: Number(rowsInput.value),
            columns: Number(columnsInput.value),
            pattern: patternSelect.options[patternSelect.selectedIndex].value,
        }
    }

    update_form_status = function (spacing_visible, label_size_text, rows_and_cols_visible, start_id_visible, dict_visible, marker_id_text='Marker Id:', size = 20) {
        form_spacing.hidden = !spacing_visible;
        form_label_size.innerText = label_size_text;
        form_rows.hidden = !rows_and_cols_visible;
        form_cols.hidden = !rows_and_cols_visible;
        form_id.hidden = !start_id_visible;
        form_dict.hidden = !dict_visible;
        form_label_id.innerText = marker_id_text;
    }

    function updateMarker() {
        var { markerId, size, spacing, dictName, maxId, marker_size, rows, columns, pattern } = get_form_data();

        markerIdStartInput.setAttribute('max', maxId);

        if (markerId > maxId) {
            markerIdStartInput.value = maxId;
            markerId = maxId;
        }

        if (pattern == 'aruco') {
            svgFunGeneration = () => generateArucoMarker(size, marker_size, dictName, markerId);
            update_form_status(false, 'Marker size (mm):', false, true, true);
        } else if (pattern == 'charuco') {
            svgFunGeneration = () => generateCharucoBoard(rows, columns, size, dictName, marker_size, markerId);
            update_form_status(false, 'Square size (mm):', true, true, true, marker_id_text='Marker Id start:');
        } else if (pattern == 'circles') {
            svgFunGeneration = () => generateCircleBoard(rows, columns, size, spacing);
            update_form_status(true, 'Circle size (mm):', true, false, false);
        } else if (pattern == 'acircles') {
            svgFunGeneration = () => generateAsymmetricCircleBoard(rows, columns, size, spacing);
            update_form_status(true, 'Circle size (mm):', true, false, false);
        } else { // chessboard
            svgFunGeneration = () => generateChessboardSvg(rows, columns, size);
            update_form_status(false, 'Square size (mm):', true, false, false);
        }

        // Wait until dict data is loaded
        loadDict.then(function () {
            var svg = svgFunGeneration();
            document.querySelector('.marker').innerHTML = svg.outerHTML;
        })
    }

    updateMarker();

    dictSelect.addEventListener('change', updateMarker);
    dictSelect.addEventListener('input', updateMarker);
    patternSelect.addEventListener('change', updateMarker);
    patternSelect.addEventListener('input', updateMarker);
    spacingInput.addEventListener('input', updateMarker);
    markerIdStartInput.addEventListener('input', updateMarker);
    sizeInput.addEventListener('input', updateMarker);
    rowsInput.addEventListener('input', updateMarker);
    columnsInput.addEventListener('input', updateMarker);
}

init();