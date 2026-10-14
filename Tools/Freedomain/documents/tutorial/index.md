# The FreeDomain Learning Guide

This book is organized into two clearly separated categories:

1. **DigitalPlat FreeDomain Guide** — product-specific account, registration, external nameserver delegation, status, renewal, and policy instructions.
2. **General Domain and Website Textbook** — internet foundations, external DNS records, web development, deployment, HTTPS, email, operations, and advanced engineering.

DigitalPlat delegates registered domains to external authoritative nameservers. It does not provide an ordinary DNS record editor. All `A`, `AAAA`, `CNAME`, `MX`, `TXT`, and other zone-record tutorials belong to the external DNS category.

Read the [Book Plan](./BOOK_PLAN.md) for scope and editorial rules.

## Category A: DigitalPlat FreeDomain Guide

1. [About the FreeDomain Project](./platform/project-overview.md)
2. [Dashboard Tour](./platform/dashboard-tour.md)
3. [What DigitalPlat Does](./platform/1.0-product-boundaries.md)
4. [Create a DigitalPlat Account](./platform/1.1-account-registration.md)
5. [Register a FreeDomain Name](./platform/1.2-domain-registration.md)
6. [Connect External Nameservers](./platform/1.3-connect-nameservers.md)
7. [Check Status and Renew](./platform/1.4-status-and-renewal.md)
8. [Manage Account Data and Policies](./platform/1.5-account-and-policies.md)
9. [Use the API Safely](./platform/1.6-api-overview.md)

[Category A overview](./platform/index.md)

## Category B: General Domain and Website Textbook

### Part 0: Prepare to Learn

1. [How to Use This Book](./foundations/0.1-how-to-use-this-book.md)
2. [How the Internet Moves Data](./foundations/0.2-internet-foundations.md)
3. [Terminal and File Basics](./foundations/0.3-terminal-basics.md)
4. [Build a Safe Practice Environment](./foundations/0.4-practice-environment.md)
5. [Plan Your First Website](./foundations/0.5-plan-your-site.md)
6. [Domain and DNS Fundamentals](./foundations/0.6-domain-and-dns.md)

[Part 0 overview](./foundations/index.md)

### Part 2: Learn External DNS

1. [Delegation and External Nameservers](./dns/2.0-delegation.md)
2. [DNS Record Types](./dns/2.1-record-types.md)
3. [Root Domains and Subdomains](./dns/2.2-subdomains.md)
4. [TTL, Caching, and Propagation](./dns/2.3-ttl-and-propagation.md)
5. [DNS Troubleshooting](./dns/2.4-troubleshooting.md)

[Part 2 overview](./dns/index.md)

### Part 3: Build and Publish a Website

1. [HTML and CSS Foundations](./website/3.0-html-css-foundations.md)
2. [How a Website Request Works](./website/3.1-how-websites-work.md)
3. [Build a Static Website](./website/3.2-build-static-site.md)
4. [Test the Website Locally](./website/3.3-test-locally.md)
5. [Prepare a Linux Web Server](./website/3.4-prepare-server.md)
6. [Deploy and Connect the Domain](./website/3.5-deploy-and-connect.md)
7. [Enable and Verify HTTPS](./website/3.6-https.md)
8. [Dynamic Applications and Reverse Proxies](./website/3.7-dynamic-applications.md)
9. [Accessibility and Search Basics](./website/3.8-accessibility-and-search.md)
10. [Performance and Caching](./website/3.9-performance-and-caching.md)

[Part 3 overview](./website/index.md)

### Part 4: Email and Service Records

1. [Email DNS: MX, SPF, DKIM, and DMARC](./email/4.1-email-dns.md)
2. [Verification and Service Records](./email/4.2-service-records.md)

[Part 4 overview](./email/index.md)

### Part 5: Operate and Protect the Domain

1. [Infrastructure Inventory and Change Management](./operations/5.1-domain-management.md)
2. [Renewal and Expiration](./operations/5.2-renewal-and-expiration.md)
3. [Migrate Nameservers Safely](./operations/5.3-migrate-nameservers.md)
4. [Registration Data and Privacy](./operations/5.4-registration-data.md)
5. [Account and API Security](./operations/5.5-security.md)
6. [Acceptable Use and Abuse Response](./operations/5.6-acceptable-use.md)
7. [Backups and Restoration](./operations/5.7-backups-and-restoration.md)
8. [Monitoring and Incident Response](./operations/5.8-monitoring-and-incidents.md)
9. [Server Hardening and Maintenance](./operations/5.9-server-hardening.md)

[Part 5 overview](./operations/index.md)

### Part 6: Advanced Architecture and Reference

1. [API Automation Safety](./advanced/6.1-api-automation.md)
2. [Self-Hosted Authoritative DNS](./advanced/6.2-self-hosted-dns.md)
3. [Command Reference](./advanced/6.3-command-reference.md)
4. [Website Architecture Patterns](./advanced/6.4-architecture-patterns.md)
5. [Reliability and Capacity Planning](./advanced/6.5-reliability-and-capacity.md)
6. [Glossary](./advanced/glossary.md)
7. [Standards and Further Reading](./advanced/references.md)

[Part 6 overview](./advanced/index.md)

## Part 7: Integrated Capstone Project

1. [Project Brief and Architecture](./capstone/7.1-project-brief.md)
2. [Build and Test the Site](./capstone/7.2-build-and-test.md)
3. [Register, Deploy, and Connect](./capstone/7.3-register-and-deploy.md)
4. [Secure, Monitor, and Back Up](./capstone/7.4-secure-and-operate.md)
5. [Final Acceptance and Handover](./capstone/7.5-final-acceptance.md)

[Part 7 overview](./capstone/index.md)

The capstone is the only integrated section: DigitalPlat handles registration and external NS delegation, the external DNS service handles zone records, and the web server handles HTTP and HTTPS.

## Appendices and Workbook

1. [Workbook and Practice Exercises](./appendices/workbook.md)
2. [Suggested Answers](./appendices/answers.md)
3. [Troubleshooting Decision Trees](./appendices/troubleshooting-trees.md)
4. [Checklists and Templates](./appendices/checklists-and-templates.md)

[Appendices overview](./appendices/index.md)

## Quick Paths

### I only need to connect a DigitalPlat domain to external DNS

1. [What DigitalPlat Does](./platform/1.0-product-boundaries.md)
2. [Connect External Nameservers](./platform/1.3-connect-nameservers.md)
3. [Delegation and External Nameservers](./dns/2.0-delegation.md)

### My delegated domain has no website record

1. [DNS Record Types](./dns/2.1-record-types.md)
2. [DNS Troubleshooting](./dns/2.4-troubleshooting.md)
3. [Troubleshooting Decision Trees](./appendices/troubleshooting-trees.md)

### I want to publish my first website

1. [Plan Your First Website](./foundations/0.5-plan-your-site.md)
2. [Build a Static Website](./website/3.2-build-static-site.md)
3. [Deploy and Connect the Domain](./website/3.5-deploy-and-connect.md)
4. [Enable and Verify HTTPS](./website/3.6-https.md)

### I want the complete course

Start with [Category A](./platform/index.md), continue through [Part 0](./foundations/index.md), and finish the [Capstone](./capstone/index.md) and [Workbook](./appendices/workbook.md).

## Safety Rules

- Replace fictional domains and documentation IP addresses before real deployment.
- Never publish passwords, tokens, private keys, cookies, recovery codes, or personal registration data.
- Read current product notices and policies before registration, renewal, payment, or account changes.
- Manage ordinary DNS records only in the external authoritative DNS service.
- Back up current values and define rollback before DNS, server, or nameserver changes.
- Evaluate third-party DNS, hosting, email, and certificate services independently.
