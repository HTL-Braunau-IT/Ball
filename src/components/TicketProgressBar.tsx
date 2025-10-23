"use client";

interface TicketProgressBarProps {
  total: number;
  sold: number;
  remaining: number;
  label?: string;
}

export default function TicketProgressBar({ 
  total, 
  sold, 
  remaining, 
  label 
}: TicketProgressBarProps) {
  const soldPercentage = total > 0 ? (sold / total) * 100 : 0;
  const remainingPercentage = total > 0 ? (remaining / total) * 100 : 0;
  
  // Determine color based on remaining percentage
  const getBarColor = () => {
    if (remainingPercentage >= 50) return "bg-green-500";
    if (remainingPercentage >= 25) return "bg-yellow-500";
    if (remainingPercentage >= 10) return "bg-orange-500";
    return "bg-red-500";
  };

  const getTextColor = () => {
    if (remainingPercentage >= 50) return "text-green-700";
    if (remainingPercentage >= 25) return "text-yellow-700";
    if (remainingPercentage >= 10) return "text-orange-700";
    return "text-red-700";
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className={`text-sm font-semibold ${getTextColor()}`}>
            {remaining} von {total} verfügbar
          </span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div className="h-full flex">
          {/* Sold tickets (gray) */}
          <div 
            className="bg-gray-400 transition-all duration-500 ease-out"
            style={{ width: `${soldPercentage}%` }}
          />
          {/* Remaining tickets (colored) */}
          <div 
            className={`${getBarColor()} transition-all duration-500 ease-out`}
            style={{ width: `${remainingPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Verkauft: {sold}</span>
        <span>Verbleibend: {remaining}</span>
      </div>
    </div>
  );
}
