"use client";

import { useState } from "react";

type RewriteResult = {
  option_0: {
    label: string;
    text: string;
    alternatives: {
      feelings: string[];
      needs: string[];
      requests: string[];
    };
  };
  option_1: {
    label: string;
    text: string;
  };
  option_2: {
    label: string;
    text: string;
  };
  proof_line: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-neutral-900">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-3 text-4xl font-semibold tracking-tight">
          Rewrite this better
        </h1>
        <p className="mb-6 text-neutral-600">
          Say it so they actually hear you.
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type what you want to say to your partner..."
          className="min-h-36 w-full rounded-2xl border border-neutral-300 p-4 text-base outline-none"
        />

        <button
          onClick={handleRewrite}
          disabled={!message.trim() || loading}
          className="mt-4 rounded-2xl bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Rewriting..." : "Say it so they actually hear you"}
        </button>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        {result && (
          <div className="mt-10 space-y-6">
            <p className="text-sm text-neutral-500">{result.proof_line}</p>

            <section className="rounded-2xl border border-neutral-200 p-5">
              <h2 className="mb-3 text-xl font-medium">{result.option_0.label}</h2>
              <p className="mb-4 whitespace-pre-wrap">{result.option_0.text}</p>

              <div className="space-y-2 text-sm text-neutral-700">
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
                onClick={() => copyText(result.option_0.text)}
                className="mt-4 rounded-xl border px-4 py-2"
              >
                Copy message
              </button>
            </section>

            <section className="rounded-2xl border border-neutral-200 p-5">
              <h2 className="mb-3 text-xl font-medium">{result.option_1.label}</h2>
              <p className="whitespace-pre-wrap">{result.option_1.text}</p>
              <button
                onClick={() => copyText(result.option_1.text)}
                className="mt-4 rounded-xl border px-4 py-2"
              >
                Copy message
              </button>
            </section>

            <section className="rounded-2xl border border-neutral-200 p-5">
              <h2 className="mb-3 text-xl font-medium">{result.option_2.label}</h2>
              <p className="whitespace-pre-wrap">{result.option_2.text}</p>
              <button
                onClick={() => copyText(result.option_2.text)}
                className="mt-4 rounded-xl border px-4 py-2"
              >
                Copy message
              </button>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}