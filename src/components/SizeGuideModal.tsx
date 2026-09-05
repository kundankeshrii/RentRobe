import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sizeData = [
  { size: "XS", bust: "32", waist: "24", hips: "34", length: "55" },
  { size: "S", bust: "34", waist: "26", hips: "36", length: "56" },
  { size: "M", bust: "36", waist: "28", hips: "38", length: "57" },
  { size: "L", bust: "38", waist: "30", hips: "40", length: "58" },
  { size: "XL", bust: "40", waist: "32", hips: "42", length: "59" },
  { size: "XXL", bust: "42", waist: "34", hips: "44", length: "60" },
];

const SizeGuideModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs text-primary font-body font-light underline">
          Size Guide
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-light">Size Guide</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground font-body font-light mb-4">
          All measurements are in inches. For the best fit, measure yourself and compare with the chart below.
        </p>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-body font-medium">Size</TableHead>
                <TableHead className="text-xs font-body font-medium">Bust</TableHead>
                <TableHead className="text-xs font-body font-medium">Waist</TableHead>
                <TableHead className="text-xs font-body font-medium">Hips</TableHead>
                <TableHead className="text-xs font-body font-medium">Length</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sizeData.map((row) => (
                <TableRow key={row.size}>
                  <TableCell className="font-body font-medium text-sm">{row.size}</TableCell>
                  <TableCell className="font-body font-light text-sm">{row.bust}"</TableCell>
                  <TableCell className="font-body font-light text-sm">{row.waist}"</TableCell>
                  <TableCell className="font-body font-light text-sm">{row.hips}"</TableCell>
                  <TableCell className="font-body font-light text-sm">{row.length}"</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 bg-secondary p-3">
          <p className="text-xs font-body font-light text-muted-foreground">
            💡 <span className="font-medium text-foreground">Tip:</span> If you're between sizes, we recommend going one size up for a comfortable fit. For any queries, email us at <a href="mailto:renttrobe@gmail.com" className="text-primary underline">renttrobe@gmail.com</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeGuideModal;
