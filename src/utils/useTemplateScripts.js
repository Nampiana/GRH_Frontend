import { useEffect } from "react";

const useTemplateScripts = () => {
  useEffect(() => {
    const scripts = [
      "/assets/js/pcoded.min.js",
      "/assets/js/demo-12.js",
      "/assets/js/script.js",
      "/assets/js/jquery.mCustomScrollbar.concat.min.js",
    ];

    scripts.forEach((src) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    });

    return () => {
      scripts.forEach((src) => {
        const found = document.querySelector(`script[src="${src}"]`);
        if (found) found.remove();
      });
    };
  }, []);
};

export default useTemplateScripts; 
