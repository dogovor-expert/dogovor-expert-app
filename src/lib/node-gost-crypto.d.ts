declare module "node-gost-crypto" {
  export interface GostCrypto {
    subtle: SubtleCrypto;
    asn1: {
      ContentInfo: {
        decode(data: ArrayBuffer): unknown;
      };
    };
    cms: {
      options: { autoAddCert: boolean };
      SignedDataContentInfo: new (contentInfo?: unknown) => {
        setEnclosed(contentInfo: { contentType: string; content: ArrayBuffer }): void;
        addSignature(
          privateKey: unknown,
          certificate: unknown,
          signedAttributes?: boolean,
        ): Promise<void>;
        encode(format: string): ArrayBuffer;
        verifySignature(
          certificate: unknown,
          contentInfo?: { contentType: string; content: ArrayBuffer },
        ): Promise<boolean>;
      };
    };
    cert: {
      X509: new (template?: unknown) => {
        subject: Record<string, string>;
        generate(provider: string): Promise<unknown>;
        sign(privateKey: unknown, issuerCertificate?: unknown): Promise<void>;
        verify(issuerCertificate?: unknown, issuerCRL?: unknown, date?: Date): Promise<unknown>;
      };
    };
  }
  export const gostCrypto: GostCrypto;
}