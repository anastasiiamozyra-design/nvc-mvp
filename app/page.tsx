"use client";

import { useMemo, useState } from "react";

type RewriteResult = {
  option_0: {
    label: string;
    text: string;
    alternatives: {
      observations: string[];
      feelings: string[];
      needs: string[];
      requests: string[];
    };
  };
  option_1: {
    label: string;
    text: string;
  };
  analysis: {
    label: string;
    items: {
      quote: string;
      issue: string;
    }[];
  };
  proof_line: string;
};

const STEP_HELP: Record<string, string> = {
  Observation:
    "Observations: Stating concrete facts without judgment or evaluation.",
  Feeling:
    "Feelings: Expressing emotions (e.g., glad, proud, angry) rather than thoughts.",
  Need:
    "Needs: Identifying universal human needs (e.g., safety, empathy, autonomy) that are met or unmet.",
  Request:
    "Requests: Making clear, positive, and doable requests.",
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const stepDescription = useMemo(() => {
    if (!selectedStep) return "";
    return STEP_HELP[selectedStep];
  }, [selectedStep]);

  const handleRewrite = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Try again in a moment.");
      }

      setResult(data.result);
    } catch {
      setError("Something went wrong. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-neutral-900">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-3 text-4xl font-semibold tracking-tight">
          Language of Life
        </h1>

        <p className="text-neutral-700">
          Nonviolent Communication (NVC) by Marshall Rosenberg
        </p>

        <div className="mt-2 text-neutral-700">
          <span>The 4-step process: </span>

          <button
            type="button"
            onClick={() => setSelectedStep("Observation")}
            className="underline-offset-4 hover:underline"
          >
            Observation
          </button>

          <span>, </span>

          <button
            type="button"
            onClick={() => setSelectedStep("Feeling")}
            className="underline-offset-4 hover:underline"
          >
            Feeling
          </button>

          <span>, </span>

          <button
            type="button"
            onClick={() => setSelectedStep("Need")}
            className="underline-offset-4 hover:underline"
          >
            Need
          </button>

          <span>, </span>

          <button
            type="button"
            onClick={() => setSelectedStep("Request")}
            className="underline-offset-4 hover:underline"
          >
            Request
          </button>
        </div>

        {stepDescription && (
          <p className="mt-3 rounded-xl bg-neutral-100 px-4 py-3 text-sm leading-6 text-neutral-700">
            {stepDescription}
          </p>
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What do you want to say to your partner right now?"
          className="mt-8 min-h-36 w-full rounded-2xl border border-neutral-300 p-4 text-base outline-none"
        />

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            onClick={handleRewrite}
            disabled={!message.trim() || loading}
            className="rounded-2xl bg-black px-5 py-3 text-white transition active:scale-95 active:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "Rewriting..." : "Rewrite this better"}
          </button>

          <a
            href="https://www.linkedin.com/in/anastasiia-mozyra/"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
          >
            Help improve this project
          </a>
        </div>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        {result && (
          <div className="mt-10 space-y-6">
            <p className="text-sm text-neutral-500">{result.proof_line}</p>

            <section className="rounded-2xl border border-neutral-200 p-5">
              <h2 className="mb-3 text-xl font-medium">{result.option_0.label}</h2>
              <p className="mb-4 whitespace-pre-wrap">{result.option_0.text}</p>

              <div className="space-y-2 text-sm text-neutral-700">
                <p>
                  <strong>Observation alternatives:</strong>{" "}
                  {result.option_0.alternatives.observations.join(" · ")}
                </p>
                <p>
                  <strong>Feeling alternatives:</strong>{" "}
                  {result.option_0.alternatives.feelings.join(" · ")}
                </p>
                <p>
                  <strong>Need alternatives:</strong>{" "}
                  {result.option_0.alternatives.needs.join(" · ")}
                </p>
                <p>
                  <strong>Request alternatives:</strong>{" "}
                  {result.option_0.alternatives.requests.join(" · ")}
                </p>
              </div>

              <button
                onClick={() => copyText(result.option_0.text, "opt0")}
                className="mt-4 rounded-xl border px-4 py-2 transition active:scale-95 active:bg-neutral-200"
              >
                {copied === "opt0" ? "Copied ✓" : "Copy message"}
              </button>
            </section>

            <section className="rounded-2xl border border-neutral-200 p-5">
              <h2 className="mb-3 text-xl font-medium">{result.option_1.label}</h2>
              <p className="whitespace-pre-wrap">{result.option_1.text}</p>
              <button
                onClick={() => copyText(result.option_1.text, "opt1")}
                className="mt-4 rounded-xl border px-4 py-2 transition active:scale-95 active:bg-neutral-200"
              >
                {copied === "opt1" ? "Copied ✓" : "Copy message"}
              </button>
            </section>

            <section className="rounded-2xl border border-neutral-200 p-5">
              <h2 className="mb-3 text-xl font-medium">{result.analysis.label}</h2>

              <div className="space-y-3">
                {result.analysis.items.map((item, index) => (
                  <div key={`${item.quote}-${index}`} className="text-sm text-neutral-700">
                    {item.quote ? (
                      <p>
                        <strong>“{item.quote}”</strong> — {item.issue}
                      </p>
                    ) : (
                      <p>{item.issue}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
