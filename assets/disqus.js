// Disqus埋め込み（掲示板）。
// https://disqus.com/admin/create/ でサイトを作成し、発行されたshortnameを下に設定してください。
const DISQUS_SHORTNAME = "YOUR-DISQUS-SHORTNAME";

(function () {
  if (!DISQUS_SHORTNAME || DISQUS_SHORTNAME === "YOUR-DISQUS-SHORTNAME") {
    const notice = document.getElementById("disqus-setup-notice");
    if (notice) notice.hidden = false;
    return;
  }

  window.disqus_config = function () {
    this.page.url = window.location.href.split("#")[0];
    this.page.identifier = "japan-social-security-site";
  };

  const script = document.createElement("script");
  script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
  script.setAttribute("data-timestamp", String(Date.now() / 1000));
  document.body.appendChild(script);
})();
