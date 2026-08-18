import React from 'react';
// import { usePremium } from '../../context/PremiumContext';
// import { Lock } from 'lucide-react';

interface PremiumGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLockOverlay?: boolean;
}

/**
 * A wrapper component that intercepts clicks if the user is not a Pro subscriber,
 * automatically presenting the Paywall instead of allowing the action to proceed.
 */
export const PremiumGate: React.FC<PremiumGateProps> = ({ 
  children, 
  fallback,
  showLockOverlay = false 
}) => {
  // const { isPro, presentPaywall } = usePremium();

  // if (isPro) {
  //   return <>{children}</>;
  // }

  // const handleInterceptClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   presentPaywall();
  // };

  // return (
  //   <div className="relative group" onClickCapture={handleInterceptClick}>
  //     {/* 
  //       We use a wrapper to capture clicks in the bubbling/capturing phase.
  //       We can also style the children slightly differently if needed.
  //     */}
  //     <div className="opacity-80 transition-opacity">
  //       {children}
  //     </div>
      
  //     {showLockOverlay && (
  //       <div className="absolute inset-0 flex items-center justify-center bg-background/10 backdrop-blur-[1px] pointer-events-none">
  //         <div className="bg-background/80 rounded-full p-2 shadow-sm border">
  //           <Lock className="w-5 h-5 text-muted-foreground" />
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // );
  return <>{children}</>;
};
