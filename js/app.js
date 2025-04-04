import { Mapa } from "./mapa.js";       
import { CSV } from "./csv.js";         
import { Front } from "./Front.js";     

// Inicialització de l'aplicació quan el document HTML està completament carregat
document.addEventListener('DOMContentLoaded', () => {
    // Creació d'una nova instància del mapa
    const mapa = new Mapa();
    // Creació d'una nova instància del processador CSV
    // S'assigna el mètode 'mostrarClubs' del mapa com a callback
    const csv = new CSV(mapa.mostrarClubs.bind(mapa));
    
    // S'estableix la connexió entre el mapa i el processador CSV
    mapa.controlCSV(csv);
    
    // Creació de la interfície d'usuari, passant les instàncies del mapa i CSV
    new Front(mapa, csv);
});