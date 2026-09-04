"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { YANDEX_METRIKA_ID } from "@/lib/site";
import { onCookieConsentChange, type CookieConsent } from "@/hooks/useCookieConsent";

const ENABLED = YANDEX_METRIKA_ID && YANDEX_METRIKA_ID !== "XXXXXXXX";

export function YandexMetrika({ nonce }: { nonce?: string }) {
  // Подписываемся на изменение consent через broadcast-событие, а не читаем
  // localStorage в mount-эффекте. Раньше: при mount consent обычно null →
  // скрипт не грузился → даже после accept в баннере метрика не появлялась.
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    // Первоначальное чтение (если consent уже был выставлен до mount)
    if (typeof window === "undefined") return;
    const initial = window.localStorage.getItem("dogovor_cookie_consent");
    if (initial === "accepted" || initial === "declined") {
      setConsent(initial);
    }
    // Подписка на будущие изменения (юзер нажал Принять в баннере)
    const off = onCookieConsentChange((c) => setConsent(c));
    return off;
  }, []);

  if (!ENABLED || consent !== "accepted") return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive" nonce={nonce || undefined}>
        {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}","ym");ym(${YANDEX_METRIKA_ID},"init",{ssr:true,webvisor:false,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`}
      </Script>
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${YANDEX_METRIKA_ID}`}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}