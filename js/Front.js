export class Front {
    constructor(mapa, csv) {
        this.mapa = mapa;
        this.csv = csv;
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
                this.csv.processarCSV(archivo);
            } else {
                alert("Si us plau, puja un fitxer CSV vàlid.");
            }
        });
    }

    configurarFiltres() {
        // Utilitzem un element select per filtrar per ciutat
        const selectCiutat = document.getElementById('filtres-ciutats');
        // Quan es processa el CSV, omplim el select amb les ciutats disponibles
        this.csv.callback = (clubs) => {
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
            let clubsFiltrats = this.csv.totsElsClubs;
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