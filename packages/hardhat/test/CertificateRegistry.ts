import { expect } from "chai";
import { network } from "hardhat";
import type { Abi_CertificateRegistry } from "../generated/abis/CertificateRegistry.js";
import { loadAndExecuteDeploymentsFromFiles } from "../rocketh/environment.js";

const { provider, networkHelpers, ethers } = await network.create();

async function deployFixture() {
  const env = await loadAndExecuteDeploymentsFromFiles({ provider });
  const { address, abi } = env.get<Abi_CertificateRegistry>("CertificateRegistry");
  const registry = await ethers.getContractAt(abi, address);
  return { registry };
}

describe("CertificateRegistry", function () {
  it("issues a certificate and stores it", async function () {
    const { registry } = await networkHelpers.loadFixture(deployFixture);
    const [issuer, student] = await ethers.getSigners();

    await registry.issueCertificate(student.address, "Solidity");

    expect(await registry.certificateCount()).to.equal(1n);
    const certificate = await registry.getCertificate(1n);
    expect(certificate.recipient).to.equal(student.address);
    expect(certificate.title).to.equal("Solidity");
    expect(certificate.issuedBy).to.equal(issuer.address);
    expect(await registry.isAuthentic(1n)).to.equal(true);
  });

  it("emits CertificateIssued", async function () {
    const { registry } = await networkHelpers.loadFixture(deployFixture);
    const [, student] = await ethers.getSigners();

    await expect(registry.issueCertificate(student.address, "Solidity"))
      .to.emit(registry, "CertificateIssued")
      .withArgs(1n, student.address, "Solidity");
  });

  it("rejects an empty title", async function () {
    const { registry } = await networkHelpers.loadFixture(deployFixture);
    const [, student] = await ethers.getSigners();

    await expect(registry.issueCertificate(student.address, "")).to.be.revertedWith("Empty title");
  });

  it("rejects an empty recipient and a duplicate", async function () {
    const { registry } = await networkHelpers.loadFixture(deployFixture);
    const [, student] = await ethers.getSigners();

    await expect(registry.issueCertificate(ethers.ZeroAddress, "Solidity")).to.be.revertedWith("Empty recipient");
    await registry.issueCertificate(student.address, "Solidity");
    await expect(registry.issueCertificate(student.address, "Solidity")).to.be.revertedWith(
      "Certificate already issued",
    );
    expect(await registry.isAuthentic(0n)).to.equal(false);
    expect(await registry.isAuthentic(2n)).to.equal(false);
    await expect(registry.getCertificate(2n)).to.be.revertedWith("Unknown certificate");
  });

  it("rejects a caller who is not the issuer", async function () {
    const { registry } = await networkHelpers.loadFixture(deployFixture);
    const [, student, stranger] = await ethers.getSigners();

    const asStranger = (registry.connect as (runner: unknown) => typeof registry)(stranger);
    await expect(asStranger.issueCertificate(student.address, "Solidity")).to.be.revertedWith("Not the issuer");
  });
});
