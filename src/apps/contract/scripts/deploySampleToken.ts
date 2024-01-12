import hre from "hardhat";

async function main() {
  const sampleToken = await hre.viem.deployContract("SampleToken", ["SampleToken", "STK"]);

  console.log(`SampleToken deployed to ${sampleToken.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// Sepolia Deployment: 0x7ad0e7d70c0f6812424003712edc26a253fd9e2a (owner: 0x1B43C8A517c7957caF7DD02963653dA6Df8b6f10)
