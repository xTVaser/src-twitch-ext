export function log(message: any) {
  const searchParams = new URLSearchParams(window.location.search);
  const onTwitch =
    searchParams.has("twitch") && searchParams.get("twitch") === "true";
  if (
    onTwitch ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
  ) {
    console.log(message);
  }
}
