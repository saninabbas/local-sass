import React from 'react';

interface LoadingSkeletonCardProps {
  stageText?: string;
  count?: number;
}

export const LoadingSkeletonCard: React.FC<LoadingSkeletonCardProps> = ({
  stageText = 'Analyzing telemetry...',
  count = 3,
}) => {
  return (
    <div className="space-y-4">
      {stageText && (
        <div className="flex items-center gap-3 px-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#cc785c] animate-ping" />
          <span className="text-xs font-mono font-medium text-[#6c6a64]">
            {stageText}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl p-5 space-y-4 animate-pulse shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-24 h-4 bg-[#efe9de] rounded-md" />
              <div className="w-12 h-4 bg-[#efe9de] rounded-full" />
            </div>

            <div className="space-y-2">
              <div className="w-16 h-8 bg-[#efe9de] rounded-md" />
              <div className="w-3/4 h-3 bg-[#efe9de] rounded-md" />
            </div>

            <div className="pt-3 border-t border-[#e6dfd8]/60 flex items-center justify-between">
              <div className="w-20 h-3 bg-[#efe9de] rounded-md" />
              <div className="w-14 h-3 bg-[#efe9de] rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
