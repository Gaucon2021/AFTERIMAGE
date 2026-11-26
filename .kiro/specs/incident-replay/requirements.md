# Incident replay requirements

1. Validate ordered events and backward-only dependencies.
2. Compare original and counterfactual execution; preserve historical failures.
3. Return UNKNOWN for invalid or incomplete evidence.
4. Export both traces and clearly label synthetic evidence.
