#!/usr/bin/env python3
"""
Feishu Bot Adapter for 比特助手 (ECS Agent)
Receives Feishu events → forwards to local 比特助手 API → sends response back
"""

import os
import json
import time
import hashlib
import logging
import threading
import urllib.request
from flask import Flask, request as flask_request, jsonify

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger('feishu-adapter')

# Config from env
FEISHU_APP_ID = os.environ.get('FEISHU_APP_ID', '')
FEISHU_APP_SECRET = os.environ.get('FEISHU_APP_SECRET', '')
FEISHU_VERIFICATION_TOKEN = os.environ.get('FEISHU_VERIFICATION_TOKEN', '')
FEISHU_ENCRYPT_KEY = os.environ.get('FEISHU_ENCRYPT_KEY', '')
BIT_API_URL = os.environ.get('BIT_API_URL', 'http://localhost:8431/v1/chat/completions')
BIT_API_KEY = os.environ.get('BIT_API_KEY', 'sk-S8VeYfNBqQwVDfXVOq9dVrobXnv7a5JCWlE5Wbd6oKBJn97v')
PORT = int(os.environ.get('PORT', '8433'))

# Tenant access token cache
_token_cache = {'token': '', 'expires': 0}
_token_lock = threading.Lock()

# System prompt for 比特助手
SYSTEM_PROMPT = """你是比特🧬，一个全能AI助手，运行在免费的ECS比特助手服务上。

你擅长：日常问答、数据分析、代码编写、信息搜索、文档生成、健康医疗生命科学等。

工作原则：
- 回答简洁直接，不要客套
- 健康医疗问题要专业、有温度，涉及诊断务必提醒就医
- 不确定的内容坦诚说明，不编造
- 敏感操作先确认"""


def get_tenant_access_token():
    """Get or refresh Feishu tenant_access_token"""
    with _token_lock:
        if _token_cache['token'] and _token_cache['expires'] > time.time() + 60:
            return _token_cache['token']

    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    data = json.dumps({
        "app_id": FEISHU_APP_ID,
        "app_secret": FEISHU_APP_SECRET
    }).encode('utf-8')

    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            if result.get('code') == 0:
                with _token_lock:
                    _token_cache['token'] = result['tenant_access_token']
                    _token_cache['expires'] = time.time() + result.get('expire', 7200)
                logger.info("Refreshed Feishu tenant_access_token")
                return _token_cache['token']
            else:
                logger.error(f"Failed to get token: {result}")
                return None
    except Exception as e:
        logger.error(f"Token request failed: {e}")
        return None


def call_bit_assistant(user_message, chat_id=None, max_retries=2):
    """Call local 比特助手 API with retry"""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message}
    ]

    payload = {
        "model": "agnes-2.0-flash",
        "messages": messages,
        "max_tokens": 2000,
        "temperature": 0.7
    }

    data = json.dumps(payload).encode('utf-8')
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {BIT_API_KEY}'
    }

    last_error = None
    for attempt in range(max_retries + 1):
        try:
            req = urllib.request.Request(BIT_API_URL, data=data, headers=headers)
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                content = result.get('choices', [{}])[0].get('message', {}).get('content', '')
                return content if content else '抱歉，比特助手暂时无法回复。'
        except Exception as e:
            last_error = e
            logger.warning(f"Bit assistant API attempt {attempt+1} failed: {e}")
            if attempt < max_retries:
                time.sleep(3 * (attempt + 1))

    logger.error(f"Bit assistant API failed after {max_retries+1} attempts: {last_error}")
    return f'比特助手调用失败，请稍后再试。'


def send_feishu_message(chat_id, msg_type, content):
    """Send message back to Feishu"""
    token = get_tenant_access_token()
    if not token:
        logger.error("No token available, cannot send message")
        return False

    url = "https://open.feishu.cn/open-apis/im/v1/messages"
    params = "?receive_id_type=chat_id"

    payload = {
        "receive_id": chat_id,
        "msg_type": msg_type,
        "content": json.dumps(content) if isinstance(content, dict) else content
    }

    data = json.dumps(payload).encode('utf-8')
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }

    req = urllib.request.Request(url + params, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            if result.get('code') == 0:
                logger.info(f"Message sent to {chat_id}")
                return True
            else:
                logger.error(f"Send message failed: {result}")
                return False
    except Exception as e:
        logger.error(f"Send message error: {e}")
        return False


def reply_feishu_message(message_id, content_text):
    """Reply to a Feishu message"""
    token = get_tenant_access_token()
    if not token:
        logger.error("No token available, cannot reply")
        return False

    url = f"https://open.feishu.cn/open-apis/im/v1/messages/{message_id}/reply"

    payload = {
        "msg_type": "text",
        "content": json.dumps({"text": content_text})
    }

    data = json.dumps(payload).encode('utf-8')
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }

    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            if result.get('code') == 0:
                logger.info(f"Replied to message {message_id}")
                return True
            else:
                logger.error(f"Reply failed: {result}")
                return False
    except Exception as e:
        logger.error(f"Reply error: {e}")
        return False


def handle_message_async(message_id, chat_id, user_text):
    """Handle message in background thread"""
    try:
        response = call_bit_assistant(user_text, chat_id)
        reply_feishu_message(message_id, response)
    except Exception as e:
        logger.error(f"Async message handling failed: {e}")
        reply_feishu_message(message_id, f"处理失败: {str(e)}")


@app.route('/feishu/webhook', methods=['POST'])
def webhook():
    """Main Feishu webhook endpoint"""
    body = flask_request.json
    logger.info(f"Received webhook: {json.dumps(body, ensure_ascii=False)[:500]}")

    # Handle URL verification challenge
    if body.get('type') == 'url_verification':
        challenge = body.get('challenge', '')
        token = body.get('token', '')
        logger.info(f"URL verification challenge received, token={token}")
        return jsonify({'challenge': challenge})

    # Handle event callback
    header = body.get('header', {})
    event_type = header.get('event_type', '')
    event = body.get('event', {})

    # Only handle message events
    if event_type == 'im.message.receive_v1':
        msg_type = event.get('message', {}).get('message_type', '')
        message_id = event.get('message', {}).get('message_id', '')
        chat_id = event.get('message', {}).get('chat_id', '')

        # Extract text content
        user_text = ''
        if msg_type == 'text':
            try:
                content_json = json.loads(event.get('message', {}).get('content', '{}'))
                user_text = content_json.get('text', '')
            except json.JSONDecodeError:
                user_text = event.get('message', {}).get('content', '')
        elif msg_type == 'post':
            try:
                content_json = json.loads(event.get('message', {}).get('content', '{}'))
                # Extract text from rich text post
                lines = []
                for content in content_json.get('content', []):
                    for elem in content:
                        if elem.get('tag') == 'text':
                            lines.append(elem.get('text', ''))
                user_text = '\n'.join(lines)
            except (json.JSONDecodeError, KeyError):
                user_text = '[富文本消息]'
        else:
            user_text = f'[{msg_type}消息]'

        if user_text:
            logger.info(f"Message from chat {chat_id}: {user_text[:100]}")
            # Handle in background thread to avoid timeout
            t = threading.Thread(target=handle_message_async, args=(message_id, chat_id, user_text))
            t.daemon = True
            t.start()

    # Always return success quickly
    return jsonify({'code': 0})


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'app_id': FEISHU_APP_ID[:8] + '...' if FEISHU_APP_ID else 'not_set',
        'bit_api': BIT_API_URL
    })


if __name__ == '__main__':
    logger.info(f"Starting Feishu adapter on port {PORT}")
    logger.info(f"Bit API: {BIT_API_URL}")
    app.run(host='0.0.0.0', port=PORT, debug=False)
