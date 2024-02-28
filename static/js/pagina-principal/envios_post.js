
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

        // Adiciona os dados ao array
        dados.push({id_solicitacao,idExecucao, equipamento, quantidade, motivo });
    });

    if (dados.some(obj => Object.values(obj).some(value => !value.trim()))) {
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
        $("#loading-overlay").show();
        if (signaturePad.isEmpty()) {
            alert("Faça sua assinatura.");
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
                    dataURL: dataURL
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