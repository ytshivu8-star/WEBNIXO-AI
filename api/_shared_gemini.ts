import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiInstance: GoogleGenAI | null = null;
export function getGeminiAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it in your Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

export async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  activeModel: string,
  contents: any,
  config: any,
  maxRetries = 2
) {
  let attempt = 0;
  let currentModel = activeModel;

  const modelFallbackSequence = [
    "gemini-3.1-pro-preview",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite"
  ];

  while (true) {
    try {
      console.log(`[Gemini API Info] Requesting ${currentModel} (attempt ${attempt + 1}/${maxRetries + 1})...`);
      const response = await ai.models.generateContent({
        model: currentModel,
        contents,
        config,
      });
      return response;
    } catch (error: any) {
      attempt++;
      
      const errorStr = (error?.message || "").toLowerCase();
      const isQuotaExceeded = 
        error?.status === 'RESOURCE_EXHAUSTED' || 
        error?.code === 429 || 
        error?.status === 429 ||
        errorStr.includes("429") || 
        errorStr.includes("resource_exhausted") ||
        errorStr.includes("quota") ||
        errorStr.includes("rate limit") ||
        errorStr.includes("limit exceeded");

      const isTransient = 
        error?.status === 'UNAVAILABLE' || 
        error?.code === 503 || 
        error?.status === 503 ||
        errorStr.includes("503") || 
        errorStr.includes("high demand") ||
        errorStr.includes("unavailable") ||
        errorStr.includes("overloaded");

      console.log(`[Gemini API Info] Request status on attempt ${attempt} with model ${currentModel}: ${error.message || error}`);

      if (isTransient && !isQuotaExceeded && attempt <= maxRetries) {
        const delay = 800 * attempt;
        console.log(`[Gemini API Info] Retrying transient status in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      const currentIndex = modelFallbackSequence.indexOf(currentModel);
      if (currentIndex !== -1 && currentIndex < modelFallbackSequence.length - 1) {
        const nextModel = modelFallbackSequence[currentIndex + 1];
        console.log(`[Gemini API Info] Pro/Flash model rate-limited. Trying fallback model '${nextModel}'...`);
        currentModel = nextModel;
        attempt = 0;
        continue;
      }

      if (currentModel !== "gemini-3.5-flash" && currentModel !== "gemini-3.1-flash-lite") {
        console.log(`[Gemini API Info] Direct fallback routing to gemini-3.5-flash...`);
        currentModel = "gemini-3.5-flash";
        attempt = 0;
        continue;
      }

      throw error;
    }
  }
}

export function offlineOptimizePrompt(prompt: string): string {
  const trimmed = prompt.trim();
  const lower = trimmed.toLowerCase();
  
  let role = "helpful AI assistant";
  let additionalContext = "";
  
  if (lower.includes("code") || lower.includes("program") || lower.includes("function") || lower.includes("bug") || lower.includes("react") || lower.includes("ts") || lower.includes("js") || lower.includes("html") || lower.includes("css")) {
    role = "expert Senior Software Engineer and Architect";
    additionalContext = "\n- Structure the code to be production-ready, clean, modular, and performant.\n- Ensure excellent error handling, type safety (TypeScript), and edge case validation.\n- Include brief comments explaining complex architectural choices.";
  } else if (lower.includes("write") || lower.includes("essay") || lower.includes("article") || lower.includes("blog") || lower.includes("story")) {
    role = "professional Copywriter and Creative Writer";
    additionalContext = "\n- Focus on an engaging, articulate, and natural tone matching the desired audience.\n- Organize with clear headings, crisp paragraphs, and bullet points for maximum readability.\n- Evoke rich imagery and ensure flawless grammar and flow.";
  } else if (lower.includes("explain") || lower.includes("learn") || lower.includes("how to") || lower.includes("what is")) {
    role = "patient and clear Educator and Technical Explainer";
    additionalContext = "\n- Break down complex concepts into simple, easily digestible mental models.\n- Use real-world analogies, sequential step-by-step guides, and clear summaries.\n- Avoid dense jargon or define terms clearly upon first use.";
  } else if (lower.includes("plan") || lower.includes("itinerary") || lower.includes("schedule") || lower.includes("todo")) {
    role = "meticulous Project Manager and personal assistant";
    additionalContext = "\n- Create a highly structured, prioritized, and actionable timeline or checklist.\n- Estimate durations, highlight critical paths, and address common bottlenecks.\n- Ensure realistic buffer times and include practical tips for execution.";
  }

  return `[System Instruction: You are acting as an ${role}. Provide a premium, fully-realized response that addresses all parameters with extreme depth and quality.]

**Core Objective:**
${trimmed}

**Context & Performance Expectations:**${additionalContext}
- Deliver a direct, concise, and highly polished answer without meta-dialogue, conversational fluff, or filler phrases.
- Use clean, professional Markdown formatting with precise headers and highlight key points for rapid scanning.`;
}

export function getSmartMockResponse(message: string, model: string, searchGrounding: boolean): string {
  const query = message.toLowerCase();
  
  let modelName = "AI Model";
  if (model.includes("chatgpt")) modelName = "ChatGPT (GPT-4o)";
  else if (model.includes("claude")) modelName = "Claude 3.5 Sonnet";
  else if (model.includes("gemini-3.5-flash")) modelName = "Gemini 3.5 Flash";
  else if (model.includes("gemini-3.1-pro-preview") || model.includes("gemini-3.5-pro")) modelName = "Gemini Pro";
  else if (model.includes("gemini")) modelName = "Google Gemini Core";
  else if (model.includes("grok")) modelName = "xAI Grok Mode";
  else if (model.includes("deepseek")) modelName = "DeepSeek R1/V3";
  else if (model.includes("mistral")) modelName = "Mistral Large";
  else if (model.includes("perplexity")) modelName = "Perplexity Search";

  const banner = `> 💡 **WEBNIXO Sandbox Active**: The connected Gemini API Free Tier has reached its temporary Google rate limits or quota. To keep your experience uninterrupted, WEBNIXO has automatically activated its high-fidelity model sandbox simulation of **${modelName}**!\n\n`;

  if (query.includes("monolith") && query.includes("microservice")) {
    if (model.includes("chatgpt")) {
      return banner + `### Monolithic vs. Microservice Architectures: A Comprehensive Comparison

When deciding between a monolithic architecture and microservices, we are essentially choosing between **simplicity and unified control** versus **scalability and distributed autonomy**. Both have clear, distinct trade-offs that make them suitable for different stages of a system's lifecycle.

| Dimension | Monolithic Architecture | Microservices Architecture |
| :--- | :--- | :--- |
| **Complexity** | Low initial complexity, but grows as codebase expands. | High operational complexity from day one. |
| **Deployment** | Single artifact deployment. All-or-nothing. | Independent service deployments. Safe & frequent releases. |
| **Scalability** | Horizontal scaling of the entire app. Resource-inefficient. | Highly granular scaling of specific high-demand services. |
| **Fault Tolerance** | A bug in one module (e.g., memory leak) can crash the whole app. | Failure in one service is isolated; others remain online. |
| **Data Integrity** | Shared database; easy ACID transactions. | Distributed databases; requires complex eventual consistency. |

#### 1. Monolithic Architecture: The Unified Engine
A monolith bundles all business capabilities (user auth, catalog, payments, notifications) into a single codebase and a single runtime executable, usually reading/writing to a single centralized SQL database.

*   **When to Use**:
    *   **Early-stage startups (MVP)**: Speed of iteration is paramount.
    *   **Small teams**: Operational overhead is minimized.
    *   **Simple domains**: The business logic does not require specialized hardware or scaling.

#### 2. Microservices Architecture: The Distributed Fleet
A microservices architecture breaks the application into small, loosely coupled services. Each service owns its domain logic, its database, and communicates via lightweight protocols (REST, gRPC, or event brokers like Kafka).

*   **When to Use**:
    *   **Large, scaled organizations**: Teams can work on isolated business functions without merge conflicts.
    *   **Highly disparate scaling needs**: For example, your video-processing logic needs GPU clusters, but your user service needs minimal CPU.
    *   **Polyglot requirements**: Using Python for machine learning services and Go or Rust for high-throughput gateway routes.`;
    }
    
    if (model.includes("claude")) {
      return banner + `### Architectural Analysis: Monolith vs. Microservices
*An evaluation of design patterns, developer velocity, and runtime characteristics.*

As an engineer, the choice between monoliths and microservices is not a binary decision of "good vs. bad," but rather a spectrum of organizational alignment and systemic overhead.

#### The Monolith: Cohesion and Locality
Monoliths represent **architectural simplicity**. All components run within the same process boundaries.
*   **Locality of Calls**: Method invocations are simple in-memory calls with sub-microsecond latency.
*   **Refactoring Velocity**: Renaming objects or changing APIs across modules can be safely performed using standard compiler or IDE refactoring tools.
*   **ACID Guarantees**: A single database allows easy relational joins and robust transactions across multiple business models.

*Limitation*: Code boundaries inevitably decay over time without strict module discipline (leading to the "Big Ball of Mud").

#### Microservices: Granularity and Autonomy
Microservices represent **organizational scaling**. Each service operates as an independent node.
*   **Process Isolation**: No service can access another's database directly. Communication occurs over network hops (HTTP/2, gRPC).
*   **Conway’s Law**: Aligns perfectly with multi-team structures—enabling 10 distinct squads to deploy 10 times a day without coordinating release cycles.
*   **Granular Scaling**: Highly specialized resource allocation (e.g. memory-intensive services run on memory-optimized instances).

*Limitation*: Introducing distributed transactions (Saga pattern) and resolving eventual consistency can introduce significant code friction.`;
    }
    
    if (model.includes("grok")) {
      return banner + `### Monoliths vs. Microservices: The Intergalactic Rumble! 🚀

Let's cut through the standard boring enterprise jargon and look at this like human beings:

*   **The Monolith (The "All-In-One" Death Star)**:
    It's one massive, heavy piece of engineering. Everything is crammed inside: the propulsion system, the trash compactors, the laser cannons, and the crew's coffee machine.
    *   **The Good**: Easy to construct, easy to fly. One big thruster gets it moving. If you need to fix a pipe in the cafeteria, you just walk down the hall.
    *   **The Bad**: If a rebel fires a proton torpedo into a tiny exhaust port (like a memory leak in your payments module), the entire space station blows to smithereens.

*   **Microservices (The Fleet of X-Wings)**:
    Instead of one big Death Star, you have a fleet of 500 small, nimble starfighters. One does navigation, one fires lasers, one carries the coffee.
    *   **The Good**: If one X-Wing gets vaporized, the rest of the fleet keeps flying. You can upgrade the lasers on one starfighter without stopping the others.
    *   **The Bad**: Now you have 500 starfighters trying to talk to each other over radio chatter. If the communications channel fails, they'll end up crashing into one another. The coordination overhead is monumental!

**Grok's Verdict**: Don't build 50 small starfighters when a single sturdy shuttle will do the job. Start with a clean Monolith, and only split out microservices when your team grows so large that developers are constantly stepping on each other's toes!`;
    }

    return banner + `### Monolithic vs Microservice Architectures

A monolithic architecture places all application code inside a single build and execution unit. A microservices architecture divides those capabilities into separate, modular HTTP or event-driven micro-applications.

#### Monolith
*   **Pros**: Fast initial development, simple debugging, atomic transactions, no network overhead between modules.
*   **Cons**: Tight coupling makes scaling individual modules difficult; deployment takes longer; a single crash can bring down the entire system.

#### Microservices
*   **Pros**: Independent scaling, choice of technologies per service, isolated fault domains, faster isolated CI/CD.
*   **Cons**: Complex network latency, eventual consistency challenges, difficult distributed debugging, high infrastructure overhead.`;
  }

  if (query.includes("startup") && query.includes("executive")) {
    return banner + `### Executive Summary: Project **AeroScribe**
*Empowering clinical documentation with real-time ambient intelligence.*

---

#### 1. The Opportunity (The Problem)
Physicians spend upwards of **2.5 hours per day** on administrative clinical documentation, contributing directly to an 81% burnout rate among healthcare professionals. Current dictation software requires active formatting and rigid, robotic voice commands, disrupting natural doctor-patient relationships.

#### 2. The Solution
**AeroScribe** is a secure, HIPAA-compliant ambient AI platform that runs on standard mobile hardware. It captures natural, unstructured conversational dialogue during patient consultations and automatically compiles it into precise, structured SOAP (Subjective, Objective, Assessment, Plan) medical notes, seamlessly integrating with major EHR platforms.

#### 3. Market Size & Traction
*   **Total Addressable Market (TAM)**: $12B (Global Healthcare Administrative AI).
*   **Initial Focus**: Urgent Care and Independent clinics (representing 15,000 potential locations in North America).
*   **Traction**: Completed a 3-clinic pilot demonstrating a **68% reduction in note-drafting time** and a 94% physician satisfaction rating.

#### 4. Competitive Advantage
*   **Offline-First Processing**: Hybrid on-device model stripping sensitive data *before* standard API transmission.
*   **EHR Deep Links**: Proprietary browser extension auto-filling forms without complex API integrations.`;
  }

  if (query.includes("gemini 1.5 pro") || query.includes("2.0 flash") || query.includes("primary strengths")) {
    return banner + `### Google Gemini: Model Architecture Strengths

Google's Gemini model series represents some of the most advanced breakthroughs in deep learning, particularly around multi-modal processing and extended context windows.

#### 1. Gemini 1.5 Pro: The Deep Reasoning & Context Titan
*   **Massive 1M - 2M Token Context Window**: This allows users to upload entire codebases, hours of video, or hundreds of documents directly in a single prompt.
*   **Highly Advanced Reasoning**: Optimized for heavy coding, complex logic, multi-lingual translations, and cross-reference queries across millions of data points.
*   **Perfect Recall ("Needle in a Haystack")**: Boasts near 100% retrieval accuracy over the entire 2-million token window.

#### 2. Gemini 2.0 Flash: The Lightning-Fast Real-Time Engine
*   **Sub-Second Latency**: Built specifically for lightning-fast responsiveness, ideal for interactive real-time agents, instant chat, and dynamic UI elements.
*   **Multimodal Live Capabilities**: Built from the ground up for low-latency native audio and video stream processing, powering the live voice dialogue features.
*   **High Performance-to-Cost Ratio**: Extremely cost-efficient, making it the perfect default model for massive scaling and high-volume operations.`;
  }

  if (query.includes("quantum")) {
    if (model.includes("grok")) {
      return banner + `### Quantum Computing Demystified (With Zero Boring Academic Snobbery) 🌌

Alright, imagine your standard classic computer is a very neat, obedient librarian. 

#### 1. The Classic Bit vs. The Quantum Qubit
*   **The Classic Bit**: It is a simple light switch. It can be **Off (0)** or **On (1)**. The librarian can look at one book at a time, check if it's there, and write down "yes" or "no".
*   **The Qubit**: This is a spinning coin. While it's spinning on the table, is it heads or tails? It's **both at the same time**! This is called **Superposition**. 
    Until you slap your hand down on it (which is "measuring" the qubit), it exists in a state of beautiful, dizzying probability.

#### 2. Quantum Entanglement (Spooky Action at a Distance)
Imagine you have two magical dice. You keep one on Earth, and send the other to the Andromeda galaxy. 
*   If you roll yours on Earth and get a **6**, the one in Andromeda *instantly* snaps to a **6** as well, even though they are separated by billions of light-years! 
*   In quantum computing, entangling qubits allows them to share information instantly, enabling the system to solve incredibly complex math formulas exponentially faster than any classic supercomputer.

#### 3. What is it actually good for?
*   **Breaking Cryptography**: Solving prime factorizations that would take classic computers billions of years.
*   **Molecular Simulation**: Designing new life-saving drugs in hours by simulating quantum molecular bonds.
*   **Not Good For**: Running your video games at 500 FPS. Sorry, quantum computers won't make Minecraft run any faster!`;
    }
    return banner + `### Quantum Computing Fundamentals

Quantum computing utilizes the properties of quantum mechanics—specifically **superposition** and **entanglement**—to process information in ways classical computers cannot.

1.  **Superposition**: While classical bits are strictly 0 or 1, quantum bits (qubits) can exist in a linear combination of both states simultaneously, allowing parallel calculation paths.
2.  **Entanglement**: Qubits can become linked such that the state of one instantly influences another, regardless of distance, facilitating high-speed information exchange.
3.  **Applications**: Optimizing complex supply chains, simulating molecular configurations for drug discovery, and performing rapid cryptography calculations.`;
  }

  if (query.includes("deepseek") || query.includes("outstanding cost efficiency")) {
    return banner + `### DeepSeek R1 and V3: The Economics of Open-Source Reasoning

DeepSeek's releases have sent shockwaves through the AI industry due to their incredible performance combined with staggering training and serving cost-efficiency.

#### 1. DeepSeek-V3: Mixture-of-Experts (MoE) Architecture
*   **671B Total Parameters**: But it only activates **37B parameters per token**, striking a golden balance between performance and inference speed.
*   **Multi-head Latent Attention (MLA)**: Significantly reduces Key-Value (KV) cache overhead, allowing high concurrency and rapid throughput during inference.
*   **Low Cost**: Developed with a total training budget of only ~$5.6M, a fraction of what rival labs spend.

#### 2. DeepSeek-R1: Advanced Reasoning & Chain-of-Thought
*   **Reinforcement Learning Focus**: DeepSeek-R1 was trained with an emphasis on cold, hard reinforcement learning, allowing it to "think", self-correct, and reason through math and coding problems before answering.
*   **Outstanding Math/Coding Marks**: Matches OpenAI's flagship o1 model on standard reasoning and programming benchmarks, but served at a fraction of the cost.
*   **Open-Weights Availability**: Fully open weights (MIT license), enabling local hosting and high privacy compliance.`;
  }

  if (query.includes("mistral") || query.includes("mixtral")) {
    return banner + `### Mistral AI: Comparing Mistral Large & Mixtral 8x22B

Mistral AI (based in France) has pioneered some of the highest-performing open-source and proprietary models.

#### 1. Mixtral 8x22B (Mixture-of-Experts)
*   **Active Parameters**: Out of 141B total parameters, only 39B are active per token, enabling highly cost-efficient generation.
*   **Native Function Calling**: Excellent tool-use capabilities, making it a favorite for agent workflows.
*   **Strong Open-Source Foundations**: Fully open weights, highly customized by the developer community.

#### 2. Mistral Large (Flagship Commercial Model)
*   **Top-Tier Reasoning**: Mistral's premier proprietary model, optimized for complex logical operations, enterprise translations, and advanced agentic tasks.
*   **Native Multilingual Support**: Specifically optimized for English, French, German, Spanish, and Italian out of the box.
*   **High Privacy Standards**: Compliant with stringent European data sovereignty regulations.`;
  }

  if (query.includes("space") || query.includes("june 2026")) {
    return banner + `### Space Exploration Developments (June 2026)
*Sources synthesized from NASA, ESA, and SpaceX mission telemetry.*

#### 1. Artemis III Crew Lander Preparations
NASA and SpaceX completed a critical integrated test of the Starship Human Landing System (HLS) propellant transfer mechanism in low-Earth orbit. This clears the path for the Artemis III moon-landing trajectory simulation planned for late autumn.

#### 2. James Webb Space Telescope (JWST) Atmosphere Discoveries
Astronomers published spectacular findings showing high levels of complex, heavy organic molecules in the atmosphere of exoplanet **K2-18b**, strengthening the case for liquid water oceans on temperate habitable-zone worlds.

#### 3. Mars Sample Return (MSR) Redesign
The European Space Agency (ESA) officially ratified a joint recovery plan utilizing dual autonomous mini-helicopters to retrieve surface core samples left by the Perseverance rover, bypassing complex ground-rover retrieval constraints.`;
  }

  if (query.includes("typescript") || query.includes("validate") || query.includes("nested")) {
    return banner + `### Recursive TypeScript Object Model Validator

Here is a robust, modular, and type-safe recursive validator for nested object schemas using pure TypeScript.

\`\`\`typescript
export type SchemaType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface SchemaField {
  type: SchemaType;
  required?: boolean;
  properties?: Record<string, SchemaField>; // For nested objects
  items?: SchemaField; // For arrays
}

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

/**
 * Validates a nested object recursively against a defined schema
 */
export function validateModel(data: any, schema: Record<string, SchemaField>, path = ''): ValidationResult {
  const errors: string[] = [];

  if (data === null || typeof data !== 'object') {
    return { valid: false, errors: [\`Value at \${path || 'root'} must be an object\`] };
  }

  for (const key in schema) {
    const field = schema[key];
    const val = data[key];
    const currentPath = path ? \`\${path}.\${key}\` : key;

    if (val === undefined || val === null) {
      if (field.required) {
        errors.push(\`Field "\${currentPath}" is required\`);
      }
      continue;
    }

    if (field.type === 'object') {
      if (typeof val !== 'object' || Array.isArray(val)) {
        errors.push(\`Field "\${currentPath}" must be an object\`);
      } else if (field.properties) {
        const nestedResult = validateModel(val, field.properties, currentPath);
        if (!nestedResult.valid) {
          errors.push(...nestedResult.errors);
        }
      }
    } else if (field.type === 'array') {
      if (!Array.isArray(val)) {
        errors.push(\`Field "\${currentPath}" must be an array\`);
      } else if (field.items) {
        val.forEach((item, index) => {
          if (field.items!.type === 'object' && field.items!.properties) {
            const nestedResult = validateModel(item, field.items!.properties, \`\${currentPath}[\${index}]\`);
            if (!nestedResult.valid) {
              errors.push(...nestedResult.errors);
            }
          } else {
            const itemType = typeof item;
            if (itemType !== field.items!.type) {
              errors.push(\`Item at \${currentPath}[\${index}] must be a \${field.items!.type}\`);
            }
          }
        });
      }
    } else {
      const actualType = typeof val;
      if (actualType !== field.type) {
        errors.push(\`Field "\${currentPath}" expected type \${field.type}, got \${actualType}\`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
\`\`\`

#### Example Usage:
\`\`\`typescript
const userSchema: Record<string, SchemaField> = {
  name: { type: 'string', required: true },
  age: { type: 'number', required: false },
  contact: {
    type: 'object',
    required: true,
    properties: {
      email: { type: 'string', required: true },
      phone: { type: 'string', required: false }
    }
  }
};

const result = validateModel({ name: "Alice", contact: { email: "alice@example.com" } }, userSchema);
console.log(result.valid); // true
\`\`\`
`;
  }

  if (query.includes("google i/o") || query.includes("highlights") || query.includes("developer conference")) {
    return banner + `### Google I/O Developer Highlights
*Synthesized key announcements and core API upgrades.*

#### 1. Gemini 2.0 Flash / Pro Release
Google launched its **Gemini 2.0** model generation. 
*   **Sub-100ms multi-modal latency** for live conversational interfaces.
*   Enhanced agent tool-calling capability, permitting deep workspace and browser execution.

#### 2. Project Astra Ambient Intelligence
A real-time, context-aware visual assistant that runs on mobile and glasses, answering complex spatial questions about objects in front of you with fluent, conversational audio streams.

#### 3. Android AI Integration (Gemini Nano)
On-device models expanded to process text, image, and voice inputs completely locally on flagship Android devices, enhancing offline privacy and latency.`;
  }

  if (query.includes("security") || query.includes("audit") || query.includes("proposal")) {
    return banner + `### Proposal for Technical Codebase Security Audit

**To**: Executive Leadership Team  
**From**: Principal Security Engineer  
**Date**: June 2026  
**Subject**: Request for Authorization: Codebase Security & Access Audit

---

#### 1. Executive Summary
Our core customer-facing web platforms have scaled by 150% in transaction volume over the past 12 months. To preserve customer trust and safeguard against evolving cross-site script (XSS) injections, supply-chain package vulnerability vectors, and privilege escalation threats, this proposal requests a **2-week technical audit** on our primary code repos.

#### 2. Objectives & Scope
*   **Static Code Analysis (SAST)**: Scanning all TypeScript/Node.js repos for insecure library references and hardcoded secrets.
*   **OAuth & IAM Review**: Auditing all external service integrations, database credentials, and service account keys.
*   **Dependency Tree Audit**: Highlighting deprecated or compromised open-source modules inside our build manifests.

#### 3. Key Deliverables
1.  **Vulnerability Registry**: A prioritized dashboard categorizing findings by severity (Critical, High, Medium, Low).
2.  **Remediation Playbook**: Actionable code patches and package updates to resolve findings without interrupting development sprints.`;
  }

  if (query.includes("hobby") || query.includes("hobbies") || query.includes("weekend")) {
    return banner + `### 5 High-Focus, Screen-Free Weekend Hobbies

Unplug, rest your eyes, and engage your tactile coordination with these screen-free hobbies designed to boost creative focus:

1.  **Leathercrafting (Minimalist Wallet Making)**: Hand-stitching small leather goods requires immense geometric precision, patience, and tactile focus. You get a highly durable, functional item at the end.
2.  **Miniature Bonsai Cultivation**: Pruning, wiring, and caring for miniature trees forces you to slow down, study natural plant physiology, and engage in long-term aesthetic design.
3.  **Mechanical Watch Repair (Horology)**: Taking apart and rebuilding standard mechanical movements forces extreme steady-hand coordination and sharp spatial reasoning.
4.  **Analog Linocut block printing**: Carving custom designs onto rubber block stamps and hand-pressing them onto paper offers a rich tactile experience and results in elegant, personalized stationery.
5.  **Micro-batch Sourdough Bread Baking**: Managing wild yeast cultures, ambient humidity, and dough hydration levels balances precise culinary chemistry with intuitive, tactile kneading.`;
  }

  return banner + `### Response on "${message}"

Thank you for your prompt. In order to keep your development workspace moving forward smoothly during this rate limit, here is a helpful explanation and response to your query:

#### Analysis of Your Query:
You asked about: **"${message}"**

#### Simulated AI Response:
1.  **Context**: When discussing this topic, it is important to split concerns into structured subcategories (e.g. core principles, implementation, and trade-offs).
2.  **Implementation**: Ensure that your models have robust schemas, TypeScript interfaces, and localized persistence rules to prevent state loss on page refresh.
3.  **Next Steps**: If you have a custom database configured (such as Supabase or Cloud SQL), ensure that database indexes match your query parameters to minimize latency.

*To resume standard real-time Gemini generation, you may wait a few seconds for the free-tier Google API quotas to automatically reset, or configure your premium API key inside your environment.*`;
}
