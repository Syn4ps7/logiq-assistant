import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getProInvoiceDataUrl, downloadProInvoice } from "@/lib/invoice";

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceData: Parameters<typeof getProInvoiceDataUrl>[0] | null;
}

const InvoicePreviewDialog = ({ open, onOpenChange, invoiceData }: InvoicePreviewDialogProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && invoiceData) {
      const url = getProInvoiceDataUrl(invoiceData);
      setPdfUrl(url);
    } else {
      setPdfUrl(null);
    }
  }, [open, invoiceData]);

  const handleDownload = () => {
    if (invoiceData) {
      downloadProInvoice(invoiceData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg">
            Aperçu de la facture {invoiceData?.reference ? `— ${invoiceData.reference}` : ""}
          </DialogTitle>
          <Button variant="petrol" size="sm" className="gap-1.5" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Télécharger
          </Button>
        </DialogHeader>
        <div className="flex-1 min-h-0 bg-muted/30">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="Aperçu facture"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Chargement…
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewDialog;
