export function log(message: any) {
  if (
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
  ) {
    console.log(message);
  }
}
