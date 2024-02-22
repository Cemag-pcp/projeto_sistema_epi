// // Enviar solicitação para o backend
// function enviarSolicitacao() {
//     document.getElementById('btnEnviarSolicitacao').disabled = true;

//     // Selecione todos os camposSolicitacao e seus clones
//     var campoSolicitante = document.getElementById('inputSolicitante').value;
//     var camposSolicitacao = document.querySelectorAll('[id^="camposSolicitacao"]');

//     // Crie um array para armazenar os dados
//     var dados = [];

//     // Flag para verificar se algum campo está em branco
//     var campoEmBrancoEncontrado = false;

//     // Flag para verificar se pelo menos um botão de rádio foi marcado
//     var radioMarcado = false;

//     camposSolicitacao.forEach(function(campos) {
//         // Selecione todos os inputs dentro do camposSolicitacao atual
//         var inputs = campos.querySelectorAll('input');
    
//         // Crie um objeto para armazenar os dados do camposSolicitacao atual
//         var dadosCampos = {'solicitante': campoSolicitante};
    
//         // Itere sobre todos os inputs e armazene seus valores no objeto de dados do camposSolicitacao atual
//         inputs.forEach(function(input) {
//             console.log(input.value);
//             // Verifique se o valor não está vazio antes de adicionar ao objeto
//             if (input.value.trim() !== '') {
//                 dadosCampos[input.id] = input.value;
//             } else if (input.type === 'radio') {
//                 // Verifique se o radio está marcado e adicione ao objeto
//                 if (input.checked) {
//                     dadosCampos[input.id] = true;
//                 }
//             } else {
//                 // Se encontrar um campo em branco, ajuste a flag
//                 campoEmBrancoEncontrado = true;
//             }
//         });
    
//         // Adicione o objeto de dados do camposSolicitacao atual ao array de dados
//         dados.push(dadosCampos);
//     });
    

//     // Verifique se pelo menos um botão de rádio foi marcado
//     if (!radioMarcado) {
//         alert("Selecione uma opção de rádio");
//         document.getElementById('btnEnviarSolicitacao').disabled = false;
//         return;
//     }

//     // Se algum campo estiver em branco, pare o loop
//     // if (campoEmBrancoEncontrado) {
//     //     alert("Preencha todos os campos");
//     //     document.getElementById('btnEnviarSolicitacao').disabled = false;
//     //     return;
//     // }

//     // Se algum campo estiver em branco, não prossiga com a chamada AJAX
//     if (campoEmBrancoEncontrado) {
//         return;
//     }

//     // $.ajax({
//     //     url: '/solicitacao',
//     //     type: 'POST',
//     //     data: JSON.stringify(dados),
//     //     contentType: 'application/json',
//     //     success: function () {
//     //         // Adicione o parâmetro de sucesso à URL ao recarregar a página
//     //         window.location.reload();
//     //     },
//     //     error: function (error) {
//     //         console.error('Erro na requisição AJAX:', error);
//     //     }
//     // });
    
// }
// // Fim Enviar solicitação para o backend

// Enviar solicitação para o backend
function enviarSolicitacao() {

    $("#loading-overlay").show();
    
    document.getElementById('btnEnviarSolicitacao').disabled = true;

    // Selecione todos os camposSolicitacao e seus clones
    var campoSolicitante = document.getElementById('inputSolicitante').value;
    var camposSolicitacao = document.querySelectorAll('[id^="camposSolicitacao"]');

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
            console.log(input.value);
            // Verifique se o valor não está vazio antes de adicionar ao objeto
            if (input.value.trim() !== '') {
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

        // Adicione o objeto de dados do camposSolicitacao atual ao array de dados
        dados.push(dadosCampos);

        // Se nenhum botão de rádio foi marcado no grupo, ajuste a flag geral
        if (!radioGrupoMarcado) {
            radioMarcado = false;
        }
    });

    console.log(JSON.stringify(dados));

    // Verifique se pelo menos um botão de rádio foi marcado em algum grupo
    if (!radioMarcado) {
        alert("Selecione uma opção de rádio em cada grupo")
        // exibirMensagem("aviso","Selecione uma opção de rádio em cada grupo")
        $("#loading-overlay").hide();
        document.getElementById('btnEnviarSolicitacao').disabled = false;
        return;
    }

    // Se algum campo estiver em branco, pare o loop
    if (campoEmBrancoEncontrado) {
        alert("Preencha todos os campos")
        // exibirMensagem("aviso","Preencha todos os campos")
        $("#loading-overlay").hide();
        document.getElementById('btnEnviarSolicitacao').disabled = false;
        return;
    }

    // Se nenhum problema for encontrado, prossiga com a chamada AJAX
    $.ajax({
        url: '/solicitacao',
        type: 'POST',
        data: JSON.stringify(dados),
        contentType: 'application/json',
        success: function () {
            // Adicione o parâmetro de sucesso à URL ao recarregar a página
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

