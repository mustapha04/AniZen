import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  schema?: Record<string, any> | Record<string, any>[];
}

export default function SEO({
  title,
  description,
  keywords = "anime, AniZen, anime trailers, catalog, ratings, episodes, reviews",
  image = "/src/assets/images/anizen_app_icon_1779361257869.png",
  url,
  type = "website",
  noindex = false,
  schema,
}: SEOProps) {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper functions to get/create index.html tags
    const getOrCreateMeta = (attributeName: string, attributeValue: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, attributeValue);
        document.head.appendChild(element);
      }
      return element;
    };

    const getOrCreateLink = (relValue: string) => {
      let element = document.querySelector(`link[rel="${relValue}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", relValue);
        document.head.appendChild(element);
      }
      return element;
    };

    // 2. Canonical URL
    const canonicalUrl = url || window.location.href;
    const canonicalLink = getOrCreateLink("canonical");
    canonicalLink.setAttribute("href", canonicalUrl);

    // 3. Meta Description & Keywords
    const descMeta = getOrCreateMeta("name", "description");
    descMeta.setAttribute("content", description);

    const keywordsMeta = getOrCreateMeta("name", "keywords");
    keywordsMeta.setAttribute("content", keywords);

    const authorMeta = getOrCreateMeta("name", "author");
    authorMeta.setAttribute("content", "AniZen Media Group");

    // 4. Robots Directives
    const robotsMeta = getOrCreateMeta("name", "robots");
    robotsMeta.setAttribute("content", noindex ? "noindex, nofollow" : "index, follow");

    // 5. Open Graph Meta Tags
    const ogTitle = getOrCreateMeta("property", "og:title", true);
    ogTitle.setAttribute("content", title);

    const ogDesc = getOrCreateMeta("property", "og:description", true);
    ogDesc.setAttribute("content", description);

    const ogImage = getOrCreateMeta("property", "og:image", true);
    // Convert relative images to absolute for absolute crawler compatibility
    const absoluteImage = image.startsWith("http") ? image : `${window.location.origin}${image}`;
    ogImage.setAttribute("content", absoluteImage);

    const ogUrl = getOrCreateMeta("property", "og:url", true);
    ogUrl.setAttribute("content", canonicalUrl);

    const ogType = getOrCreateMeta("property", "og:type", true);
    ogType.setAttribute("content", type);

    const ogSiteName = getOrCreateMeta("property", "og:site_name", true);
    ogSiteName.setAttribute("content", "AniZen");

    // 6. Twitter Meta Tags
    const twitterCard = getOrCreateMeta("name", "twitter:card");
    twitterCard.setAttribute("content", "summary_large_image");

    const twitterTitle = getOrCreateMeta("name", "twitter:title");
    twitterTitle.setAttribute("content", title);

    const twitterDesc = getOrCreateMeta("name", "twitter:description");
    twitterDesc.setAttribute("content", description);

    const twitterImage = getOrCreateMeta("name", "twitter:image");
    twitterImage.setAttribute("content", absoluteImage);

    // 7. Dynamic JSON-LD structured data injection
    let jsonLdScript = document.getElementById("json-ld-schema") as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.id = "json-ld-schema";
      jsonLdScript.type = "application/ld+json";
      document.head.appendChild(jsonLdScript);
    }

    // Accumulate structures schemas
    const defaultSchemaList = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "AniZen",
        "url": window.location.origin,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${window.location.origin}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ];

    if (schema) {
      if (Array.isArray(schema)) {
        jsonLdScript.textContent = JSON.stringify([...defaultSchemaList, ...schema]);
      } else {
        jsonLdScript.textContent = JSON.stringify([...defaultSchemaList, schema]);
      }
    } else {
      jsonLdScript.textContent = JSON.stringify(defaultSchemaList);
    }

    // Google Search Console and Analytics mock script registration if needed
    // Can safely register standard analytics variables
    (window as any)._gaq = (window as any)._gaq || [];
    
  }, [title, description, keywords, image, url, type, noindex, schema]);

  return null;
}
