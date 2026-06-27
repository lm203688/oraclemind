#!/usr/bin/env python3
"""Run agently-cli auth login with proper PTY"""
import pty, os, sys, time, select, signal

def main():
    # Create a pseudo-terminal
    master, slave = pty.openpty()
    
    # Fork
    pid = os.fork()
    
    if pid == 0:
        # Child process
        os.close(master)
        os.setsid()
        
        # Set the slave as stdin/stdout/stderr
        os.dup2(slave, 0)
        os.dup2(slave, 1)
        os.dup2(slave, 2)
        os.close(slave)
        
        # Set environment
        os.environ['CLAUDE_CODE'] = '1'
        os.environ['TERM'] = 'xterm-256color'
        
        # Exec the command
        os.execvp('agently-cli', ['agently-cli', 'auth', 'login', '--verbose'])
    else:
        # Parent process
        os.close(slave)
        
        # Set master to non-blocking
        import fcntl
        flags = fcntl.fcntl(master, fcntl.F_GETFL)
        fcntl.fcntl(master, fcntl.F_SETFL, flags | os.O_NONBLOCK)
        
        output = b''
        start = time.time()
        max_wait = 300  # 5 minutes
        
        while time.time() - start < max_wait:
            # Try to read
            try:
                r, _, _ = select.select([master], [], [], 2)
                if r:
                    data = os.read(master, 4096)
                    if data:
                        output += data
                        # Print URL as soon as we see it
                        text = output.decode('utf-8', errors='replace')
                        if 'https://agent.qq.com' in text and 'URL_PRINTED' not in locals():
                            # Extract URL line
                            for line in text.split('\n'):
                                if 'https://agent.qq.com' in line:
                                    print(f"AUTH_URL:{line.strip()}", flush=True)
                                    URL_PRINTED = True
                                    break
            except (OSError, BlockingIOError):
                pass
            
            # Check if child exited
            try:
                wpid, status = os.waitpid(pid, os.WNOHANG)
                if wpid != 0:
                    # Read any remaining output
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
                    break
            except:
                pass
        
        # Save output
        with open('/tmp/agently_pty_final.txt', 'wb') as f:
            f.write(output)
        
        print("AUTH_DONE", flush=True)

if __name__ == '__main__':
    main()
