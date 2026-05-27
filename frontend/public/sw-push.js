self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = {};
  }

  const notification = payload.notification || {};
  const title = notification.title || "Nueva notificación";
  const options = {
    body: notification.body || "",
    icon: notification.icon || "/icons/icon512_maskable.png",
    data: notification.data || { url: "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const baseUrl = data.url || "/";
  // Si envías un id de censo u otro parámetro, acá lo puedes armar
  const targetUrl = data.idCenso
    ? `${baseUrl}?idCenso=${encodeURIComponent(data.idCenso)}`
    : baseUrl;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }

        return null;
      }),
  );
});
