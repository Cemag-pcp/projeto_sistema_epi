
 // CAMPO DE ALTERAÇÃO DE DADOS DA EXECUÇÃO

function alterarDadosExecucao(id_solicitacao) {
    $("#loading-overlay").show();
    // Obtém todos os elementos que correspondem aos seletores desejados
    const elementos = document.querySelectorAll('[id^="equipamentoSolicitado_"]');
    console.log(elementos)
    // Cria um array para armazenar os dados
    const dados = [];

    // Itera sobre os elementos e extrai as informações
    elementos.forEach(elemento => {
        const id = elemento.id.split('_')[1];
        console.log(id)
        const idExecucao = document.getElementById(`idExecucao_${id}`).value;
        const equipamento = document.getElementById(`equipamentoSolicitado_${id}`).value;
        const quantidade = document.getElementById(`quantidadeExecucao_${id}`).value;
        const motivo = document.getElementById(`motivoExecucao_${id}`).value;
        const observacao = document.getElementById(`observacaoExecucao_${id}`).value;

        // Adiciona os dados ao array
        dados.push({id_solicitacao,idExecucao, equipamento, quantidade, motivo, observacao});
    });

    // Verifica se algum objeto tem campos inválidos, exceto 'observacao'
    if (dados.some(obj => {
        const { observacao, ...rest } = obj; // Exclui a propriedade 'observacao'
        return Object.values(rest).some(value => !value.trim());
    })) {
        exibirMensagem('aviso', 'Campo de equipamento, quantidade ou motivo inválido');
        $("#loading-overlay").hide();
        return;
    }

    // Agora, você pode enviar esses dados em uma requisição POST
    fetch('alterar-dados', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ equipamentos: dados }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Resposta do servidor:', data);
        exibirMensagem('sucesso', 'Salvo.')
        $('#modalExecutarSolicitacao').modal('hide');
        $("#loading-overlay").hide();
        location.reload()
    })
    .catch(error => {
        console.error('Erro ao fazer a requisição:', error);
        $("#loading-overlay").hide();
    });
}

 // CAMPO DE ENVIO DA ASSINATURA

$('#modalAssinatura').on('hidden.bs.modal', function () {
    // Limpar o SignaturePad quando o modal é fechado
    signaturePad.clear();
});

document.getElementById('save').addEventListener("click", function(event) {
    event.preventDefault(); // Previne comportamento padrão se necessário
    const saveButton = event.currentTarget; // Usar currentTarget é mais seguro que target
    
    // Verificar se os atributos necessários estão presentes
    const id_solicitacao = saveButton.getAttribute('data-id-solicitacao');
    const codigo_item = saveButton.getAttribute('data-codigo-item');
    const nome_funcionario = saveButton.getAttribute('data-nome-funcionario');
    
    if (!id_solicitacao || !codigo_item || !nome_funcionario) {
        alert("Dados incompletos. Recarregue a página e tente novamente.");
        return;
    }

    console.log(id_solicitacao)
    console.log(codigo_item)
    console.log(nome_funcionario)

    if (signaturePad.isEmpty()) {
        alert("Por favor, faça sua assinatura antes de salvar.");
        return;
    }

    // Se chegou aqui, todos os checks passaram
    const motivo = "Primeira Assinatura";
    const dataURL = signaturePad.toDataURL();
    
    // Restante do código para enviar ao servidor
    $("#loading-overlay").show();
    saveButton.disabled = true;

    fetch('/receber-assinatura', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id_solicitacao: id_solicitacao,
            dataURL: dataURL,
            motivo: motivo,
            codigo_item: codigo_item,
            nome_funcionario: nome_funcionario
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }
        return response.json();
    })
    .then(data => {
        exibirMensagem('sucesso', 'Assinatura salva com sucesso!');
        $('#modalAssinatura').modal('hide');
        window.location.reload();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert("Ocorreu um erro ao salvar a assinatura. Tente novamente.");
    })
    .finally(() => {
        $("#loading-overlay").hide();
        saveButton.disabled = false;
    });
});

document.getElementById('clear').addEventListener('click', function(event) {
    signaturePad.clear();
});

function download(dataURL, filename) {
    if (navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") === -1) {
        window.open(dataURL);
    } else {
        var blob = dataURLToBlob(dataURL);
        var url = window.URL.createObjectURL(blob);

        var a = document.createElement("a");
        a.style = "display: none";
        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
    }
}

function dataURLToBlob(dataURL) {
    var parts = dataURL.split(';base64,');
    var contentType = parts[0].split(":")[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;
    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}

// Assuming you have a button or event triggering the POST request
$('#solicitar_substituicao').on('click', function () {
    // Initialize an array to store the data
    $('#loading-overlay').show();
    const requestData = [];

    let invalidInput = false;

    // Use jQuery to select all elements with IDs starting with "equipamentoTroca"
    $('[id^=equipamentoTroca]').each(function (i) {
        const quantidadeValue = $('#quantidadeTroca' + i).val();

        // Check if quantidadeValue is empty or less than 1
        if (!quantidadeValue || parseInt(quantidadeValue) < 1) {
            // Show an alert and set invalidInput to true
            exibirMensagem('aviso','Campo de quantidade contém valores inválidos')
            invalidInput = true;
            $('#loading-overlay').hide();
            return false; // Exit the loop
        }
        // Create an object to store data for each iteration
        const data = {
            solicitante: $('#solicitanteTroca' + i).val(),
            equipamento: $('#equipamentoTroca' + i).val(),
            quantidade: quantidadeValue,
            funcionario: $('#funcionarioTroca' + i).val(),
            motivo: $('#motivoTroca' + i).val()    
        };

        // Push the data object into the requestData array
        requestData.push(data);
    });

    if (invalidInput) {
        $('#loading-overlay').hide();
        return; // Exit the click event handler
    }

    // Make an AJAX POST request to the Flask route
    $.ajax({
        url: '/solicitacao',
        type: 'POST',
        data: JSON.stringify(requestData),
        contentType: 'application/json',
        success: function () {
            // Add success parameter to the URL when reloading the page
            exibirMensagem('sucess','Nova solicitação enviada com sucesso')
            $("#loading-overlay").hide();
            window.location.reload();
        },
        error: function (error) {
            console.error('Erro na requisição AJAX:', error);
            $("#loading-overlay").hide();
        }
    });
});


