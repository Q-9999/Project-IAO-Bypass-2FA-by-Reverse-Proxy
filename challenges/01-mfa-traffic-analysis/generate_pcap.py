import os
import subprocess
from scapy.all import IP, TCP, wrpcap

def build_challenge():
    output_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(output_dir, "distfiles")
    os.makedirs(dist_dir, exist_ok=True)

    # 1. Create flag.txt and encrypt into confidential_report.zip
    flag_content = "MMQ{4iTM_r3v3rs3_pr0xy_s3ss10n_th3ft_d3f34t3d_2026}\n"
    victim_password = "LanHieu@2026#Sec"
    
    with open(os.path.join(output_dir, "flag.txt"), "w") as f:
        f.write(flag_content)

    temp_flag_path = "/tmp/flag_export.txt"
    temp_zip_path = "/tmp/confidential_report.zip"
    if os.path.exists(temp_flag_path):
        os.remove(temp_flag_path)
    if os.path.exists(temp_zip_path):
        os.remove(temp_zip_path)

    with open(temp_flag_path, "w") as f:
        f.write(flag_content)

    subprocess.run(
        ["zip", "-j", "-P", victim_password, temp_zip_path, temp_flag_path],
        check=True
    )

    with open(temp_zip_path, "rb") as f:
        zip_data = f.read()

    # 2. Build network packets
    def make_tcp_stream(src_ip, dst_ip, sport, dport, exchanges, start_time):
        pkts = []
        t = start_time
        s_seq = 105000
        d_seq = 205000

        # SYN
        p = IP(src=src_ip, dst=dst_ip) / TCP(sport=sport, dport=dport, flags="S", seq=s_seq)
        p.time = t
        pkts.append(p)
        t += 0.01

        # SYN-ACK
        p = IP(src=dst_ip, dst=src_ip) / TCP(sport=dport, dport=sport, flags="SA", seq=d_seq, ack=s_seq + 1)
        p.time = t
        pkts.append(p)
        t += 0.01

        s_seq += 1
        d_seq += 1

        # ACK
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

    # Stream 1: Victim <-> AiTM Reverse Proxy (104.21.45.18)
    # Step 1: GET /login
    req1 = (
        b"GET /login HTTP/1.1\r\n"
        b"Host: auth-portal.mmq-corp.cloud\r\n"
        b"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0\r\n"
        b"Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n"
        b"Connection: keep-alive\r\n\r\n"
    )
    resp1_body = (
        b"<!DOCTYPE html><html><head><title>MMQ Single Sign-On</title></head>"
        b"<body><h2>Welcome to MMQ Secure Employee Portal</h2>"
        b"<form action=\"/login\" method=\"POST\">"
        b"<input name=\"username\" type=\"text\" placeholder=\"Email\"/>"
        b"<input name=\"password\" type=\"password\" placeholder=\"Password\"/>"
        b"<button type=\"submit\">Next</button></form></body></html>"
    )
    resp1 = (
        b"HTTP/1.1 200 OK\r\n"
        b"Server: nginx/1.24.0\r\n"
        b"Content-Type: text/html; charset=UTF-8\r\n"
        + f"Content-Length: {len(resp1_body)}\r\n\r\n".encode()
        + resp1_body
    )

    # Step 2: POST credentials
    req2_body = b"username=lan.hieu%40mmq.khanh&password=LanHieu%402026%23Sec"
    req2 = (
        b"POST /login HTTP/1.1\r\n"
        b"Host: auth-portal.mmq-corp.cloud\r\n"
        b"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0\r\n"
        b"Content-Type: application/x-www-form-urlencoded\r\n"
        + f"Content-Length: {len(req2_body)}\r\n\r\n".encode()
        + req2_body
    )
    resp2_body = (
        b"<!DOCTYPE html><html><head><title>MMQ 2FA Verification</title></head>"
        b"<body><h2>Two-Factor Authentication Required</h2>"
        b"<p>Please enter the 6-digit code from your Authenticator app for lan.hieu@mmq.khanh</p>"
        b"<form action=\"/mfa-verify\" method=\"POST\">"
        b"<input name=\"otp\" type=\"text\" maxlength=\"6\" placeholder=\"000000\"/>"
        b"<button type=\"submit\">Verify</button></form></body></html>"
    )
    resp2 = (
        b"HTTP/1.1 200 OK\r\n"
        b"Server: nginx/1.24.0\r\n"
        b"Content-Type: text/html; charset=UTF-8\r\n"
        + f"Content-Length: {len(resp2_body)}\r\n\r\n".encode()
        + resp2_body
    )

    # Step 3: POST OTP -> Server authenticates, Proxy captures token and redirects victim
    req3_body = b"otp=839201"
    req3 = (
        b"POST /mfa-verify HTTP/1.1\r\n"
        b"Host: auth-portal.mmq-corp.cloud\r\n"
        b"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0\r\n"
        b"Content-Type: application/x-www-form-urlencoded\r\n"
        + f"Content-Length: {len(req3_body)}\r\n\r\n".encode()
        + req3_body
    )
    resp3 = (
        b"HTTP/1.1 302 Found\r\n"
        b"Server: nginx/1.24.0\r\n"
        b"Set-Cookie: MMQ_SSO_SESSION=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoibGFuLmhpZXUiLCJyb2xlIjoiZmluYW5jZV9tYW5hZ2VyIiwiaWF0IjoxNzkyMTQwMDB9.3e8b4f1c9; Path=/; Domain=.mmq.khanh; HttpOnly; Secure\r\n"
        b"Location: https://mail.mmq.khanh/inbox\r\n"
        b"Content-Length: 0\r\n\r\n"
    )

    stream1 = make_tcp_stream(
        "192.168.1.105", "104.21.45.18", 51234, 80,
        [(req1, resp1), (req2, resp2), (req3, resp3)],
        start_time=1792140000.0
    )

    # Stream 2: Attacker (45.145.67.89) replays stolen session cookie to exfiltrate secret
    req_exfil = (
        b"GET /api/v1/vault/confidential_report.zip HTTP/1.1\r\n"
        b"Host: portal.mmq.khanh\r\n"
        b"User-Agent: python-requests/2.31.0\r\n"
        b"Accept: */*\r\n"
        b"Cookie: MMQ_SSO_SESSION=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoibGFuLmhpZXUiLCJyb2xlIjoiZmluYW5jZV9tYW5hZ2VyIiwiaWF0IjoxNzkyMTQwMDB9.3e8b4f1c9\r\n"
        b"Connection: close\r\n\r\n"
    )
    resp_exfil = (
        b"HTTP/1.1 200 OK\r\n"
        b"Server: Apache/2.4.58 (Ubuntu)\r\n"
        b"Content-Type: application/zip\r\n"
        b"Content-Disposition: attachment; filename=\"confidential_report.zip\"\r\n"
        + f"Content-Length: {len(zip_data)}\r\n\r\n".encode()
        + zip_data
    )

    stream2 = make_tcp_stream(
        "45.145.67.89", "10.0.0.50", 44123, 80,
        [(req_exfil, resp_exfil)],
        start_time=1792140600.0
    )

    pcap_path = os.path.join(dist_dir, "capture.pcap")
    all_pkts = stream1 + stream2
    wrpcap(pcap_path, all_pkts)
    print(f"Generated {pcap_path} with {len(all_pkts)} packets.")

if __name__ == "__main__":
    build_challenge()
