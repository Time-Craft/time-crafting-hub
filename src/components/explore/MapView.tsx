interface MapViewProps {
  className?: string;
}

export const MapView = ({ className }: MapViewProps) => {
  return (
    <div className={`bg-gray-100 h-[60vh] rounded-lg flex items-center justify-center ${className}`}>
      Interactive Map View (Coming Soon)
    </div>
  );
};