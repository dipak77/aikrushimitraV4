import React from 'react';
import Link from 'next/link';

interface DiseaseParams {
  disease: string;
}

export async function generateStaticParams() {
  return [
    { disease: 'rust-disease' },
    { disease: 'blight-disease' },
    { disease: 'bollworm-infestation' },
    { disease: 'blast-disease' },
    { disease: 'powdery-mildew' },
  ];
}

export async function generateMetadata({ params }: { params: DiseaseParams }) {
  const { disease } = params;
  const name = disease.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    title: `${name} Identification, Control and Treatment Guide`,
    description: `How to identify and control ${name} on crops. Read symptoms, preventive farming steps, organic solutions, and recommended chemical sprays.`,
    alternates: {
      canonical: `https://aikrushimitra.in/diseases/${disease}/`,
    }
  };
}

export default function DiseasePage({ params }: { params: DiseaseParams }) {
  const { disease } = params;
  const name = disease.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const diseaseImages: Record<string, string> = {
    'rust-disease': 'https://images.unsplash.com/photo-1595844730298-b28a0635b6d1?q=80&w=800&auto=format&fit=crop',
    'blight-disease': 'https://images.unsplash.com/photo-1574943320219-55c5145f0a2a?q=80&w=800&auto=format&fit=crop',
    'bollworm-infestation': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800&auto=format&fit=crop',
    'blast-disease': 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c4c12?q=80&w=800&auto=format&fit=crop',
    'powdery-mildew': 'https://images.unsplash.com/photo-1586771107146-f162f23d0402?q=80&w=800&auto=format&fit=crop'
  };

  const imageUrl = diseaseImages[disease] || 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c4c12?q=80&w=800&auto=format&fit=crop';

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${name} Identification and Treatment Guidelines`,
    "description": `Comprehensive agricultural advisory framework detailing identifying symptoms and mitigation strategies for ${name} crop infestation.`,
    "image": imageUrl,
    "author": {
      "@type": "Organization",
      "name": "AI Krushi Mitra Crop Doctors"
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <nav className="text-xs text-emerald-400/80 mb-6 flex gap-2 items-center font-mono">
        <Link href="/">Home</Link>
        <span>&gt;</span>
        <span className="text-slate-400">Crop Health</span>
        <span>&gt;</span>
        <span className="text-slate-200 capitalize font-semibold">{name}</span>
      </nav>

      <header className="border-b border-white/10 pb-8 mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-black tracking-widest uppercase mb-4">
          ⚠️ Pathogen Threat Advisory
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          How to Detect and Control {name}
        </h1>
        <p className="text-slate-400 text-lg mt-4 leading-relaxed">
          Detailed diagnosis parameters, preventive cultural operations, biological controls, and recommended chemical sprays to eradicate {name} from your plots.
        </p>
      </header>

      {/* Disease Image visual representation */}
      <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 mb-8 max-h-[400px]">
        <img
          src={imageUrl}
          alt={`Crop infected with ${name}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>

      <div className="space-y-8 text-slate-300 leading-relaxed text-base">
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tight">1. Symptom Diagnosis Guide</h2>
          <p>
            Early detection of <strong>{name}</strong> is critical to prevent complete yield collapse. On susceptible crop leaves and stems, initial symptoms manifest as small, water-soaked spots or discolored patches. Over 3-5 days, these spots expand rapidly, forming dark concentric rings (often with a yellow halo) or producing powdery rust-colored pustules on the undersides of the leaves.
          </p>
          <p>
            In advanced stages of infection, leaf chlorosis occurs, leading to premature leaf drop (defoliation). This severely reduces the active photosynthesis area of the crop, resulting in shriveled grains, underdeveloped pods, or rotting stems. Regularly inspect your fields during high humidity or warm weather conditions, which speed up fungal spore germination.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tight">2. Root Causes & Environmental Factors</h2>
          <p>
            The pathogen causing {name} (typically fungal spores or bacterial agents) spreads through wind currents, splashing rain, or shared agricultural tools. It overwinters in crop debris left behind from previous seasons. Environmental conditions that trigger rapid spreading include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-400">
            <li>High relative humidity levels (above 85%).</li>
            <li>Moderate, warm temperatures between 20°C and 30°C.</li>
            <li>Dense crop spacing which limits air circulation and retains moisture in the canopy.</li>
            <li>Over-irrigation or water stagnation around plant roots.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tight">3. Integrated Cultural & Preventive Management</h2>
          <p>
            Before deploying chemical sprays, perform these cultural actions to reduce spore density:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-400">
            <li><strong>Crop Rotation:</strong> Rotate susceptible crops with non-host crops (e.g. cereals or green manure crops) for at least two seasons.</li>
            <li><strong>Sanitation:</strong> Remove and burn infected plants and crop residues to break the life cycle of the pathogen.</li>
            <li><strong>Sowing Density:</strong> Maintain correct row spacing to allow solar light penetration and fast leaf drying.</li>
            <li><strong>Resistant Varieties:</strong> Always prioritize planting certified disease-resistant crop varieties.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tight">4. Biological & Organic Solutions</h2>
          <p>
            For organic farming operations, spray biological agents like <i>Trichoderma viride</i> or <i>Pseudomonas fluorescens</i> (10g per liter of water) as a foliar application or soil drenching. Applying Neem Seed Kernel Extract (NSKE 5%) or spraying Neem Oil (3000 PPM) acts as a powerful preventative barrier against initial pathogen attacks.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tight">5. Recommended Chemical Treatment Controls</h2>
          <p>
            If infestation exceeds the Economic Threshold Level (ETL), apply chemical control measures immediately. Standard recommended sprays for {name}:
          </p>
          <table className="w-full text-left text-sm text-slate-300 divide-y divide-white/10 font-sans mt-4">
            <thead>
              <tr className="text-slate-400 uppercase text-xs tracking-wider">
                <th className="py-3 pr-4">Active Chemical Ingredient</th>
                <th className="py-3 px-4">Dosage per Liter</th>
                <th className="py-3 px-4">Application Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              <tr>
                <td className="py-3 pr-4 font-sans text-white">Mancozeb 75% WP</td>
                <td className="py-3 px-4">2.5 Grams</td>
                <td className="py-3 px-4">Foliar spray at initial symptom detection. Repeat after 10 days if required.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-sans text-white">Carbendazim 50% WP</td>
                <td className="py-3 px-4">1.0 Grams</td>
                <td className="py-3 px-4">Systemic control for deep vascular fungal infections.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-sans text-white">Hexaconazole 5% EC</td>
                <td className="py-3 px-4">2.0 Milliliters</td>
                <td className="py-3 px-4">Effective eradication spray for severe leaf rust and mildew attacks.</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      {/* Programmatic Internal Links */}
      <footer className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">Need Instant Diagnosis?</span>
          <p className="text-slate-400 text-xs max-w-sm">
            Take a picture of your crop using your smartphone and upload it to the AI Crop Doctor.
          </p>
        </div>

        <Link href="/app" className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl font-bold shadow-lg shadow-red-500/15 transition-all text-sm">
          Launch AI Crop Doctor Camera &rarr;
        </Link>
      </footer>
    </article>
  );
}
