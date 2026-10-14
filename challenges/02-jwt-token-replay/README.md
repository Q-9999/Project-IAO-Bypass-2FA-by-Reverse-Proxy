# [FORENSICS] | Stolen Bearer (350 pts)

**Description:** Following a reverse proxy phishing incident, attackers harvested OAuth 2.0 authorization codes and intercepted JWT tokens. Our SIEM triggered alerts on suspicious token replays originating from an anomalous foreign IP. Investigate the network capture and audit logs to determine the confidential vault payload exfiltrated by the adversary.

**Attachment:** `audit_trace.pcap`, `siem_alerts.json`  
**Flag format:** `MMQ{...}`

---
*Files available in `distfiles/`*
