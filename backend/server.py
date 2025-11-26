from fastapi import FastAPI, APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import paramiko
import asyncio
import json
from io import StringIO

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Oniks EKS APP Backend")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Models
class SSHConfig(BaseModel):
    host: str
    port: int = 22
    username: str
    password: str
    command: str

class SSHExecuteRequest(BaseModel):
    ssh: SSHConfig
    button_id: str

class SSHResponse(BaseModel):
    success: bool
    output: str
    error: Optional[str] = None
    execution_time: float

class AppConfig(BaseModel):
    app_name: str
    version: str
    pages: List[Dict[str, Any]]
    buttons: List[Dict[str, Any]]

# WebSocket manager for real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected")

    async def send_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {e}")
                self.disconnect(client_id)

manager = ConnectionManager()

# SSH execution function
def execute_ssh_command(ssh_config: SSHConfig) -> tuple[str, str, bool]:
    """Execute SSH command and return stdout, stderr, and success status"""
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    stdout_str = ""
    stderr_str = ""
    success = False
    
    try:
        logger.info(f"Connecting to {ssh_config.host}:{ssh_config.port}")
        ssh.connect(
            hostname=ssh_config.host,
            port=ssh_config.port,
            username=ssh_config.username,
            password=ssh_config.password,
            timeout=10,
            look_for_keys=False,
            allow_agent=False
        )
        
        logger.info(f"Executing command: {ssh_config.command}")
        stdin, stdout, stderr = ssh.exec_command(ssh_config.command, timeout=30)
        
        stdout_str = stdout.read().decode('utf-8', errors='ignore')
        stderr_str = stderr.read().decode('utf-8', errors='ignore')
        exit_status = stdout.channel.recv_exit_status()
        
        success = exit_status == 0
        logger.info(f"Command executed. Exit status: {exit_status}")
        
    except paramiko.AuthenticationException:
        stderr_str = "SSH Authentication failed. Check username/password."
        logger.error(stderr_str)
    except paramiko.SSHException as e:
        stderr_str = f"SSH Error: {str(e)}"
        logger.error(stderr_str)
    except Exception as e:
        stderr_str = f"Error: {str(e)}"
        logger.error(stderr_str)
    finally:
        ssh.close()
    
    return stdout_str, stderr_str, success

# Routes
@api_router.get("/")
async def root():
    return {"message": "Oniks EKS APP Backend", "version": "1.0"}

@api_router.post("/ssh/execute", response_model=SSHResponse)
async def execute_ssh(request: SSHExecuteRequest):
    """Execute SSH command"""
    start_time = datetime.utcnow()
    
    try:
        stdout, stderr, success = execute_ssh_command(request.ssh)
        
        execution_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Store execution log in MongoDB
        log_entry = {
            "button_id": request.button_id,
            "host": request.ssh.host,
            "command": request.ssh.command,
            "success": success,
            "stdout": stdout,
            "stderr": stderr,
            "execution_time": execution_time,
            "timestamp": datetime.utcnow()
        }
        await db.ssh_logs.insert_one(log_entry)
        
        return SSHResponse(
            success=success,
            output=stdout if success else stderr,
            error=stderr if not success else None,
            execution_time=execution_time
        )
    except Exception as e:
        logger.error(f"Error in execute_ssh: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time SSH output"""
    await manager.connect(websocket, client_id)
    try:
        while True:
            # Receive SSH execution request from client
            data = await websocket.receive_json()
            
            if data.get("type") == "execute_ssh":
                ssh_config = SSHConfig(**data["ssh"])
                button_id = data.get("button_id", "unknown")
                
                # Send starting message
                await manager.send_message({
                    "type": "status",
                    "status": "connecting",
                    "message": f"Connecting to {ssh_config.host}..."
                }, client_id)
                
                # Execute SSH in thread pool to avoid blocking
                loop = asyncio.get_event_loop()
                stdout, stderr, success = await loop.run_in_executor(
                    None, execute_ssh_command, ssh_config
                )
                
                # Send output
                if success:
                    await manager.send_message({
                        "type": "output",
                        "data": stdout,
                        "success": True
                    }, client_id)
                else:
                    await manager.send_message({
                        "type": "error",
                        "data": stderr,
                        "success": False
                    }, client_id)
                
                # Send completion
                await manager.send_message({
                    "type": "complete",
                    "success": success
                }, client_id)
                
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(client_id)

@api_router.get("/ssh/logs")
async def get_ssh_logs(limit: int = 50):
    """Get recent SSH execution logs"""
    logs = await db.ssh_logs.find().sort("timestamp", -1).limit(limit).to_list(limit)
    # Convert ObjectId to string
    for log in logs:
        log["_id"] = str(log["_id"])
    return {"logs": logs}

@api_router.post("/config/validate")
async def validate_config(config: AppConfig):
    """Validate configuration JSON"""
    try:
        # Basic validation
        if not config.pages:
            raise ValueError("At least one page is required")
        if not config.buttons:
            raise ValueError("At least one button is required")
        
        # Check pageId references
        page_ids = {page["pageId"] for page in config.pages}
        for button in config.buttons:
            if button["pageId"] not in page_ids:
                raise ValueError(f"Button {button['id']} references non-existent pageId: {button['pageId']}")
        
        return {"valid": True, "message": "Configuration is valid"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/config/sample")
async def get_sample_config():
    """Get sample configuration JSON"""
    import json
    try:
        config_path = Path("/app/sample_config.json")
        with open(config_path, 'r', encoding='utf-8') as f:
            config_data = json.load(f)
        return config_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading sample config: {str(e)}")

@api_router.get("/config/simple")
async def get_simple_config():
    """Get simple configuration JSON with 6 buttons"""
    import json
    try:
        config_path = Path("/app/simple_config.json")
        with open(config_path, 'r', encoding='utf-8') as f:
            config_data = json.load(f)
        return config_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading simple config: {str(e)}")

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
