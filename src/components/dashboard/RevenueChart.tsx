import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getRevenueData } from '../../store/slices/dashboardSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ date, setDate, label }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

const RevenueChart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { revenueData, loading } = useSelector((state: RootState) => state.dashboard);
  
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() - 6))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const start = startDate ? startDate.toISOString() : undefined;
    const end = endDate ? endDate.toISOString() : undefined;
    dispatch(getRevenueData({ period, startDate: start, endDate: end }));
  }, [dispatch, period, startDate, endDate]);

  // Function to format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip formatter for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded shadow-lg border">
          <p className="font-bold">{label}</p>
          <p className="text-green-600">
            Pendapatan: {formatCurrency(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-red-600">
              Biaya: {formatCurrency(payload[1].value)}
            </p>
          )}
          {payload[2] && (
            <p className="text-blue-600">
              Profit: {formatCurrency(payload[2].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Grafik Pendapatan</CardTitle>
            <CardDescription>
              Analisis pendapatan perusahaan berdasarkan waktu
            </CardDescription>
          </div>
          
          <Tabs defaultValue="monthly" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger 
                value="daily" 
                onClick={() => setPeriod('daily')}
              >
                Harian
              </TabsTrigger>
              <TabsTrigger 
                value="weekly" 
                onClick={() => setPeriod('weekly')}
              >
                Mingguan
              </TabsTrigger>
              <TabsTrigger 
                value="monthly" 
                onClick={() => setPeriod('monthly')}
              >
                Bulanan
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between mb-6 space-x-4">
          <DatePicker
            date={startDate}
            setDate={setStartDate}
            label="Pilih tanggal mulai"
          />
          <DatePicker
            date={endDate}
            setDate={setEndDate}
            label="Pilih tanggal akhir"
          />
        </div>
        
        <div className="h-[300px]">
          {loading ? (
            <div className="w-full h-full flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `${value / 1000000}Jt`} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Pendapatan"
                  stroke="#10b981"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Biaya"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;