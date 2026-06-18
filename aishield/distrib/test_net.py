#!/usr/bin/env python3
"""Test network connectivity"""
import socket
import sys

def test_local():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(3)
        s.connect(('127.0.0.1', 8450))
        s.send(b'GET /api/v1/health HTTP/1.0\r\nHost: localhost\r\n\r\n')
        data = s.recv(500)
        print(f"LOCAL OK: {data[:100]}")
        s.close()
        return True
    except Exception as e:
        print(f"LOCAL ERR: {e}")
        return False

def test_github():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5)
        s.connect(('140.82.112.6', 443))  # github.com IP
        print("GITHUB TCP OK")
        s.close()
        return True
    except Exception as e:
        print(f"GITHUB ERR: {e}")
        return False

if __name__ == '__main__':
    test_local()
    test_github()
