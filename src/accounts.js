import { t } from "./i18n.js";
import { createClient } from "@supabase/supabase-js";
import { load, save } from "./core.js";
export const LEGAL_VERSION = "2026-10-16.1";
export function setupAccounts({ notify, getBackup, restore, isRecording }) {
  const $ = (s) => document.querySelector(s);
  let client = null,
    user = null;
  const url = import.meta.env.VITE_SUPABASE_URL,
    key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      if (!url.startsWith("https://")) throw new Error();
      client = createClient(url, key, { auth: { detectSessionInUrl: false } });
    } catch {
      notify("Cloud configuration is invalid. Local mode is available.");
    }
  }
  const profile = load("profile", {});
  $("#profile-name").value =
    typeof profile?.name === "string" ? profile.name : "";
  $("#profile-save").onclick = () => {
    if (save("profile", { name: $("#profile-name").value.trim().slice(0, 80) }))
      notify("Device profile saved.");
    else notify("Profile could not be saved. Browser storage is unavailable.");
  };
  function render() {
    $("#cloud-status").textContent = t(
      !client
        ? "Cloud not configured. Device-only profiles and backups work now."
        : user
          ? t(
              "Signed in: {email}. Cloud backups are manual; trips stay local until uploaded.",
              { email: user.email },
            )
          : "Cloud available. Email codes sign you in without a password.",
    );
    $("#cloud-login").hidden = !client || !!user;
    $("#cloud-actions").hidden = !user;
  }
  async function action(button, fn) {
    button.disabled = true;
    try {
      await fn();
    } catch (e) {
      notify(e.message || "Account request failed.");
    } finally {
      button.disabled = false;
    }
  }
  $("#send-code").onclick = (e) =>
    action(e.target, async () => {
      const email = $("#email").value.trim();
      if (!$("#email").checkValidity() || !email)
        throw new Error("Enter a valid email.");
      if (!$("#account-terms").checked)
        throw new Error("Accept the draft Terms and Privacy Policy first.");
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: { terms_version: LEGAL_VERSION },
        },
      });
      if (error) throw error;
      notify("Check your email for the code. Sending limits may apply.");
    });
  $("#verify-code").onclick = (e) =>
    action(e.target, async () => {
      if (!$("#account-terms").checked)
        throw new Error("Accept the draft Terms and Privacy Policy first.");
      const { error } = await client.auth.verifyOtp({
        email: $("#email").value.trim(),
        token: $("#otp").value.trim(),
        type: "email",
      });
      if (error) throw error;
      $("#otp").value = "";
      notify("Signed in. Upload a backup only if you want cloud storage.");
    });
  $("#sign-out").onclick = (e) =>
    action(e.target, async () => {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      user = null;
      render();
      notify("Signed out. Device data was kept. Clear it on a shared phone.");
    });
  $("#cloud-upload").onclick = (e) =>
    action(e.target, async () => {
      if (isRecording()) throw new Error("End your trip first.");
      if (
        !confirm(
          t(
            "Replace the cloud backup with this device’s trips and errands? This sends them to Supabase.",
          ),
        )
      )
        return;
      const { error } = await client.from("backups").upsert({
        user_id: user.id,
        payload: getBackup(),
        terms_version: LEGAL_VERSION,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      notify(
        "Encrypted-in-transit cloud backup saved. Not end-to-end encrypted.",
      );
    });
  $("#cloud-download").onclick = (e) =>
    action(e.target, async () => {
      if (isRecording()) throw new Error("End your trip first.");
      const { data, error } = await client
        .from("backups")
        .select("payload")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("No cloud backup yet.");
      if (
        confirm(
          t(
            "Replace this device’s trips and errands with the cloud backup? Export first to keep a copy.",
          ),
        )
      )
        restore(data.payload);
    });
  $("#account-delete").onclick = (e) =>
    action(e.target, async () => {
      if (isRecording()) throw new Error("End your trip first.");
      if (
        !confirm(
          t(
            "Permanently delete your cloud account and backup? Device data is separate and will remain.",
          ),
        )
      )
        return;
      const { error } = await client.rpc("delete_my_account");
      if (error) throw error;
      await client.auth.signOut({ scope: "local" });
      user = null;
      render();
      notify(
        "Cloud account deleted. Use Clear device data to remove local copies.",
      );
    });
  window.addEventListener("dotheading:language", render);
  render();
  if (client) {
    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) notify(error.message);
        user = data.session?.user ?? null;
        render();
      })
      .catch(() =>
        notify("Cloud session unavailable. Local mode still works."),
      );
    client.auth.onAuthStateChange((_event, session) => {
      user = session?.user ?? null;
      render();
    });
  }
}
