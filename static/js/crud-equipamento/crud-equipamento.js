function modalEdicao(codigo,descricao,vida_util,ca){

    $("#codigoEdicao").val(codigo)
    $("#nomeEdicao").val(descricao)
    $("#vida_util_edicao").val(vida_util)
    ca = (ca == 'None') ? "": ca
    $("#ca_edicao").val(ca)

    $("#modalEdicaoEquipamento").modal('show')
}

function modalCadastro(){

    $("#codigoCadastro").val("")
    $("#nomeCadastro").val("")
    $("#vida_util_cadastro").val("")
    $("#ca_cadastro").val("")

    $("#modalCadastroEquipamento").modal('show')
}

function modalExcluirEquipamento(codigo,descricao){

    $("#p_excluir_equipamento").text("Tem certeza que deseja excluir o equipamento " + codigo + " - " + descricao + "?")

    $("#codigo_excluir").val(codigo)

    $("#modalExcluirEquipamento").modal('show')
}

$("#cadastrarEquipamento").on('click',function(){

    $("#loading-overlay").show();

    $("#cadastrarEquipamento").prop('disabled',true)

    let codigo = $("#codigoCadastro").val();
    let nome = $("#nomeCadastro").val();
    let vida_util = $("#vida_util_cadastro").val();
    let ca = $("#ca_cadastro").val();
    let acao = "create";

    if(codigo === "" || nome === ""){
        exibirMensagem("aviso","Preencha pelo menos o código e o nome do equipamento")
        $("#cadastrarEquipamento").prop('disabled',false)
        $("#loading-overlay").hide();
        return 
    }

    if(vida_util === ""){
        vida_util = 365
    } 

    dados = {
        codigo: codigo,
        nome: nome,
        vida_util:vida_util,
        ca:ca,
        acao:acao
    }

    $.ajax({
        type: 'POST',
        url: '/crud-equipamento',
        contentType: 'application/json',  // Define o tipo de conteúdo como JSON
        data: JSON.stringify(dados),
        success: function (response) {
            // Lidar com a resposta do backend, se necessário
            exibirMensagem("sucesso", "Cadastrado com sucesso")

            //undisable button
            $("#cadastrarEquipamento").prop('disabled',false)
            $("#modalCadastroEquipamento").modal("hide")
            $("#loading-overlay").hide();
            location.reload();
        },
        error: function (error) {
            console.error('Erro!', error);
            $("#cadastrarEquipamento").prop('disabled',false)
            $("#modalCadastroEquipamento").modal("hide")
            $("#loading-overlay").hide();
        }
    });

})

$("#editarEquipamento").on('click',function(){

    $("#loading-overlay").show();

    $("#editarEquipamento").prop('disabled',true)

    let codigo = $("#codigoEdicao").val();
    let nome = $("#nomeEdicao").val();
    let vida_util = $("#vida_util_edicao").val();
    let ca = $("#ca_edicao").val();
    let acao = "update";

    if(vida_util === ""){
        vida_util = 365
    }

    dados = {
        codigo: codigo,
        nome: nome,
        vida_util:vida_util,
        ca:ca,
        acao:acao
    }

    $.ajax({
        type: 'POST',
        url: '/crud-equipamento',
        contentType: 'application/json',  // Define o tipo de conteúdo como JSON
        data: JSON.stringify(dados),
        success: function (response) {
            // Lidar com a resposta do backend, se necessário
            exibirMensagem("sucesso", "Editado com sucesso")

            //undisable button
            $("#editarEquipamento").prop('disabled',false)
            $("#modalEdicaoEquipamento").modal("hide")
            $("#loading-overlay").hide();
            location.reload();
        },
        error: function (error) {
            console.error('Erro!', error);
            exibirMensagem("aviso", "Erro!")
            $("#editarEquipamento").prop('disabled',false)
            $("#modalEdicaoEquipamento").modal("hide")
            $("#loading-overlay").hide();
        }
    });

})

$("#excluirEquipamento").on('click',function(){

    $("#loading-overlay").show();

    let codigo = $("#codigo_excluir").val();
    let acao = "delete";

    dados = {
        codigo: codigo,
        acao:acao
    }

    $.ajax({
        type: 'POST',
        url: '/crud-equipamento',
        contentType: 'application/json',  // Define o tipo de conteúdo como JSON
        data: JSON.stringify(dados),
        success: function (response) {
            // Lidar com a resposta do backend, se necessário
            exibirMensagem("sucesso", "Excluido com sucesso")

            //undisable button
            $("#editarEquipamento").prop('disabled',false)
            $("#modalExcluirEquipamento").modal("hide")
            $("#loading-overlay").hide();
            location.reload();
        },
        error: function (error) {
            console.error('Erro!', error);
            exibirMensagem("aviso", "Erro!")
            $("#editarEquipamento").prop('disabled',false)
            $("#modalExcluirEquipamento").modal("hide")
            $("#loading-overlay").hide();
        }
    });
})