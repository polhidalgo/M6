const API_URL = 'https://pokeapi.co/api/v2/pokemon';
const app = document.getElementById('app');
let currentLimit = 10;
let currentOffset = 0;
let totalCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadPokemons(currentLimit, currentOffset);
});

async function loadPokemons(limit, offset) {
    try {
        // Limpiar el contenedor principal
        app.innerHTML = '';

        const response = await fetch(`${API_URL}?limit=${limit}&offset=${offset}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const data = await response.json();
        totalCount = data.count;
        renderControls(limit);
        renderPokemonList(data.results);
        setupPagination(limit, offset);
    } catch (error) {
        console.error('Error al cargar los Pokémons:', error);
    }
}

async function renderPokemonList(pokemons) {
    const container = document.createElement('div');
    container.className = 'pokemon-container';

    for (const pokemon of pokemons) {
        const card = await createPokemonCard(pokemon.url);
        container.appendChild(card);
    }

    app.appendChild(container);
}

async function createPokemonCard(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const data = await response.json();
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <h3>${data.name}</h3>
            <button class="details-btn" data-id="${data.id}">Detalles</button>
        `;

        return card;
    } catch (error) {
        console.error('Error al crear la tarjeta:', error);
        return document.createElement('div');
    }
}

function setupPagination(limit, offset) {
    const pagination = document.createElement('div');
    pagination.className = 'pagination';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Anterior';
    prevBtn.disabled = offset === 0;

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Següent';
    // Corregir esta línea
    nextBtn.disabled = offset + limit >= totalCount;

    prevBtn.addEventListener('click', () => {
        currentOffset = Math.max(0, currentOffset - limit);
        loadPokemons(currentLimit, currentOffset);
    });

    nextBtn.addEventListener('click', () => {
        currentOffset += limit;
        loadPokemons(currentLimit, currentOffset);
    });

    pagination.append(prevBtn, nextBtn);
    app.appendChild(pagination);
}

async function showDetails(pokemonId) {
    try {
        const response = await fetch(`${API_URL}/${pokemonId}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const data = await response.json();
        renderDetailView(data);
    } catch (error) {
        console.error('Error al cargar los detalles:', error);
    }
}

function renderDetailView(pokemon) {
    app.innerHTML = '';
    
    const detailView = document.createElement('div');
    detailView.className = 'detail-view';
    
    detailView.innerHTML = `
        <button class="back-btn">Tornar</button>
        <h2>${pokemon.name}</h2>
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
        <h3>Tipus:</h3>
        <p>${pokemon.types.map(t => t.type.name).join(', ')}</p>
        <h3>Habilitats:</h3>
        <p>${pokemon.abilities.map(a => a.ability.name).join(', ')}</p>
        <h3>Estadístiques:</h3>
        <table class="stats-table">
            ${pokemon.stats.map(stat => `
                <tr>
                    <td>${stat.stat.name}</td>
                    <td>${stat.base_stat}</td>
                </tr>
            `).join('')}
        </table>
    `;

    app.appendChild(detailView);
}

function renderControls(limit) {
    const controls = document.createElement('div');
    controls.className = 'controls';

    const select = document.createElement('select');
    [10, 20, 50].forEach(num => {
        const option = document.createElement('option');
        option.value = num;
        option.textContent = num;
        if (num === limit) option.selected = true;
        select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
        currentLimit = parseInt(e.target.value);
        currentOffset = 0;
        loadPokemons(currentLimit, currentOffset);
    });

    controls.appendChild(select);
    app.appendChild(controls);
}
document.addEventListener('click', (e) => {
    if (e.target.matches('.details-btn')) showDetails(e.target.dataset.id);
    if (e.target.matches('.back-btn')) loadPokemons(currentLimit, currentOffset);
});