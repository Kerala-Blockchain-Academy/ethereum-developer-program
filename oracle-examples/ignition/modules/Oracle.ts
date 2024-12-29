// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OracleModule = buildModule("OracleModule", (m) => {
  const oV1 = m.contract("OracleV1");
  const oV2 = m.contract("OracleV2");

  return { oV1, oV2 };
})

export default OracleModule;
