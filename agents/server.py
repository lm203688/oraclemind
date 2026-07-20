"""
Agent团队 HTTP API服务
提供统一HTTP接口
"""

import sys, os, json, time
from datetime import datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS

from scout.agent import ScoutAgent
from builder.agent import BuilderAgent
from strategist.agent import StrategistAgent
from growth.agent import GrowthAgent
from guardian.agent import GuardianAgent
from designer.agent import DesignerAgent
from ops.agent import OperatorAgent
from researcher.agent import ResearcherAgent

app = Flask(__name__)
CORS(app)

AGENTS = {
    "scout": ScoutAgent(),
    "builder": BuilderAgent(),
    "strategist": StrategistAgent(),
    "growth": GrowthAgent(),
    "guardian": GuardianAgent(),
    "designer": DesignerAgent(),
    "operator": OperatorAgent(),
    "researcher": ResearcherAgent(),
}


@app.route("/api/v1/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "agents": len(AGENTS),
        "timestamp": datetime.now().isoformat(),
        "agent_status": {name: agent.health_check() for name, agent in AGENTS.items()}
    })


@app.route("/api/v1/agents", methods=["GET"])
def list_agents():
    return jsonify({
        "agents": {name: agent.get_capabilities() for name, agent in AGENTS.items()}
    })


@app.route("/api/v1/agent/<agent_name>/health", methods=["GET"])
def agent_health(agent_name):
    if agent_name not in AGENTS:
        return jsonify({"error": f"Agent '{agent_name}' not found"}), 404
    return jsonify(AGENTS[agent_name].health_check())


@app.route("/api/v1/agent/<agent_name>/execute", methods=["POST"])
def execute_task(agent_name):
    if agent_name not in AGENTS:
        return jsonify({"error": f"Agent '{agent_name}' not found"}), 404
    data = request.get_json() or {}
    task = data.get("task", "")
    params = data.get("params", {})
    if not task:
        return jsonify({"error": "Missing 'task' field"}), 400
    try:
        result = AGENTS[agent_name].execute(task, params)
        return jsonify({"success": True, "result": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/v1/agent/<agent_name>/projects", methods=["GET"])
def list_projects(agent_name):
    if agent_name not in AGENTS:
        return jsonify({"error": f"Agent '{agent_name}' not found"}), 404
    return jsonify({"projects": AGENTS[agent_name].list_projects()})


@app.route("/api/v1/agent/<agent_name>/project", methods=["POST"])
def register_project(agent_name):
    if agent_name not in AGENTS:
        return jsonify({"error": f"Agent '{agent_name}' not found"}), 404
    data = request.get_json() or {}
    project_id = data.get("project_id", "")
    name = data.get("name", "")
    profile = data.get("profile", "")
    if not project_id or not name:
        return jsonify({"error": "Missing project_id or name"}), 400
    result = AGENTS[agent_name].register_project(project_id, name, profile)
    return jsonify({"success": result})


@app.route("/api/v1/daily-report", methods=["GET"])
def daily_report():
    from eve import EveScheduler
    eve = EveScheduler()
    report = eve.daily_report()
    return jsonify(report)


if __name__ == "__main__":
    print(f"Agent团队API服务启动 | Agent数: {len(AGENTS)}")
    for name, agent in AGENTS.items():
        hc = agent.health_check()
        print(f"  {name:12s} port={hc['port']:5d} {hc['status']}")
    app.run(host="0.0.0.0", port=8470, debug=False)
