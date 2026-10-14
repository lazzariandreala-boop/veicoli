// Genera le immagini sorgente per @capacitor/assets a partire da public/icon.svg
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'node:fs'

mkdirSync('assets', { recursive: true })
const svg = readFileSync('public/icon.svg', 'utf8')
const grad = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c5cff"/><stop offset="0.6" stop-color="#5b8cff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>`
const car = svg.slice(svg.indexOf('<g fill="none"'), svg.indexOf('</svg>'))
// icona completa (quadrata, gradiente pieno)
const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${grad}<rect width="1024" height="1024" fill="url(#g)"/>${car}</svg>`
// icona adattiva: auto più piccola al centro (zona sicura 66%)
const fg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><g transform="translate(512 545) scale(0.72) translate(-512 -560)">${car}</g></svg>`
const bg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${grad}<rect width="1024" height="1024" fill="url(#g)"/></svg>`
const splash = (bgc) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732"><rect width="2732" height="2732" fill="${bgc}"/><g transform="translate(1066 1066) scale(0.586)">${svg.replace(/<\/?svg[^>]*>/g, '').replace('<rect width="1024" height="1024" rx="230" fill="#0b0d12"/>', '')}</g></svg>`
await sharp(Buffer.from(full)).png().toFile('assets/icon-only.png')
await sharp(Buffer.from(fg)).png().toFile('assets/icon-foreground.png')
await sharp(Buffer.from(bg)).png().toFile('assets/icon-background.png')
await sharp(Buffer.from(splash('#0b0d12'))).png().toFile('assets/splash.png')
await sharp(Buffer.from(splash('#0b0d12'))).png().toFile('assets/splash-dark.png')
console.log('icone generate in assets/')
