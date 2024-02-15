function apagarConteudo(button) {
    // Obtém o elemento de input irmão do botão clicado
    var inputElement = button.parentNode.previousElementSibling;

    // Define o valor do input como vazio
    inputElement.value = '';
}