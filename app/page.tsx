"use client";

import { useState, useEffect, useRef } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 1,
    text: "How long does your fruit typically stay in transit before arrival?",
    answers: [
      { label: "Under 7 days", points: 0 },
      { label: "7–14 days", points: 5 },
      { label: "15–21 days", points: 10 },
      { label: "Over 21 days", points: 15 },
    ],
  },
  {
    id: 2,
    text: "Is pre-cooling done at origin before loading?",
    answers: [
      { label: "Always, verified with pulp temp records", points: 0 },
      { label: "Usually, but not always documented", points: 5 },
      { label: "Sometimes", points: 10 },
      { label: "Rarely or never", points: 15 },
    ],
  },
  {
    id: 3,
    text: "What is your standard reefer temperature setting for citrus/grapes/stonefruit?",
    answers: [
      { label: "Variety-specific temps, verified per load", points: 0 },
      { label: "Standard temp used for all products", points: 5 },
      { label: "Set by carrier, we don't control it", points: 10 },
      { label: "We don't monitor this", points: 15 },
    ],
  },
  {
    id: 4,
    text: "How often do you receive pulp temperature readings at arrival?",
    answers: [
      { label: "Every load, documented", points: 0 },
      { label: "Most loads", points: 5 },
      { label: "Occasionally", points: 10 },
      { label: "Never", points: 15 },
    ],
  },
  {
    id: 5,
    text: "Do you have a written cold chain protocol your suppliers must follow?",
    answers: [
      { label: "Yes, signed and enforced", points: 0 },
      { label: "Yes, but not always enforced", points: 5 },
      { label: "Informal/verbal only", points: 10 },
      { label: "No protocol exists", points: 15 },
    ],
  },
  {
    id: 6,
    text: "How are temperature excursions during transit handled?",
    answers: [
      { label: "Documented claim process with data logger records", points: 0 },
      { label: "Noted but rarely acted on", points: 5 },
      { label: "We find out at arrival, no mid-transit visibility", points: 10 },
      { label: "We have no visibility during transit", points: 15 },
    ],
  },
  {
    id: 7,
    text: "Do your suppliers use data loggers on every shipment?",
    answers: [
      { label: "Yes, data reviewed every load", points: 0 },
      { label: "Yes, but data rarely reviewed", points: 5 },
      { label: "Only on some shipments", points: 10 },
      { label: "No data loggers used", points: 15 },
    ],
  },
  {
    id: 8,
    text: "How quickly is fruit moved to cold storage after arrival?",
    answers: [
      { label: "Within 1 hour, documented", points: 0 },
      { label: "Within 2–4 hours", points: 5 },
      { label: "Same day, timing varies", points: 10 },
      { label: "Next day or longer", points: 15 },
    ],
  },
  {
    id: 9,
    text: "Have you experienced quality failures linked to cold chain issues in the last 12 months?",
    answers: [
      { label: "Never", points: 0 },
      { label: "1–2 times", points: 5 },
      { label: "3–5 times", points: 10 },
      { label: "More than 5 times", points: 15 },
    ],
  },
  {
    id: 10,
    text: "Do you conduct post-arrival inspections that include pulp temperature checks?",
    answers: [
      { label: "Always, with written records", points: 0 },
      { label: "Usually", points: 5 },
      { label: "Sometimes", points: 10 },
      { label: "Never", points: 15 },
    ],
  },
];

const RECOMMENDATIONS: Record<number, string> = {
  0: "Establish documented transit time standards. Shipments over 14 days need enhanced monitoring protocols and pre-shipment conditioning verification.",
  1: "Require pulp temperature records at origin. Pre-cooling documentation is your first line of defense against quality failures and carrier disputes.",
  2: "Implement variety-specific temperature protocols. A one-size-fits-all reefer setting is a leading cause of preventable losses across citrus, grapes, and stonefruit.",
  3: "Make pulp temperature checks mandatory on every arrival. Without arrival data, you can't manage — or claim — cold chain failures.",
  4: "Create a written supplier cold chain protocol with mandatory sign-off. Verbal agreements don't hold up in quality disputes with buyers or customs.",
  5: "Install a mid-transit temperature alerting system. By the time damaged fruit arrives, it's too late to prevent losses on that load.",
  6: "Require data loggers on every shipment and build a formal review process. Unreviewed data is operationally the same as no data.",
  7: "Set a hard receiving rule: fruit into cold storage within 1 hour of arrival. Post-arrival warming undoes every cold chain step before it.",
  8: "Investigate the root cause of each cold chain failure and maintain a corrective action log. Repeat failures signal a systemic gap, not bad luck.",
  9: "Implement a formal post-arrival inspection checklist including pulp temps, produce condition, reefer settings, and carrier seal integrity.",
};

type Screen = "landing" | "assessment" | "results";

function getRiskLevel(score: number) {
  if (score <= 30)
    return {
      level: "LOW RISK",
      color: "oklch(0.72 0.14 160)",
      bg: "oklch(0.72 0.14 160 / 0.12)",
      border: "oklch(0.72 0.14 160 / 0.35)",
      message: "Your cold chain is well managed. Keep it up.",
      icon: "✓",
    };
  if (score <= 70)
    return {
      level: "MEDIUM RISK",
      color: "oklch(0.8 0.14 75)",
      bg: "oklch(0.8 0.14 75 / 0.12)",
      border: "oklch(0.8 0.14 75 / 0.35)",
      message: "There are gaps in your cold chain that could be costing you.",
      icon: "⚠",
    };
  return {
    level: "HIGH RISK",
    color: "oklch(0.577 0.245 27)",
    bg: "oklch(0.577 0.245 27 / 0.12)",
    border: "oklch(0.577 0.245 27 / 0.35)",
    message:
      "Your cold chain has critical vulnerabilities. Action needed now.",
    icon: "✕",
  };
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="w-full py-4 px-6 flex items-center justify-between shadow-sm bg-hero border-b border-line-dark">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Axarat"
          className="h-9 w-auto"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="text-accent-gradient font-heading font-extrabold text-base uppercase tracking-widest">
          Axarat
        </span>
      </div>
      <span className="text-on-dark-muted text-sm hidden sm:block font-medium">
        Cold Chain Risk Scorer
      </span>
    </nav>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="w-full py-6 px-6 bg-navy border-t border-line-dark">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Axarat"
            className="h-7 w-auto opacity-70"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <p className="text-on-dark-muted text-sm">
            Powered by <span className="text-accent font-semibold">Axarat</span> — Real-time visibility for fresh produce importers
          </p>
        </div>
        <p className="text-on-dark-muted text-xs">© {new Date().getFullYear()} Axarat. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-on-dark-muted uppercase tracking-widest">
          Question <span className="font-mono">{current}</span> of <span className="font-mono">{total}</span>
        </span>
        <span className="text-xs font-bold text-accent">
          <span className="font-mono">{Math.round(pct)}%</span> Complete
        </span>
      </div>
      <div className="w-full h-2 bg-graphite rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out bg-accent-gradient"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Score Gauge ──────────────────────────────────────────────────────────────

function ScoreGauge({
  score,
  maxScore,
  riskColor,
}: {
  score: number;
  maxScore: number;
  riskColor: string;
}) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!animated) return;
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [animated, score]);

  const offset = circumference * (1 - (animated ? score / maxScore : 0));

  return (
    <div className="relative flex items-center justify-center">
      <svg width="210" height="210" viewBox="0 0 210 210">
        <circle
          cx="105"
          cy="105"
          r={radius}
          fill="none"
          stroke="#273449"
          strokeWidth="16"
        />
        <circle
          cx="105"
          cy="105"
          r={radius}
          fill="none"
          stroke={riskColor}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 105 105)"
          style={{
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center select-none">
        <span
          className="text-5xl font-black font-mono tabular-nums leading-none"
          style={{ color: riskColor }}
        >
          {displayScore}
        </span>
        <span className="text-sm text-on-dark-muted font-mono font-medium mt-1">
          / {maxScore}
        </span>
      </div>
    </div>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6 bg-hero">
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-line-dark px-4 py-1.5 mb-8">
            <span
              className="w-2 h-2 rounded-full bg-accent"
              style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
            />
            <span className="text-on-dark text-xs font-bold uppercase tracking-widest">
              Free Assessment Tool
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-on-dark leading-tight mb-5">
            Is Your Cold Chain Putting
            <br />
            <span className="text-accent">Your Fruit at Risk?</span>
          </h1>

          <p className="text-on-dark-muted text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-10">
            Answer 10 quick questions to get your Cold Chain Risk Score — and
            find out where your operation is most exposed.
          </p>

          <button
            onClick={onStart}
            className="btn-primary group inline-flex items-center gap-2.5 text-lg px-10 py-4 shadow-xl transition-all duration-200 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            Get My Risk Score
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>

          <p className="text-on-dark-muted text-sm mt-5">
            Takes less than 3 minutes · No account required
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-10 text-accent">
            What You&apos;ll Get
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: "🌡️",
                title: "Your Risk Score",
                desc: "A clear score out of 150 showing your total cold chain exposure across all 10 risk dimensions.",
              },
              {
                icon: "⚠️",
                title: "Top Vulnerabilities",
                desc: "The 3 specific areas where your operation is most exposed — ranked by severity.",
              },
              {
                icon: "🎯",
                title: "Actionable Fixes",
                desc: "Targeted recommendations you can bring to your logistics and procurement teams today.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="card flex flex-col items-center text-center p-7 transition-colors duration-200 hover:border-accent/40"
              >
                <span className="text-4xl mb-4">{f.icon}</span>
                <h3 className="font-bold text-sm mb-2 uppercase tracking-wide text-on-dark">
                  {f.title}
                </h3>
                <p className="text-sm text-on-dark-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commodity strip */}
      <div className="border-t border-line-dark bg-ocean/40 py-5 px-6">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm font-medium text-on-dark-muted">
          {["🍇 Table Grapes", "🍊 Citrus", "🍑 Stonefruit", "🫐 Berries", "🥭 Tropical"].map(
            (item) => (
              <span key={item}>{item}</span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Assessment ───────────────────────────────────────────────────────────────

function AssessmentScreen({
  answers,
  currentIndex,
  onAnswer,
  onBack,
  onNext,
  onFinish,
}: {
  answers: (number | null)[];
  currentIndex: number;
  onAnswer: (qIndex: number, aIndex: number) => void;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
}) {
  const [animKey, setAnimKey] = useState(0);
  const [selected, setSelected] = useState<number | null>(answers[currentIndex]);
  const prevIndex = useRef(currentIndex);

  useEffect(() => {
    if (prevIndex.current !== currentIndex) {
      setAnimKey((k) => k + 1);
      setSelected(answers[currentIndex]);
      prevIndex.current = currentIndex;
    }
  }, [currentIndex, answers]);

  const q = QUESTIONS[currentIndex];
  const isLast = currentIndex === QUESTIONS.length - 1;
  const canProceed = selected !== null;

  function handleSelect(aIndex: number) {
    setSelected(aIndex);
    onAnswer(currentIndex, aIndex);
  }

  function handleNext() {
    if (!canProceed) return;
    if (isLast) onFinish();
    else onNext();
  }

  return (
    <div className="flex-1 flex flex-col py-10 px-6">
      <div className="max-w-2xl mx-auto w-full">
        <ProgressBar current={currentIndex + 1} total={QUESTIONS.length} />

        {/* Card */}
        <div
          key={animKey}
          className="card p-8 sm:p-10 animate-fade-in-up"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-sm font-black font-mono text-accent bg-accent/10 border border-accent/40">
              {currentIndex + 1}
            </span>
            <span className="text-xs font-bold text-on-dark-muted uppercase tracking-widest">
              Cold Chain Assessment
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-on-dark mb-8 leading-snug">
            {q.text}
          </h2>

          <div className="space-y-3">
            {q.answers.map((a, aIndex) => {
              const isSelected = selected === aIndex;
              return (
                <button
                  key={aIndex}
                  onClick={() => handleSelect(aIndex)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-150 flex items-center gap-4 font-medium text-sm sm:text-base ${
                    isSelected
                      ? "border-accent bg-accent/10 text-on-dark"
                      : "border-graphite bg-navy/60 text-on-dark-muted hover:border-accent"
                  }`}
                >
                  <span
                    className={`flex-none w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-accent bg-accent"
                        : "border-graphite bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-navy" />
                    )}
                  </span>
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={onBack}
            className="btn-secondary flex items-center gap-2 px-5 py-2.5 font-semibold text-sm transition-all active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="btn-primary flex items-center gap-2 px-7 py-2.5 text-sm transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
          >
            {isLast ? "See My Results" : "Next Question"}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────

function ResultsScreen({
  answers,
  onRetake,
}: {
  answers: (number | null)[];
  onRetake: () => void;
}) {
  const [showReport, setShowReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLTextAreaElement>(null);

  const scores = QUESTIONS.map((q, i) => {
    const aIdx = answers[i];
    return aIdx !== null ? q.answers[aIdx].points : 0;
  });
  const total = scores.reduce((s, x) => s + x, 0);
  const maxScore = 150;
  const risk = getRiskLevel(total);

  const top3 = [...scores.map((pts, i) => ({ i, pts }))]
    .sort((a, b) => b.pts - a.pts)
    .slice(0, 3);

  // Rank 1/2/3 → danger / warning / accent. Warning and accent are light
  // fills, so their numbers go in navy; white stays on the danger fill.
  const rankColors = ["oklch(0.577 0.245 27)", "oklch(0.8 0.14 75)", "#35C8E8"];
  const rankTextColors = ["#ffffff", "#0B1424", "#0B1424"];

  const reportText = [
    "COLD CHAIN RISK REPORT — Axarat",
    `Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    "─".repeat(52),
    `OVERALL SCORE: ${total} / ${maxScore}`,
    `RISK LEVEL: ${risk.level}`,
    "",
    risk.message,
    "",
    "─".repeat(52),
    "TOP 3 AREAS FOR IMPROVEMENT",
    "",
    ...top3.flatMap(({ i, pts }, rank) => [
      `${rank + 1}. ${QUESTIONS[i].text}`,
      `   Your answer: "${QUESTIONS[i].answers[answers[i]!].label}" (${pts} pts)`,
      `   Fix: ${RECOMMENDATIONS[i]}`,
      "",
    ]),
    "─".repeat(52),
    "FULL QUESTION BREAKDOWN",
    "",
    ...QUESTIONS.map(
      (q, i) =>
        `Q${i + 1}: ${q.text}\n   Answer: "${q.answers[answers[i]!].label}" — ${scores[i]} pts`
    ),
    "",
    "─".repeat(52),
    "Want to fix this? Axarat gives fresh produce importers real-time",
    "visibility into every container's cold chain status — so",
    "temperature problems surface before the fruit arrives.",
    "See how Axarat works: axarat.com/#contact",
  ].join("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      reportRef.current?.select();
    }
  }

  return (
    <div className="flex-1 flex flex-col py-12 px-6">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center animate-fade-in-up">
          <p className="text-xs font-bold uppercase tracking-widest mb-2 text-accent">
            Assessment Complete
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-on-dark">
            Your Cold Chain Risk Report
          </h1>
        </div>

        {/* Score card */}
        <div
          className="card p-8 animate-fade-in-up"
          style={{ animationDelay: "0.1s", animationFillMode: "both", opacity: 0 }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-none">
              <ScoreGauge score={total} maxScore={maxScore} riskColor={risk.color} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-4 font-black text-sm uppercase tracking-widest border-2"
                style={{
                  backgroundColor: risk.bg,
                  borderColor: risk.border,
                  color: risk.color,
                }}
              >
                <span className="text-base">{risk.icon}</span>
                {risk.level}
              </div>
              <p className="text-on-dark leading-relaxed">{risk.message}</p>
              <p className="text-on-dark-muted text-sm mt-3">
                Score:{" "}
                <strong className="text-on-dark font-bold font-mono">{total}</strong> out
                of <span className="font-mono">{maxScore}</span> possible points
              </p>
            </div>
          </div>
        </div>

        {/* Top 3 */}
        <div
          className="card p-8 animate-fade-in-up"
          style={{ animationDelay: "0.2s", animationFillMode: "both", opacity: 0 }}
        >
          <h2 className="font-black text-lg text-on-dark mb-1">
            Your Top 3 Vulnerabilities
          </h2>
          <p className="text-sm text-on-dark-muted mb-6">
            These are the cold chain areas where your operation is most exposed
            right now.
          </p>
          <div className="space-y-4">
            {top3.map(({ i, pts }, rank) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-lg border border-line-dark bg-navy/60"
              >
                <div
                  className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-sm font-black font-mono mt-0.5"
                  style={{ backgroundColor: rankColors[rank], color: rankTextColors[rank] }}
                >
                  {rank + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start gap-2 mb-1">
                    <p className="text-sm font-bold text-on-dark flex-1">
                      Q{i + 1}: {QUESTIONS[i].text}
                    </p>
                    <span className="flex-none text-xs font-black font-mono px-2.5 py-0.5 rounded-full text-accent bg-accent/10 border border-accent/40">
                      {pts} pts
                    </span>
                  </div>
                  <p className="text-xs text-on-dark-muted italic mb-2">
                    Your answer: &ldquo;
                    {QUESTIONS[i].answers[answers[i]!].label}&rdquo;
                  </p>
                  <p className="text-sm text-on-dark leading-relaxed">
                    {RECOMMENDATIONS[i]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="card p-8 animate-fade-in-up"
          style={{
            animationDelay: "0.3s",
            animationFillMode: "both",
            opacity: 0,
          }}
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl flex-none mt-0.5">🎯</span>
            <div>
              <h3 className="font-black text-on-dark text-lg mb-2">
                Want to fix this?
              </h3>
              <p className="text-on-dark-muted text-sm leading-relaxed mb-5">
                Axarat gives fresh produce importers real-time visibility into
                every container&apos;s cold chain status — so temperature
                problems surface before the fruit arrives.
                <br />
                <span className="text-on-dark font-semibold">
                  Reply to this email or visit axarat.com
                </span>
              </p>
              <a
                href="https://axarat.com/#contact"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 text-sm px-6 py-3 transition-all hover:scale-105 active:scale-95"
              >
                See how Axarat works →
              </a>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex flex-col sm:flex-row gap-3 animate-fade-in-up"
          style={{ animationDelay: "0.4s", animationFillMode: "both", opacity: 0 }}
        >
          <button
            onClick={() => {
              setShowReport(true);
              setTimeout(() => reportRef.current?.select(), 100);
            }}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-sm transition-all hover:scale-105 active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download My Risk Report
          </button>
          <button
            onClick={onRetake}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-sm transition-all active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retake Assessment
          </button>
        </div>

        {/* Report textarea */}
        {showReport && (
          <div className="card p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-on-dark text-sm">
                Your Report — Copy and Share
              </h3>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                  copied
                    ? "rounded-md border border-success bg-success text-navy"
                    : "btn-secondary"
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
            <textarea
              ref={reportRef}
              readOnly
              value={reportText}
              className="input w-full h-64 text-xs font-mono p-3 resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function ColdChainScorer() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(QUESTIONS.length).fill(null)
  );

  function handleStart() {
    setCurrentIndex(0);
    setAnswers(Array(QUESTIONS.length).fill(null));
    setScreen("assessment");
  }

  function handleAnswer(qIndex: number, aIndex: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = aIndex;
      return next;
    });
  }

  function handleBack() {
    if (currentIndex === 0) setScreen("landing");
    else setCurrentIndex((i) => i - 1);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {screen === "landing" && <LandingScreen onStart={handleStart} />}
        {screen === "assessment" && (
          <AssessmentScreen
            answers={answers}
            currentIndex={currentIndex}
            onAnswer={handleAnswer}
            onBack={handleBack}
            onNext={() => setCurrentIndex((i) => i + 1)}
            onFinish={() => setScreen("results")}
          />
        )}
        {screen === "results" && (
          <ResultsScreen
            answers={answers}
            onRetake={() => {
              setCurrentIndex(0);
              setAnswers(Array(QUESTIONS.length).fill(null));
              setScreen("landing");
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
