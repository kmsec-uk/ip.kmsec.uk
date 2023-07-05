const start_html = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>View the IP, headers, and geolocation of your browser request</title>
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="canonical"
        href="https://ip.kmsec.uk" />
	<link rel="stylesheet" href="https://unpkg.com/@picocss/pico@latest/css/pico.min.css" />
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0">
    <meta property="og:type" content="website" />
    <meta property="og:url"
        content="https://ip.kmsec.uk" />
    <meta property="og:site_name" content="View the IP, headers, and geolocation of your browser request" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:domain" content="ip.kmsec.uk" />
    <meta name="twitter:title" property="og:title" itemprop="name"
        content="View the IP, headers, and geolocation of your browser request" />
    <meta name="twitter:description" property="og:description" itemprop="description"
        content="View the headers, IP, country and geolocation of your browser request" />
	<style>
		body {
			padding: 20px;
		}
		kbd {
			word-break: break-all
		}
		table {
			table-layout: fixed;
			width: 100%;
		}
		div.grid > div {
			border: 1px solid #ececec;
			padding: 5px;
			border-radius: 5px;
		}
	</style>
</head>

<body>
<h1>View the IP, headers, and geolocation of your browser request</h1>
<hr>
`

const end_html = `   
<!--end-grid-->
</div>
<article>
  <header><h2>Built with Cloudflare workers</h2></header>
  <p>This is build with Cloudflare Workers, so all telemetry you see is what Cloudflare sees.</p>
  <p>You can view all the telemetry (including what isn't shown here) in JSON format by appending <a href="/?json">?json</a> to the request</p>  
  <footer>
  	<sub>kmsec.uk - source on <a href="https://github.com/kmsec-uk/ip.kmsec.uk">Github</a><br>
	Styled with <a href="https://picocss.com/">PicoCSS</a>
	</sub>
  </footer>
</article>
</body>
</html>`

export default {
	async fetch(request: Request, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url)
		if ( request.method !== 'GET') {
			return new Response('Forbidden', {
				status: 403
			})
		}
		// Rudimentary anti-xss
		const re = new RegExp(/(<|>|script)/, 'i');
		var xss_signal = false
		request.headers.forEach((value) => {
			if (value.search(re) !== -1) {
				console.log(value + ' matched for XSS detection')
				xss_signal = true
			}
		})
		if (xss_signal == true) {
			return new Response('Anti-XSS detection', {
				status: 403
			})
		}
		// Routing
		switch (url.pathname) {
			case '/favicon.ico':
				return new Response('', {
					status: 200
				})
			case '/':
				// Respond with raw JSON if requested
				if (url.search == '?json') {
					const test = JSON.stringify(request.cf, null, 4)
					const test2 = JSON.stringify(Object.fromEntries([...request.headers]), null, 4);
					return new Response(test + test2, {
						status: 200,
						headers: {
							'content-type': 'text/plain'
						}
					});
				// Respond with HTML document
				} else {
					// Start banner
					const start_banner = `
					<div><h2>Your IP is <mark>
					`
				
					
					// Placeholder
					var remote_ip = ''
					
					// End banner
					const end_banner = `
					</mark>
					</h2>
					</div>
					<!--begin-grid-->
					<div class="grid">
					`
					// List out headers
					const header_array = [`
					<div>
					<h3>Headers</h3>
					<p>Headers starting with <code>cf-*</code>, <code>x-real-ip</code>, and <code>x-forwarded-proto</code> are added to the request at the Cloudflare Edge. For completeness' sake, all headers are displayed here indiscriminately.<p>
					<table role="grid">
					<thead>
					<tr>
					<th><strong>Header</strong></th>
					<th><strong>Value</strong></th>
					</tr>
					</thead>
					<tbody>`]
					request.headers.forEach((value, key) => {
						header_array.push('<tr>\n<td>' + key + '</td>\n<td><kbd>' + value + '</kbd></td>\n</tr>')
						if (key == 'cf-connecting-ip') {
							remote_ip = value
						}
					})
					header_array.push(`</tbody>\n</table>\n</div>`)
					// console.log(header_array.toString())
					const full_header_table = header_array.toString().replaceAll('>,<', '>\n<')
					// console.log(full_header_table)

					// List out Cloudflare telemetry
					const cf_props = new Map()
					const cf_props_array = [`
					<div>
					<h3>Request properties</h3>
					<p>Request properties identified by Cloudflare.</p>
					<table role="grid">
					<thead>
					<tr>
					<th><strong>Propery</strong></th>
					<th><strong>Value</strong></th>
					</tr>
					</thead>
					<tbody>`]
					cf_props.set('City', request.cf?.city)
					cf_props.set('Post-Code', request.cf?.postalCode)
					cf_props.set('Country', request.cf?.country)
					cf_props.set('ASN', request.cf?.asn)
					cf_props.set('ASN Organisation', request.cf?.asOrganization)
					cf_props.set('Longitude', request.cf?.longitude)
					cf_props.set('Latitude', request.cf?.latitude)
					cf_props.forEach((value, key) => {
						// console.log(key, value)
						cf_props_array.push('<tr>\n<td>' + key + '</td>\n<td><kbd>' + value + '</kbd></td>\n</tr>')

					})
					cf_props_array.push(`</tbody>\n</table>\n</div>`)
					// console.log(cf_props_array.toString())
					const full_cf_table = cf_props_array.toString().replaceAll('>,<', '>\n<')
					// console.log(full_cf_table)

					return new Response(start_html + start_banner + remote_ip + end_banner +  full_header_table + full_cf_table + end_html, {
						status: 200,
						headers: {
							'content-type': 'text/html'
						}
					})
				}
				break
			default:
				return new Response('Forbidden', {
					status: 403
				})
			
		}
		

	},
};