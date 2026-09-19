export function TrustSection() {
  const businesses = [
    'Dental Clinics',
    'Restaurants & Bistros',
    'Law Firms',
    'Boutique Salons',
    'Fitness Studios',
    'Real Estate Agencies',
    'Home Services',
    'Healthcare Practices',
  ];

  return (
    <section className="py-12 bg-[#efe9de] border-b border-[#e6dfd8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-mono uppercase tracking-[1.5px] text-[#6c6a64] font-semibold mb-6">
          Calibrated for all local industries
        </p>
        
        <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
          {businesses.map((type) => (
            <div 
              key={type} 
              className="px-4 py-1.5 rounded-full bg-[#faf9f5] border border-[#e6dfd8] text-xs font-sans font-medium text-[#252523] shadow-sm hover:border-[#cc785c] transition-colors"
            >
              {type}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
