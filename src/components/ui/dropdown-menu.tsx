// src/components/ui/dropdown-menu.tsx
import React, { createContext, useContext, useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

// Create context for sharing state between components
const DropdownContext = createContext<{
  anchorEl: null | HTMLElement;
  setAnchorEl: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
  open: boolean;
  handleClose: () => void;
}>({
  anchorEl: null,
  setAnchorEl: () => {},
  open: false,
  handleClose: () => {},
});

// Root component
export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <DropdownContext.Provider value={{ anchorEl, setAnchorEl, open, handleClose }}>
      <div>{children}</div>
    </DropdownContext.Provider>
  );
};

// Trigger component
export const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => {
  const { setAnchorEl } = useContext(DropdownContext);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Clone the child element and add our click handler
  return React.cloneElement(React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
    onClick: handleClick,
    'aria-haspopup': 'true',
  });
};

// Content component
export const DropdownMenuContent = ({ children }: { children: React.ReactNode }) => {
  const { anchorEl, open, handleClose } = useContext(DropdownContext);
  
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >
      {children}
    </Menu>
  );
};

// Item component
export const DropdownMenuItem = ({ 
  children, 
  onClick 
}: { 
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const { handleClose } = useContext(DropdownContext);
  
  const handleItemClick = () => {
    if (onClick) onClick();
    handleClose();
  };
  
  return (
    <MenuItem onClick={handleItemClick}>
      {children}
    </MenuItem>
  );
};