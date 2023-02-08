"use strict";

const cache_ver = "webjonas-cache-v1";
const assets = [
  "/",
  "/index.html",
  "/global.css",
	"/main.js",
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(cache_ver).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
	fetchEvent.respondWith(
		caches.match(fetchEvent.request).then(
			res => res || fetch(fetchEvent.request)
		)
	)
});