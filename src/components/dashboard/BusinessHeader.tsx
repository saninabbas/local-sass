import { Button } from '../../components/ui/Button';
import { RefreshCw } from 'lucide-react';

interface BusinessHeaderProps {
  businessName: string;
  city: string;
  ownerName?: string;
  lastAudited?: string;
}

export function BusinessHeader({ businessName, city, ownerName = 'Alex', lastAudited }: BusinessHeaderProps) {
  return (
    <div className="mb-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2">
          Good morning, {ownerName}
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-secondary text-base">
          <p className="font-medium">
            {businessName}
            <span className="inline-block mx-2 w-1 h-1 rounded-full bg-gray-400 transform -translate-y-1"></span>
            {city}
          </p>
          {lastAudited && (
            <p className="text-sm text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md border border-gray-200 inline-block w-fit">
              Last audited · {lastAudited}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center">
        <Button variant="outline" size="sm" className="bg-white shadow-sm font-semibold flex items-center gap-2">
          <RefreshCw size={14} className="text-secondary" />
          Run New Audit
        </Button>
      </div>
    </div>
  );
}
