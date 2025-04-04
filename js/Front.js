export class Front {
    constructor(mapa, csv) {
        // Guarda les referències al mapa i al processador CSV
        this.mapa = mapa;
        this.csv = csv;
        
        this.configurarDropzone();  
        this.configurarFiltres();    
        this.configurarBuscador();  
    }

    configurarBuscador() {
        const buscador = document.getElementById('buscador-clubs');
        // S'activa cada vegada que s'escriu al camp de cerca
        buscador.addEventListener('input', () => {
            this.aplicarFiltres();
        });
    }


    aplicarFiltres() {
        // Obte el text de cerca en minúscules
        const textBusqueda = document.getElementById('buscador-clubs').value.toLowerCase();
        // Obte la ciutat seleccionada al desplegable
        const ciutatSeleccionada = document.getElementById('filtres-ciutats').value;
        
        // Comença amb tots els clubs
        let clubsFiltrats = this.csv.totsElsClubs;
        
        // Filtra per ciutat si n'hi ha una seleccionada
        if (ciutatSeleccionada !== "Totes") {
            clubsFiltrats = clubsFiltrats.filter(club => club.ciutat === ciutatSeleccionada);
        }
        
        // Filtra per text de cerca si n'hi ha
        if (textBusqueda) {
            clubsFiltrats = clubsFiltrats.filter(club => 
                club.nom.toLowerCase().includes(textBusqueda) || 
                (club.ciutat && club.ciutat.toLowerCase().includes(textBusqueda))
            );
        }
        
        // Mostra els clubs filtrats al mapa
        this.mapa.mostrarClubs(clubsFiltrats);
    }

    // Configura l'àrea per arrossegar fitxers CSV
    configurarDropzone() {
        const dropzone = document.getElementById('dropzone');
        
        // Canvia el color quan s'arrossega sobre l'àrea
        dropzone.addEventListener('dragover', (event) => {
            event.preventDefault();
            dropzone.style.backgroundColor = "#e8f4ff";
        });
        
        // Torna al color original quan surt de l'àrea
        dropzone.addEventListener('dragleave', () => {
            dropzone.style.backgroundColor = "transparent";
        });
        
        // Gestiona quan es deixa anar un fitxer
        dropzone.addEventListener('drop', (event) => {
            event.preventDefault();
            dropzone.style.backgroundColor = "transparent";
            const archivo = event.dataTransfer.files[0];
            
            // Verifica que sigui un CSV abans de processar-lo
            if (archivo && archivo.type === "text/csv") {
                this.csv.processarCSV(archivo);
            } else {
                alert("Si us plau, puja un fitxer CSV vàlid.");
            }
        });
    }

    // Configura el filtre per ciutat
    configurarFiltres() {
        const selectCiutat = document.getElementById('filtres-ciutats');
        
        // Quan es processa un CSV nou:
        this.csv.callback = (clubs) => {
            // Recull totes les ciutats úniques dels clubs
            const ciutats = new Set();
            clubs.forEach(club => {
                if (club.ciutat) {
                    ciutats.add(club.ciutat);
                }
            });

            // Omple el desplegable amb les ciutats trobades
            selectCiutat.innerHTML = '<option value="Totes">Totes</option>';
            ciutats.forEach(ciutat => {
                const option = document.createElement('option');
                option.value = ciutat;
                option.textContent = ciutat;
                selectCiutat.appendChild(option);
            });
            
            // Mostra tots els clubs inicialment
            this.mapa.mostrarClubs(clubs);
            this.afegirEsdevenimentsDelete();
            this.aplicarFiltres();
        };

        // Quan es canvia la ciutat seleccionada:
        selectCiutat.addEventListener('change', () => {
            const ciutatSeleccionada = selectCiutat.value;
            let clubsFiltrats = this.csv.totsElsClubs;
            
            // Filtra per ciutat si no és "Totes"
            if (ciutatSeleccionada !== "Totes") {
                clubsFiltrats = clubsFiltrats.filter(club => club.ciutat === ciutatSeleccionada);
            }
            
            // Actualitza el mapa i la llista
            this.mapa.mostrarClubs(clubsFiltrats);
            this.afegirEsdevenimentsDelete();
            this.aplicarFiltres();
        });
    }

    // Gestiona els botons d'eliminar clubs
    afegirEsdevenimentsDelete() {
        // Delegació d'esdeveniments al contenidor pare
        document.getElementById('llista-clubs').addEventListener('click', (event) => {
            // Verifica si s'ha fet clic en un botó d'eliminar
            const btnDelete = event.target.closest('.btn-delete');
            if (btnDelete) {
                event.stopPropagation(); // Evita que es propagui a l'element pare
                const nom = btnDelete.getAttribute('data-nom');
                
                // Demana confirmació abans d'eliminar
                if (confirm("Estàs segur que vols eliminar aquest club?")) {
                    // Elimina del mapa i de la llista de clubs
                    this.mapa.eliminarClub(nom);
                    this.csv.totsElsClubs = this.csv.totsElsClubs.filter(c => c.nom !== nom);
                }
            }
        });
    }
}