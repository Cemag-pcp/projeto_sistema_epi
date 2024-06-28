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

    $("#modalExcluirEquipamento").modal('show')
}