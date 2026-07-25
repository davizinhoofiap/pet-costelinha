'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`bg-slate-200/70 animate-pulse rounded-xl ${className}`}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="animate-pulse">
      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
      <td className="p-4"><Skeleton className="h-4 w-32" /></td>
      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
      <td className="p-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
      <td className="p-4 text-right"><Skeleton className="h-6 w-16 rounded-lg ml-auto" /></td>
    </tr>
  );
};
