import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NameInputProps {
  onNameChange: (name: string) => void;
}

const NameInput: React.FC<NameInputProps> = ({ onNameChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onNameChange(e.target.value);
  };
  
  return (
    <div className="relative w-full max-w-sm">
      <label 
        className={cn(
          "absolute left-3 transition-all duration-200",
          isFocused || value ? 
            "-top-6 text-sm text-green-400 font-medium" : 
            "top-2 text-green-200/50"
        )}
      >Enter your name to continue:
      </label>
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="h-12 pl-3 border-green-700/30 bg-black/20 backdrop-blur-md input-focus-effect text-green-100"
      />
    </div>
  );
};

export default NameInput;