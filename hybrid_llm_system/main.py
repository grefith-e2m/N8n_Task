import os
import json
import requests
from dotenv import load_dotenv

# Load configurations
load_dotenv()

class AntigravityOrchestrator:
    def __init__(self):
        self.local_cfg = {"url": os.getenv("LOCAL_LLM_URL"), "model": os.getenv("LOCAL_LLM_MODEL")}
        self.cloud_cfg = {"url": "https://api.groq.com/openai/v1/chat/completions", "key": os.getenv("GROQ_API_KEY"), "model": os.getenv("GROQ_MODEL")}

    def call_llm(self, cfg, system, user, is_cloud=False):
        headers = {"Content-Type": "application/json"}
        if is_cloud: 
            headers["Authorization"] = f"Bearer {cfg['key']}"
        
        payload = {
            "model": cfg["model"],
            "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
            "temperature": 0.0
        }
        res = requests.post(cfg["url"], headers=headers, json=payload)
        res.raise_for_status()
        return res.json()['choices'][0]['message']['content']

    def run(self):
        # Load input tasks
        if not os.path.exists("task.json"):
            print("Error: task.json not found!")
            return

        with open("task.json", "r") as f:
            tasks = json.load(f)

        # Load prompts
        summarizer_p = open("prompts/summarizer.txt", "r").read()
        solver_p = open("prompts/solver.txt", "r").read()
        
        final_output = []
        total_tasks = len(tasks)

        print(f"\n🚀 Starting Hybrid Pipeline for {total_tasks} tasks...\n" + "="*50)

        for i, task in enumerate(tasks, 1):
            t_name = task.get('task_name', f'Task {i}')
            print(f"[{i}/{total_tasks}] Processing: {t_name}")

            # --- STAGE 1: LOCAL ---
            print(f"  └─ 🟢 Generating Local Summary (LLaMA)...", end="\r")
            local_summary = self.call_llm(self.local_cfg, summarizer_p, json.dumps(task))
            print(f"  └─ ✅ Summary Generated. Sending to Cloud...   ")

            # --- STAGE 2: CLOUD ---
            print(f"  └─ 🔵 Generating Cloud Solution (Groq)...", end="\r")
            cloud_raw_response = self.call_llm(self.cloud_cfg, solver_p, local_summary, is_cloud=True)
            print(f"  └─ ✅ Cloud Solution Received.             ")

            try:
                # Parse cloud response
                task_solution = json.loads(cloud_raw_response)
                
                # INSTRUCTION: Include the local summary in the output
                task_solution["local_summary_snapshot"] = local_summary
                
                final_output.append(task_solution)
            except json.JSONDecodeError:
                print(f"  ❌ Error: Cloud model returned invalid JSON for {t_name}")

        # --- SAVE TO FILE ---
        output_filename = "processed_tasks_output.json"
        with open(output_filename, "w") as outfile:
            json.dump(final_output, outfile, indent=2)

        print("="*50)
        print(f"\n🎉 SUCCESS: All tasks processed.")
        print(f"📂 Final downloadable file saved as: {os.path.abspath(output_filename)}\n")

if __name__ == "__main__":
    AntigravityOrchestrator().run()