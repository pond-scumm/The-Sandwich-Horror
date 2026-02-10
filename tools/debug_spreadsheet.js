import ExcelJS from 'npm:exceljs@4.4.0';

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile('TSH_Hotspot_Dialogue.xlsx');

// Check Global Defaults sheet
const gd = wb.getWorksheet('Global Defaults');
console.log('=== GLOBAL DEFAULTS SHEET ===');
let rowCount = 0;
gd.eachRow((row, rowNum) => {
  if (rowCount++ < 15) {
    const vals = [];
    for (let c = 1; c <= 4; c++) {
      const v = row.getCell(c).value;
      vals.push(v === null || v === undefined ? '[EMPTY]' : JSON.stringify(v));
    }
    console.log(`Row ${rowNum}: ${vals.join(' | ')}`);
  }
});

// Check Item Combinations sheet
console.log('\n=== ITEM COMBINATIONS SHEET (first 10 rows) ===');
const ic = wb.getWorksheet('Item Combinations');
rowCount = 0;
ic.eachRow((row, rowNum) => {
  if (rowCount++ < 10) {
    const vals = [];
    for (let c = 1; c <= 6; c++) {
      const v = row.getCell(c).value;
      vals.push(v === null || v === undefined ? '[EMPTY]' : JSON.stringify(v));
    }
    console.log(`Row ${rowNum}: ${vals.join(' | ')}`);
  }
});

// Find candle in item defaults section
console.log('\n=== SEARCHING FOR CANDLE IN ITEM DEFAULTS ===');
let inItemSection = false;
let headerRowNum = -1;
gd.eachRow((row, rowNum) => {
  const cellA = (row.getCell(1).value || '').toString().trim();
  if (cellA === 'ITEM DEFAULTS') {
    inItemSection = true;
    console.log(`Found ITEM DEFAULTS section at row ${rowNum}`);
    return;
  }
  if (inItemSection && cellA === 'Item') {
    headerRowNum = rowNum;
    console.log(`Found Item header at row ${rowNum}`);
    return;
  }
  if (inItemSection && headerRowNum > 0 && cellA.toLowerCase().includes('candle')) {
    console.log(`Row ${rowNum}: ${cellA} | ${row.getCell(2).value} | ${row.getCell(3).value} | ${row.getCell(4).value} | ${row.getCell(5).value}`);
  }
});
