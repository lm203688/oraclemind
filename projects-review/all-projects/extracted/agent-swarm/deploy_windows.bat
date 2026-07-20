@echo off
REM ================================================
REM Agent Swarm — Windows 一键部署脚本
REM 硬件要求：RTX 3090/4090 (24GB VRAM) + CUDA 12+
REM ================================================

echo [Step 1/5] 检查Python环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Python，请先安装 Python 3.11+
    pause
    exit /b 1
)

echo [Step 2/5] 检查Ollama...
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Ollama未安装，正在通过winget安装...
    winget install ollama
    echo 安装完成后请重启终端，再运行本脚本
    pause
    exit /b 1
)

echo [Step 3/5] 拉取模型 (约50GB，首次耗时较长)...
echo   - gemma4:26b...
ollama pull gemma4:26b
echo   - gemma4:e4b...
ollama pull gemma4:e4b
echo   - deepseek-r1:32b...
ollama pull deepseek-r1:32b
echo   - qwen3-coder:30b...
ollama pull qwen3-coder:30b
echo   - llama3.2-vision:11b...
ollama pull llama3.2-vision:11b

echo [Step 4/5] 安装Python依赖...
pip install -r requirements.txt

echo [Step 5/5] 安装完成！
echo.
echo 启动命令: python main.py
echo ================================================
pause
