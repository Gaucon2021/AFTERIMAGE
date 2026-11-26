# AFTERIMAGE — Incident Reconstruction Lab

## Development workbench

Deterministic dependency-aware replay, event-level counterfactual intervention, first failure identification, invalid-input UNKNOWN and JSON evidence export.

## Run locally

```sh
node --test
python -m http.server 8000
```

Open http://localhost:8000/. Node 22 recommended. Tests are included; no test or live platform result is asserted without independent verification.

## Integration status

Execute workflow in Kiro, capture actual Kiro usage and validate the model against real incident data. Kiro-compatible specs alone do not demonstrate Kiro use.

Use synthetic inputs only. This is a development release, not a production-security or hackathon-completion claim. No paid infrastructure or mainnet transaction is required for the local lab.
