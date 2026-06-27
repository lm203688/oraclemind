#!/usr/bin/env python3
"""Run agently-cli auth login with proper PTY and keep stdin alive"""
import pty, os, sys, time, select, fcntl, termios, struct

def main():
    master, slave = pty.openpty()
    
    # Set window size on slave to look like a real terminal
    winsize = struct.pack('HHHH', 24, 80, 0, 0)
    fcntl.ioctl(slave, termios.TIOCSWINSZ, winsize)
    
    pid = os.fork()
    
    if pid == 0:
        # Child
        os.close(master)
        os.setsid()
        # Set controlling terminal
        fcntl.ioctl(slave, termios.TIOCSCTTY, 0)
        os.dup2(slave, 0)
        os.dup2(slave, 1)
        os.dup2(slave, 2)
        if slave > 2:
            os.close(slave)
        
        os.environ['CLAUDE_CODE'] = '1'
        os.environ['TERM'] = 'xterm-256color'
        os.execvp('agently-cli', ['agently-cli', 'auth', 'login', '--verbose'])
    else:
        # Parent
        os.close(slave)
        
        output = b''
        start = time.time()
        url_printed = False
        url_sent = False
        
        while time.time() - start < 180:
            r, _, _ = select.select([master], [], [], 2)
            if r:
                try:
                    data = os.read(master, 4096)
                    if data:
                        output += data
                        text = output.decode('utf-8', errors='replace')
                        if 'https://agent.qq.com' in text and not url_sent:
                            # URL has been printed, send Enter to trigger polling
                            time.sleep(1)
                            os.write(master, b'\n')
                            url_sent = True
                            print("URL detected, sent Enter key", flush=True)
                except OSError:
                    break
            
            try:
                wpid, status = os.waitpid(pid, os.WNOHANG)
                if wpid != 0:
                    break
            except:
                pass
        
        # Read remaining
        try:
            while True:
                r, _, _ = select.select([master], [], [], 0.5)
                if r:
                    data = os.read(master, 4096)
                    if not data:
                        break
                    output += data
                else:
                    break
        except:
            pass
        
        os.close(master)
        
        with open('/tmp/agently_pty3.txt', 'wb') as f:
            f.write(output)
        print("DONE", flush=True)

if __name__ == '__main__':
    main()
