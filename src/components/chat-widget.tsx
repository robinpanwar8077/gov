"use client";

import { useEffect } from "react";

/**
 * ChatWidget component that injects the myappzchat script while protecting
 * the global site styles from unauthorized modifications.
 */
export function ChatWidget() {
  useEffect(() => {
    // 1. Root Attribute Protection
    const target = document.documentElement;
    const body = document.body;

    const originalHtmlStyle = target.getAttribute("style") || "";
    const originalHtmlClass = target.className || "";
    const originalBodyStyle = body.getAttribute("style") || "";
    const originalBodyClass = body.className || "";

    const attrObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          const currentTarget = mutation.target as HTMLElement;
          const isHtml = currentTarget === target;
          const isBody = currentTarget === body;

          if (isHtml || isBody) {
            const attr = mutation.attributeName;
            const originalVal = isHtml 
              ? (attr === "style" ? originalHtmlStyle : originalHtmlClass)
              : (attr === "style" ? originalBodyStyle : originalBodyClass);

            const newVal = attr === "style" 
              ? currentTarget.getAttribute("style") 
              : currentTarget.className;

            if (newVal !== originalVal) {
              if (attr === "style") {
                currentTarget.setAttribute("style", originalVal);
              } else {
                currentTarget.className = originalVal as string;
              }
            }
          }
        }
      });
    });

    attrObserver.observe(target, { attributes: true, attributeFilter: ["style", "class"] });
    attrObserver.observe(body, { attributes: true, attributeFilter: ["style", "class"] });

    // 2. Cascade & Style Injection Protection (The Style Interceptor)
    const defuseNaughtyStyles = () => {
      const styles = document.getElementsByTagName("style");
      for (let i = 0; i < styles.length; i++) {
        const s = styles[i];
        if (s.id === "industrial-reset-override") continue;

        const content = s.textContent || "";
        // Detection: Look for the specific global reset injected by the script
        if (content.includes("--tw-border-spacing-x") && content.includes("h1,h2,h3,h4,h5,h6{font-size:inherit")) {
          // If we found the naughty reset, we scope it or neutralize the global parts.
          // The most effective way is to only keep rules that are already scoped to the widget.
          const widgetStylesStart = content.indexOf("#chat-widget-embed");
          if (widgetStylesStart !== -1) {
             s.textContent = content.substring(widgetStylesStart);
          } else {
             // If we can't find a split, we neutralize the whole tag to be safe, 
             // as it's primarily global resets.
             s.textContent = ""; 
          }
        }
      }
    };

    const headObserver = new MutationObserver(defuseNaughtyStyles);
    headObserver.observe(document.head, { childList: true, subtree: true });
    defuseNaughtyStyles();

    // 3. Script Injection
    const timer = setTimeout(() => {
      if (document.querySelector('script[id="myappz-chat-script"]')) return;

      const script = document.createElement("script");
      script.src = "https://myappzchat.com/production/master/widget/embed-widget.umd.js";
      script.setAttribute("data-widget-id", "02bd5d5f-e158-4da6-b23b-e212c4fe9e12");
      script.async = true;
      script.id = "myappz-chat-script";
      document.body.appendChild(script);
    }, 1000);

    return () => {
      clearTimeout(timer);
      attrObserver.disconnect();
      headObserver.disconnect();
    };
  }, []);

  return null;
}
