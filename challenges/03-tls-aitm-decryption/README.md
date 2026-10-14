# [FORENSICS] | The Encrypted Phantom (500 pts)

**Description:** MMQ's SOC intercepted encrypted network traffic from an advanced AiTM reverse proxy attack targeting an executive. Because the phishing proxy operated strictly over HTTPS, the traffic appears opaque. Fortunately, the incident response team recovered the browser SSL keylog from the victim's endpoint. Decrypt the TLS traffic to uncover the stolen session and extract the exfiltrated executive flag.

**Attachment:** `traffic_tls.pcap`, `sslkeylog.log`  
**Flag format:** `MMQ{...}`

---
*Files available in `distfiles/`*
