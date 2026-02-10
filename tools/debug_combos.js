import ExcelJS from 'npm:exceljs@4.4.0';

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile('TSH_Hotspot_Dialogue.xlsx');

const ic = wb.getWorksheet('Item Combinations');
console.log('=== SEARCHING FOR CANDLE + MATCHES COMBINATION ===');

ic.eachRow((row, rowNum) => {
  if (rowNum === 1) {
    console.log('Header row:');
    for (let c = 1; c <= 6; c++) {
      console.log(`  Col ${c}: ${row.getCell(c).value}`);
    }
    return;
  }

  const id1 = row.getCell(4).value;
  const id2 = row.getCell(5).value;

  if ((id1 === 'candle' && id2 === 'matches') || (id1 === 'matches' && id2 === 'candle')) {
    console.log(`\nFound at row ${rowNum}:`);
    for (let c = 1; c <= 6; c++) {
      console.log(`  Col ${c}: ${JSON.stringify(row.getCell(c).value)}`);
    }
  }
});
