# From workload to image

The containerizer receives one selected workload plus its pinned report. Try a compatible root Dockerfile first. Parse it, lint it and apply policy. Record why a candidate was unsuitable. Try a matching Railpack provider next and retain the generated BuildPlan plus tool version and digest. Validate plan inputs, commands, image provenance and final user through the plan-specific adapter. Only admit plans whose semantics the adapter can inspect.

Use the model fallback for an unsupported workload, required transport adaptation or a repairable build failure. Supply the approved pinned base image list, workload evidence and containerization response schema. A structured error closes the path. Retain whether the admitted artifact is a Dockerfile or Railpack plan so the worker chooses the correct BuildKit frontend.

## Build admission

Parse Dockerfiles with Dockerfile grammar including multistage FROM references and continuations. Resolve every external image to an approved digest from the configured Python slim, Node slim or gateway families. Inspect stages for prohibited mounts, remote scripts, embedded secrets and unsafe privileges. Require Hadolint success under manager-controlled configuration and verify the effective final user. Reject unsupported frontend directives and dynamic operations the policy cannot evaluate. Verify the final image metadata again before execution.

Use an isolated, disposable build environment with bounded CPU, memory, time and network access. Exclude host credentials and the Docker socket from build contexts. The worker independently verifies the signed blueprint and approved artifact digest before starting BuildKit.

## MCP workloads

Keep the native transport in the task record. A remotely accessed stdio service needs a pinned gateway plus verified server argv and a declared remote transport. Select stateful streamable HTTP when session continuity is required, or SSE only when required by the client. Bind the gateway to the worker's authorized service interface and pass the assigned port to discovery. Reject incompatible session or routing requirements. Publish HEALTHY only after a protocol-level initialization probe succeeds. Use task-specific completion checks for batch workloads.

## Build repair

Before submitting a build, reserve an attempt number under the task's persistent build budget. A duplicate delivery of the same attempt returns the existing result. Store the build artifact digest, failing instruction, redacted final 40 stderr lines and previous repairs. A failed Railpack build carries the plan and diagnostic context even when there was no previous Dockerfile. The model may propose a minimal Dockerfile replacement. Reject previously failed digests, rerun all admission checks, then allow another build only while the total is below three. A third failure or unsafe repair produces a terminal build error. Runtime retries reuse a successful image when its digest and policy still match.
