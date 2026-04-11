# Agent icon sources

This folder records the first-party icon or logo sources used for the root README agent-support strip.

Why this folder is source-oriented instead of binary-vendored in this patch:
- the browser could resolve the official image URLs
- the execution environment in this run did not successfully materialize those external binaries into the workspace
- rather than re-drawing or inventing replacements, this patch switches the README strip to the official remote assets directly

Source choices in this patch:

- Claude: official Claude site favicon asset
  - `https://cdn.prod.website-files.com/6889473510b50328dbb70ae6/689f4a9aff1f63fde75cf733_favicon.png`
- Codex: OpenAI Blossom from OpenAI brand guidelines
  - `https://images.ctfassets.net/kftzwdyauwt9/3hUGLn3ypllZ0oa01qOYVq/28e8188e6f11b84c3e876569d492734f/Blossom_Light.svg?q=90&w=3840`
- GitHub Copilot: official GitHub Copilot lockup image from the GitHub Brand Toolkit
  - `https://brand.github.com/_next/static/media/copilot-01.0e1505e6.png`
- Kiro: official Kiro wordmark image from kiro.dev
  - `https://kiro.dev/images/kiro-wordmark.png?h=0ad65a93`
- Antigravity: official-site favicon fallback
  - `https://www.google.com/s2/favicons?domain=antigravity.google&sz=64`

Follow-up option:
- once you have a network-enabled local environment, replace the remote references with checked-in local binaries under this folder if you want fully self-contained docs assets
