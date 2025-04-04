export class Mapa {
    constructor() {
        this.mapa = L.map('map').setView([40.4637, -3.7492], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,  
            attribution: '© OpenStreetMap'  
        }).addTo(this.mapa);
        
        // Inicialitza un Map per emmagatzemar els marcadors
        this.marcadors = new Map();
    }

    async bandera(codiPais) {
        try {
            // Fa una petició a l'API de restcountries
            const resp = await fetch(`https://restcountries.com/v3.1/alpha/${codiPais}`);
            const datos = await resp.json();
            
            // Retorna la URL de la bandera en format SVG o cadena buida si no existeix
            return datos[0]?.flags?.svg || '';
        } catch (error) {
            console.error("Error al obtenir bandera:", error);
            return ''; 
        }
    }

    async mostrarClubs(clubs) {
        // Elimina tots els marcadors existents del mapa
        this.marcadors.forEach(marcador => this.mapa.removeLayer(marcador));
        this.marcadors.clear();

        // Neteja la llista lateral de clubs
        const llistaClubs = document.getElementById('llista-clubs');
        llistaClubs.innerHTML = '';

        // Per a cada club en l'array rebut
        clubs.forEach(async club => {
            const { nom, latitud, longitud, imatge, ciutat, codiPais } = club;
            
            // Verifica que les coordenades són vàlides
            if (!isNaN(parseFloat(latitud)) && !isNaN(parseFloat(longitud))) {
                // Obté la bandera del país del club
                const bandera = await this.bandera(codiPais);

                // Crea un marcador al mapa amb les coordenades del club
                const marcador = L.marker([parseFloat(latitud), parseFloat(longitud)]).addTo(this.mapa);
                
                // Assigna un popup al marcador amb informació del club
                marcador.bindPopup(`<b>${nom}</b><br>${ciutat}<br><img src="${imatge}" width="100">`);
                
                // Guarda el marcador al Map de marcadors
                this.marcadors.set(nom, marcador);

                // Crea un element de llista per al club
                const elementLlista = document.createElement('li');
                elementLlista.innerHTML = `
                    <b>${nom}</b><br>
                    ${ciutat}<br>
                    <img src="${imatge}" width="100">
                    ${bandera ? `<img src="${bandera}" width="30">` : ''}
                    <button class="btn-delete" data-nom="${nom}" style="cursor:pointer;">❌</button>
                `;
                
                // Afegeix event listener per centrar el mapa en fer clic
                elementLlista.addEventListener('click', () => {
                    this.mapa.setView([parseFloat(latitud), parseFloat(longitud)], 15);
                    marcador.openPopup();
                });
                
                // Afegeix l'element a la llista lateral
                llistaClubs.appendChild(elementLlista);
            }
        });
    }

    eliminarClub(nom) {
        // Elimina el marcador del mapa si existeix
        if (this.marcadors.has(nom)) {
            this.mapa.removeLayer(this.marcadors.get(nom));
            this.marcadors.delete(nom);
        }
        
        // Elimina l'element de la llista lateral
        const llistaClubs = document.getElementById('llista-clubs');
        const elements = llistaClubs.querySelectorAll('li');
        elements.forEach(el => {
            if (el.querySelector('b').textContent === nom) { 
                el.remove();
            }
        });
    }

    // Establir la connexio amb objecte CSV
    controlCSV(csv) {
        this.csv = csv; 
    }
}