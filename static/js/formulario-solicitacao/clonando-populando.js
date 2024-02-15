// Criar listas dentro do input
function configurarDropdown(inputId, listId) {
    var inputDropdown = document.getElementById(inputId);
    var listaDropdown = document.getElementById(listId);
    var itens = listaDropdown.getElementsByTagName('li');
    var valorAnterior = "";

    inputDropdown.addEventListener('focus', function () {
        if (inputDropdown.readOnly) {
            listaDropdown.style.display = 'none';
        } else {
            listaDropdown.style.display = 'block';
            listaDropdown.innerHTML = '';
        }
    });

    inputDropdown.addEventListener('blur', function () {
        // Aguarde um curto período antes de ocultar a lista para permitir que o clique no item seja processado
        setTimeout(function () {
            if (!correspondeAItem()) {
                // Se o valor não corresponder a um item na lista, redefina para o valor anterior
                inputDropdown.value = valorAnterior;
            }
            listaDropdown.style.display = 'none';
        }, 200);
    });

    listaDropdown.addEventListener('click', function (event) {
        if (event.target.tagName === 'LI') {
            valorAnterior = event.target.textContent;
            inputDropdown.value = valorAnterior;

            // Oculte a lista após um pequeno atraso para garantir que o valor do input seja atualizado antes
            setTimeout(function () {
                listaDropdown.style.display = 'none';
            }, 100);
        }
    });

    inputDropdown.addEventListener('input', function () {
        var input = this.value.trim().toLowerCase();
        var itens = listaDropdown.getElementsByTagName('li');

        for (var i = 0; i < itens.length; i++) {
            var textoItem = itens[i].textContent.toLowerCase();
            var itemVisivel = textoItem.indexOf(input) > -1;
            itens[i].style.display = itemVisivel ? 'block' : 'none';
        }

        // Exiba a lista apenas se houver correspondência com os itens
        var correspondenciaItens = Array.from(itens).some(function (item) {
            var textoItem = item.textContent.toLowerCase();
            var itemVisivel = textoItem.includes(input);
            item.style.display = itemVisivel ? 'block' : 'none';
            return itemVisivel;
        });

        listaDropdown.style.display = correspondenciaItens ? 'block' : 'none';
    });

    function correspondeAItem() {
        var input = inputDropdown.value.trim().toLowerCase();
        return Array.from(itens).some(function (item) {
            return item.textContent.toLowerCase() === input;
        });
    }
}

configurarDropdown('inputOperador', 'listOperador');
configurarDropdown('inputCodigo', 'listCodigo');
// Fim criar lista dentro de input

// Carregando itens para inputs clonados
function carregarItens2(inputId, listId) {
    var inputCodigo = document.getElementById(inputId);
    var listCodigo = document.getElementById(listId);

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
                // Atualiza o menu de itens com as opções retornadas do servidor
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
}
// Fim Carregando itens para inputs clonados

// Clonando campos
function clonarCampos() {
    // Selecione a última div com a classe 'camposSolicitacao'
    var camposOriginais = document.querySelectorAll('[id^="camposSolicitacao"]');

    // Verifique se há pelo menos uma div original
    if (camposOriginais.length > 0) {
        var ultimoCamposSolicitacao = camposOriginais[camposOriginais.length - 1];
        var novoCamposSolicitacao = ultimoCamposSolicitacao.cloneNode(true);
        var timestamp = new Date().getTime();

        // Altere o ID da div clonada
        novoCamposSolicitacao.id = 'camposSolicitacao-clone_' + timestamp;

        // Crie IDs únicos para os elementos clonados
        novoCamposSolicitacao.querySelectorAll('[id]').forEach(function (elemento) {
            // Remova o sufixo numérico do ID original e adicione o novo timestamp
            elemento.id = elemento.id.replace(/-clone_\d+$/, '') + '-clone_' + timestamp;
        });

        // Atualize o atributo 'for' das etiquetas <label> para corresponder ao novo ID dos elementos <input>
        novoCamposSolicitacao.querySelectorAll('label').forEach(function (label) {
            var inputId = label.getAttribute('for');
            if (inputId) {
                var newInputId = inputId.replace(/-clone_\d+$/, '') + '-clone_' + timestamp;
                label.setAttribute('for', newInputId);
            }
        });

        // Atualize o atributo 'name' dos elementos <input> do tipo rádio
        novoCamposSolicitacao.querySelectorAll('input[type="radio"]').forEach(function (radio) {
            radio.checked = false;
            
            var radioName = radio.getAttribute('name');
            if (radioName) {
                var newRadioName = radioName.replace(/-clone_\d+$/, '') + '-clone_' + timestamp;
                radio.setAttribute('name', newRadioName);
            }
        });

        // Limpe os valores dos campos clonados
        novoCamposSolicitacao.querySelectorAll('input[type="text"], input[type="number"], select').forEach(function (elemento) {
            elemento.value = '';
        });

        // Adicione o novo conjunto de campos após o último conjunto clonado
        ultimoCamposSolicitacao.parentNode.appendChild(novoCamposSolicitacao);

        // Chame a função de configuração do dropdown após a inserção no DOM
        configurarDropdown('inputCodigo-clone_' + timestamp, 'listCodigo-clone_' + timestamp);
        configurarDropdown('inputOperador-clone_' + timestamp, 'listOperador-clone_' + timestamp);

    } else {
        console.error('Não há divs originais para clonar.');
    }
}
// Fim clonando campos

// Carregando operadores para campos clonados
function carregarOperadores2(inputId, listId) {
    var inputOperador = document.getElementById(inputId);
    var listOperador = document.getElementById(listId);

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
// Fim carregando campos para campos clonados

// Carregando itens com base no id clonado
function getId_itens(element) {
    var id = element.id;
    var listId = id.replace('inputCodigo-clone_', 'listCodigo-clone_')

    carregarItens2(id, listId);
}
// Fim Carregando itens com base no id clonado

// Carregando operadores com base no id clonado
function getId_operadores(element) {
    var id = element.id;
    var listId = id.replace('inputOperador-clone_', 'listOperador-clone_')

    carregarOperadores2(id, listId);
}
// Fim Carregando operadores com base no id clonado