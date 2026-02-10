import ExcelJS from 'npm:exceljs@4.4.0';

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile('TSH_Hotspot_Dialogue.xlsx');

const ws = wb.getWorksheet('Item Combinations');

console.log('=== HEADER ROW (Row 1) ===');
const headerRow = ws.getRow(1);
console.log(`Row has ${headerRow.cellCount} cells`);
console.log(`Row has ${headerRow.actualCellCount} actual cells`);

for (let c = 1; c <= 10; c++) {
    const cell = headerRow.getCell(c);
    console.log(`Col ${c}: "${cell.value}" (hidden: ${ws.getColumn(c).hidden || false})`);
}

console.log('\n=== CANDLE + MATCHES ROW (Row 51) ===');
const row51 = ws.getRow(51);
for (let c = 1; c <= 10; c++) {
    const cell = row51.getCell(c);
    console.log(`Col ${c}: ${JSON.stringify(cell.value)}`);
}

console.log('\n=== COLUMN PROPERTIES ===');
for (let c = 1; c <= 10; c++) {
    const col = ws.getColumn(c);
    console.log(`Col ${c}: width=${col.width}, hidden=${col.hidden || false}, key=${col.key}`);
}
