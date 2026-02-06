import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
}

const SITE_NAME = "Carewell Supports";
const BASE_URL = "https://carewellsupports.com";

export const usePageSEO = ({ title, description, canonical }: SEOProps) => {
  useEffect(() => {
    // Set document title
    document.title = `${title} | ${SITE_NAME}`;

    // Update meta description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);
    }

    // Update canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", `${BASE_URL}${canonical}`);
    }

    // Update OG tags
    const updateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateMeta("og:title", `${title} | ${SITE_NAME}`);
    if (description) updateMeta("og:description", description);
    if (canonical) updateMeta("og:url", `${BASE_URL}${canonical}`);

    return () => {
      document.title = SITE_NAME;
    };
  }, [title, description, canonical]);
};
