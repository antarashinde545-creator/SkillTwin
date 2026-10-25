
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const app = express();

const PORT = Number(process.env.PORT || 8081);
const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
const OLLAMA_URL = (
  process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
).replace(/\/+$/, '');

const allowedOrigins = (
  process.env.CLIENT_ORIGIN ||
  'http://localhost:5173,http://localhost:5174'
)
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  }
}));

app.use(express.json({ limit: '2mb' }));

app.use('/api/ai', rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false
}));

// Validate student profile while keeping the existing frontend fields.
const profileSchema = z.object({
  name: z.string().max(100).optional().default('Student'),
  targetCareer: z.string().min(2).max(120),

  skills: z.array(
    z.string().max(100)
  ).max(100).default([]),

  projects: z.array(
    z.object({
      name: z.string().max(160),
      description: z.string().max(1000).optional().default(''),
      technologies: z.array(
        z.string().max(80)
      ).max(40).default([])
    })
  ).max(30).default([]),

  courses: z.array(
    z.string().max(160)
  ).max(50).default([]),

  certifications: z.array(
    z.string().max(160)
  ).max(50).default([]),

  internships: z.array(
    z.string().max(160)
  ).max(30).default([]),

  durationWeeks: z.number()
    .int()
    .min(4)
    .max(52)
    .default(4)
});

const chatSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  profile: profileSchema,
  analysis: z.any().optional(),

  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().max(4000)
    })
  ).max(12).default([])
});

const instructions = `
You are SkillTwin, an AI career readiness coach.

Your responsibilities:
1. Evaluate a student's profile against their target career.
2. Extract skills from the supplied profile information.
3. Normalize skill names and common aliases.
4. Evaluate proficiency using available evidence.
5. Identify strengths and skills without sufficient evidence.
6. Recommend practical projects and next actions.
7. Create a personalized learning roadmap.
8. Explain recommendations clearly.

IMPORTANT RULES:
- Never invent qualifications, projects, certifications or experience.
- A skill mentioned in a course does not automatically prove proficiency.
- A skill missing from the profile means "not evidenced", not necessarily unknown.
- Do not claim to have read an uploaded resume or GitHub repository unless its content was supplied.
- Do not claim to have independently verified a certificate or repository.
- Distinguish reported evidence from independently verified evidence.
- Readiness scores are estimates, not validated hiring predictions.
- Never guarantee employment.
- Keep recommendations specific and practical.

SKILL EVALUATION:
- Extract relevant technical and professional skills from the supplied profile.
- Normalize aliases to conventional names, e.g. SpringBoot to Spring Boot.
- Merge duplicate skills after normalization.
- proficiency must be Strong, Developing, or Missing.
- score must be an integer between 0 and 100.
- evidenceSources may contain skills, projects, courses, certifications,
  internships, or github.
- Include evidence explaining why the proficiency was assigned.
- Use Missing when no meaningful supporting evidence is supplied.
- Do not assign a high score based only on a skill name.
- Evaluate skills relevant to the target career.
`;

async function ollamaChat(messages, options = {}) {
  let response;

  try {
    response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: false,
        ...options
      }),
      signal: AbortSignal.timeout(180000)
    });
  } catch (cause) {
    const error = new Error(
      `Cannot connect to Ollama at ${OLLAMA_URL}. Make sure Ollama is running.`
    );

    error.status = 503;
    error.cause = cause;
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.error || `Ollama returned HTTP ${response.status}`
    );

    error.status = response.status === 404 ? 503 : 502;
    throw error;
  }

  const content = data.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    const error = new Error('Ollama returned an empty response.');
    error.status = 502;
    throw error;
  }

  return content.trim();
}

function parseJsonOutput(output) {
  const cleaned = output
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return JSON.parse(cleaned);
}

// Health check: confirm Ollama and the selected model are available.
app.get('/api/health', async (_req, res) => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Ollama returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const models = (data.models || []).map(item => item.name);

    const modelInstalled = models.some(
      name => name === MODEL || name.startsWith(`${MODEL}:`)
    );

    res.status(modelInstalled ? 200 : 503).json({
      status: modelInstalled ? 'ok' : 'model_missing',
      service: 'skilltwin-ai-backend',
      provider: 'ollama',
      model: MODEL,
      modelInstalled,
      models
    });
  } catch (error) {
    res.status(503).json({
      status: 'unavailable',
      service: 'skilltwin-ai-backend',
      provider: 'ollama',
      error: error.message
    });
  }
});

// AI SkillTwin Engine + career analysis.
app.post('/api/ai/analyze', async (req, res, next) => {
  try {
    const profile = profileSchema.parse(req.body);

    const prompt = `
${instructions}

Analyse this student for the target career.

Return ONLY a valid JSON object with this structure:
{
  "targetCareer": "string",
  "readinessScore": 0,
  "confidence": "low",
  "scoreExplanation": "string",
  "skillEvaluations": [
    {
      "skill": "Python",
      "normalizedSkill": "Python",
      "proficiency": "Strong",
      "score": 80,
      "evidenceSources": ["projects", "courses"],
      "evidence": "Specific evidence from the supplied profile",
      "reason": "Explanation for the proficiency rating"
    }
  ],
  "strengths": [
    {
      "skill": "string",
      "evidence": "string"
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "priority": "high",
      "reason": "string",
      "suggestedEvidence": "string"
    }
  ],
  "nextBestAction": {
    "title": "string",
    "why": "string",
    "deliverables": ["string"]
  },
  "roadmap": [
    {
      "week": 1,
      "title": "string",
      "objective": "string",
      "tasks": ["string"],
      "evidenceToProduce": "string"
    }
  ],
  "followUpQuestions": ["string"]
}

Requirements:
- readinessScore: integer from 0 to 100.
- confidence: low, medium, or high.
- skillEvaluations: an array of normalized skill assessments.
- proficiency: Strong, Developing, or Missing.
- score: integer from 0 to 100.
- evidenceSources: array using only skills, projects, courses,
  certifications, internships, or github.
- priority: high, medium, or low.
- Include relevant evidenced skills and important skills not yet evidenced.
- Keep evidence tied to the supplied profile.
- Do not claim independent verification.
- Generate exactly ${profile.durationWeeks} roadmap entries.
- Return valid JSON only, without Markdown fences.

STUDENT PROFILE:
${JSON.stringify(profile, null, 2)}
`;

    const output = await ollamaChat(
      [
        {
          role: 'system',
          content: 'You are SkillTwin. Return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      {
        format: 'json',
        options: {
          temperature: 0.2,
          num_predict: 3500
        }
      }
    );

    const analysis = parseJsonOutput(output);

    if (
      typeof analysis.readinessScore !== 'number' ||
      analysis.readinessScore < 0 ||
      analysis.readinessScore > 100 ||
      !Array.isArray(analysis.roadmap) ||
      !Array.isArray(analysis.skillEvaluations)
    ) {
      throw new Error(
        'AI returned an unexpected analysis format. Please retry.'
      );
    }

    // Normalize and validate skill evaluation fields before returning them.
    analysis.skillEvaluations = analysis.skillEvaluations
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const allowedProficiencies = [
          'Strong',
          'Developing',
          'Missing'
        ];

        const proficiency = allowedProficiencies.includes(item.proficiency)
          ? item.proficiency
          : 'Missing';

        const allowedSources = [
          'skills',
          'projects',
          'courses',
          'certifications',
          'internships',
          'github'
        ];

        const evidenceSources = Array.isArray(item.evidenceSources)
          ? item.evidenceSources.filter(source =>
              allowedSources.includes(source)
            )
          : [];

        return {
          skill: String(item.skill || item.normalizedSkill || 'Unknown skill'),
          normalizedSkill: String(
            item.normalizedSkill || item.skill || 'Unknown skill'
          ),
          proficiency,
          score: Math.max(
            0,
            Math.min(100, Math.round(Number(item.score) || 0))
          ),
          evidenceSources,
          evidence: String(item.evidence || 'No evidence supplied.'),
          reason: String(item.reason || '')
        };
      });

    res.json({
      analysis,
      model: MODEL,
      provider: 'ollama',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// AI career chat.
app.post('/api/ai/chat', async (req, res, next) => {
  try {
    const {
      message,
      profile,
      analysis,
      history
    } = chatSchema.parse(req.body);

    const systemPrompt = `
${instructions}

Use this student's profile as context:
${JSON.stringify(profile)}

Latest career analysis:
${JSON.stringify(analysis ?? null)}

Answer the latest career question using this context.
If asked about skill proficiency, explain the supporting evidence
and acknowledge what is not evidenced.
Ask a clarifying question if important information is missing.
Do not claim to have saved or changed the profile.
`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...history.slice(-10),
      {
        role: 'user',
        content: message
      }
    ];

    const reply = await ollamaChat(messages, {
      options: {
        temperature: 0.5,
        num_predict: 350
      }
    });

    res.json({
      reply,
      model: MODEL,
      provider: 'ollama'
    });
  } catch (error) {
    next(error);
  }
});

// Error handler.
app.use((error, _req, res, _next) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Invalid request data',
      details: error.issues
    });
  }

  console.error('[SkillTwin API]', error.message);

  const status = error.status || 500;

  res.status(status).json({
    error: error.message || 'AI request failed.'
  });
});

// Start backend.
app.listen(PORT, () => {
  console.log(`SkillTwin backend running at http://localhost:${PORT}`);
  console.log(`AI provider: Ollama (${MODEL})`);
  console.log(`Ollama URL: ${OLLAMA_URL}`);
});
