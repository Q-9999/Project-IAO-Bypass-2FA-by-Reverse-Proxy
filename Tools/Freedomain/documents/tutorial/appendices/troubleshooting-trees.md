# Troubleshooting Decision Trees

Use one tree at a time. Record observations before changing configuration.

## Domain Does Not Resolve

```text
Does Domain List show the expected active registration?
  |-- No -> Fix registration status first.
  `-- Yes
       |
       Does dig NS show the intended external nameservers?
         |-- No -> Check registration-level NS values and cached delegation.
         `-- Yes
              |
              Does each authoritative server answer SOA?
                |-- No -> Fix the external DNS zone or service availability.
                `-- Yes
                     |
                     Does the requested record exist on the authoritative server?
                       |-- No -> Add or correct it in the external DNS zone.
                       `-- Yes -> Compare recursive cache and TTL.
```

## DNS Resolves but Website Times Out

```text
Does the hostname return the intended address?
  |-- No -> Fix external DNS.
  `-- Yes
       |
       Is the server reachable on the network?
         |-- No -> Check routing and server availability.
         `-- Yes
              |
              Is port 80 or 443 listening?
                |-- No -> Start or configure the web server.
                `-- Yes
                     |
                     Do network and host firewalls allow the connection?
                       |-- No -> Apply the reviewed firewall rule.
                       `-- Yes -> Check virtual host, TLS, and application logs.
```

## Wrong Website Appears

```text
Does DNS return the intended server?
  |-- No -> Correct the external DNS record.
  `-- Yes
       |
       Does curl with the Host header return the intended virtual host?
         |-- No -> Fix server_name or virtual-host ordering.
         `-- Yes
              |
              Is a proxy or browser cache serving old content?
                |-- Yes -> Inspect cache headers and purge only the correct cache.
                `-- No -> Check deployment directory and current revision.
```

## HTTPS Fails

```text
Does HTTP reach the intended server?
  |-- No -> Fix DNS, routing, firewall, or web server first.
  `-- Yes
       |
       Is port 443 listening?
         |-- No -> Configure the HTTPS virtual host.
         `-- Yes
              |
              Does the certificate cover the requested hostname?
                |-- No -> Issue or select the correct certificate.
                `-- Yes
                     |
                     Is the certificate current and chain trusted?
                       |-- No -> Repair renewal or chain configuration.
                       `-- Yes -> Check redirect loops, application errors, and mixed content.
```

## `www` Works but Root Fails

```text
Does the root have the intended A or AAAA record in external DNS?
  |-- No -> Create the required external DNS record.
  `-- Yes
       |
       Does the web server accept the root hostname?
         |-- No -> Add it to the virtual host.
         `-- Yes
              |
              Does the certificate cover the root hostname?
                |-- No -> Include it in certificate issuance.
                `-- Yes -> Check canonical redirect configuration.
```

## Only Some Users Fail

```text
Do failing users receive a different DNS answer?
  |-- Yes -> Compare TTL, resolver cache, IPv4, and IPv6.
  `-- No
       |
       Do they use a different protocol path or network?
         |-- Yes -> Test IPv6, proxy, firewall, and regional routing.
         `-- No
              |
              Do they receive different HTTP cache or application content?
                |-- Yes -> Inspect cache keys and headers.
                `-- No -> Collect exact client error and timestamp.
```

## Email Does Not Arrive

```text
Does dig MX return the issued mail exchangers?
  |-- No -> Fix MX records in external DNS.
  `-- Yes
       |
       Do MX target hostnames resolve?
         |-- No -> Fix mail-host address records.
         `-- Yes
              |
              Does the mail system accept the recipient and domain?
                |-- No -> Fix mail-system configuration.
                `-- Yes -> Inspect delivery logs, rejection response, and spam handling.
```

## Deployment Fails

```text
Did configuration validation pass?
  |-- No -> Do not reload; fix or restore configuration.
  `-- Yes
       |
       Does the local application or static directory work?
         |-- No -> Fix deployment files or application process.
         `-- Yes
              |
              Does the public virtual host work?
                |-- No -> Check proxy, permissions, firewall, and logs.
                `-- Yes -> Verify DNS, TLS, and external monitoring.
```

## When to Roll Back

Prefer rollback when:

- User impact is significant.
- A known-good previous state exists.
- Diagnosis will take longer than the acceptable outage.
- The change is the likely cause.
- Rollback does not destroy required evidence or data.

Continue to [Checklists and Templates](./checklists-and-templates.md).
