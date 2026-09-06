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

function getAlgorithmOid(algorithm: AlgorithmIdentifier | any): string {
  return (algorithm as any).algorithmId || algorithm.name || "";
}

export function isGostOid(oid: string): boolean {
  return isGostAlgorithm(oid);
}

export function mapGostOidToAlgorithm(oid: string): string {
  return mapGostAlgorithm(oid);
}

export function getGostAlgorithmName(algorithm: AlgorithmIdentifier | any): string {
  const oid = getAlgorithmOid(algorithm);
  if (isGostAlgorithm(oid)) {
    return mapGostAlgorithm(oid);
  }
  return getAlgorithmOid(algorithm);
}