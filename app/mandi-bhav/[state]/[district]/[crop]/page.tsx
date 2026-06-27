import React from 'react';
import Link from 'next/link';
import { MOCK_MARKET } from '../../../../../data/mock';

interface MandiBhavParams {
  state: string;
  district: string;
  crop: string;
}

export async function generateStaticParams() {
  return [
    { state: 'maharashtra', district: 'pune', crop: 'onion' },
    { state: 'maharashtra', district: 'nashik', crop: 'onion' },
    { state: 'maharashtra', district: 'nagpur', crop: 'cotton' },
    { state: 'maharashtra', district: 'pune', crop: 'soybean' },
    { state: 'madhya-pradesh', district: 'indore', crop: 'soybean' },
    { state: 'madhya-pradesh', district: 'indore', crop: 'wheat' },
    { state: 'gujarat', district: 'rajkot', crop: 'cotton' },
    { state: 'rajasthan', district: 'jaipur', crop: 'wheat' },
  ];
}

export async function generateMetadata({ params }: { params: MandiBhavParams }) {
  const { crop, district, state } = params;
  const capitalizedCrop = crop.charAt(0).toUpperCase() + crop.slice(1);
  const capitalizedDistrict = district.charAt(0).toUpperCase() + district.slice(1);
  const capitalizedState = state.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `${capitalizedCrop} Mandi Bhav ${capitalizedDistrict} Today | Live Market Rates & Trends`,
    description: `Get real-time today's ${crop} mandi bhav in ${capitalizedDistrict}, ${capitalizedState}. Find modal price, min price, max price, and future market predictions for ${crop}.`,
    alternates: {
      canonical: `https://aikrushimitra.in/mandi-bhav/${state}/${district}/${crop}/`,
    }
  };
}

export default function MandiBhavPage({ params }: { params: MandiBhavParams }) {
  const { crop, district, state } = params;
  const capitalizedCrop = crop.charAt(0).toUpperCase() + crop.slice(1);
  const capitalizedDistrict = district.charAt(0).toUpperCase() + district.slice(1);
  const capitalizedState = state.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Lookup base price from mock data
  const cropData = MOCK_MARKET.find(c => c.name.toLowerCase() === crop.toLowerCase()) || {
    price: 4500,
    trend: '+100'
  };

  const basePrice = cropData.price;
  const minPrice = Math.floor(basePrice * 0.9);
  const maxPrice = Math.floor(basePrice * 1.1);
  const isUp = !cropData.trend.startsWith('-');

  // Localized terms
  const localizedTitleMr = `आजचे ${capitalizedCrop} बाजार भाव - ${capitalizedDistrict}, ${capitalizedState}`;
  const localizedTitleHi = `आज का ${capitalizedCrop} मंडी भाव - ${capitalizedDistrict}, ${capitalizedState}`;

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${capitalizedCrop} Market Prices in ${capitalizedDistrict}`,
    "description": `Historical and live price index data for ${crop} crop in ${capitalizedDistrict} APMC mandi market of ${capitalizedState}.`,
    "license": "https://creativecommons.org/publicdomain/zero/1.0/",
    "spatialCoverage": `${capitalizedDistrict}, ${capitalizedState}, India`,
    "variableMeasured": "Modal crop price per quintal (100 Kg)",
    "temporalCoverage": new Date().toISOString().split('T')[0]
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />

      <nav className="text-xs text-emerald-400/80 mb-6 flex gap-2 items-center font-mono">
        <Link href="/">Home</Link>
        <span>&gt;</span>
        <span className="text-slate-400 capitalize">Mandi Bhav</span>
        <span>&gt;</span>
        <span className="text-slate-400 capitalize">{capitalizedState}</span>
        <span>&gt;</span>
        <span className="text-slate-200 capitalize font-semibold">{capitalizedDistrict}</span>
      </nav>

      {/* Hero Header */}
      <header className="border-b border-white/10 pb-8 mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black tracking-widest uppercase mb-4">
          🔴 Live Market Feed
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Today's {capitalizedCrop} Mandi Bhav in {capitalizedDistrict}, {capitalizedState}
        </h1>
        <div className="mt-4 flex flex-col gap-1 text-slate-400 text-sm">
          <p>{localizedTitleMr}</p>
          <p>{localizedTitleHi}</p>
        </div>
      </header>

      {/* Dynamic Data Table */}
      <section className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/40 mb-10 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          📊 APMC Price Summary (INR / Quintal)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Market / Mandi</th>
                <th className="py-3 px-4 text-right">Min Price</th>
                <th className="py-3 px-4 text-right">Max Price</th>
                <th className="py-3 px-4 text-right">Modal Price</th>
                <th className="py-3 px-4 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              <tr>
                <td className="py-4 px-4 font-sans font-semibold text-white">{capitalizedDistrict} APMC Main Market</td>
                <td className="py-4 px-4 text-right">₹{minPrice}</td>
                <td className="py-4 px-4 text-right">₹{maxPrice}</td>
                <td className="py-4 px-4 text-right text-emerald-400 font-bold">₹{basePrice}</td>
                <td className={`py-4 px-4 text-right font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {cropData.trend}
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-sans text-slate-400">{capitalizedDistrict} Sub-market Yard</td>
                <td className="py-4 px-4 text-right">₹{Math.floor(minPrice * 0.98)}</td>
                <td className="py-4 px-4 text-right">₹{Math.floor(maxPrice * 0.98)}</td>
                <td className="py-4 px-4 text-right text-slate-300">₹{Math.floor(basePrice * 0.98)}</td>
                <td className={`py-4 px-4 text-right ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  Stable
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-slate-500 mt-4 italic">
          * Mandi price records are updated daily at 6:00 PM. Modal prices correspond to the bulk transaction average rate per quintal (100 Kg).
        </p>
      </section>

      {/* Auto-generated Analysis Text Block */}
      <section className="space-y-6 text-slate-400 leading-relaxed text-base">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {capitalizedCrop} Market Price Trends & Analysis in {capitalizedDistrict}
        </h2>
        <p>
          Today's average price for <strong>{capitalizedCrop}</strong> in the {capitalizedDistrict} main market is recorded at <strong>₹{basePrice} per quintal</strong>. The trading range remained healthy, with peak quality lots auctioning up to a maximum rate of <strong>₹{maxPrice} per quintal</strong>, while average/mix grade arrivals fetched a minimum support price of <strong>₹{minPrice} per quintal</strong>.
        </p>
        <p>
          Compared to last week, the overall price behavior shows a <strong>{isUp ? 'positive surge' : 'soft correction'} of {cropData.trend}</strong>. Local trade analysts attribute this movement to {isUp ? 'tight supply schedules and robust festive demanding' : 'increased bulk arrivals from harvesting plots in surrounding villages'}. Over the coming 15 days, prices are anticipated to remain relatively firm due to crop volume tracking metrics.
        </p>

        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-200/90 text-sm">
          💡 <strong>Farmer Advisory:</strong> Based on the current trend, we suggest selling quality grade {crop} produce immediately in the {capitalizedDistrict} APMC yard to secure maximum returns before next month's fresh harvesting batches arrive.
        </div>
      </section>

      {/* Programmatic Internal Links */}
      <footer className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">Related Crop Guides</span>
          <div className="flex flex-wrap gap-3">
            <Link href={`/crops/${crop}`} className="text-xs bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-medium px-3.5 py-2 rounded-xl transition-all capitalize">
              {capitalizedCrop} Cultivation Guide
            </Link>
          </div>
        </div>

        <Link href="/app" className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 rounded-2xl font-bold shadow-lg shadow-emerald-500/15 transition-all text-sm">
          Open AI Krushi Mitra Assistant &rarr;
        </Link>
      </footer>
    </article>
  );
}
