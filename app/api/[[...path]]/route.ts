const STAPE_DOMAIN = "trimlysgtm.iamharsh.in";

async function proxyToStape(request: Request) {
  const incomingUrl = new URL(request.url);

  // Remove the same-origin prefix
  const pathname = incomingUrl.pathname.replace(/^\/som(?=\/|$)/, "") || "/";

  const targetUrl = new URL(
    `${pathname}${incomingUrl.search}`,
    `https://${STAPE_DOMAIN}`,
  );

  const headers = new Headers(request.headers);

  // Get the original visitor IP
  const forwardedFor = headers.get("x-forwarded-for") || "";
  const clientIp = forwardedFor.split(",")[0].trim() || "unknown";

  // Configure Stape forwarding headers
  headers.set("Host", STAPE_DOMAIN);
  headers.set("X-From-Cdn", "cf-stape");
  headers.set("X-Forwarded-For", clientIp);
  headers.set("CF-Connecting-IP", clientIp);

  // Let fetch calculate the outgoing content length
  headers.delete("content-length");
  headers.delete("connection");

  const method = request.method;

  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body:
      method === "GET" || method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
    redirect: "manual",
  });

  const responseHeaders = new Headers(upstream.headers);

  // Avoid forwarding hop-by-hop or stale body headers
  responseHeaders.delete("connection");
  responseHeaders.delete("transfer-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("content-encoding");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxyToStape;
export const POST = proxyToStape;
export const PUT = proxyToStape;
export const PATCH = proxyToStape;
export const DELETE = proxyToStape;
export const OPTIONS = proxyToStape;
export const HEAD = proxyToStape;
