 // Cria listas dentro do input
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
// Fim criar lista dentro de input

// Carrega dados de itens dentro do input

function carregarItens(listCodigo) {
        
    // Verifica se os itens estão em cache
    var itensCache = localStorage.getItem('itensCache');

    if (itensCache) {
        // Se estiver em cache, utiliza os dados do cache
        atualizarLista(JSON.parse(itensCache),listCodigo);
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

function atualizarLista(itens,listCodigo) {
    listCodigo.innerHTML = '';

    itens.forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        listCodigo.appendChild(li);
    });
}