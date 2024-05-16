const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CertModule", (m) => {
  const cert = m.contract("Cert");

  return { cert };
});
