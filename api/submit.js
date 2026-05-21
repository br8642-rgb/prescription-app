export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { session, customerId, medicines } = req.body;
  if (!session || !customerId || !medicines || medicines.length === 0)
    return res.status(400).json({ error: '필수 항목 누락' });

  try {
    // 전체 period = 가장 긴 복용일수
    const period = Math.max(...medicines.map(m => Number(m.days) || 30));

    const payload = {
      doctorId: 1,
      customerId: Number(customerId),
      packageId: null,
      insuranceType: 5,
      insuranceTypeEtc: null,
      injectionDrugType: 0,
      period,
      itemList: medicines.map((m, i) => ({
        code: m.id,
        name: m.name,
        companyName: m.companyName || '',
        dailyDose: m.dailyDose ?? 1,       // 미녹시딜: 0.25 / 0.5, 나머지: 1
        dosage: 1,                          // 1일 투여횟수 항상 1
        routesOfAdministration: m.routesOfAdministration || 1,
        sortOrder: i,
        totalDosageDays: Number(m.days) || 30,  // 약품별 복용일수
        usage: null,
      })),
    };

    const response = await fetch('https://www.1stcrm.co.kr/api/local/v1/prescriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cookie': `SESSION=${session}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }

    if (!response.ok) {
      return res.status(response.status).json({ error: '서버 오류', detail: data, status: response.status });
    }
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
