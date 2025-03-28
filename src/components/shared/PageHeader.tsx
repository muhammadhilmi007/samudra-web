// src/components/shared/PageHeader.tsx
import React, { ReactNode } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Breadcrumbs, 
  Link as MuiLink,
  Paper,
  useTheme
} from '@mui/material';
import NextLink from 'next/link';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  // Back link support
  backLink?: string;
  
  // Support both action methods
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  
  // Support for direct link action
  primaryActionLabel?: string;
  primaryActionLink?: string;
  primaryActionIcon?: ReactNode;
  
  // Support for multiple actions
  actions?: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  backLink,
  action,
  primaryActionLabel,
  primaryActionLink,
  primaryActionIcon,
  actions,
}) => {
  const theme = useTheme();

  // Function to get the correct button color based on variant
  const getButtonProps = (variant?: string) => {
    switch(variant) {
      case 'secondary':
        return { color: 'secondary' as const };
      case 'danger':
        return { color: 'error' as const };
      default:
        return { color: 'primary' as const };
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3, 
        backgroundColor: theme.palette.background.default,
        borderRadius: 2,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          {breadcrumbs && (
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
              <NextLink href="/dashboard" passHref>
                <MuiLink 
                  color="inherit" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                  Home
                </MuiLink>
              </NextLink>
              
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                
                if (isLast || !crumb.href) {
                  return (
                    <Typography color="text.primary" key={index}>
                      {crumb.label}
                    </Typography>
                  );
                }
                
                return (
                  <NextLink href={crumb.href} passHref key={index}>
                    <MuiLink 
                      color="inherit" 
                      sx={{ 
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {crumb.label}
                    </MuiLink>
                  </NextLink>
                );
              })}
            </Breadcrumbs>
          )}
          
          <Box display="flex" alignItems="center">
            {backLink && (
              <NextLink href={backLink} passHref>
                <Button
                  startIcon={<ArrowBackIcon />}
                  sx={{ mr: 2 }}
                  variant="text"
                >
                  Back
                </Button>
              </NextLink>
            )}
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
          </Box>
          
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        <Box display="flex" gap={1}>
          {actions && actions.map((actionItem, index) => (
            <Button
              key={index}
              variant="contained"
              {...getButtonProps(actionItem.variant)}
              startIcon={actionItem.icon}
              onClick={actionItem.onClick}
            >
              {actionItem.label}
            </Button>
          ))}
        
          {action && (
            <Button
              variant="contained"
              {...getButtonProps(action.variant)}
              startIcon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}

          {primaryActionLink && primaryActionLabel && (
            <NextLink href={primaryActionLink} passHref>
              <Button
                variant="contained"
                color="primary"
                startIcon={primaryActionIcon}
                component="a"
              >
                {primaryActionLabel}
              </Button>
            </NextLink>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default PageHeader;
