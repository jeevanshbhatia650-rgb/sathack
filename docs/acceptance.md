# Architecture acceptance cases

The [example plan](../examples/plan.json) uses a fictional pinned repository. Assume each of the four commands is verified in that revision. The catalog exposes a readiness endpoint. Both fetch tasks publish durable artifacts, and merge declares both as inputs.

| Event | Expected manager behavior |
| --- | --- |
| Plan admitted | Claim catalog and fetch_b independently. |
| Catalog becomes HEALTHY while fetch_b is still running | Claim fetch_a immediately. |
| Duplicate catalog health event | No second claim for fetch_a. |
| fetch_a exits 137 without OOM evidence | Gather diagnostics. A memory increase is ineligible on this fact alone. |
| fetch_a exits 137 with OOMKilled and an enforced 512 MB limit | With budget and capacity, reserve 768 MB for a restart-safe retry. Keep merge pending. |
| Both fetch artifacts are committed and both tasks complete | Claim merge once and pass the two artifact digests. |
| Prior fetch_a attempt reports a late failure | Discard its stale event. Preserve merge eligibility. |

Additional acceptance cases for implementation include rejecting a cyclic plan before worker selection, rejecting an unverified entrypoint, routing a supported manifest through Railpack without a model call, refusing a missing effective non-root user, refusing a fourth build attempt and stopping a repeated runtime repair on unchanged evidence. These are expected outcomes for future integration tests.
