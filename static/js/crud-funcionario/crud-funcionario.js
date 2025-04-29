function modalEdicaoFuncionario(matricula,nome,setor,dataAdmissao,ativo){
    $("#matriculaFuncionarioEdit").val(matricula)
    $("#matriculaFuncionarioAnteriorEdit").val(matricula)
    // $('#nomeFuncionarioAnteriorEdit').val(nome)
    $("#nomeFuncionarioEdit").val(nome)
    $("#idSetorEdit").val(setor)
    if (dataAdmissao != 'Invalid Date'){
        var dataFormatada = paraFormatoAmericano(dataAdmissao)
        $("#dataAdmissaoEdit").val(dataFormatada)
    }

    $("#habilitarFuncionarioEdit").val(ativo)
    if (ativo === 'True'){
        $("#habilitarFuncionarioEdit").prop('checked',true)
    }else{
        $("#habilitarFuncionarioEdit").prop('checked',false)
    }
    


    $("#modalEdicaoFuncionario").modal('show')
}


function modalDesativarFuncionario(matricula,nome){

    $("#p_desativar_funcionario").text("Tem certeza que deseja desativar o funcionário " + matricula + " - " + nome + "?")

    $("#matricula_excluir").val(matricula)

    $("#modalDesativarFuncionario").modal('show')
}

// Função para filtrar a tabela
function filtrarTabela() {
    const filtroMatricula = document.getElementById('filtroMatricula').value.toLowerCase();
    const filtroNome = document.getElementById('filtroNome').value.toLowerCase();
    const linhas = document.querySelectorAll('tbody tr');

    linhas.forEach(linha => {
        const matricula = linha.querySelector('td:nth-child(1)').textContent.toLowerCase();
        const nome = linha.querySelector('td:nth-child(2)').textContent.toLowerCase();

        // Condição para mostrar ou esconder a linha
        const mostraLinha = matricula.includes(filtroMatricula) && nome.includes(filtroNome);

        linha.style.display = mostraLinha ? '' : 'none';
    });
}

// Adiciona eventos de digitação nos filtros
document.getElementById('filtroMatricula').addEventListener('input', filtrarTabela);
document.getElementById('filtroNome').addEventListener('input', filtrarTabela);


$("#editarFuncionarioSalvar").on('click',function(){

    $("#loading-overlay").show();

    $("#editarFuncionarioSalvar").prop('disabled',true)

    let matricula = $("#matriculaFuncionarioEdit").val();
    let matriculaAnterior = $("#matriculaFuncionarioAnteriorEdit").val();
    // let nome_anterior = $("nomeFuncionarioAnteriorEdit").val()
    let nome = $("#nomeFuncionarioEdit").val();
    let setor = $("#idSetorEdit").val();
    let dataAdmissao = $("#dataAdmissaoEdit").val();
    console.log(dataAdmissao)
    let acao = "update";

    let habilitarFuncionario = false;

    if ($("#habilitarFuncionarioEdit").prop('checked') == true){
        $("#habilitarFuncionarioEdit").val(true);
        habilitarFuncionario = $("#habilitarFuncionarioEdit").val();
    }else{
        $("#habilitarFuncionarioEdit").val(false);
        habilitarFuncionario = $("#habilitarFuncionarioEdit").val();
    }
    
    console.log(habilitarFuncionario);

    const buttonEdit = document.getElementById('editarFuncionarioSalvar');
    // Validações dos campos
    if (matriculaFuncionario === '' || nomeFuncionario === '' || setor === '' || dataAdmissao === '') {
        alert('Preencha todos os campos');
        buttonEdit.disabled = false;
        $("#loading-overlay").hide();
        return;
    }

    if (isNaN(new Date(dataAdmissao).getTime())){
        alert('Data Inválida!');
        buttonEdit.disabled = false;
        $("#loading-overlay").hide();
        return;
    }


    dados = {
        matricula: matricula,
        nome: nome,
        setor:setor,
        dataAdmissao: formatarDataAdmissao(dataAdmissao),
        acao:acao,
        matriculaAnterior: matriculaAnterior,
        habilitarFuncionario: habilitarFuncionario,
        // nome_anterior: nome_anterior,
    }

    $.ajax({
        type: 'POST',
        url: '/crud-funcionario',
        contentType: 'application/json',  // Define o tipo de conteúdo como JSON
        data: JSON.stringify(dados),
        success: function (response) {
            // Lidar com a resposta do backend, se necessário
            exibirMensagem("sucesso", "Editado com sucesso")

            //undisable button
            $("#editarFuncionarioSalvar").prop('disabled',false)
            $("#modalEdicaoFuncionario").modal("hide")
            $("#loading-overlay").hide();
            location.reload();
        },
        error: function (error) {
            console.error('Erro!', error.responseJSON);
            exibirMensagem("aviso", error.responseJSON.message)
            $("#editarFuncionarioSalvar").prop('disabled',false)
            $("#modalEdicaoFuncionario").modal("hide")
            $("#loading-overlay").hide();
        }
    });

})

$("#desativarFuncionario").on('click',function(){

    $("#loading-overlay").show();

    let matricula = $("#matricula_excluir").val();
    let acao = "delete";

    dados = {
        matricula: matricula,
        acao:acao
    }

    $.ajax({
        type: 'POST',
        url: '/crud-funcionario',
        contentType: 'application/json',  // Define o tipo de conteúdo como JSON
        data: JSON.stringify(dados),
        success: function (response) {
            // Lidar com a resposta do backend, se necessário
            exibirMensagem("sucesso", "Excluido com sucesso")

            //undisable button
            $("#desativarFuncionario").prop('disabled',false)
            $("#modalDesativarFuncionario").modal("hide")
            $("#loading-overlay").hide();
            location.reload();
        },
        error: function (error) {
            console.error('Erro!', error);
            exibirMensagem("aviso", "Erro!")
            $("#desativarFuncionario").prop('disabled',false)
            $("#modalDesativarFuncionario").modal("hide")
            $("#loading-overlay").hide();
        }
    });
})

function paraFormatoAmericano(dataStr) {
    let partes = dataStr.split(/[\/\-]/); // separa por / ou -
    let [dia, mes, ano] = partes;
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

// Função para lidar com a resposta do backend
function handleResponse(response) {
    // Referência ao select no DOM
    const selectSetor = document.getElementById('idSetorEdit');

    // Limpar as opções existentes, exceto a opção vazia
    selectSetor.innerHTML = '<option value=""></option>';

    // Verificar se a resposta contém uma lista de setores
    if (Array.isArray(response)) {
        // Preencher o select com as opções vindas da lista
        response.forEach(function(setorArray) {
            // Verificar se o array interno não está vazio ou não contém valor nulo
            if (setorArray && setorArray[0] !== null) {
                const setorNome = setorArray[0];
                
                // Cria uma nova opção
                const option = document.createElement('option');
                option.value = setorNome; // Define o valor da opção como o nome do setor
                option.textContent = setorNome; // Define o texto visível da opção como o nome do setor

                // Adiciona a nova opção ao select
                selectSetor.appendChild(option);                 
            }
        });
    }
}

// Função para lidar com erros
function handleError(error) {
    // Log do erro no console
    console.error('Erro!', error);
}

// Realiza uma solicitação AJAX para listar setores de funcionários
$.ajax({
    type: 'GET',
    url: '/listar-setores-funcionarios',
    success: handleResponse, // Chama a função handleResponse em caso de sucesso
    error: handleError // Chama a função handleError em caso de erro
});

function formatarDataAdmissao(dataAdmissao){
    
    const currentDate = new Date(dataAdmissao);

    currentDate.setDate(currentDate.getDate() + 1);

    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };

    return currentDate.toLocaleDateString('pt-BR', options)
}
