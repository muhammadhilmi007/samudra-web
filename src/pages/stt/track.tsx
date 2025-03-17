import React from 'react';
import SttTrack from '../../components/stt/SttTrack';

const TrackPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Lacak Pengiriman</h2>
      <p className="text-muted-foreground">
        Masukkan nomor STT untuk melacak status pengiriman barang Anda.
      </p>
      
      <SttTrack />
    </div>
  );
};

export default TrackPage;