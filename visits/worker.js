// GET /visits?host=<fqdn>&days=<1..90>  (Authorization: Bearer <VISITS_SECRET>)
// -> { daily: [{day, requests, page_views}], top_countries: [{country, requests}] }

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function sameSecret(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/visits" || request.method !== "GET") return json({ error: "not found" }, 404);
    const auth = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!sameSecret(auth, env.VISITS_SECRET || "")) return json({ error: "unauthorized" }, 401);

    const host = (url.searchParams.get("host") || "").toLowerCase();
    const days = Number(url.searchParams.get("days") || "30");
    if (!/^[a-z0-9.-]{3,253}$/.test(host) || !Number.isInteger(days) || days < 1 || days > 90) {
      return json({ error: "bad host or days" }, 400);
    }
    const since = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);

    const [daily, countries] = await env.VISITS_DB.batch([
      env.VISITS_DB.prepare(
        "SELECT day, requests, page_views FROM visits WHERE host = ?1 AND day >= ?2 ORDER BY day"
      ).bind(host, since),
      env.VISITS_DB.prepare(
        "SELECT country, SUM(requests) AS requests FROM visit_countries WHERE host = ?1 AND day >= ?2 " +
        "GROUP BY country ORDER BY requests DESC LIMIT 5"
      ).bind(host, since),
    ]);
    return json({ daily: daily.results, top_countries: countries.results });
  },
};
