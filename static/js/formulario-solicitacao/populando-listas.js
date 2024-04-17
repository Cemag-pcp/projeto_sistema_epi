// Populando lista de operadores
function carregarOperadores() {
    var inputOperador = document.getElementById('inputOperador');
    var listOperador = document.getElementById('listOperador');

    // Faz a solicitação AJAX diretamente para obter a lista de operadores
    $.ajax({
        url: '/operadores',
        type: 'GET',
        success: function (data) {
            // Atualiza o menu de operadores com as opções retornadas do servidor
            console.log(data);

            // Atualiza a lista de operadores
            atualizarLista(data);

            // Opcional: Se quiser armazenar os dados em cache para futuras requisições
            // localStorage.setItem('operadoresCache', JSON.stringify(data));
        },
        error: function (error) {
            console.error('Erro ao obter dados de operadores:', error);
        }
    });

    function atualizarLista(operadores) {
        listOperador.innerHTML = '';

        operadores.forEach(function (item) {
            var li = document.createElement('li');
            li.textContent = item;
            listOperador.appendChild(li);
        });
    }
}

// Adiciona eventos tanto para o clique quanto para o foco
inputOperador.addEventListener('click', carregarOperadores);
inputOperador.addEventListener('focus', carregarOperadores);
// Fim Populando lista de operadores

// Populando lista de itens 
var inputCodigo = document.getElementById('inputCodigo');
var listCodigo = document.getElementById('listCodigo');

function carregarItens() {
    // Verifica se os itens estão em cache

    $.ajax({
        url: '/itens',
        type: 'GET',
        success: function (data) {
            // Atualiza o menu de máquinas com as opções retornadas do servidor
            console.log(data);
            // Adiciona os itens à lista

            // Atualiza o cache com os novos dados
            localStorage.setItem('itensCache', JSON.stringify(data));

            atualizarLista(data);
        }
    });
}

function atualizarLista(itens) {
    listCodigo.innerHTML = '';

    itens.forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        listCodigo.appendChild(li);
    });
}

// Adiciona eventos tanto para o clique quanto para o foco
inputCodigo.addEventListener('click', carregarItens);
inputCodigo.addEventListener('focus', carregarItens);
// Fim Populando lista de itens 