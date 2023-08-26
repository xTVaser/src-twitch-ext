import type { SlAlert } from "@shoelace-style/shoelace";
import "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";

// Always escape HTML for text arguments!
function escapeHtml(html: string) {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

// Custom function to emit toast notifications
export function notify(
  message: string,
  variant: SlAlert["variant"],
  icon = "info-circle",
  duration = 3000,
) {
  const alert = document.createElement("sl-alert");
  alert.variant = variant;
  alert.closable = true;
  alert.duration = duration;

  const iconElement = document.createElement("sl-icon");
  iconElement.name = icon;
  iconElement.slot = "icon";

  const messageTextNode = document.createTextNode(escapeHtml(message));

  alert.appendChild(iconElement);
  alert.appendChild(messageTextNode);

  document.body.append(alert);
  return alert.toast();
}
