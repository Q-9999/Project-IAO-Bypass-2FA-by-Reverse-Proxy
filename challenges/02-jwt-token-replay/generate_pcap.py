import os
import json
import base64
from scapy.all import IP, TCP, wrpcap

def build_challenge_02():
    challenge_dir = "/home/kali/Project_IAO202/challenges/02-jwt-token-replay"
    dist_dir = os.path.join(challenge_dir, "distfiles")
    os.makedirs(dist_dir, exist_ok=True)

    flag = "MMQ{JWT_r3fr3sh_t0k3n_r2pl4y_3sc4l4t10n_2026}"
    with open(os.path.join(challenge_dir, "flag.txt"), "w") as f:
        f.write(flag + "\n")

    # 1. Create SIEM Alerts JSON
    siem_logs = [
        {
            "timestamp": "2026-10-12T09:15:32Z",
            "event_id": "SEC-4011",
            "alert_name": "High Risk Sign-In via Unmanaged Proxy",
            "user_principal": "lan.hieu@mmq.khanh",
            "ip_address": "104.28.19.42",
            "geo_location": "Frankfurt, Germany",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0",
            "risk_level": "Medium",
            "details": "User authenticated successfully with password and MFA (TOTP). Sign-in originated from suspected hosting IP."
        },
        {
            "timestamp": "2026-10-12T09:35:10Z",
            "event_id": "SEC-4099",
            "alert_name": "Impossible Travel & Refresh Token Replay",
            "user_principal": "lan.hieu@mmq.khanh",
            "ip_address": "194.26.29.112",
            "geo_location": "Moscow, Russia",
            "user_agent": "Go-http-client/1.1",
            "risk_level": "High",
            "details": "Refresh token RT_MMQ_REFRESH_9381024_AITM_STOLEN issued to 104.28.19.42 was replayed to request elevated scope: Vault.Admin.Export."
        }
    ]
    with open(os.path.join(dist_dir, "siem_alerts.json"), "w") as f:
        json.dump(siem_logs, f, indent=2)

    # 2. Build TCP conversation generator
    def make_tcp_stream(src_ip, dst_ip, sport, dport, exchanges, start_time):
        pkts = []
        t = start_time
        s_seq = 300000
        d_seq = 600000

        # SYN, SYN-ACK, ACK
        p = IP(src=src_ip, dst=dst_ip) / TCP(sport=sport, dport=dport, flags="S", seq=s_seq)
        p.time = t
        pkts.append(p)
        t += 0.01

        p = IP(src=dst_ip, dst=src_ip) / TCP(sport=dport, dport=sport, flags="SA", seq=d_seq, ack=s_seq + 1)
        p.time = t
        pkts.append(p)
        t += 0.01

        s_seq += 1
        d_seq += 1

        p = IP(src=src_ip, dst=dst_ip) / TCP(sport=sport, dport=dport, flags="A", seq=s_seq, ack=d_seq)
        p.time = t
        pkts.append(p)
        t += 0.01

        for req_bytes, resp_bytes in exchanges:
            # Client Request
            p = IP(src=src_ip, dst=dst_ip) / TCP(sport=sport, dport=dport, flags="PA", seq=s_seq, ack=d_seq) / req_bytes
            p.time = t
            pkts.append(p)
            s_seq += len(req_bytes)
            t += 0.02

            # Server ACK
            p = IP(src=dst_ip, dst=src_ip) / TCP(sport=dport, dport=sport, flags="A", seq=d_seq, ack=s_seq)
            p.time = t
            pkts.append(p)
            t += 0.03

            # Server Response
            p = IP(src=dst_ip, dst=src_ip) / TCP(sport=dport, dport=sport, flags="PA", seq=d_seq, ack=s_seq) / resp_bytes
            p.time = t
            pkts.append(p)
            d_seq += len(resp_bytes)
            t += 0.02

            # Client ACK
            p = IP(src=src_ip, dst=dst_ip) / TCP(sport=sport, dport=dport, flags="A", seq=s_seq, ack=d_seq)
            p.time = t
            pkts.append(p)
            t += 0.05

        # FIN Handshake
        p = IP(src=src_ip, dst=dst_ip) / TCP(sport=sport, dport=dport, flags="FA", seq=s_seq, ack=d_seq)
        p.time = t
        pkts.append(p)
        s_seq += 1
        t += 0.01

        p = IP(src=dst_ip, dst=src_ip) / TCP(sport=dport, dport=sport, flags="FA", seq=d_seq, ack=s_seq)
        p.time = t
        pkts.append(p)
        d_seq += 1
        t += 0.01

        p = IP(src=src_ip, dst=dst_ip) / TCP(sport=sport, dport=dport, flags="A", seq=s_seq, ack=d_seq)
        p.time = t
        pkts.append(p)

        return pkts

    # Stream 1: Victim <-> Proxy OAuth Flow
    req1 = (
        b"POST /oauth/v2.0/token HTTP/1.1\r\n"
        b"Host: auth-proxy.mmq-idp.cloud\r\n"
        b"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0\r\n"
        b"Content-Type: application/x-www-form-urlencoded\r\n"
        b"Content-Length: 79\r\n\r\n"
        b"grant_type=authorization_code&code=AUTH_CODE_SECURE_98124&client_id=mmq-portal-app"
    )
    resp1_json = json.dumps({
        "token_type": "Bearer",
        "scope": "Mail.Read Files.Read",
        "expires_in": 3600,
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsYW4uaGlldUBtbXEua2hhbmgteCIsImF1ZCI6Im1tcS1wb3J0YWwiLCJhbXIiOlsicHdkIiwibWZhIl0sInJvbGUiOiJzdGFmZiJ9.sigA",
        "refresh_token": "RT_MMQ_REFRESH_9381024_AITM_STOLEN"
    }).encode()
    resp1 = (
        b"HTTP/1.1 200 OK\r\n"
        b"Server: nginx/1.24.0\r\n"
        b"Content-Type: application/json\r\n"
        + f"Content-Length: {len(resp1_json)}\r\n\r\n".encode()
        + resp1_json
    )
    stream1 = make_tcp_stream("192.168.1.110", "104.28.19.42", 53210, 80, [(req1, resp1)], start_time=1792143000.0)

    # Stream 2: Attacker (194.26.29.112) replays refresh token to escalate privileges
    req2_body = b"grant_type=refresh_token&refresh_token=RT_MMQ_REFRESH_9381024_AITM_STOLEN&scope=Vault.Admin.Export"
    req2 = (
        b"POST /oauth/v2.0/token HTTP/1.1\r\n"
        b"Host: auth.identity.mmq.corp\r\n"
        b"User-Agent: Go-http-client/1.1\r\n"
        b"Content-Type: application/x-www-form-urlencoded\r\n"
        + f"Content-Length: {len(req2_body)}\r\n\r\n".encode()
        + req2_body
    )
    resp2_json = json.dumps({
        "token_type": "Bearer",
        "scope": "Vault.Admin.Export",
        "expires_in": 3600,
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsYW4uaGlldUBtbXEua2hhbmgteCIsImF1ZCI6Im1tcS12YXVsdCIsInNjcCI6WyJWYXVsdC5BZG1pbi5FeHBvcnQiXSwicm9sZSI6IlNlY3VyaXR5QWRtaW4ifQ.sigB"
    }).encode()
    resp2 = (
        b"HTTP/1.1 200 OK\r\n"
        b"Server: MMQ-Identity/3.1\r\n"
        b"Content-Type: application/json\r\n"
        + f"Content-Length: {len(resp2_json)}\r\n\r\n".encode()
        + resp2_json
    )

    # Stream 3: Attacker calls internal vault API using escalated token
    req3 = (
        b"POST /api/v2/vault/export-data HTTP/1.1\r\n"
        b"Host: vault.mmq.corp\r\n"
        b"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsYW4uaGlldUBtbXEua2hhbmgteCIsImF1ZCI6Im1tcS12YXVsdCIsInNjcCI6WyJWYXVsdC5BZG1pbi5FeHBvcnQiXSwicm9sZSI6IlNlY3VyaXR5QWRtaW4ifQ.sigB\r\n"
        b"User-Agent: Go-http-client/1.1\r\n"
        b"Content-Length: 0\r\n\r\n"
    )
    flag_b64 = base64.b64encode(flag.encode()).decode()
    resp3_json = json.dumps({
        "status": "success",
        "operation": "Full_Vault_Audit_Dump",
        "record_count": 1420,
        "encrypted_export_payload": flag_b64
    }).encode()
    resp3 = (
        b"HTTP/1.1 200 OK\r\n"
        b"Server: MMQ-VaultService/2.0\r\n"
        b"Content-Type: application/json\r\n"
        + f"Content-Length: {len(resp3_json)}\r\n\r\n".encode()
        + resp3_json
    )

    stream2 = make_tcp_stream("194.26.29.112", "20.190.159.23", 48122, 80, [(req2, resp2), (req3, resp3)], start_time=1792144200.0)

    pcap_path = os.path.join(dist_dir, "audit_trace.pcap")
    all_pkts = stream1 + stream2
    wrpcap(pcap_path, all_pkts)
    print(f"Generated Challenge 2: {pcap_path} ({len(all_pkts)} packets)")

if __name__ == "__main__":
    build_challenge_02()
