# Workbook and Practice Exercises

Write answers in a separate notebook. Use fictional values unless an exercise explicitly belongs to your authorized project.

## Progress Tracker

```markdown
- [ ] Category A: DigitalPlat FreeDomain Guide
- [ ] Part 0: Prepare to Learn
- [ ] Part 2: Learn DNS
- [ ] Part 3: Build and Publish a Website
- [ ] Part 4: Email and Service Records
- [ ] Part 5: Operate the Domain
- [ ] Part 6: Advanced Reference
- [ ] Part 7: Capstone Project
```

## Category A Exercises

### A1: Product boundary

Classify each task:

1. Register `example.dpdns.org`.
2. Submit external nameserver hostnames.
3. Create an `A` record.
4. Add an MX record.
5. Upload website files.
6. Renew the domain.
7. Redirect HTTP to HTTPS.

Use these categories: DigitalPlat, external DNS, web server.

### A2: Nameserver validation

Given:

```text
Assigned NS: ns1.dns-service.example
Assigned NS: ns2.dns-service.example
Server IP:   192.0.2.10
Resolver IP: 203.0.113.53
```

Which values belong in the DigitalPlat nameserver fields, and why?

### A3: Registration stop condition

The Dashboard shows a different suffix and an unexpected charge immediately before submission. Write the safe next action.

## Part 0 Exercises

### B1: Map a request

Draw the path from a browser entering `https://www.example.dpdns.org/about.html` to the HTML response. Label registration, recursive DNS, authoritative DNS, TCP or QUIC, TLS, HTTP, and the web server.

### B2: Public and private addresses

Explain why `192.168.1.25` normally should not be published as the public website `A` record.

### B3: Terminal safety

For each command, write the question you should answer before running it:

```bash
sudo systemctl reload nginx
rsync -av --delete ./site/ user@server:/var/www/site/
rm -r backups
```

### B4: Definition of done

Write five observable conditions that prove a website is ready. Avoid conditions such as “configuration looks correct.”

## DNS Exercises

### C1: Choose the record type

Select `A`, `AAAA`, `CNAME`, `MX`, or `TXT`:

1. Point the root hostname to an IPv4 address.
2. Alias `www` to the root hostname.
3. Publish a service-verification token.
4. Route inbound email.
5. Publish an IPv6 destination.

### C2: Diagnose delegation

The registration interface lists `ns1.new.example`, but `dig NS` returns `ns1.old.example`. Which layer has not changed for resolvers yet?

### C3: Diagnose an empty answer

`dig NS` works and the authoritative SOA query succeeds, but `dig A www.example.dpdns.org` returns an empty answer. Where should the next investigation occur?

### C4: TTL migration

A record has TTL 86400. An operator lowers it to 300 and changes the IP two minutes later. Explain why many users can still see the old IP for almost a day.

### C5: CNAME conflict

Explain why the following design is invalid or unsafe:

```text
www  CNAME  example.dpdns.org
www  TXT    verification=value
```

## Website Exercises

### D1: HTML semantics

Rewrite a clickable `<div>` used for form submission as an appropriate native element. Explain the keyboard and semantic benefit.

### D2: Local test

Run the static site on `127.0.0.1:8000`. Record the status and content type for Home, About, and CSS.

### D3: Virtual host

DNS points two domains to one IP. Explain how the web server decides which site to return.

### D4: Correct DNS, broken site

The `A` record returns the correct IP, but `curl` times out. List the next four layers or components to test.

### D5: HTTPS

HTTP works. HTTPS presents a certificate for another hostname. Identify what DNS proves and what the certificate failure proves.

### D6: Accessibility

Audit a page using only the keyboard, 200 percent zoom, and a narrow viewport. Record three findings and fixes.

### D7: Performance

Measure a page with `curl`. Identify whether DNS, connection, TLS, first-byte, or transfer time is the largest part. Write one hypothesis and one controlled experiment.

## Email Exercises

### E1: MX preference

Given MX preferences 10 and 20, which is normally attempted first?

### E2: SPF duplication

Two services each tell the user to add a separate `v=spf1` TXT record at the root. Explain the problem and the required planning step.

### E3: DKIM key roles

Which key belongs in DNS, and where must the other key remain?

### E4: DMARC rollout

Why is monitoring legitimate sending sources useful before enforcing rejection?

## Operations Exercises

### F1: Backup quality

A nightly job copies files into another directory on the same server. Identify at least three failures it does not protect against.

### F2: Restore evidence

List the evidence that proves a website backup can actually be restored.

### F3: Incident response

The nameservers change unexpectedly. Write the first five actions in order.

### F4: Renewal ownership

The calendar has an expiration reminder, but no person owns it. Explain why this is incomplete.

### F5: Server hardening

For every listening port, what five facts should be documented?

## Advanced Exercises

### G1: Architecture

Choose a static architecture for a documentation site and a dynamic architecture for an authenticated dashboard. List the additional state and failure boundaries in the dashboard.

### G2: API mutation

Write the safe state sequence around a nameserver-change API request.

### G3: Capacity

A site averages one request per second but receives 500 requests per second after a launch announcement. Explain why average capacity is insufficient and name three resources to observe.

### G4: Self-hosted DNS

Explain why two nameserver processes on the same machine do not provide meaningful infrastructure redundancy.

## Capstone Assessment

Demonstrate without notes:

1. Which product controls delegation.
2. Where ordinary DNS records are edited.
3. How to query parent delegation.
4. How to ask an authoritative server directly.
5. How to test a virtual host before DNS.
6. How to inspect a certificate's hostname and dates.
7. How to verify a backup restoration.
8. How to decide between continued investigation and rollback.

Continue to [Suggested Answers](./answers.md) only after completing the exercises.
