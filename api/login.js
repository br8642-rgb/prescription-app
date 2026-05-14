export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await fetch('https://www.1stcrm.co.kr/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: `account=${encodeURIComponent(process.env.CRM_ID)}&password=${encodeURIComponent(process.env.CRM_PASSWORD)}`,
      redirect: 'manual',
    });

    const setCookieHeader = response.headers.get('set-cookie') || '';
    const sessionMatch = setCookieHeader.match(/SESSION=([^;]+)/);

    if (sessionMatch) {
      return res.status(200).json({ session: sessionMatch[1] });
    }

    const location = response.headers.get('location') || '';
    if (location.includes('/login')) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 틀렸습니다.' });
    }

    return res.status(401).json({ error: '로그인 실패', status: response.status, location, cookie: setCookieHeader });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
