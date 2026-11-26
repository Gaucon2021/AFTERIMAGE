---
inclusion: always
---
# Evidence policy
Never claim a real incident was resolved based on synthetic replay. Preserve frozen input, explicit dependency edges and the first failure in the output. Unknown events, malformed traces and missing dependencies must fail closed. A late capacity change must not erase previous failure. Use node --test after edits. Document which Kiro features actually ran; do not fabricate Kiro activity.
