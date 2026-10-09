import { deployScript, artifacts } from "../rocketh/deploy.js";

export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    await env.deploy("CertificateRegistry", {
      account: deployer,
      artifact: artifacts.CertificateRegistry,
      args: [deployer],
    });
  },
  {
    tags: ["CertificateRegistry"],
  },
);
