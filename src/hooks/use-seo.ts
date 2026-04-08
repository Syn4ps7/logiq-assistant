import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useSeo(titleKey: string, descKey: string) {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t(titleKey)} | LogIQ Transport`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = t(descKey);

    return () => {
      document.title = "LogIQ Transport";
    };
  }, [t, titleKey, descKey]);
}
