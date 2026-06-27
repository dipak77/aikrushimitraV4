import React from 'react';
import Link from 'next/link';
import AnalyticsTracker from '../../../components/AnalyticsTracker';

interface CropParams {
  crop: string;
}

export async function generateStaticParams() {
  return [
    { crop: 'soybean' },
    { crop: 'cotton' },
    { crop: 'onion' },
    { crop: 'wheat' },
    { crop: 'tomato' },
    { crop: 'potato' },
    { crop: 'rice' },
  ];
}

export async function generateMetadata({ params }: { params: CropParams }) {
  const { crop } = params;
  const capCrop = crop.charAt(0).toUpperCase() + crop.slice(1);
  return {
    title: `${capCrop} Cultivation Guide: Sowing, Irrigation & Disease Control`,
    description: `Complete guide on ${crop} farming in India. Learn about optimal soil preparation, seed treatment, irrigation schedules, fertilizer doses (NPK), and disease management.`,
    alternates: {
      canonical: `https://aikrushimitra.in/crops/${crop}/`,
    }
  };
}

export default function CropPage({ params }: { params: CropParams }) {
  const { crop } = params;
  const capCrop = crop.charAt(0).toUpperCase() + crop.slice(1);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${capCrop} Cultivation & Scientific Farming Guide`,
    "description": `Comprehensive agricultural cultivation framework detailing optimal procedures for growing ${crop} successfully in Indian climates.`,
    "image": "https://images.unsplash.com/photo-1592982537447-6f2a6a0c4c12?q=80&w=800&auto=format&fit=crop",
    "author": {
      "@type": "Organization",
      "name": "AI Krushi Mitra Research Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI Krushi Mitra",
      "logo": {
        "@type": "ImageObject",
        "url": "https://aikrushimitra.in/favicon.ico"
      }
    },
    "datePublished": "2026-01-01",
    "dateModified": new Date().toISOString().split('T')[0]
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <AnalyticsTracker viewName={`CROP_GUIDE_${crop.toUpperCase()}`} locationName={`Crops Guide: ${crop}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <nav className="text-xs text-emerald-400/80 mb-6 flex gap-2 items-center font-mono">
        <Link href="/">Home</Link>
        <span>&gt;</span>
        <span className="text-slate-400">Crops Guide</span>
        <span>&gt;</span>
        <span className="text-slate-200 capitalize font-semibold">{capCrop}</span>
      </nav>

      <header className="border-b border-white/10 pb-8 mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black tracking-widest uppercase mb-4">
          🌱 Scientific Cultivation Framework
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Complete {capCrop} Cultivation Guide for Indian Farmers
        </h1>
        <p className="text-slate-400 text-lg mt-4 leading-relaxed">
          Step-by-step guidelines to optimize NPK fertilization, irrigation frequency, land preparation, and crop protection for a high-yield harvest.
        </p>
      </header>

      {/* Main Content Body (Structured for SEO length) */}
      <div className="prose prose-invert max-w-none text-slate-300 space-y-8 leading-relaxed">
        
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tight">1. Soil Requirements & Land Preparation</h2>
          <p>
            For maximum productivity, {capCrop} requires well-drained fertile land. Ideally, a sandy loam or clay loam soil with a neutral pH range of 6.0 to 7.5 is best suited for root development and nutrient uptake. Deep summer ploughing should be performed at least 2-3 weeks before sowing to expose soil-borne pests and weed seeds to solar heat, reducing infestation pressure naturally.
          </p>
          <p>
            Incorporate 10-15 tonnes of fully decomposed Farm Yard Manure (FYM) or compost per hectare during the final land harrowing. If soil testing reveals acidic properties, apply agricultural lime as per recommendations; for alkaline soils, gypsum can be applied to restore structure. Prepare smooth seed beds with micro-drainage channels to prevent water stagnation, which causes root rot and wilting.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tight">2. Seed Selection & Bio-Treatment</h2>
          <p>
            Using certified high-yielding varieties (HYV) accounts for a 15-20% increase in crop yield. Ensure seeds possess high germination percentages (greater than 85%) and are sourced from authorized agricultural research centers. Popular varieties suitable for Indian climate zones include JS-335, Bt cultivars, and hybrid selections.
          </p>
          <p>
            <strong>Mandatory Seed Treatment Protocol:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-400">
            <li><strong>Fungicidal Treatment:</strong> Treat seeds with Trichoderma viride (4g/kg seed) or Thiram/Carbendazim (2g/kg seed) to prevent damping-off.</li>
            <li><strong>Bacterial Inoculation:</strong> Inoculate with Rhizobium (for legumes) or Azotobacter culture (10g/kg seed) along with Phosphate Solubilizing Bacteria (PSB) to boost biological nitrogen fixation.</li>
            <li><strong>Drying:</strong> Shade-dry the treated seeds for 30 minutes before mechanical or manual sowing. Do not expose treated seeds to direct sunlight.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tight">3. Sowing Guidelines & Spacing Matrix</h2>
          <p>
            Sowing depth and spacing are critical determinants of plant population density and sunlight interception. Sow seeds at a depth of 3-5 cm. Standard recommended spacing guidelines:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-400">
            <li><strong>Row-to-Row Spacing:</strong> 45 cm to 60 cm depending on soil fertility.</li>
            <li><strong>Plant-to-Plant Spacing:</strong> 10 cm to 15 cm after thinning out weak seedlings.</li>
          </ul>
          <p>
            Perform sowing operations when the soil contains adequate moisture (typically after receiving 75-100 mm of monsoon showers). Early or late sowing will shift crop stages into unfavorable weather periods, drastically reducing seed size and overall grain yield.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tight">4. Integrated Fertilizer Management (NPK Ratio)</h2>
          <p>
            Fertilizer application must be based on a recent Soil Health Card analysis. As a general recommendation, the balanced NPK ratio for {capCrop} is established as follows:
          </p>
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 font-mono text-sm grid grid-cols-3 text-center divide-x divide-white/10 text-emerald-400">
            <div>
              <span className="text-slate-400 block text-xs uppercase font-sans mb-1">Nitrogen (N)</span>
              <strong>25-30 Kg/Ha</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-xs uppercase font-sans mb-1">Phosphorus (P)</span>
              <strong>60-80 Kg/Ha</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-xs uppercase font-sans mb-1">Potassium (K)</span>
              <strong>30-40 Kg/Ha</strong>
            </div>
          </div>
          <p>
            Apply the complete dose of Phosphorus and Potassium, along with a half-dose of Nitrogen, as a basal application during sowing. Apply the remaining half of Nitrogen during the active vegetative stage (30-35 days after sowing) combined with a light weeding operation. Foliar application of 2% Urea or 19:19:19 water-soluble NPK during the flowering phase will significantly enhance pod/boll density.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tight">5. Irrigation & Water Management</h2>
          <p>
            {capCrop} is sensitive to both water stress and waterlogging. Critical growth stages requiring mandatory irrigation include:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-slate-400">
            <li><strong>Seedling Stage:</strong> 15-20 days after sowing.</li>
            <li><strong>Flowering Stage:</strong> 35-45 days after sowing (highly sensitive to drought).</li>
            <li><strong>Pod/Fruit Development:</strong> 60-70 days after sowing (determines final grain weight).</li>
          </ol>
          <p>
            Under micro-irrigation systems like Drip or Sprinkler irrigation, water use efficiency increases by 40-50%, while reducing incidence of fungal leaf diseases. Maintain proper drainage channels to prevent water accumulation during heavy rainfall.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tight">6. Integrated Pest & Disease Management (IPM)</h2>
          <p>
            Protecting {capCrop} from biotic stress requires a combination of cultural, biological, and chemical methods:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-400">
            <li><strong>Pest Monitoring:</strong> Deploy yellow sticky traps (15/ha) for sucking pests like whiteflies and thrips. Install pheromone traps (5/ha) for bollworm monitoring.</li>
            <li><strong>Biological Control:</strong> Spray Neem Seed Kernel Extract (NSKE 5%) or register biological agents like Bacillus thuringiensis (Bt) for worm management.</li>
            <li><strong>Fungal Diseases:</strong> Control Leaf Spot, Rust, and Blight using timely foliar applications of Mancozeb (2.5g/L) or Carbendazim (1g/L).</li>
          </ul>
        </section>

      </div>

      {/* Programmatic Internal Links */}
      <footer className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">Live Market Rate Info</span>
          <div className="flex flex-wrap gap-3">
            <Link href={`/mandi-bhav/maharashtra/pune/${crop}`} className="text-xs bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-medium px-3.5 py-2 rounded-xl transition-all capitalize">
              Today's {capCrop} Mandi Bhav in Pune
            </Link>
          </div>
        </div>

        <Link href="/app" className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 rounded-2xl font-bold shadow-lg shadow-emerald-500/15 transition-all text-sm">
          Diagnose Crop Disease via AI &rarr;
        </Link>
      </footer>
    </article>
  );
}
