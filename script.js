document.getElementById('calculate').addEventListener('click', function() {
    const referenceIsWound = document.getElementById('is-wound').checked;
    const referenceGauge = parseFloat(document.getElementById('preferred-gauge').value);
    const referenceNote = document.getElementById('preferred-note').value.toUpperCase();
    const scaleLength = parseFloat(document.getElementById('scale-length').value);

    const firstScaleLength = parseFloat(document.getElementById('scale-length-first-string').value);
    let multiscale = false;
    const lastScaleLength = parseFloat(document.getElementById('scale-length-last-string').value);
    if (!isNaN(lastScaleLength)) {
        multiscale = true;
    }
    const stringElements = document.querySelectorAll('.string');
    let interpolatedScaleLengths = Array.from(stringElements, () => firstScaleLength);
    if (multiscale) {
        interpolatedScaleLengths = Array.from(stringElements, (_, i) => 
            firstScaleLength + (lastScaleLength - firstScaleLength) * (i / (stringElements.length - 1))
        );
    }
    
    const semitoneRatio = Math.pow(2, 1/12);

    // Mapping notes to their corresponding semitone values
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

    const preferredSemitone = getSemitoneValue(referenceNote);

    stringElements.forEach((stringElement, index) => {
        const targetNote = stringElement.querySelector('input').value.toUpperCase();
        if (targetNote) {
            const targetSemitone = getSemitoneValue(targetNote);
            const semitoneDifference = preferredSemitone - targetSemitone;
            let recommendedGauge = referenceGauge * Math.pow(semitoneRatio, semitoneDifference) * (scaleLength / interpolatedScaleLengths[index]);

            // Determine string type
            let type = recommendedGauge < 0.020 ? 'plain' : 'wound';
            if (referenceIsWound && type === 'plain') {
                recommendedGauge /= 1.2;
            } else if (!referenceIsWound && type === 'wound') {
                recommendedGauge *= 1.2;
            }

            const typeCell = stringElement.querySelector('td:nth-child(5)');
            const resultCell = stringElement.querySelector('td:nth-child(4)');
            // also update td:nth-child(3) with the interpolated scale length if it doesn't contain an input field
            const scaleLengthCell = stringElement.querySelector('td:nth-child(3)');
            if (!scaleLengthCell.querySelector('input')) {
                scaleLengthCell.textContent = interpolatedScaleLengths[index].toFixed(1);
            }

            typeCell.textContent = type;
            resultCell.textContent = recommendedGauge.toFixed(3);
        }
    });
});

function createStringRow(note = '') {
    return `
        <tr class="string">
            <td>
                <button class="remove-string"><span class="icon-cross"></span></button>
            </td>
            <td><input type="text" value="${note}"></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    `;
}

function addRemoveButtonListener(button) {
    button.addEventListener('click', function() {
        const row = this.closest('tr');
        const tableBody = row.parentNode;
        const rows = Array.from(tableBody.querySelectorAll('tr.string'));
        const rowIndex = rows.indexOf(row);

        if (rows.length > 2) {
            row.remove();

            if (rowIndex === 0 && rows.length > 1) {
                // Move the input field of the third column to the new first row
                const newFirstRow = rows[1];
                const inputField = row.querySelector('td:nth-child(3) input');
                if (inputField) {
                    newFirstRow.querySelector('td:nth-child(3)').textContent = ''; // Empty the cell content
                    newFirstRow.querySelector('td:nth-child(3)').appendChild(inputField);
                }
            } else if (rowIndex === rows.length - 1 && rows.length > 1) {
                // Move the input field of the third column to the new last row
                const newLastRow = rows[rows.length - 2];
                const inputField = row.querySelector('td:nth-child(3) input');
                if (inputField) {
                    newLastRow.querySelector('td:nth-child(3)').textContent = ''; // Empty the cell content
                    newLastRow.querySelector('td:nth-child(3)').appendChild(inputField);
                }
            }
        }
    });
}

function addString(position) {
    const stringsContainer = document.querySelector('#strings tbody');
    const newStringRow = document.createElement('tr');
    newStringRow.className = 'string';
    newStringRow.innerHTML = createStringRow();

    if (position === 'start') {
        const firstRow = stringsContainer.querySelector('tr.string');
        const inputField = firstRow.querySelector('td:nth-child(3) input');
        if (inputField) {
            firstRow.querySelector('td:nth-child(3)').removeChild(inputField);
            newStringRow.querySelector('td:nth-child(3)').appendChild(inputField);
        }
        stringsContainer.insertBefore(newStringRow, stringsContainer.firstChild.nextSibling); // Insert after the first add-row
    } else {
        const lastRow = stringsContainer.querySelector('tr.string:last-child');
        const inputField = lastRow.querySelector('td:nth-child(3) input');
        if (inputField) {
            lastRow.querySelector('td:nth-child(3)').removeChild(inputField);
            newStringRow.querySelector('td:nth-child(3)').appendChild(inputField);
        }
        stringsContainer.insertBefore(newStringRow, stringsContainer.lastChild); // Insert before the last add-row
    }

    // Add event listener for the new remove button
    addRemoveButtonListener(newStringRow.querySelector('.remove-string'));
}

// Add event listener for adding string at the end
document.querySelector('.add-end').addEventListener('click', function() {
    addString('end');
});

// Add event listener for adding string at the start
document.querySelector('.add-front').addEventListener('click', function() {
    addString('start');
});

// Add event listeners for the initial remove buttons
document.querySelectorAll('.remove-string').forEach(button => {
    addRemoveButtonListener(button);
});
