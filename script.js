function addRemoveButtonListener(button) {
    button.addEventListener('click', function() {
        const row = this.closest('tr');
        const tableBody = row.parentNode;
        const rows = Array.from(tableBody.querySelectorAll('tr.string'));
        const rowIndex = rows.indexOf(row);

        if (rows.length > 2) {
            row.remove();

            if (rowIndex === 0 || rowIndex === rows.length - 1) {
                const newRow = rowIndex === 0 ? rows[1] : rows[rows.length - 2];
                const inputField = row.querySelector('td:nth-child(3) input');
                if (inputField) {
                    newRow.querySelector('td:nth-child(3)').textContent = '';
                    newRow.querySelector('td:nth-child(3)').appendChild(inputField);
                }
            }
        }
    });
}

function addString(position) {
    const stringsContainer = document.querySelector('#strings tbody');
    const newStringRow = document.createElement('tr');
    newStringRow.className = 'string';
    newStringRow.innerHTML = `
        <tr class="string">
            <td>
                <button class="remove-string"><span class="icon-cross"></span></button>
            </td>
            <td><input type="text" value=""></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
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
}

function calculate() {
    const referenceIsWound = document.getElementById('is-wound').checked;
    const referenceGauge = parseFloat(document.getElementById('preferred-gauge').value);
    const referenceNote = document.getElementById('preferred-note').value.toUpperCase();
    const scaleLength = parseFloat(document.getElementById('scale-length').value);

    const firstScaleLength = parseFloat(document.getElementById('scale-length-first-string').value);
    const lastScaleLength = parseFloat(document.getElementById('scale-length-last-string').value);
    const multiscale = !isNaN(lastScaleLength);
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
        if (targetNote) {
            const targetSemitone = getSemitoneValue(targetNote);
            const semitoneDifference = referenceSemitone - targetSemitone;
            let recommendedGauge = referenceGauge * Math.pow(semitoneRatio, semitoneDifference) * (scaleLength / interpolatedScaleLengths[index]);

            let type = recommendedGauge < 0.020 ? 'plain' : 'wound';
            if (referenceIsWound && type === 'plain') {
                recommendedGauge /= 1.2;
            } else if (!referenceIsWound && type === 'wound') {
                recommendedGauge *= 1.2;
            }

            const typeCell = stringElement.querySelector('td:nth-child(5)');
            const resultCell = stringElement.querySelector('td:nth-child(4)');
            const scaleLengthCell = stringElement.querySelector('td:nth-child(3)');
            if (!scaleLengthCell.querySelector('input')) {
                scaleLengthCell.textContent = interpolatedScaleLengths[index].toFixed(1);
            }

            typeCell.textContent = type;
            resultCell.textContent = recommendedGauge.toFixed(3);
        }
    });
};

document.querySelectorAll('.remove-string').forEach(button => {
    addRemoveButtonListener(button);
});

document.querySelector('.add-end').addEventListener('click', function() {
    addString('end');
});

document.querySelector('.add-front').addEventListener('click', function() {
    addString('start');
});

document.getElementById('calculate').addEventListener('click', calculate);