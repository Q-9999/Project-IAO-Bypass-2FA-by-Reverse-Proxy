# Part 2: Learn DNS

DNS records connect the domain to websites, email systems, verification services, and other network resources.

## Chapters

1. [Delegation and External Nameservers](./2.0-delegation.md)
2. [DNS Record Types](./2.1-record-types.md)
3. [Root Domains and Subdomains](./2.2-subdomains.md)
4. [TTL, Caching, and Propagation](./2.3-ttl-and-propagation.md)
5. [DNS Troubleshooting](./2.4-troubleshooting.md)

## Working Rule

Make one DNS change at a time, record the previous value, wait for the authoritative answer to update, and verify the result before changing another layer.

All record-editing examples in this category are performed at the external authoritative DNS service, not at the registration platform.

Continue to [Delegation and External Nameservers](./2.0-delegation.md).
