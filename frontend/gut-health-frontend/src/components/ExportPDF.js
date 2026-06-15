// src/components/ExportPDF.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ExportPDF({ targetRef }) {
  const handleDownload = async () => {
    const input = targetRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295;
    const imgHeight = canvas.height * imgWidth / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('NutriNest_Meal_Plan.pdf');
  };

  return (
    <button onClick={handleDownload} style={{ marginTop: 20 }}>
      Download PDF
    </button>
  );
}
