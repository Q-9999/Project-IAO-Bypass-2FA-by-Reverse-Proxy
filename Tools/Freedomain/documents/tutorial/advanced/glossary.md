# Glossary

## A record

A DNS record that maps a name to an IPv4 address.

## AAAA record

A DNS record that maps a name to an IPv6 address.

## ACME

A protocol for automating certificate issuance, validation, and renewal.

## Authoritative nameserver

A DNS server that publishes official data for a zone.

## CAA

A DNS record that restricts certificate authority issuance for a name.

## CNAME

A DNS record that aliases one hostname to another canonical hostname.

## Delegation

The parent-zone records that identify the authoritative nameservers for a child zone.

## DKIM

An email authentication method that uses a domain-published public key to validate message signatures.

## DMARC

An email policy and reporting mechanism based on SPF or DKIM authentication alignment with the visible From domain.

## DNS

The distributed naming system that connects domain names to typed resource records.

## Domain

A name in the DNS hierarchy. In this book, it often means a registered name that has been delegated to external authoritative nameservers.

## Glue record

An address record supplied by a parent zone when it is needed to reach an in-zone nameserver.

## HTTP

The application protocol used to request and deliver web resources.

## HTTPS

HTTP carried over TLS, providing transport encryption and server authentication.

## MX record

A DNS record that identifies mail exchangers for a domain.

## Namespace

A managed naming area or suffix under which names may be registered.

## NS record

A DNS record that identifies an authoritative nameserver.

## Proxy

A system that receives traffic and forwards it to another service. It changes the network path and can affect logging, certificates, security, and policy.

## RDAP

A structured protocol for accessing registration data.

## Recursive resolver

A DNS server that follows referrals and caches answers for clients.

## Registrant

The person or organization that registers and is responsible for a domain.

## Registrar or registration service

The system through which a registrant creates and manages a domain registration.

## SOA record

The DNS record containing core authority and timing information for a zone.

## SPF

An email authorization policy describing which systems may send using a domain in the SMTP envelope.

## SRV record

A DNS record that identifies the hostname and port for a named service.

## Subdomain

A name below another domain, such as `www.example.dpdns.org`.

## TLS

The protocol that protects HTTPS and other network connections with encryption and authentication.

## TTL

Time to Live, the maximum caching lifetime advertised with a DNS record.

## TXT record

A DNS record containing text, commonly used for verification and email policy.

## Virtual host

A web server configuration that selects a site based on the requested hostname.

## WHOIS

A legacy registration data lookup protocol and a general term still used for domain registration information.

## Zone

The portion of the DNS namespace published as one administrative unit by authoritative nameservers.

Continue to [Standards and Further Reading](./references.md).
