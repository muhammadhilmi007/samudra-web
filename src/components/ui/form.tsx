import MuiFormControl from '@mui/material/FormControl';
import MuiFormLabel from '@mui/material/FormLabel';
import MuiFormHelperText from '@mui/material/FormHelperText';
import {
  useFormContext,
  Controller,
  FormProvider as RHFFormProvider,
  FieldValues,
  ControllerRenderProps,
  Path
} from 'react-hook-form';
import { ReactNode, forwardRef, HTMLAttributes } from 'react';

// Export Material UI's FormControl
export const FormControl = MuiFormControl;

// Form component using React Hook Form
export const Form = <TFieldValues extends FieldValues>({
  children,
  onSubmit,
  ...props
}: {
  children: ReactNode;
  onSubmit: (data: TFieldValues) => void;
} & HTMLAttributes<HTMLFormElement>) => {
  const methods = useFormContext<TFieldValues>();
  
  if (!methods) {
    throw new Error('Form must be used within a FormProvider');
  }
  
  return (
    <RHFFormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} {...props}>
        {children}
      </form>
    </RHFFormProvider>
  );
};

// FormField wrapper for form fields
export const FormField = <TFieldValues extends FieldValues>({
  name,
  children
}: {
  name: Path<TFieldValues>;
  children: (props: { field: ControllerRenderProps<TFieldValues, Path<TFieldValues>> }) => ReactNode;
}) => {
  const { control } = useFormContext<TFieldValues>();
  
  if (!control) {
    throw new Error('FormField must be used within a Form');
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        // Ensure we're returning a valid React element
        const renderedContent = children({ field });
        // TypeScript needs explicit assurance this is a React element
        return renderedContent as React.ReactElement;
      }}
    />
  );
};

// FormItem wrapper for form items
export const FormItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
);
FormItem.displayName = 'FormItem';

// FormLabel component
export const FormLabel = MuiFormLabel;

// FormMessage component for errors
export const FormMessage = ({ children }: { children?: ReactNode }) => {
  return <MuiFormHelperText error>{children}</MuiFormHelperText>;
};

// Named exports object
export const FormComponents = {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} as const;