import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { AnthropicLogo } from '../components/claude/AnthropicLogo';
import { ClaudeComputerUseCard } from '../components/claude/ClaudeComputerUseCard';

export const ClaudeShowcasePage: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'typescript'>('python');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pythonSnippet = `import anthropic

client = anthropic.Anthropic()

# Invoke Claude 3.7 Sonnet with Computer Use capability
response = client.beta.messages.create(
    model="claude-3-7-sonnet-20250219",
    max_tokens=4096,
    tools=[
        {
            "type": "computer_20241022",
            "name": "computer",
            "display_width_px": 1280,
            "display_height_px": 800,
            "display_number": 1
        },
        {
            "type": "text_editor_20241022",
            "name": "str_replace_editor"
        },
        {
            "type": "bash_20241022",
            "name": "bash"
        }
    ],
    messages=[
        {
            "role": "user",
            "content": "Navigate to the internal portal, filter the Q3 ledger, and export variance."
        }
    ],
    betas=["computer-use-2024-10-22"]
)

print(response.content)`;

  const tsSnippet = `import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

// Invoke Claude 3.7 Sonnet with Computer Use beta tool
const message = await anthropic.beta.messages.create({
  model: 'claude-3-7-sonnet-20250219',
  max_tokens: 4096,
  tools: [
    {
      type: 'computer_20241022',
      name: 'computer',
      display_width_px: 1280,
      display_height_px: 800,
      display_number: 1,
    }
  ],
  messages: [
    {
      role: 'user',
      content: 'Book direct flight SFO -> LHR under $900 departing Nov 12'
    }
  ],
  betas: ['computer-use-2024-10-22']
});

console.log(message.content);`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedLanguage === 'python' ? pythonSnippet : tsSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#141413] font-sans selection:bg-[#cc785c] selection:text-white">
      {/* 1. TOP NAVIGATION BAR (height 64px, canvas background, hairline border) */}
      <header className="sticky top-0 z-50 h-16 bg-[#faf9f5]/95 backdrop-blur-md border-b border-[#e6dfd8] px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center">
            <AnthropicLogo size={24} color="#141413" showWordmark={true} wordmarkColor="#141413" brandName="Claude" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium text-[#3d3d3a]">
            <a href="#overview" className="hover:text-[#141413] transition-colors">Overview</a>
            <a href="#demo" className="text-[#cc785c] font-semibold flex items-center gap-1.5">
              <span>Computer Use</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#cc785c]/15 text-[#cc785c] rounded">3.7 Beta</span>
            </a>
            <a href="#capabilities" className="hover:text-[#141413] transition-colors">Capabilities</a>
            <a href="#api" className="hover:text-[#141413] transition-colors">API & Code</a>
            <a href="#models" className="hover:text-[#141413] transition-colors">Models</a>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="text-[14px] font-medium text-[#141413] hover:text-[#cc785c] transition-colors px-2 py-1"
          >
            Sign in
          </Link>
          <a
            href="#demo"
            className="h-10 px-5 bg-[#cc785c] text-white text-[14px] font-medium rounded-lg hover:bg-[#a9583e] active:bg-[#a9583e] transition-colors flex items-center justify-center shadow-sm"
          >
            Try Claude
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#141413] hover:text-[#cc785c]"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#faf9f5] border-b border-[#e6dfd8] px-6 py-6 space-y-4">
          <nav className="flex flex-col gap-4 text-base font-medium text-[#3d3d3a]">
            <a href="#overview" onClick={() => setMobileMenuOpen(false)}>Overview</a>
            <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="text-[#cc785c]">Computer Use (Beta)</a>
            <a href="#capabilities" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
            <a href="#api" onClick={() => setMobileMenuOpen(false)}>API & Code</a>
            <a href="#models" onClick={() => setMobileMenuOpen(false)}>Models</a>
          </nav>
          <div className="pt-4 border-t border-[#e6dfd8] flex flex-col gap-3">
            <Link to="/login" className="text-center py-2 text-[#141413] font-medium">Sign in</Link>
            <a href="#demo" className="w-full py-2.5 bg-[#cc785c] text-white text-center rounded-lg font-medium">
              Try Claude
            </a>
          </div>
        </div>
      )}

      {/* 2. HERO BAND (Editorial Slab-Serif Display, Cream Canvas, Literary Tone) */}
      <section id="overview" className="pt-16 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#efe9de] border border-[#e6dfd8] rounded-full text-xs font-medium text-[#252523]">
            <span className="w-2 h-2 rounded-full bg-[#cc785c]"></span>
            <span>Anthropic Computer Use API Specification</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[64px] font-normal leading-[1.05] tracking-[-1.5px] text-[#141413]">
            Direct software control through visual reasoning.
          </h1>

          <p className="font-sans text-lg sm:text-xl text-[#3d3d3a] leading-relaxed max-w-2xl mx-auto font-normal">
            Claude perceives screen viewports, coordinates synthetic mouse clicks, and keystrokes across applications — unlocking autonomous desktop workflows without API limitations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#demo"
              className="h-10 px-6 bg-[#cc785c] text-white text-[14px] font-medium rounded-lg hover:bg-[#a9583e] transition-colors flex items-center gap-2 shadow-sm"
            >
              <span>Explore Live Interactive Demo</span>
              <ArrowRight size={15} />
            </a>

            <a
              href="#api"
              className="h-10 px-6 bg-[#faf9f5] border border-[#e6dfd8] text-[#141413] text-[14px] font-medium rounded-lg hover:bg-[#efe9de] transition-colors flex items-center gap-2"
            >
              <span>API Reference</span>
              <ExternalLink size={14} className="text-[#6c6a64]" />
            </a>
          </div>
        </div>

        {/* Centerpiece: Flagship Interactive Computer Use Demonstration Card */}
        <div id="demo" className="mt-8">
          <ClaudeComputerUseCard />
        </div>
      </section>

      {/* 3. LIGHT CREAM FEATURE CARDS BAND (`surface-card` #efe9de) */}
      <section id="capabilities" className="py-24 bg-[#efe9de] border-y border-[#e6dfd8] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-[1.5px] text-[#cc785c] font-semibold block mb-2">
              System Architecture
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[48px] font-normal leading-[1.1] tracking-[-1px] text-[#141413]">
              Engineered for real-world software interfaces.
            </h2>
            <p className="mt-4 font-sans text-base text-[#3d3d3a] leading-relaxed">
              Unlike brittle DOM scrapers or rigid macro tools, Claude interprets the visual interface directly, adapting dynamically to UI updates, modals, and multi-step desktop workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="p-8 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-[#efe9de] flex items-center justify-center text-[#cc785c]">
                <Cpu size={22} />
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#141413] tracking-[-0.3px]">
                High-Resolution Perception
              </h3>
              <p className="font-sans text-sm text-[#3d3d3a] leading-relaxed">
                Claude captures screen frames up to 4K resolution, calculating sub-pixel coordinate bounding boxes with OCR accuracy across customized enterprise dashboards and legacy tools.
              </p>
              <div className="pt-2 text-xs font-mono text-[#cc785c] flex items-center gap-1">
                <span>0 selector dependencies</span>
                <ChevronRight size={13} />
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="p-8 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-[#efe9de] flex items-center justify-center text-[#5db8a6]">
                <Zap size={22} />
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#141413] tracking-[-0.3px]">
                Natural Synthetic Gestures
              </h3>
              <p className="font-sans text-sm text-[#3d3d3a] leading-relaxed">
                Executes cursor splines, contextual right-clicks, keystroke bursts, keyboard shortcuts, and multi-select drag operations mirroring human interaction fidelity.
              </p>
              <div className="pt-2 text-xs font-mono text-[#5db8a6] flex items-center gap-1">
                <span>Sub-350ms tool turnaround</span>
                <ChevronRight size={13} />
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="p-8 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-[#efe9de] flex items-center justify-center text-[#e8a55a]">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#141413] tracking-[-0.3px]">
                Human-in-the-Loop Safeguards
              </h3>
              <p className="font-sans text-sm text-[#3d3d3a] leading-relaxed">
                Configurable permission checkpoints prompt users before irreversible actions (such as credential submission or financial transactions), ensuring auditable security boundaries.
              </p>
              <div className="pt-2 text-xs font-mono text-[#e8a55a] flex items-center gap-1">
                <span>Sandboxed runtime isolation</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DARK PRODUCT CHROME BAND (`surface-dark` #181715 & `code-window-card`) */}
      <section id="api" className="py-24 bg-[#181715] text-[#faf9f5] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-[1.5px] text-[#cc785c] font-semibold block mb-2">
                Developer Integration
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[48px] font-normal leading-[1.1] tracking-[-1px] text-[#faf9f5]">
                A single tool call to steer any desktop.
              </h2>
              <p className="mt-4 font-sans text-base text-[#a09d96] max-w-xl">
                Equip Claude with the <code className="text-[#faf9f5] bg-[#252320] px-1.5 py-0.5 rounded font-mono text-xs">computer</code> tool definition in standard Messages API requests.
              </p>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-2 bg-[#252320] p-1 rounded-lg border border-[#2e2c28]">
              <button
                onClick={() => setSelectedLanguage('python')}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                  selectedLanguage === 'python'
                    ? 'bg-[#cc785c] text-white font-bold'
                    : 'text-[#a09d96] hover:text-white'
                }`}
              >
                Python SDK
              </button>
              <button
                onClick={() => setSelectedLanguage('typescript')}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                  selectedLanguage === 'typescript'
                    ? 'bg-[#cc785c] text-white font-bold'
                    : 'text-[#a09d96] hover:text-white'
                }`}
              >
                TypeScript / Node
              </button>
            </div>
          </div>

          {/* Code Window Card */}
          <div className="rounded-xl border border-[#2e2c28] bg-[#141413] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#252320] bg-[#181715]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c64545]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4a017]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#5db872]"></span>
                <span className="ml-3 font-mono text-xs text-[#a09d96]">
                  {selectedLanguage === 'python' ? 'computer_use_agent.py' : 'computer_use_agent.ts'}
                </span>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#252320] hover:bg-[#2e2c28] text-xs font-sans text-[#faf9f5] rounded border border-[#2e2c28] transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check size={13} className="text-[#5db872]" />
                    <span className="text-[#5db872]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} className="text-[#a09d96]" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-6 overflow-x-auto custom-claude-scrollbar bg-[#141413]">
              <pre className="font-mono text-sm leading-relaxed text-[#faf9f5]">
                <code>
                  {selectedLanguage === 'python' ? pythonSnippet : tsSnippet}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MODEL COMPARISON CARDS BAND */}
      <section id="models" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono uppercase tracking-[1.5px] text-[#cc785c] font-semibold">
            Anthropic Model Family
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[48px] font-normal leading-[1.1] tracking-[-1px] text-[#141413]">
            Match the right intelligence to your task.
          </h2>
          <p className="font-sans text-base text-[#3d3d3a]">
            Choose from the industry's most capable visual reasoning models for production automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Claude 3.7 Sonnet (Featured Tier Card in Dark Navy) */}
          <div className="p-8 rounded-xl bg-[#181715] text-[#faf9f5] border border-[#252320] flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#cc785c] text-white text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
              Primary Choice
            </div>

            <div className="space-y-4">
              <span className="text-xs font-mono text-[#cc785c]">Flagship Hybrid Reasoning</span>
              <h3 className="font-serif text-3xl font-normal text-[#faf9f5]">Claude 3.7 Sonnet</h3>
              <p className="font-sans text-sm text-[#a09d96] leading-relaxed">
                State-of-the-art visual reasoning with integrated extended thinking and high-velocity Computer Use tool calling.
              </p>

              <div className="pt-4 space-y-2.5 border-t border-[#252320] text-xs font-sans text-[#faf9f5]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#cc785c]" />
                  <span>Full Computer Use Beta Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#cc785c]" />
                  <span>200K Context Window</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#cc785c]" />
                  <span>Hybrid Instant & Extended Thinking</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <a
                href="#demo"
                className="w-full py-2.5 bg-[#cc785c] hover:bg-[#a9583e] text-white text-sm font-medium rounded-lg text-center block transition-colors shadow-sm"
              >
                Deploy Sonnet 3.7
              </a>
            </div>
          </div>

          {/* Claude 3 Opus */}
          <div className="p-8 rounded-xl bg-[#faf9f5] text-[#141413] border border-[#e6dfd8] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#6c6a64]">Deep Analysis & Synthesis</span>
              <h3 className="font-serif text-3xl font-normal text-[#141413]">Claude 3 Opus</h3>
              <p className="font-sans text-sm text-[#3d3d3a] leading-relaxed">
                Exceptional depth for long-form research, code generation, and multi-domain strategic planning.
              </p>

              <div className="pt-4 space-y-2.5 border-t border-[#e6dfd8] text-xs font-sans text-[#3d3d3a]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#5db872]" />
                  <span>200K Context Window</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#5db872]" />
                  <span>Maximum Nuance & Creative Output</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#5db872]" />
                  <span>Complex Multilingual Translation</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <a
                href="#api"
                className="w-full py-2.5 bg-[#faf9f5] border border-[#e6dfd8] hover:bg-[#efe9de] text-[#141413] text-sm font-medium rounded-lg text-center block transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Claude 3.5 Haiku */}
          <div className="p-8 rounded-xl bg-[#faf9f5] text-[#141413] border border-[#e6dfd8] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#6c6a64]">High-Velocity & Low Latency</span>
              <h3 className="font-serif text-3xl font-normal text-[#141413]">Claude 3.5 Haiku</h3>
              <p className="font-sans text-sm text-[#3d3d3a] leading-relaxed">
                Rapid response execution for lightweight triage, classification, and real-time streaming interfaces.
              </p>

              <div className="pt-4 space-y-2.5 border-t border-[#e6dfd8] text-xs font-sans text-[#3d3d3a]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#5db872]" />
                  <span>Sub-150ms First Token Latency</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#5db872]" />
                  <span>Cost-Optimized High Volume</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#5db872]" />
                  <span>Accurate OCR & Vision Parsing</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <a
                href="#api"
                className="w-full py-2.5 bg-[#faf9f5] border border-[#e6dfd8] hover:bg-[#efe9de] text-[#141413] text-sm font-medium rounded-lg text-center block transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FULL-BLEED CORAL CALLOUT CARD (`callout-card-coral` #cc785c) */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="p-12 sm:p-16 rounded-2xl bg-[#cc785c] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal leading-tight">
              Start building autonomous browser & desktop agents today.
            </h2>
            <p className="font-sans text-white/90 text-base leading-relaxed">
              Available via the Anthropic Console API with full Python and TypeScript SDK support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <a
              href="#demo"
              className="px-8 py-3.5 bg-[#faf9f5] text-[#141413] text-sm font-medium rounded-lg hover:bg-[#efe9de] transition-colors shadow-md text-center"
            >
              Launch Interactive Sandbox
            </a>
            <a
              href="#api"
              className="px-6 py-3.5 bg-[#a9583e] text-white text-sm font-medium rounded-lg hover:bg-[#8e4530] transition-colors border border-white/20 text-center"
            >
              Read Docs
            </a>
          </div>
        </div>
      </section>

      {/* 7. DARK NAVY FOOTER (`footer` #181715) */}
      <footer className="bg-[#181715] text-[#a09d96] border-t border-[#252320] py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 space-y-4">
              <AnthropicLogo size={24} color="#cc785c" showWordmark={true} wordmarkColor="#faf9f5" brandName="Anthropic" />
              <p className="text-xs text-[#a09d96] max-w-xs font-sans leading-relaxed">
                Anthropic is an AI safety and research company creating reliable, beneficial, and steerable AI systems.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#faf9f5] mb-4">Products</h4>
              <ul className="space-y-2.5 text-xs font-sans">
                <li><a href="#demo" className="hover:text-[#faf9f5]">Computer Use</a></li>
                <li><a href="#models" className="hover:text-[#faf9f5]">Claude 3.7 Sonnet</a></li>
                <li><a href="#models" className="hover:text-[#faf9f5]">Claude 3.5 Haiku</a></li>
                <li><a href="#api" className="hover:text-[#faf9f5]">Claude Code CLI</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#faf9f5] mb-4">Developers</h4>
              <ul className="space-y-2.5 text-xs font-sans">
                <li><a href="#api" className="hover:text-[#faf9f5]">API Documentation</a></li>
                <li><a href="#api" className="hover:text-[#faf9f5]">SDK Repositories</a></li>
                <li><a href="#demo" className="hover:text-[#faf9f5]">Interactive Workbench</a></li>
                <li><a href="#overview" className="hover:text-[#faf9f5]">System Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#faf9f5] mb-4">Research & Company</h4>
              <ul className="space-y-2.5 text-xs font-sans">
                <li><a href="#overview" className="hover:text-[#faf9f5]">Constitutional AI</a></li>
                <li><a href="#overview" className="hover:text-[#faf9f5]">Safety Evaluations</a></li>
                <li><a href="#overview" className="hover:text-[#faf9f5]">Careers</a></li>
                <li><a href="#overview" className="hover:text-[#faf9f5]">Press Kit</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#252320] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-[#6c6a64]">
            <div>© {new Date().getFullYear()} Anthropic PBC. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href="#overview" className="hover:text-[#a09d96]">Privacy Policy</a>
              <a href="#overview" className="hover:text-[#a09d96]">Terms of Service</a>
              <a href="#overview" className="hover:text-[#a09d96]">Responsible Disclosure</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
