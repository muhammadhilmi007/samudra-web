'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface TabsProps {
  defaultValue?: string;
  children?: React.ReactNode;
  value?: string | number;
  onChange?: (event: React.SyntheticEvent, newValue: number) => void;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'standard' | 'scrollable' | 'fullWidth';
}

interface TabsListProps {
  children?: React.ReactNode;
  className?: string;
}

const StyledTabsList = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}));

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}



export function Tabs({ 
  children, 
  value, 
  onValueChange,
  orientation = 'horizontal', 
  variant = 'standard' 
}: TabsProps) {
  return (
    <StyledTabs
      value={value}
      onChange={(_, newValue) => onValueChange?.(String(newValue))}
      orientation={orientation}
      variant={variant}
      aria-label="styled tabs"
    >
      {children}
    </StyledTabs>
  );
}

export const TabsContent = TabPanel;
export function TabsList({ children, className }: TabsListProps) {
  return (
    <StyledTabsList className={className}>
      {children}
    </StyledTabsList>
  );
}
export const TabsTrigger = StyledTab;

// Update exports
export { StyledTab as Tab, TabPanel };