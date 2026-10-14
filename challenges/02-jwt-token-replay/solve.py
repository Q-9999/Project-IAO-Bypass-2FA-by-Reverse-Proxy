#!/usr/bin/env python3
"""
Solution Solver for Challenge 02: JWT Token Replay & Privilege Escalation
"""
import os
import subprocess
import json
import base64

def solve():
    challenge_dir = os.path.dirname(os.path.abspath(__file__))
    pcap_path = os.path.join(challenge_dir, "distfiles", "audit_trace.pcap")

    if not os.path.exists(pcap_path):
        print(f"[-] PCAP file not found: {pcap_path}")
        return

    print(f"[*] Analyzing OAuth/JWT traffic in: {pcap_path}")

    # Use tshark to extract HTTP responses containing json data
    cmd = [
        "tshark", "-r", pcap_path,
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
            if "encrypted_export_payload" in data:
                b64_val = data["encrypted_export_payload"]
                flag = base64.b64decode(b64_val).decode()
                break
        except Exception:
            pass

    if flag:
        print("\n" + "="*50)
        print(f"[!] SUCCESS! Retrieved Flag: {flag}")
        print("="*50 + "\n")
    else:
        print("[-] Flag not found.")

if __name__ == "__main__":
    solve()
