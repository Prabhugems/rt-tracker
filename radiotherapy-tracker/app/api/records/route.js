const TOKEN = process.env.AIRTABLE_ACCESS_TOKEN;
const BASE = process.env.AIRTABLE_BASE_ID;
const TABLE = process.env.AIRTABLE_RECORDS_TABLE_ID;
const URL_BASE = `https://api.airtable.com/v0/${BASE}/${TABLE}`;
const HEADERS = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

const toApp = (rec) => ({
  id: rec.id,
  fields: {
    regNo: rec.fields["Registration Number"] || "",
    opDate: rec.fields["OP Visit Date"] || "",
    ipNo: rec.fields["IP Number"] || "",
    name: rec.fields["Patient Name"] || "",
    amount: rec.fields["Amounts"] || 0,
    mode: rec.fields["Mode of Receipt"] || "",
    receiptDate: rec.fields["Date of receipt"] || "",
    billClosed: rec.fields["Bill Closed Date"] || "",
  },
  created: rec.createdTime,
});

const toAirtable = (fields) => ({
  "Registration Number": fields.regNo || "",
  "OP Visit Date": fields.opDate || null,
  "IP Number": fields.ipNo || "",
  "Patient Name": fields.name || "",
  "Amounts": parseFloat(fields.amount) || 0,
  "Mode of Receipt": fields.mode || "",
  "Date of receipt": fields.receiptDate || null,
  "Bill Closed Date": fields.billClosed || null,
});

export async function GET() {
  try {
    let all = [];
    let offset = null;
    do {
      const url = offset ? `${URL_BASE}?offset=${offset}` : URL_BASE;
      const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
      if (!res.ok) return Response.json({ error: "Failed to fetch records" }, { status: res.status });
      const data = await res.json();
      all = all.concat(data.records.map(toApp));
      offset = data.offset;
    } while (offset);
    return Response.json(all);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { fields } = await req.json();
    const res = await fetch(URL_BASE, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ fields: toAirtable(fields) }),
    });
    if (!res.ok) {
      const err = await res.json();
      return Response.json({ error: err }, { status: res.status });
    }
    const rec = await res.json();
    return Response.json(toApp(rec));
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
