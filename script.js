document.addEventListener('DOMContentLoaded', loadTable);

function addRow(unit = '', yearLevel = '', weighting = '', mark = '', grade = '', creditPoints = '') {
    const tableBody = document.getElementById('tableBody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td><input type="text" value="${unit}" placeholder="Unit" oninput="updateYearLevel(this)"></td>
        <td><input type="number" value="${yearLevel}" placeholder="Year level" disabled></td>
        <td><input type="number" step="0.1" value="${weighting}" placeholder="Year level weighting" disabled></td>
        <td><input type="number" value="${mark}" placeholder="Unit mark" oninput="updateGradeAndSave(this)"></td>
        <td><input type="text" value="${grade}" placeholder="Grade" disabled></td>
        <td><input type="number" value="${creditPoints}" placeholder="Unit credit points"></td>
        <td><input type="number" placeholder="Weighted mark" disabled></td>
        <td><input type="number" placeholder="Weighted credit points" disabled></td>
    `;

    tableBody.appendChild(row);
    saveTable();
}

function updateYearLevel(input) {
    const row = input.closest('tr');
    const yearLevelInput = row.querySelector('input[placeholder="Year level"]');
    const weightingInput = row.querySelector('input[placeholder="Year level weighting"]');
    const unitCode = input.value;

    if (unitCode.length >= 4) {
        const yearLevelDigit = unitCode.charAt(3);
        const yearLevel = parseInt(yearLevelDigit);
        let weighting = 1.0;

        if (yearLevel === 1) {
            weighting = 0.5;
        }

        yearLevelInput.value = yearLevel;
        weightingInput.value = weighting;
    } else {
        yearLevelInput.value = '';
        weightingInput.value = '';
    }
    saveTable();
}

function updateGradeAndSave(input) {
    const row = input.closest('tr');
    const unitMark = parseFloat(input.value);
    const gradeInput = row.querySelector('input[placeholder="Grade"]');

    if (isNaN(unitMark)) {
        gradeInput.value = '';
        gradeInput.style.backgroundColor = '';
        return;
    }

    let grade = '';
    let colorClass = '';

    if (unitMark < 44) {
        grade = 'N';
        colorClass = 'red';
    } else if (unitMark <= 49) {
        grade = 'NH';
        colorClass = 'light-red';
    } else if (unitMark <= 59) {
        grade = 'P';
        colorClass = 'yellow';
    } else if (unitMark <= 69) {
        grade = 'C';
        colorClass = 'light-green';
    } else if (unitMark <= 79) {
        grade = 'D';
        colorClass = 'green';
    } else if (unitMark <= 100) {
        grade = 'HD';
        colorClass = 'dark-green';
    }

    gradeInput.value = grade;
    input.className = colorClass;
    calculateWAM();
    saveTable();
}

function calculateWAM() {
    const rows = document.querySelectorAll('#tableBody tr');
    let totalWeightedMark = 0;
    let totalWeightedCreditPoints = 0;

    rows.forEach(row => {
        const cells = row.querySelectorAll('input');
        const yearLevelWeighting = parseFloat(cells[2].value);
        const unitMark = parseFloat(cells[3].value);
        const unitCreditPoints = parseFloat(cells[5].value);

        const weightedMark = unitMark * unitCreditPoints * yearLevelWeighting;
        const weightedCreditPoints = unitCreditPoints * yearLevelWeighting;

        cells[6].value = weightedMark.toFixed(2);
        cells[7].value = weightedCreditPoints.toFixed(2);

        totalWeightedMark += weightedMark;
        totalWeightedCreditPoints += weightedCreditPoints;
    });

    const wam = totalWeightedMark / totalWeightedCreditPoints;
    document.getElementById('result').innerText = `WAM = ${wam.toFixed(3)}`;
    saveTable();
}

function saveTable() {
    const rows = document.querySelectorAll('#tableBody tr');
    const tableData = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll('input');
        const rowData = {
            unit: cells[0].value,
            yearLevel: cells[1].value,
            weighting: cells[2].value,
            mark: cells[3].value,
            grade: cells[4].value,
            creditPoints: cells[5].value
        };
        tableData.push(rowData);
    });

    localStorage.setItem('wamTable', JSON.stringify(tableData));
}

function loadTable() {
    const tableData = JSON.parse(localStorage.getItem('wamTable'));
    if (tableData) {
        tableData.forEach(rowData => {
            addRow(rowData.unit, rowData.yearLevel, rowData.weighting, rowData.mark, rowData.grade, rowData.creditPoints);
        });
    }
}

function clearTable() {
    localStorage.removeItem('wamTable');
    document.getElementById('tableBody').innerHTML = '';
    document.getElementById('result').innerText = '';
}
