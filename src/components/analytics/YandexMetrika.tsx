"use client";
/**
 * Яндекс.Метрика: гейтится по granular consent (analytics).
 * Подписывается на broadcast-событие useCookieConsent.
 */
import { useEffect, useState } from "react";
import Script from "next/script";
import { YANDEX_METRIKA_ID } from "@/lib/site";
import { useCookieConsent } from "@/hooks/useCookieConsent";

const ENABLED = YANDEX_METRIKA_ID && YANDEX_METRIKA_ID !== "XXXXXXXX";

export function YandexMetrika({ nonce }: { nonce?: string }) {
  const { categories, isReady } = useCookieConsent();
  // Монтируем <Script> только если consent получен И analytics === true.
  // На сервере isReady=false → null → нет лишних inline-скриптов в HTML.
  if (!ENABLED || !isReady || !categories.analytics) return null;

  return (
    <>
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        nonce={nonce || undefined}
      >
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
