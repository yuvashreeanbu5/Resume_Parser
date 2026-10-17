I want to build an HTML, CSS, JS landing page for my resume parser, where I should be able to upload an PDF and get the score out of it. Here I just want to see the score, what skills are present, and what skills are missing. The app is called AI-Powered Resume Parser. This is gonna be a mock design, so just build html css is fine, no back-end server is needed
I want to convert this entire project into a react project
I want you to move this react project into frontend folder and build a backend folder that contains the express server to handle the request, lets connect to mongoDB.
The application should take resume PDF and a JD for comparison, AI part will be added later.
Add vercel json file to backend and frontend folder. I am going to create two projects in vercel for deployment
Backend folder should container server.js, router folders, controller folders, service folders, config folders, middleware folders, and utils.js.
Configure this repository to deploy on Vercel as a project with multiple services.

Here is a suggested `vercel.json` to add to the repo root directory, auto-detected from the repository layout. Treat it as a starting point, not a finished answer:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "backend": {
      "root": "backend",
      "framework": "express"
    },
    "frontend": {
      "root": "frontend",
      "framework": "vite"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": {
        "service": "backend"
      }
    },
    {
      "source": "/(.*)",
      "destination": {
        "service": "frontend"
      }
    }
  ]
}
```

## How Vercel services work

Services let one repository deploy multiple backends and frontends as a single Vercel project, with shared routing, environment variables, and one domain. Each service is built independently, and at request time Vercel routes to a service based on the top-level rewrites.

- Define each service under the top-level `services` key. A service's `root` is its directory relative to the directory containing `vercel.json`; `framework`, `runtime`, `entrypoint`, and `buildCommand` are set per service.
- A service is **internal by default** and receives no public traffic. It is only reachable from the internet if a top-level rewrite targets it, using the object form: `{ "source": "/api/(.*)", "destination": { "service": "my_backend" } }`.
- Order rewrites from the most specific path to the least; a catch-all `/(.*)` should come last.
- In services mode, build and runtime keys (`functions`, `installCommand`, `buildCommand`, `devCommand`, `ignoreCommand`, `outputDirectory`, `framework`) are not valid at the top level and must move into the service they belong to. Public routing keys stay at the top level.
- `vercel dev` runs all services together locally and injects binding variables. Use this command for testing.

Docs: https://vercel.com/docs/services

## What I need you to do

1. **Add bindings for internal services.** Any service that calls another service should use a binding, declared on the *calling* service. A binding injects the target's internal URL into the calling service — it does not make the target public. Each entry looks like:

   ```json
   "bindings": [
     { "type": "service", "service": "inventory", "format": "url", "env": "INVENTORY_URL" }
   ]
   ```

   All four fields are required: `type` is always `"service"`, `service` is the target's name in `services`, `format` is always `"url"`, and `env` is the variable Vercel injects the target's base URL into. Do not set that variable yourself.

2. **Update the application code to match the routing and bindings.** Read the code to find where services currently call each other — hardcoded hostnames, localhost ports, internal base URLs, service-discovery config, docker-compose hostnames — and change them to read the bound variable, e.g. `await fetch(new URL('items/123', process.env.INVENTORY_URL))`. Also reconcile the code with the public paths: if a service is mounted under a path prefix, make sure its routes and any client-side URLs agree with it. Bindings resolve at runtime in functions only — not during builds, and not in middleware.

3. **Confirm the details with me before you finish.** The service names, the public rewrites, and the bindings in the snippet above are inferred and may be wrong. Show me the final `vercel.json` and explicitly ask me to confirm:
   - the **name** of each service,
   - which services should be **public** and on what path, and which should stay internal,
   - the **bindings** you added, i.e. which service calls which.

   Ask about anything you had to guess rather than assuming it.