#!/bin/bash
# FUN RUSSIA dnsmasq — run as root on 185.207.214.14
set -e
IP="185.207.214.14"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[1/5] Install dnsmasq..."
apt-get update -y
apt-get install -y dnsmasq

echo "[2/5] Free port 53 from systemd-resolved..."
if systemctl is-active --quiet systemd-resolved 2>/dev/null; then
  systemctl stop systemd-resolved || true
  systemctl disable systemd-resolved || true
  chattr -i /etc/resolv.conf 2>/dev/null || true
  printf 'nameserver 1.1.1.1\nnameserver 8.8.8.8\n' > /etc/resolv.conf
fi

echo "[3/5] Config..."
mkdir -p /etc/dnsmasq.d
cp -f "$DIR/dnsmasq-funrussia.conf" /etc/dnsmasq.d/funrussia.conf
if [ -f /etc/dnsmasq.conf ]; then
  grep -q 'conf-dir=/etc/dnsmasq.d' /etc/dnsmasq.conf || echo 'conf-dir=/etc/dnsmasq.d/,*.conf' >> /etc/dnsmasq.conf
fi

echo "[4/5] Firewall 53..."
command -v ufw >/dev/null && ufw allow 53/tcp && ufw allow 53/udp || true
iptables -I INPUT -p udp --dport 53 -j ACCEPT 2>/dev/null || true
iptables -I INPUT -p tcp --dport 53 -j ACCEPT 2>/dev/null || true

echo "[5/5] Start..."
systemctl enable dnsmasq
systemctl restart dnsmasq
systemctl --no-pager status dnsmasq || true

echo ""
echo "Test: dig @$IP api.blackrussia.online +short"
echo "Expect: $IP"
