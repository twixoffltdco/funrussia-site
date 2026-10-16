/**
 * FUN RUSSIA DNS server
 * Black Russia domains → 185.207.214.14
 * Остальное → 1.1.1.1 / 8.8.8.8
 *
 * Запуск на Layero VPS (root):
 *   cd dns-server && npm install && sudo node server.js
 *
 * Без root (тест):
 *   PORT=5353 node server.js
 *
 * iPhone (без mobileconfig — он ломается):
 *   Настройки → Wi‑Fi → (i) → DNS вручную → 185.207.214.14
 */
const dgram = require('dgram');
const dns2 = require('dns2');
const { Packet } = dns2;

const GAME_IP = process.env.GAME_IP || '185.207.214.14';
const PORT = Number(process.env.PORT || process.env.DNS_PORT || 53);
const UPSTREAM = (process.env.UPSTREAM || '1.1.1.1,8.8.8.8').split(',').map(s => s.trim());
const HIJACK_SUFFIXES = (process.env.HIJACK || 'blackrussia.online,br1.fun,funrussia.online')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

function shouldHijack(name) {
  const n = String(name || '').toLowerCase().replace(/\.$/, '');
  return HIJACK_SUFFIXES.some(suf => n === suf || n.endsWith('.' + suf));
}

function forwardQuery(msg) {
  return new Promise((resolve, reject) => {
    const sock = dgram.createSocket('udp4');
    const up = UPSTREAM[Math.floor(Math.random() * UPSTREAM.length)];
    const timer = setTimeout(() => {
      try { sock.close(); } catch (_) {}
      reject(new Error('upstream timeout'));
    }, 2500);

    sock.on('message', (resp) => {
      clearTimeout(timer);
      try { sock.close(); } catch (_) {}
      resolve(resp);
    });
    sock.on('error', (e) => {
      clearTimeout(timer);
      try { sock.close(); } catch (_) {}
      reject(e);
    });
    sock.send(msg, 53, up);
  });
}

const udp = dgram.createSocket('udp4');

udp.on('message', async (msg, rinfo) => {
  let packet;
  try {
    packet = Packet.parse(msg);
  } catch (_) {
    return;
  }
  const q = packet.questions && packet.questions[0];
  if (!q) return;

  const name = q.name;
  const qtype = q.type;

  try {
    if (shouldHijack(name) && qtype === Packet.TYPE.A) {
      const response = Packet.createResponseFromRequest(packet);
      response.header.qr = 1;
      response.header.ra = 1;
      response.answers = [{
        name,
        type: Packet.TYPE.A,
        class: Packet.CLASS.IN,
        ttl: 30,
        address: GAME_IP,
      }];
      const buf = response.toBuffer();
      udp.send(buf, 0, buf.length, rinfo.port, rinfo.address);
      console.log(`[HIJACK] ${name} -> ${GAME_IP} <- ${rinfo.address}`);
      return;
    }

    if (shouldHijack(name) && qtype === Packet.TYPE.AAAA) {
      const response = Packet.createResponseFromRequest(packet);
      response.header.qr = 1;
      response.header.ra = 1;
      response.answers = [];
      const buf = response.toBuffer();
      udp.send(buf, 0, buf.length, rinfo.port, rinfo.address);
      return;
    }

    const resp = await forwardQuery(msg);
    udp.send(resp, 0, resp.length, rinfo.port, rinfo.address);
  } catch (e) {
    console.error('[ERR]', name, e.message);
  }
});

udp.on('listening', () => {
  const a = udp.address();
  console.log(`FUN RUSSIA DNS on ${a.address}:${a.port}`);
  console.log(`GAME_IP=${GAME_IP} hijack=${HIJACK_SUFFIXES.join(',')}`);
});

udp.on('error', (err) => {
  console.error(err);
  if (err.code === 'EACCES') console.error('Нужен root для порта 53 или PORT=5353');
  process.exit(1);
});

udp.bind(PORT, '0.0.0.0');
