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
import { Home as HomeIcon } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  action,
}) => {
  const theme = useTheme();

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
          
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {action && (
          <Button
            variant="contained"
            color="primary"
            startIcon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default PageHeader;