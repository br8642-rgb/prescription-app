export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { name, phone, session } = req.query;
  if (!name || !session) return res.status(400).json({ error: '파라미터 누락' });

  const response = await fetch(
    `https://www.1stcrm.co.kr/api/local/v1/customers?name=${encodeURIComponent(name)}&size=50&page=0&sort=createdTime,desc&sort=id,desc`,
    { headers: { cookie: `SESSION=${session}` } }
  );
  const data = await response.json();

  if (phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    // 이름은 포함(contains), 전화번호는 정확히 일치
    const filtered = data.content?.filter(c =>
      c.telNumbers?.some(t => t.number.replace(/[^0-9]/g, '') === cleanPhone)
    ) || [];
    return res.status(200).json({ ...data, content: filtered });
  }

  res.status(200).json(data);
}
