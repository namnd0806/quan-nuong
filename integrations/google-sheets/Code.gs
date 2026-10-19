const SPREADSHEET_ID = '1QrzhgSbYyD6X5bm9XyVCE2OEBEpqqSCqWcIh5maRhqI';
const DEFAULT_SHEET = 'PHÂN BỔ NGÂN SÁCH';
const SOURCE = 'quan-nuong-budget-v1';

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (payload.source !== SOURCE || !Array.isArray(payload.rows)) {
      return json_({ ok: false, error: 'Yêu cầu không hợp lệ.' });
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(payload.sheetName || DEFAULT_SHEET);
    if (!sheet) return json_({ ok: false, error: 'Không tìm thấy tab ngân sách.' });

    renderBudget_(sheet, payload.rows);
    return json_({ ok: true, rows: payload.rows.length, updatedAt: new Date().toISOString() });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function renderBudget_(sheet, rows) {
  const columnCount = 7;
  sheet.getDataRange().breakApart();
  sheet.clear();
  if (sheet.getMaxColumns() < columnCount) sheet.insertColumnsAfter(sheet.getMaxColumns(), columnCount - sheet.getMaxColumns());
  if (sheet.getMaxColumns() > columnCount) sheet.deleteColumns(columnCount + 1, sheet.getMaxColumns() - columnCount);

  const requiredRows = Math.max(30, rows.length + 6);
  if (sheet.getMaxRows() < requiredRows) sheet.insertRowsAfter(sheet.getMaxRows(), requiredRows - sheet.getMaxRows());
  if (sheet.getMaxRows() > requiredRows) sheet.deleteRows(requiredRows + 1, sheet.getMaxRows() - requiredRows);

  sheet.getRange('A1:G1').merge().setValue('PHÂN BỔ NGÂN SÁCH QUÁN NƯỚNG');
  sheet.getRange('A2:G2').merge().setValue('Dữ liệu từ ứng dụng · Cập nhật ' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm'));
  sheet.getRange('A4:G4').setValues([['Nhóm chi phí', 'Hạng mục', 'Dự toán', 'Nam đã chi', 'Phương đã chi', 'Trạng thái', 'Ghi chú']]);

  if (rows.length) {
    const values = rows.map(row => [row.category, row.name, Number(row.planned || 0), Number(row.namSpent || 0), Number(row.phuongSpent || 0), row.status, row.note || '']);
    sheet.getRange(5, 1, values.length, columnCount).setValues(values);
    sheet.getRange(5, 3, values.length, 3).setNumberFormat('#,##0"đ"');
    sheet.getRange(5, 1, values.length, columnCount).setVerticalAlignment('middle').setWrap(true);
    sheet.getRange(5, 1, values.length, columnCount).setBorder(true, true, true, true, true, true, '#d6dfeb', SpreadsheetApp.BorderStyle.SOLID);
    mergeGroups_(sheet, rows, 5);
    styleStatuses_(sheet, rows, 5);
  }

  sheet.getRange('A1:G1').setBackground('#172a46').setFontColor('#ffffff').setFontSize(17).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A2:G2').setBackground('#eaf2ff').setFontColor('#52657c').setFontSize(9).setHorizontalAlignment('center');
  sheet.getRange('A4:G4').setBackground('#244e7c').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.setFrozenRows(4);
  sheet.setRowHeight(1, 38);
  sheet.setRowHeight(2, 25);
  sheet.setRowHeight(4, 34);
  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(2, 260);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 130);
  sheet.setColumnWidth(6, 125);
  sheet.setColumnWidth(7, 280);
  sheet.getRange(1, 1, requiredRows, columnCount).setFontFamily('Arial');
  sheet.getRange(5, 3, Math.max(rows.length, 1), 3).setHorizontalAlignment('right');
}

function mergeGroups_(sheet, rows, startRow) {
  let index = 0;
  while (index < rows.length) {
    let end = index;
    while (end + 1 < rows.length && rows[end + 1].category === rows[index].category) end++;
    const count = end - index + 1;
    const range = sheet.getRange(startRow + index, 1, count, 1);
    if (count > 1) range.merge();
    range.setBackground(index % 2 === 0 ? '#edf5ff' : '#f3f7fb').setFontColor('#23486f').setFontWeight('bold').setHorizontalAlignment('left').setVerticalAlignment('middle');
    index = end + 1;
  }
}

function styleStatuses_(sheet, rows, startRow) {
  rows.forEach((row, index) => {
    const cell = sheet.getRange(startRow + index, 6);
    if (row.status === 'Đã thanh toán') cell.setBackground('#dff5e8').setFontColor('#18794e');
    else if (row.status === 'Một phần') cell.setBackground('#fff1d6').setFontColor('#a86108');
    else cell.setBackground('#edf1f6').setFontColor('#607086');
    cell.setFontWeight('bold').setHorizontalAlignment('center');
  });
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
