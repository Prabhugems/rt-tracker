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
    txnNo: rec.fields["Transaction Number"] || "",
    billClosed: rec.fields["Bill Closed Date"] || "",
  },
  created: rec.createdTime,
});

const toAirtable = (fields) => {
  const mapped = {};
  if (fields.regNo !== undefined) mapped["Registration Number"] = fields.regNo;
  if (fields.opDate !== undefined) mapped["OP Visit Date"] = fields.opDate || null;
  if (fields.ipNo !== undefined) mapped["IP Number"] = fields.ipNo;
  if (fields.name !== undefined) mapped["Patient Name"] = fields.name;
  if (fields.amount !== undefined) mapped["Amounts"] = parseFloat(fields.amount) || 0;
  if (fields.mode !== undefined) mapped["Mode of Receipt"] = fields.mode;
  if (fields.receiptDate !== undefined) mapped["Date of receipt"] = fields.receiptDate || null;
  if (fields.txnNo !== undefined) mapped["Transaction Number"] = fields.txnNo || "";
  if (fields.billClosed !== undefined) mapped["Bill Closed Date"] = fields.billClosed || null;
  return mapped;
};

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const { fields } = await req.json();
    const res = await fetch(`${URL_BASE}/${id}`, {
      method: "PATCH",
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

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const res = await fetch(`${URL_BASE}/${id}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    if (!res.ok) {
      const err = await res.json();
      return Response.json({ error: err }, { status: res.status });
    }
    return Response.json({ deleted: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
