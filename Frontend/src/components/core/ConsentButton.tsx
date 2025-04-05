import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConsentButtonProps {
  onConsent: any
  isReady: boolean;
}

const ConsentButton: React.FC<ConsentButtonProps> = ({ 
  onConsent, 
  isReady 
}) => {
  return (
    <Button 
      onClick={()=>onConsent(true)} 
      disabled={isReady}
      className={cn(
        "relative w-full max-w-sm h-12 font-medium transition-all duration-300",
        "bg-gradient-to-r from-green-800 to-emerald-900 hover:from-green-700 hover:to-emerald-800",
        "before:absolute before:inset-0 before:rounded-md before:opacity-0 before:transition-opacity",
        "before:shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:before:opacity-100",
        isReady ? "pulse-soft" : "opacity-70"
      )}
    >
      {isReady ? "Start Video Chat" : "Enter Your Name to Start"}
    </Button>
  );
};

export default ConsentButton;