import React from 'react';
import dynamic from 'next/dynamic';

const ClientApp = dynamic(() => import('../../../components/ClientApp'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] text-[#10b981]">
      <h1 className="text-xl font-bold tracking-widest animate-pulse">AI KRUSHI MITRA</h1>
      <p className="text-xs uppercase tracking-widest mt-4 opacity-75">Loading secure app console...</p>
    </div>
  )
});

export async function generateStaticParams() {
  return [
    { slug: [] }
  ];
}

export default function AppPage() {
  return <ClientApp />;
}
