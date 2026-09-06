import type { AlgorithmIdentifier } from "pkijs";

const GOST_OIDS: Record<string, string> = {
  "1.2.643.7.1.1.2.2": "GOST R 34.11-2012-256",
  "1.2.643.7.1.1.2.3": "GOST R 34.11-2012-512",
  "1.2.643.7.1.1.3.2": "GOST R 34.10-2012-256",
  "1.2.643.7.1.1.3.3": "GOST R 34.10-2012-512",
  "1.2.643.2.2.9": "GOST R 34.10-2001",
  "1.2.643.2.2.19": "GOST R 34.11-94",
};

function isGostAlgorithm(oid: string): boolean {
  return oid in GOST_OIDS;
}

function mapGostAlgorithm(oid: string): string {
  return GOST_OIDS[oid] || oid;
}

/**
 * Алгоритм в произвольном виде: pkijs AlgorithmIdentifier (algorithmId),
 * WebCrypto Algorithm (name) или их объединение (например, объект SPKI-алгоритма
 * из node-gost-crypto, содержащий оба поля).
 */
export type AlgorithmLike = AlgorithmIdentifier | { name?: string; algorithmId?: string };

function getAlgorithmOid(algorithm: AlgorithmLike): string {
  if ("algorithmId" in algorithm && typeof algorithm.algorithmId === "string" && algorithm.algorithmId) {
    return algorithm.algorithmId;
  }
  return "name" in algorithm && typeof algorithm.name === "string" ? algorithm.name : "";
}

export function isGostOid(oid: string): boolean {
  return isGostAlgorithm(oid);
}

export function mapGostOidToAlgorithm(oid: string): string {
  return mapGostAlgorithm(oid);
}

export function getGostAlgorithmName(algorithm: AlgorithmLike): string {
  const oid = getAlgorithmOid(algorithm);
  if (isGostAlgorithm(oid)) {
    return mapGostAlgorithm(oid);
  }
  return getAlgorithmOid(algorithm);
}