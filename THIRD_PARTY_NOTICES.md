# Third-party notices

## Reference project

myCar's React/Vite foundation, public-key validation approach, authentication redirect handling, and static-only service-worker pattern were informed by:

- Project: yoga_studio by rajeshlande
- Repository: https://github.com/rajeshlande/yoga_studio
- Reviewed revision: `06482b80e335736a492899da02df3807198f4cd7`
- License: MIT

The yoga-studio business schema, roles, branding, and UI were not copied into myCar. The vehicle schema, expense UI, charts, and sample records are specific to this project.

The reference repository's `CLAUDE.md` informed the idea of a concise canonical project-instruction file. At the reviewed revision it contained no separate installed skill directories. myCar's `AGENTS.md`, `CLAUDE.md`, and `.claude/skills/` workflows were written for myCar's own architecture and do not import yoga_studio's ERP/RPC-only rules.

### MIT license notice for the reference project

Copyright (c) 2026 rajeshlande

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Other assets and libraries

- DM Sans and Manrope fonts are distributed through Fontsource under their respective SIL Open Font Licenses; license files are included in the installed packages.
- Lucide icons are distributed under the ISC license.
- React, React Router, Supabase JS, Vite, Playwright, and PGlite retain their respective upstream licenses.
- The silver SUV image is an AI-generated illustrative asset, not a photograph of a user's vehicle. Generic vehicle illustrations do not represent an exact make/model.
