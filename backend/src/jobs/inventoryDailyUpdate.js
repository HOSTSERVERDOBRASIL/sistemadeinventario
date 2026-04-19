const { createContainer } = require("../bootstrap");

function main() {
  const container = createContainer();
  const summary = container.orchestratorService.runDailyUpdate(container.config.companyId);

  console.log(JSON.stringify({
    status: "ok",
    job: "inventory:daily",
    summary
  }, null, 2));
}

main();
