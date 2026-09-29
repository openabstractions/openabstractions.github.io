(() => {
  "use strict";

  // Group order fixes carousel order too: every "foundations" item before
  // every "ai" item. Each capability below carries the source file its
  // evidence line traces to in a "// evidence:" comment beside it.
  const capabilities = [
    // --- Foundations ------------------------------------------------------
    {
      group: "foundations",
      title: "Structured logging",
      contract: "abstraction.logging/sink@1",
      intro: "An application records useful events in one consistent format. An operator can choose where they go and inspect recent events from a separate tool.",
      sampleKind: "Go",
      sample: "err := sink.LogContext(ctx, int64(slog.LevelInfo), \"model opened\", map[string]string{\n    \"model\": \"flux-dev\",\n})\nif err != nil { return err }",
      sampleLabel: "Write a structured event",
      sampleContext: "Application client. sink is a resolved logging client. This sends a structured event; successful submission is not a durable-storage receipt. Go excerpt; imports and client setup are omitted.",
      evidence: "ComfyUI is a node-based image generation editor. Its OA source adopter can install an OA-backed root handler. The first-party OA Panel uses the reader and observer profiles for retained and live records.",
      links: [["Logging contract", "https://github.com/openabstractions/abstraction-logging"], ["Generated schema", "abstraction.logging.schema.html"]]
    },
    {
      group: "foundations",
      title: "Configuration",
      contract: "abstraction.config/reader@1",
      intro: "You, or whoever administers the machine, change where OA stores jobs or sends logs. Applications and control tools see the same effective settings and where each value came from.",
      sampleKind: "Go",
      sample: "update, err := configObserver.ObserveContext(ctx, config.RunOverrides{}, \"\", 0)\nif err != nil { return err }\nif update.Outcome != config.ConfigObservationOutcomeSnapshot {\n    return fmt.Errorf(\"config: %s\", update.Outcome)\n}\nfmt.Printf(\"store=%s source=%s\\n\", update.Snapshot.Store, update.Snapshot.Origins.Store.Rung)",
      sampleLabel: "Read effective settings",
      sampleContext: "Application client. configObserver is a resolved configuration observer. An empty cursor reads the effective values and where they came from. Go excerpt; imports and client setup are omitted.",
      evidence: "The first-party OA Panel reads and replaces revisioned user settings, then follows effective configuration while preserving the operator's editing draft. The fixed fields are Store, NasStore, LogSink, LogService, and Off; reads accept bounded RunOverrides and return provenance.",
      links: [["Configuration contract", "https://github.com/openabstractions/abstraction-config"], ["Generated schema", "abstraction.config.schema.html"]]
    },
    {
      group: "foundations",
      title: "Jobs",
      contract: "abstraction.job/acceptance@1",
      intro: "Submit a background render, close the editor and return later to collect the finished frames. The job keeps its identity, progress and result across the editor’s lifetime.",
      sampleKind: "Go",
      sample: "window, err := jobs.GetHistoryWindow(ctx)\nif err != nil { return err }\n\nresult, err := jobs.Submit(ctx, jobapi.Submission{\n    Identity: jobapi.RequestIdentity{Key: stableKey, HistoryEpoch: window.HistoryEpoch},\n    Kind: kind, Spec: spec,\n    RequiredGuarantees: jobapi.AdmissionGuarantees,\n})\nif err != nil { return err }\nif result.Outcome != jobapi.AcceptanceOutcomeAccepted {\n    return fmt.Errorf(\"job: %s\", result.Outcome)\n}\noperationID := result.Receipt.OperationID",
      sampleLabel: "Submit durable work",
      sampleContext: "Application client. The job kind supplies kind and spec. Persist the request identity and selected binding before submitting; retain them to recover after interruption. Go excerpt; imports and client setup are omitted.",
      evidence: "The render illustrates the durable-job contract; it is not a claim of a shipped rendering provider. A compatible provider performs the work. The job API supplies acceptance, reconciliation, observation, cancellation and result retrieval. OA’s durable inference integration exercises background image generation through this job contract.",
      links: [["Job contract", "https://github.com/openabstractions/abstraction-job"], ["Durable inference example", "inference.html#lifetimes"]]
    },
    {
      group: "foundations",
      title: "Verified downloads",
      contract: "abstraction.job/acceptance@1 + download request schema",
      intro: "A download names its bytes by digest and enters the machine's one job table. A second request for the same digest reuses the accepted job, and the runtime delegates the transfer to a compatible provider.",
      sampleKind: "Go",
      sample: "window, err := jobs.GetHistoryWindow(ctx)\nif err != nil { return err }\n\nspec := request.Encode(&request.Request{\n    Artifact: request.Artifact{Digest: digest, Size: size},\n    Sources:  []request.Source{{Scheme: \"https\", Locator: sourceURL}},\n})\nresult, err := jobs.Submit(ctx, jobapi.Submission{\n    Identity: jobapi.RequestIdentity{Key: stableKey, HistoryEpoch: window.HistoryEpoch},\n    Kind: download.Kind, Spec: spec,\n})\nif err != nil { return err }\nif result.Outcome != jobapi.AcceptanceOutcomeAccepted {\n    return fmt.Errorf(\"download: %s\", result.Outcome)\n}",
      sampleLabel: "Request a deduped download",
      sampleContext: "Application client. Supply a pinned sourceURL, canonical sha256 digest and expected size. Persist the request identity and selected binding before submitting. Go excerpt; imports and client setup are omitted.",
      evidence: "ComfyUI is a node-based image generation editor. Its OA source adopter uses this path for missing model files. The download request is encoded as job work in one table per machine; the schema defines sources, integrity, destination, network rules, and credential names.",
      links: [["Download contract", "https://github.com/openabstractions/abstraction-download"], ["Download case", "cases.html"]]
    },
    {
      group: "foundations",
      title: "Shared content storage",
      contract: "abstraction.storage/content-reader@1",
      intro: "A visual editor needs a model that may already exist on the machine. It asks OA to find those exact bytes before downloading another copy.",
      sampleKind: "Go",
      sample: "opened, err := content.Open(ctx, digest)\nif err != nil { return err }\nif opened.Outcome != storage.OpenOutcomeOpened {\n    return fmt.Errorf(\"storage: %s\", opened.Outcome)\n}\ndefer content.Close(context.WithoutCancel(ctx), *opened.Resource)\n\nchunk, err := content.Read(ctx, *opened.Resource, 0, 64*1024)\nif err != nil { return err }\nif chunk.Outcome != storage.ReadOutcomeData {\n    return fmt.Errorf(\"storage read: %s\", chunk.Outcome)\n}",
      sampleLabel: "Read a content chunk",
      sampleContext: "Application client. content is a resolved storage reader and digest identifies the content. Read further offsets to retrieve larger content. Go excerpt; imports and client setup are omitted.",
      evidence: "ComfyUI is a node-based image generation editor. Its OA source adopter can query OA storage before model acquisition. The content reader uses a contract-defined identity and bounded range; writer and change profiles require separate resolution and rights.",
      links: [["Storage contract", "https://github.com/openabstractions/abstraction-storage"], ["ComfyUI source adopter", "https://github.com/openabstractions/adopter-comfyui"]]
    },
    {
      group: "foundations",
      title: "Permissions",
      intro: "Give a program permission to perform a specific action on a specific resource. Operators can inspect and revoke access from one place.",
      contract: "abstraction.rights/authorization@1",
      sampleKind: "Go",
      sample: "decision, err := authorization.DecideContext(\n    ctx,\n    \"abstraction.storage/content.read\",\n    digest,\n)\nif err != nil { return err }\nif decision.Outcome != rights.DecisionOutcomePermitted {\n    return fmt.Errorf(\"content read: %s\", decision.Outcome)\n}",
      sampleLabel: "Check access",
      sampleContext: "Application client. authorization is a resolved rights client. This check is advisory; the storage service enforces permission when the actual read arrives. Go excerpt; imports and client setup are omitted.",
      evidence: "OA services enforce rights for protected operations. Rules cover jobs, storage, credentials, inference and other capabilities. A permission decision must be enforced by the resource service.",
      links: [["API and source", "https://github.com/openabstractions/abstraction-rights"], ["Implementation support", "coverage.html"]]
    },
    {
      group: "foundations",
      title: "Questions and answers",
      intro: "When an application needs your decision, show who is asking and exactly what it wants to do. Answer from the OA panel while the requesting task waits, and retain the choice when appropriate.",
      contract: "abstraction.asks/application@1",
      sampleKind: "Go",
      sample: "answer, err := questions.AskContext(ctx, asks.ApplicationQuestion{\n    RequestKey: \"model-download\",\n    Key:        \"download.reach\",\n    Slots:      map[string]string{\"host\": \"huggingface.co\"},\n})\nif err != nil { return err }\nswitch answer.Outcome {\ncase asks.ObservationOutcomePending:\n    // Retain the request key and observe it later.\ncase asks.ObservationOutcomeAnswered:\n    fmt.Println(answer.Answer.Option)\ndefault:\n    return fmt.Errorf(\"question: %s\", answer.Outcome)\n}",
      sampleLabel: "Ask about a download",
      sampleContext: "Application client. questions is a resolved question service. The service obtains caller identity from the connection; the application supplies the supported question and host. Go excerpt; imports and client setup are omitted.",
      evidence: "The OA panel exercises first-use questions and permission changes. An answer and a permission grant are separate operations. Questions have service-owned wording and bounded options.",
      links: [["API and source", "https://github.com/openabstractions/abstraction-asks"], ["Implementation support", "coverage.html"]]
    },
    {
      group: "foundations",
      title: "Named credentials",
      contract: "abstraction.credentials/holder@1",
      intro: "Save an AI provider API key once instead of copying it into every application’s settings. Applications name the credential; an approved OA service uses it for requests to that provider.",
      sampleKind: "Go",
      sample: "defer clear(secret)\nresult, err := holder.Store(ctx, \"\", credentials.Registration{\n    Name: \"my-ai-api-key\", Kind: \"bearer\", Secret: secret,\n    Scope: credentials.Scope{\n        Targets:   []string{\"api.openai.com\"},\n        Consumers: []string{\"abstraction.inference/chat@1\"},\n    },\n})\nif err != nil { return err }\nif result.Outcome != credentials.StoreOutcomeStored {\n    return fmt.Errorf(\"credential: %s\", result.Outcome)\n}",
      sampleLabel: "Save an API key",
      sampleContext: "Operator setup. holder is a resolved credential holder. secret contains the entered API key as bytes; applications later refer to its name. Go excerpt; imports and client setup are omitted.",
      evidence: "OpenCode is a coding assistant. A controlled integration has exercised named credentials through OA, including revocation and checks that the secret does not appear in application output or logs. Applications read credential metadata; an authorized service applies the secret to its approved target.",
      links: [["Credentials source status", "coverage.html"], ["Catalogue entry", "catalogue.html"]]
    },
    {
      group: "foundations",
      title: "Caller identity",
      intro: "See which application is asking for access before you grant it. OA obtains caller evidence from the local connection, helping services tie permission decisions to the program making the request.",
      contract: "Native peer identity",
      sampleKind: "Go",
      sample: "caller, err := machine.ObserveCaller(ctx)\nif err != nil { return err }\nif caller.Outcome != facadewire.CallerOutcomeObserved {\n    return fmt.Errorf(\"identity: %s\", caller.Outcome)\n}\nfmt.Printf(\"account=%s program=%s bindable=%t\\n\",\n    caller.Account, caller.Program, caller.Bindable)",
      sampleLabel: "Inspect caller evidence",
      sampleContext: "Runtime diagnostic. machine is the installed OA runtime binding. This returns the caller evidence observed by that runtime. Go excerpt; imports and client setup are omitted.",
      evidence: "Identity is shared infrastructure for local connections. Its proof strength depends on the operating system and connection; the coverage page records platform limitations.",
      links: [["API and source", "https://github.com/openabstractions/abstraction-identity"], ["Implementation support", "coverage.html"]]
    },
    {
      group: "foundations",
      title: "Connecting applications · Facade",
      intro: "An application needs downloads, AI inference or shared settings. Facade connects it to the capabilities available through OA on this machine. The application states what it needs; operators configure who supplies it. Facade also keeps track of registered providers and applications, including how to start an application and find its tools.",
      contract: "Facade resolution, endpoint, registry and applications profiles",
      sampleKind: "Go",
      sample: "report, err := machine.Observe(ctx, facade.DefaultStatusRequests())\nif err != nil { return err }\nfor _, capability := range report.Capabilities {\n    if capability.Result == nil ||\n        capability.Result.Status != facadewire.ResolutionStatusResolved {\n        fmt.Printf(\"%s is unavailable\\n\", capability.Request.Capability)\n    }\n}",
      sampleLabel: "Inspect available capabilities",
      sampleContext: "Runtime diagnostic. machine is the installed OA runtime binding. Each capability has its own availability result. Go excerpt; imports and client setup are omitted.",
      evidence: "Applications can inspect endpoint readiness, resolve a capability with required guarantees, discover registered applications and request their activation. Authorized operators manage provider declarations and follow their status. A resolved client keeps its selected binding; work already submitted retains its owner. Services enforce permission on each protected operation.",
      links: [["API and source", "https://github.com/openabstractions/abstraction-facade"], ["Implementation support", "coverage.html"]]
    },
    {
      group: "foundations",
      title: "Applications and interaction",
      contract: "abstraction.facade/applications@1",
      intro: "Ask your assistant to work in another application: find the open project, propose an edit, and show you what would change inside that application. OA lets participating applications advertise their available tools and current context. With permission, it can also start a registered application when needed.",
      sampleKind: "Go",
      sample: "page, err := applications.Observe(ctx, \"\", 0)\nif err != nil { return err }\nif page.Outcome != facadewire.ApplicationOutcomePage {\n    return fmt.Errorf(\"applications: %s\", page.Outcome)\n}\nfor _, app := range page.Applications {\n    for _, instance := range app.Instances {\n        fmt.Printf(\"%s: %d contexts\\n\", app.Descriptor.Title, len(instance.Contexts))\n    }\n}",
      sampleLabel: "Find open applications",
      sampleContext: "Application client. applications is a resolved directory client. This lists visible applications and their current contexts. Invoking an app’s tools requires its integration and authorization. Go excerpt; imports and client setup are omitted.",
      evidence: "The working experiment uses ComfyUI, an application for generating images. Its integration lets an assistant propose a setting change and show a preview in the editor. The editor checks the current project before applying it. Each participating application supplies its own tools and interaction interface; available actions depend on that integration.",
      links: [["Applications evidence", "coverage.html"], ["Facade client", "https://github.com/openabstractions/abstraction-facade"]]
    },
    {
      group: "foundations",
      title: "Safe file updates · CAS",
      intro: "Help service authors update a small file safely when several processes may write it. A conditional update detects when another writer changed the value first.",
      contract: "Direct provider utility",
      sampleKind: "Go",
      sample: "store := casapi.BoundedFileStore{MaxBytes: 64 * 1024}\nbase, err := store.Read(path)\nif err != nil { return err }\n\nerr = store.WriteContext(ctx, path, base, replacement)\nif errors.Is(err, cas.ErrMoved) {\n    return fmt.Errorf(\"state changed; reload before retrying: %w\", err)\n}\nreturn err",
      sampleLabel: "Update provider-owned state",
      sampleContext: "Provider utility. path belongs to the service that owns this state. The write succeeds only if the value still matches the one read. Go excerpt; imports and client setup are omitted.",
      evidence: "CAS means compare-and-set. Providers compose this utility for persistence. It is a library utility; application clients normally use the service that owns the state.",
      links: [["API and source", "https://github.com/openabstractions/abstraction-cas"], ["Implementation support", "coverage.html"]]
    },
    {
      group: "foundations",
      title: "Change observation · Watch",
      intro: "Help provider authors turn changing data into a current snapshot and detect when it settles. Useful when an operating system sends a burst of notifications for one change.",
      contract: "Direct provider utility",
      sampleKind: "Go",
      sample: "subscription := watch.Push(current, currentRevision, 250*time.Millisecond)\ndefer subscription.Close()\n\nsubscription.Post(next, nextRevision)\nfor {\n    notice, err := subscription.Next(ctx)\n    if err != nil { return err }\n    if notice.Quiet {\n        publishSettled(notice.Now)\n        break\n    }\n}",
      sampleLabel: "Wait for changes to settle",
      sampleContext: "Provider utility. Supply values and revision stamps. A quiet notice reports that the value settled for the chosen interval. Go excerpt; imports and client setup are omitted.",
      evidence: "Watch provides Poll, Push and Settle utilities. Standalone adopter proof remains open. Applications use each capability’s observation API for job progress, settings or logs.",
      links: [["API and source", "https://github.com/openabstractions/abstraction-watch"], ["Implementation support", "coverage.html"]]
    },
    // --- AI on this machine ---------------------------------------------
    {
      group: "ai",
      title: "Model catalogue",
      contract: "abstraction.model/descriptor@1",
      intro: "Turn a model name into the exact files it needs. Every store this machine already has — Ollama, the Hugging Face cache, LM Studio, ComfyUI and the rest — reads the same descriptor for a model: architecture, quantisation, size, and what a file is a part of.",
      sampleKind: "Go",
      sample: "result, err := models.ResolveContext(ctx, model.Ref{\n    Registry: \"hf\", Repo: repo, Revision: revision, File: file,\n})\nif err != nil { return err }\nif result.Outcome != model.LookupOutcomeResolved {\n    return fmt.Errorf(\"model lookup: %s\", result.Outcome)\n}\ndownloadRequest := result.Request",
      sampleLabel: "Locate model weights",
      sampleContext: "Application client. models is a resolved model lookup client. Supply the repository, pinned revision and file name. Go excerpt; imports and client setup are omitted.",
      // evidence: research/abstraction-seats-2026-09-22.md §10 ("the descriptor is the identity every local store publishes and the router reads", R2, done 2026-09-22)
      evidence: "The descriptor is the one identity every local store publishes and the router reads, replacing a separate per-store guess. A projector or VAE names the family it belongs to through the same descriptor's role and base fields.",
      links: [["API and source", "https://github.com/openabstractions/abstraction-model"], ["Implementation support", "coverage.html"]]
    },
    {
      group: "ai",
      title: "Router",
      intro: "Find a suitable host for an AI model. A model already loaded on one host may serve the next request without loading another copy elsewhere, and the router reads the machine's own resource table to know what is really resident instead of asking each host to say so.",
      contract: "abstraction.router/router@1",
      sampleKind: "Go",
      sample: "result, err := routerClient.PickContext(ctx, router.PickRequest{\n    Model: modelName, Fresh: true, Profile: \"chat\",\n})\nif err != nil { return err }\nfmt.Printf(\"verdict=%s host=%s model=%s\\n\",\n    result.Decision.Verdict, result.Decision.Host, result.Decision.Model)",
      sampleLabel: "Choose a model host",
      sampleContext: "Application client. routerClient is a resolved router. Picking a host reports a choice; inference performs the model request. Go excerpt; imports and client setup are omitted.",
      // evidence: research/abstraction-seats-2026-09-22.md §11 (router row: "it reads declarations and the resource table instead of its compiled-in list and private residency")
      evidence: "Router reports model availability and route decisions. Loading and executing a model belong to the serving provider.",
      links: [["API and source", "https://github.com/openabstractions/abstraction-router"], ["Implementation support", "coverage.html"]]
    },
    {
      group: "ai",
      title: "AI inference",
      contract: "abstraction.inference/chat@1",
      intro: "Add model-powered features such as chat, embeddings, image and video generation, or speech. A program written for the OpenAI or Anthropic API, including their live voice connection, reaches a local or hosted model through OA with the same permission check and record.",
      sampleKind: "Go",
      sample: "reply, err := chat.Complete(ctx, inference.Request{\n    Model: modelName,\n    Messages: []inference.Message{{\n        Role: inference.RoleUser,\n        Parts: []inference.Part{{Kind: inference.PartKindText, Text: prompt}},\n    }},\n    Options:    &inference.Options{MaxOutput: 128},\n    Guarantees: []inference.RequestGuarantee{inference.RequestGuaranteeLocalOnly},\n})\nif err != nil { return err }\nif reply.Outcome != inference.ReplyOutcomeCompleted {\n    return fmt.Errorf(\"inference: %s (%s)\", reply.Outcome, reply.Reason)\n}",
      sampleLabel: "Ask a model",
      sampleContext: "Application client. chat is a resolved inference client. Supply the model name and prompt; provider credentials stay with the service. Go excerpt; imports and client setup are omitted.",
      // evidence: openabstractions-flat/abstraction-inference/adapters/go/gateway/window.go (nine routes, including GET /v1/realtime); CONTRACT.md INF-W8
      evidence: "OpenCode is a coding-agent application. A controlled source integration has exercised its requests through an OA-mediated provider route. The gateway window serves nine OpenAI- and Anthropic-shaped routes, including one Realtime WebSocket; the rights decision for the model it names is made before that connection's upgrade completes.",
      links: [["Inference guide", "inference.html"], ["Generated API schema", "abstraction.inference.api.schema.html"], ["Inference source status", "coverage.html"]]
    },
    {
      group: "ai",
      title: "Model host",
      contract: "abstraction.inference/chat@1 (served by abstraction-provider-modelhost), under abstraction.resource/leases@1",
      intro: "Point OA at a llama.cpp binary already installed on this machine. It loads the one file a caller asks for, answers chat and embeddings on it, and gives the card back under its own lease once nothing has touched it or the card is needed elsewhere.",
      sampleKind: "CLI",
      sample: "openabstractions models host jan/model.gguf --engine C:\\path\\to\\llama-server.exe\nopenabstractions models hosts",
      sampleLabel: "Host a file this machine already has",
      sampleContext: "Operator setup. The declaration names the store, the object and an installed llama-server binary; the runtime writes the provider one card:0 hold rule. An application then calls chat@1 with the declared name. CLI excerpt.",
      // evidence: openabstractions-flat/abstraction-provider-modelhost/README.md, "Measured" section
      evidence: "On 2026-09-22, hosting an 88,201,792-byte GGUF: the first chat call loaded it in 868 ms, the second reused the same load in 145 ms, and an embed@1 call answered in 10.6 ms. It answers only a caller that goes through chat@1; nothing here shares a loaded model with a program that did not.",
      links: [["Source status", "catalogue.html#abstraction-provider-modelhost"], ["Sharing the card", "cases.html#share-card"]]
    },
    {
      group: "ai",
      title: "Sharing the graphics card",
      contract: "abstraction.resource/table@1 + abstraction.resource/leases@1",
      intro: "See which programs hold graphics memory now, measured where the system can measure it. When a program asks for room, OA asks the current holders to give some back before it says no.",
      sampleKind: "Go",
      sample: "table, err := machine.ResolveResourceTable(ctx, client.Requirements{})\nif err != nil { return err }\nrows, err := table.Holders(ctx, \"card:0\", true)\nif err != nil { return err }\n\nleases, err := machine.ResolveResourceLeases(ctx, client.Requirements{})\nif err != nil { return err }\nlease, err := leases.Acquire(ctx, resource.AcquireRequest{Resource: \"card:0\", AmountBytes: needed})\nif err != nil { return err }\nif lease.Outcome != resource.AcquireOutcomeAcquired {\n    return fmt.Errorf(\"card:0: %s\", lease.Outcome)\n}",
      sampleLabel: "Ask for room on the card",
      sampleContext: "Application or provider client. table and leases are resolved resource clients. A holder that predates OA is yielded through its own unload mechanism. Go excerpt; imports and client setup are omitted.",
      // evidence: research/resources/COMFY-CARD-2026-09-22.md, sections 1 and 3
      evidence: "On the owner's machine a render asked for 106.13 GiB of a 123.65 GiB pool while LM Studio held one model; LM Studio yielded 21,446,795,264 bytes in 7.305 s, the lease was granted, and the render proceeded on the freed bytes. A deny rule on the same host changed the same ask to a refusal in 146 ms, with LM Studio's model still loaded.",
      links: [["Sharing the card, in full", "cases.html#share-card"], ["Source status", "catalogue.html#abstraction-resource"]]
    },
    {
      group: "ai",
      title: "Lending a model file",
      contract: "abstraction.storage/lend@1",
      intro: "A model file one store already holds — Ollama's blobs, the Hugging Face cache, LM Studio, Jan — is linked into another installed engine's own folder, so that engine serves it without a second download.",
      sampleKind: "CLI",
      sample: "openabstractions models lend jan/model.gguf --to lmstudio\nopenabstractions models lends\nopenabstractions models unlend <entry>",
      sampleLabel: "Lend a file to an installed engine",
      sampleContext: "Operator setup. Writing into another program's folder needs a first-use permission, the same as any other program right. The original file is never moved, renamed or deleted. CLI excerpt.",
      // evidence: openabstractions-flat/abstraction-provider-modelbridge/README.md, "Measured" section; research/abstraction-seats-2026-09-22.md line 349
      evidence: "On 2026-09-22 a 45,949,216-byte GGUF from the jan store was hard-linked into LM Studio's models folder in 6.3 seconds end to end. LM Studio listed it under its own derived name inside the 30-second window, and unlend removed the link and its directories again. The first lend attempt was refused until the operator granted the rule.",
      links: [["Model lent once, served twice", "cases.html#lend-once"], ["Source status", "catalogue.html#abstraction-provider-modelbridge"]]
    },
    {
      group: "ai",
      title: "The stores already on this machine",
      contract: "abstraction.storage/inventory-source@1",
      intro: "Ollama, the Hugging Face cache, LM Studio, ComfyUI, Jan and the rest each keep their own model folder and their own idea of what is in it. One inventory reads all of them and says which store holds what, writing nothing.",
      sampleKind: "CLI",
      sample: "inventoryd snapshot --json\nopenabstractions probe --json",
      sampleLabel: "Read what this machine already holds",
      sampleContext: "Provider diagnostic and runtime probe. inventoryd snapshot lists every store, object and digest the provider found; probe reads the same composition through the runtime once a store is declared. CLI excerpt.",
      // evidence: research/model-bridge/DECISION.md, "Slice 1, measured, 2026-09-22"
      evidence: "A live composition through the runtime read six declared stores in 3.5 seconds: comfyui 5 records, huggingface 16, lmstudio 8, jan 1, fastflowlm 1, ollama 0. The router then listed 25 model families, and 19 of them were held on this machine and served by no host — the gap lending and hosting close.",
      links: [["Source status", "catalogue.html#abstraction-storage-over-local-stores"], ["Model lent once, served twice", "cases.html#lend-once"]]
    },
    {
      group: "ai",
      title: "MCP gateway for assistants",
      contract: "Development MCP gateway over abstraction.inference/*@1 and abstraction.facade/applications@1",
      intro: "Give an MCP-compatible assistant a bounded set of OA tools: list models and open applications, ask a model a bounded question, and submit, watch or cancel a durable inference job.",
      sampleKind: "MCP tools",
      sample: "oa_applications_list\noa_models_list\noa_inference_complete\noa_inference_job_submit\noa_inference_job_status\noa_inference_job_cancel",
      sampleLabel: "The gateway's six tools",
      sampleContext: "Source-built development adapter, run over stdio. OA checks permissions against the gateway executable's own program identity; every session using that executable shares its permissions. Tool-name excerpt.",
      // evidence: ARCHITECTURE.md, "the development MCP gateway exposes a curated set of OA capabilities under an explicitly authorized integration principal"
      evidence: "Application editing needs a separate, application-specific adapter; this gateway's own application-listing tool exposes discovery metadata and no edit capability of its own.",
      links: [["Gateway setup", "adopt.html#mcp"], ["Implementation support", "coverage.html"]]
    }
  ];

  // Explanatory illustrations. Values demonstrate behavior; they are not live telemetry.
  const examples = {
    "Model catalogue": `<figure class="lookup-example"><figcaption>From a model name to the files it needs · illustration</figcaption>
      <p class="model-reference"><code>registry / model / pinned revision</code></p>
      <dl class="lookup-record"><div><dt>Identity</dt><dd>Exact model and revision</dd></div><div><dt>Descriptor</dt><dd>Architecture, quantisation, size, what it is a part of</dd></div><div><dt>Sources</dt><dd>Where the weights can be obtained</dd></div><div><dt>Integrity</dt><dd>Published digests, when available</dd></div></dl>
      <p>The resolver produces a download request. Jobs and downloads manage acquiring the files.</p></figure>`,
    "Router": `<figure><figcaption>Choosing where a model request should run · illustrative candidates</figcaption>
      <table class="example-table"><thead><tr><th>Host</th><th>Model state</th><th>Decision</th></tr></thead><tbody><tr class="chosen"><td>Local engine A</td><td>Already loaded</td><td>Suitable</td></tr><tr><td>Local engine B</td><td>Available to load</td><td>Would need loading</td></tr><tr><td>Hosted provider</td><td>Available</td><td>Excluded by local-only request</td></tr></tbody></table>
      <p>Routing considers model availability and the request’s constraints. It reports a choice; inference performs the model call.</p></figure>`,
    "AI inference": `<figure><figcaption>Different model tasks, one family of capabilities · examples</figcaption>
      <dl class="modality-grid"><div><dt>Chat</dt><dd>Stream an assistant’s answer</dd></div><div><dt>Embeddings</dt><dd>Represent text for similarity search</dd></div><div><dt>Speech</dt><dd>Turn text into audio</dd></div><div><dt>Transcription</dt><dd>Turn audio into text</dd></div><div><dt>Realtime voice</dt><dd>One WebSocket turn over the gateway window</dd></div><div><dt>Images</dt><dd>Submit generation as durable work</dd></div><div><dt>Video</dt><dd>Generate a clip as a durable job</dd></div></dl>
      <p>Each task has its own request and result. Provider support and the requested execution location determine availability.</p><p><a href="inference.html">Explore inference capabilities →</a></p></figure>`,
    "Model host": `<figure class="content-example"><figcaption>One file, loaded once, answered under a lease · illustration</figcaption>
      <div class="content-apps"><span>Coding assistant</span><span>Chat app</span></div>
      <div class="content-center"><small>Hosted object</small><code>jan/model.gguf</code><strong>One resident load</strong></div>
      <p>Every caller that reaches it through chat@1 shares that one load. Asking the card back stops the engine and releases the lease.</p></figure>`,
    "Sharing the graphics card": `<figure class="download-example"><figcaption>Two programs, one card · illustration</figcaption>
      <div class="download-file"><strong>card:0</strong><span>106.13 GiB asked, 100.13 GiB free</span></div>
      <dl class="check-values"><div><dt>Holder asked</dt><dd><code>host:lmstudio</code></dd></div><div><dt>Answer</dt><dd><code>yielded, 21.4 GB, 7.3 s</code></dd></div></dl>
      <p class="example-success">Lease granted → render proceeds</p><p>A deny rule on the same holder turns the identical ask into a refusal in under a second, with the model still loaded.</p></figure>`,
    "Lending a model file": `<figure class="content-example"><figcaption>A file one store holds, served by another engine · illustration</figcaption>
      <div class="content-apps"><span>jan store</span><span>LM Studio</span></div>
      <div class="content-center"><small>Link, not a copy</small><code>hard link</code><strong>Listed in 30 seconds</strong></div>
      <p>The original file never moves. Unlend removes the link; the source stays exactly where it was.</p></figure>`,
    "The stores already on this machine": `<figure><figcaption>Nine stores, one inventory · illustration</figcaption>
      <table class="example-table"><thead><tr><th>Store</th><th>What it holds</th></tr></thead><tbody><tr><td>Ollama</td><td>Its own blob store</td></tr><tr><td>Hugging Face cache</td><td>Downloaded repositories</td></tr><tr class="chosen"><td>LM Studio</td><td>Models plus lent links</td></tr><tr><td>ComfyUI, Jan, and more</td><td>Their own model trees</td></tr></tbody></table>
      <p>The inventory reads directory listings, sizes and each store’s own index. It writes nothing.</p></figure>`,
    "MCP gateway for assistants": `<figure class="content-example"><figcaption>A curated tool surface for an assistant · illustration</figcaption>
      <div class="content-apps"><span>Discovery</span><span>One response</span><span>Durable jobs</span></div>
      <div class="content-center"><small>Six tools</small><code>oa_*</code><strong>Bound to the gateway’s own identity</strong></div>
      <p>OA checks permission against the gateway executable itself. Editing an application’s own document needs that application’s separate adapter.</p></figure>`,
    "Structured logging": `<figure class="log-example"><figcaption>One view of events from several programs · illustrative log</figcaption>
      <pre><code>12:04:01  editor      info   model requested
12:04:02  downloader  info   transfer started
12:04:19  downloader  info   content verified
12:05:10  editor      info   model opened</code></pre>
      <p>A control tool can read retained events and follow new ones. Each program supplies useful context with its message.</p></figure>`,
    "Configuration": `<figure><figcaption>Which setting took effect, and why? · illustration</figcaption>
      <table class="example-table"><thead><tr><th>Source</th><th>Store setting</th></tr></thead><tbody><tr><td>Machine</td><td><code>/shared/oa</code></td></tr><tr class="chosen"><td>User · effective</td><td><code>/home/me/oa</code></td></tr><tr><td>This run</td><td>No override</td></tr></tbody></table>
      <p>The read includes the effective value and its source. An editor submits the revision it read; a conflicting edit is reported.</p></figure>`,
    "Jobs": `<figure class="job-example"><figcaption>A background render continues across an editor restart · illustration</figcaption>
      <div class="lifetime"><strong>Render editor</strong><div class="life-track"><span>Running</span><span class="offline">Closed</span><span>Reopened</span></div></div>
      <div class="lifetime"><strong>Accepted job</strong><div class="life-track continuous">Rendering frames ━━━━━━━━━━━ Finished</div></div>
      <p>The editor keeps the job reference. On reopening, it retrieves the finished frames from the same job.</p></figure>`,
    "Verified downloads": `<figure class="download-example"><figcaption>When is a downloaded file ready to use? · illustration</figcaption>
      <div class="download-file"><strong>model.gguf</strong><span>Transfer complete</span></div>
      <dl class="check-values"><div><dt>Expected digest</dt><dd><code>sha256:8a2f…</code></dd></div><div><dt>Downloaded bytes</dt><dd><code>sha256:8a2f…</code></dd></div></dl>
      <p class="example-success">Match → verified result</p><p>A completed transfer with a different digest returns an integrity failure. The result distinguishes arrival from verification.</p></figure>`,
    "Shared content storage": `<figure class="content-example"><figcaption>Several applications can refer to the same content · illustration</figcaption>
      <div class="content-apps"><span>Image editor</span><span>Model browser</span><span>Background worker</span></div>
      <div class="content-center"><small>Content identity</small><code>sha256:8a2f…</code><strong>One matching artifact</strong></div>
      <p>Storage resolves exact bytes across available stores. Each caller still needs permission to read them.</p></figure>`,
    "Permissions": `<figure><figcaption>Access is specific to a program, an action and a resource · illustration</figcaption>
      <table class="example-table"><thead><tr><th>Program</th><th>Requested access</th><th>Rule</th></tr></thead><tbody><tr class="chosen"><td>Image editor</td><td>Submit a model download</td><td>Allowed</td></tr><tr><td>Image editor</td><td>Read another app’s credential</td><td>Refused</td></tr><tr><td>Control panel</td><td>Edit OA settings</td><td>Allowed</td></tr></tbody></table>
      <p>Resource services enforce these decisions. Operators inspect or revoke the individual rules.</p></figure>`,
    "Questions and answers": `<figure class="question-example"><figcaption>A model download needs your decision · illustrative ComfyUI request</figcaption>
      <div class="question-card"><small>Requesting application · ComfyUI</small><h4>May ComfyUI fetch files from huggingface.co?</h4><p>You selected a model hosted on this site. ComfyUI is waiting for your answer before fetching it.</p><p><strong>Caller program:</strong> <code>…/ComfyUI/python.exe</code></p><div class="answer-options"><span>Allow for this host</span><span>Allow once</span><span>Refuse</span></div></div>
      <p>“Allow for this host” retains the answer for this caller and host. “Allow once” answers the current request. “Refuse” declines it. The service still enforces the caller’s permissions.</p></figure>`,
    "Named credentials": `<figure class="credential-example"><figcaption>One AI API key for your coding assistant and image editor · illustration</figcaption>
      <div class="credential-name"><span>Application request</span><code>credential: my-ai-api-key</code></div>
      <div class="secret-card"><strong>OA credential holder</strong><code>my-ai-api-key → ••••••••••••</code><small>Use restricted to an approved target</small></div>
      <p>Your coding assistant and image editor refer to the saved key by name. The inference service uses it only for an approved provider target. Revoke access centrally when an application no longer needs it.</p></figure>`,
    "Caller identity": `<figure class="identity-example"><figcaption>Know which application you are granting access to · illustrative permission prompt</figcaption>
      <div class="question-card"><small>Application requesting access · OpenCode</small><h4>Let OpenCode use your saved AI API key?</h4><dl class="identity-record"><div><dt>Calling program</dt><dd><code>…/OpenCode/opencode.exe</code></dd></div><div><dt>Requested credential</dt><dd><code>my-ai-api-key</code></dd></div><div><dt>Purpose</dt><dd>Send inference requests to its approved AI provider</dd></div></dl><div class="answer-options"><span>Allow this application</span><span>Refuse</span></div></div>
      <p>The program path comes from caller evidence for the connection. OpenCode is the display label in this illustration. Available identity evidence varies by operating system; the service checks that evidence before granting access.</p></figure>`,
    "Connecting applications · Facade": `<figure><figcaption>One application, the capabilities available on your machine · illustration</figcaption>
      <p>Your image editor starts up. It needs to find model files, generate an image and read the machine’s configured OA content-store location.</p>
      <table class="example-table"><thead><tr><th>The editor needs</th><th>Facade connects it to</th></tr></thead><tbody><tr><td>Find model files</td><td>Available model lookup service</td></tr><tr><td>Generate locally</td><td>Inference service with local execution</td></tr><tr><td>Read the OA store setting</td><td>Configuration service, with the source of that setting</td></tr></tbody></table>
      <p>The editor uses the same capability APIs on another machine. Its owner can configure different providers. If a required capability is unavailable, the editor gets an explicit result it can explain to the user.</p>
      <dl class="identity-record"><div><dt>For applications</dt><dd>Find capabilities and inspect whether they are ready.</dd></div><div><dt>For operators</dt><dd>Register providers and observe their status.</dd></div><div><dt>For assistants</dt><dd>Find registered applications and their advertised tools; request an authorized launch.</dd></div></dl></figure>`,
    "Applications and interaction": `<figure class="interaction-example"><figcaption>Your assistant proposes a change in your image editor · ComfyUI experiment</figcaption>
      <p><strong>You ask:</strong> “Use 24 generation steps for this image. Show me the change before applying it.”</p>
      <p>ComfyUI generates an image through a sequence of steps. Its KSampler control sets how many steps to run.</p>
      <div class="proposal"><span class="proposal-context">Open image project · KSampler control</span><h4>Generation steps</h4><div class="before-after"><span><small>Current</small><strong>20</strong></span><span aria-hidden="true">→</span><span><small>Proposed</small><strong>24</strong></span></div><p><strong>Waiting for your approval.</strong> This preview has not changed the project.</p></div>
      <p>OA helps the assistant find the editor and its interaction interface. The editor displays this proposal in the project you are working on. You apply the change there; the assistant can then check the result.</p></figure>`,
    "Safe file updates · CAS": `<figure class="cas-example"><figcaption>Two writers read the same value · illustration</figcaption>
      <div class="cas-base"><code>Stored value: A</code></div><div class="competing-writers"><div><strong>Writer one</strong><p>Replace A with B</p><span class="example-success">Succeeds</span></div><div><strong>Writer two</strong><p>Replace A with C</p><span>Moved — the value is now B</span></div></div>
      <p>The second writer can read the new value before deciding what to do. Conditional replacement protects the first update.</p></figure>`,
    "Change observation · Watch": `<figure class="watch-example"><figcaption>A burst of changes, followed by a quiet interval · illustration</figcaption>
      <svg viewBox="0 0 600 125" role="img" aria-label="Several source changes occur close together, then a quiet interval leads to a settled snapshot"><line x1="20" y1="70" x2="580" y2="70" stroke="currentColor" opacity=".4"/><path d="M40 70v-35m35 35v-50m40 50v-25m65 25v-45m35 45v-30" stroke="currentColor" stroke-width="3"/><path d="M255 30H545V80H255Z" fill="currentColor" opacity=".08"/><text x="28" y="108" fill="currentColor" font-size="17">Source changes</text><text x="285" y="58" fill="currentColor" font-size="17">Quiet interval</text><circle cx="550" cy="70" r="7" fill="currentColor"/></svg>
      <p>Watch reports the latest snapshot and whether it has settled for the requested interval. Providers can adapt either notifications or a source they must poll.</p></figure>`
  };

  const groupNames = { ai: "AI on this machine", foundations: "Foundations" };

  // Plain-phrase titles carry a technical tag word after " · ". The tag word
  // gets a title attribute with one plain sentence, so a reader can hover it
  // without leaving the carousel.
  const tagTooltips = {
    Facade: "The library that finds services for an application",
    CAS: "Replaces a shared file only if nobody else changed it first",
    Watch: "Tells an application when something it watches changes"
  };

  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function titleMarkup(itemTitle) {
    const match = itemTitle.match(/^(.*) · (Facade|CAS|Watch)$/);
    if (!match) return escapeHtml(itemTitle);
    const [, phrase, tag] = match;
    return `${escapeHtml(phrase)} · <span class="tag-word" title="${escapeHtml(tagTooltips[tag])}">${escapeHtml(tag)}</span>`;
  }

  const carousel = document.querySelector("#capability-carousel");
  const previous = document.querySelector("#capability-previous");
  const next = document.querySelector("#capability-next");
  const position = document.querySelector("#capability-position");
  const label = document.querySelector("#capability-label");
  const groupLabel = document.querySelector("#capability-group-label");
  const title = document.querySelector("#capability-title");
  const contract = document.querySelector("#capability-contract");
  const intro = document.querySelector("#capability-intro");
  const example = document.querySelector("#capability-example");
  const sample = document.querySelector("#capability-sample");
  const sampleHeading = document.querySelector("#capability-sample-heading");
  const sampleContext = document.querySelector("#capability-sample-context");
  const sampleLabel = document.querySelector(".capability-detail summary");
  const evidence = document.querySelector("#capability-evidence");
  const links = document.querySelector("#capability-links");
  const pickers = {
    ai: document.querySelector("#capability-picker-ai"),
    foundations: document.querySelector("#capability-picker-foundations")
  };
  const choices = capabilities.map((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.title;
    button.setAttribute("aria-controls", "capability-card");
    button.addEventListener("click", () => renderCapability(index));
    return button;
  });
  capabilities.forEach((item, index) => {
    const target = pickers[item.group];
    if (target) target.appendChild(choices[index]);
  });
  let capabilityIndex = 0;
  let capabilityRendered = false;
  const card = document.querySelector("#capability-card");
  let highlightTimer = null;

  function highlightCard() {
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const inView = rect.top >= 0 && rect.bottom <= viewportHeight;
    if (!inView) card.scrollIntoView({ block: "nearest" });
    card.classList.remove("capability-card-highlight");
    // Force reflow so a repeated highlight restarts its animation.
    void card.offsetWidth;
    card.classList.add("capability-card-highlight");
    if (highlightTimer) window.clearTimeout(highlightTimer);
    highlightTimer = window.setTimeout(() => card.classList.remove("capability-card-highlight"), 600);
  }

  function renderCapability(index) {
    capabilityIndex = Math.max(0, Math.min(capabilities.length - 1, index));
    const item = capabilities[capabilityIndex];
    position.textContent = `${capabilityIndex + 1} of ${capabilities.length}`;
    label.textContent = item.title;
    if (groupLabel) groupLabel.textContent = groupNames[item.group] || "";
    title.innerHTML = titleMarkup(item.title);
    contract.textContent = item.contract;
    intro.textContent = item.intro;
    sample.textContent = item.sample || "";
    if (sampleHeading) sampleHeading.textContent = `${item.sampleKind || "Go"} usage example`;
    if (sampleContext) sampleContext.textContent = item.sampleContext || "";
    if (sampleLabel) sampleLabel.textContent = item.sampleLabel || "Use this capability";
    sample.closest(".capability-sample").hidden = !item.sample;
    choices.forEach((button, choice) => button.setAttribute("aria-pressed", String(choice === capabilityIndex)));
    evidence.textContent = item.evidence;
    example.innerHTML = examples[item.title];
    links.replaceChildren(...item.links.map(([linkLabel, href]) => {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = `${linkLabel} →`;
      return link;
    }));
    previous.disabled = capabilityIndex === 0;
    next.disabled = capabilityIndex === capabilities.length - 1;
    // Skip the highlight on the initial page-load render; only a selection
    // change should scroll the panel into view and flash it.
    if (capabilityRendered) highlightCard();
    capabilityRendered = true;
  }

  if (carousel && previous && next && position && label && title && contract && intro && example && sample && evidence && links) {
    renderCapability(0);
    previous.addEventListener("click", () => renderCapability(capabilityIndex - 1));
    next.addEventListener("click", () => renderCapability(capabilityIndex + 1));
    carousel.addEventListener("keydown", (event) => {
      if (event.target !== carousel) return;
      let destination = null;
      if (event.key === "ArrowLeft") destination = capabilityIndex - 1;
      if (event.key === "ArrowRight") destination = capabilityIndex + 1;
      if (event.key === "Home") destination = 0;
      if (event.key === "End") destination = capabilities.length - 1;
      if (destination !== null) {
        event.preventDefault();
        renderCapability(destination);
      }
    });
  }

})();
