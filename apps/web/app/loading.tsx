import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}
