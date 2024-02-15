// Populando lista de operadores
function carregarOperadores() {
    var inputOperador = document.getElementById('inputOperador');
    var listOperador = document.getElementById('listOperador');

    // Verifica se os operadores estão em cache
    var operadoresCache = localStorage.getItem('operadoresCache');

    if (operadoresCache) {
        // Se estiver em cache, utiliza os dados do cache
        atualizarLista(JSON.parse(operadoresCache));
    } else {
        // Caso contrário, faz a solicitação AJAX
        $.ajax({
            url: '/operadores',
            type: 'GET',
            success: function (data) {
                // Atualiza o menu de operadores com as opções retornadas do servidor
                console.log(data);
                // Adiciona os operadores à lista

                // Atualiza o cache com os novos dados
                localStorage.setItem('operadoresCache', JSON.stringify(data));

                atualizarLista(data);
            }
        });
    }

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
    var itensCache = localStorage.getItem('itensCache');

    if (itensCache) {
        // Se estiver em cache, utiliza os dados do cache
        atualizarLista(JSON.parse(itensCache));
    } else {
        // Caso contrário, faz a solicitação AJAX
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