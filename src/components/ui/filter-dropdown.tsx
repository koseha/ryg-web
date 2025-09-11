"use client";

import { useState } from "react";
import { Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const FilterDropdown = ({ 
  options, 
  value, 
  onValueChange, 
  placeholder = "필터",
  className 
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("justify-between min-w-[120px]", className)}
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>{selectedOption?.label || placeholder}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56 bg-card border-border" align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              onValueChange(option.value);
              setIsOpen(false);
            }}
            className="cursor-pointer"
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
