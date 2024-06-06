document.getElementById('calculate').addEventListener('click', function() {
    const preferredGauge = parseFloat(document.getElementById('preferred-gauge').value);
    const preferredNote = document.getElementById('preferred-note').value.toUpperCase();
    const scaleLength = parseFloat(document.getElementById('scale-length').value);
    const newScaleLength = parseFloat(document.getElementById('new-scale-length').value);
    const isWound = document.getElementById('is-wound').checked;

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
        console.log(notePart)
        const octave = parseInt(note.slice(-1));
        return noteToSemitone[notePart] + 12 * (octave + 1);
    };

    const preferredSemitone = getSemitoneValue(preferredNote);

    const stringElements = document.querySelectorAll('.string');
    stringElements.forEach((stringElement) => {
        const targetNote = stringElement.querySelector('input').value.toUpperCase();
        if (targetNote) {
            const targetSemitone = getSemitoneValue(targetNote);
            const semitoneDifference = preferredSemitone - targetSemitone;
            let recommendedGauge = preferredGauge * Math.pow(semitoneRatio, semitoneDifference) * (scaleLength / newScaleLength);

            // Determine string type
            let type = recommendedGauge < 0.020 ? 'plain' : 'wound';
            if (isWound && type === 'plain') {
                recommendedGauge /= 1.2;
            } else if (!isWound && type === 'wound') {
                recommendedGauge *= 1.2;
            }

            const typeCell = stringElement.querySelector('td:nth-child(3)');
            const resultCell = stringElement.querySelector('td:nth-child(4)');

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
        </tr>
    `;
}

function addString(position) {
    const stringsContainer = document.querySelector('#strings tbody');
    const newStringRow = document.createElement('tr');
    newStringRow.className = 'string';
    newStringRow.innerHTML = createStringRow();

    if (position === 'start') {
        stringsContainer.insertBefore(newStringRow, stringsContainer.firstChild.nextSibling); // Insert after the first add-row
    } else {
        stringsContainer.insertBefore(newStringRow, stringsContainer.lastChild); // Insert before the last add-row
    }

    // Add event listener for the new remove button
    newStringRow.querySelector('.remove-string').addEventListener('click', function() {
        this.closest('tr').remove();
    });
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
    button.addEventListener('click', function() {
        this.closest('tr').remove();
    });
});