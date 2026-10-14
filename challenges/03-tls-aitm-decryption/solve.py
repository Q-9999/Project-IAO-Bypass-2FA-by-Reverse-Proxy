#!/usr/bin/env python3
"""
Solution Solver for Challenge 03: TLS Decryption & AiTM Replay Analysis
"""
import os
import json
import subprocess

def solve():
    challenge_dir = os.path.dirname(os.path.abspath(__file__))
    pcap_path = os.path.join(challenge_dir, "distfiles", "traffic_tls.pcap")
    keylog_path = os.path.join(challenge_dir, "distfiles", "sslkeylog.log")

    if not os.path.exists(pcap_path) or not os.path.exists(keylog_path):
        print(f"[-] Missing challenge files in distfiles/")
        return

    print(f"[*] Decrypting TLS capture: {pcap_path}")
    print(f"[*] Using SSL Keylog:       {keylog_path}")

    # Use tshark with TLS keylog to decrypt and extract HTTP JSON response
    cmd = [
        "tshark", "-r", pcap_path,
        "-o", f"tls.keylog_file:{keylog_path}",
        "-Y", "http.response.code == 200 && json.object",
        "-T", "fields", "-e", "json.object"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, text=True, check=True)

    flag = None
    for line in res.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            data = json.loads(line)
            if "secret_flag" in data:
                flag = data["secret_flag"]
                break
        except Exception:
            pass

    if flag:
        print("\n" + "="*50)
        print(f"[!] SUCCESS! Retrieved Decrypted Flag: {flag}")
        print("="*50 + "\n")
    else:
        print("[-] Flag not found in decrypted traffic.")

if __name__ == "__main__":
    solve()
