import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, Typography } from '@/components/ui/card';

interface ShipmentStatusChartProps {
  data?: Array<{
    status: string;
    count: number;
  }>;
}

const ShipmentStatusChart: React.FC<ShipmentStatusChartProps> = ({ 
  data = [
    { status: 'PENDING', count: 20 },
    { status: 'MUAT', count: 15 },
    { status: 'TRANSIT', count: 25 },
    { status: 'LANSIR', count: 10 },
    { status: 'TERKIRIM', count: 25 },
    { status: 'RETURN', count: 5 }
  ] 
}) => {
  // Warna untuk setiap status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'gray';
      case 'MUAT': return 'blue';
      case 'TRANSIT': return 'skyblue';
      case 'LANSIR': return 'orange';
      case 'TERKIRIM': return 'green';
      case 'RETURN': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4">
          Status Pengiriman
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="status" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="count" name="Jumlah Pengiriman">
              {data.map((entry, index) => (
                <Bar 
                  key={`bar-${index}`} 
                  dataKey="count" 
                  fill={getStatusColor(entry.status)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ShipmentStatusChart;