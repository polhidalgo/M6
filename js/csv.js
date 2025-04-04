export class CSV {
    constructor(callback) {
        this.callback = callback;
        this.totsElsClubs = [];
    }

    processarCSV(archivo) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const contenido = event.target.result;
            const resultat = this.parsejarCSV(contenido);
            this.totsElsClubs = resultat.data;
            this.callback(this.totsElsClubs);
        };
        
        reader.readAsText(archivo);
    }

    parsejarCSV(csvString) {
        const linies = csvString.split('\n');
        const resultat = {
            data: [],
            errors: [],
            meta: {}
        };

        if (linies.length === 0) return resultat;

        // Obtenir capçaleres (primera línia)
        const capçaleres = linies[0].split(',').map(h => h.trim());
        
        // Processar cada línia (començant des de la segona)
        for (let i = 1; i < linies.length; i++) {
            if (!linies[i].trim()) continue; // Saltar línies buides
            
            const valors = this.parsejarLiniaCSV(linies[i]);
            const club = {};
            
            // Assignar valors a les propietats segons les capçaleres
            for (let j = 0; j < capçaleres.length; j++) {
                if (j < valors.length) {
                    club[capçaleres[j]] = valors[j].trim();
                }
            }
            
            resultat.data.push(club);
        }
        
        return resultat;
    }

    parsejarLiniaCSV(linia) {
        const valors = [];
        let dinsText = false;
        let valorActual = '';
        
        for (let i = 0; i < linia.length; i++) {
            const caràcter = linia[i];
            
            if (caràcter === '"') {
                dinsText = !dinsText;
            } else if (caràcter === ',' && !dinsText) {
                valors.push(valorActual);
                valorActual = '';
            } else {
                valorActual += caràcter;
            }
        }
        
        valors.push(valorActual); // Afegir l'últim valor
        return valors;
    }
}