import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { getFinancialReport } from '../../store/slices/financeSlice';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Calendar, 
  Download, 
  File, 
  FileText, 
  Printer 
} from 'lucide-react';

interface FinancialReportProps {
  type: 'balance-sheet' | 'profit-loss' | 'receivables';
  title: string;
}

const FinancialReport: React.FC<FinancialReportProps> = ({ 
  type, 
  title 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);
  const { financialReports, loading } = useSelector((state: RootState) => state.finance);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [branchId, setBranchId] = useState(user?.cabangId || '');
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // Get report data on component mount and when filters change
  useEffect(() => {
    dispatch(getBranches());
    
    const filters = {
      type,
      branchId,
      period,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };
    
    dispatch(getFinancialReport(filters));
  }, [dispatch, type, branchId, period, dateRange]);
  
  // Get the report data
  const reportData = financialReports[type];
  
  // Format currency
  const formatCurrency = (value?: number) => {
    if (value === undefined) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  // Format date range text
  const getDateRangeText = () => {
    if (period === 'month') {
      return `Bulan ${format(new Date(dateRange.startDate), 'MMMM yyyy', { locale: id })}`;
    } else if (period === 'quarter') {
      const startMonth = new Date(dateRange.startDate).getMonth() + 1;
      const quarter = Math.ceil(startMonth / 3);
      const year = new Date(dateRange.startDate).getFullYear();
      return `Kuartal ${quarter} Tahun ${year}`;
    } else if (period === 'year') {
      return `Tahun ${new Date(dateRange.startDate).getFullYear()}`;
    } else {
      return `${format(new Date(dateRange.startDate), 'dd MMMM yyyy', { locale: id })} - ${format(new Date(dateRange.endDate), 'dd MMMM yyyy', { locale: id })}`;
    }
  };
  
  // Render report content based on type
  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (!reportData) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileText className="h-16 w-16 mb-4" />
          <p>Tidak ada data laporan yang tersedia</p>
        </div>
      );
    }
    
    switch (type) {
      case 'balance-sheet':
        return renderBalanceSheet();
      case 'profit-loss':
        return renderProfitLoss();
      case 'receivables':
        return renderReceivables();
      default:
        return null;
    }
  };
  
  // Render balance sheet report
  const renderBalanceSheet = () => {
    const { assets, liabilities, equity } = reportData;
    
    return (
      <>
        <Separator className="my-4" />
        
        {/* Assets Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Aset</h3>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[60%]">Akun</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets && assets.map((item: any, index: number) => (
                <TableRow key={index} className={item.isTotal ? "font-bold bg-muted/30" : ""}>
                  <TableCell className={item.isSubCategory ? "pl-6" : ""}>{item.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
              {!assets?.length && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                    Tidak ada data aset
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Liabilities Section */}
        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-bold">Kewajiban</h3>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[60%]">Akun</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liabilities && liabilities.map((item: any, index: number) => (
                <TableRow key={index} className={item.isTotal ? "font-bold bg-muted/30" : ""}>
                  <TableCell className={item.isSubCategory ? "pl-6" : ""}>{item.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
              {!liabilities?.length && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                    Tidak ada data kewajiban
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Equity Section */}
        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-bold">Ekuitas</h3>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[60%]">Akun</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equity && equity.map((item: any, index: number) => (
                <TableRow key={index} className={item.isTotal ? "font-bold bg-muted/30" : ""}>
                  <TableCell className={item.isSubCategory ? "pl-6" : ""}>{item.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
              {!equity?.length && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                    Tidak ada data ekuitas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary */}
        <div className="mt-8 p-4 bg-muted/30 rounded-md">
          <div className="flex justify-between items-center">
            <span className="font-bold">Total Aset:</span>
            <span className="font-bold">{formatCurrency(reportData.totalAssets)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="font-bold">Total Kewajiban dan Ekuitas:</span>
            <span className="font-bold">{formatCurrency(reportData.totalLiabilitiesAndEquity)}</span>
          </div>
        </div>
      </>
    );
  };
  
  // Render profit & loss report
  const renderProfitLoss = () => {
    const { revenues, expenses, grossProfit, netProfit } = reportData;
    
    return (
      <>
        <Separator className="my-4" />
        
        {/* Revenues Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Pendapatan</h3>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[60%]">Akun</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenues && revenues.map((item: any, index: number) => (
                <TableRow key={index} className={item.isTotal ? "font-bold bg-muted/30" : ""}>
                  <TableCell className={item.isSubCategory ? "pl-6" : ""}>{item.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
              {!revenues?.length && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                    Tidak ada data pendapatan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Expenses Section */}
        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-bold">Biaya</h3>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[60%]">Akun</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses && expenses.map((item: any, index: number) => (
                <TableRow key={index} className={item.isTotal ? "font-bold bg-muted/30" : ""}>
                  <TableCell className={item.isSubCategory ? "pl-6" : ""}>{item.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
              {!expenses?.length && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                    Tidak ada data biaya
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary */}
        <div className="mt-8 space-y-4">
          <div className="p-4 bg-muted/30 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-bold">Total Pendapatan:</span>
              <span className="font-bold text-green-600">{formatCurrency(reportData.totalRevenue)}</span>
            </div>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-bold">Total Biaya:</span>
              <span className="font-bold text-red-600">{formatCurrency(reportData.totalExpense)}</span>
            </div>
          </div>
          
          <div className="p-4 bg-primary/10 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Laba Bersih:</span>
              <span className="font-bold text-lg">{formatCurrency(reportData.netProfit)}</span>
            </div>
          </div>
        </div>
      </>
    );
  };
  
  // Render receivables report
  const renderReceivables = () => {
    const { receivables, summary } = reportData;
    
    return (
      <>
        <Separator className="my-4" />
        
        {/* Receivables Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Piutang</h3>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Pelanggan</TableHead>
                <TableHead>No. STT</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jatuh Tempo</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivables && receivables.map((item: any, index: number) => (
                <TableRow key={index} className={item.isOverdue ? "bg-red-50" : ""}>
                  <TableCell>{item.customerName}</TableCell>
                  <TableCell>{item.sttNumber}</TableCell>
                  <TableCell>{format(new Date(item.date), 'dd/MM/yyyy', { locale: id })}</TableCell>
                  <TableCell>{format(new Date(item.dueDate), 'dd/MM/yyyy', { locale: id })}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  <TableCell className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'OVERDUE' 
                        ? 'bg-red-100 text-red-800' 
                        : item.status === 'DUE_SOON' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {item.status === 'OVERDUE' 
                        ? 'Jatuh Tempo' 
                        : item.status === 'DUE_SOON' 
                          ? 'Segera Jatuh Tempo' 
                          : 'Aktif'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {!receivables?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    Tidak ada data piutang
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary */}
        {summary && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalReceivables)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Piutang Jatuh Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.overdueAmount)}</div>
                <p className="text-xs text-muted-foreground mt-1">{summary.overdueCount} pengiriman</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Piutang Segera Jatuh Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.dueSoonAmount)}</div>
                <p className="text-xs text-muted-foreground mt-1">{summary.dueSoonCount} pengiriman</p>
              </CardContent>
            </Card>
          </div>
        )}
      </>
    );
  };
  
  // Handle printing report
  const handlePrintReport = () => {
    window.print();
  };
  
  // Handle downloading report as PDF
  const handleDownloadPdf = () => {
    // Logic for generating PDF will be implemented here
    alert('Mengunduh laporan sebagai PDF...');
  };
  
  // Handle exporting report to Excel
  const handleExportExcel = () => {
    // Logic for exporting to Excel will be implemented here
    alert('Mengekspor laporan ke Excel...');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {getDateRangeText()}
          {branchId && (
            <>
              {" | "}
              Cabang: {branches.find(b => b._id === branchId)?.namaCabang || "Semua Cabang"}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Periode</span>
              <Select
                value={period}
                onValueChange={setPeriod}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Kustom</SelectItem>
                  <SelectItem value="month">Bulanan</SelectItem>
                  <SelectItem value="quarter">Kuartalan</SelectItem>
                  <SelectItem value="year">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {period === 'custom' && (
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Dari</span>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Sampai</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            )}
            
            {period === 'month' && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Bulan</span>
                <input
                  type="month"
                  value={dateRange.startDate.slice(0, 7)}
                  onChange={(e) => {
                    const selectedMonth = e.target.value;
                    const year = parseInt(selectedMonth.split('-')[0]);
                    const month = parseInt(selectedMonth.split('-')[1]) - 1;
                    
                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);
                    
                    setDateRange({
                      startDate: firstDay.toISOString().split('T')[0],
                      endDate: lastDay.toISOString().split('T')[0]
                    });
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}
            
            {period === 'quarter' && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Kuartal</span>
                <Select
                  value={`${new Date(dateRange.startDate).getFullYear()}-Q${Math.ceil((new Date(dateRange.startDate).getMonth() + 1) / 3)}`}
                  onValueChange={(value) => {
                    const [year, quarter] = value.split('-Q');
                    const startMonth = (parseInt(quarter) - 1) * 3;
                    
                    const firstDay = new Date(parseInt(year), startMonth, 1);
                    const lastDay = new Date(parseInt(year), startMonth + 3, 0);
                    
                    setDateRange({
                      startDate: firstDay.toISOString().split('T')[0],
                      endDate: lastDay.toISOString().split('T')[0]
                    });
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pilih kuartal" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <SelectItem key={i} value={`${new Date().getFullYear()}-Q${i + 1}`}>
                        Q{i + 1} {new Date().getFullYear()}
                      </SelectItem>
                    ))}
                    {Array.from({ length: 4 }).map((_, i) => (
                      <SelectItem key={i} value={`${new Date().getFullYear() - 1}-Q${i + 1}`}>
                        Q{i + 1} {new Date().getFullYear() - 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {period === 'year' && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Tahun</span>
                <Select
                  value={new Date(dateRange.startDate).getFullYear().toString()}
                  onValueChange={(value) => {
                    const year = parseInt(value);
                    
                    const firstDay = new Date(year, 0, 1);
                    const lastDay = new Date(year, 11, 31);
                    
                    setDateRange({
                      startDate: firstDay.toISOString().split('T')[0],
                      endDate: lastDay.toISOString().split('T')[0]
                    });
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <SelectItem key={i} value={(new Date().getFullYear() - i).toString()}>
                        {new Date().getFullYear() - i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Cabang</span>
              <Select
                value={branchId}
                onValueChange={setBranchId}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Cabang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Cabang</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch._id} value={branch._id}>
                      {branch.namaCabang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {renderReportContent()}
      </CardContent>
      <CardFooter className="border-t flex justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Laporan dibuat pada {format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintReport}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak Laporan
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Unduh PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <File className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FinancialReport;