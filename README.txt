FUN RUSSIA — небольшой DNS/profile fix

Что изменено:
1) doh/server.js: удалён неиспользуемый funrussia.online из списка DNS-перенаправления по умолчанию. funrussia-online.tatnet.app намеренно НЕ перенаправляется на игровой IP, потому что это сайт.
2) ios/funrussia.mobileconfig: ярлык сайта обновлён на https://funrussia-online.tatnet.app/.
3) DoH endpoint в профиле оставлен https://funrussia-doh.layero.dev/dns-query — это текущий указанный владельцем адрес.

Установка:
- В репозитории funrussia-doh замени server.js этим файлом и задеплой.
- В репозитории funrussia-site замени ios/funrussia.mobileconfig этим файлом.
- Проверь https://funrussia-doh.layero.dev/health — ожидается JSON с ok:true и hijack, включающим blackrussia.online и br1.fun.
- Затем скачай профиль с сайта на iPhone, удали старый профиль FUN RUSSIA и установи новый.

Важно:
Это минимальный конфигурационный фикс, не гарантия подключения к игре. DNS перенаправляет только указанные домены; если клиент Black Russia подключается к другим API/адресам или использует IP напрямую, потребуется выяснить реальные домены по логам/сетевому анализу. Не добавляй домен сайта в HIJACK: он начнёт резолвиться в IP игрового сервера.
