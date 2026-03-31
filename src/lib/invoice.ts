import jsPDF from "jspdf";

const TVA_RATE = 0.081;
const roundCHF = (v: number) => Math.round(v / 0.05) * 0.05;
const fmtCHF = (v: number) => roundCHF(v).toLocaleString("fr-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface InvoiceData {
  reference: string;
  date: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  ideTva?: string;
  vehicleName: string;
  plan: string;
  days: number;
  startDate?: string;
  endDate?: string;
  options?: string;
  estKm: number;
  totalTTC: number;
  discountPercent?: number;
  discountAmount?: number;
  promoCode?: string;
}

export function generateProInvoice(data: InvoiceData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const marginL = 20;
  const marginR = 20;
  const contentW = pageW - marginL - marginR;
  let y = 20;

  // Header - Company
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("LogIQ Transport", marginL, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Location de véhicules utilitaires — Vevey, Suisse", marginL, y);
  y += 4;
  doc.text("info@logiq-transport.ch · logiq-transport.ch", marginL, y);
  y += 10;

  // Separator
  doc.setDrawColor(200);
  doc.line(marginL, y, pageW - marginR, y);
  y += 8;

  // Invoice title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("FACTURE", marginL, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`N° ${data.reference}`, marginL + 45, y);
  y += 6;
  doc.text(`Date : ${data.date}`, marginL, y);
  y += 10;

  // Client info
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Client", marginL, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text(data.companyName, marginL, y);
  y += 5;
  doc.text(`${data.contactName}`, marginL, y);
  y += 5;
  doc.text(`${data.email} · ${data.phone}`, marginL, y);
  y += 5;
  if (data.ideTva) {
    doc.text(`N° IDE/TVA : ${data.ideTva}`, marginL, y);
    y += 5;
  }
  y += 8;

  // Table header
  const col1 = marginL;
  const col2 = marginL + 90;
  const col3 = marginL + 120;
  const col4 = pageW - marginR;

  doc.setFillColor(245, 245, 245);
  doc.rect(marginL, y - 4, contentW, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Description", col1 + 2, y);
  doc.text("Qté", col2, y);
  doc.text("Prix unit. HT", col3, y);
  doc.text("Total HT", col4 - 2, y, { align: "right" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  // Compute HT values
  const totalHT = roundCHF(data.totalTTC / (1 + TVA_RATE));
  const tvaAmount = roundCHF(data.totalTTC - totalHT);

  // Base rental line
  const baseHT = roundCHF((data.totalTTC + (data.discountAmount || 0)) / (1 + TVA_RATE));
  const baseDayHT = roundCHF(baseHT / data.days);

  doc.text(`Location ${data.vehicleName}`, col1 + 2, y);
  doc.text(`${data.days} jour(s)`, col2, y);
  doc.text(`${fmtCHF(baseDayHT)} CHF`, col3, y);
  doc.text(`${fmtCHF(baseHT)} CHF`, col4 - 2, y, { align: "right" });
  y += 5;

  if (data.plan) {
    doc.setTextColor(100);
    doc.text(`Formule : ${data.plan}`, col1 + 4, y);
    y += 5;
  }

  if (data.startDate && data.endDate) {
    doc.text(`Période : ${data.startDate} → ${data.endDate}`, col1 + 4, y);
    y += 5;
  }

  if (data.options) {
    doc.text(`Options : ${data.options}`, col1 + 4, y);
    y += 5;
  }

  doc.setTextColor(0);

  // Discount
  if (data.discountAmount && data.discountAmount > 0 && data.promoCode) {
    y += 2;
    const discountHT = roundCHF(data.discountAmount / (1 + TVA_RATE));
    doc.text(`Remise code promo ${data.promoCode} (-${data.discountPercent}%)`, col1 + 2, y);
    doc.text(`-${fmtCHF(discountHT)} CHF`, col4 - 2, y, { align: "right" });
    y += 5;
  }

  y += 4;
  doc.setDrawColor(200);
  doc.line(marginL, y, pageW - marginR, y);
  y += 6;

  // Totals
  doc.setFontSize(10);
  doc.text("Sous-total HT", col3 - 30, y);
  doc.text(`${fmtCHF(totalHT)} CHF`, col4 - 2, y, { align: "right" });
  y += 6;

  doc.text("TVA (8.1 %)", col3 - 30, y);
  doc.text(`${fmtCHF(tvaAmount)} CHF`, col4 - 2, y, { align: "right" });
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total TTC", col3 - 30, y);
  doc.text(`${fmtCHF(data.totalTTC)} CHF`, col4 - 2, y, { align: "right" });
  y += 12;

  // Footer
  doc.setDrawColor(200);
  doc.line(marginL, y, pageW - marginR, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("LogIQ Transport Sàrl — Vevey, Suisse", marginL, y);
  y += 4;
  doc.text("Conditions générales disponibles sur logiq-transport.ch/cgl", marginL, y);

  doc.save(`facture-${data.reference}.pdf`);
}
