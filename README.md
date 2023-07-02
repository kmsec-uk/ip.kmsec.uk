# ip.kmsec.uk

This is a simple Cloudflare Worker to return IP metadata and browser headers from your request.

This basically exposes Cloudflare's rich telemetry on your browser request to you, so you can stay in-the-know about your exposure during OSINT and research hunts.

Feel free to run your own instance. It requires a Cloudflare account and the `wrangler` CLI. Publish this with `wrangler publish`
