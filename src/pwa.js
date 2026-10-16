import { t } from "./i18n.js";
import { registerSW } from "virtual:pwa-register";
export function setupInstall(isRecording, notify) {
  let pending;
  const button = document.querySelector("#install");
  const help = document.querySelector("#install-help");
  const installed = () =>
    matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  function refresh() {
    button.hidden = installed();
    help.textContent = t(
      installed()
        ? "Installed on this device. Keep the app open while recording."
        : "Android: open this site in Chrome, then Install app or ⋮ → Add to Home screen. No APK is needed. HTTPS is required.",
    );
  }
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    pending = e;
    refresh();
  });
  window.addEventListener("appinstalled", () => {
    pending = null;
    refresh();
    notify("DotHeading installed.");
  });
  button.onclick = async () => {
    if (!pending) {
      help.scrollIntoView({ block: "nearest" });
      notify("In Android Chrome, use ⋮ → Add to Home screen → Install.");
      return;
    }
    await pending.prompt();
    await pending.userChoice;
    pending = null;
    refresh();
  };
  const update = registerSW({
    onNeedRefresh() {
      document.querySelector("#update-app").hidden = false;
    },
    onOfflineReady() {
      // Do not overwrite an active permission/error message with a background event.
      refresh();
    },
    onRegisterError() {
      help.textContent +=
        " " + t("Offline setup unavailable; the website still works online.");
    },
  });
  document.querySelector("#update-app").onclick = () => {
    if (isRecording()) return notify("End your trip before updating.");
    update(true);
  };
  window.addEventListener("dotheading:language", refresh);
  refresh();
}
