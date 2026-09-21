(() => {
  "use strict";

  const capabilities = [
    {
      title: "Jobs",
      contract: "abstraction.job/acceptance@1",
      intro: "Submit a background render, close the editor and return later to collect the finished frames. The job keeps its identity, progress and result across the editor’s lifetime.",
      sample: "window, err := jobs.GetHistoryWindow(ctx)\nif err != nil { return err }\n\nresult, err := jobs.Submit(ctx, jobapi.Submission{\n    Identity: jobapi.RequestIdentity{Key: stableKey, HistoryEpoch: window.HistoryEpoch},\n    Kind: kind, Spec: spec,\n    RequiredGuarantees: jobapi.AdmissionGuarantees,\n})\nif err != nil { return err }\nif result.Outcome != jobapi.AcceptanceOutcomeAccepted {\n    return fmt.Errorf(\"job: %s\", result.Outcome)\n}\noperationID := result.Receipt.OperationID",
      sampleLabel: "Submit durable work",
      sampleContext: "Application client. The job kind supplies kind and spec. Persist the request identity and selected binding before submitting; retain them to recover after interruption. Go excerpt; imports and client setup are omitted.",
      evidence: "The render illustrates the durable-job contract; it is not a claim of a shipped rendering provider. A compatible provider performs the work. The job API supplies acceptance, reconciliation, observation, cancellation and result retrieval. OA’s durable inference integration exercises background image generation through this job contract.",
      links: [["Job contract", "https://github.com/openabstractions/abstraction-job"], ["Durable inference example", "inference.html#lifetimes"]]
    },
    {
      title: "Verified downloads",
      contract: "abstraction.job/acceptance@1 + download request schema",
      intro: "Download a file through a compatible provider and verify its contents before use. An application supplies the sources, destination and expected fingerprint.",
      sample: "window, err := jobs.GetHistoryWindow(ctx)\nif err != nil { return err }\n\nspec := request.Encode(&request.Request{\n    Artifact: request.Artifact{Digest: digest, Size: size},\n    Sources:  []request.Source{{Scheme: \"https\", Locator: sourceURL}},\n})\nresult, err := jobs.Submit(ctx, jobapi.Submission{\n    Identity: jobapi.RequestIdentity{Key: stableKey, HistoryEpoch: window.HistoryEpoch},\n    Kind: download.Kind, Spec: spec,\n})\nif err != nil { return err }\nif result.Outcome != jobapi.AcceptanceOutcomeAccepted {\n    return fmt.Errorf(\"download: %s\", result.Outcome)\n}",
      sampleLabel: "Request a verified download",
      sampleContext: "Application client. Supply a pinned sourceURL, canonical sha256 digest and expected size. Persist the request identity and selected binding before submitting. Go excerpt; imports and client setup are omitted.",
      evidence: "ComfyUI is a node-based image generation editor. Its OA source adopter uses this path for missing model files. The download request is encoded as job work; the schema defines sources, integrity, destination, network rules, and credential names.",
      links: [["Download contract", "https://github.com/openabstractions/abstraction-download"], ["Download case", "cases.html"]]
    },
    {
      title: "Structured logging",
      contract: "abstraction.logging/sink@1",
      intro: "An application records useful events in one consistent format. An operator can choose where they go and inspect recent events from a separate tool.",
      sample: "err := sink.LogContext(ctx, int64(slog.LevelInfo), \"model opened\", map[string]string{\n    \"model\": \"flux-dev\",\n})\nif err != nil { return err }",
      sampleLabel: "Write a structured event",
      sampleContext: "Application client. sink is a resolved logging client. This sends a structured event; successful submission is not a durable-storage receipt. Go excerpt; imports and client setup are omitted.",
      evidence: "ComfyUI is a node-based image generation editor. Its OA source adopter can install an OA-backed root handler. The first-party OA Panel uses the reader and observer profiles for retained and live records.",
      links: [["Logging contract", "https://github.com/openabstractions/abstraction-logging"], ["Generated schema", "abstraction.logging.schema.html"]]
    },
    {
      title: "Configuration",
      contract: "abstraction.config/reader@1",
      intro: "An operator changes where OA stores jobs or sends logs. Applications and control tools see the same effective settings and where each value came from.",
      sample: "update, err := configObserver.ObserveContext(ctx, config.RunOverrides{}, \"\", 0)\nif err != nil { return err }\nif update.Outcome != config.ConfigObservationOutcomeSnapshot {\n    return fmt.Errorf(\"config: %s\", update.Outcome)\n}\nfmt.Printf(\"store=%s source=%s\\n\", update.Snapshot.Store, update.Snapshot.Origins.Store.Rung)",
      sampleLabel: "Read effective settings",
      sampleContext: "Application client. configObserver is a resolved configuration observer. An empty cursor reads the effective values and where they came from. Go excerpt; imports and client setup are omitted.",
      evidence: "The first-party OA Panel reads and replaces revisioned user settings, then follows effective configuration while preserving the operator's editing draft. The fixed fields are Store, NasStore, LogSink, LogService, and Off; reads accept bounded RunOverrides and return provenance.",
      links: [["Configuration contract", "https://github.com/openabstractions/abstraction-config"], ["Generated schema", "abstraction.config.schema.html"]]
    },
    {
      title: "Named credentials",
      contract: "abstraction.credentials/holder@1",
      intro: "Save an AI provider API key once instead of copying it into every application’s settings. Applications name the credential; an approved OA service uses it for requests to that provider.",
      sample: "defer clear(secret)\nresult, err := holder.Store(ctx, \"\", credentials.Registration{\n    Name: \"my-ai-api-key\", Kind: \"bearer\", Secret: secret,\n    Scope: credentials.Scope{\n        Targets:   []string{\"api.openai.com\"},\n        Consumers: []string{\"abstraction.inference/chat@1\"},\n    },\n})\nif err != nil { return err }\nif result.Outcome != credentials.StoreOutcomeStored {\n    return fmt.Errorf(\"credential: %s\", result.Outcome)\n}",
      sampleLabel: "Save an API key",
      sampleContext: "Operator setup. holder is a resolved credential holder. secret contains the entered API key as bytes; applications later refer to its name. Go excerpt; imports and client setup are omitted.",
      evidence: "OpenCode is a coding assistant. A controlled integration has exercised named credentials through OA, including revocation and checks that the secret does not appear in application output or logs. Applications read credential metadata; an authorized service applies the secret to its approved target.",
      links: [["Credentials source status", "coverage.html"], ["Catalogue entry", "catalogue.html"]]
    },
    {
      title: "Shared content storage",
      contract: "abstraction.storage/content-reader@1",
      intro: "A visual editor needs a model that may already exist on the machine. It asks OA to find those exact bytes before downloading another copy.",
      sample: "opened, err := content.Open(ctx, digest)\nif err != nil { return err }\nif opened.Outcome != storage.OpenOutcomeOpened {\n    return fmt.Errorf(\"storage: %s\", opened.Outcome)\n}\ndefer content.Close(context.WithoutCancel(ctx), *opened.Resource)\n\nchunk, err := content.Read(ctx, *opened.Resource, 0, 64*1024)\nif err != nil { return err }\nif chunk.Outcome != storage.ReadOutcomeData {\n    return fmt.Errorf(\"storage read: %s\", chunk.Outcome)\n}",
      sampleLabel: "Read a content chunk",
      sampleContext: "Application client. content is a resolved storage reader and digest identifies the content. Read further offsets to retrieve larger content. Go excerpt; imports and client setup are omitted.",
      evidence: "ComfyUI is a node-based image generation editor. Its OA source adopter can query OA storage before model acquisition. The content reader uses a contract-defined identity and bounded range; writer and change profiles require separate resolution and rights.",
      links: [["Storage contract", "https://github.com/openabstractions/abstraction-storage"], ["ComfyUI source adopter", "https://github.com/openabstractions/adopter-comfyui"]]
    },
    {
      title: "AI inference",
      contract: "abstraction.inference/chat@1",
      intro: "Add model-powered features such as chat, embeddings, image and video generation, or speech. OA connects requests to a compatible provider and applies the chosen local or remote execution requirements.",
      sample: "reply, err := chat.Complete(ctx, inference.Request{\n    Model: modelName,\n    Messages: []inference.Message{{\n        Role: inference.RoleUser,\n        Parts: []inference.Part{{Kind: inference.PartKindText, Text: prompt}},\n    }},\n    Options:    &inference.Options{MaxOutput: 128},\n    Guarantees: []inference.RequestGuarantee{inference.RequestGuaranteeLocalOnly},\n})\nif err != nil { return err }\nif reply.Outcome != inference.ReplyOutcomeCompleted {\n    return fmt.Errorf(\"inference: %s (%s)\", reply.Outcome, reply.Reason)\n}",
      sampleLabel: "Ask a model",
      sampleContext: "Application client. chat is a resolved inference client. Supply the model name and prompt; provider credentials stay with the service. Go excerpt; imports and client setup are omitted.",
      evidence: "OpenCode is a coding-agent application. A controlled source integration has exercised its requests through an OA-mediated provider route. The route pins the selected host generation; OA retains operation ownership and enforces execution placement.",
      links: [["Inference guide", "inference.html"], ["Generated API schema", "abstraction.inference.api.schema.html"], ["Inference source status", "coverage.html"]]
    },
    {
      title: "Applications and interaction",
      contract: "abstraction.facade/applications@1",
      intro: "Ask your assistant to work in another application: find the open project, propose an edit, and show you what would change inside that application. OA lets participating applications advertise their available tools and current context. With permission, it can also start a registered application when needed.",
      sample: "page, err := applications.Observe(ctx, \"\", 0)\nif err != nil { return err }\nif page.Outcome != facadewire.ApplicationOutcomePage {\n    return fmt.Errorf(\"applications: %s\", page.Outcome)\n}\nfor _, app := range page.Applications {\n    for _, instance := range app.Instances {\n        fmt.Printf(\"%s: %d contexts\\n\", app.Descriptor.Title, len(instance.Contexts))\n    }\n}",
      sampleLabel: "Find open applications",
      sampleContext: "Application client. applications is a resolved directory client. This lists visible applications and their current contexts. Invoking an app’s tools requires its integration and authorization. Go excerpt; imports and client setup are omitted.",
      evidence: "The working experiment uses ComfyUI, an application for generating images. Its integration lets an assistant propose a setting change and show a preview in the editor. The editor checks the current project before applying it. Each participating application supplies its own tools and interaction interface; available actions depend on that integration.",
      links: [["Applications evidence", "coverage.html"], ["Facade client", "https://github.com/openabstractions/abstraction-facade"]]
    },
{
    "title": "Model routing",
    "intro": "Find a suitable host for an AI model. A model already loaded on one host may serve the next request without loading another copy elsewhere.",
    "contract": "abstraction.router/router@1",
    sample: "result, err := routerClient.PickContext(ctx, router.PickRequest{\n    Model: modelName, Fresh: true, Profile: \"chat\",\n})\nif err != nil { return err }\nfmt.Printf(\"verdict=%s host=%s model=%s\\n\",\n    result.Decision.Verdict, result.Decision.Host, result.Decision.Model)",
    sampleLabel: "Choose a model host",
    sampleContext: "Application client. routerClient is a resolved router. Picking a host reports a choice; inference performs the model request. Go excerpt; imports and client setup are omitted.",
    "evidence": "Router reports model availability and route decisions. Loading and executing a model belong to the serving provider.",
    "links": [
        [
            "API and source",
            "https://github.com/openabstractions/abstraction-router"
        ],
        [
            "Implementation support",
            "coverage.html"
        ]
    ]
},
{
    "title": "Model lookup",
    "intro": "Find the weights behind a model name across stores that use different naming conventions. An image editor can turn a model reference into a download request.",
    "contract": "Model resolution",
    sample: "result, err := models.ResolveContext(ctx, model.Ref{\n    Registry: \"hf\", Repo: repo, Revision: revision, File: file,\n})\nif err != nil { return err }\nif result.Outcome != model.LookupOutcomeResolved {\n    return fmt.Errorf(\"model lookup: %s\", result.Outcome)\n}\ndownloadRequest := result.Request",
    sampleLabel: "Locate model weights",
    sampleContext: "Application client. models is a resolved model lookup client. Supply the repository, pinned revision and file name. Go excerpt; imports and client setup are omitted.",
    "evidence": "The runtime exercises model lookup followed by durable download submission. Model lookup describes how to obtain weights; inference runs models.",
    "links": [
        [
            "API and source",
            "https://github.com/openabstractions/abstraction-model"
        ],
        [
            "Implementation support",
            "coverage.html"
        ]
    ]
},
{
    "title": "Permissions",
    "intro": "Give a program permission to perform a specific action on a specific resource. Operators can inspect and revoke access from one place.",
    "contract": "abstraction.rights/authorization@1",
    sample: "decision, err := authorization.DecideContext(\n    ctx,\n    \"abstraction.storage/content.read\",\n    digest,\n)\nif err != nil { return err }\nif decision.Outcome != rights.DecisionOutcomePermitted {\n    return fmt.Errorf(\"content read: %s\", decision.Outcome)\n}",
    sampleLabel: "Check access",
    sampleContext: "Application client. authorization is a resolved rights client. This check is advisory; the storage service enforces permission when the actual read arrives. Go excerpt; imports and client setup are omitted.",
    "evidence": "OA services enforce rights for protected operations. Rules cover jobs, storage, credentials, inference and other capabilities. A permission decision must be enforced by the resource service.",
    "links": [
        [
            "API and source",
            "https://github.com/openabstractions/abstraction-rights"
        ],
        [
            "Implementation support",
            "coverage.html"
        ]
    ]
},
{
    "title": "Questions and answers",
    "intro": "When an application needs your decision, show who is asking and exactly what it wants to do. Answer from the OA panel while the requesting task waits, and retain the choice when appropriate.",
    "contract": "abstraction.asks/application@1",
    sample: "answer, err := questions.AskContext(ctx, asks.ApplicationQuestion{\n    RequestKey: \"model-download\",\n    Key:        \"download.reach\",\n    Slots:      map[string]string{\"host\": \"huggingface.co\"},\n})\nif err != nil { return err }\nswitch answer.Outcome {\ncase asks.ObservationOutcomePending:\n    // Retain the request key and observe it later.\ncase asks.ObservationOutcomeAnswered:\n    fmt.Println(answer.Answer.Option)\ndefault:\n    return fmt.Errorf(\"question: %s\", answer.Outcome)\n}",
    sampleLabel: "Ask about a download",
    sampleContext: "Application client. questions is a resolved question service. The service obtains caller identity from the connection; the application supplies the supported question and host. Go excerpt; imports and client setup are omitted.",
    "evidence": "The OA panel exercises first-use questions and permission changes. An answer and a permission grant are separate operations. Questions have service-owned wording and bounded options.",
    "links": [
        [
            "API and source",
            "https://github.com/openabstractions/abstraction-asks"
        ],
        [
            "Implementation support",
            "coverage.html"
        ]
    ]
},
{
    "title": "Caller identity",
    "intro": "See which application is asking for access before you grant it. OA obtains caller evidence from the local connection, helping services tie permission decisions to the program making the request.",
    "contract": "Native peer identity",
    sample: "caller, err := machine.ObserveCaller(ctx)\nif err != nil { return err }\nif caller.Outcome != facadewire.CallerOutcomeObserved {\n    return fmt.Errorf(\"identity: %s\", caller.Outcome)\n}\nfmt.Printf(\"account=%s program=%s bindable=%t\\n\",\n    caller.Account, caller.Program, caller.Bindable)",
    sampleLabel: "Inspect caller evidence",
    sampleContext: "Runtime diagnostic. machine is the installed OA runtime binding. This returns the caller evidence observed by that runtime. Go excerpt; imports and client setup are omitted.",
    "evidence": "Identity is shared infrastructure for local connections. Its proof strength depends on the operating system and connection; the coverage page records platform limitations.",
    "links": [
        [
            "API and source",
            "https://github.com/openabstractions/abstraction-identity"
        ],
        [
            "Implementation support",
            "coverage.html"
        ]
    ]
},
{
    "title": "Connecting applications · Facade",
    "intro": "An application needs downloads, AI inference or shared settings. Facade connects it to the capabilities available through OA on this machine. The application states what it needs; operators configure who supplies it. Facade also keeps track of registered providers and applications, including how to start an application and find its tools.",
    "contract": "Facade resolution, endpoint, registry and applications profiles",
    sample: "report, err := machine.Observe(ctx, facade.DefaultStatusRequests())\nif err != nil { return err }\nfor _, capability := range report.Capabilities {\n    if capability.Result == nil ||\n        capability.Result.Status != facadewire.ResolutionStatusResolved {\n        fmt.Printf(\"%s is unavailable\\n\", capability.Request.Capability)\n    }\n}",
    sampleLabel: "Inspect available capabilities",
    sampleContext: "Runtime diagnostic. machine is the installed OA runtime binding. Each capability has its own availability result. Go excerpt; imports and client setup are omitted.",
    "evidence": "Applications can inspect endpoint readiness, resolve a capability with required guarantees, discover registered applications and request their activation. Authorized operators manage provider declarations and follow their status. A resolved client keeps its selected binding; work already submitted retains its owner. Services enforce permission on each protected operation.",
    "links": [
        [
            "API and source",
            "https://github.com/openabstractions/abstraction-facade"
        ],
        [
            "Implementation support",
            "coverage.html"
        ]
    ]
},
{
    "title": "Safe file updates · CAS",
    "intro": "Help service authors update a small file safely when several processes may write it. A conditional update detects when another writer changed the value first.",
    "contract": "Direct provider utility",
    sample: "store := casapi.BoundedFileStore{MaxBytes: 64 * 1024}\nbase, err := store.Read(path)\nif err != nil { return err }\n\nerr = store.WriteContext(ctx, path, base, replacement)\nif errors.Is(err, cas.ErrMoved) {\n    return fmt.Errorf(\"state changed; reload before retrying: %w\", err)\n}\nreturn err",
    sampleLabel: "Update provider-owned state",
    sampleContext: "Provider utility. path belongs to the service that owns this state. The write succeeds only if the value still matches the one read. Go excerpt; imports and client setup are omitted.",
    "evidence": "CAS means compare-and-set. Providers compose this utility for persistence. It is a library utility; application clients normally use the service that owns the state.",
    "links": [
        [
            "API and source",
            "https://github.com/openabstractions/abstraction-cas"
        ],
        [
            "Implementation support",
            "coverage.html"
        ]
    ]
},
{
    "title": "Change observation · Watch",
    "intro": "Help provider authors turn changing data into a current snapshot and detect when it settles. Useful when an operating system sends a burst of notifications for one change.",
    "contract": "Direct provider utility",
    sample: "subscription := watch.Push(current, currentRevision, 250*time.Millisecond)\ndefer subscription.Close()\n\nsubscription.Post(next, nextRevision)\nfor {\n    notice, err := subscription.Next(ctx)\n    if err != nil { return err }\n    if notice.Quiet {\n        publishSettled(notice.Now)\n        break\n    }\n}",
    sampleLabel: "Wait for changes to settle",
    sampleContext: "Provider utility. Supply values and revision stamps. A quiet notice reports that the value settled for the chosen interval. Go excerpt; imports and client setup are omitted.",
    "evidence": "Watch provides Poll, Push and Settle utilities. Standalone adopter proof remains open. Applications use each capability’s observation API for job progress, settings or logs.",
    "links": [
        [
            "API and source",
            "https://github.com/openabstractions/abstraction-watch"
        ],
        [
            "Implementation support",
            "coverage.html"
        ]
    ]
}
  ];

  // Explanatory illustrations. Values demonstrate behavior; they are not live telemetry.
  const examples = {
    "Jobs": `<figure class="job-example"><figcaption>A background render continues across an editor restart · illustration</figcaption>
      <div class="lifetime"><strong>Render editor</strong><div class="life-track"><span>Running</span><span class="offline">Closed</span><span>Reopened</span></div></div>
      <div class="lifetime"><strong>Accepted job</strong><div class="life-track continuous">Rendering frames ━━━━━━━━━━━ Finished</div></div>
      <p>The editor keeps the job reference. On reopening, it retrieves the finished frames from the same job.</p></figure>`,
    "Verified downloads": `<figure class="download-example"><figcaption>When is a downloaded file ready to use? · illustration</figcaption>
      <div class="download-file"><strong>model.gguf</strong><span>Transfer complete</span></div>
      <dl class="check-values"><div><dt>Expected digest</dt><dd><code>sha256:8a2f…</code></dd></div><div><dt>Downloaded bytes</dt><dd><code>sha256:8a2f…</code></dd></div></dl>
      <p class="example-success">Match → verified result</p><p>A completed transfer with a different digest returns an integrity failure. The result distinguishes arrival from verification.</p></figure>`,
    "Structured logging": `<figure class="log-example"><figcaption>One view of events from several programs · illustrative log</figcaption>
      <pre><code>12:04:01  editor      info   model requested
12:04:02  downloader  info   transfer started
12:04:19  downloader  info   content verified
12:05:10  editor      info   model opened</code></pre>
      <p>A control tool can read retained events and follow new ones. Each program supplies useful context with its message.</p></figure>`,
    "Configuration": `<figure><figcaption>Which setting took effect, and why? · illustration</figcaption>
      <table class="example-table"><thead><tr><th>Source</th><th>Store setting</th></tr></thead><tbody><tr><td>Machine</td><td><code>/shared/oa</code></td></tr><tr class="chosen"><td>User · effective</td><td><code>/home/me/oa</code></td></tr><tr><td>This run</td><td>No override</td></tr></tbody></table>
      <p>The read includes the effective value and its source. An editor submits the revision it read; a conflicting edit is reported.</p></figure>`,
    "Named credentials": `<figure class="credential-example"><figcaption>One AI API key for your coding assistant and image editor · illustration</figcaption>
      <div class="credential-name"><span>Application request</span><code>credential: my-ai-api-key</code></div>
      <div class="secret-card"><strong>OA credential holder</strong><code>my-ai-api-key → ••••••••••••</code><small>Use restricted to an approved target</small></div>
      <p>Your coding assistant and image editor refer to the saved key by name. The inference service uses it only for an approved provider target. Revoke access centrally when an application no longer needs it.</p></figure>`,
    "Shared content storage": `<figure class="content-example"><figcaption>Several applications can refer to the same content · illustration</figcaption>
      <div class="content-apps"><span>Image editor</span><span>Model browser</span><span>Background worker</span></div>
      <div class="content-center"><small>Content identity</small><code>sha256:8a2f…</code><strong>One matching artifact</strong></div>
      <p>Storage resolves exact bytes across available stores. Each caller still needs permission to read them.</p></figure>`,
    "AI inference": `<figure><figcaption>Different model tasks, one family of capabilities · examples</figcaption>
      <dl class="modality-grid"><div><dt>Chat</dt><dd>Stream an assistant’s answer</dd></div><div><dt>Embeddings</dt><dd>Represent text for similarity search</dd></div><div><dt>Speech</dt><dd>Turn text into audio</dd></div><div><dt>Transcription</dt><dd>Turn audio into text</dd></div><div><dt>Live voice</dt><dd>Exchange audio during a conversation</dd></div><div><dt>Images</dt><dd>Submit generation as durable work</dd></div><div><dt>Video</dt><dd>Generate a clip as a durable job</dd></div></dl>
      <p>Each task has its own request and result. Provider support and the requested execution location determine availability.</p><p><a href="inference.html">Explore inference capabilities →</a></p></figure>`,
    "Applications and interaction": `<figure class="interaction-example"><figcaption>Your assistant proposes a change in your image editor · ComfyUI experiment</figcaption>
      <p><strong>You ask:</strong> “Use 24 generation steps for this image. Show me the change before applying it.”</p>
      <p>ComfyUI generates an image through a sequence of steps. Its KSampler control sets how many steps to run.</p>
      <div class="proposal"><span class="proposal-context">Open image project · KSampler control</span><h4>Generation steps</h4><div class="before-after"><span><small>Current</small><strong>20</strong></span><span aria-hidden="true">→</span><span><small>Proposed</small><strong>24</strong></span></div><p><strong>Waiting for your approval.</strong> This preview has not changed the project.</p></div>
      <p>OA helps the assistant find the editor and its interaction interface. The editor displays this proposal in the project you are working on. You apply the change there; the assistant can then check the result.</p></figure>`,
    "Model routing": `<figure><figcaption>Choosing where a model request should run · illustrative candidates</figcaption>
      <table class="example-table"><thead><tr><th>Host</th><th>Model state</th><th>Decision</th></tr></thead><tbody><tr class="chosen"><td>Local engine A</td><td>Already loaded</td><td>Suitable</td></tr><tr><td>Local engine B</td><td>Available to load</td><td>Would need loading</td></tr><tr><td>Hosted provider</td><td>Available</td><td>Excluded by local-only request</td></tr></tbody></table>
      <p>Routing considers model availability and the request’s constraints. It reports a choice; inference performs the model call.</p></figure>`,
    "Model lookup": `<figure class="lookup-example"><figcaption>From a model name to the files it needs · illustration</figcaption>
      <p class="model-reference"><code>registry / model / pinned revision</code></p>
      <dl class="lookup-record"><div><dt>Identity</dt><dd>Exact model and revision</dd></div><div><dt>Variant</dt><dd>Requested format or quantization</dd></div><div><dt>Sources</dt><dd>Where the weights can be obtained</dd></div><div><dt>Integrity</dt><dd>Published digests, when available</dd></div></dl>
      <p>The resolver produces a download request. Jobs and downloads manage acquiring the files.</p></figure>`,
    "Permissions": `<figure><figcaption>Access is specific to a program, an action and a resource · illustration</figcaption>
      <table class="example-table"><thead><tr><th>Program</th><th>Requested access</th><th>Rule</th></tr></thead><tbody><tr class="chosen"><td>Image editor</td><td>Submit a model download</td><td>Allowed</td></tr><tr><td>Image editor</td><td>Read another app’s credential</td><td>Refused</td></tr><tr><td>Control panel</td><td>Edit OA settings</td><td>Allowed</td></tr></tbody></table>
      <p>Resource services enforce these decisions. Operators inspect or revoke the individual rules.</p></figure>`,
    "Questions and answers": `<figure class="question-example"><figcaption>A model download needs your decision · illustrative ComfyUI request</figcaption>
      <div class="question-card"><small>Requesting application · ComfyUI</small><h4>May ComfyUI fetch files from huggingface.co?</h4><p>You selected a model hosted on this site. ComfyUI is waiting for your answer before fetching it.</p><p><strong>Caller program:</strong> <code>…/ComfyUI/python.exe</code></p><div class="answer-options"><span>Allow for this host</span><span>Allow once</span><span>Refuse</span></div></div>
      <p>“Allow for this host” retains the answer for this caller and host. “Allow once” answers the current request. “Refuse” declines it. The service still enforces the caller’s permissions.</p></figure>`,
    "Caller identity": `<figure class="identity-example"><figcaption>Know which application you are granting access to · illustrative permission prompt</figcaption>
      <div class="question-card"><small>Application requesting access · OpenCode</small><h4>Let OpenCode use your saved AI API key?</h4><dl class="identity-record"><div><dt>Calling program</dt><dd><code>…/OpenCode/opencode.exe</code></dd></div><div><dt>Requested credential</dt><dd><code>my-ai-api-key</code></dd></div><div><dt>Purpose</dt><dd>Send inference requests to its approved AI provider</dd></div></dl><div class="answer-options"><span>Allow this application</span><span>Refuse</span></div></div>
      <p>The program path comes from caller evidence for the connection. OpenCode is the display label in this illustration. Available identity evidence varies by operating system; the service checks that evidence before granting access.</p></figure>`,
    "Connecting applications · Facade": `<figure><figcaption>One application, the capabilities available on your machine · illustration</figcaption>
      <p>Your image editor starts up. It needs to find model files, generate an image and read the machine’s configured OA content-store location.</p>
      <table class="example-table"><thead><tr><th>The editor needs</th><th>Facade connects it to</th></tr></thead><tbody><tr><td>Find model files</td><td>Available model lookup service</td></tr><tr><td>Generate locally</td><td>Inference service with local execution</td></tr><tr><td>Read the OA store setting</td><td>Configuration service, with the source of that setting</td></tr></tbody></table>
      <p>The editor uses the same capability APIs on another machine. Its owner can configure different providers. If a required capability is unavailable, the editor gets an explicit result it can explain to the user.</p>
      <dl class="identity-record"><div><dt>For applications</dt><dd>Find capabilities and inspect whether they are ready.</dd></div><div><dt>For operators</dt><dd>Register providers and observe their status.</dd></div><div><dt>For assistants</dt><dd>Find registered applications and their advertised tools; request an authorized launch.</dd></div></dl></figure>`,
    "Safe file updates · CAS": `<figure class="cas-example"><figcaption>Two writers read the same value · illustration</figcaption>
      <div class="cas-base"><code>Stored value: A</code></div><div class="competing-writers"><div><strong>Writer one</strong><p>Replace A with B</p><span class="example-success">Succeeds</span></div><div><strong>Writer two</strong><p>Replace A with C</p><span>Moved — the value is now B</span></div></div>
      <p>The second writer can read the new value before deciding what to do. Conditional replacement protects the first update.</p></figure>`,
    "Change observation · Watch": `<figure class="watch-example"><figcaption>A burst of changes, followed by a quiet interval · illustration</figcaption>
      <svg viewBox="0 0 600 125" role="img" aria-label="Several source changes occur close together, then a quiet interval leads to a settled snapshot"><line x1="20" y1="70" x2="580" y2="70" stroke="currentColor" opacity=".4"/><path d="M40 70v-35m35 35v-50m40 50v-25m65 25v-45m35 45v-30" stroke="currentColor" stroke-width="3"/><path d="M255 30H545V80H255Z" fill="currentColor" opacity=".08"/><text x="28" y="108" fill="currentColor" font-size="17">Source changes</text><text x="285" y="58" fill="currentColor" font-size="17">Quiet interval</text><circle cx="550" cy="70" r="7" fill="currentColor"/></svg>
      <p>Watch reports the latest snapshot and whether it has settled for the requested interval. Providers can adapt either notifications or a source they must poll.</p></figure>`
  };

  const carousel = document.querySelector("#capability-carousel");
  const previous = document.querySelector("#capability-previous");
  const next = document.querySelector("#capability-next");
  const position = document.querySelector("#capability-position");
  const label = document.querySelector("#capability-label");
  const title = document.querySelector("#capability-title");
  const contract = document.querySelector("#capability-contract");
  const intro = document.querySelector("#capability-intro");
  const example = document.querySelector("#capability-example");
  const sample = document.querySelector("#capability-sample");
  const sampleContext = document.querySelector("#capability-sample-context");
  const sampleLabel = document.querySelector(".capability-detail summary");
  const evidence = document.querySelector("#capability-evidence");
  const links = document.querySelector("#capability-links");
  const picker = document.querySelector("#capability-picker");
  const choices = capabilities.map((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.title;
    button.setAttribute("aria-controls", "capability-card");
    button.addEventListener("click", () => renderCapability(index));
    return button;
  });
  if (picker) picker.replaceChildren(...choices);
  let capabilityIndex = 0;

  function renderCapability(index) {
    capabilityIndex = Math.max(0, Math.min(capabilities.length - 1, index));
    const item = capabilities[capabilityIndex];
    position.textContent = `${capabilityIndex + 1} of ${capabilities.length}`;
    label.textContent = item.title;
    title.textContent = item.title;
    contract.textContent = item.contract;
    intro.textContent = item.intro;
    sample.textContent = item.sample || "";
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
