# Runtime recovery

The worker emits attempt ID, event sequence, exit status, OOMKilled, recent bounded memory samples, health results and redacted log tail. For a batch exit of zero, publish outputs and mark completion. For a service's clean exit, remove readiness and apply its declared lifecycle policy without a model call. Route a build failure to build repair. Repeated failed probes, exit 1 or 2, runtime exceptions and unexplained exit 137 can open a runtime incident. Deduplicate by task attempt and incident identity.

Gather the last accepted decisions, remaining retry budget, env binding presence and current limits. The recovery agent proposes one enumerated action. The manager validates the reason against incident evidence. An invocation failure leaves the incident stopped for review.
