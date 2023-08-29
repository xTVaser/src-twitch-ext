import type { SlAlert } from "@shoelace-style/shoelace";
import "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import exclamationOctagon from "./img/exclamation-octagon.svg";
import check2Circle from "./img/check2-circle.svg";

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
  icon = "check2-circle",
  duration = 3000,
) {
  const alert = document.createElement("sl-alert");
  alert.variant = variant;
  alert.closable = true;
  alert.duration = duration;

  const iconElement = document.createElement("sl-icon");
  iconElement.name = icon;
  iconElement.slot = "icon";
  if (icon === "exclamation-octagon") {
    iconElement.src = exclamationOctagon;
  } else if (icon === "check2-circle") {
    iconElement.src = check2Circle;
  }

  const messageTextNode = document.createTextNode(escapeHtml(message));

  alert.appendChild(iconElement);
  alert.appendChild(messageTextNode);

  document.body.append(alert);
  return alert.toast();
}
