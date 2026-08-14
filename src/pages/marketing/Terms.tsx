import { PageLayout } from '../../components/layout/PageLayout';

export function Terms() {
  return (
    <PageLayout>
      <div className="bg-[#faf9f5] py-16 sm:py-24 border-b border-[#e6dfd8]">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 font-sans">
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141413] mb-2">Terms of Service</h1>
          <p className="text-xs font-mono text-[#8e8b82] mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-sm text-[#3d3d3a] leading-relaxed">
            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">1. Terms of Service</h2>
              <p>
                By accessing this website, you are agreeing to be bound by these website Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">2. Use License</h2>
              <p>
                Permission is granted to temporarily access the materials (information or software) on Rankora's website for personal, non-commercial transitory viewing only.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">3. Disclaimer</h2>
              <p>
                The materials on Rankora's website are provided "as is". Rankora makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-serif font-medium text-[#141413] mb-2">4. Limitations</h2>
              <p>
                In no event shall Rankora or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Rankora's website.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
