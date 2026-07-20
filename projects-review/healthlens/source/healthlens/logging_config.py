#!/usr/bin/env python3
"""
结构化日志模块
使用loguru进行结构化日志记录
"""

import os
import sys
from loguru import logger


def init_logger(log_dir=None, level="INFO"):
    """初始化日志配置"""
    if log_dir is None:
        log_dir = os.path.join(os.path.dirname(__file__), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # 移除默认handler
    logger.remove()
    
    # 控制台输出（彩色）
    logger.add(
        sys.stderr,
        level=level,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        colorize=True
    )
    
    # 应用日志文件（按天滚动，保留30天）
    logger.add(
        os.path.join(log_dir, "healthlens_{time:YYYY-MM-DD}.log"),
        level=level,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        rotation="00:00",  # 每天午夜滚动
        retention="30 days",
        compression="gz",
        encoding="utf-8"
    )
    
    # 错误日志单独文件
    logger.add(
        os.path.join(log_dir, "error_{time:YYYY-MM-DD}.log"),
        level="ERROR",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        rotation="00:00",
        retention="90 days",
        compression="gz",
        encoding="utf-8"
    )
    
    # 审计日志文件
    logger.add(
        os.path.join(log_dir, "audit_{time:YYYY-MM-DD}.log"),
        level="SUCCESS",
        format="{time:YYYY-MM-DD HH:mm:ss} | {message}",
        rotation="00:00",
        retention="365 days",
        compression="gz",
        encoding="utf-8",
        filter=lambda record: "audit" in record["extra"]
    )
    
    return logger


def log_audit(user_id, action, details=None):
    """记录审计日志"""
    logger.bind(audit=True).success(
        f"AUDIT | user={user_id} | action={action} | details={details or {}}"
    )


def log_api_request(method, path, status_code, user_id=None, duration_ms=None):
    """记录API请求"""
    logger.info(
        f"API | {method} {path} | status={status_code} | user={user_id or 'anonymous'} | duration={duration_ms or 0}ms"
    )


def log_data_event(event_type, user_id, source=None, count=0):
    """记录数据事件"""
    logger.info(
        f"DATA | {event_type} | user={user_id} | source={source or 'N/A'} | count={count}"
    )
