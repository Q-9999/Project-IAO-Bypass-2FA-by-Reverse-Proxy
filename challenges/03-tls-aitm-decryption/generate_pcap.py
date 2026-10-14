#!/usr/bin/env python3
import os
import sys
import ssl
import time
import json
import shutil
import subprocess
import http.server
import threading

def build_challenge_03():
    challenge_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(challenge_dir, "distfiles")
    os.makedirs(dist_dir, exist_ok=True)

    flag = "MMQ{TLS_4iTM_d3crypt3d_s3ss10n_st0l3n_2026}"
    with open(os.path.join(challenge_dir, "flag.txt"), "w") as f:
        f.write(flag + "\n")

    pcap_path = os.path.join(dist_dir, "traffic_tls.pcap")
    keylog_path = os.path.join(dist_dir, "sslkeylog.log")

    if os.path.exists(pcap_path):
        os.remove(pcap_path)
    if os.path.exists(keylog_path):
        os.remove(keylog_path)

    # 1. Generate SSL certificate
    temp_dir = "/tmp/iao202_tls_gen"
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir, exist_ok=True)

    cert_file = os.path.join(temp_dir, "server.crt")
    key_file = os.path.join(temp_dir, "server.key")
    subprocess.run([
        "openssl", "req", "-x509", "-newkey", "rsa:2048", "-keyout", key_file,
        "-out", cert_file, "-days", "1", "-nodes",
        "-subj", "/CN=login.microsoft-sso.mmq-portal.cloud"
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # 2. Mock AiTM Server
    class AiTMHandler(http.server.BaseHTTPRequestHandler):
        def do_POST(self):
            content_len = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_len) if content_len > 0 else b""

            if self.path == "/common/login":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "step": "MFA_REQUIRED",
                    "auth_method": "Microsoft_Authenticator_NumberMatch",
                    "display_code": "94"
                }).encode())

            elif self.path == "/common/mfa-verify":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Set-Cookie", "ESTSAUTH=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJnaWFtZG9jLmxhbkBtbXEua2hhbmgiLCJyb2xlIjoiQ0VPIn0.sigESTS; Path=/; Secure; HttpOnly")
                self.send_header("Set-Cookie", "MMQ_EXECUTIVE_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJnaWFtZG9jLmxhbiIsInZhdWx0X2FjY2VzcyI6dHJ1ZX0.sigMMQ; Path=/; Secure; HttpOnly")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "authenticated",
                    "redirect_uri": "https://portal.mmq.corp/executive/dashboard"
                }).encode())

            elif self.path == "/api/v3/executive/vault_export":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success",
                    "vault_name": "Executive_Strategy_2026",
                    "timestamp": "2026-10-12T10:45:00Z",
                    "secret_flag": flag
                }).encode())
            else:
                self.send_response(404)
                self.end_headers()

        def do_GET(self):
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b"<html><head><title>Sign in to your account</title></head><body>Proxy Landing</body></html>")

        def log_message(self, format, *args):
            pass

    httpd = http.server.HTTPServer(("127.0.0.1", 8443), AiTMHandler)
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(certfile=cert_file, keyfile=key_file)
    httpd.socket = ctx.wrap_socket(httpd.socket, server_side=True)

    server_thread = threading.Thread(target=httpd.serve_forever)
    server_thread.daemon = True
    server_thread.start()

    # 3. Start dumpcap capture
    p_dump = subprocess.Popen([
        "dumpcap", "-i", "lo", "-f", "tcp port 8443", "-w", pcap_path
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.6)

    # 4. Replay realistic AiTM interactions via curl with SSLKEYLOGFILE
    env = os.environ.copy()
    env["SSLKEYLOGFILE"] = keylog_path
    target = "https://login.microsoft-sso.mmq-portal.cloud:8443"

    # Step 1: Victim lands on phishing proxy
    subprocess.run(["curl", "-k", "--resolve", "login.microsoft-sso.mmq-portal.cloud:8443:127.0.0.1",
                    f"{target}/"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.2)

    # Step 2: Victim submits credentials
    login_data = json.dumps({"username": "giamdoc.lan@mmq.corp", "password": "GiamDocLan@2026#Vip!"})
    subprocess.run(["curl", "-k", "--resolve", "login.microsoft-sso.mmq-portal.cloud:8443:127.0.0.1",
                    "-X", "POST", "-d", login_data, "-H", "Content-Type: application/json",
                    f"{target}/common/login"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.3)

    # Step 3: Victim approves MFA prompt
    mfa_data = json.dumps({"username": "giamdoc.lan@mmq.corp", "mfa_response": "94"})
    subprocess.run(["curl", "-k", "--resolve", "login.microsoft-sso.mmq-portal.cloud:8443:127.0.0.1",
                    "-X", "POST", "-d", mfa_data, "-H", "Content-Type: application/json",
                    f"{target}/common/mfa-verify"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.4)

    # Step 4: Attacker uses stolen session token to exfiltrate executive vault
    cookie_header = "Cookie: ESTSAUTH=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJnaWFtZG9jLmxhbkBtbXEua2hhbmgiLCJyb2xlIjoiQ0VPIn0.sigESTS; MMQ_EXECUTIVE_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJnaWFtZG9jLmxhbiIsInZhdWx0X2FjY2VzcyI6dHJ1ZX0.sigMMQ"
    subprocess.run(["curl", "-k", "--resolve", "login.microsoft-sso.mmq-portal.cloud:8443:127.0.0.1",
                    "-X", "POST", "-H", cookie_header,
                    f"{target}/api/v3/executive/vault_export"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.5)

    # 5. Stop dumpcap and server
    p_dump.terminate()
    p_dump.wait()
    httpd.shutdown()
    httpd.server_close()
    shutil.rmtree(temp_dir)

    print(f"Generated Challenge 3:")
    print(f"  PCAP:   {pcap_path} ({os.path.getsize(pcap_path)} bytes)")
    print(f"  KEYLOG: {keylog_path} ({os.path.getsize(keylog_path)} bytes)")

if __name__ == "__main__":
    build_challenge_03()
