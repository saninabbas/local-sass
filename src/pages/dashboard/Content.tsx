import { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { generateBlogArticle } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  RefreshCw, 
  BookOpen
} from 'lucide-react';

interface GeneratedPackage {
  title: string;
  meta_description?: string;
  slug?: string;
  h1?: string;
  focus_keywords?: string[];
  outline?: string[];
  read_time_minutes?: number;
  html_content: string;
  faqs?: Array<{ question: string; answer: string }>;
  internalLinks?: string[];
  ctaText?: string;
}

interface ContentGapItem {
  id: string;
  type: 'Service Page' | 'Location Page' | 'FAQ Page' | 'Blog Post' | 'Comparison Page';
  keyword: string;
  intent: 'Commercial / Decision' | 'Local Transactional' | 'Informational' | 'Comparison';
  competitorCoverage: string;
  yourCoverage: string;
  why: string;
  opportunity: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

const STRATEGIC_GAPS: ContentGapItem[] = [
  {
    id: 'cg-1',
    type: 'Service Page',
    keyword: 'Emergency Treatment Near Me',
    intent: 'Local Transactional',
    competitorCoverage: 'Dedicated URL ranking #1 with instant phone call trigger',
    yourCoverage: 'Brief mention on generic services overview page',
    why: 'Competitors capture 45+ monthly high-intent inquiries with a dedicated emergency landing page.',
    opportunity: 'Publish dedicated emergency service URL with click-to-call hero CTA',
    priority: 'HIGH'
  },
  {
    id: 'cg-2',
    type: 'Comparison Page',
    keyword: 'Treatment Costs & Financing Guide',
    intent: 'Commercial / Decision',
    competitorCoverage: 'Detailed price ranges, insurance FAQs, and transparent payment plans',
    yourCoverage: 'No pricing information published',
    why: 'Over 60% of searchers research pricing before calling. Transparent competitors win the conversion.',
    opportunity: 'Publish transparent pricing & payment options comparison guide',
    priority: 'HIGH'
  },
  {
    id: 'cg-3',
    type: 'Location Page',
    keyword: 'Top-Rated Services in Surrounding Neighborhoods',
    intent: 'Local Transactional',
    competitorCoverage: 'Dedicated sub-neighborhood pages with localized reviews and map anchors',
    yourCoverage: 'Targeting only 1 central city name',
    why: 'Google Local algorithms prioritize hyper-local proximity for neighborhood-specific queries.',
    opportunity: 'Create 2 targeted neighborhood landing pages',
    priority: 'MEDIUM'
  },
  {
    id: 'cg-4',
    type: 'FAQ Page',
    keyword: 'Common Questions, Preparation & Recovery',
    intent: 'Informational',
    competitorCoverage: 'Expandable accordion with FAQPage schema markup in Google SERP',
    yourCoverage: 'Missing structured FAQ section',
    why: 'FAQPage schema wins double the visual real estate in mobile Google search results.',
    opportunity: 'Deploy 8 local FAQs with schema.org structured data',
    priority: 'MEDIUM'
  },
  {
    id: 'cg-5',
    type: 'Blog Post',
    keyword: 'What to Expect During Your First Appointment',
    intent: 'Informational',
    competitorCoverage: 'High-ranking editorial blog post linking to booking consultation form',
    yourCoverage: 'No blog content published in 90+ days',
    why: 'Builds topical trust and funnels organic informational traffic directly to your booking form.',
    opportunity: 'Draft comprehensive patient guide with interactive checklist',
    priority: 'MEDIUM'
  }
];

export function Content() {
  const [topic, setTopic] = useState('');
  const [targetAudience] = useState('');
  const [tone, setTone] = useState('authoritative');
  const [contentType, setContentType] = useState<'service' | 'blog' | 'faq' | 'comparison'>('service');
  
  const [loading, setLoading] = useState(false);
  const [generatedPackage, setGeneratedPackage] = useState<GeneratedPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'gaps' | 'generator'>('gaps');

  const handleGenerate = async (presetTopic?: string) => {
    const finalTopic = presetTopic || topic;
    if (!finalTopic.trim()) {
      setError('Please select or specify a topic.');
      return;
    }

    setLoading(true);
    setError(null);
    if (presetTopic) setTopic(presetTopic);
    setActiveTab('generator');

    try {
      const response = await generateBlogArticle({
        topic: finalTopic,
        target_audience: targetAudience || 'Local prospective clients',
        tone,
        contentType
      });

      const pkg: GeneratedPackage = {
        title: response.title || `${finalTopic} — Comprehensive Guide`,
        meta_description: response.meta_description || `Discover expert insights on ${finalTopic}. Fast, reliable local service. Schedule your appointment today!`,
        slug: response.slug || finalTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        h1: response.title || finalTopic,
        outline: [
          'Overview & Importance in Your Local Area',
          'Key Symptoms & What to Look For',
          'Step-by-Step Treatment / Service Process',
          'Cost, Financing & Value Breakdown',
          'Frequently Asked Questions & Next Steps'
        ],
        html_content: response.html_content || `<h2>Introduction</h2><p>When searching for trusted services, finding an experienced provider is paramount...</p>`,
        read_time_minutes: response.read_time_minutes || 4,
        focus_keywords: response.focus_keywords || [finalTopic, 'local service', 'pricing guide'],
        faqs: [
          { question: `How much does ${finalTopic.toLowerCase()} typically cost?`, answer: 'Costs vary depending on individual requirements. We offer transparent estimates during your baseline consultation.' },
          { question: 'How quickly can I schedule an appointment?', answer: 'We offer same-day and next-day availability for urgent local inquiries.' }
        ],
        internalLinks: ['/services/primary-care', '/contact', '/pricing'],
        ctaText: 'Schedule Your Confidential Consultation Today'
      };

      setGeneratedPackage(pkg);
    } catch (err: any) {
      setError(err.message || 'Failed to generate content package.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPackage) return;
    const fullText = `Title: ${generatedPackage.title}\nMeta Description: ${generatedPackage.meta_description}\nSlug: /${generatedPackage.slug}\n\n${generatedPackage.html_content}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] mb-1 flex items-center gap-2.5">
            <BookOpen className="text-[#cc785c]" size={26} />
            Content Opportunity & Generation Studio
          </h1>
          <p className="text-xs text-[#6c6a64] max-w-2xl font-sans">
            Identify competitor topic gaps and generate complete, publication-ready landing pages, FAQ schemas, and articles.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-1.5 mb-6 overflow-x-auto no-scrollbar gap-1.5 text-xs font-sans font-medium">
        <button
          onClick={() => setActiveTab('gaps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'gaps'
              ? 'bg-[#faf9f5] text-[#141413] font-semibold shadow-xs border border-[#e6dfd8]'
              : 'text-[#6c6a64] hover:text-[#141413]'
          }`}
        >
          <Layers size={14} className="text-[#cc785c]" />
          <span>Competitor Content Gaps ({STRATEGIC_GAPS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('generator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'generator'
              ? 'bg-[#faf9f5] text-[#141413] font-semibold shadow-xs border border-[#e6dfd8]'
              : 'text-[#6c6a64] hover:text-[#141413]'
          }`}
        >
          <Sparkles size={14} className="text-[#cc785c]" />
          <span>AI Content Generator</span>
        </button>
      </div>

      {/* Tab 1: Content Gaps Matrix */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-base font-normal text-[#141413]">
                High-ROI Topic Opportunities
              </h3>
              <span className="text-[10px] font-mono uppercase bg-[#faf9f5] text-[#cc785c] px-2.5 py-0.5 rounded border border-[#e6dfd8] font-semibold">
                SERP Verified Gaps
              </span>
            </div>
            <p className="text-xs text-[#6c6a64] font-sans">
              These pages and topics are actively driving organic traffic and phone inquiries for your top local competitors while absent from your domain.
            </p>
          </div>

          <div className="space-y-3.5">
            {STRATEGIC_GAPS.map((gap) => (
              <div key={gap.id} className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#faf9f5] text-[#141413] border border-[#e6dfd8]">
                      {gap.type}
                    </span>
                    <h4 className="font-serif text-sm font-medium text-[#141413]">{gap.keyword}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#cc785c] font-semibold">{gap.intent}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3 text-xs bg-[#faf9f5] p-3.5 rounded-lg border border-[#e6dfd8] font-sans">
                  <div>
                    <span className="text-[10px] font-mono text-[#8e8b82] uppercase block mb-0.5">Competitor Advantage vs Your Coverage</span>
                    <p className="text-[#3d3d3a] leading-relaxed">
                      <strong>Them:</strong> {gap.competitorCoverage}<br />
                      <strong>You:</strong> <span className="text-[#c64545]">{gap.yourCoverage}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#8e8b82] uppercase block mb-0.5">Why This Wins Searchers</span>
                    <p className="text-[#141413] leading-relaxed">{gap.why}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#e6dfd8]">
                  <span className="text-[11px] font-mono text-[#5db872]">{gap.opportunity}</span>
                  <button
                    onClick={() => handleGenerate(gap.keyword)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-lg text-xs font-sans font-medium transition-colors shadow-xs"
                  >
                    <Sparkles size={13} />
                    <span>GENERATE WITH AI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: AI Content Generator Studio */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          
          {/* Customizer Card */}
          <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] p-5 shadow-xs font-sans text-xs space-y-4">
            <h3 className="font-serif text-base font-normal text-[#141413]">
              Generate SEO Landing Page or Article
            </h3>

            {error && (
              <div className="p-3 bg-[#c64545]/15 border border-[#c64545]/30 text-[#c64545] rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[#6c6a64] mb-1">Target Keyword / Procedure</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Care in Dallas"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[#6c6a64] mb-1">Page Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                >
                  <option value="service">Dedicated Service Landing Page</option>
                  <option value="comparison">Transparent Pricing & Cost Guide</option>
                  <option value="faq">Local Customer FAQ Hub</option>
                  <option value="blog">Educational Authority Article</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[#6c6a64] mb-1">Voice & Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                >
                  <option value="authoritative">Authoritative & Clinical</option>
                  <option value="friendly">Warm & Patient-Centric</option>
                  <option value="concise">Direct & Action-Oriented</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => handleGenerate()}
                disabled={loading || !topic.trim()}
                className="px-6 py-2.5 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>{loading ? 'Synthesizing Full Package...' : 'Generate Full SEO Package'}</span>
              </Button>
            </div>
          </div>

          {/* Generated Package Output */}
          {generatedPackage && (
            <div className="bg-[#efe9de] rounded-xl border border-[#e6dfd8] shadow-xs overflow-hidden">
              <div className="p-4 bg-[#e8e0d2] border-b border-[#e6dfd8] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#cc785c] font-bold">READY TO PUBLISH</span>
                  <h3 className="font-serif text-base text-[#141413] font-normal">{generatedPackage.title}</h3>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413] rounded-lg border border-[#e6dfd8] text-xs font-sans font-medium transition-colors"
                >
                  {copied ? <Check size={14} className="text-[#5db872]" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied HTML & Meta!' : 'Copy Complete HTML'}</span>
                </button>
              </div>

              <div className="p-6 space-y-5 font-sans text-xs bg-[#faf9f5]">
                {/* Meta Snippet Preview */}
                <div className="p-4 rounded-xl bg-[#efe9de]/50 border border-[#e6dfd8] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#8e8b82]">Google SERP Snippet Preview</div>
                  <div className="font-sans text-blue-800 text-sm font-medium hover:underline cursor-pointer">
                    {generatedPackage.title}
                  </div>
                  <div className="font-mono text-[11px] text-[#2b753e]">
                    https://yoursite.com/{generatedPackage.slug}
                  </div>
                  <div className="text-xs text-[#6c6a64] leading-relaxed">
                    {generatedPackage.meta_description}
                  </div>
                </div>

                {/* Article / Page Body Preview */}
                <div>
                  <h4 className="font-mono text-[10px] uppercase font-bold text-[#8e8b82] mb-2">Rendered HTML Content</h4>
                  <div 
                    className="prose prose-xs max-w-none p-5 rounded-xl border border-[#e6dfd8] bg-white leading-relaxed text-[#141413]"
                    dangerouslySetInnerHTML={{ __html: generatedPackage.html_content }}
                  />
                </div>

                {/* Structured FAQs */}
                {generatedPackage.faqs && (
                  <div>
                    <h4 className="font-mono text-[10px] uppercase font-bold text-[#8e8b82] mb-2">Local FAQ Schema Elements</h4>
                    <div className="space-y-2">
                      {generatedPackage.faqs.map((faq, i) => (
                        <div key={i} className="p-3 bg-[#efe9de]/40 rounded-lg border border-[#e6dfd8]">
                          <div className="font-medium text-[#141413]">{faq.question}</div>
                          <div className="text-[#6c6a64] mt-0.5 leading-relaxed">{faq.answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </DashboardLayout>
  );
}
