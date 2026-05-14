export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, session } = req.query;
  if (!q || !session) return res.status(400).json({ error: '파라미터 누락' });

  const response = await fetch(
    `https://www.1stcrm.co.kr/api/local/v1/medicines?name=${encodeURIComponent(q)}&size=10&page=0`,
    { headers: { cookie: `SESSION=${session}` } }
  );
  const data = await response.json();
  res.status(200).json(data);
}
