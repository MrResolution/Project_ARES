import ollama
import json

class AIEngine:
    def __init__(self, model="llama3"):
        self.model = model

    def analyze_telemetry(self, data):
        """
        Analyzes telemetry data for anomalies and predictive maintenance.
        """
        prompt = f"""
        Analyze the following industrial rover telemetry data for potential failures or safety risks.
        Data: {json.dumps(data)}
        
        Output format: JSON with keys "status" (SAFE/WARNING/CRITICAL), "message" (brief explanation), "action" (recommended action).
        Do not output markdown, just the JSON.
        """
        
        try:
            response = ollama.chat(model=self.model, messages=[
                {'role': 'user', 'content': prompt},
            ])
            return response['message']['content']
        except Exception as e:
            return json.dumps({"status": "ERROR", "message": str(e), "action": "Check AI System"})

    def detect_fire_risk(self, temp, gas):
        """
        Simple heuristic check before calling expensive LLM.
        """
        if temp > 70 or gas > 500:
            return True
        return False
