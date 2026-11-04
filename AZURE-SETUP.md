# Azure deployment steps

## 1. Accounts

Create Microsoft Azure and MongoDB Atlas accounts yourself. Complete any identity, billing, and terms steps directly. Review the selected resource pricing before creating it; account credits and free-tier availability depend on eligibility. Never put credentials in GitHub or chat.

## 2. Atlas

Create a cluster for this exercise. Create a database user with read/write access to the exercise database. Copy the Node.js driver connection string and use a database name such as `azure_mern_checkpoint`. Replace credential placeholders privately. If the password contains special characters, percent-encode them in the URI.

In Atlas Network Access, allow the Web App's possible outbound IP addresses shown in Azure's networking/properties information. Add your current IP separately for local testing. Do not commit network credentials or broaden access to all IP addresses just to make a failed connection work. Update the access list if Azure outbound addresses change.

## 3. Create the Web App

In Azure Portal, choose Create a resource → Web App. Use a dedicated resource group, a unique name, Code publishing, a supported Node.js version of 22.12 or newer, and Linux. Review the region and service plan pricing before creating the resource. Choose a free plan if available and suitable.

## 4. Settings

In the Web App's environment variables (or Configuration), add the private `MONGO_URI`. Do not expose it as a React/Vite variable. Set the startup command to `npm start` if Azure does not detect it automatically. The server reads Azure's `PORT` variable.

For source-based build automation, set `SCM_DO_BUILD_DURING_DEPLOYMENT=true`. The root `npm run build` installs the client's locked dependencies and produces `client/dist`. The root runtime dependencies are installed by the Node build system. Do not commit `.env`, node_modules, or build output.

## 5. Connect deployment source

Open Deployment Center and select GitHub. Choose the repository, the main branch, and the Node.js runtime. Review the workflow that Azure proposes. It must install root dependencies, run `npm run build`, run tests, and deploy the server plus client/dist with runtime dependencies available. Use Azure's supported identity-based authentication setup. Review any permissions before granting them.

A typical build sequence is:

```bash
npm ci
npm run build
npm test
```

The deployment package needs package.json, package-lock.json, server/, client/dist/, and installed runtime dependencies (or a configured Azure installation step). Avoid duplicate build paths: if GitHub builds the package fully, do not also rely on source build automation without reviewing the generated workflow.

## 6. Verify the deployed app

Open the default hostname shown in the Web App Overview. Check `/api/health`: it must return HTTP 200 with `database: connected`.

1. Add a task and reload. It must still be present.
2. Edit its title and reload again.
3. Mark it complete and verify the filters.
4. Delete it and reload to confirm removal.
5. Inspect the Atlas task collection to confirm stored data.
6. Test on a narrow screen and verify errors are visible if a request fails.

Record the actual Azure URL and results in README.md only after these steps pass. Do not describe a build or mock test as proof of a cloud deployment.

## References

- https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs
- https://learn.microsoft.com/en-us/azure/app-service/configure-language-nodejs
- https://learn.microsoft.com/en-us/azure/app-service/deploy-github-actions
- https://www.mongodb.com/docs/atlas/security/ip-access-list/
