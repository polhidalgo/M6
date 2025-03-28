"use strict";

// Classe per gestionar el mapa i els marcadors per als clubs de natació
class MapaNatacio {
    constructor() {
        this.mapa = L.map('map').setView([40.4637, -3.7492], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(this.mapa);
        this.marcadors = new Map(); // Emmagatzema els marcadors amb el nom com a clau
    }

    // Mostra els clubs a partir d’un array d’objectes llegits del CSV
    mostrarClubs(clubs) {
        // Esborra els marcadors antics
        this.marcadors.forEach(marcador => this.mapa.removeLayer(marcador));
        this.marcadors.clear();

        // Actualitza la llista lateral
        const llistaClubs = document.getElementById('llista-clubs');
        llistaClubs.innerHTML = '';

        clubs.forEach(club => {
            const { nom, latitud, longitud, imatge, ciutat } = club;
            if (!isNaN(parseFloat(latitud)) && !isNaN(parseFloat(longitud))) {

                const marcador = L.marker([parseFloat(latitud), parseFloat(longitud)]).addTo(this.mapa);
                marcador.bindPopup(`<b>${nom}</b><br>${ciutat}<br><img src="${imatge}" width="100">`);
                this.marcadors.set(nom, marcador);

                // Crear element de la llista lateral
                const elementLlista = document.createElement('li');
                elementLlista.innerHTML = `<b>${nom}</b><br>${ciutat}<br><img src="${imatge}" width="100">
                    <button class="btn-delete" data-nom="${nom}">❌</button>`;
                // En fer clic, centrar el mapa sobre aquest club i obrir el popup
                elementLlista.addEventListener('click', () => {
                    this.mapa.setView([parseFloat(latitud), parseFloat(longitud)], 15);
                    marcador.openPopup();
                });
                llistaClubs.appendChild(elementLlista);
            }
        });
    }

    // Elimina un club pel seu nom (tanto del mapa com de la llista)
    eliminarClub(nom) {
        if (this.marcadors.has(nom)) {
            this.mapa.removeLayer(this.marcadors.get(nom));
            this.marcadors.delete(nom);
        }
        // Eliminar de la llista lateral
        const llistaClubs = document.getElementById('llista-clubs');
        const elements = llistaClubs.querySelectorAll('li');
        elements.forEach(el => {
            if (el.innerHTML.includes(nom)) {
                el.remove();
            }
        });
        // Eliminar també de la llista global del gestor CSV
        this.gestorCSV.totsElsClubs = this.gestorCSV.totsElsClubs.filter(c => c.nom !== nom);
    }

    assignarGestorCSV(gestorCSV) {
        this.gestorCSV = gestorCSV;
    }
}

// Classe per gestionar el processament del CSV
class GestorCSV {
    constructor(callback) {
        this.callback = callback;
        this.totsElsClubs = [];
    }

    processarCSV(archivo) {
        Papa.parse(archivo, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                this.totsElsClubs = results.data;
                this.callback(this.totsElsClubs);
            }
        });
    }
}

// Classe per gestionar la interfície d'usuari i els filtres per ciutat
class UI {
    constructor(mapa, gestorCSV) {
        this.mapa = mapa;
        this.gestorCSV = gestorCSV;
        this.configurarDropzone();
        this.configurarFiltres();
    }

    configurarDropzone() {
        const dropzone = document.getElementById('dropzone');
        dropzone.addEventListener('dragover', (event) => {
            event.preventDefault();
            dropzone.style.backgroundColor = "#e8f4ff";
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.style.backgroundColor = "transparent";
        });
        dropzone.addEventListener('drop', (event) => {
            event.preventDefault();
            dropzone.style.backgroundColor = "transparent";
            const archivo = event.dataTransfer.files[0];
            if (archivo && archivo.type === "text/csv") {
                this.gestorCSV.processarCSV(archivo);
            } else {
                alert("Si us plau, puja un fitxer CSV vàlid.");
            }
        });
    }

    configurarFiltres() {
        // Utilitzem un element select per filtrar per ciutat
        const selectCiutat = document.getElementById('filtres-ciutats');
        // Quan es processa el CSV, omplim el select amb les ciutats disponibles
        this.gestorCSV.callback = (clubs) => {
            const ciutats = new Set();
            clubs.forEach(club => {
                if (club.ciutat) {
                    ciutats.add(club.ciutat);
                }
            });

            console.log(ciutats);
            // Omplir el select (comencem amb l'opció "Totes")
            selectCiutat.innerHTML = '<option value="Totes">Totes</option>';
            ciutats.forEach(ciutat => {
                const option = document.createElement('option');
                option.value = ciutat;
                option.textContent = ciutat;
                selectCiutat.appendChild(option);
            });
            // Mostrem tots els clubs un cop processat el CSV
            this.mapa.mostrarClubs(clubs);
            this.afegirEsdevenimentsDelete();
        };

        // Quan es selecciona una ciutat, es filtra la llista
        selectCiutat.addEventListener('change', () => {
            const ciutatSeleccionada = selectCiutat.value;
            let clubsFiltrats = this.gestorCSV.totsElsClubs;
            if (ciutatSeleccionada !== "Totes") {
                clubsFiltrats = clubsFiltrats.filter(club => club.ciutat === ciutatSeleccionada);
            }
            this.mapa.mostrarClubs(clubsFiltrats);
            this.afegirEsdevenimentsDelete();
        });
    }

    afegirEsdevenimentsDelete() {
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                const nom = event.target.getAttribute('data-nom');
                if (confirm("Estàs segur que vols eliminar aquest club?")) {
                    this.mapa.eliminarClub(nom);
                }
            });
        });
    }
}

// Inicialització de l'aplicació
document.addEventListener('DOMContentLoaded', () => {
    const mapa = new MapaNatacio();
    const gestorCSV = new GestorCSV(mapa.mostrarClubs.bind(mapa));
    mapa.assignarGestorCSV(gestorCSV);
    new UI(mapa, gestorCSV);
});
