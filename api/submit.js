export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { session, customerId, medicines, days } = req.body;
  if (!session || !customerId || !medicines || !days)
    return res.status(400).json({ error: '필수 항목 누락' });

  const payload = {
    doctorId: 1,
    customerId,
    packageId: null,
    insuranceType: 5,
    insuranceTypeEtc: null,
    injectionDrugType: 0,
    period: days,
    itemList: medicines.map(m => ({
      code: m.id,
      name: m.name,
      companyName: m.companyName || '',
    })),
  };

  const response = await fetch('https://www.1stcrm.co.kr/api/local/v1/prescriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `SESSION=${session}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  res.status(200).json(data);
}
