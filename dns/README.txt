FUN RUSSIA DNS (dnsmasq)
========================
Game: 185.207.214.14:7785
DNS:  185.207.214.14:53

On VPS (root):
  bash install-dnsmasq.sh

Open firewall: UDP/TCP 53

Test:
  dig @185.207.214.14 api.blackrussia.online +short

iPhone: install ios/funrussia.mobileconfig (DNS = 185.207.214.14)
