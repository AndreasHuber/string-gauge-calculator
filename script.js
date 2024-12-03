const MM_PER_INCH = 25.4;
const INCH_PER_MM = 1 / MM_PER_INCH;

const PRESETS = {
    '8-string': {
        reference: { scale: 25.5, gauge: 0.042, note: 'E2', type: 'wound' },
        strings: ['E4', 'B3', 'G3', 'D3', 'A2', 'E2', 'B1', 'F#1'],
        scale: 27
    },
    '5-string-bass': {
        reference: { scale: 34, gauge: 0.100, note: 'E1', type: 'wound' },
        strings: ['G2', 'D2', 'A1', 'E1', 'B0'],
        scale: 35
    },
    'drop-c': {
        reference: { scale: 25.5, gauge: 0.042, note: 'E2', type: 'wound' },
        strings: ['D4', 'A3', 'F3', 'C3', 'G2', 'C2'],
        scale: 27
    },
    'drop-c-bass': {
        reference: { scale: 34, gauge: 0.100, note: 'E1', type: 'wound' },
        strings: ['F2', 'C2', 'G1', 'C1'],
        scale: 34
    },
    'fifths-guitar': {
        reference: { scale: 25.5, gauge: 0.042, note: 'E2', type: 'wound' },
        strings: ['E4', 'A3', 'D3', 'G2', 'C2', 'F1'],
        scale: 27
    },
    'fifths-bass': {
        reference: { scale: 34, gauge: 0.100, note: 'E1', type: 'wound' },
        strings: ['A2', 'D2', 'G1', 'C1'],
        scale: 34
    },
    'bass-with-f#': {
        reference: { scale: 34, gauge: 0.100, note: 'E1', type: 'wound' },
        strings: ['G2', 'D2', 'A1', 'E1', 'B0', 'F#0'],
        scale: 33.25,
        lastScale: 37
    },
    'meshugga': {
        reference: { scale: 25.5, gauge: 0.042, note: 'E2', type: 'wound' },
        strings: ['D#4', 'A#3', 'F#3', 'C#3', 'G#2', 'D#2', 'A#1', 'F1'],
        scale: 29.4
    },
    'fifths-multiscale': {
        reference: { scale: 25.5, gauge: 0.042, note: 'E2', type: 'wound' },
        strings: ['E4', 'A3', 'D3', 'G2', 'C2', 'F1'],
        scale: 25.5,
        lastScale: 27.5
    },
    'fifths-with-b': {
        reference: { scale: 25.5, gauge: 0.042, note: 'E2', type: 'wound' },
        strings: ['B3', 'E4', 'A3', 'D3', 'G2', 'C2', 'F1'],
        scale: 27
    },
    'fifths-bass-f0': {
        reference: { scale: 34, gauge: 0.100, note: 'E1', type: 'wound' },
        strings: ['A2', 'D2', 'G1', 'C1', 'F0'],
        scale: 34,
        lastScale: 37
    },
    'fifths-bass-multiscale': {
        reference: { scale: 34, gauge: 0.100, note: 'E1', type: 'wound' },
        strings: ['E3', 'A2', 'D2', 'G1', 'C1'],
        scale: 33,
        lastScale: 35
    }
};

function setupInputListeners() {
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculate);
    });
}

function addRemoveButtonListener(button) {
    button.addEventListener('click', function() {
        const row = this.closest('tr');
        const tableBody = row.parentNode;
        const rows = Array.from(tableBody.querySelectorAll('tr.string'));
        const rowIndex = rows.indexOf(row);

        if (rows.length <= 2) return;

        row.remove();

        if (rowIndex === 0 || rowIndex === rows.length - 1) {
            const newRow = rowIndex === 0 ? rows[1] : rows[rows.length - 2];
            const inputField = row.querySelector('td:nth-child(3) input');
            if (inputField) {
                newRow.querySelector('td:nth-child(3)').textContent = '';
                newRow.querySelector('td:nth-child(3)').appendChild(inputField);
            }
        }

        const lastScaleLength = parseFloat(document.getElementById('scale-length-last-string').value);
        if (!isNaN(lastScaleLength) || document.querySelector('.info-box')) {
            calculate();
        }
    });
}

function addString(position) {
    const stringsContainer = document.querySelector('#strings tbody');
    const newStringRow = document.createElement('tr');
    newStringRow.className = 'string';
    newStringRow.innerHTML = `
        <td>
            <button class="remove-string"><span class="icon-cross">✖️</span></button>
        </td>
        <td><input type="text" value=""></td>
        <td></td>
        <td></td>
        <td></td>
    `;

    const firstRow = stringsContainer.querySelector('tr.string');
    const lastRow = stringsContainer.querySelector('tr.string:last-child');
    const inputField = (position === 'start' ? firstRow : lastRow).querySelector('td:nth-child(3) input');

    if (inputField) {
        (position === 'start' ? firstRow : lastRow).querySelector('td:nth-child(3)').removeChild(inputField);
        newStringRow.querySelector('td:nth-child(3)').appendChild(inputField);
    }

    stringsContainer.insertBefore(newStringRow, position === 'start' ? stringsContainer.firstChild.nextSibling : stringsContainer.lastChild);

    addRemoveButtonListener(newStringRow.querySelector('.remove-string'));
    setupInputListeners();
    calculate();
}

function convertValue(value, toMM) {
    return toMM ? value * MM_PER_INCH : value * INCH_PER_MM;
}

function setupUnitToggleListener() {
    document.querySelectorAll('input[name="unit"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const toMM = this.value === 'mm';

            const scaleLength = document.getElementById('scale-length');
            const firstString = document.getElementById('scale-length-first-string');
            const lastString = document.getElementById('scale-length-last-string');
            const gauge = document.getElementById('preferred-gauge');

            [scaleLength, firstString, lastString].forEach(input => {
                if (input && input.value) {
                    input.value = toMM ?
                        Math.round(convertValue(parseFloat(input.value), true)) :
                        convertValue(parseFloat(input.value), false).toFixed(1);
                }
                if (input && input.placeholder) {
                    input.placeholder = toMM ?
                        Math.round(convertValue(parseFloat(input.placeholder), true)) :
                        convertValue(parseFloat(input.placeholder), false).toFixed(1);
                }
            });

            if (gauge.value) {
                gauge.value = toMM ?
                    convertValue(parseFloat(gauge.value), true).toFixed(2) :
                    convertValue(parseFloat(gauge.value), false).toFixed(3);
            }

            calculate();
        });
    });
}

function calculate() {
    const referenceIsWound = document.getElementById('is-wound').checked;
    const referenceGauge = parseFloat(document.getElementById('preferred-gauge').value);
    const referenceNote = document.getElementById('preferred-note').value.toUpperCase();
    const referenceScaleLength = parseFloat(document.getElementById('scale-length').value);
    const firstScaleLength = parseFloat(document.getElementById('scale-length-first-string').value);

    if (!referenceGauge || !referenceNote || !referenceScaleLength || !firstScaleLength) return;

    const lastScaleLength = parseFloat(document.getElementById('scale-length-last-string').value);
    const multiscale = !isNaN(lastScaleLength);
    const isMM = document.querySelector('input[name="unit"]:checked').value === 'mm';
    if (!multiscale) {
        document.getElementById('scale-length-last-string').placeholder = firstScaleLength.toFixed(isMM ? 0 : 1);
    }
    const stringElements = document.querySelectorAll('.string');
    
    const interpolatedScaleLengths = Array.from(stringElements, (_, i) =>
        firstScaleLength + (multiscale ? (lastScaleLength - firstScaleLength) * (i / (stringElements.length - 1)) : 0)
    );

    const semitoneRatio = Math.pow(2, 1/12);
    const noteToSemitone = {
        'CB':-1, 'C': 0, 'C#': 1,
        'DB': 1, 'D': 2, 'D#': 3,
        'EB': 3, 'E': 4, 'E#': 5,
        'FB': 4, 'F': 5, 'F#': 6,
        'GB': 6, 'G': 7, 'G#': 8,
        'AB': 8, 'A': 9, 'A#': 10,
        'BB':10, 'B': 11,'B#': 12,
    };

    const getSemitoneValue = (note) => {
        const notePart = note.slice(0, -1);
        const octave = parseInt(note.slice(-1));
        return noteToSemitone[notePart] + 12 * (octave + 1);
    };

    const referenceSemitone = getSemitoneValue(referenceNote);

    stringElements.forEach((stringElement, index) => {
        const targetNote = stringElement.querySelector('input').value.toUpperCase();
        if (!targetNote) return;

        const targetSemitone = getSemitoneValue(targetNote);
        const semitoneDifference = referenceSemitone - targetSemitone;
        let recommendedGauge = referenceGauge * Math.pow(semitoneRatio, semitoneDifference) * (referenceScaleLength / interpolatedScaleLengths[index]);

        const thresholdInches = 0.020;
        const thresholdMM = thresholdInches * MM_PER_INCH;  // ~0.508mm
        const threshold = isMM ? thresholdMM : thresholdInches;
        
        let type = recommendedGauge < threshold ? 'plain' : 'wound';
        if (referenceIsWound && type === 'plain') {
            recommendedGauge /= 1.2;
        } else if (!referenceIsWound && type === 'wound') {
            recommendedGauge *= 1.2;
        }

        const typeCell = stringElement.querySelector('td:nth-child(5)');
        const resultCell = stringElement.querySelector('td:nth-child(4)');
        const scaleLengthCell = stringElement.querySelector('td:nth-child(3)');
        if (!scaleLengthCell.querySelector('input')) {
            scaleLengthCell.textContent = interpolatedScaleLengths[index].toFixed(isMM ? 0 : 1);
        }

        typeCell.textContent = type;
        resultCell.textContent = recommendedGauge.toFixed(isMM ? 2 : 3);

        const existingInfoBox = stringElement.querySelector('.info-box');
        if (existingInfoBox) {
            existingInfoBox.remove();
        }

        if (recommendedGauge < 0.007) {
            const infoBox = document.createElement('div');
            infoBox.className = 'info-box';
            infoBox.textContent = 'ℹ️ Tune lower?';

            const closeButton = document.createElement('button');
            closeButton.textContent = '✖️';
            closeButton.onclick = function() {
                infoBox.remove();
            };

            infoBox.appendChild(closeButton);

            infoBox.style.top = (resultCell.offsetTop + resultCell.offsetParent.offsetTop) + 'px';
            infoBox.style.left = (resultCell.offsetLeft + resultCell.offsetParent.offsetLeft) + 'px';
            infoBox.style.width = (resultCell.offsetWidth + typeCell.offsetWidth - 16) + 'px';

            stringElement.appendChild(infoBox);
        }
    });
};

function applyPreset(preset) {
    const data = PRESETS[preset];
    const isMM = document.querySelector('input[name="unit"]:checked').value === 'mm';

    // Set reference values
    document.getElementById('scale-length').value = isMM ?
        (data.reference.scale * MM_PER_INCH).toFixed(0) :
        data.reference.scale.toFixed(1);
    document.getElementById('preferred-gauge').value = isMM ?
        (data.reference.gauge * MM_PER_INCH).toFixed(2) :
        data.reference.gauge.toFixed(3);
    document.getElementById('preferred-note').value = data.reference.note;
    document.getElementById(data.reference.type === 'wound' ? 'is-wound' : 'is-plain').checked = true;

    // Get current and target string counts
    const currentStrings = document.querySelectorAll('.string');
    const targetStringCount = data.strings.length;
    
    // Add or remove strings to match the target count
    if (currentStrings.length > targetStringCount) {
        for (let i = currentStrings.length - 1; i >= targetStringCount; i--) {
            currentStrings[i].querySelector('.remove-string').click();
        }
    } else if (currentStrings.length < targetStringCount) {
        for (let i = currentStrings.length; i < targetStringCount; i++) {
            addString('end');
        }
    }

    // Update all string values and scale lengths
    const strings = document.querySelectorAll('.string');
    data.strings.forEach((note, i) => {
        strings[i].querySelector('td:nth-child(2) input').value = note;
        
        // Set scale lengths for first and last string
        if (i === 0) {
            const scaleInput = document.getElementById('scale-length-first-string');
            scaleInput.value = isMM ? (data.scale * MM_PER_INCH).toFixed(0) : data.scale.toFixed(1);
        } else if (i === data.strings.length - 1) {
            const scaleInput = document.getElementById('scale-length-last-string');
            if (data.lastScale) {
                scaleInput.value = isMM ? (data.lastScale * MM_PER_INCH).toFixed(0) : data.lastScale.toFixed(1);
            } else {
                // Clear or set to first string's scale length for non-multiscale
                scaleInput.value = '';
                scaleInput.placeholder = isMM ? (data.scale * MM_PER_INCH).toFixed(0) : data.scale.toFixed(1);
            }
        }
    });

    calculate();
}

document.querySelectorAll('.remove-string').forEach(button => {
    addRemoveButtonListener(button);
});

document.querySelector('.add-end').addEventListener('click', function() {
    addString('end');
});

document.querySelector('.add-front').addEventListener('click', function() {
    addString('start');
});

calculate();
setupInputListeners();
setupUnitToggleListener();

document.querySelectorAll('.preset').forEach(button => {
    button.addEventListener('click', () => applyPreset(button.dataset.preset));
});
