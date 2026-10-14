# Suggested Answers

These are reasoning guides, not the only acceptable wording.

## Category A

### A1

1. DigitalPlat
2. DigitalPlat
3. External DNS
4. External DNS
5. Web server
6. DigitalPlat
7. Web server

### A2

Enter `ns1.dns-service.example` and `ns2.dns-service.example`. The fields require authoritative nameserver hostnames. The server IP belongs in an external DNS address record, and the resolver IP belongs in client network configuration.

### A3

Stop before submission, return to the name and suffix review, read current pricing or slot information, and continue only after the intended final values are clear.

## Part 0

### B1

The registration layer delegates the domain. A recursive resolver follows delegation to the external authoritative server. DNS returns an address. The browser reaches the server over the network, negotiates transport and TLS, sends an HTTP request containing the hostname and path, and receives HTML.

### B2

`192.168.1.25` is a private IPv4 address. Routers on the public internet do not route it to the owner's private device. Public home hosting requires an intentional public reachability design.

### B3

- Does the Nginx configuration test succeed, and will reload affect production?
- Are both source and destination exact, and should remote-only files really be deleted?
- Is the current directory correct, and is the target backed up?

### B4

Good conditions include verified NS delegation, correct DNS answers, successful canonical HTTPS response, valid certificate names, working page links, successful restoration, and active monitoring.

## DNS

### C1

1. `A`
2. `CNAME`
3. `TXT`
4. `MX`
5. `AAAA`

### C2

The parent delegation still exposes the old nameserver. The registration change may not have been applied or cached delegation has not expired.

### C3

Investigate the external authoritative DNS zone. Delegation and zone authority work, but the requested ordinary record is missing or named incorrectly.

### C4

Resolvers that cached the old answer before the TTL reduction may retain it for the original 86400 seconds. Lowering the TTL does not rewrite existing caches.

### C5

A CNAME owner generally cannot also contain other data. Move verification to the name specified by the service or choose a non-CNAME design.

## Website

### D1

Use `<button type="submit">Submit</button>`. It participates in forms, exposes button semantics, and has native keyboard behavior.

### D2

All three resources should return successful status. HTML pages should return an HTML content type and the stylesheet a CSS content type.

### D3

The HTTP Host header and TLS server name identify the requested hostname. The web server selects the matching virtual host.

### D4

Check routing, listening port, firewalls, web server process, and virtual host configuration. Correct DNS proves only the address lookup.

### D5

DNS proves the hostname reached an address. The certificate failure proves the TLS endpoint is not presenting a certificate valid for that hostname.

### D6

Acceptable answers identify real findings and specific fixes, such as restoring visible focus, correcting heading order, or allowing layout reflow.

### D7

The answer should identify the largest measured phase, propose one cause, change one controlled variable, and repeat comparable measurements.

## Email

### E1

Preference 10 is normally attempted before 20 because lower MX preference values are preferred.

### E2

A name must not publish multiple independent SPF policies. Inventory all legitimate senders and construct one reviewed policy within protocol limits.

### E3

The public key is published in DNS. The private signing key remains protected in the sending mail system.

### E4

Monitoring identifies real senders and alignment failures before an enforcement policy rejects legitimate mail.

## Operations

### F1

It does not protect against disk failure, server deletion, ransomware with the same access, account compromise, physical loss, or many configuration mistakes.

### F2

Evidence includes archive integrity, successful extraction in isolation, correct files and permissions, a working local or test server, application checks, and measured restoration time.

### F3

Confirm independently, record timestamps, secure registration and recovery accounts, preserve current delegation and account evidence, contain unauthorized access, then restore approved nameservers and verify the user path.

### F4

An alert without an owner can be seen by everyone and acted on by no one. Assign a primary and backup responsible person.

### F5

Record the process owner, bind address, port and protocol, purpose, public-access requirement, and update responsibility. Any five that cover identity, exposure, purpose, and ownership are acceptable.

## Advanced

### G1

A static site may need DNS, a web server, files, TLS, and backups. An authenticated dashboard adds application processes, credentials, sessions, database state, migrations, authorization, personal data, and more monitoring.

### G2

Read current state, compare desired state, show the exact change, approve, send one request, read authoritative state again, and record the verified result. Do not retry ambiguity blindly.

### G3

Average traffic hides bursts. Observe concurrent connections, CPU, memory, network, application latency, database capacity, and external limits.

### G4

Both processes share one machine, power source, network path, operating system, and administrative failure boundary. A single failure removes both.

Return to [Troubleshooting Decision Trees](./troubleshooting-trees.md).
