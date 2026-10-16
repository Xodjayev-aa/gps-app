import { load, save, escapeHTML as esc, validateLibrary } from "./core.js";
import { t } from "./i18n.js";
export function setupLibrary({ notify, getErrands, appendErrands, isBusy }) {
  const $ = (s) => document.querySelector(s);
  let destinations = [],
    templates = [];
  try {
    ({ destinations, templates } = validateLibrary({
      destinations: load("destinations", []),
      templates: load("templates", []),
    }));
  } catch {
    notify("Saved lists could not be loaded. Restore a valid backup.");
  }
  function persist() {
    if (!save("destinations", destinations) || !save("templates", templates))
      notify(
        "Saved lists could not be stored. Export a backup before leaving.",
      );
  }
  function render() {
    $("#saved-destinations").innerHTML = destinations.length
      ? destinations
          .map(
            (p, i) =>
              `<li><div class="t"><b>${esc(p.name)}</b><small>${esc(p.address)}</small></div><button data-use="${i}">${esc(t("Use"))}</button><button data-remove="${i}" aria-label="${esc(t("Delete destination"))} ${esc(p.name)}">${esc(t("Delete"))}</button></li>`,
          )
          .join("")
      : `<li><small>${esc(t("No saved destinations yet."))}</small></li>`;
    $("#template-list").innerHTML = templates.length
      ? templates
          .map(
            (p, i) =>
              `<li><div class="t"><b>${esc(p.name)}</b><small>${p.tasks.length} ${esc(t("tasks"))}</small></div><button data-apply="${i}">${esc(t("Apply"))}</button><button data-remove="${i}" aria-label="${esc(t("Delete template"))} ${esc(p.name)}">${esc(t("Delete"))}</button></li>`,
          )
          .join("")
      : `<li><small>${esc(t("No templates yet."))}</small></li>`;
  }
  $("#save-destination").onclick = () => {
    const address = $("#dest").value.trim();
    if (!address) return notify("Enter a destination first.");
    if (destinations.length >= 20)
      return notify("Maximum 20 saved destinations.");
    const name = prompt(t("Name this destination"), address);
    if (name === null) return;
    if (!name.trim()) return notify("Enter a name.");
    destinations.push({
      name: name.trim().slice(0, 80),
      address: address.slice(0, 200),
    });
    persist();
    render();
  };
  $("#saved-destinations").onclick = (e) => {
    const d = e.target.dataset;
    if (d.use != null) {
      if (isBusy()) return notify("Wait for the current route check.");
      $("#dest").value = destinations[+d.use].address;
      $("#dest").focus();
      notify("Destination selected. Press Check route when ready.");
    } else if (d.remove != null) {
      if (!confirm(t("Delete this saved destination?"))) return;
      destinations.splice(+d.remove, 1);
      persist();
      render();
    }
  };
  $("#save-template").onclick = () => {
    if (isBusy()) return;
    const tasks = getErrands().map(({ name, place }) => ({ name, place }));
    if (!tasks.length) return notify("Add errands before saving a template.");
    if (templates.length >= 20) return notify("Maximum 20 templates.");
    const name = prompt(t("Name this template"), t("Weekly errands"));
    if (name === null) return;
    if (!name.trim()) return notify("Enter a name.");
    templates.push({ name: name.trim().slice(0, 80), tasks });
    persist();
    render();
  };
  $("#template-list").onclick = (e) => {
    const d = e.target.dataset;
    if (d.apply != null) {
      if (isBusy()) return notify("Wait for the current route check.");
      const tasks = templates[+d.apply].tasks.filter(
        (task) =>
          !getErrands().some(
            (e) => e.name === task.name && e.place === task.place,
          ),
      );
      if (getErrands().length + tasks.length > 10)
        return notify(
          "This template would exceed the 10-errand limit. Remove some errands first.",
        );
      appendErrands(tasks.map((e) => ({ ...e, pick: false })));
      notify(
        "Template applied. Duplicate tasks were skipped. Check the route again.",
      );
    } else if (d.remove != null) {
      if (!confirm(t("Delete this template?"))) return;
      templates.splice(+d.remove, 1);
      persist();
      render();
    }
  };
  render();
  window.addEventListener("dotheading:language", render);
  return {
    get: () => ({ destinations, templates }),
    restore(data) {
      ({ destinations, templates } = validateLibrary(data));
      persist();
      render();
    },
    clear() {
      destinations = [];
      templates = [];
      render();
    },
  };
}
