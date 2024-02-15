// Função para excluir o clone pelo botão clicado
function excluirClone(botao) {
    // Obtém o elemento pai mais próximo com ID que contenha "camposSolicitacao"
    
    var divs = document.querySelectorAll('[id^="camposSolicitacao"]');

    if (divs.length > 1) {

        var divPai = botao.closest('[id^="camposSolicitacao"]');

        // Verifica se o div pai existe antes de removê-lo
        if (divPai) {
            // Remove o div pai do DOM
            divPai.remove();
        }

    } else {
        alert("Deixe pelo menos 1 grupo de campos")
    }

}
// Fim Função para excluir o clone pelo botão clicado