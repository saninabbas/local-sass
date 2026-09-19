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
    <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#e6dfd8]">
      <div className="space-y-1.5">
        <h2 className="text-3xl font-serif font-normal text-[#141413]">
          Good morning, {ownerName}
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-sans text-[#6c6a64]">
          <p className="font-medium text-[#252523] flex items-center gap-1.5">
            <span>{businessName}</span>
            <span className="w-1 h-1 rounded-full bg-[#cc785c]"></span>
            <span>{city}</span>
          </p>
          {lastAudited && (
            <p className="text-[11px] font-mono text-[#6c6a64] bg-[#efe9de] px-2.5 py-0.5 rounded-md border border-[#e6dfd8] inline-block w-fit">
              Last audited • {lastAudited}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center">
        <Button variant="secondary" size="sm" className="bg-[#faf9f5] border-[#e6dfd8] text-[#141413] shadow-xs font-medium flex items-center gap-2">
          <RefreshCw size={13} className="text-[#cc785c]" />
          Run New Audit
        </Button>
      </div>
    </div>
  );
}
