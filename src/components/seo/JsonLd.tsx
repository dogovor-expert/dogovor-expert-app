export function JsonLd({ data, nonce }: { data: object | object[]; nonce?: string }) {
  const html = JSON.stringify(data).replace(/<\/script>/gi, "<\\/script>");
  return (
    <script
      type="application/ld+json"
      nonce={nonce || undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}