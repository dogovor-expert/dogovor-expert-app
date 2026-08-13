import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportToPdf(
  elements: HTMLElement | HTMLElement[] | null,
  filename: string
): Promise<number> {
  if (!elements) return 0;
  const list = Array.isArray(elements) ? elements : [elements];
  if (list.length === 0) return 0;

  const pdf = new jsPDF("p", "mm", "a4");

  for (let i = 0; i < list.length; i++) {
    const el = list[i];
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      width: el.offsetWidth,
      height: el.offsetHeight,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
  }

  pdf.save(`${filename}.pdf`);
  return list.length;
}
