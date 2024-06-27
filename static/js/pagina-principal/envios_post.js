
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

 function signaturePad(id_solicitacao,id) {

    var signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            penColor: 'rgb(0, 0, 0)'
    });

    var saveButton = document.getElementById('save');
    var cancelButton = document.getElementById('clear');

        
    saveButton.addEventListener("click", function(event) {
        let motivo = "Primeira Assinatura";
        $("#loading-overlay").show();
        if (signaturePad.isEmpty()) {
            alert("Faça sua assinatura.");
            $("#loading-overlay").hide();
        } else {
            // Desabilitar o botão para evitar múltiplos cliques
            saveButton.disabled = true;

            // Obter a data de hoje
            var dataURL = signaturePad.toDataURL();

            // Enviar o dataURL e a data para a rota /receber-assinatura usando a API Fetch
            fetch('/receber-assinatura', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_solicitacao: id_solicitacao,
                    dataURL: dataURL,
                    motivo: motivo
                }),
            })
            .then(response => response.json())
            .then(data => {
                // Lidar com a resposta do servidor, se necessário
                exibirMensagem('sucesso', 'Salvo.')
                $('#modalAssinatura').modal('hide');
                console.log(data);
                window.location.reload();
                $("#loading-overlay").hide();
            });
        }
    });

    cancelButton.addEventListener('click', function(event) {
        signaturePad.clear();
    });

    $('#modalAssinatura').on('hidden.bs.modal', function () {
        // Limpar o SignaturePad quando o modal é fechado
        signaturePad.clear();
    });
}

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


