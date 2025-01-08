import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ServicesListProps {
  services: string[];
}

export const ServicesList = ({ services }: ServicesListProps) => {
  const [showAllServices, setShowAllServices] = useState(false);
  const visibleServices = services.slice(0, 3);
  const hasMoreServices = services.length > 3;

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-2 items-center">
        {visibleServices.map((service, index) => (
          <Badge key={index} variant="secondary">
            {service}
          </Badge>
        ))}
        {hasMoreServices && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowAllServices(true)}
          >
            <Eye size={16} />
            Show All
          </Button>
        )}
      </div>

      <Dialog open={showAllServices} onOpenChange={setShowAllServices}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>All Services</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="flex flex-wrap gap-2 p-4">
              {services.map((service, index) => (
                <Badge key={index} variant="secondary">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};