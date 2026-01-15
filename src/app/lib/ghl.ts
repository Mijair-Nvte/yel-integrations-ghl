const GHL_BASE = process.env.GHL_BASE_URL!;
const TOKEN = process.env.GHL_PRIVATE_TOKEN!;

export async function ghlFetch(path: string) {
  const res = await fetch(`${GHL_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Version: '2021-07-28',
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`GHL error ${res.status}`);
  }

  return res.json();
}
