'use client';

import * as React from 'react';
import { Box } from '@mui/material';

export interface TabsProps {
  defaultValue?: string;
  children?: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'standard' | 'scrollable' | 'fullWidth';
}

interface TabPanelProps {
  children?: React.ReactNode;
  value: string;
}

interface TabsListProps {
  children?: React.ReactNode;
  className?: string;
}

interface TabTriggerProps {
  value: string;
  children?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value: currentValue, ...other } = props;

  return (
    <div
      role="tabpanel"
      {...other}
    >
      <Box sx={{ p: 3 }}>{children}</Box>
    </div>
  );
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabTriggerProps>(
  ({ value, children, selected, onClick, className = '' }, ref) => {
    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={selected}
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-colors
          ${selected 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:bg-muted'
          } ${className}`}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

export function Tabs({ 
  children, 
  value, 
  onValueChange,
  orientation = 'horizontal', 
  variant = 'standard' 
}: TabsProps) {
  return (
    <div role="tablist" className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement<TabTriggerProps>(child) && typeof child.props.value === 'string') {
          return React.cloneElement(child, {
            selected: child.props.value === value,
            onClick: () => onValueChange?.(child.props.value)
          });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={`flex ${className || ''}`}>
      {children}
    </div>
  );
}

export const TabsContent = TabPanel;