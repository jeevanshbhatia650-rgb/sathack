# From repository to task graph

## Evidence collection

Resolve each authorized repo and ref to a full commit before reading blobs. Walk its Git tree to depth three, skipping vendored dependencies, binaries, generated trees and submodules. Read regular blobs with individual byte limits. Ignore symlinks. Never import modules or run lifecycle scripts. Record the URL, SHA, tree, a README excerpt of at most 1,500 characters, root Dockerfile and manifest paths. Parse pyproject.toml and Cargo.toml as TOML, package.json as JSON, requirements.txt as dependency text and go.mod as module metadata.

For each candidate, record its working directory, argv, runtime, batch/service evidence, env key names, transport and a source path plus location. A README command or package script can identify an entrypoint. A filename alone supplies a candidate for investigation. Keep verified facts intact when selecting roughly 4,000 tokens for a model call. Mark omitted or ambiguous evidence explicitly.
