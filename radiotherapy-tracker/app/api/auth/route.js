const TOKEN = process.env.AIRTABLE_ACCESS_TOKEN;
const BASE = process.env.AIRTABLE_BASE_ID;
const USERS_TABLE = process.env.AIRTABLE_USERS_TABLE_ID;
const URL_BASE = `https://api.airtable.com/v0/${BASE}/${USERS_TABLE}`;
const HEADERS = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return Response.json({ error: "Username and password required" }, { status: 400 });
    }

    const filterFormula = encodeURIComponent(`AND({Username}='${username}',{Password}='${password}')`);
    const res = await fetch(`${URL_BASE}?filterByFormula=${filterFormula}`, {
      headers: HEADERS,
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json({ error: "Authentication service error" }, { status: 500 });
    }

    const data = await res.json();
    if (data.records && data.records.length > 0) {
      const user = data.records[0];
      return Response.json({
        success: true,
        name: user.fields["Name"] || "",
        username: user.fields["Username"] || "",
        role: (user.fields["Role"] || "team").toLowerCase(),
      });
    }

    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
