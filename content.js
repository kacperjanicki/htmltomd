console.log("Content script dziala");

function loadCSS(href) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function injectScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL(src);
    script.onload = () => {
      script.remove();
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load: ${src}`));
    (document.head || document.documentElement).appendChild(script);
  });
}

function addCustomStyles() {
  const style = document.createElement("style");
  style.textContent = `
    body {
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 2em auto;
      padding: 0 1em;
      background-color: #f8f8f8;
      color: #333;
      line-height: 1.6;
    }
    
    pre {
      background-color: #1e1e1e;
      border-radius: 6px;
      padding: 1em;
      overflow-x: auto;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
      font-family: "Fira Code", Consolas, monospace;
      font-size: 14px;
      line-height: 1.5;
      color: #dcdcdc;
    }
    
    ul {
      margin-left: 1.5em;
    }
  `;
  document.head.appendChild(style);
}

async function modifyPage() {
  try {
    addCustomStyles();
    loadCSS("https://fonts.googleapis.com/css2?family=Fira+Code&display=swap");
    loadCSS(
      "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/vs2015.min.css"
    );

    await injectScript("libs/highlight.min.js");
    await injectScript("libs/java.min.js");

    const preElements = document.querySelectorAll("pre");
    preElements.forEach((preElement) => {
      if (preElement.querySelector("code")) return;

      const existingContent = preElement.innerHTML.replace(
        /<br\s*\/?>/gi,
        "\n"
      );
      const codeElement = document.createElement("code");
      codeElement.className = "language-java";
      codeElement.innerHTML = existingContent;

      preElement.innerHTML = "";
      preElement.appendChild(codeElement);
    });

    await injectScript("highlight-runner.js");
  } catch (error) {
    console.error("Error while modifying the page:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", modifyPage);
} else {
  modifyPage();
}
