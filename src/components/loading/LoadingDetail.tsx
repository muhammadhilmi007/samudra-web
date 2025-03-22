// src/components/LoadingDetail.tsx

import React from 'react';
import { Loading } from '../../types/loading'; // Adjust the path as needed

interface LoadingDetailProps {
  loading: Loading;
  lines?: number;
  className?: string;
}

export function LoadingDetail(props: LoadingDetailProps) {
  return (
    <div className={`animate-pulse ${props.className}`}>
      {/* Header skeleton */}
      <div className="h-7 bg-gray-200 rounded-md w-3/4 mb-4"></div>
      
      {/* Content skeletons */}
      {Array(props.lines || 5).fill(0).map((_, index) => (
        <div 
          key={index} 
          className={`h-4 bg-gray-200 rounded-md mb-3 ${index % 3 === 0 ? 'w-full' : index % 3 === 1 ? 'w-5/6' : 'w-4/6'}`}
        ></div>
      ))}
      
      {/* Button placeholder */}
      <div className="h-10 bg-gray-200 rounded-md w-36 mt-4"></div>
    </div>
  );
}

export default LoadingDetail;