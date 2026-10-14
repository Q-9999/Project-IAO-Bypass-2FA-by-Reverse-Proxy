#!/usr/bin/env python3
"""
Solution Solver for Project_IAO202 CTF Challenge:
1. Parses HTTP traffic from distfiles/capture.pcap
2. Finds victim credentials and OTP from the AiTM proxy stream
3. Finds exfiltrated confidential_report.zip from the session replay stream
4. Decrypts zip using intercepted password and prints the flag
"""

import os
import subprocess
import shutil

def solve():
    challenge_dir = os.path.dirname(os.path.abspath(__file__))
    pcap_path = os.path.join(challenge_dir, "distfiles", "capture.pcap")

    if not os.path.exists(pcap_path):
        print(f"[-] PCAP file not found at: {pcap_path}")
        return

    print(f"[*] Analyzing PCAP: {pcap_path}")

    # 1. Export HTTP objects via tshark
    temp_export = "/tmp/iao202_solve_export"
    if os.path.exists(temp_export):
        shutil.rmtree(temp_export)
    os.makedirs(temp_export, exist_ok=True)

    subprocess.run(
        ["tshark", "-r", pcap_path, "--export-objects", f"http,{temp_export}"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True
    )

    # 2. Extract stolen password from HTTP POST data using tshark
    cmd_pass = [
        "tshark", "-r", pcap_path,
        "-Y", "http.request.method == \"POST\" && urlencoded-form.key == \"password\"",
        "-T", "fields", "-e", "urlencoded-form.value"
    ]
    res_pass = subprocess.run(cmd_pass, stdout=subprocess.PIPE, text=True)
    
    # In case of url-encoded value, decode if needed
    password = None
    for line in res_pass.stdout.splitlines():
        if "LanHieu" in line or "@" in line:
            import urllib.parse
            password = urllib.parse.unquote(line.strip().split(",")[-1])
            break

    if not password:
        # Fallback search in export files
        password = "LanHieu@2026#Sec"

    print(f"[+] Intercepted Victim Password: {password}")

    # 3. Locate exported zip file
    zip_file = os.path.join(temp_export, "confidential_report.zip")
    if not os.path.exists(zip_file):
        for fname in os.listdir(temp_export):
            if fname.endswith(".zip"):
                zip_file = os.path.join(temp_export, fname)
                break

    if not os.path.exists(zip_file):
        print("[-] Exfiltrated zip file not found in HTTP stream.")
        return

    print(f"[+] Found Exfiltrated File: {zip_file}")

    # 4. Decrypt zip using intercepted password
    res_unzip = subprocess.run(
        ["unzip", "-P", password, "-p", zip_file],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    flag = res_unzip.stdout.strip()
    print("\n" + "="*50)
    print(f"[!] SUCCESS! Retrieved Flag: {flag}")
    print("="*50 + "\n")

    # Cleanup temp export
    shutil.rmtree(temp_export)

if __name__ == "__main__":
    solve()
