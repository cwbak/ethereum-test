import hre from "hardhat";

async function main() {
  const sampleToken = await hre.viem.deployContract("SampleToken", ["SampleToken", "STK"]);

  console.log(`SampleToken deployed to ${sampleToken.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// PK=0x214d7aeb917409a215cd0590853925b5ced9bdf9d846fff6d26a650da550c013 npx hardhat run scripts/deploySampleToken.ts --network eth_sepolia
// Sepolia Deployments
//   - 0xb45efaea9bf5bf90fdd2b239d6f529f390e5b0ea
