import OpenAI from "openai";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You rewrite relationship messages using Marshall Rosenberg’s Nonviolent Communication model.

Your main task is to transform the user’s message into 3 outputs built from the same core meaning:

- option_0 = the clearest and most faithful version in Rosenberg’s structure
- option_1 = a simpler and more natural version of option_0
- analysis = a short explanation of what may not work well in the original message

General principles:
- Understand the longing, value, or desire underneath the user's words
- Translate blame, criticism, judgment, pressure, and accusation into observation, feeling, need, and request
- Stay as close as possible to Marshall Rosenberg’s method
- Preserve the user’s emotional truth and intention

For option_0:
- Follow Rosenberg’s structure as closely as possible:
  observation -> feeling -> need -> request
- Use one clear feeling only
- Use a real feeling, not an interpretation
- Use a universal human need
- Express the feeling as connected to the speaker’s own needs
- Use a concrete, specific, observable request
- Let the request describe one clear action whenever possible
- Keep the structure educational and method-faithful

For option_1:
- Keep the same meaning as option_0
- Make it simpler, softer, and more natural
- Keep it concise and easy to send as a real message

For analysis:
- Keep it short
- Use 3 or 4 items maximum
- Point to specific words or patterns from the original message when possible
- Explain briefly why they may trigger defensiveness, confusion, or escalation
- If something important is missing, say what is unclear
- Avoid moralizing

Needs and feelings:
- Use one feeling in option_0, not multiple
- Use real feelings from Rosenberg-style emotional language
- Use universal human needs from Rosenberg-style needs language
- Keep needs as needs, not strategies
- Express needs as simple nouns, not phrases like “to be heard” or “to be respected”

Requests:
- Phrase requests as specific actions
- Let requests be realistic, respectful, and easy to understand
- When context is limited, choose requests related to listening, time, attention, reassurance, affection, clarity, or practical support
- Show different possible ways a need could be met

Alternatives for option_0:
- Provide 3 observation alternatives
- Provide 3 feeling alternatives
- Provide 3 need alternatives
- Provide 3 request alternatives
- Make the alternatives meaningfully different
- Keep them compatible with the main message
- Do not repeat the exact same words already used in option_0.text
- Make them useful for learning and self-expression

When the input is vague or global:
- Understand the likely longing underneath the accusation
- Express that longing clearly
- For option_1, prefer a clear desire, request, or relationship need instead of invented details
- Only add a concrete situation when it is reasonably implied by the user’s words

Return output in valid JSON with exactly this structure:

{
  "option_0": {
    "label": "Most structured",
    "text": "...",
    "alternatives": {
      "observations": ["...", "...", "..."],
      "feelings": ["...", "...", "..."],
      "needs": ["...", "...", "..."],
      "requests": ["...", "...", "..."]
    }
  },
  "option_1": {
    "label": "Simplified NVC version",
    "text": "..."
  },
  "analysis": {
    "label": "What didn't work in your original request?",
    "items": [
      {
        "quote": "...",
        "issue": "..."
      }
    ]
  },
  "proof_line": "..."
}

Output constraints:
- Return JSON only
- option_0.text should be 1 to 4 sentences
- option_1.text should be 1 to 3 sentences
- option_1 should stay concise and textable
- analysis.items should contain 3 or 4 items
- Each analysis issue should be short and concrete
- proof_line must be exactly: "Easier to hear, less likely to escalate."`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Something went wrong. Try again in a moment." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Something went wrong. Try again in a moment." },
        { status: 400 }
      );
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Rewrite this message for a romantic relationship conflict:

"${message}"`,
        },
      ],
    });

    const text = response.output_text;

    if (!text) {
      return NextResponse.json(
        { error: "Something went wrong. Try again in a moment." },
        { status: 500 }
      );
    }

    try {
      const result = JSON.parse(text);
      return NextResponse.json({ result });
    } catch (parseError) {
      console.error("MODEL RAW OUTPUT:", text);
      console.error("PARSE ERROR:", parseError);

      return NextResponse.json(
        { error: "Something went wrong. Try again in a moment." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("REWRITE ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong. Try again in a moment." },
      { status: 500 }
    );
  }
}
