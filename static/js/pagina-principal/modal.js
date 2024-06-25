function modalExecucao(id_solicitante,funcionario_nome,solicitante_nome) {

    $('#salvarExecucao').data('id_solicitante', id_solicitante);

    console.log(id_solicitante)

    $("#loading-overlay").show();

    // REQUISIÇÃO PARA PEGAR OS VALORES DO MODAL EXECUÇÃO
    $('#salvarExecucao').prop('disabled',true)
    
    $.ajax({
        url:'/dados-execucao',
        type:'POST',
        dataType:'json',
        contentType:'application/json',
        data: JSON.stringify({ 'id_solicitante': id_solicitante }),  // Enviando um objeto JSON
        success: function(response) {

            $('.info_data button').empty()
            $('.info_previsao button').empty()

            $('#modalExecutarSolicitacao').modal('show');

            if (response.data_assinado === null) {

                $('#data_entrega_execucao').val('');
                $('#previsao_entrega_execucao').val('');
                $('.info_data').append(`<button type="button" id='info' style="background: none; border: none; padding: 0; font-size: inherit;" data-toggle="tooltip" data-placement="top" title="Data de entrega e Previsão de troca só exibirão após a assinatura">
                                            <i class="fa-solid fa-circle-info" aria-hidden="true" style="color: #4e73df;"></i>
                                        </button>`)
            } else {
                $('#data_entrega_execucao').val(formatarDataBr(response.data_assinado));

                // Atribui o valor calculado ao campo #previsao_entrega_execucao
                // $('#previsao_entrega_execucao').val(previsaoEntrega);
            }

            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            })

            // Preencher os campos do formulário com as informações gerais
            $('#dataSolicitacao').val(formatarDataBr(response.data_solicitacao));
            $('#funcionario_execucao').val(funcionario_nome);
            $('#setor_execucao').val(response.setor);
            $('#solicitante_execucao').val(solicitante_nome);
            

            // Adicionar campos de entrada para cada equipamento
            var containerEquipamentos = $('#containerEquipamentos');
            containerEquipamentos.empty();
            let equip_num = '';
            console.log(response)
            response.equipamentos.forEach(function(equipamento, index) {
                // var data_previsao;
                calcularPrevisaoEntrega(equipamento, response.data_assinado, function (previsao) {
                    // data_previsao = previsao;
                    var novoInput = `
                    <hr>
                    <div class="d-flex justify-content-between mb-3">
                        <h6 class="m-0 font-weight-bold text-primary">Equipamento `+ equip_num +`</h6>
                        <i class="fa-solid fa-trash fa-flip-horizontal" id="excluirEquip_`+ index +`" style="color: #ff7a7a; cursor:pointer;"></i>
                    </div
                    <hr>
                    <hr>
                    <div class="row" id='Campo_Equipamento'>
                        <div class="col-sm-2 mb-2">
                            <label>Id</label>
                            <input type="text" class="form-control" id="idExecucao_`+ index +`" value="` + equipamento.id + `" autocomplete="off" disabled> 
                        </div>
                        <div class="col-sm-10 mb-2">
                            <label>Equipamento</label>
                            <input type="text" class="form-control" id="equipamentoSolicitado_`+ index +`" value="` + equipamento.codigo + `" autocomplete="off"> 
                            <ul class="dropdown-list" id="listCodigo` + index + `">
                            </ul>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4 mb-2">
                            <label>Quantidade</label>
                            <input type="number" class="form-control" id="quantidadeExecucao_`+ index +`" value="` + equipamento.quantidade + `" autocomplete="off"> 
                        </div>
                        <div class="col-sm-4">
                            <label>Motivo:</label>
                            <select class="form-control form-control" style='padding: .375rem .25rem;' id="motivoExecucao_`+ index +`">
                            <option value="` + equipamento.motivo + `" selected disabled hidden>` + equipamento.motivo + `</option>
                            <option value="Perda">Perda</option>
                            <option value="Dano">Dano</option>
                            <option value="Admissão">Admissão</option>
                            <option value="Substituição">Substituição</option>
                            <option value="Primeira Entrega">Primeira Entrega</option>
                        </select>
                        </div>
                        
                        <div class="col-sm-4 mb-2">
                            <div class="info_previsao">
                                <label>Previsão de troca</label>
                            </div>
                            <input type="datetime" class="form-control" id="previsao_entrega_execucao`+index+`" value="`+previsao+`" autocomplete="off" disabled> 
                        </div>
                        
                    </div>`;

                    containerEquipamentos.append(novoInput);
                    if(equip_num === ''){
                        equip_num = 2
                    } else{
                        equip_num++
                    }
                    
                    configurarDropdown('equipamentoSolicitado_'+index, 'listCodigo'+index)

                    var inputCodigo = document.getElementById('equipamentoSolicitado_' + index);
                    var inputQuantidade = document.getElementById('quantidadeExecucao_' + index);
                    var selectMotivo = document.getElementById('motivoExecucao_' + index);
                    var excluirEquip = document.getElementById('excluirEquip_' + index);

                    if (response.equipamentos.length > 1) {
                        excluirEquip.addEventListener('click', function() {
                            modalExcluirEquipamento(funcionario_nome,equipamento.codigo,equipamento.id,id_solicitante)
                        });
                    } else {
                        excluirEquip.disabled = true;
                        excluirEquip.style.display = 'none';
                    }
            
                    var listCodigo = document.getElementById('listCodigo'+index);

                    inputCodigo.addEventListener('click', function() {
                        carregarItens(listCodigo);
                    });

                    inputCodigo.addEventListener('focus', function() {
                        carregarItens(listCodigo);
                    });

                    listCodigo.addEventListener('click', function() {
                        if(inputCodigo.value == equipamento.codigo && selectMotivo.value == equipamento.motivo){
                            $('#salvarExecucao').prop('disabled',true)
                        } else {
                            $('#salvarExecucao').prop('disabled',false);
                        }
                    });

                    selectMotivo.addEventListener('change',function(){
                        if(selectMotivo.value == equipamento.motivo){
                            $('#salvarExecucao').prop('disabled',true)
                        } else {
                            $('#salvarExecucao').prop('disabled',false);
                        }
                    })
                    
                    inputQuantidade.addEventListener('input', function() {
                        if(inputQuantidade.value == equipamento.quantidade || inputQuantidade.value < 1){
                            $('#salvarExecucao').prop('disabled',true)
                        } else {
                            $('#salvarExecucao').prop('disabled',false);
                        }
                    });

                });
                
            });

            $("#loading-overlay").hide();
        },
        error: function(error) {
            // hideLoading();
            alert('Erro ao abrir o modal de edição, solicite assistência');
            $("#loading-overlay").hide();
            console.log(error);
        }
    })

}

function adicionarEquipamento() {
    var containerEquipamentos = $('#containerEquipamentos');
    var novoIndex = containerEquipamentos.children('.equipamento-container').length;
    var indexEquipamento = containerEquipamentos.children('#Campo_Equipamento').length + containerEquipamentos.children('.equipamento-container').length;

    var novoInput = `
    <div class="equipamento-container" id="equipamento_${novoIndex}">
        <hr>
        <div class="d-flex justify-content-between mb-3">
            <h6 class="m-0 font-weight-bold text-primary">Equipamento adicionado</h6>
            <i class="fa-solid fa-trash fa-flip-horizontal" style="color: #ff7a7a; cursor:pointer;" onclick="removerEquipamento(${novoIndex})"></i>
        </div>
        <hr>
        <div class="row">
            <div class="col-sm-2 mb-2">
                <label for="idClone_${novoIndex}">Id</label>
                <input type="text" class="form-control" id="idClone_${novoIndex}" autocomplete="off" disabled>
            </div>
            <div class="col-sm-10 mb-2">
                <label for="equipamentoClone_${novoIndex}">Equipamento</label>
                <input type="text" class="form-control" id="equipamentoClone_${novoIndex}" autocomplete="off">
                <ul class="dropdown-list" id="listCodigo_${novoIndex}">
                </ul>
            </div>
        </div>
        <div class="row" style="align-items:end">
            <div class="col-sm-2">
                <label for="quantidadeClone_${novoIndex}">Quantidade</label>
                <input type="number" class="form-control" id="quantidadeClone_${novoIndex}" autocomplete="off">
            </div>
            <div class="col-sm-4">
                <label for="motivoClone_${novoIndex}">Motivo:</label>
                <select class="form-control form-control" id="motivoClone_${novoIndex}" style='padding: .375rem .25rem;'>
                    <option value="" selected disabled hidden>Selecione o motivo</option>
                    <option value="Perda">Perda</option>
                    <option value="Dano">Dano</option>
                    <option value="Admissão">Admissão</option>
                    <option value="Substituição">Substituição</option>
                    <option value="Primeira Entrega">Primeira Entrega</option>
                </select>
            </div>
            <div class="col-sm-4">
                <label for="previsao_entrega_clone_${novoIndex}">Previsão de troca</label>
                <input type="datetime" class="form-control" id="previsao_entrega_clone_${novoIndex}" autocomplete="off" disabled>
            </div>
            <div class="col-sm-2">
                <button class="btn btn-primary" style="width:100%" type="button" onclick="acaoBotao(equipamentoClone_${novoIndex})">Salvar</button>
            </div>
        </div>
    </div>`;

    containerEquipamentos.append(novoInput);

    configurarDropdown('equipamentoClone_'+novoIndex, 'listCodigo_'+novoIndex)

    var equipamentoClone = document.getElementById('equipamentoClone_' + novoIndex);

    var listCodigo = document.getElementById('listCodigo_'+novoIndex);

    equipamentoClone.addEventListener('click', function() {
        carregarItens(listCodigo);
    });
    equipamentoClone.addEventListener('focus', function() {
        carregarItens(listCodigo);
    });
}

// Função para remover um container de equipamento específico
function removerEquipamento(index) {
    $('#equipamento_' + index).remove();

    // Reindexar os containers restantes
    reindexarEquipamentos();
}

// Função para reindexar os containers de equipamentos após a remoção
function reindexarEquipamentos() {
    $('#containerEquipamentos').children('.equipamento-container').each(function(index) {
        $(this).attr('id', 'equipamento_' + index);
        $(this).find('i').attr('onclick', 'removerEquipamento(' + index + ')');

        // Atualiza os IDs e os 'for' dos labels dos campos de input e select
        $(this).find('input, select').each(function() {
            var oldId = $(this).attr('id');
            var newId = oldId.replace(/_\d+$/, '_' + index);
            $(this).attr('id', newId);
            $(this).prev('label').attr('for', newId);
        });

        $(this).find('button').each(function() {
            var oldId = $(this).attr('id');
            var newId = oldId.replace(/_\d+$/, '_' + index);
            $(this).attr('id', newId);
            $(this).attr('onclick', 'acaoBotao(' + index + ')');
        });
    });
}

function acaoBotao(index) {
    // Coloque aqui a ação que você deseja realizar ao clicar no botão
    alert('Botão clicado no contêiner de índice: ' + index);
}

// Evento para adicionar um novo container de equipamento
$('#adicionarEquipamento').click(function() {
    adicionarEquipamento();
});


$('#salvarExecucao').one('click',function() {
    var id_solicitante = $(this).data('id_solicitante');

    alterarDadosExecucao(id_solicitante)
})

$('#btnExcluirAssinatura').one('click',function() {

    $("#loading-overlay").show();
    var id_solicitante = $(this).data('id_solicitacao');


    console.log(id_solicitante)

    // Agora, você pode enviar esses dados em uma requisição POST
    fetch('excluir-assinatura', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_solicitante: id_solicitante }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Resposta do servidor:', data);
        exibirMensagem('sucesso', 'Assinatura removida.')
        $('#modalExcluirAssinatura').modal('hide');
        $("#loading-overlay").hide();
        location.reload()
    })
    .catch(error => {
        console.error('Erro ao fazer a requisição:', error);
        $("#loading-overlay").hide();
    });
})

function modalAssinatura(nome_funcionario,id_solicitacao,id,data) {

    $('#modalAssinatura .modal-title').text('Assinatura do Funcionario: ' + nome_funcionario );

    $('#modalAssinatura').modal('show');

    console.log(id_solicitacao)

    // TRATAMENTO PARA NÃO ENVIAR MAIS DE UMA REQUISIÇÃO
    if (!signaturePad.calledOnce) {
        signaturePad(id_solicitacao,id);

        // Definir a variável de controle para indicar que a função foi chamada
        signaturePad.calledOnce = true;
    }

}

function modalTimeline(id_solicitacao,codigo_item,funcionario) {

    $.ajax({
        url: '/timeline',
        type: 'POST',  // Alterado para POST
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ 'id_solicitacao': id_solicitacao }),  // Enviando um objeto JSON
        success: function(response) {
            // Limpar conteúdo atual da lista
            $('#listaHistorico').empty();

            $('#modalTimeline').modal('show');

            // Seus dados fornecidos
            var dados = response[1]; // Certifique-se de ajustar conforme a estrutura real da resposta
            console.log(dados);
            console.log(response);
            
            // Loop pelos dados e gerar elementos da lista
            for (var i = 0; i < dados.length; i++) {
                var item = dados[i];
                var listItem = document.createElement('a');
                listItem.className = 'list-group-item list-group-item-action';
                // listItem.href = '#';
                listItem.setAttribute('aria-current', 'true');

                if (item[0] === 0) {
                    var content = `
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${item[3]}</h5>
                        <div class="d-flex flex-column align-items-end">
                            <small>Matrícula do funcionário: ${funcionario}</small>
                            <small>Exec.: ${i}</small>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1" style="font-size: small;"><strong>Data: </strong>${formatarDataBr(item[2])}</p>
                        </div> 
                    </div>    
                `;
                } else {
                    var content = `
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${item[3]}</h5>
                        <div class="d-flex flex-column align-items-end">
                            <small>Matrícula do funcionário: ${funcionario}</small>
                            <small>Exec.: ${i}</small>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1" style="font-size: small;"><strong>Data: </strong>${formatarDataBr(item[2])}</p>
                        </div> 
                    </div>                       
                `;
                }

                listItem.innerHTML = content;

                // Use addEventListener para lidar com o clique
                (function(itemValue) {
                    $(listItem).on('click', function() {
                        // Chamar a função apenas uma vez
                        itensParaEditar(id_ordem, itemValue);
                    });
                })(item[0]);
                
                document.getElementById('listaHistorico').appendChild(listItem);
            }
        
        },
        error: function(error) {
            alert('Ocorreu um erro ao buscar os vídeos');
            console.log(error);
        }
    });
}

function modalExcluirSolicitacao(funcionario, id_solicitacao) {

    $('#btnExcluir').data('id_solicitacao', id_solicitacao);

    $('#modalExcluirSolicitacao .modal-body').text('Tem certeza que quer remover essa solicitação de EPI do(a) ' + funcionario + ' ? ');

    $('#modalExcluirSolicitacao').modal('show');

}

function modalExcluirAssinatura(funcionario, id_solicitacao) {

    $('#btnExcluirAssinatura').data('id_solicitacao', id_solicitacao);
    console.log(id_solicitacao)

    $('#modalExcluirAssinatura .modal-body').text('Tem certeza que quer remover a assinatura do(a) ' + funcionario + ' ? ');

    $('#modalExcluirAssinatura').modal('show');

}

// Botão de excluir do modal modalExcluirSolicitacao
$('#btnExcluir').one('click',function () {

    var id_solicitacao = $(this).data('id_solicitacao');

    $("#loading-overlay").show();
    
    $(this).prop('disabled', true);
    // Realizar a requisição AJAX para o backend
    $.ajax({
        type: 'POST',
        url: '/excluir-solicitacao',
        contentType: 'application/json',
        data: JSON.stringify({ 'id_solicitacao': id_solicitacao }),
        success: function (response) {
            console.log(response);
            $('#modalExcluirSolicitacao').modal('hide');
            exibirMensagem('sucesso', 'Excluido com Sucesso');
            $("#loading-overlay").hide();
            location.reload();
        },
        error: function (error) {
            console.log('Erro na requisição:', error);
            $("#loading-overlay").hide();
        },
        complete: function () {
            // Reativar o botão após a requisição ser concluída (bem-sucedida ou com erro)
            $('#btnExcluir').prop('disabled', false);
        }
    });
});

function modalExcluirEquipamento(funcionario, codigo,id,id_solicitante) {

    $('#btnExcluirEquipamento').data('info', {codigo:codigo,id:id,id_solicitante:id_solicitante});

    console.log(id)

    $('#modalExecutarSolicitacao').modal('hide');
    
    $('#modalExcluirEquipamento .modal-body').text('Tem certeza que deseja remover o equipamento de EPI '+ codigo +' do funcionário(a) ' + funcionario + ' ? ');

    $('#modalExcluirEquipamento').modal('show');

}

function modalSolicitacao() {
    
    if (valoresClicados.length === 0) {
        exibirMensagem('aviso', 'Selecione o equipamento que deseja ser substituído');
        return;
    } 

    console.log(valoresClicados[0])

    var modalBody = document.getElementById('modalSolicitacaoBody');
    modalBody.innerHTML = ''; // Limpa o conteúdo atual do modalBody
    
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    for (var i = 0; i < valoresClicados.length; i++) {
        var item = valoresClicados[i];
        var itemEquipamento = item[1].trim();
    
        var content = `
            <hr>
            <div class="d-flex justify-content-between mb-3">
                    <h6 class="m-0 font-weight-bold text-primary">Solicitação ${i + 1}</h6>
            </div>
            <hr>
            <div class="row">
                <div class="col-sm-6 col-6 mb-4">
                    <label>Equipamento</label>
                    <input id="equipamentoTroca${i}" class="form-control text-truncate" data-toggle="tooltip" data-placement="top" title="${itemEquipamento}" style="cursor: default;" value="${itemEquipamento}" readonly>
                </div>
                <div class="col-sm-6 col-6 mb-4">
                    <label>Solicitante</label>
                    <input id="solicitanteTroca${i}" value="4345 - JOSE EDENILSON DE CASTRO" class="form-control" readonly>
                </div>
            </div> 
            <div class="row">
                <div class="col-sm-6 col-6 mb-4">
                    <label>Funcionário</label>
                    <input id="funcionarioTroca${i}" class="form-control text-truncate" data-toggle="tooltip" data-placement="top" title="${item[2]}" style="cursor: default;" value="${item[2]}" readonly>
                </div>
                <div class="col-sm-4 col-6 mb-4">
                    <label>Motivo</label>
                    <input id="motivoTroca${i}" class="form-control" value="Substituição" readonly>
                </div>
                <div class="col-sm-2 col-4 mb-4">
                    <label>Quantidade</label>
                    <input type="number" id="quantidadeTroca${i}" class="form-control">
                </div>
            </div>
        `;
        modalBody.innerHTML += content;
    }
    $('#modalSolicitacao').modal('show');
}


$('#envio_troca').on('click',function () {
    modalSolicitacao()
})

// Botão de excluir do modal modalExcluirSolicitacao
$('#btnExcluirEquipamento').one('click',function () {

    var info = $(this).data('info');

    console.log(info)

    var codigo = info.codigo;
    var id = info.id;
    var id_solicitante = info.id_solicitante;

    codigo = codigo.split(' - ')[0]

    $("#loading-overlay").show();
    
    $(this).prop('disabled', true);
    // Realizar a requisição AJAX para o backend
    $.ajax({
        type: 'POST',
        url: '/excluir-equipamento',
        contentType: 'application/json',
        data: JSON.stringify({ 'id': id, 'codigo':codigo, 'id_solicitante':id_solicitante}),
        success: function (response) {
            console.log(response);
            $('#modalExcluirSolicitacao').modal('hide');
            exibirMensagem('sucesso', 'Excluido com Sucesso');
            $("#loading-overlay").hide();
            location.reload();
        },
        error: function (error) {
            console.log('Erro na requisição:', error);
            $("#loading-overlay").hide();
        },
        complete: function () {
            // Reativar o botão após a requisição ser concluída (bem-sucedida ou com erro)
            $('#btnExcluirEquipamento').prop('disabled', false);
        }
    });
});

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

$('#modalExecutarSolicitacao').on('show.bs.modal', function () {
    $('body').addClass('modal-open');
});

// Remove a classe ao fechar o modal
$('#modalExecutarSolicitacao').on('hidden.bs.modal', function () {
    $('body').removeClass('modal-open');
});

$('#modalAssinatura').on('show.bs.modal', function () {
    $('body').addClass('modal-open');
});

// Remove a classe ao fechar o modal
$('#modalAssinatura').on('hidden.bs.modal', function () {
    $('body').removeClass('modal-open');
});