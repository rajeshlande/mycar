# Push myCar to GitHub

Repository: `https://github.com/rajeshlande/mycar.git`

These commands assume you already have a local Git repository connected to that remote. If you are using the prepared ZIP, copy its contents into the existing repository folder first, but keep your existing `.git` folder and any local `.env.local` file.

## 1. Check the repository

Windows PowerShell:

```powershell
cd C:\Users\Rajesh\Desktop\SNDT_APP\New_folder\mycar
git status
git remote -v
git checkout main
git pull --rebase origin main
```

If `git remote -v` does not show the GitHub repository:

```powershell
git remote add origin https://github.com/rajeshlande/mycar.git
```

## 2. Verify before pushing

```powershell
npm ci
npm run version:check
npm run security:check
npm run check:agents
npm test
npm run build:pages
npm run check:pages
npm run test:browser
```

For browser tests on Windows, install Chromium once if needed:

```powershell
npx playwright install chromium
```

## 3. Commit and push main

```powershell
git add .
git commit -m "Release v1.1.2: decouple setup-mode test from build-time Supabase secrets"
git push origin main
```

If Git says there is nothing to commit, the files are already committed; continue to the tag step only if the tag is missing.

## 4. Create and push the release tag

Check whether the tag already exists:

```powershell
git tag -l v1.1.2
```

If it does not exist:

```powershell
git tag -a v1.1.2 -m "myCar v1.1.2"
git push origin v1.1.2
```

Optional GitHub CLI release:

```powershell
gh release create v1.1.2 --title "myCar v1.1.2" --generate-notes
```

## 5. Enable GitHub Pages

In GitHub:

1. Open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Add repository Actions secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Push to `main`, or re-run **Deploy myCar to GitHub Pages**.

Expected site:

```text
https://rajeshlande.github.io/mycar/
```

Supabase redirect URLs:

```text
https://rajeshlande.github.io/mycar/#/login
https://rajeshlande.github.io/mycar/#/reset-password
```

Do not commit `.env.local`, service-role keys, secret keys, or database passwords.
