/**
 * Динамическая загрузка библиотеки docx для уменьшения начального бандла.
 * Библиотека загружается только при первом экспорте документа в Word.
 */

export async function loadDocx() {
  return await import('docx');
}

export async function loadDocxPacker() {
  const docx = await loadDocx();
  return docx.Packer;
}

export async function loadDocxDocument() {
  const docx = await loadDocx();
  return docx.Document;
}

export async function loadDocxHeader() {
  const docx = await loadDocx();
  return docx.Header;
}

export async function loadDocxFooter() {
  const docx = await loadDocx();
  return docx.Footer;
}

export async function loadDocxParagraph() {
  const docx = await loadDocx();
  return docx.Paragraph;
}

export async function loadDocxTextRun() {
  const docx = await loadDocx();
  return docx.TextRun;
}

export async function loadDocxImageRun() {
  const docx = await loadDocx();
  return docx.ImageRun;
}

export async function loadDocxTable() {
  const docx = await loadDocx();
  return docx.Table;
}

export async function loadDocxTableRow() {
  const docx = await loadDocx();
  return docx.TableRow;
}

export async function loadDocxTableCell() {
  const docx = await loadDocx();
  return docx.TableCell;
}

export async function loadDocxAlignmentType() {
  const docx = await loadDocx();
  return docx.AlignmentType;
}

export async function loadDocxBorderStyle() {
  const docx = await loadDocx();
  return docx.BorderStyle;
}

export async function loadDocxShadingType() {
  const docx = await loadDocx();
  return docx.ShadingType;
}

export async function loadDocxTabStopType() {
  const docx = await loadDocx();
  return docx.TabStopType;
}

export async function loadDocxWidthType() {
  const docx = await loadDocx();
  return docx.WidthType;
}

export async function loadDocxUnderlineType() {
  const docx = await loadDocx();
  return docx.UnderlineType;
}

export async function loadDocxPageNumber() {
  const docx = await loadDocx();
  return docx.PageNumber;
}

export async function loadDocxTableBorders() {
  const docx = await loadDocx();
  return docx.TableBorders;
}