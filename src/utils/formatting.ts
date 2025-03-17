// src/utils/formatting.ts

/**
 * Format angka menjadi mata uang Indonesia
 * @param value Jumlah yang akan diformat
 * @param currency Simbol mata uang (default: 'Rp')
 * @returns String mata uang yang diformat
 */
export const formatCurrency = (
    value: number | string | undefined, 
    currency: string = 'Rp'
  ): string => {
    if (value === undefined || value === null) return '-';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return '-';
  
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };
  
  /**
   * Format tanggal menjadi format Indonesia
   * @param date Tanggal yang akan diformat (bisa berupa string atau Date)
   * @param options Opsi tambahan untuk formatting
   * @returns String tanggal yang diformat
   */
  export const formatDate = (
    date: string | Date | undefined, 
    options: Intl.DateTimeFormatOptions = {}
  ): string => {
    if (!date) return '-';
  
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...options
    };
  
    try {
      const parsedDate = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat('id-ID', defaultOptions).format(parsedDate);
    } catch {
      return '-';
    }
  };
  
  /**
   * Memotong teks menjadi panjang tertentu
   * @param text Teks yang akan dipotong
   * @param maxLength Panjang maksimal teks
   * @param suffix Akhiran yang ditambahkan jika teks dipotong
   * @returns Teks yang sudah dipotong
   */
  export const truncateText = (
    text: string | undefined, 
    maxLength: number = 50, 
    suffix: string = '...'
  ): string => {
    if (!text) return '';
    
    return text.length > maxLength 
      ? text.substring(0, maxLength).trim() + suffix 
      : text;
  };