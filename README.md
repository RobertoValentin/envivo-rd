# En vivo RD

Una pantalla para TV Samsung (Tizen) que muestra los canales dominicanos que están transmitiendo **en vivo en YouTube**. El que está en vivo sale arriba, en grande. Debajo están los demás canales en vivo y, después, lo último que transmitió cada canal. Todo se abre en YouTube con el botón OK.

Está pensada para personas mayores: letra grande (Atkinson Hyperlegible), alto contraste y manejo solo con las flechas y OK del control.

## Instalar en la TV

Necesitas [TizenBrew](https://github.com/reisxd/TizenBrew) instalado en la Samsung.

1. Abre TizenBrew → **Module Manager** (agregar módulo).
2. Elige **GitHub** y escribe `RobertoValentin/envivo-rd`.
3. Abre **En vivo RD** desde la pantalla de TizenBrew.

Funciona en Tizen 4 (TVs de 2018) y en los más nuevos.

## Cómo funciona

- `app/`: la pantalla de la TV (HTML, CSS y JavaScript ES5, porque los TVs de 2017-2018 traen un Chromium antiguo).
- `worker/`: un Cloudflare Worker que revisa cada canal en YouTube (si está en vivo y cuál fue su última transmisión) y responde en `/yt/live.json`. Guarda la respuesta 1 minuto.
- La app revisa de nuevo cada vez que se abre, al volver a ella y cada 3 minutos.

Solo usa los canales **oficiales** de YouTube de cada televisora y abre los videos en la app oficial de YouTube. No descarga ni retransmite nada.

## Canales

Telemicro, Noticias SIN, Color Visión, CDN 37, Telenoticias (Telesistema), Telecentro, Central Noticias (Canal 4), Antena 7, Digital 15, Super Canal 33, Teleantillas, El Nuevo Diario TV y RTVD 4.

Para sumar un canal, agrega su ID de canal de YouTube en `worker/index.js` (lista `CHANNELS`) y abre un *pull request*.

## Contribuir

Los aportes son bienvenidos: reportes de fallas, canales nuevos, pruebas en otros modelos de TV. Abre un *issue* indicando el modelo de TV y su versión de Tizen.

Hecho por Roberto Valentín. Licencia MIT.
