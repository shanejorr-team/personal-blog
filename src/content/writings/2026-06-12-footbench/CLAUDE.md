# Footbench Blog Post

This writing folder contains the draft blog post about Footbench, Shane's LLM model evaluation. The post source is `index.mdx`.

## Related Project

Footbench lives at `/Users/shaneorr/projects/personal-blog/footbench` within this repository. Treat that directory as the source of truth for the benchmark methodology, implementation, and generated outputs used by this post.

Read `/Users/shaneorr/projects/personal-blog/footbench/CLAUDE.md` before making substantive changes to the post, especially if you need to describe the benchmark design or interpret outputs.

## What Footbench Is

Footbench is a subjective, multi-model LLM evaluation. Candidate models answer a fixed prompt about NFL strategy recommendations, Bayesian priors, and a plotting script. The system evaluates model responses through generated artifacts, deterministic checks, LLM judge scoring, and pairwise comparisons.

For this blog post, the important concepts are:

- Candidate models compete through pairwise comparisons.
- Judges compare responses on soundness of recommendations and reasonableness of Bayesian priors.
- Results are summarized as win percentages overall and by criterion.
- The post also discusses model prior choices and judge consistency.

## Blog Outputs

The post is expected to incorporate Altair visualizations from:

`/Users/shaneorr/projects/personal-blog/footbench/outputs/blog_output.ipynb`

When adding visuals to the Astro post, preserve the existing writing-post convention: article images and generated artifacts should live in this folder when they are part of the post, and `index.mdx` should reference them with local relative paths.

## Writing Notes

- Keep the post grounded in the benchmark artifacts rather than inventing unsupported claims.
- If the outline has placeholders such as `[Insert ...]`, fill them from the notebook outputs or the relevant CSVs under `/Users/shaneorr/projects/personal-blog/footbench/outputs/data/`.
- Data analysis for writings posts should be done in Python, and visualizations should use Altair/Vega-Lite where possible.
