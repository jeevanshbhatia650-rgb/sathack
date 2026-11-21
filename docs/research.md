# Inspected GitHub sources

These matches concern individual algorithms, parsing, and instruction patterns. A literal search of the seven inspected checkouts found none of the three OFFDOCK role identifiers. The supplied brief provides the exact prompts.

## Typed model calls

The bank support example pairs role instructions with a Pydantic output model. The object output processor validates JSON against the configured type. OFFDOCK uses that division with three separate instruction sets and a success-or-error schema per call. Tool access in the example is unnecessary for these agents. [Source](https://github.com/pydantic/pydantic-ai/blob/4ba5d7d1a2cac0ad3997c4166feda6d1bad0050c/examples/pydantic_ai_examples/bank_support.py) · [Implementation](https://github.com/pydantic/pydantic-ai/blob/4ba5d7d1a2cac0ad3997c4166feda6d1bad0050c/pydantic_ai_slim/pydantic_ai/_output.py)

## DAG validation

In topological_generations, nodes with zero indegree form the frontier. Removing their outgoing edges exposes the next frontier. Remaining positive indegrees signal a cycle. Use this once on a frozen proposed plan. Runtime eligibility additionally depends on parent outcomes. [Source](https://github.com/networkx/networkx/blob/6c1a31d1613ad04cf2b2e3d63090b94979521981/networkx/algorithms/dag.py)

## Dynamic dispatch

Send on a conditional edge invokes a target node with custom state. Pass one task and attempt identity per Send. Keep worker I/O asynchronous so the graph step can finish while an unrelated service continues running. [Source](https://github.com/langchain-ai/langgraph/blob/c6335a4255dc1d8abc25a7677f9c072c7ab27b9c/libs/langgraph/langgraph/types.py)

## Deterministic build plans

PythonProvider checks repository files and reads TOML for project metadata. ConvertPlanToLLB consumes a BuildPlan and emits a BuildKit state plus image metadata. Preserve this plan as its own artifact. Dockerfile validation alone cannot inspect this route. [Source](https://github.com/railwayapp/railpack/blob/f52ebcd0bc95cd660ee03b67cf3b7cf3c125683c/core/providers/python/python.go) · [Implementation](https://github.com/railwayapp/railpack/blob/f52ebcd0bc95cd660ee03b67cf3b7cf3c125683c/buildkit/convert.go)

## Dockerfile linting

DL3002 tracks explicit root USER instructions by build stage. A missing USER instruction need not trigger it. OFFDOCK must also resolve inherited image configuration and verify the final effective user before running the image. [Source](https://github.com/hadolint/hadolint/blob/1d901b9c0b0d0445d19b1a9128d89fa55bb4604e/src/Hadolint/Rule/DL3002.hs)
