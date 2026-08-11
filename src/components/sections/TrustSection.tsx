export function TrustSection() {
  const businesses = [
    'Restaurants',
    'Dentists',
    'Salons',
    'Clinics',
    'Gyms',
    'Lawyers',
    'Real Estate',
    'Local Services',
  ];

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-6">
          Built for local businesses
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {businesses.map((type) => (
            <div 
              key={type} 
              className="px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium text-secondary"
            >
              {type}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
