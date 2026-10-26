import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from core.engine import engine
from core.knowledge_base import kb

samples = kb.get_sample_campaigns()
print("="*60)
print(f"Testing Sample 1: {samples[0]['title']}")
res = engine.inspect_content(samples[0]['content'], samples[0]['attached_visual'])
print("Compliance Score:", res["compliance_score"], "/ 100")
print("Status Label:", res["status_label"])
print("Total Issues:", res["total_issues"])
print("Critical:", res["critical_count"], "| Warnings:", res["warning_count"])
print("\nFlagged Violations:")
for idx, i in enumerate(res["issues"], 1):
    print(f"{idx}. [{i['category']} - {i['severity'].upper()}] \"{i['flagged_text']}\"")
    print(f"   Guideline Ref: {i['guideline_ref']}")
    print(f"   Suggestion: {i['intent_preserving_suggestion']}")
    print(f"   Diff Preview: - {i['diff_preview']['delete']} | + {i['diff_preview']['add']}")

print("="*60)
print(f"Testing Sample 3 (Compliant): {samples[2]['title']}")
res3 = engine.inspect_content(samples[2]['content'], samples[2]['attached_visual'])
print("Compliance Score:", res3["compliance_score"], "/ 100")
print("Status Label:", res3["status_label"])
print("Total Issues:", res3["total_issues"])
print("="*60)
