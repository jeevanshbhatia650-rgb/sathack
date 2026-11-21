# From repository to task graph

## Evidence collection

Resolve each authorized repo and ref to a full commit before reading blobs. Walk its Git tree to depth three, skipping vendored dependencies, binaries, generated trees and submodules. Read regular blobs with individual byte limits. Ignore symlinks. Never import modules or run lifecycle scripts. Record the URL, SHA, tree, a README excerpt of at most 1,500 characters, root Dockerfile and manifest paths. Parse pyproject.toml and Cargo.toml as TOML, package.json as JSON, requirements.txt as dependency text and go.mod as module metadata.

For each candidate, record its working directory, argv, runtime, batch/service evidence, env key names, transport and a source path plus location. A README command or package script can identify an entrypoint. A filename alone supplies a candidate for investigation. Keep verified facts intact when selecting roughly 4,000 tokens for a model call. Mark omitted or ambiguous evidence explicitly.

## Model boundary

The manager sends the exact role prompt, the schema and a separate data message containing the request and bounded evidence. Treat repository text and logs as data, including text that resembles instructions. Use a tool-free model binding with structured output. The planner and containerizer each accept exactly one object matching either their success schema or the error schema. Recovery returns its decision or a manager-recorded invocation failure. Parse one complete JSON value, reject duplicate keys, trailing text and unknown fields, then validate using strict Pydantic models. Apply documented defaults before policy validation. Keep provider errors distinct from structured domain errors.

Persist the prompt hash, schema version, report digest and decision with the job. An invalid response closes that invocation without dispatch. Keep diagnostic details and credential values out of model retries.

## Plan admission

Bind job_id to the manager request. Reject an empty plan, duplicate task IDs, repeated or unknown parents and self edges before constructing the adjacency list. Resolve HEAD, null or omitted revisions against the immutable report and reject mismatched URLs or revisions. Resolve each workload to exactly one verified command and working directory. Validate env names against workload evidence and check required bindings by name. An absent binding blocks deployment. Keep argv as structured scanner data. Never interpret a proposed override as a shell expression.

Accept explicit data edges only with an artifact handoff, or service edges with a readiness contract. Imports and shared in-memory objects supply neither. Index child lists and indegrees, enqueue all zero-indegree IDs, then remove each outgoing edge once. If fewer than all tasks were visited, reject the whole plan. This costs O(V + E). Store the accepted plan atomically before any dispatch.
