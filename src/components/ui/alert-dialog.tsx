import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

// Main AlertDialog component (container)
interface AlertDialogProps {
  children: React.ReactNode;
}

export function AlertDialog({ children }: AlertDialogProps) {
  return <>{children}</>;
}

// Trigger component
interface AlertDialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function AlertDialogTrigger({ 
  children, 
  asChild = false, 
  onClick 
}: AlertDialogTriggerProps) {
  const handleClick = () => {
    if (onClick) onClick();
    // In a complete implementation, we would also set the dialog open state
    // through context or other state management
  };

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<{
      onClick?: (e: React.MouseEvent) => void;
    }>;
    
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        if (child.props.onClick) child.props.onClick(e);
        handleClick();
      }
    });
  }
}

// Content wrapper
interface AlertDialogContentProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertDialogContent({ children, open, onOpenChange }: AlertDialogContentProps) {
  return (
    <Dialog open={open} onClose={() => onOpenChange(false)}>
      {children}
    </Dialog>
  );
}

// Header component
interface AlertDialogHeaderProps {
  children: React.ReactNode;
}

export function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return <>{children}</>;
}

// Title component
interface AlertDialogTitleProps {
  children: React.ReactNode;
}

export function AlertDialogTitle({ children }: AlertDialogTitleProps) {
  return <DialogTitle>{children}</DialogTitle>;
}

// Description component
interface AlertDialogDescriptionProps {
  children: React.ReactNode;
}

export function AlertDialogDescription({ children }: AlertDialogDescriptionProps) {
  return (
    <DialogContent>
      <Typography>{children}</Typography>
    </DialogContent>
  );
}

// Footer component
interface AlertDialogFooterProps {
  children: React.ReactNode;
}

export function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return <DialogActions>{children}</DialogActions>;
}

// Action component (confirm button)
interface AlertDialogActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function AlertDialogAction({ children, onClick, disabled }: AlertDialogActionProps) {
  return (
    <Button onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
}

// Cancel component
interface AlertDialogCancelProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function AlertDialogCancel({ children, onClick, disabled }: AlertDialogCancelProps) {
  return (
    <Button onClick={onClick} disabled={disabled} color="inherit">
      {children}
    </Button>
  );
}