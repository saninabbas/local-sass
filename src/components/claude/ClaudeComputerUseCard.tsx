import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Code2, 
  Terminal, 
  CheckCircle2, 
  Globe, 
  RefreshCw, 
  Sparkles,
  MousePointer,
  Cpu,
  Plane,
  FileSpreadsheet,
  Bug
} from 'lucide-react';
import { AnthropicLogo } from './AnthropicLogo';

export interface StepAction {
  id: number;
  label: string;
  thought: string;
  tool: string;
  params: Record<string, any>;
  cursorPos: { x: number; y: number };
  cursorType: 'default' | 'pointer' | 'text' | 'crosshair';
  isClicking?: boolean;
  highlightBox?: { x: number; y: number; w: number; h: number; label: string };
  browserState: {
    url: string;
    stage: string;
    activeTab: string;
    viewData?: any;
  };
  durationMs: number;
}

export interface Scenario {
  id: string;
  title: string;
  icon: typeof Plane;
  subtitle: string;
  prompt: string;
  model: string;
  steps: StepAction[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'flight-booking',
    title: 'Flight Comparison & Direct Booking',
    icon: Plane,
    subtitle: 'Autonomous browser navigation, form autofill, and tabular price optimization',
    prompt: 'Find the lowest nonstop flight from SFO to LHR for Nov 12 under $900 and extract confirmation details.',
    model: 'claude-3-7-sonnet-20250219',
    steps: [
      {
        id: 1,
        label: 'Perceive Viewport & Locate Origin Input',
        thought: 'Taking screen capture at 1280x720. I see the flight search form. Targeting the Origin airport input box at coordinates [280, 175].',
        tool: 'computer.mouse_move',
        params: { coordinate: [280, 175] },
        cursorPos: { x: 280, y: 175 },
        cursorType: 'text',
        isClicking: true,
        highlightBox: { x: 190, y: 155, w: 180, h: 42, label: 'input#origin-airport' },
        browserState: {
          url: 'https://skyway-matrix.corp.internal/flights',
          stage: 'initial',
          activeTab: 'Search Flights',
          viewData: { origin: '', destination: '', departure: '', status: 'Idle' }
        },
        durationMs: 1400
      },
      {
        id: 2,
        label: 'Type Origin & Navigate to Destination',
        thought: 'Origin field focused. Typing "San Francisco (SFO)" into the active input element.',
        tool: 'computer.type',
        params: { text: 'San Francisco (SFO)' },
        cursorPos: { x: 340, y: 175 },
        cursorType: 'text',
        isClicking: false,
        highlightBox: { x: 190, y: 155, w: 180, h: 42, label: 'input#origin-airport [value="SFO"]' },
        browserState: {
          url: 'https://skyway-matrix.corp.internal/flights',
          stage: 'origin-filled',
          activeTab: 'Search Flights',
          viewData: { origin: 'San Francisco (SFO)', destination: '', departure: '', status: 'Typing' }
        },
        durationMs: 1200
      },
      {
        id: 3,
        label: 'Target & Fill Destination Airport',
        thought: 'Moving cursor to Destination input at coordinates [485, 175]. Entering "London Heathrow (LHR)".',
        tool: 'computer.mouse_move_and_type',
        params: { coordinate: [485, 175], text: 'London Heathrow (LHR)' },
        cursorPos: { x: 485, y: 175 },
        cursorType: 'pointer',
        isClicking: true,
        highlightBox: { x: 395, y: 155, w: 180, h: 42, label: 'input#destination-airport' },
        browserState: {
          url: 'https://skyway-matrix.corp.internal/flights',
          stage: 'destination-filled',
          activeTab: 'Search Flights',
          viewData: { origin: 'San Francisco (SFO)', destination: 'London Heathrow (LHR)', departure: 'Nov 12, 2026', status: 'Form Complete' }
        },
        durationMs: 1300
      },
      {
        id: 4,
        label: 'Execute Search Query',
        thought: 'Form filled. Clicking the primary coral action button "Search Flights" at coordinates [680, 175].',
        tool: 'computer.left_click',
        params: { coordinate: [680, 175] },
        cursorPos: { x: 680, y: 175 },
        cursorType: 'pointer',
        isClicking: true,
        highlightBox: { x: 600, y: 155, w: 160, h: 42, label: 'button.btn-primary#search-btn' },
        browserState: {
          url: 'https://skyway-matrix.corp.internal/flights/results?from=SFO&to=LHR&date=2026-11-12',
          stage: 'loading',
          activeTab: 'Flight Results (4)',
          viewData: { origin: 'San Francisco (SFO)', destination: 'London Heathrow (LHR)', departure: 'Nov 12, 2026', status: 'Searching API...' }
        },
        durationMs: 1600
      },
      {
        id: 5,
        label: 'Analyze Pricing Matrix & Filter Nonstop',
        thought: 'Screen update received. 4 flight candidates rendered. British Airways BA286 is Nonstop at $840 (within $900 budget). Virgin Atlantic is $1,150. Selecting row 1.',
        tool: 'computer.mouse_move',
        params: { coordinate: [690, 310] },
        cursorPos: { x: 690, y: 310 },
        cursorType: 'pointer',
        isClicking: true,
        highlightBox: { x: 190, y: 280, w: 580, h: 62, label: 'div.flight-card.best-deal [Price: $840]' },
        browserState: {
          url: 'https://skyway-matrix.corp.internal/flights/results?from=SFO&to=LHR&date=2026-11-12',
          stage: 'results-loaded',
          activeTab: 'Flight Results (4)',
          viewData: { 
            selectedFlight: { flight: 'BA 286', carrier: 'British Airways', time: '18:45 -> 13:05 (+1)', type: 'Nonstop • 10h 20m', price: '$840' }
          }
        },
        durationMs: 1700
      },
      {
        id: 6,
        label: 'Confirm Selection & Extract Itinerary',
        thought: 'Selection confirmed. Generating verified structured JSON itinerary and copying booking reference code.',
        tool: 'computer.screenshot',
        params: { extract_text: true, bounding_box: [190, 280, 580, 62] },
        cursorPos: { x: 500, y: 380 },
        cursorType: 'default',
        isClicking: false,
        highlightBox: { x: 190, y: 280, w: 580, h: 180, label: 'Itinerary Verification [Pass 100%]' },
        browserState: {
          url: 'https://skyway-matrix.corp.internal/flights/checkout/review',
          stage: 'complete',
          activeTab: 'Confirmed #SK-9942',
          viewData: {
            confirmed: true,
            ref: 'CLAUDE-BA286-904',
            total: '$840.00 USD'
          }
        },
        durationMs: 1500
      }
    ]
  },
  {
    id: 'data-pipeline',
    title: 'Financial Spreadsheet Audit & Synthesis',
    icon: FileSpreadsheet,
    subtitle: 'Cross-tab data parsing, CSV formula calculation, and tabular discrepancy detection',
    prompt: 'Open Q3 Ledger, filter revenue rows > $50k, compute net variance in cell E14, and export summary.',
    model: 'claude-3-7-sonnet-20250219',
    steps: [
      {
        id: 1,
        label: 'Inspect Tabular DOM & Activate Quick Filter',
        thought: 'Analyzing ledger viewport. Column D represents Gross Revenue. Targeting Filter dropdown at [450, 160].',
        tool: 'computer.mouse_move',
        params: { coordinate: [450, 160] },
        cursorPos: { x: 450, y: 160 },
        cursorType: 'pointer',
        isClicking: true,
        highlightBox: { x: 410, y: 145, w: 90, h: 32, label: 'th.col-revenue [Filter]' },
        browserState: {
          url: 'https://sheets.corp.internal/v/q3-audit-master',
          stage: 'initial',
          activeTab: 'Q3 Enterprise Ledger',
          viewData: { filterActive: false, rowsCount: 14 }
        },
        durationMs: 1400
      },
      {
        id: 2,
        label: 'Apply Filter Condition > $50,000',
        thought: 'Filter modal open. Typing threshold value 50000 into numeric comparator.',
        tool: 'computer.type',
        params: { text: '> 50000' },
        cursorPos: { x: 450, y: 220 },
        cursorType: 'text',
        isClicking: false,
        highlightBox: { x: 380, y: 200, w: 140, h: 36, label: 'input.filter-expression' },
        browserState: {
          url: 'https://sheets.corp.internal/v/q3-audit-master',
          stage: 'filtered',
          activeTab: 'Q3 Enterprise Ledger',
          viewData: { filterActive: true, rowsCount: 5, totalRevenue: '$384,500' }
        },
        durationMs: 1300
      },
      {
        id: 3,
        label: 'Input Formula =SUM(D2:D6) and Verify',
        thought: 'Filtered rows displayed. Navigating to cell E14 to compute variance. Injecting spreadsheet formula.',
        tool: 'computer.mouse_move_and_type',
        params: { coordinate: [550, 360], text: '=SUM(D2:D6)*0.24' },
        cursorPos: { x: 550, y: 360 },
        cursorType: 'text',
        isClicking: true,
        highlightBox: { x: 500, y: 345, w: 110, h: 30, label: 'td.cell#E14 [Calculated]' },
        browserState: {
          url: 'https://sheets.corp.internal/v/q3-audit-master',
          stage: 'formula-applied',
          activeTab: 'Q3 Enterprise Ledger',
          viewData: { filterActive: true, rowsCount: 5, variance: '$92,280.00' }
        },
        durationMs: 1500
      },
      {
        id: 4,
        label: 'Trigger One-Click Audit Export',
        thought: 'Verification complete. Clicking Export CSV in the top toolbar to conclude workflow.',
        tool: 'computer.left_click',
        params: { coordinate: [710, 105] },
        cursorPos: { x: 710, y: 105 },
        cursorType: 'pointer',
        isClicking: true,
        highlightBox: { x: 660, y: 90, w: 100, h: 32, label: 'button#btn-export-csv' },
        browserState: {
          url: 'https://sheets.corp.internal/v/q3-audit-master',
          stage: 'complete',
          activeTab: 'Export Ready: q3_summary.csv',
          viewData: { exported: true, fileName: 'q3_ledger_variance_summary.csv' }
        },
        durationMs: 1400
      }
    ]
  },
  {
    id: 'visual-qa',
    title: 'Visual QA & Staging DOM Debugger',
    icon: Bug,
    subtitle: 'Automated UI regression detection, DevTools inspection, and CSS patch injection',
    prompt: 'Inspect misaligned checkout modal on staging, fix overlapping z-index in DevTools, and verify clickability.',
    model: 'claude-3-7-sonnet-20250219',
    steps: [
      {
        id: 1,
        label: 'Detect Obstructed Click Target in Viewport',
        thought: 'Perceiving checkout page. The "Complete Purchase" button at [520, 310] is covered by a transparent modal backdrop overlay (z-index collision).',
        tool: 'computer.mouse_move',
        params: { coordinate: [520, 310] },
        cursorPos: { x: 520, y: 310 },
        cursorType: 'crosshair',
        isClicking: false,
        highlightBox: { x: 420, y: 290, w: 200, h: 44, label: 'button#checkout-cta [UNCLICKABLE: pointer-events: none]' },
        browserState: {
          url: 'https://staging.app.internal/checkout',
          stage: 'initial-bug',
          activeTab: 'Checkout Staging',
          viewData: { bugDetected: true, status: 'Overlay Blocking Interaction' }
        },
        durationMs: 1400
      },
      {
        id: 2,
        label: 'Open DevTools Element Inspector',
        thought: 'Opening DOM Inspector at coordinates [520, 310] to inspect computed styles.',
        tool: 'computer.right_click',
        params: { coordinate: [520, 310], action: 'Inspect Element' },
        cursorPos: { x: 520, y: 310 },
        cursorType: 'pointer',
        isClicking: true,
        highlightBox: { x: 420, y: 290, w: 200, h: 44, label: 'context-menu > Inspect' },
        browserState: {
          url: 'https://staging.app.internal/checkout',
          stage: 'devtools-open',
          activeTab: 'Elements — DevTools',
          viewData: { bugDetected: true, status: 'Inspecting <div.backdrop>' }
        },
        durationMs: 1300
      },
      {
        id: 3,
        label: 'Patch CSS Property: z-index: 50',
        thought: 'Found conflicting style rule `.backdrop { z-index: 100 }`. Adjusting CTA container to `z-index: 200; pointer-events: auto;`.',
        tool: 'computer.type',
        params: { text: 'z-index: 200; pointer-events: auto;' },
        cursorPos: { x: 620, y: 240 },
        cursorType: 'text',
        isClicking: false,
        highlightBox: { x: 540, y: 220, w: 210, h: 36, label: 'css-rule: z-index: 200' },
        browserState: {
          url: 'https://staging.app.internal/checkout',
          stage: 'patched',
          activeTab: 'Checkout Staging [Patched]',
          viewData: { bugDetected: false, status: 'Regression Fixed in DOM' }
        },
        durationMs: 1500
      },
      {
        id: 4,
        label: 'Execute & Validate Primary CTA Click',
        thought: 'Overlay cleared. Triggering test click on "Complete Purchase" button. Success status code 200 received.',
        tool: 'computer.left_click',
        params: { coordinate: [520, 310] },
        cursorPos: { x: 520, y: 310 },
        cursorType: 'pointer',
        isClicking: true,
        highlightBox: { x: 420, y: 290, w: 200, h: 44, label: 'button#checkout-cta [ACTIVE 200 OK]' },
        browserState: {
          url: 'https://staging.app.internal/checkout/success',
          stage: 'complete',
          activeTab: 'Order Success #98214',
          viewData: { bugDetected: false, status: 'Order Processed Successfully' }
        },
        durationMs: 1500
      }
    ]
  }
];

export const ClaudeComputerUseCard: React.FC = () => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showCoordinateHUD, setShowCoordinateHUD] = useState(true);

  const scenario = SCENARIOS[selectedScenarioIndex];
  const step = scenario.steps[currentStepIndex] || scenario.steps[0];
  const totalSteps = scenario.steps.length;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle step progression
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const duration = (step.durationMs || 1500) / playbackSpeed;

    timerRef.current = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        if (prev < totalSteps - 1) {
          return prev + 1;
        } else {
          // Pause briefly at end or loop
          return 0;
        }
      });
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, selectedScenarioIndex, playbackSpeed, totalSteps, step.durationMs]);

  const handleScenarioChange = (index: number) => {
    setSelectedScenarioIndex(index);
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-[#e6dfd8] bg-[#181715] text-[#faf9f5] shadow-2xl transition-all duration-300">
      {/* 1. Header Toolbar with Anthropic Branding & Scenario Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-[#252320] bg-[#181715]">
        <div className="flex items-center gap-3">
          <AnthropicLogo size={22} color="#cc785c" showWordmark={true} wordmarkColor="#faf9f5" brandName="Claude Computer Use" />
          <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] font-mono tracking-wider font-semibold uppercase bg-[#cc785c]/15 text-[#cc785c] rounded-full border border-[#cc785c]/30">
            Vision 3.7 Engine
          </span>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#1f1e1b] rounded-lg border border-[#252320]">
          {SCENARIOS.map((sc, idx) => {
            const Icon = sc.icon;
            const isActive = selectedScenarioIndex === idx;
            return (
              <button
                key={sc.id}
                onClick={() => handleScenarioChange(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-sans font-medium rounded-md transition-all ${
                  isActive
                    ? 'bg-[#cc785c] text-white shadow-sm font-semibold'
                    : 'text-[#a09d96] hover:text-[#faf9f5] hover:bg-[#252320]'
                }`}
              >
                <Icon size={14} />
                <span className="hidden md:inline">{sc.title.split(' ')[0]} Demo</span>
                <span className="md:hidden">Demo {idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode & HUD controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            title="Toggle Vision Bounding Boxes"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all ${
              showBoundingBoxes
                ? 'bg-[#252320] border-[#cc785c]/50 text-[#cc785c]'
                : 'bg-transparent border-[#252320] text-[#a09d96] hover:text-[#faf9f5]'
            }`}
          >
            <Eye size={13} />
            <span className="hidden sm:inline text-[11px]">Vision Grid</span>
          </button>

          <button
            onClick={() => setShowCoordinateHUD(!showCoordinateHUD)}
            title="Toggle Coordinate Telemetry"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all ${
              showCoordinateHUD
                ? 'bg-[#252320] border-[#5db8a6]/50 text-[#5db8a6]'
                : 'bg-transparent border-[#252320] text-[#a09d96] hover:text-[#faf9f5]'
            }`}
          >
            <Cpu size={13} />
            <span className="hidden sm:inline text-[11px]">Telemetry</span>
          </button>
        </div>
      </div>

      {/* 2. Prompt & Instruction Header Ribbon */}
      <div className="px-6 py-3 bg-[#1f1e1b] border-b border-[#252320] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-sans">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2 h-2 rounded-full bg-[#cc785c] animate-pulse shrink-0"></div>
          <span className="text-[#a09d96] font-medium shrink-0">Active Prompt:</span>
          <span className="text-[#faf9f5] font-mono truncate text-[13px] bg-[#181715] px-2.5 py-1 rounded border border-[#252320]">
            "{scenario.prompt}"
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-[12px] text-[#a09d96]">
          <span className="flex items-center gap-1">
            <span className="text-[#5db8a6]">●</span> Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <span className="font-mono text-[#a09d96]">
            Latency: <strong className="text-[#faf9f5]">310ms</strong>
          </span>
        </div>
      </div>

      {/* 3. Main Split Stage: Simulated Browser (Right/Top) & Claude Reasoning Stream (Left/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Left Column: Live Monospace Reasoning & Tool Call Terminal (4 cols) */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#252320] bg-[#181715] flex flex-col justify-between">
          <div className="p-5 flex flex-col gap-4">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-[#252320] pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#a09d96]">
                <Terminal size={14} className="text-[#cc785c]" />
                <span>Agentic Execution Log</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#252320] text-[#5db8a6] border border-[#5db8a6]/20">
                Tool: {step.tool}
              </span>
            </div>

            {/* Thought Bubble */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-[#a09d96] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#cc785c]" />
                Claude Reasoning & Vision Interpretation
              </div>
              <div className="p-3.5 rounded-lg bg-[#1f1e1b] border border-[#252320] text-sm text-[#faf9f5] font-sans leading-relaxed">
                {step.thought}
              </div>
            </div>

            {/* Tool Invocation Payload */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-[#a09d96] uppercase tracking-wider flex items-center gap-1.5">
                <Code2 size={12} className="text-[#5db8a6]" />
                API Action Payload
              </div>
              <div className="p-3 rounded-lg bg-[#141413] border border-[#252320] font-mono text-xs text-[#faf9f5] overflow-x-auto custom-claude-scrollbar">
                <pre className="text-[#5db8a6]">
                  {`{\n  "action": "${step.tool}",\n  "parameters": ${JSON.stringify(step.params, null, 2).replace(/\n/g, '\n  ')}\n}`}
                </pre>
              </div>
            </div>

            {/* Timeline Steps Tracker */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-mono text-[#a09d96] uppercase tracking-wider">
                Execution Workflow
              </div>
              <div className="space-y-1.5">
                {scenario.steps.map((st, i) => {
                  const isCurrent = i === currentStepIndex;
                  const isDone = i < currentStepIndex;
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStepIndex(i);
                      }}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-sans transition-all ${
                        isCurrent
                          ? 'bg-[#252320] border border-[#cc785c]/40 text-[#faf9f5] font-medium'
                          : isDone
                          ? 'text-[#a09d96] hover:bg-[#1f1e1b]'
                          : 'text-[#6c6a64] hover:bg-[#1f1e1b]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                          isCurrent
                            ? 'bg-[#cc785c] text-white font-bold'
                            : isDone
                            ? 'bg-[#5db872]/20 text-[#5db872]'
                            : 'bg-[#252320] text-[#6c6a64]'
                        }`}
                      >
                        {isDone ? '✓' : i + 1}
                      </div>
                      <span className="truncate">{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Telemetry Stats Bar at Bottom of Log */}
          <div className="p-4 bg-[#141413] border-t border-[#252320] grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-1.5 bg-[#1f1e1b] rounded border border-[#252320]">
              <div className="text-[10px] text-[#8e8b82]">CONFIDENCE</div>
              <div className="text-[#5db872] font-semibold">99.8%</div>
            </div>
            <div className="p-1.5 bg-[#1f1e1b] rounded border border-[#252320]">
              <div className="text-[10px] text-[#8e8b82]">TOKENS</div>
              <div className="text-[#faf9f5] font-semibold">1,420</div>
            </div>
            <div className="p-1.5 bg-[#1f1e1b] rounded border border-[#252320]">
              <div className="text-[10px] text-[#8e8b82]">SCREEN</div>
              <div className="text-[#e8a55a] font-semibold">1024×768</div>
            </div>
          </div>
        </div>

        {/* Right Column: High-Fidelity Simulated Web Browser & Synthetic Cursor (7 cols) */}
        <div className="lg:col-span-7 bg-[#1f1e1b] flex flex-col justify-between relative overflow-hidden">
          {/* Browser Window Chrome */}
          <div className="bg-[#181715] border-b border-[#252320] px-4 py-2.5 flex items-center justify-between gap-3">
            {/* Window Traffic Lights */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-3 h-3 rounded-full bg-[#c64545]/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-[#d4a017]/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-[#5db872]/80 inline-block"></span>
            </div>

            {/* Address Bar */}
            <div className="flex-1 flex items-center gap-2 px-3 py-1 bg-[#141413] rounded-md border border-[#252320] text-xs font-mono text-[#a09d96]">
              <Globe size={12} className="text-[#5db8a6] shrink-0" />
              <span className="truncate text-[#faf9f5]">{step.browserState.url}</span>
              <RefreshCw size={11} className={`ml-auto text-[#6c6a64] shrink-0 ${isPlaying ? 'animate-spin' : ''}`} />
            </div>

            {/* Tab Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#252320] rounded text-[11px] font-sans text-[#faf9f5] border border-[#252320]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5db872]"></span>
              <span className="truncate max-w-[120px]">{step.browserState.activeTab}</span>
            </div>
          </div>

          {/* Browser Viewport Canvas (Interactive Web App Mockup) */}
          <div className="relative flex-1 p-6 bg-[#faf9f5] text-[#141413] overflow-hidden min-h-[380px] select-none">
            {/* Scanline radar effect when vision perceives */}
            {showBoundingBoxes && (
              <div className="absolute inset-0 pointer-events-none z-10 opacity-30 bg-[linear-gradient(rgba(204,120,92,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(204,120,92,0.05)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            )}

            {/* Scenario 1 Content: Flight Booking Portal */}
            {selectedScenarioIndex === 0 && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#e6dfd8]">
                  <div className="flex items-center gap-2">
                    <Plane className="text-[#cc785c]" size={20} />
                    <span className="font-serif text-lg font-medium text-[#141413]">Skyway Flight Matrix</span>
                  </div>
                  <span className="text-xs font-sans text-[#6c6a64]">Direct Partner Portal</span>
                </div>

                {/* Form Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg bg-[#efe9de] border border-[#e6dfd8]">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6c6a64] mb-1 uppercase tracking-wider">Origin</label>
                    <div className="px-3 py-2 bg-white rounded-md border border-[#e6dfd8] text-xs font-sans text-[#141413] shadow-sm">
                      {step.browserState.viewData?.origin || 'Select departure'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6c6a64] mb-1 uppercase tracking-wider">Destination</label>
                    <div className="px-3 py-2 bg-white rounded-md border border-[#e6dfd8] text-xs font-sans text-[#141413] shadow-sm">
                      {step.browserState.viewData?.destination || 'Select arrival'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6c6a64] mb-1 uppercase tracking-wider">Action</label>
                    <button
                      onClick={handleStepNext}
                      className="w-full px-4 py-2 bg-[#cc785c] text-white text-xs font-medium rounded-md hover:bg-[#a9583e] transition-colors shadow-sm text-center"
                    >
                      Search Flights
                    </button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-sans text-[#6c6a64] px-1">
                    <span>Flight Candidates (Nov 12, 2026)</span>
                    <span>Sorted by Value</span>
                  </div>

                  {/* Flight Option 1 (Best Value) */}
                  <div className={`p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                    step.id >= 5 ? 'bg-[#efe9de] border-[#cc785c] shadow-md ring-1 ring-[#cc785c]' : 'bg-white border-[#e6dfd8]'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#181715] text-white flex items-center justify-center text-xs font-bold font-serif">
                        BA
                      </div>
                      <div>
                        <div className="font-serif font-semibold text-sm text-[#141413]">British Airways BA 286</div>
                        <div className="text-xs text-[#6c6a64] font-sans">18:45 SFO → 13:05 (+1) LHR • Nonstop • 10h 20m</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif font-bold text-base text-[#cc785c]">$840 USD</div>
                      <span className="inline-block px-2 py-0.5 bg-[#5db872]/20 text-[#2b753e] text-[10px] font-semibold rounded">
                        Best Nonstop
                      </span>
                    </div>
                  </div>

                  {/* Flight Option 2 */}
                  <div className="p-3.5 rounded-lg bg-white border border-[#e6dfd8] flex items-center justify-between gap-3 opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#cc785c] text-white flex items-center justify-center text-xs font-bold font-serif">
                        VS
                      </div>
                      <div>
                        <div className="font-serif font-semibold text-sm text-[#141413]">Virgin Atlantic VS 20</div>
                        <div className="text-xs text-[#6c6a64] font-sans">20:15 SFO → 14:40 (+1) LHR • Nonstop • 10h 25m</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif font-bold text-base text-[#141413]">$1,150 USD</div>
                      <span className="text-[10px] text-[#6c6a64]">Economy Deluxe</span>
                    </div>
                  </div>
                </div>

                {/* Confirmation Footer if Complete */}
                {step.browserState.viewData?.confirmed && (
                  <div className="p-3 rounded-lg bg-[#5db872]/15 border border-[#5db872]/40 text-[#141413] text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#5db872]" />
                      <span><strong>Itinerary Verified:</strong> Reference {step.browserState.viewData?.ref}</span>
                    </div>
                    <span className="font-mono font-bold text-[#2b753e]">{step.browserState.viewData?.total}</span>
                  </div>
                )}
              </div>
            )}

            {/* Scenario 2 Content: Spreadsheets & Accounting */}
            {selectedScenarioIndex === 1 && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#e6dfd8]">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="text-[#5db8a6]" size={20} />
                    <span className="font-serif text-lg font-medium text-[#141413]">Q3 Ledger Analysis</span>
                  </div>
                  <button className="px-3 py-1 bg-[#181715] text-white text-xs rounded font-mono hover:bg-[#252320]">
                    Export CSV
                  </button>
                </div>

                {/* Table Mockup */}
                <div className="rounded-lg border border-[#e6dfd8] overflow-hidden bg-white">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-[#efe9de] text-[#141413] font-medium border-b border-[#e6dfd8]">
                      <tr>
                        <th className="p-2.5">Account Name</th>
                        <th className="p-2.5">Region</th>
                        <th className="p-2.5">Tier</th>
                        <th className="p-2.5 text-right">Gross Rev ($)</th>
                        <th className="p-2.5 text-right">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e6dfd8] font-mono text-[11px]">
                      <tr className="bg-white">
                        <td className="p-2.5 font-sans font-medium text-[#141413]">Acme Global Corp</td>
                        <td className="p-2.5 text-[#6c6a64]">NA-West</td>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 bg-[#cc785c]/20 text-[#a9583e] rounded font-semibold">Enterprise</span></td>
                        <td className="p-2.5 text-right font-semibold">$145,000</td>
                        <td className="p-2.5 text-right text-[#5db872]">+18.4%</td>
                      </tr>
                      <tr className="bg-[#faf9f5]">
                        <td className="p-2.5 font-sans font-medium text-[#141413]">Helios Robotics</td>
                        <td className="p-2.5 text-[#6c6a64]">EMEA</td>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 bg-[#cc785c]/20 text-[#a9583e] rounded font-semibold">Enterprise</span></td>
                        <td className="p-2.5 text-right font-semibold">$98,500</td>
                        <td className="p-2.5 text-right text-[#5db872]">+12.1%</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="p-2.5 font-sans font-medium text-[#141413]">Vertex Dynamics</td>
                        <td className="p-2.5 text-[#6c6a64]">APAC</td>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 bg-[#cc785c]/20 text-[#a9583e] rounded font-semibold">Enterprise</span></td>
                        <td className="p-2.5 text-right font-semibold">$82,000</td>
                        <td className="p-2.5 text-right text-[#d4a017]">+4.5%</td>
                      </tr>
                      {/* Summary Row */}
                      <tr className="bg-[#efe9de] font-semibold text-[#141413]">
                        <td className="p-2.5 font-sans" colSpan={3}>E14 Computed Net Target Variance</td>
                        <td className="p-2.5 text-right text-[#cc785c] font-bold">$384,500</td>
                        <td className="p-2.5 text-right text-[#2b753e] font-bold">
                          {step.browserState.viewData?.variance || 'Calculating...'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Scenario 3 Content: QA & Debugger */}
            {selectedScenarioIndex === 2 && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#e6dfd8]">
                  <div className="flex items-center gap-2">
                    <Bug className="text-[#c64545]" size={20} />
                    <span className="font-serif text-lg font-medium text-[#141413]">Checkout Staging (DOM Inspect)</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 bg-[#c64545]/15 text-[#c64545] rounded font-semibold">
                    Regression Detector
                  </span>
                </div>

                <div className="p-6 rounded-lg bg-[#efe9de] border border-[#e6dfd8] text-center space-y-4 relative">
                  <h3 className="font-serif text-base font-medium text-[#141413]">Ready to complete enterprise subscription</h3>
                  <p className="text-xs font-sans text-[#6c6a64] max-w-sm mx-auto">
                    Annual Billing • 50 Seats Team Plan • Instant API Access
                  </p>

                  <div className="pt-2">
                    <button
                      className={`px-6 py-2.5 rounded-md text-sm font-sans font-semibold transition-all shadow-md ${
                        step.id >= 3
                          ? 'bg-[#cc785c] text-white hover:bg-[#a9583e] ring-2 ring-[#cc785c]/50'
                          : 'bg-[#cc785c]/40 text-white/80 cursor-not-allowed'
                      }`}
                    >
                      Complete Purchase ($4,800/yr)
                    </button>
                  </div>

                  {step.id < 3 && (
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center pointer-events-none">
                      <span className="bg-[#181715] text-[#e8a55a] text-xs font-mono px-3 py-1 rounded shadow-lg border border-[#e8a55a]/40">
                        ⚠ [DOM Collision: div.modal-backdrop obscuring button#checkout-cta]
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Real-time Vision Bounding Box Overlay */}
            {showBoundingBoxes && step.highlightBox && (
              <div
                className="absolute pointer-events-none border-2 border-[#cc785c] bg-[#cc785c]/10 rounded transition-all duration-300 z-20"
                style={{
                  left: `${step.highlightBox.x}px`,
                  top: `${step.highlightBox.y}px`,
                  width: `${step.highlightBox.w}px`,
                  height: `${step.highlightBox.h}px`,
                }}
              >
                <div className="absolute -top-6 left-0 px-2 py-0.5 bg-[#cc785c] text-white text-[10px] font-mono font-semibold rounded-t shadow-md whitespace-nowrap">
                  {step.highlightBox.label}
                </div>
              </div>
            )}

            {/* Simulated Animated Claude Cursor with Radar Sweep and Coordinate Tracker */}
            <div
              className="absolute pointer-events-none transition-all duration-500 ease-out z-30 flex items-start gap-1"
              style={{
                left: `${step.cursorPos.x}px`,
                top: `${step.cursorPos.y}px`,
              }}
            >
              {/* Synthetic Mouse Pointer */}
              <div className="relative">
                <MousePointer
                  size={20}
                  className={`text-[#141413] fill-[#cc785c] drop-shadow-md transition-transform duration-200 ${
                    step.isClicking ? 'scale-90 rotate-[-10deg]' : 'scale-100'
                  }`}
                />

                {/* Click Ripple wave */}
                {step.isClicking && (
                  <span className="absolute -top-2 -left-2 w-8 h-8 rounded-full border-2 border-[#cc785c] animate-click-ripple"></span>
                )}

                {/* Continuous Pulse Glow */}
                <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-[#cc785c]/30 animate-claude-pulse"></span>
              </div>

              {/* Floating Coordinate HUD */}
              {showCoordinateHUD && (
                <div className="bg-[#181715]/90 text-[#faf9f5] border border-[#cc785c]/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono shadow-lg flex items-center gap-1.5 animate-fadeIn">
                  <span className="text-[#cc785c] font-bold">X:{step.cursorPos.x}</span>
                  <span className="text-[#5db8a6] font-bold">Y:{step.cursorPos.y}</span>
                  {step.isClicking && (
                    <span className="px-1 bg-[#cc785c] text-white text-[9px] font-bold rounded">CLICK</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Playback & Scrubber Controls Bar */}
          <div className="bg-[#181715] border-t border-[#252320] p-4 flex flex-wrap items-center justify-between gap-4">
            {/* Play/Pause & Step Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-md bg-[#cc785c] text-white flex items-center justify-center hover:bg-[#a9583e] transition-colors shadow-sm"
                title={isPlaying ? 'Pause Demo' : 'Play Demo'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>

              <button
                onClick={handleRestart}
                className="w-8 h-8 rounded-md bg-[#252320] text-[#a09d96] hover:text-[#faf9f5] flex items-center justify-center hover:bg-[#2e2c28] transition-colors"
                title="Restart Workflow"
              >
                <RotateCcw size={13} />
              </button>

              <div className="h-4 w-px bg-[#252320] mx-1"></div>

              <button
                onClick={handleStepPrev}
                disabled={currentStepIndex === 0}
                className="px-2.5 py-1 text-xs rounded bg-[#1f1e1b] text-[#a09d96] hover:text-[#faf9f5] disabled:opacity-40 disabled:hover:text-[#a09d96] border border-[#252320]"
              >
                Prev
              </button>

              <button
                onClick={handleStepNext}
                disabled={currentStepIndex === totalSteps - 1}
                className="px-2.5 py-1 text-xs rounded bg-[#1f1e1b] text-[#a09d96] hover:text-[#faf9f5] disabled:opacity-40 disabled:hover:text-[#a09d96] border border-[#252320]"
              >
                Next
              </button>
            </div>

            {/* Progress Scrubber Bar */}
            <div className="flex-1 min-w-[140px] max-w-xs flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#252320] rounded-full overflow-hidden relative cursor-pointer">
                <div
                  className="h-full bg-[#cc785c] transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                ></div>
              </div>
              <span className="text-[11px] font-mono text-[#a09d96]">
                {currentStepIndex + 1}/{totalSteps}
              </span>
            </div>

            {/* Speed Multiplier Options */}
            <div className="flex items-center gap-1 bg-[#1f1e1b] p-1 rounded-md border border-[#252320] text-xs font-mono">
              {([0.5, 1, 2] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded transition-all ${
                    playbackSpeed === spd
                      ? 'bg-[#cc785c] text-white font-bold'
                      : 'text-[#a09d96] hover:text-[#faf9f5]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
