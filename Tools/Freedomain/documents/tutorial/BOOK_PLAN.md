# FreeDomain Learning Guide Plan

## Goal

Create a book-length English learning path that begins with the DigitalPlat FreeDomain product, then clearly transitions to general domain, DNS, website, email, security, and operations education.

## Category Boundary

### Category A: DigitalPlat FreeDomain

Product-specific chapters cover:

- Account registration
- FreeDomain registration
- Submission of external authoritative nameservers
- Domain status and renewal
- Registration data and policies
- Currently documented account and API areas

DigitalPlat delegates domains to external authoritative nameservers. It does not provide an ordinary DNS record editor. Product chapters must never instruct a reader to create `A`, `AAAA`, `CNAME`, `MX`, `TXT`, or other zone records in DigitalPlat.

### Category B: General Domain and Website Textbook

General chapters cover:

- Internet, terminal, and domain foundations
- External authoritative DNS records and troubleshooting
- HTML, CSS, accessibility, and performance
- Static and dynamic website deployment
- HTTP, HTTPS, reverse proxies, and certificates
- Email-related DNS records
- Backups, monitoring, incidents, and server hardening
- Architecture, automation, and capacity planning

All ordinary DNS record examples belong to the external authoritative DNS service.

### Integrated Capstone

The capstone connects both categories: DigitalPlat registers and delegates the name; external DNS publishes zone records; the web server hosts the site and HTTPS.

## Editorial Principles

- Assume no previous DNS, terminal, server, or web development experience.
- Progress from mental models to local labs, public deployment, and advanced operations.
- Explain the reason before the procedure.
- Use fictional names and documentation IP ranges.
- Keep third-party guidance neutral and avoid guarantees.
- Treat current Dashboard notices, policies, prices, suffixes, limits, and capabilities as authoritative.
- Never expose passwords, keys, contact data, private domains, balances, or unrelated content in screenshots.
- Provide observable verification and rollback for operational changes.
- Include exercises, suggested answers, decision trees, and reusable checklists.

## Book Structure

1. Category A: DigitalPlat FreeDomain Guide
2. Category B, Part 0: Beginner Foundations
3. Part 2: External DNS
4. Part 3: Website Building and Deployment
5. Part 4: Email and Service Records
6. Part 5: Operations and Security
7. Part 6: Advanced Architecture and Reference
8. Part 7: Integrated Capstone Project
9. Appendices: Workbook, Answers, Decision Trees, and Templates

## Completion Standard

The book is complete when a new reader can identify the product boundary, register a domain, delegate it to external nameservers, manage records at the external DNS service, build and deploy an accessible HTTPS site, operate it safely, complete the capstone, and navigate every chapter through README and the book index.
