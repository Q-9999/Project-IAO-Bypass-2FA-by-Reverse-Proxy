# Checklists and Templates

Copy these into a private project notebook and adapt them. A checklist supports judgment; it does not replace understanding.

## Domain Registration Checklist

```markdown
- [ ] Current Dashboard notices read
- [ ] Exact label reviewed
- [ ] Exact suffix reviewed
- [ ] External DNS zone created
- [ ] Complete assigned nameserver set copied
- [ ] Applicable policies read
- [ ] Slot or charge reviewed
- [ ] Registration data accurate
- [ ] Final complete domain reviewed
- [ ] Result confirmed in Domain List
- [ ] Expiration date recorded
```

## External Nameserver Checklist

```markdown
- [ ] Zone spelling matches the registered domain
- [ ] All assigned NS hostnames recorded
- [ ] No server IP entered as an NS hostname
- [ ] Registration-level nameservers saved
- [ ] dig NS returns intended values
- [ ] Every external authoritative server answers SOA
- [ ] Ordinary DNS records are managed only in the external zone
```

## DNS Change Template

```markdown
# DNS Change

- Date and time in UTC:
- Operator:
- Domain and record name:
- Record type:
- Current value:
- Current TTL:
- Intended value:
- Reason:
- Authoritative verification command:
- Recursive verification command:
- Rollback value:
- Rollback decision time:
- Result:
```

## Website Deployment Checklist

```markdown
- [ ] Local tests pass
- [ ] Staged files reviewed
- [ ] Backup created and readable
- [ ] Destination path verified
- [ ] Private notes and secrets excluded
- [ ] Server configuration test passes
- [ ] Health check passes before DNS change
- [ ] Deployment revision recorded
- [ ] HTTP status verified
- [ ] HTTPS status verified
- [ ] Monitoring observes the new version
- [ ] Rollback window closed intentionally
```

## Certificate Checklist

```markdown
- [ ] DNS reaches intended server
- [ ] IPv4 tested
- [ ] IPv6 tested or absent
- [ ] Required validation path reachable
- [ ] Requested hostname list reviewed
- [ ] CAA compatibility reviewed when CAA is used
- [ ] Private key protected
- [ ] Certificate names verified
- [ ] Validity dates verified
- [ ] HTTP redirect tested
- [ ] Renewal dry run succeeds
- [ ] Independent expiration alert exists
```

## Monthly Operations Checklist

```markdown
- [ ] Domain expiration and renewal owner checked
- [ ] Delegated nameservers unchanged or approved
- [ ] Important DNS records unchanged or approved
- [ ] Website monitor healthy
- [ ] Certificate renewal healthy
- [ ] Backup jobs healthy
- [ ] Restoration drill current
- [ ] Disk space acceptable
- [ ] Security updates reviewed
- [ ] Listening ports reviewed
- [ ] Old accounts and API keys removed
- [ ] Abandoned DNS records removed after ownership review
- [ ] Runbook and contacts current
```

## Incident Timeline Template

```markdown
# Incident

## Summary

## User Impact

## Detection

## Timeline in UTC

- 00:00 - Event

## Evidence Preserved

## Containment

## Recovery

## Verification

## Root Cause

## Contributing Conditions

## Corrective Actions

| Action | Owner | Due date | Verification |
| --- | --- | --- | --- |
```

## Architecture Decision Template

```markdown
# Decision Title

## Status
Proposed / Accepted / Superseded

## Context

## Options Considered

## Decision

## Consequences

## Security and Privacy Impact

## Operational Impact

## Revisit When
```

## Service Inventory Template

```markdown
# Service Inventory

| Component | Account owner | Technical owner | Recovery owner | Renewal or update date |
| --- | --- | --- | --- | --- |
| Registration | | | | |
| External DNS | | | | |
| Web server | | | | |
| Certificate | | | | |
| Email | | | | |
| Monitoring | | | | |
| Backups | | | | |
```

## Handover Acceptance

```markdown
- [ ] Another authorized operator can find the expiration date
- [ ] Another operator can identify expected nameservers
- [ ] Deployment and rollback are documented
- [ ] Certificate renewal is documented
- [ ] Backup restoration has evidence
- [ ] Alerts have primary and backup owners
- [ ] Incident contacts are current
- [ ] Credentials are stored outside the runbook
```
