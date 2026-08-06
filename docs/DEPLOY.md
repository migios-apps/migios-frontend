# Deploy guide

One deployable: a Vite SPA built to static files and served by nginx.

| Item             | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| Build            | `vite build --mode $BUILD_MODE` → `dist/`              |
| Runtime          | `nginx:alpine`, SPA fallback to `index.html`           |
| Container port   | `APP_PORT` (default `57370`)                           |
| Health endpoint  | `GET /health` → `healthy`                              |

Files: [docker-compose.yaml](docker-compose.yaml), [Dockerfile](Dockerfile),
[nginx.conf.template](nginx.conf.template), [.env.example](.env.example).

---

## The one thing to understand

**Every `VITE_*` variable is inlined into the JS bundle at build time.** They are compose
**build args**, not runtime env vars. Changing the API URL means rebuilding the image:

```bash
docker compose up -d --build
```

A plain `docker compose restart` will keep serving the old values. It also means every
`VITE_*` value is visible in the browser — `VITE_APP_CLIENT_SECRET` is a public OAuth client
credential, not a server-side secret.

The only true runtime variable is `APP_PORT`, which nginx's entrypoint substitutes into
[nginx.conf.template](nginx.conf.template) at container start.

## Environment variables

| Variable                 | Required | When    | Default      | Value                                                       |
| ------------------------ | -------- | ------- | ------------ | ----------------------------------------------------------- |
| `VITE_PUBLIC_API_URL_V1` | **yes**  | build   | —            | backend REST base URL, no trailing slash                     |
| `VITE_APP_CLIENT_ID`     | **yes**  | build   | —            | OAuth client id from `migios-be`                             |
| `VITE_APP_CLIENT_SECRET` | **yes**  | build   | —            | OAuth client secret from `migios-be`                         |
| `VITE_BASENAME`          | no       | build   | *(empty)*    | router basename for sub-path hosting (e.g. `/app`)           |
| `BUILD_MODE`             | no       | build   | `production` | `production` \| `staging` \| `development`                   |
| `APP_PORT`               | no       | runtime | `57370`      | port nginx listens on inside the container                   |
| `PORT`                   | no       | runtime | `57370`      | host port published by compose (Coolify ignores it)          |

The three required ones use `${VAR:?…}` in compose — **the stack refuses to start** with a
readable message if any is missing, instead of shipping a bundle pointing at nothing.

## Local

```bash
cp .env.example .env      # fill in the three required values
docker compose up --build # → http://localhost:$PORT
curl localhost:57370/health
```

## Coolify

1. **New Resource → Docker Compose**, connect `migios-apps/migios-frontend`.
2. **Base Directory**: `/migios-shadcn` (this folder, where the compose file lives).
3. **Environment Variables**: add the three required vars from the table above; add the
   optional ones only if you need to override a default.
4. Attach the domain to the `migios-shadcn` service, container port `57370` (or whatever
   `APP_PORT` you set). SSL is issued automatically.
5. Deploy. Coolify builds the image and passes the env vars through as build args.

Redeploy after changing any `VITE_*` variable — Coolify rebuilds, which is what bakes the new
value in.

## Switching build mode

Set `BUILD_MODE=staging` (or `development`) as an environment variable — no Dockerfile edit.
It selects the Vite mode and tags the build version written to
`dist/assets/buildVersion.json`, which the in-app "app updated" prompt polls.

## Notes

- The image build calls `vite build` directly rather than `npm run build:prod`, because that
  script chains `prebuild` (eslint + prettier). Keep those in CI — a formatting nit should not
  break a deploy. Run `npm run lint && npm run prettier` before pushing.
- `.env`, `.env.production`, and `.env.staging` are excluded via [.dockerignore](.dockerignore),
  so the build is driven purely by build args and no development credential leaks into a
  production bundle.
- nginx long-caches `/assets/*` (content-hashed) and sends `no-cache` for `index.html`, so a
  redeploy is picked up on the next page load.

## Troubleshooting

| Symptom                                     | Cause                                                              |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `required - backend API base URL…` on start | a required var is unset — see the table above                       |
| App calls the wrong API URL                 | rebuilt not required — you restarted instead of `up --build`        |
| 404 on a deep link like `/members/3`        | SPA fallback missing — nginx template not applied, check the image  |
| Blank page under a sub-path                 | `VITE_BASENAME` unset (or set without the leading `/`)              |
| Health check failing                        | `APP_PORT` mismatch between the compose `environment` and `ports`   |
