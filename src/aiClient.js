
const AI_API_BASE =
  import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:8081';

async function post(path, body) {
  const response = await fetch(`${AI_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `AI request failed with status ${response.status}`
    );
  }

  return data;
}

export async function analyzeCareer(profile) {
  const result = await post('/api/ai/analyze', profile);
  return result.analysis;
}

export async function sendCareerChat(payload) {
  const result = await post('/api/ai/chat', payload);
  return result;
}
