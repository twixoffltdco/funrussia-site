FUN RUSSIA DNS (Layero / VPS)
============================

Это Node-приложение DNS. Крутить на том же сервере, где игра: 185.207.214.14

1) Залей папку dns-server на VPS
2) ssh root@185.207.214.14
3) cd dns-server
4) npm install
5) Останови dnsmasq если был: systemctl stop dnsmasq; systemctl disable dnsmasq
6) node server.js
   или: PORT=53 node server.js

systemd (чтобы жило постоянно):
  cp funrussia-dns.service /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable --now funrussia-dns

Firewall: UDP 53 открыт

Проверка:
  dig @185.207.214.14 api.blackrussia.online +short
  → 185.207.214.14

iPhone (БЕЗ профиля — профиль iOS ломается):
  Настройки → Wi‑Fi → (i) → Настройка DNS → Вручную
  DNS: 185.207.214.14
  Сохранить → Black Russia
