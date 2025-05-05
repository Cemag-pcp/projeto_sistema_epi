var checkboxCriarPadrao = document.querySelector('.criar-padrao');
var modalEscolherNomePadrao = document.getElementById('modalEscolherNomePadrao');
var idNomePadrao = document.getElementById('idNomePadrao');

checkboxCriarPadrao.addEventListener('change', function(){
    if (this.checked) {
        $('#modalEscolherNomePadrao').modal('show');
    } else {
        $('#modalEscolherNomePadrao').modal('hide');
        idNomePadrao.value = '';
    }
});

function enviarSolicitacao() {

    var criarPadrao = document.querySelector('.criar-padrao').checked;
    var modalEscolherNomePadrao = document.getElementById('modalEscolherNomePadrao');
    var idNomePadrao = document.getElementById('idNomePadrao');

    if (verificarDuplicatas()) {
        exibirMensagem('aviso','Existe informações duplicadas')
        return;
    }

    $("#loading-overlay").show();
    
    document.getElementById('btnEnviarSolicitacao').disabled = true;

    // Selecione todos os camposSolicitacao e seus clones
    var campoSolicitante = document.getElementById('inputSolicitante').value;
    var camposSolicitacao = document.querySelectorAll('[id^="camposSolicitacao"]');
    var inputDropdown = document.getElementById('inputOperador');
    var listaDropdown = document.getElementById('listOperador');
    var itens = listaDropdown.getElementsByTagName('li');

    var inputValor = inputDropdown.value.trim().toLowerCase();

    var estaNaLista = Array.from(itens).some(function (item) {
        var textoItem = item.textContent.trim().toLowerCase();
        var inputValor = inputDropdown.value.trim().toLowerCase();
        return textoItem === inputValor;
    });

    if (!estaNaLista) {
        $("#loading-overlay").hide();
        exibirMensagem('aviso','Preencha o operador da forma correta')
        document.getElementById('btnEnviarSolicitacao').disabled = false;
        return
    } 

    // Crie um array para armazenar os dados
    var dados = [];

    // Flag para verificar se algum campo está em branco
    var campoEmBrancoEncontrado = false;

    // Flag para verificar se pelo menos um botão de rádio foi marcado em cada grupo
    var radioMarcado = true;

    camposSolicitacao.forEach(function(campos) {
        // Selecione todos os inputs dentro do camposSolicitacao atual
        var inputs = campos.querySelectorAll('input');

        // Flag para verificar se pelo menos um botão de rádio foi marcado no grupo atual
        var radioGrupoMarcado = false;

        // Crie um objeto para armazenar os dados do camposSolicitacao atual
        var dadosCampos = {'solicitante': campoSolicitante};

        // Itere sobre todos os inputs e armazene seus valores no objeto de dados do camposSolicitacao atual
        inputs.forEach(function(input) {
            // Verifique se o valor não está vazio antes de adicionar ao objeto
            console.log(input.id)
            console.log(input.value)
            if (input.value.trim() !== '' || input.id.includes("observacaoSolicitacao")) {
                if (input.type === 'radio') {
                    // Verifique se o radio está marcado e adicione ao objeto apenas se for true
                    if (input.checked) {
                        dadosCampos[input.id] = input.value;
                        radioGrupoMarcado = true;
                    }
                } else {
                    // Adicione outros tipos de input ao objeto
                    dadosCampos[input.id] = input.value;
                }
            } else {
                // Se encontrar um campo em branco, ajuste a flag
                campoEmBrancoEncontrado = true;
            }
        });

        dadosCampos = renomearCampos(dadosCampos);

        // Adicione o objeto de dados do camposSolicitacao atual ao array de dados
        dados.push(dadosCampos);

        // Se nenhum botão de rádio foi marcado no grupo, ajuste a flag geral
        if (!radioGrupoMarcado) {
            radioMarcado = false;
        }
        
    });

    // Verifique se pelo menos um botão de rádio foi marcado em algum grupo
    if (!radioMarcado) {
        exibirMensagem('aviso','Preencha todos os campos.')
        // exibirMensagem("aviso","Selecione uma opção de rádio em cada grupo")
        $("#loading-overlay").hide();
        document.getElementById('btnEnviarSolicitacao').disabled = false;
        return;
    }

    // Se algum campo estiver em branco, pare o loop
    if (campoEmBrancoEncontrado) {
        exibirMensagem('aviso','Preencha todos os campos')
        // exibirMensagem("aviso","Preencha todos os campos")
        $("#loading-overlay").hide();
        document.getElementById('btnEnviarSolicitacao').disabled = false;
        return;
    }

    var payload = {
        dados: dados
    };

    if (criarPadrao){


        if (idNomePadrao.value.trim() === ''){

            exibirMensagem('aviso','Preencha o nome do padrão, desmarque e marque novamente a caixa de seleção.')
            document.getElementById('btnEnviarSolicitacao').disabled = false;
            $("#loading-overlay").hide();
            return;

        };

        payload.nome_padrao = idNomePadrao.value.trim();
        
        $.ajax({
            url: '/salvar-novo-padrao',
            type: 'POST',
            data: JSON.stringify(payload),
            contentType: 'application/json',
            success: function () {
                // Adicione o parâmetro de sucesso à URL ao recarregar a página
                exibirMensagem('sucess','Enviado com sucesso')
                $("#loading-overlay").hide();
                window.location.reload();
            },
            error: function (error) {
                console.error('Erro na requisição AJAX:', error);
                $("#loading-overlay").hide();
            }
        });
    
    }

    $.ajax({
        url: '/solicitacao',
        type: 'POST',
        data: JSON.stringify(dados),
        contentType: 'application/json',
        success: function () {
            // Adicione o parâmetro de sucesso à URL ao recarregar a página
            exibirMensagem('sucess','Enviado com sucesso')
            $("#loading-overlay").hide();
            window.location.reload();
        },
        error: function (error) {
            console.error('Erro na requisição AJAX:', error);
            $("#loading-overlay").hide();
        }
    });

}
// Fim Enviar solicitação para o backend

// Função para verificar duplicatas
function verificarDuplicatas() {
    var inputsCodigo = document.querySelectorAll('[id^="inputCodigo"]');
    var inputsOperador = document.querySelectorAll('[id^="inputOperador"]');
    var inputsQuantidade = document.querySelectorAll('[id^="inputQuantidade"]');
    var valoresCodigoOperadorQuantidade = [];

    // Itere sobre os inputs de código, operador e quantidade simultaneamente
    for (var i = 0; i < inputsCodigo.length; i++) {
        var valorCodigo = inputsCodigo[i].value.trim();
        var valorOperador = inputsOperador[i].value.trim();
        var valorQuantidade = inputsQuantidade[i].value.trim();

        // Verifique se a quantidade é menor que 1
        if (parseInt(valorQuantidade) < 1) {
            return true; // Quantidade menor que 1 encontrada
        }

        var chave = valorCodigo + '-' + valorOperador;

        // Verifique se a combinação já existe no array
        if (valoresCodigoOperadorQuantidade.includes(chave)) {
            return true; // Duplicata encontrada
        }

        valoresCodigoOperadorQuantidade.push(chave);
    }

    return false; // Nenhuma duplicata ou quantidade menor que 1 encontrada
}

function verificarNomePadrao() {

    $("#loading-overlay").show();

    var nome_padrao = document.getElementById('idNomePadrao').value;
    var nome_solicitante = document.getElementById('inputSolicitante').value;

    if (nome_padrao === ''){
        exibirMensagem('aviso', 'Escolha um nome válido.');
        return;
    }

    $.ajax({
        url: '/verificar-nome-padrao',
        type: 'POST',
        data: JSON.stringify({ nome_padrao: nome_padrao, nome_solicitante: nome_solicitante }), // Envolvendo nome_padrao em um objeto
        contentType: 'application/json',
        success: function (response) {
            // Supondo que a resposta contenha uma propriedade `mensagem`
            if (response.mensagem) {
                exibirMensagem(response.tipo, response.mensagem);
                if (response.tipo !== 'aviso') {
                    console.log(response.tipo);
                    $('#modalEscolherNomePadrao').modal('hide');
                }
            } else {
                exibirMensagem('success', 'Enviado com sucesso');
            }
            $("#loading-overlay").hide();
        },
        error: function (error) {
            console.error('Erro na requisição AJAX:', error);
            $("#loading-overlay").hide();
            exibirMensagem('erro', 'Erro ao enviar a solicitação');
        }
    });
}

function renomearCampos(obj) {
    const novoObj = {};
    Object.keys(obj).forEach(key => {
        // Verifique se a chave contém "-clone_"
        if (key.includes('-clone_')) {
            // Remova a parte "-clone_*"
            const novaChave = key.split('-clone_')[0];
            novoObj[novaChave] = obj[key];
        } else {
            novoObj[key] = obj[key];
        }
    });
    return novoObj;
}

var btnSalvarNovoPadrao = document.getElementById('novoPadrao');


function popularBodyEscolhaPadrao() {
    
    $("#loading-overlay").show();

    $.ajax({
        url: '/buscar-padroes',
        type: 'GET',
        // data: JSON.stringify({ nome_padrao: nome_padrao, nome_solicitante: nome_solicitante }), // Envolvendo nome_padrao em um objeto
        contentType: 'application/json',
        success: function (response) {
            // Supondo que a resposta contenha uma propriedade `mensagem`
            var bodyEscolhaPadrao = document.getElementById('bodyEscolhaPadrao');

            // Limpa o conteúdo anterior
            bodyEscolhaPadrao.innerHTML = '';
            
            var padroesDisponiveis = response.padroes;

            padroesDisponiveis.forEach(padrao => {
                // Cria um contêiner flexível
                var divFlex = document.createElement('div');
                divFlex.style.display = 'flex';
                divFlex.style.alignItems = 'center';
                divFlex.style.marginBottom = '10px'; // Espaçamento entre os elementos
            
                // Cria um parágrafo para cada padrão
                var p = document.createElement('p');
                p.textContent = padrao[0];
                p.style.flex = '1'; // Permite que o parágrafo ocupe o espaço disponível
            
                var btnEscolher = document.createElement('button');
                btnEscolher.textContent = 'Escolher';
                btnEscolher.className = 'btn btn-success';
                btnEscolher.setAttribute('data-toggle', 'modal');
                btnEscolher.setAttribute('data-target', '#modalPadraoEscolhido');
                btnEscolher.setAttribute('data-dismiss', 'modal');
                btnEscolher.setAttribute('data-id', padrao[0]);
            
                btnEscolher.addEventListener('click', function() {
                    // Popular padrão escolhido
                    popularPadraoEscolhido(padrao[0]);
                });
            
                // Adiciona o parágrafo e o botão ao contêiner flexível
                divFlex.appendChild(p);
                divFlex.appendChild(btnEscolher);
            
                // Adiciona o contêiner flexível ao bodyEscolhaPadrao
                bodyEscolhaPadrao.appendChild(divFlex);
            });

            $("#loading-overlay").hide();

        },
        error: function (error) {
            console.error('Erro na requisição AJAX:', error);
            $("#loading-overlay").hide();
            exibirMensagem('erro', 'Erro ao enviar a solicitação');
        }
    });

}

function popularPadraoEscolhido(padrao){

    $("#loading-overlay").show();

    var bodyPadraoEscolhido = document.getElementById('bodyPadraoEscolhido');
            
    bodyPadraoEscolhido.innerHTML='';

    $.ajax({
        url: '/popular-padroes',
        type: 'POST',
        data: JSON.stringify({ nome_padrao: padrao }), // Envolvendo nome_padrao em um objeto
        contentType: 'application/json',
        success: function (response) {
            var itens = response.itens;

            console.log(itens)

            $("#nome_padrao_adicionado").val(itens[0].nome)
            $("#solicitante_adicionado").val(itens[0].matricula_solicitante)
            
            popularTabelaPadraoEscolhido(itens);

            $("#loading-overlay").hide();

        },
        error: function (error) {
            console.error('Erro na requisição AJAX:', error);
            $("#loading-overlay").hide();
            exibirMensagem('erro', 'Erro ao enviar a solicitação');
        }
    });

}

function popularTabelaPadraoEscolhido(itens) {
    // Cria a div com o ID no-more-tables
    console.log(itens)
    var divTableResponsive = document.createElement('div');
    divTableResponsive.setAttribute('class', 'table-responsive');

    // Cria a tabela com os atributos e classes desejados
    var table = document.createElement('table');
    table.className = 'table table-bordered horizontal-lines-only';
    table.id = 'dataTablePadrao';
    table.setAttribute('width', '100%');
    table.setAttribute('cellspacing', '0');
    table.style.fontSize = '14px';

    // Cria o cabeçalho da tabela
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');

    var headers = ['Código do Item', 'Funcionário', 'Motivo', 'Quantidade', 'Observação', 'Ações'];
    headers.forEach(headerText => {
        var th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Cria o corpo da tabela
    var tbody = document.createElement('tbody');

    itens.forEach((item, index) => {
        var row = document.createElement('tr');

        var codigoItemCell = document.createElement('td');
        codigoItemCell.textContent = item.codigo_item;
        row.appendChild(codigoItemCell);

        var funcionarioRecebeCell = document.createElement('td');
        funcionarioRecebeCell.textContent = item.funcionario_recebe;
        row.appendChild(funcionarioRecebeCell);

        var motivoCell = document.createElement('td');
        motivoCell.textContent = item.motivo;
        row.appendChild(motivoCell);

        var quantidadeCell = document.createElement('td');
        quantidadeCell.textContent = item.quantidade;
        row.appendChild(quantidadeCell);

        var obsCell = document.createElement('td');
        obsCell.textContent = item.observacao;
        row.appendChild(obsCell);

        // Cria a célula de ação com o botão de excluir
        var actionCell = document.createElement('td');
        actionCell.style.display = "flex";
        actionCell.style.flexDirection = "column";
        var deleteButton = document.createElement('button')
        deleteButton.style.flex = '1'
        deleteButton.textContent = 'Exclusão Temporária';
        deleteButton.className = 'btn btn-danger mb-2';

        
        var editButton = document.createElement('button');
        editButton.style.flex = '1'
        editButton.textContent = 'Editar Item';
        editButton.className = 'btn btn-success';
        editButton.setAttribute('data-target','#modalEditPadrao');
        editButton.setAttribute('data-toggle','modal');
        editButton.setAttribute('data-dismiss','modal');

        deleteButton.onclick = function() {
            var row = this.parentNode.parentNode;
            var undoCell = document.createElement('td');
            undoCell.setAttribute('colspan', headers.length);

            var undoLink = document.createElement('a');
            undoLink.textContent = 'Desfazer exclusão temporária';
            undoLink.href = '#';
            undoLink.onclick = function() {
                row.innerHTML = ''; // Limpa o conteúdo da linha

                row.appendChild(codigoItemCell);
                row.appendChild(funcionarioRecebeCell);
                row.appendChild(motivoCell);
                row.appendChild(quantidadeCell);
                row.appendChild(obsCell);
                row.appendChild(actionCell);

                return false;
            };

            var deletePermanentlyLink = document.createElement('a');
            deletePermanentlyLink.textContent = 'Excluir item do padrão';
            deletePermanentlyLink.style.color = 'red'
            deletePermanentlyLink.href = '#';
            deletePermanentlyLink.onclick = function() {
                $("#loading-overlay").show();
                fetch('/excluir-item-padrao', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nome_padrao: item.nome, codigo_item: item.codigo_item, 
                        matricula_solicitante: item.matricula_solicitante,funcionario_recebe:item.funcionario_recebe}) // Supondo que o item tenha um ID
                })
                .then(response => {
                    if (response.ok) {
                        row.remove(); // Remove a linha permanentemente se a exclusão for bem-sucedida
                        exibirMensagem("sucesso","Item excluído do Padrão")
                    } else {
                        alert('Falha ao excluir o item');
                    }
                    $("#loading-overlay").hide();
                })
                .catch(error => {
                    console.error('Erro ao excluir o item:', error);
                    alert('Erro ao excluir o item');
                    $("#loading-overlay").hide();
                });
                return false;
            };


            undoCell.appendChild(undoLink);
            undoCell.appendChild(document.createTextNode(' | ')); // Adiciona um separador
            undoCell.appendChild(deletePermanentlyLink);
            
            row.innerHTML = ''; // Limpa o conteúdo da linha
            row.appendChild(undoCell);
        };
        editButton.onclick = function(){
            // $('#modalEditPadrao').show();
            document.getElementById('equipamento_edit').value = item.codigo_item
            document.getElementById('motivo_edit').value = item.motivo
            document.getElementById('funcionario_edit').value = item.funcionario_recebe
            document.getElementById('observacao_edit').value = item.observacao           
            document.getElementById('quantidade_edit').value = item.quantidade
            document.getElementById('solicitante_edit').value = item.matricula_solicitante
            document.getElementById('nome_padrao_edit').value = item.nome
            document.getElementById('equipamento_anterior_edit').value = item.codigo_item
        }
        actionCell.appendChild(deleteButton);
        actionCell.appendChild(editButton);
        row.appendChild(actionCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Adiciona a tabela dentro da div
    divTableResponsive.appendChild(table);

    // Adiciona a div ao bodyPadraoEscolhido
    var bodyPadraoEscolhido = document.getElementById('bodyPadraoEscolhido');
    bodyPadraoEscolhido.innerHTML = ''; // Limpa o conteúdo anterior
    bodyPadraoEscolhido.appendChild(divTableResponsive);
}

function confirmarEscolhaPadrao() {
    
    $("#loading-overlay").show();

    var tabela = document.getElementById('dataTablePadrao');
    var linhas = tabela.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    var dadosTabela = [];
    var campoSolicitante = document.getElementById('inputSolicitante').value;

    for (var i = 0; i < linhas.length; i++) {
        var colunas = linhas[i].getElementsByTagName('td');
        
        // Verifica se a linha possui colunas de desfazer
        if (colunas.length > 1 && colunas[5].textContent.trim() !== 'Desfazer exclusão temporária') {
            var dadosLinha = {
                solicitante: campoSolicitante,
                inputCodigo: colunas[0].textContent,
                inputQuantidade: colunas[3].textContent,
                inputObservacao: colunas[1].textContent,
                inputOperador: colunas[4].textContent,
                radioSubstituicao: colunas[2].textContent,
            };
            dadosTabela.push(dadosLinha);
        }
    }

    if (dadosTabela.length === 0) {
        $("#loading-overlay").hide();
        exibirMensagem('aviso','Sem dados na tabela de padrões');
        return; // Sai da função se dadosTabela estiver vazio
    }
    $("#loading-overlay").hide();
    console.log(dadosTabela);
    $.ajax({
        url: '/solicitacao',
        type: 'POST',
        data: JSON.stringify(dadosTabela), // Envolvendo nome_padrao em um objeto
        contentType: 'application/json',
        success: function (response) {

            $("#loading-overlay").hide();
            $('modalPadraoEscolhido').modal('hide');
            exibirMensagem('success','Solicitação aberta com sucesso.');
        },
        error: function (error) {
            console.error('Erro na requisição AJAX:', error);
            $("#loading-overlay").hide();
            exibirMensagem('erro', 'Erro ao enviar a solicitação');
        }
    });

}

$("#add_item_padrao").on('click', function() {

    $("#loading-overlay").show();

    $("#add_item_padrao").prop('disabled', true);

    let equipamento_adicionado = $("#equipamento_adicionado").val();
    let quantidade_adicionado = $("#quantidade_adicionado").val();
    let motivo_adicionado = $("#motivo_adicionado").val();
    let funcionario_adicionado = $("#funcionario_adicionado").val();
    let observacao_adicionado = $("#observacao_adicionado").val();
    let nome_padrao_adicionado = $("#nome_padrao_adicionado").val();
    let solicitante_adicionado = $("#solicitante_adicionado").val();

    if(equipamento_adicionado === "" || quantidade_adicionado === "" || quantidade_adicionado < 0 ||motivo_adicionado === null || funcionario_adicionado === ""){
        exibirMensagem('aviso', 'Preencha todos os campos');
        $("#add_item_padrao").prop('disabled', false);
        $("#loading-overlay").hide();
        return
    }

    $.ajax({
        url: '/add-item-padrao',
        type: 'POST',
        data: JSON.stringify({ 
            'equipamento_adicionado': equipamento_adicionado,
            'quantidade_adicionado': quantidade_adicionado,
            'motivo_adicionado': motivo_adicionado,
            'funcionario_adicionado': funcionario_adicionado,
            'observacao_adicionado': observacao_adicionado,
            'nome_padrao_adicionado': nome_padrao_adicionado,
            'solicitante_adicionado': solicitante_adicionado
        }),
        contentType: 'application/json',
        success: function (response) {
            $("#loading-overlay").hide();
            $('#modalAddNovoPadrao').modal('hide');
            exibirMensagem('success', 'Novo equipamento adicionado ao padrão ' + nome_padrao_adicionado);
            $("#equipamento_adicionado").val("");
            $("#quantidade_adicionado").val("");
            $("#motivo_adicionado").val("");
            $("#funcionario_adicionado").val("");
            $("#observacao_adicionado").val("");
            $("#nome_padrao_adicionado").val("");
            $("#solicitante_adicionado").val("");
            $("#add_item_padrao").prop('disabled', false);
        },
        error: function (error) {
            console.error('Erro na requisição AJAX:', error);
            $("#loading-overlay").hide();
            exibirMensagem('aviso', 'Erro ao adicionar novo item');
            $("#add_item_padrao").prop('disabled', false);
        }
    });
});

$("#edit_item_padrao").on('click', function(){
    $("#loading-overlay").show();

    $("#edit_item_padrao").prop('disabled',true);

    let equipamento_edit = $('#equipamento_edit').val();
    let solicitante_edit = $('#solicitante_edit').val();
    let nome_padrao_edit = $('#nome_padrao_edit').val();
    let nome_padrao_anterior = $('#equipamento_anterior_edit').val();
    let funcionario_edit = $('#funcionario_edit').val();

    console.log('solicitante_edit: '+ $('#solicitante_edit').val());

    if (equipamento_edit === ''){
        exibirMensagem('aviso','O campo de equipamento não pode ser vazio!');
        $("#edit_item_padrao").prop('disabled',false);
        $("#loading-overlay").hide();
        return;
    }

    $.ajax({
        url: '/edit-item-padrao',
        type: 'POST',
        data: JSON.stringify({
            'equipamento_edit': equipamento_edit,
            'solicitante_edit': solicitante_edit,
            'nome_padrao_edit': nome_padrao_edit,
            'nome_padrao_anterior': nome_padrao_anterior,
            'funcionario_edit': funcionario_edit,
        }),
        contentType: 'application/json',
        success: function (response){
            $("#loading-overlay").hide();
            $('#modalEditPadrao').modal('hide');
            exibirMensagem('success', 'Equipamento editado com sucesso!');
            $("#edit_item_padrao").prop('disabled',false);
        },
        error: function(error){
            console.error('Erro na requisição AJAX: ',error);
            $("#loading-overlay").hide();
            exibirMensagem('aviso', 'Erro ao atualizar item');
            $("#edit_item_padrao").prop('disabled', false);

        }
    });

})


