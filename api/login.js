export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const response = await fetch('https://www.1stcrm.co.kr/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `account=${encodeURIComponent(process.env.CRM_ID)}&password=${encodeURIComponent(process.env.CRM_PASSWORD)}`,
    redirect: 'manual',
  });

  const cookies = response.headers.get('set-cookie') || '';
  const sessionMatch = cookies.match(/SESSION=([^;]+)/);
  if (!sessionMatch) return res.status(401).json({ error: '로그인 실패' });

  res.status(200).json({ session: sessionMatch[1] });
}
