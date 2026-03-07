# CoLong Idea Studio

<div align="center">

## A Dynamic-Memory-First Collaborative Agent Framework for Long-Form Creative Ideation and Story Generation

[Project Page / Paper Showcase](https://xiao-zi-chen.github.io/CoLong-Idea-Studio/) | [中文文档 / Chinese Documentation](README.zh-CN.md)

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Web%20Portal-009688)
![ChromaDB](https://img.shields.io/badge/VectorDB-ChromaDB-orange)
![Mode](https://img.shields.io/badge/Runtime-Dynamic%20Memory--First-success)
![Language](https://img.shields.io/badge/Default-English-red)

**Research-oriented, collaboration-ready, and deployment-conscious ✦**  
**Built for long-form narrative generation with strong observability and structured memory (•`-`•)و**

</div>

## Abstract

`CoLong Idea Studio` is designed for long-form, chaptered, and high-consistency creative writing tasks.  
The system adopts a **dynamic-memory-first** paradigm and organizes the generation loop as a continuous cycle of **planning -> writing -> retrieval -> storage -> reinjection**, allowing later chapters to remain aligned with earlier narrative commitments.

Compared with static-knowledge-heavy pipelines, this framework emphasizes:

1. **Collaborative ideation** before drafting, where the agent actively questions, refines, and validates the user's creative intent.
2. **Dynamic memory grounding** during generation, where outlines, facts, character settings, world settings, and chapter summaries are continuously written back and retrieved.
3. **Progress-log observability** throughout execution, so the outline, chapter plan, memory state, and chapter-level writing signals are visible in runtime logs.
4. **Completion-first generation** rather than score-gated interruption, making chapter completion the primary objective.

## Project Page

For a paper-style academic showcase page with system overview, workflow figure, evaluation snapshot, and repository links, visit:

- [CoLong Idea Studio Project Page](https://xiao-zi-chen.github.io/CoLong-Idea-Studio/)

## Architecture

![CoLong Idea Studio Workflow Diagram](docs/workflow-diagram-colong-idea-studio.png)

The current repository uses the provided workflow figure as the architecture illustration. The figure summarizes the end-to-end path from collaborative ideation to dynamic-memory-guided chapter generation.

## Methodology

### 1) Chapter Length Range Inference

For chapter `t`, the expected length interval follows the priority below:

$$
[L_{\min}^{(t)},L_{\max}^{(t)}] =
\begin{cases}
\text{parse}(\text{chapter\_outline}^{(t)}) & \text{if an explicit range is found in the chapter outline} \\
\text{parse}(\text{global\_outline}) & \text{otherwise if an explicit range is found in the global outline} \\
[0.9L_{\text{target}}^{(t)},1.12L_{\text{target}}^{(t)}] & \text{fallback strategy}
\end{cases}
$$

In practice, the framework treats chapter length as a **prompt-level guidance signal derived from outline semantics**, rather than a rigid environment-only hard cap. This is more suitable for long creative writing, where narrative completeness should dominate naive token counting.

### 2) Dynamic Memory Context Construction

The writer context is assembled from three sources:

1. Fixed injections: rolling summary, recent chapter summaries, and recent fact cards.
2. Semantic retrieval: relevant entries recalled from the dynamic-memory vector store.
3. Type-aware grouping: characters, outlines, world settings, plot points, and fact cards are grouped before prompt assembly.

### 3) Collaborative Ideation as an Agent Procedure

The ideation phase is implemented as an **agent-level collaborative loop**, not merely a frontend helper. The `Idea Copilot Agent` keeps asking clarifying questions until the user explicitly confirms that the idea is mature enough to proceed.

A typical collaborative trajectory is:

1. The user provides an initial premise, theme, or narrative seed.
2. The agent asks targeted questions about conflict, setting, character motivation, tone, structure, and audience expectation.
3. The user iteratively refines the concept.
4. Once the user confirms readiness, the system freezes the ideation result into a more stable writing brief and enters outline generation.

This design reduces under-specified prompts and improves downstream chapter coherence ✧

---

## Progress Log Protocol

Path:

```text
runs/<run_id>/progress.log
```

Event-line format:

```text
[event] YYYY-MM-DD HH:MM:SS | <event_name> | chapter <n> | <detail>
```

Structured chapter line:

```text
chapter=<n>, words=<w>, planned_total=<p>, target=<t>, min=<l>, max=<u>, topic=<topic>
```

Representative events:

| Event | Meaning |
|---|---|
| `global_outline` | Global outline persisted |
| `chapter_outline_ready` | Chapter-outline set prepared |
| `chapter_plan` | Current chapter writing plan |
| `chapter_outline` | Current chapter outline excerpt |
| `chapter_length_plan` | Chapter target and inferred source |
| `chapter_length_warning` | Actual chapter length deviates from expectation |
| `character_setting` | Character-setting memory written |
| `world_setting` | World-setting memory written |
| `memory_snapshot` | Dynamic-memory snapshot |
| `outline_character/world/retrieval` | Outline-stage artifacts logged |

The progress log is intentionally verbose so that users can inspect not only generation outcomes, but also the hidden planning layers behind them (outline, chapter schedule, character setup, world setup, and memory state) ✦

---

## Dynamic Memory Model

`memory_index.json` maintains the following buckets:

- `texts`
- `outlines`
- `characters`
- `world_settings`
- `plot_points`
- `fact_cards`

Notes:

1. `texts` store chapter bodies and intermediate phase outputs.
2. `outlines` store the global outline, chapter plans, chapter summaries, and rolling summaries.
3. `fact_cards` operate as lightweight factual constraints for cross-chapter consistency.

In the present configuration, the project is intended to run in a **dynamic-memory-priority mode**, where static RAG and static knowledge components can be minimized or disabled if they do not improve generation quality.

## Repository Structure

```text
.
├─ agents/                  # writing, retrieval, and collaborative ideation agents
├─ workflow/                # analyzer / organizer / executor
├─ rag/                     # dynamic memory and retrieval logic
├─ utils/                   # LLM client and utility modules
├─ local_web_portal/        # multi-user FastAPI portal
├─ docs/                    # figures and documentation assets
├─ config.py                # configuration center
└─ main.py                  # CLI entry
```

---

## Quick Start

### CLI

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/macOS
# source .venv/bin/activate

python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python main.py
```

### Web Portal

```bash
python -m pip install -r requirements.txt
python -m pip install -r local_web_portal/requirements.txt
# Windows
copy local_web_portal\.env.example local_web_portal\.env
# Linux/macOS
# cp local_web_portal/.env.example local_web_portal/.env
python -m uvicorn local_web_portal.app.main:app --host 0.0.0.0 --port 8010
```

Open:

```text
http://127.0.0.1:8010
```

---

## Deployment Principle

For a clean server deployment, upload only runtime-required files and exclude the following whenever possible:

1. Historical outputs: `runs/*`
2. Historical vector databases: `vector_db/*`, `vector_db_tmp/*`
3. Local state: `local_web_portal/data/*`
4. Caches and environments: `.venv/*`, `__pycache__/*`, `*.pyc`

This whitelist-oriented packaging strategy reduces repository noise, lowers cold-start complexity, and limits accidental leakage of local runtime artifacts.

## Language Channel

The GitHub landing page is intentionally presented in English for broader visibility.  
For the full Simplified Chinese documentation, please visit:

- [README.zh-CN.md](README.zh-CN.md)

## Citation

```bibtex
@software{colong_idea_studio_2026,
  title        = {CoLong Idea Studio: A Dynamic-Memory-First Collaborative Agent Framework for Long-Form Creative Ideation and Story Generation},
  author       = {xiao-zi-chen and contributors},
  year         = {2026},
  url          = {https://github.com/HITSZ-DS/CoLong-Idea-Studio}
}
```
