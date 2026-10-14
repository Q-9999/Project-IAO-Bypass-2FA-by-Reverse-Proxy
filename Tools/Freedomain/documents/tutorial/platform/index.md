# Category A: DigitalPlat FreeDomain Guide

This category documents the DigitalPlat FreeDomain product itself. It is intentionally separated from the general DNS and website textbook.

## Current Product Boundary

DigitalPlat registers eligible domain names and delegates them to external authoritative nameservers supplied by the user.

DigitalPlat does not provide a DNS record editor. Records such as `A`, `AAAA`, `CNAME`, `MX`, and `TXT` are created and managed at the external authoritative DNS service, not in the DigitalPlat Dashboard.

The Dashboard is used for account, registration, nameserver delegation, domain status, renewal, registration data, and other features currently shown by the product.

## Chapters

1. [About the FreeDomain Project](./project-overview.md)
2. [Dashboard Tour](./dashboard-tour.md)
3. [What DigitalPlat Does](./1.0-product-boundaries.md)
4. [Create a DigitalPlat Account](./1.1-account-registration.md)
5. [Register a FreeDomain Name](./1.2-domain-registration.md)
6. [Connect External Nameservers](./1.3-connect-nameservers.md)
7. [Check Status and Renew](./1.4-status-and-renewal.md)
8. [Manage Account Data and Policies](./1.5-account-and-policies.md)
9. [Use the API Safely](./1.6-api-overview.md)

## Product Completion Check

Before moving to the general textbook:

- The account can sign in.
- The domain appears in Domain List.
- The external DNS zone exists.
- DigitalPlat delegates the domain to the assigned external nameservers.
- `dig NS` returns the intended nameservers.
- The reader understands that all ordinary DNS records are managed outside DigitalPlat.

Continue to [About the FreeDomain Project](./project-overview.md).
