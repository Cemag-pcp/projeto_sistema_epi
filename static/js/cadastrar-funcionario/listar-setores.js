// Função para lidar com a resposta do backend
function handleResponse(response) {
    // Referência ao select no DOM
    const selectSetor = document.getElementById('idSetor');
    
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
