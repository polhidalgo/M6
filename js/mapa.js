export class Mapa {
    constructor() {
        this.mapa = L.map('map').setView([40.4637, -3.7492], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(this.mapa);
        this.marcadors = new Map(); // Emmagatzema els marcadors amb el nom com a clau
    }

    async bandera(codiPais) {
        try {
            const resp = await fetch(`https://restcountries.com/v3.1/alpha/${codiPais}`);
            const datos = await resp.json();
            return datos[0]?.flags?.svg || ''; 
        } catch (error) {
            console.error("Error al obtenir bandera:", error);
            return ''; 
        }
    }

    // Mostra els clubs a partir d’un array d’objectes llegits del CSV
    async mostrarClubs(clubs) {
        // Esborra els marcadors antics
        this.marcadors.forEach(marcador => this.mapa.removeLayer(marcador));
        this.marcadors.clear();

        // Actualitza la llista lateral
        const llistaClubs = document.getElementById('llista-clubs');
        llistaClubs.innerHTML = '';

        clubs.forEach(async club => {
            const { nom, latitud, longitud, imatge, ciutat, codiPais } = club;
            if (!isNaN(parseFloat(latitud)) && !isNaN(parseFloat(longitud))) {
                const bandera = await this.bandera(codiPais);

                const marcador = L.marker([parseFloat(latitud), parseFloat(longitud)]).addTo(this.mapa);
                marcador.bindPopup(`<b>${nom}</b><br>${ciutat}<br><img src="${imatge}" width="100">`);
                this.marcadors.set(nom, marcador);

                // Crear element de la llista lateral
                const elementLlista = document.createElement('li');
                elementLlista.innerHTML = `<b>${nom}</b><br>${ciutat}<br><img src="${imatge}" width="100">${bandera ? `<img src="${bandera}" width="30">` : ''}
                    <button class="btn-delete" data-nom="${nom}" style="cursor:pointer;">❌</button>`;
                elementLlista.addEventListener('click', () => {
                    this.mapa.setView([parseFloat(latitud), parseFloat(longitud)], 15);
                    marcador.openPopup();
                });
                llistaClubs.appendChild(elementLlista);
            }
        });
    }

    // Elimina un club pel seu nom 
    eliminarClub(nom) {
        // Eliminar marcador del mapa
        if (this.marcadors.has(nom)) {
            this.mapa.removeLayer(this.marcadors.get(nom));
            this.marcadors.delete(nom);
        }
         // Eliminar de la llista lateral
        const llistaClubs = document.getElementById('llista-clubs');
        const elements = llistaClubs.querySelectorAll('li');
        elements.forEach(el => {
            if (el.querySelector('b').textContent === nom) { 
                el.remove();
            }
        });
        
    }

    controlCSV(csv) {
        this.csv = csv;
    }
}