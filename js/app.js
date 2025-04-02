import { Mapa } from "./mapa.js";
import { CSV } from "./csv.js";
import { Front } from "./Front.js";
// Inicialització de l'aplicació
document.addEventListener('DOMContentLoaded', () => {
    const mapa = new Mapa();
    const csv = new CSV(mapa.mostrarClubs.bind(mapa));
    mapa.controlCSV(csv);
    new Front(mapa, csv);
});
