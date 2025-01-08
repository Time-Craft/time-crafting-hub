import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
          <Badge
            key={index}
            variant="secondary"
            className="px-4 py-1.5 text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            {service}
          </Badge>
        ))}
        {hasMoreServices && (
          <Eye
            size={20}
            className="text-primary cursor-pointer hover:text-primary-dark transition-colors"
            onClick={() => setShowAllServices(true)}
          />
        )}
      </div>

      <Dialog open={showAllServices} onOpenChange={setShowAllServices}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>All Services</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 p-4">
            {services.map((service, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-4 py-1.5 text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                {service}
              </Badge>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};