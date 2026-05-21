export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 메서드' });

  const { groups } = req.body;
  if (!groups) return res.status(400).json({ error: '데이터 누락' });

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = 'br8642-rgb/prescription-app';
  const FILE_PATH = 'public/quick-meds.json';

  try {
    // 현재 파일 SHA 가져오기 (업데이트에 필요)
    const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    let sha = null;
    if (getRes.ok) {
      const getData = await getRes.json();
      sha = getData.sha;
    }

    const content = Buffer.from(JSON.stringify(groups, null, 2)).toString('base64');

    const body = {
      message: '자주 처방 약품 목록 업데이트',
      content,
      ...(sha ? { sha } : {}),
    };

    const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      return res.status(500).json({ error: 'GitHub 저장 실패', detail: err });
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
