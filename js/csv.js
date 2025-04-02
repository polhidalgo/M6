export class CSV {
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