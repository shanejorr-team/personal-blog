# Footbench Blog Post

This writing folder contains the draft blog post about Footbench, Shane's LLM model evaluation. The post source is `index.mdx`.

## Related Project

Footbench lives at `/Users/shaneorr/projects/personal-blog/footbench` within this repository. Treat that directory as the source of truth for the benchmark methodology, implementation, and generated outputs used by this post.

Read `/Users/shaneorr/projects/personal-blog/footbench/CLAUDE.md` before making substantive changes to the post, especially if you need to describe the benchmark design or interpret outputs.

## What Footbench Is

Footbench is a subjective, multi-model LLM evaluation. Candidate models answer a fixed prompt about NFL strategy recommendations, Bayesian priors, and a plotting script. The system evaluates model responses through generated artifacts, deterministic checks, and a pairwise LLM-judge tournament (every pair compared head-to-head; there is no separate 1–5 scoring round).

For this blog post, the important concepts are:

- Candidate models compete through pairwise comparisons.
- Judges compare responses on soundness of recommendations and reasonableness of Bayesian priors.
- Results are summarized as win percentages overall and by criterion.
- The post also discusses model prior choices and judge consistency.

## Blog Outputs

The post is expected to incorporate Altair visualizations from:

`/Users/shaneorr/projects/personal-blog/footbench/outputs/blog_output.ipynb`

When adding visuals to the Astro post, preserve the existing writing-post convention: article images and generated artifacts should live in this folder when they are part of the post, and `index.mdx` should reference them with local relative paths.

## Charts (static SVG)

The charts are embedded as **static inline SVG** — there is no client-side Vega
runtime and no interactivity (the visuals are read-only, so this drops the
~600 KB Vega/Vega-Lite/Vega-Embed download and, for the priors chart, a 7.4 MB
data spec). The pipeline:

1. `footbench/outputs/blog_output.ipynb` builds the charts with Altair and
   exports each one straight to `charts/*.svg` via the `save_chart()` helper
   (defined in the notebook's setup cell, which writes to this `charts/` folder
   using `chart.save(...)`/`vl-convert`). The notebook is the source of truth;
   there is no intermediate `.vl.json` and no separate conversion step.
   Regenerate the SVGs by re-running the notebook with an interpreter that has
   `altair` + `vl-convert-python` (the miniconda Python does):
   `/Users/shaneorr/miniconda3/bin/jupyter nbconvert --to notebook --execute --inplace footbench/outputs/blog_output.ipynb`
2. `index.mdx` imports each `*.svg` with `?raw` and passes it to
   `src/components/footbench/StaticChart.astro`, which inlines the SVG inside a
   `<figure>`. The component makes the SVG fluid (`width:100%; height:auto` via
   its `viewBox`) and caps it at `maxWidth` (clamped to the SVG's natural width)
   so it scales down on mobile without horizontal scrolling and never upscales.

The exported SVGs contain no internal `id`s/`clip-path`s, so inlining several on
one page is collision-free. Only the `*.svg` files are committed (the `.vl.json`
intermediates were removed when the notebook started exporting SVG directly).

## Writing Notes

- Keep the post grounded in the benchmark artifacts rather than inventing unsupported claims.
- If the outline has placeholders such as `[Insert ...]`, fill them from the notebook outputs or the relevant CSVs under `/Users/shaneorr/projects/personal-blog/footbench/outputs/data/`.
- Data analysis for writings posts should be done in Python, and visualizations should use Altair/Vega-Lite where possible.
