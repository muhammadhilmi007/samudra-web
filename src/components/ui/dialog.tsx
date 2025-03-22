// src/components/ui/dialog.tsx
import * as React from 'react';
import MuiDialog from '@mui/material/Dialog';
import MuiDialogActions from '@mui/material/DialogActions';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogTitle from '@mui/material/DialogTitle';

type DialogContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DialogContext = React.createContext<DialogContextType>({
  open: false,
  setOpen: () => {},
});
export function Dialog({ children, ...props }: React.ComponentProps<typeof MuiDialog>) {
  const [open, setOpen] = React.useState(false);
  
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      <MuiDialog onClose={() => setOpen(false)} {...props}>
        {children}
      </MuiDialog>
    </DialogContext.Provider>
  );
}

export function DialogDescription({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className="text-sm text-gray-500" {...props}>{children}</p>;
}

export function DialogTrigger({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { setOpen } = React.useContext(DialogContext);
  
  return (
    <div onClick={() => setOpen(true)} {...props}>
      {children}
    </div>
  );
}

export function DialogContent({ children, ...props }: React.ComponentProps<typeof MuiDialogContent>) {
  return <MuiDialogContent {...props}>{children}</MuiDialogContent>;
}

export function DialogHeader({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>;
}

export function DialogTitle({ children, ...props }: React.ComponentProps<typeof MuiDialogTitle>) {
  return <MuiDialogTitle {...props}>{children}</MuiDialogTitle>;
}

export function DialogActions({ children, ...props }: React.ComponentProps<typeof MuiDialogActions>) {
  return <MuiDialogActions {...props}>{children}</MuiDialogActions>;
}

export { DialogContext };
