export class CSV {
    // Constructor 
    constructor(callback) {
        this.callback = callback;  // Funció que s'executarà quan es processi el CSV
        this.totsElsClubs = [];   
    }

    processarCSV(archivo) {
        // Creem un FileReader 
        const reader = new FileReader();
        
        // Definim el que farà quan acabi de llegir el fitxer
        reader.onload = (event) => {
            const contenido = event.target.result;  // Contingut del fitxer en text
            const resultat = this.parsejarCSV(contenido);  // Processem el CSV
            this.totsElsClubs = resultat.data;  // Guardem les dades processades
            this.callback(this.totsElsClubs);   // Executem el callback amb les dades
        };
        
        // Comencem la lectura del fitxer com a text
        reader.readAsText(archivo);
    }

    // Mètode per analitzar el contingut CSV i convertir-lo a objectes
    parsejarCSV(csvString) {
        // Dividim el CSV per línies
        const linies = csvString.split('\n');
        // Objecte que guardarà el resultat del processament
        const resultat = {
            data: [],    // Dades processades
            errors: [],  // Errors trobats
            meta: {}     // Metadades (no s'utilitza actualment)
        };

        // Si no hi ha línies, retornem l'objecte buit
        if (linies.length === 0) return resultat;

        // Obtenim les capçaleres (primera línia)
        const capçaleres = linies[0].split(',').map(h => h.trim());
        
        // Processem cada línia de dades 
        for (let i = 1; i < linies.length; i++) {
            if (!linies[i].trim()) continue; 
            
            // Parsegem els valors de la línia actual
            const valors = this.parsejarLiniaCSV(linies[i]);
            const club = {};  // Objecte per emmagatzemar les dades del club
            
            // Assignem cada valor a la seva propietat segons la capçalera
            for (let j = 0; j < capçaleres.length; j++) {
                if (j < valors.length) {
                    club[capçaleres[j]] = valors[j].trim();
                }
            }
            
            // Afegim el club a les dades processades
            resultat.data.push(club);
        }
        
        return resultat;
    }

    parsejarLiniaCSV(linia) {
        const valors = [];  // Array per guardar els valors trobats
        let dinsText = false;  // Indica si estem dins d'un text entre cometes
        let valorActual = '';  // Valor que s'està processant actualment
        
        // Recorrem cada caràcter de la línia
        for (let i = 0; i < linia.length; i++) {
            const caràcter = linia[i];
            
            if (caràcter === '"') {
                // Si trobem cometes, canviem l'estat (obrim/tancam text)
                dinsText = !dinsText;
            } else if (caràcter === ',' && !dinsText) {
                // Si trobem una coma i no estem dins de text, guardem el valor
                valors.push(valorActual);
                valorActual = '';  
            } else {
                // Afegim el caràcter al valor actual
                valorActual += caràcter;
            }
        }
        
        // Afegim l'últim valor processat
        valors.push(valorActual);
        return valors;
    }
}